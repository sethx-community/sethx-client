import { Injectable, computed, inject, signal } from '@angular/core';
import { ethers } from 'ethers';
import { SpotOrder } from '../../onchain/contracts/token-spot-orderbook-read.service';
import { norm } from '../../../core/tokens/token-normalize';
import type {
  ConfirmationField,
  RequirementRow,
} from '../../../core/modals/confirmation/confirmation-modal.component';
import { TradeSettingsService } from '../trade-settings.service';
import { OrderBookStore } from './orderbook.store';
import { TokenService } from '../token.service';
import { AccountContractService } from '../../onchain/contracts/account-contract.service';
import { ContractRegistryService } from '../../../contracts/contract-registry.service';

import { CURRENT_NETWORK } from '../../../constants/network.config';
import { TriggerService } from '../trigger.service';
import { ETH_ADDRESS } from '../main.tokens';
import { FeeService } from '../fee.service';
import { PortfolioService } from '../../onchain/portfolio.service';
import { FeeOutput } from '../../onchain/contracts/fee-manager-contract.service';
import { ERC20_SPOT_FEE_CONTEXT } from '../../onchain/token-spot-order.constants';
import { TransactionReceiptService } from '../../../shared/transaction-receipt';

const ZERO = ethers.ZeroAddress;
const ONE_E18 = 10n ** 18n;
const FEE_CONTEXT = ERC20_SPOT_FEE_CONTEXT;

function shortAddr(a: string): string {
  const s = a ?? '';
  return s.length > 10 ? `${s.slice(0, 6)}…${s.slice(-4)}` : s;
}

type Status = 'idle' | 'pending' | 'success' | 'error';

@Injectable({ providedIn: 'root' })
export class OrderBookActionsService {
  private readonly settings = inject(TradeSettingsService);
  private readonly ob = inject(OrderBookStore);
  private readonly tokens = inject(TokenService);
  private readonly accountContract = inject(AccountContractService);
  private readonly trigger = inject(TriggerService);
  private readonly txReceipt = inject(TransactionReceiptService);
  private readonly feeSvc = inject(FeeService);
  private readonly portfolio = inject(PortfolioService);
  private readonly contracts = inject(ContractRegistryService);
  private readonly spotOrderBookAddress =
    this.contracts.getContractAddress('TokenSpotOrderBook');

  // preferred accepted fee token (address or 0x0), lowercased
  readonly preferredFeeToken = computed(() => {
    const pref = norm(this.settings.preferredFeeToken?.() ?? '');
    if (!pref || pref === norm(ETH_ADDRESS) || pref === 'eth') return ZERO;
    return ethers.getAddress(pref);
  });

  private tokenSymbol(addr: string): string {
    const key = norm(addr);
    if (!key || key === norm(ethers.ZeroAddress)) return 'ETH';
    const info = this.tokens.getToken(key)();
    return info?.symbol ?? key.slice(0, 6);
  }

  // -------------------- confirmation modal state --------------------
  readonly confirmOpen = signal(false);
  readonly confirmTitle = signal('Confirm Action');
  readonly confirmLabel = signal('Confirm');
  readonly confirmFields = signal<ConfirmationField[]>([]);
  readonly confirmRequirements = signal<RequirementRow[] | null>(null);
  readonly confirmDisabled = signal(false);
  readonly confirmError = signal<string | null>(null);
  readonly receipt = this.txReceipt.receipt;
  readonly explorerTxUrl = this.txReceipt.explorerTxUrl;

  // canonical status (idle/pending/success/error)
  private readonly _pending = signal(false);
  private readonly _success = signal(false);

  readonly status = computed<Status>(() => {
    if (this._pending()) return 'pending';
    if (this.confirmError()) return 'error';
    if (this._success()) return 'success';
    return 'idle';
  });

  private pendingConfirmAction: null | (() => Promise<string | null | void>) = null;

  private begin(): boolean {
    if (this._pending()) return false;
    this._pending.set(true);
    this._success.set(false);
    this.confirmError.set(null);
    this.txReceipt.pending(this.confirmTitle(), 'Waiting for wallet signature and on-chain confirmation...');
    return true;
  }

  private endSuccess(txHash?: string | null) {
    this._success.set(true);
    this._pending.set(false);
    this.confirmDisabled.set(true);
    this.pendingConfirmAction = null;
    this.txReceipt.success('Transaction confirmed', txHash ?? null);
  }

  private endError(e: any, fallback: string) {
    this.confirmError.set(e?.reason ?? e?.shortMessage ?? e?.message ?? fallback);
    this.txReceipt.error('Transaction failed', e, fallback);
    this._pending.set(false);
  }

  openConfirmModal(opts: {
    title: string;
    confirmLabel: string;
    fields: ConfirmationField[];
    requirements?: RequirementRow[] | null;
    confirmDisabled?: boolean;
  }) {
    this.confirmTitle.set(opts.title);
    this.confirmLabel.set(opts.confirmLabel);
    this.confirmFields.set(opts.fields ?? []);
    this.confirmRequirements.set(opts.requirements ?? null);
    this.confirmDisabled.set(!!opts.confirmDisabled);

    this.confirmError.set(null);
    this.txReceipt.clear();
    this._pending.set(false);
    this._success.set(false);

    this.confirmOpen.set(true);
  }

  closeConfirmModal() {
    this.confirmOpen.set(false);
    this.confirmError.set(null);
    this.txReceipt.clear();
    this._pending.set(false);
    this._success.set(false);
    this.pendingConfirmAction = null;
  }

  async onConfirmModalConfirm() {
    if (this.confirmDisabled()) return;
    if (!this.pendingConfirmAction) return;
    if (!this.begin()) return;

    try {
      // Guard is fine. We still don’t pass account through; writes resolve internally.
      const account = this.settings.selectedAccountId();
      if (!account) throw new Error('No account selected');

      const txHash = await this.pendingConfirmAction();

      this.trigger.emitDomainEvent({ type: 'orderPlaced' });
      this.endSuccess(typeof txHash === 'string' ? txHash : null);
    } catch (e: any) {
      this.endError(e, 'Transaction failed');
    }
  }

  // -------------------- actions --------------------

  // ✅ NEW: place order (used by SpotOrderDraftService)
  async placeOrderTokenSpot(args: {
    feeToken: string; // address(0) or erc20
    baseToken: string; // address(0) or erc20
    quoteToken: string; // address(0) or erc20
    side: 0 | 1;
    price: bigint;
    amount: bigint;
    expiry: bigint;
  }): Promise<string | null | void> {
    if (!this.begin()) return;

    try {
      // optional guard; AccountContractService will throw anyway
      const acct =
        this.settings.selectedAccountId?.() ??
        this.settings.selectedAccountId?.();
      if (!acct) throw new Error('No account selected');

      const txHash = await this.accountContract.placeOrderTokenSpot({
        orderBook: this.spotOrderBookAddress,
        ...args,
      });

      // central invalidation
      this.trigger.emitDomainEvent({ type: 'orderPlaced' });

      this.endSuccess(typeof txHash === 'string' ? txHash : null);
      return txHash;
    } catch (e: any) {
      this.endError(e, 'Order placement failed');
      throw e; // let draft keep modal open + show error
    }
  }

  requestCancel(o: SpotOrder) {
    const fields: ConfirmationField[] = [
      { label: 'Action', value: 'Cancel order' },
      { label: 'Order ID', value: o.orderId.toString() },
      { label: 'Side', value: o.side === 0 ? 'Bid (buy)' : 'Ask (sell)' },
      { label: 'Maker', value: norm(o.user) },
      {
        label: 'Book',
        value: `${this.tokenSymbol(o.baseToken)}/${this.tokenSymbol(o.quoteToken)}`,
      },
    ];

    this.openConfirmModal({
      title: 'Cancel order',
      confirmLabel: 'Cancel',
      fields,
      requirements: null,
    });

    this.pendingConfirmAction = async () => {
      return await this.accountContract.cancelSpotTokenOrder({
        orderBook: this.spotOrderBookAddress,
        orderId: o.orderId,
      });
    };
  }

  async requestFill(o: SpotOrder) {
    const feeToken = this.preferredFeeToken(); // ZERO or checksummed ERC20
    const amountHuman = this.ob.fillAmountByOrderId(o.orderId);

    // base/quote keys (handle address(0) -> ETH_ADDRESS)
    const baseKey = this.contractAddrToKey(o.baseToken);
    const quoteKey = this.contractAddrToKey(o.quoteToken);

    const baseInfo = this.tokens.getToken(baseKey)();
    const quoteInfo = this.tokens.getToken(quoteKey)();

    const baseDec = baseInfo?.decimals ?? 18;
    const quoteDec = quoteInfo?.decimals ?? 18;

    const baseSym =
      baseInfo?.symbol ??
      (baseKey === norm(ETH_ADDRESS) ? 'ETH' : shortAddr(baseKey));
    const quoteSym =
      quoteInfo?.symbol ??
      (quoteKey === norm(ETH_ADDRESS) ? 'ETH' : shortAddr(quoteKey));

    const confirmDisabled = !amountHuman || !amountHuman.trim();

    const fields: ConfirmationField[] = [
      { label: 'Action', value: 'Fill order' },
      { label: 'Order ID', value: o.orderId.toString() },
      { label: 'Side', value: o.side === 0 ? 'Bid (buy)' : 'Ask (sell)' },
      { label: 'Maker', value: norm(o.user) },
      { label: 'Pair', value: `${baseSym}/${quoteSym}` },
      { label: 'Amount (base)', value: amountHuman || '—' },
      {
        label: 'Fee token',
        value: feeToken === ZERO ? 'ETH' : this.tokenSymbol(feeToken),
      },
    ];

    // If no amount, open modal but disabled
    if (confirmDisabled) {
      this.openConfirmModal({
        title: 'Fill order',
        confirmLabel: 'Fill',
        fields,
        requirements: null,
        confirmDisabled: true,
      });
      this.pendingConfirmAction = null;
      return;
    }

    // parse base amount raw
    let amountBaseRaw: bigint;
    try {
      amountBaseRaw = ethers.parseUnits(amountHuman.replace(',', '.'), baseDec);
    } catch {
      this.openConfirmModal({
        title: 'Fill order',
        confirmLabel: 'Fill',
        fields,
        requirements: null,
        confirmDisabled: true,
      });
      this.confirmError.set(`Invalid amount for ${baseSym}.`);
      this.pendingConfirmAction = null;
      return;
    }

    // clamp to remaining
    if (amountBaseRaw > o.amount) amountBaseRaw = o.amount;

    // offered token/value for acceptor (what they must lock)
    const makerIsBid = o.side === 0; // maker is BUY
    const offeredKey = makerIsBid ? baseKey : quoteKey;

    // if maker is Ask, acceptor pays quote notional (round up)
    const offeredRaw = makerIsBid
      ? amountBaseRaw
      : (amountBaseRaw * o.price) / ONE_E18;

    // fee quote params (assetToken is ZERO for ETH)
    this.feeSvc.setQuoteParams({
      assetToken: this.keyToContractAddress(offeredKey).toLowerCase(),
      assetValue: offeredRaw,
      context: FEE_CONTEXT,
    });

    // Open modal immediately with disabled state while quoting
    this.openConfirmModal({
      title: 'Fill order',
      confirmLabel: 'Fill',
      fields,
      requirements: null,
      confirmDisabled: true,
    });

    try {
      await this.waitForFeeQuote();

      const fee = this.feeSvc.feeQuote();
      if (!fee) throw new Error('Fee quote unavailable');

      const req = this.buildRequirementsFromFee(offeredKey, offeredRaw, fee);
      const insufficient = req.some((r) => !r.ok);

      this.confirmRequirements.set(req);
      this.confirmDisabled.set(insufficient);

      if (insufficient) {
        this.confirmError.set(
          'Action required: deposit missing token(s) to cover lock + fees.',
        );
        this.pendingConfirmAction = null;
        return;
      }

      this.confirmError.set(null);

      // tx action
      this.pendingConfirmAction = async () => {
        const txHash = await this.accountContract.acceptSpotTokenOrder({
          orderBook: this.spotOrderBookAddress,
          makerOrderId: o.orderId,
          amount: amountBaseRaw,
          feeToken, // ZERO or checksummed
        });
        this.trigger.emitDomainEvent({ type: 'orderAccepted' });
        return txHash;
      };
    } catch (e: any) {
      this.confirmError.set(
        String(e?.reason ?? e?.message ?? 'Fee quote failed'),
      );
      this.confirmDisabled.set(true);
      this.pendingConfirmAction = null;
    }
  }

  // ================== helpers =================

  private contractAddrToKey(addr: string): string {
    const a = norm(addr);
    return a === ZERO.toLowerCase() ? norm(ETH_ADDRESS) : a;
  }

  private keyToContractAddress(key: string): string {
    const k = norm(key);
    return k === norm(ETH_ADDRESS) ? ZERO : k;
  }

  private mulDivUp(a: bigint, b: bigint, d: bigint): bigint {
    return (a * b + (d - 1n)) / d;
  }

  private getAvailableRaw(tokenKey: string): bigint {
    const key = norm(tokenKey);
    const b = this.portfolio.accountBalances()?.[key];
    if (!b) return 0n;
    return b.balance - b.locked;
  }

  private buildRequirementsFromFee(
    offeredKey: string,
    offeredRaw: bigint,
    fee: FeeOutput,
  ): RequirementRow[] {
    type Comp = {
      label: 'Trade value lock' | 'Fixed fee lock' | 'Percentage fee lock';
      raw: bigint;
    };

    const byKey = new Map<string, { comps: Comp[]; total: bigint }>();

    const add = (key: string, label: Comp['label'], raw: bigint) => {
      if (raw <= 0n) return;
      const k = norm(key);
      const ex = byKey.get(k);
      if (!ex) byKey.set(k, { comps: [{ label, raw }], total: raw });
      else {
        ex.comps.push({ label, raw });
        ex.total += raw;
      }
    };

    add(offeredKey, 'Trade value lock', offeredRaw);

    if (fee.fixedAmount > 0n) {
      const fixedKey =
        norm(fee.fixedToken) === ZERO.toLowerCase()
          ? norm(ETH_ADDRESS)
          : norm(fee.fixedToken);
      add(fixedKey, 'Fixed fee lock', fee.fixedAmount);
    }

    if (fee.percentageAmount > 0n) {
      const pctKey =
        norm(fee.percentageToken) === ZERO.toLowerCase()
          ? norm(ETH_ADDRESS)
          : norm(fee.percentageToken);
      add(pctKey, 'Percentage fee lock', fee.percentageAmount);
    }

    return Array.from(byKey.entries()).map(([key, v]) => {
      const info = this.tokens.getToken(key)();
      const decimals = info?.decimals ?? 18;
      const symbol =
        info?.symbol ??
        (key === norm(ETH_ADDRESS)
          ? 'ETH'
          : `${key.slice(0, 6)}…${key.slice(-4)}`);

      const availableRaw = this.getAvailableRaw(key);
      const ok = availableRaw >= v.total;

      const fmt = (raw: bigint) =>
        `${ethers.formatUnits(raw, decimals)} ${symbol}`;

      return {
        tokenSymbol: symbol,
        tokenAddress: key === norm(ETH_ADDRESS) ? 'address(0)' : key,
        available: fmt(availableRaw),
        ok,
        totalRequired: fmt(v.total),
        components: v.comps.map((c) => ({
          label: c.label,
          amount: fmt(c.raw),
          raw: c.raw.toString(),
        })),
        requiredRaw: v.total.toString(),
        availableRaw: availableRaw.toString(),
        decimals,
      };
    });
  }

  private waitForFeeQuote(): Promise<void> {
    return new Promise((resolve, reject) => {
      const check = () => {
        const st = this.feeSvc.feeQuoteStatus();
        if (st === 'error') return reject(this.feeSvc.feeQuoteError());
        if (st !== 'loading' && st !== 'reloading') return resolve();
        setTimeout(check, 0);
      };
      check();
    });
  }
}
