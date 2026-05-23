import { Injectable, computed, inject, signal } from '@angular/core';
import { ethers } from 'ethers';
import type {
  ConfirmationField,
  RequirementRow,
} from '../../../core/modals/confirmation/confirmation-modal.component';

import { CURRENT_NETWORK } from '../../../constants/network.config';
import { TradeSettingsService } from '../trade-settings.service';
import { TriggerService } from '../trigger.service';
import { AccountContractService } from '../../onchain/contracts/account-contract.service';
import { OptionsOrderBookStore } from './options-orderbook.store';
import { OptionsOrderBookFormatService } from './options-orderbook-format.service';
import { OptionOrder } from '../../onchain/contracts/options-orderbook-read.service';
import { ETH_ADDRESS } from '../main.tokens';
import { norm } from '../../../core/tokens/token-normalize';
import { TokenService } from '../token.service';
import { OptionContractReadService } from '../../onchain/contracts/option-contract-read.service';
import { OptionContractWriteService } from '../../onchain/contracts/option-contract-write.service';
import { OptionsOrderBookReadService } from '../../onchain/contracts/options-orderbook-read.service';
import { ContractRegistryService } from '../../../contracts/contract-registry.service';

import { FeeService } from '../fee.service';
import { PortfolioService } from '../../onchain/portfolio.service';
import { FeeOutput } from '../../onchain/contracts/fee-manager-contract.service';
import { TransactionReceiptService } from '../../../shared/transaction-receipt';

type Status = 'idle' | 'pending' | 'success' | 'error';

const ZERO = ethers.ZeroAddress;
const ONE_E18 = 10n ** 18n;
const FEE_CONTEXT = 'Options Trade';

@Injectable({ providedIn: 'root' })
export class OptionsOrderBookActionsService {
  private readonly settings = inject(TradeSettingsService);
  private readonly ob = inject(OptionsOrderBookStore);
  private readonly fmt = inject(OptionsOrderBookFormatService);
  private readonly tokens = inject(TokenService);
  private readonly optionRead = inject(OptionContractReadService);
  private readonly optionWrite = inject(OptionContractWriteService);
  private readonly optionsOrderbookRead = inject(OptionsOrderBookReadService);
  private readonly accountContract = inject(AccountContractService);
  private readonly trigger = inject(TriggerService);
  private readonly txReceipt = inject(TransactionReceiptService);
  private readonly feeSvc = inject(FeeService);
  private readonly portfolio = inject(PortfolioService);
  private readonly contracts = inject(ContractRegistryService);
  private readonly optionsOrderBookAddress =
    this.contracts.getContractAddress('OptionsOrderBook');

  // preferred accepted fee token (address or 0x0), lowercased
  readonly preferredFeeToken = computed(() => {
    const pref = norm(this.settings.preferredFeeToken?.() ?? '');
    if (!pref || pref === norm(ETH_ADDRESS) || pref === 'eth') return ZERO;
    return ethers.getAddress(pref);
  });

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
      const account = this.settings.selectedAccountId();
      if (!account) throw new Error('No account selected');

      const txHash = await this.pendingConfirmAction();
      this.trigger.emitDomainEvent({ type: 'optionOrderPlaced' });
      this.endSuccess(typeof txHash === 'string' ? txHash : null);
    } catch (e: any) {
      this.endError(e, 'Transaction failed');
    }
  }

  // -------------------- helpers --------------------

  private contractAddrToKey(addr: string): string {
    const a = norm(addr);
    if (!a) return '';
    if (a === norm(ethers.ZeroAddress) || a === norm(ETH_ADDRESS))
      return norm(ETH_ADDRESS);
    return a;
  }

  // -------------------- actions --------------------

  requestFill(o: OptionOrder, marketKey: string) {
    // ---- parse amount ----
    const assetKey = this.contractAddrToKey(o.assetToken);
    const quoteKey = this.contractAddrToKey(o.quoteToken);

    const assetInfo = this.tokens.getToken(assetKey)();
    const quoteInfo = this.tokens.getToken(quoteKey)();

    const assetDec = assetInfo?.decimals ?? 18;
    const quoteDec = quoteInfo?.decimals ?? 18;

    const assetSym =
      assetInfo?.symbol ??
      (assetKey === norm(ETH_ADDRESS) ? 'ETH' : assetKey.slice(0, 6));
    const quoteSym =
      quoteInfo?.symbol ??
      (quoteKey === norm(ETH_ADDRESS) ? 'ETH' : quoteKey.slice(0, 6));

    const amountHuman = this.ob.fillAmountByOrderId(o.orderId);
    let amount = ethers.parseUnits(
      String(amountHuman ?? '0').replace(',', '.'),
      assetDec,
    );
    if (amount <= 0n) throw new Error('Enter a fill size');

    // clamp to remaining size
    const remaining =
      (o.size ?? 0n) > (o.filled ?? 0n) ? o.size - o.filled : 0n;
    if (amount > remaining) amount = remaining;

    // ---- market label (pretty) ----
    const row = this.ob
      .activeMarkets()
      .find((m) => m.marketKey === norm(marketKey));
    const info = row?.market ?? row?.derived;

    const strikeLabel = info
      ? this.fmt.formatPriceFixed(
          info.strikePrice,
          info.assetToken,
          info.quoteToken,
        )
      : this.fmt.formatPriceFixed(o.strikePrice, o.assetToken, o.quoteToken);

    const expirySec =
      row?.market?.expiry ?? row?.derived?.optionExpiry ?? o.optionExpiry ?? 0n;

    const expiryLabel = expirySec
      ? new Date(Number(expirySec) * 1000).toISOString().slice(0, 10)
      : '—';

    const marketLabel = this.formatMarketLabel(marketKey, o);

    // ---- premium total (quote raw) ----
    const premiumRaw = this.mulDivUp(amount, o.askPrice ?? 0n, ONE_E18);
    const premiumHuman = `${ethers.formatUnits(premiumRaw, quoteDec)} ${quoteSym}`;

    const isLongSideMaker = this.isLongSideIntent(o.intent);
    const premiumPayerIsTaker = !isLongSideMaker; // matches your existing feeToken logic

    // If maker is short-side, taker is premium payer -> pass preferredFeeToken
    const feeToken = premiumPayerIsTaker ? this.preferredFeeToken() : ZERO;

    const feeTokenLabel = feeToken === ZERO ? 'ETH (address(0))' : feeToken;

    // ---- base fields ----
    const fields: ConfirmationField[] = [
      { label: 'Action', value: 'Accept option order' },
      { label: 'Order ID', value: o.orderId.toString() },
      { label: 'Market', value: marketLabel },
      {
        label: 'Fill size',
        value: `${ethers.formatUnits(amount, assetDec)} ${assetSym}`,
      },
      {
        label: 'Limit price (premium)',
        value: this.fmt.formatPriceFixed(
          o.askPrice,
          o.assetToken,
          o.quoteToken,
        ),
      },
      {
        label: premiumPayerIsTaker ? 'You pay premium' : 'You receive premium',
        value: premiumHuman,
      },
      { label: 'Fee token', value: feeTokenLabel },
    ];

    // ---- position/holding info ----
    const acct = this.settings.selectedAccountId?.() ?? '';

    const openAndEnrich = async () => {
      let confirmDisabled = false;

      // open modal immediately (disabled while quoting, if we need quote)
      this.openConfirmModal({
        title: 'Accept option order',
        confirmLabel: 'Confirm & Sign',
        fields,
        requirements: null,
        confirmDisabled: premiumPayerIsTaker, // premium payer needs fee quote/requirements
      });

      // Try to add holdings (non-fatal)
      try {
        if (acct) {
          const pos = await this.optionRead.getUserPosition(marketKey, acct);
          const holderAvail =
            pos.holderSize > pos.holderExercised
              ? pos.holderSize - pos.holderExercised
              : 0n;

          fields.push({
            label: 'Your writer contracts',
            value: `${ethers.formatUnits(pos.writerSize, assetDec)} ${assetSym}`,
          });
          fields.push({
            label: 'Your holder contracts (avail)',
            value: `${ethers.formatUnits(holderAvail, assetDec)} ${assetSym}`,
          });

          // Required vs holding (intent-specific)
          fields.push({
            label: 'Required size',
            value: `${ethers.formatUnits(amount, assetDec)} ${assetSym}`,
          });

          // Maker is SellWriter => taker must sell writer contracts
          if (o.intent === 3) {
            const ok = pos.writerSize >= amount;
            confirmDisabled = !ok;
            fields.push({
              label: 'Writer required / available',
              value: `${ethers.formatUnits(amount, assetDec)} / ${ethers.formatUnits(pos.writerSize, assetDec)} ${assetSym}`,
            });
            fields.push({
              label: 'Can sell writer?',
              value: ok ? 'YES' : 'NO (insufficient writer contracts)',
            });
          }

          // Maker is BuyOption => taker may transfer holders if available
          if (o.intent === 0) {
            const ok = holderAvail >= amount;
            fields.push({
              label: 'Holder required / available',
              value: `${ethers.formatUnits(amount, assetDec)} / ${ethers.formatUnits(holderAvail, assetDec)} ${assetSym}`,
            });
            fields.push({
              label: 'Will transfer holder contracts?',
              value: ok ? 'YES' : 'NO (will write new if you accept)',
            });
          }
        }
      } catch {
        // ignore (still allow accept)
      }

      // If taker pays premium, quote fee + build requirements (like spot)
      if (premiumPayerIsTaker) {
        try {
          // request fee quote for offered premium token/value
          this.feeSvc.setQuoteParams({
            assetToken: this.keyToContractAddress(quoteKey).toLowerCase(),
            assetValue: premiumRaw,
            context: FEE_CONTEXT,
          });

          await this.waitForFeeQuote();

          const fee = this.feeSvc.feeQuote();
          if (!fee) throw new Error('Fee quote unavailable');

          const req = this.buildRequirementsFromFee(quoteKey, premiumRaw, fee);
          const insufficient = req.some((r) => !r.ok);

          this.confirmRequirements.set(req);
          this.confirmDisabled.set(insufficient || confirmDisabled);

          if (insufficient) {
            this.confirmError.set(
              'Action required: deposit missing token(s) to cover premium + fees.',
            );
            this.pendingConfirmAction = null;
            return;
          }

          this.confirmError.set(null);
        } catch (e: any) {
          this.confirmError.set(
            String(e?.reason ?? e?.message ?? 'Fee quote failed'),
          );
          this.confirmDisabled.set(true);
          this.pendingConfirmAction = null;
          return;
        }
      } else {
        // no fee quote required in this branch; only position-based disabling
        this.confirmDisabled.set(confirmDisabled);
      }

      // tx action
      this.pendingConfirmAction = async () => {
        return await this.accountContract.acceptOptionOrder({
          orderBook: this.optionsOrderBookAddress,
          makerOrderId: Number(o.orderId),
          amount,
          feeToken,
        });
      };
    };

    void openAndEnrich();
  }

  async placeOrder(args: {
    optionType: number;
    assetToken: string;
    quoteToken: string;
    strikePrice: bigint;
    optionExpiry: bigint;
    orderExpiry: bigint;
    feeToken: string;
    intent: number;
    size: bigint;
    askPrice: bigint;
  }) {
    if (!this.begin()) return;
    try {
      const acct =
        this.settings.selectedAccountId?.() ??
        this.settings.selectedAccountId?.();
      if (!acct) throw new Error('No account selected');

      const txHash = await this.accountContract.placeOrderOption({
        orderBook: this.optionsOrderBookAddress,
        ...args,
      });

      this.trigger.emitDomainEvent({ type: 'optionOrderPlaced' });
      this.endSuccess(typeof txHash === 'string' ? txHash : null);
      return txHash;
    } catch (e: any) {
      this.endError(e, 'Order placement failed');
      throw e;
    }
  }

  // Convenience helpers (used by the order modal's Accept/Cancel by id flow).
  async acceptById(args: {
    makerOrderId: bigint;
    amount: bigint;
    feeToken: string;
  }) {
    if (!this.begin()) return;
    try {
      const acct =
        this.settings.selectedAccountId?.() ??
        this.settings.selectedAccountId?.();
      if (!acct) throw new Error('No account selected');

      const txHash = await this.accountContract.acceptOptionOrder({
        orderBook: this.optionsOrderBookAddress,
        makerOrderId: Number(args.makerOrderId),
        amount: args.amount,
        feeToken: args.feeToken,
      });

      this.trigger.emitDomainEvent({ type: 'optionOrderPlaced' });
      this.endSuccess(typeof txHash === 'string' ? txHash : null);
      return txHash;
    } catch (e: any) {
      this.endError(e, 'Accept failed');
      throw e;
    }
  }

  async cancelById(orderId: bigint) {
    if (!this.begin()) return;
    try {
      const acct =
        this.settings.selectedAccountId?.() ??
        this.settings.selectedAccountId?.();
      if (!acct) throw new Error('No account selected');

      const txHash = await this.accountContract.cancelOptionOrder({
        orderBook: this.optionsOrderBookAddress,
        orderId: Number(orderId),
      });

      this.trigger.emitDomainEvent({ type: 'optionOrderPlaced' });
      this.endSuccess(typeof txHash === 'string' ? txHash : null);
      return txHash;
    } catch (e: any) {
      this.endError(e, 'Cancel failed');
      throw e;
    }
  }
  requestCancel(order: OptionOrder, marketKey: string) {
    void this.openCancelConfirm(order, marketKey);
  }

  async requestCancelById(orderId: bigint, marketKey: string) {
    const o = await this.optionsOrderbookRead.getOrder(orderId);
    if (!o) throw new Error('Order not found');
    await this.openCancelConfirm(o, marketKey);
  }

  private formatIntent(intent: number): string {
    switch (intent) {
      case 0:
        return 'Buy Option';
      case 1:
        return 'Sell Option';
      case 2:
        return 'Buy Writer';
      case 3:
        return 'Sell Writer';
      default:
        return `Unknown (${intent})`;
    }
  }

  private async openCancelConfirm(order: OptionOrder, marketKey: string) {
    const mk = String(marketKey ?? '').toLowerCase();

    const remaining =
      (order.size ?? 0n) > (order.filled ?? 0n)
        ? order.size - order.filled
        : 0n;

    const assetKey = this.contractAddrToKey(order.assetToken);
    const assetInfo = this.tokens.getToken(assetKey)();
    const assetDec = assetInfo?.decimals ?? 18;

    const marketLabel = this.formatMarketLabel(mk, order); // keep your helper

    const fields: ConfirmationField[] = [
      { label: 'Action', value: 'Cancel order' },
      { label: 'Order ID', value: order.orderId.toString() },
      { label: 'Market', value: marketLabel },
      { label: 'Intent', value: this.formatIntent(Number(order.intent ?? 0)) },
      {
        label: 'Remaining size',
        value: `${ethers.formatUnits(remaining, assetDec)} ${this.fmt.tokenLabel(order.assetToken)}`,
      },
      {
        label: 'Limit price',
        value: this.fmt.formatPriceFixed(
          order.askPrice ?? 0n,
          order.assetToken,
          order.quoteToken,
        ),
      },
    ];

    this.openConfirmModal({
      title: 'Cancel order',
      confirmLabel: 'Confirm & Sign',
      fields,
      requirements: null,
      confirmDisabled: false,
    });

    this.pendingConfirmAction = async () => {
      return await this.accountContract.cancelOptionOrder({
        orderBook: this.optionsOrderBookAddress,
        orderId: Number(order.orderId),
      });
    };
  }

  /** Matches your contract semantics. Adjust if enum differs. */
  private isLongSideIntent(intent: number): boolean {
    // In your solidity: long-side intents are BuyOption and SellWriter (holder side)
    // short-side intents are WriteOption and SellOption (writer side)
    // If your enum order differs, update this mapping.
    return intent === 0 || intent === 3;
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

  private resolveMarketInfo(marketKey: string) {
    const mk = String(marketKey ?? '').toLowerCase();
    const row = this.ob.activeMarkets().find((m) => m.marketKey === mk);
    const info = row?.market ?? row?.derived ?? null;

    // expiry field differs between market vs derived
    const expirySec = row?.market?.expiry ?? row?.derived?.optionExpiry ?? null;

    return { mk, row, info, expirySec };
  }

  private formatMarketLabel(
    marketKey: string,
    fallbackOrder?: OptionOrder,
  ): string {
    const { info, expirySec } = this.resolveMarketInfo(marketKey);

    if (!info && !fallbackOrder) return marketKey;

    const optionType = info?.optionType ?? fallbackOrder?.optionType ?? 0;
    const asset = info?.assetToken ?? fallbackOrder?.assetToken ?? '';
    const quote = info?.quoteToken ?? fallbackOrder?.quoteToken ?? '';

    const strike = info?.strikePrice ?? fallbackOrder?.strikePrice ?? 0n;
    const exp = expirySec ?? fallbackOrder?.optionExpiry ?? 0n;

    const strikeLabel =
      asset && quote
        ? this.fmt.formatPriceFixed(strike, asset, quote)
        : String(strike);

    const expLabel = exp
      ? new Date(Number(exp) * 1000).toISOString().slice(0, 10)
      : '—';

    return `${optionType === 0 ? 'CALL' : 'PUT'} ${this.fmt.tokenLabel(asset)}/${this.fmt.tokenLabel(quote)}  strike ${strikeLabel}  exp ${expLabel}`;
  }

  // =========================================================
  // Exercise / Reclaim (OptionContract)
  // =========================================================

  async exerciseByMarketKey(params: { marketKey: string; size: bigint }): Promise<string | null> {
    const mk = String(params.marketKey ?? '').toLowerCase();
    if (!mk) throw new Error('Missing marketKey');
    if (params.size <= 0n) throw new Error('Enter a size');

    const txHash = await this.optionWrite.exercise(mk, params.size);
    this.trigger.emitDomainEvent({ type: 'Option Exercised' });
    return txHash;
  }

  async reclaimExpiredByMarketKey(marketKey: string): Promise<string | null> {
    const mk = String(marketKey ?? '').toLowerCase();
    if (!mk) throw new Error('Missing marketKey');

    const txHash = await this.optionWrite.reclaimExpired(mk);
    this.trigger.emitDomainEvent({ type: 'Option Reclaimed' });
    return txHash;
  }

  requestExercise(
    marketKey: string,
    size: bigint,
    meta?: { marketLabel?: string },
  ) {
    const mk = String(marketKey ?? '').toLowerCase();
    const fields: ConfirmationField[] = [
      { label: 'Action', value: 'Exercise' },
      { label: 'Market', value: meta?.marketLabel ?? mk },
      { label: 'Size', value: size.toString() },
    ];

    this.openConfirmModal({
      title: 'Exercise option',
      confirmLabel: 'Confirm & Sign',
      fields,
      requirements: null,
    });

    this.pendingConfirmAction = async () => {
      return await this.exerciseByMarketKey({ marketKey: mk, size });
    };
  }

  requestReclaimExpired(marketKey: string, meta?: { marketLabel?: string }) {
    const mk = String(marketKey ?? '').toLowerCase();
    const fields: ConfirmationField[] = [
      { label: 'Action', value: 'Reclaim Expired' },
      { label: 'Market', value: meta?.marketLabel ?? mk },
    ];

    this.openConfirmModal({
      title: 'Reclaim expired',
      confirmLabel: 'Confirm & Sign',
      fields,
      requirements: null,
    });

    this.pendingConfirmAction = async () => {
      return await this.reclaimExpiredByMarketKey(mk);
    };
  }
}
