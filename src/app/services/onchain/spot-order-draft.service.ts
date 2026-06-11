import { Injectable, computed, inject, signal } from '@angular/core';
import { ethers, isAddress } from 'ethers';
import { formatUnitsHuman, formatTokenAmount } from '../../core/format/number-format';
import { stableComputed } from '../../core/signals/stable-resource';

import { TradeSettingsService } from '../../services/shared/trade-settings.service';
import { TokenService, TokenInfo } from '../../services/shared/token.service';
import { PortfolioService } from '../../services/onchain/portfolio.service';
import { FeeService } from '../../services/shared/fee.service';
import { PriceManagerContractService } from './contracts/pricemanager-contract.service';
import { ERC20_SPOT_FEE_CONTEXT, PRICE_MANAGER_CONTEXT_TRADE_VALUE } from './token-spot-order.constants';
import { TriggerService } from '../../services/shared/trigger.service';
import { OrderBookActionsService } from '../shared/orderbook/orderbook-actions.service';
import { ETH_ADDRESS } from '../shared/main.tokens';
import { buildOrderFlowRequirementRows } from '../../shared/order-flow';
import { WalletConnectService } from '../../wallet/wallet-connect.service';
import {
  TokenSpotOrderBookReadService,
  SpotOrder,
} from './contracts/token-spot-orderbook-read.service';

import type {
  ConfirmationField,
  RequirementRow,
} from '../../core/modals/confirmation/confirmation-modal.component';
import { TransactionReceiptService } from '../../shared/transaction-receipt';
import {
  expiryPreviewLabel as sharedExpiryPreviewLabel,
  formatDuration as sharedFormatDuration,
  resolveExpiryForContract,
  validateResolvedExpiry,
} from '../../shared/expiry/expiry-settings';

type SideUI = 'buy' | 'sell';
type DraftMode = 'place' | 'accept' | 'cancel';

type PercentageFeeValuation = {
  hasPercentageFee: boolean;
  preferredMatchesOffered: boolean;
  percentageTokenMatchesOffered: boolean;
  percentageTokenMatchesPreferred: boolean;
  assetOk: boolean | null;
  paymentOk: boolean | null;
  mode: 'none' | 'fallback-offered-token' | 'preferred-token' | 'same-token';
};

const ZERO = ethers.ZeroAddress;
const ONE_E18 = 10n ** 18n;
const TOKEN_SPOT_DEFAULT_EXPIRY_SECONDS = 30n * 24n * 60n * 60n;

function n(v: unknown): string {
  return String(v ?? '')
    .trim()
    .toLowerCase();
}

function isNativeLike(input: unknown): boolean {
  const k = n(input);
  return (
    k === 'eth' ||
    k === 'native' ||
    k === 'ether' ||
    k === n(ETH_ADDRESS) ||
    k === n(ZERO)
  );
}

function normalizeKey(input: unknown): string {
  const k = n(input);
  if (!k) return '';
  return isNativeLike(k) ? n(ETH_ADDRESS) : k;
}

// UI key -> contract address (ETH_ADDRESS => 0x0)
function keyToContractAddress(key: string): string {
  return normalizeKey(key) === n(ETH_ADDRESS) ? ZERO : normalizeKey(key);
}

// contract address -> UI key (0x0 => ETH_ADDRESS)
function contractAddrToKey(addr: string): string {
  const a = n(addr);
  return a === n(ZERO) ? n(ETH_ADDRESS) : a;
}

function shortAddr(a: string): string {
  const s = a ?? '';
  return s.length > 10 ? `${s.slice(0, 6)}…${s.slice(-4)}` : s;
}

@Injectable({ providedIn: 'root' })
export class SpotOrderDraftService {
  private readonly trigger = inject(TriggerService);
  readonly txReceipt = inject(TransactionReceiptService);
  private readonly settings = inject(TradeSettingsService);
  private readonly obRead = inject(TokenSpotOrderBookReadService);

  private readonly tokens = inject(TokenService);
  private readonly portfolio = inject(PortfolioService);
  private readonly feeSvc = inject(FeeService);
  private readonly priceManager = inject(PriceManagerContractService);
  private readonly wallet = inject(WalletConnectService);
  private readonly orderbookActions = inject(OrderBookActionsService);

  // ---------------- form state ----------------
  readonly mode = signal<DraftMode>('place');

  // accept/cancel inputs
  readonly makerOrderIdHuman = signal<string>('');
  readonly acceptAmountHuman = signal<string>('');

  // place inputs
  readonly side = signal<SideUI>('buy');

  readonly baseSelected = signal<string>('');
  readonly baseInput = signal<string>('');
  readonly quoteSelected = signal<string>('');
  readonly quoteInput = signal<string>('');

  readonly priceHuman = signal<string>('');
  readonly amountHuman = signal<string>('');
  readonly expirySeconds = signal<string>('0'); // absolute Unix timestamp, 0 = contract default

  // ---------------- cancellation / run guard ----------------
  private _confirmRunId = 0;
  private nextConfirmRun(): number {
    this._confirmRunId += 1;
    return this._confirmRunId;
  }
  private isActiveRun(runId: number): boolean {
    return runId === this._confirmRunId;
  }

  // ---------------- data sources ----------------
  readonly balances = this.portfolio.accountBalances;
  readonly tokenList = stableComputed<TokenInfo[]>(() => this.tokens.list() ?? []);

  // ---------------- base/quote keys ----------------
  readonly baseKey = computed(() =>
    normalizeKey(this.baseSelected() || this.baseInput()),
  );
  readonly quoteKey = computed(() =>
    normalizeKey(this.quoteSelected() || this.quoteInput()),
  );

  readonly baseTokenInfo = computed(() =>
    this.baseKey() ? this.tokens.getToken(this.baseKey())() : undefined,
  );
  readonly quoteTokenInfo = computed(() =>
    this.quoteKey() ? this.tokens.getToken(this.quoteKey())() : undefined,
  );

  readonly baseSymbol = computed(() =>
    this.baseKey() === n(ETH_ADDRESS)
      ? 'ETH'
      : (this.baseTokenInfo()?.symbol ?? 'BASE'),
  );
  readonly quoteSymbol = computed(() =>
    this.quoteKey() === n(ETH_ADDRESS)
      ? 'ETH'
      : (this.quoteTokenInfo()?.symbol ?? 'QUOTE'),
  );

  readonly baseDecimals = computed(() => this.baseTokenInfo()?.decimals ?? 18);
  readonly quoteDecimals = computed(
    () => this.quoteTokenInfo()?.decimals ?? 18,
  );

  readonly pairValid = computed(() => {
    const b = this.baseKey();
    const q = this.quoteKey();
    if (!b || !q) return false;
    if (b === q) return false;

    const baseOk = b === n(ETH_ADDRESS) || isAddress(b);
    const quoteOk = q === n(ETH_ADDRESS) || isAddress(q);
    return baseOk && quoteOk;
  });

  // ---------------- labels ----------------
  readonly priceLabel = computed(() => {
    const base = this.baseSymbol();
    const quote = this.quoteSymbol();
    return this.side() === 'sell'
      ? `Sell price (receive ${quote} per 1 ${base})`
      : `Buy price (pay ${quote} per 1 ${base})`;
  });

  readonly amountLabel = computed(() => {
    const base = this.baseSymbol();
    return this.side() === 'sell'
      ? `Amount to sell (${base})`
      : `Amount to buy (${base})`;
  });

  // ---------------- fee token ----------------
  readonly preferredFeeTokenKey = computed(() =>
    normalizeKey(this.settings.preferredFeeToken?.() ?? ''),
  );

  readonly feeTokenAddress = computed(() => {
    const k = this.preferredFeeTokenKey();
    return k ? keyToContractAddress(k).toLowerCase() : ZERO.toLowerCase();
  });

  readonly feeTokenLabel = computed(() => {
    const k = this.preferredFeeTokenKey();
    if (!k || k === n(ETH_ADDRESS)) return 'ETH';
    const info = this.tokens.getToken(k)();
    return info?.symbol ?? shortAddr(k);
  });

  readonly feeTokenAccepted = computed(() => {
    const accepted = (this.feeSvc.acceptedPaymentTokens() ?? []).map(n);
    if (!accepted.length) return true;
    return new Set(accepted).has(this.feeTokenAddress());
  });

  // ---------------- parse helpers ----------------
  readonly amountRaw = computed<bigint | null>(() => {
    const s = String(this.amountHuman() ?? '').trim();
    if (!s) return null;
    try {
      const v = ethers.parseUnits(s.replace(',', '.'), this.baseDecimals());
      return v > 0n ? v : null;
    } catch {
      return null;
    }
  });

  readonly priceFixed = computed<bigint | null>(() => {
    const s = String(this.priceHuman() ?? '').trim();
    if (!s) return null;

    try {
      const P18 = ethers.parseUnits(s.replace(',', '.'), 18);
      if (P18 <= 0n) return null;

      const dq = Number(this.quoteDecimals());
      const db = Number(this.baseDecimals());
      const diff = dq - db;

      if (diff === 0) return P18;
      if (diff > 0) return P18 * 10n ** BigInt(diff);
      return P18 / 10n ** BigInt(-diff);
    } catch {
      return null;
    }
  });

  readonly totalQuoteHuman = computed(() => {
    const amt = this.amountRaw();
    const price = this.priceFixed();
    if (!amt || !price) return '0';

    const totalRaw = (amt * price) / ONE_E18;
    try {
      return formatUnitsHuman(totalRaw, this.quoteDecimals(), { maxDecimals: 6, compactFrom: 1_000_000 });
    } catch {
      return '0';
    }
  });

  // ---------------- confirmation modal state ----------------
  readonly showConfirmModal = signal(false);
  readonly confirmFields = signal<ConfirmationField[]>([]);
  readonly confirmRequirements = signal<RequirementRow[]>([]);
  readonly confirmError = signal<string | null>(null);

  readonly feeQuoteLoading = signal(false);
  readonly submitLoading = signal(false);
  readonly submitStage = signal<'idle' | 'signing' | 'submitting'>('idle');

  readonly confirmDisabled = computed(() => {
    if (this.feeQuoteLoading()) return true;
    if (this.submitLoading()) return true;
    if (this.confirmError()) return true;
    return false;
  });

  readonly modalLoading = computed(
    () => this.feeQuoteLoading() || this.submitLoading(),
  );

  readonly confirmButtonLabel = computed(() => {
    if (this.feeQuoteLoading()) return 'Quoting fees...';
    if (this.submitStage() === 'signing') return 'Waiting for signature...';
    if (this.submitStage() === 'submitting') return 'Submitting...';
    return 'Confirm & Sign';
  });

  closeConfirm() {
    this.nextConfirmRun();
    this.showConfirmModal.set(false);
    this.feeQuoteLoading.set(false);
    this.feeSvc.setQuoteParams(null);
  }

  // ---------------- UI handlers ----------------
  onBaseSelected(addr: string) {
    this.baseSelected.set(addr);
    this.baseInput.set('');
  }
  onBaseInput(addr: string) {
    this.baseInput.set(addr);
    if (n(addr)) this.baseSelected.set('');
  }
  onQuoteSelected(addr: string) {
    this.quoteSelected.set(addr);
    this.quoteInput.set('');
  }
  onQuoteInput(addr: string) {
    this.quoteInput.set(addr);
    if (n(addr)) this.quoteSelected.set('');
  }

  // =========================================================
  //                       MAIN FLOW
  // =========================================================
  private async openPlaceConfirmation(runId: number): Promise<void> {
    const openError = (msg: string) => {
      if (!this.isActiveRun(runId)) return;
      this.confirmError.set(msg);
      this.showConfirmModal.set(true);
    };

    if (!this.pairValid()) {
      openError(
        'Invalid trading pair (base/quote must be different and valid).',
      );
      return;
    }

    if (!this.feeTokenAccepted()) {
      openError('Preferred fee token is not accepted on-chain.');
      return;
    }

    const amt = this.amountRaw();
    const price = this.priceFixed();

    if (!amt) {
      openError(`Enter an amount in ${this.baseSymbol()}.`);
      return;
    }
    if (!price) {
      openError(
        `Enter a price in ${this.quoteSymbol()} per 1 ${this.baseSymbol()}.`,
      );
      return;
    }

    const offeredKey = this.placeOfferedTokenKey();
    const offeredRaw = this.placeOfferedRaw(amt, price);

    if (offeredRaw <= 0n) {
      openError('Total becomes 0 after rounding. Increase amount or price.');
      return;
    }

    // Show modal immediately with fields
    this.confirmFields.set(this.buildPlaceFields(amt, price));
    this.showConfirmModal.set(true);

    // Quote fees + build requirements
    await this.quoteAndFillRequirements({
      runId,
      offeredKey,
      offeredRaw,
      onError: openError,
    });
  }

  // =========================================================
  //                     PLACE ORDER
  // =========================================================
  private buildPlaceFields(
    amountBaseRaw: bigint,
    priceFixed: bigint,
    fee?: {
      fixedAmount: bigint;
      fixedToken: string;
      percentageAmount: bigint;
      percentageToken: string;
    } | null,
    offeredKey?: string,
    offeredRaw?: bigint,
    oracleStatus?: PercentageFeeValuation,
  ): ConfirmationField[] {
    const base = this.baseSymbol();
    const quote = this.quoteSymbol();
    const sideLabel = this.side() === 'buy' ? 'BUY (Bid)' : 'SELL (Ask)';
    const youLabel =
      this.side() === 'buy' ? 'You pay / lock (quote)' : 'You sell / lock (base)';

    const totalQuoteRaw = (amountBaseRaw * priceFixed) / ONE_E18;
    const totalQuoteHuman = formatUnitsHuman(totalQuoteRaw, this.quoteDecimals(), { maxDecimals: 6, compactFrom: 1_000_000 });

    const fields: ConfirmationField[] = [
      { label: 'Side', value: sideLabel },
      { label: 'Pair', value: `${base}/${quote}` },
      { label: 'Amount (base)', value: `${n(this.amountHuman())} ${base}` },
      {
        label: 'Price',
        value: `${n(this.priceHuman())} ${quote} per 1 ${base}`,
      },
      { label: youLabel, value: `${totalQuoteHuman} ${quote}` },
      { label: 'Preferred fee token', value: `${this.feeTokenLabel()} (fixed fee)` },
      { label: 'Fee context', value: ERC20_SPOT_FEE_CONTEXT, tone: 'system' },
    ];

    if (offeredKey && offeredRaw !== undefined) {
      fields.push({
        label: 'Trade value lock',
        value: this.formatTokenAmount(offeredKey, offeredRaw),
      });
    }

    if (fee) {
      fields.push(
        {
          label: 'Fixed fee',
          value: this.formatFeeTokenAmount(fee.fixedToken, fee.fixedAmount),
          tone: 'system',
        },
        {
          label: 'Percentage fee',
          value: this.formatFeeTokenAmount(
            fee.percentageToken,
            fee.percentageAmount,
          ),
          tone: 'system',
        },
      );

      if (fee.percentageAmount > 0n) {
        fields.push({
          label: 'Percentage fee token',
          value: this.feeTokenSourceLabel(fee.percentageToken, offeredKey),
          tone: 'system',
        });
      }
    }

    if (oracleStatus) {
      fields.push({
        label: 'Percentage fee valuation',
        value: this.percentageFeeValuationLabel(oracleStatus),
        tone: 'system',
      });

      if (
        oracleStatus.hasPercentageFee &&
        !oracleStatus.preferredMatchesOffered &&
        oracleStatus.mode === 'fallback-offered-token'
      ) {
        fields.push({
          label: 'Trade value oracle',
          value:
            oracleStatus.assetOk === null
              ? 'Not checked'
              : oracleStatus.assetOk
                ? 'Usable for trade value conversion'
                : 'No usable oracle for offered/locked asset conversion',
          tone:
            oracleStatus.assetOk === null
              ? 'muted'
              : oracleStatus.assetOk
                ? 'good'
                : 'system',
        });

        fields.push({
          label: 'Preferred fee-token oracle',
          value:
            oracleStatus.paymentOk === null
              ? 'Not checked'
              : oracleStatus.paymentOk
                ? 'Usable for preferred fee-token conversion'
                : 'No usable oracle for preferred fee-token conversion',
          tone:
            oracleStatus.paymentOk === null
              ? 'muted'
              : oracleStatus.paymentOk
                ? 'good'
                : 'system',
        });
      }
    }

    fields.push({
      label: 'Expiry',
      value: this.expiryPreviewLabel(),
      tone: 'system',
    });

    return fields;
  }

  private expiryPreviewLabel(): string {
    return sharedExpiryPreviewLabel(
      this.expirySeconds(),
      `Contract default: ${this.formatDuration(TOKEN_SPOT_DEFAULT_EXPIRY_SECONDS)} after placement (contract receives 0)`,
    );
  }

  private formatDuration(seconds: bigint): string {
    return sharedFormatDuration(seconds);
  }

  private placeOfferedTokenKey(): string {
    return this.side() === 'buy' ? this.quoteKey() : this.baseKey();
  }

  private placeOfferedRaw(amountBaseRaw: bigint, priceFixed: bigint): bigint {
    if (this.side() === 'sell') return amountBaseRaw;
    return (amountBaseRaw * priceFixed) / ONE_E18;
  }

  async submit(): Promise<void> {
    if (this.mode() !== 'place') return; // accept/cancel are handled by actions modal
    if (this.confirmDisabled()) return;

    await this.submitPlace();
  }

  private async submitPlace(): Promise<void> {
    const amt = this.amountRaw();
    const price = this.priceFixed();
    if (!amt || !price) {
      this.confirmError.set('Invalid amount/price.');
      return;
    }

    const feeToken = this.feeTokenAddress();
    const baseToken = keyToContractAddress(this.baseKey());
    const quoteToken = keyToContractAddress(this.quoteKey());
    const side: 0 | 1 = this.side() === 'buy' ? 0 : 1;
    const chainNow = await this.latestChainTimestamp();
    const expiry = resolveExpiryForContract(this.expirySeconds(), chainNow);
    const expiryError = validateResolvedExpiry(expiry, chainNow);
    if (expiryError) {
      this.confirmError.set(expiryError);
      return;
    }

    this.submitLoading.set(true);
    this.submitStage.set('submitting');
    this.txReceipt.pending('Confirm Order', 'Waiting for wallet signature and on-chain confirmation...');

    try {
      const txHash = await this.orderbookActions.placeOrderTokenSpot({
        feeToken,
        baseToken,
        quoteToken,
        side,
        price,
        amount: amt,
        expiry,
      });

      this.trigger.emitDomainEvent({ type: 'orderPlaced' });
      this.txReceipt.success('Transaction confirmed', typeof txHash === 'string' ? txHash : null);
    } catch (e: any) {
      const message = String(e?.reason ?? e?.shortMessage ?? e?.message ?? 'Order failed');
      this.confirmError.set(message);
      this.txReceipt.error('Transaction failed', e, message);
    } finally {
      this.submitLoading.set(false);
      this.submitStage.set('idle');
    }
  }

  // =========================================================
  //                     ACCEPT / CANCEL
  // =========================================================
  readonly makerOrder = signal<SpotOrder | null>(null);
  readonly makerOrderLoading = signal(false);
  readonly makerOrderError = signal<string | null>(null);

  private parseOrderId(raw: string): bigint | null {
    try {
      const s = raw.trim();
      if (!s) return null;
      return BigInt(s);
    } catch {
      return null;
    }
  }

  private async loadMakerOrder(): Promise<SpotOrder | null> {
    const id = this.parseOrderId(this.makerOrderIdHuman());
    if (id === null) {
      this.makerOrderError.set('Invalid order id.');
      this.makerOrder.set(null);
      return null;
    }

    this.makerOrderLoading.set(true);
    this.makerOrderError.set(null);

    try {
      const o = await this.obRead.getOrder(id);
      if (!o) throw new Error('Order not found');
      if (o.amount <= 0n) throw new Error('Order has no remaining amount');
      this.makerOrder.set(o);
      return o;
    } catch (e: any) {
      this.makerOrder.set(null);
      this.makerOrderError.set(
        String(e?.reason ?? e?.message ?? 'Failed to load order'),
      );
      return null;
    } finally {
      this.makerOrderLoading.set(false);
    }
  }

  private async openAcceptById(runId: number): Promise<void> {
    this.makerOrderError.set(null);

    const o = await this.loadMakerOrder();
    if (!o) return;
    if (!this.isActiveRun(runId)) return;

    // prevent double overlay: close vm modal state
    this.closeConfirm();

    // delegate to actions modal flow
    this.orderbookActions.requestFill(o);
  }

  private async openCancelById(runId: number): Promise<void> {
    this.makerOrderError.set(null);

    const o = await this.loadMakerOrder();
    if (!o) return;
    if (!this.isActiveRun(runId)) return;

    this.closeConfirm();
    this.orderbookActions.requestCancel(o);
  }

  // =========================================================
  //                 QUOTE + REQUIREMENTS SHARED
  // =========================================================
  private async quoteAndFillRequirements(args: {
    runId: number;
    offeredKey: string;
    offeredRaw: bigint;
    onError: (msg: string) => void;
  }): Promise<void> {
    const { runId, offeredKey, offeredRaw, onError } = args;

    const assetToken = keyToContractAddress(offeredKey).toLowerCase();
    const assetValue = offeredRaw;

    this.feeSvc.setQuoteParams({
      assetToken,
      assetValue,
      context: ERC20_SPOT_FEE_CONTEXT,
    });

    this.feeQuoteLoading.set(true);
    try {
      await this.waitForFeeQuote();
      if (!this.isActiveRun(runId)) return;

      const fee = this.feeSvc.feeQuote();
      if (!fee) throw new Error('Fee quote unavailable');

      const oracleStatus = await this.getTradeValueOracleStatus(assetToken, fee);

      const amt = this.amountRaw();
      const price = this.priceFixed();
      if (amt && price) {
        this.confirmFields.set(
          this.buildPlaceFields(
            amt,
            price,
            fee,
            offeredKey,
            offeredRaw,
            oracleStatus,
          ),
        );
      }

      const reqRows = this.buildRequirementsFromFee(
        offeredKey,
        offeredRaw,
        fee,
      );
      this.confirmRequirements.set(reqRows);

      this.confirmError.set(
        reqRows.some((r) => !r.ok)
          ? 'Action required: deposit the missing token(s) to cover lock + fees.'
          : null,
      );
    } catch (e: any) {
      if (!this.isActiveRun(runId)) return;
      onError(String(e?.reason ?? e?.message ?? 'Failed to quote fees'));
    } finally {
      if (this.isActiveRun(runId)) this.feeQuoteLoading.set(false);
    }
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

  private getAvailableRaw(tokenKey: string): bigint {
    const key = normalizeKey(tokenKey);
    const b = this.balances()?.[key];
    if (!b) return 0n;
    return b.balance - b.locked;
  }

  private async getTradeValueOracleStatus(
    assetToken: string,
    fee: {
      fixedAmount: bigint;
      fixedToken: string;
      percentageAmount: bigint;
      percentageToken: string;
    },
  ): Promise<PercentageFeeValuation> {
    const normalizeContractAddress = (token: string): string =>
      n(token) === n(ZERO) ? n(ETH_ADDRESS) : n(token);

    const normalizedAsset = normalizeContractAddress(assetToken);
    const normalizedPreferred = normalizeContractAddress(fee.fixedToken);
    const normalizedPercentageToken = normalizeContractAddress(fee.percentageToken);

    const hasPercentageFee = fee.percentageAmount > 0n;
    const preferredMatchesOffered = normalizedPreferred === normalizedAsset;
    const percentageTokenMatchesOffered =
      hasPercentageFee && normalizedPercentageToken === normalizedAsset;
    const percentageTokenMatchesPreferred =
      hasPercentageFee && normalizedPercentageToken === normalizedPreferred;

    const check = async (token: string): Promise<boolean | null> => {
      try {
        const normalized = n(token) === n(ZERO) ? ZERO : token;
        const result = await this.priceManager.getUsableOracleForTokenContext(
          normalized,
          PRICE_MANAGER_CONTEXT_TRADE_VALUE,
        );
        return result.ok;
      } catch {
        return null;
      }
    };

    if (!hasPercentageFee) {
      return {
        hasPercentageFee,
        preferredMatchesOffered,
        percentageTokenMatchesOffered,
        percentageTokenMatchesPreferred,
        assetOk: null,
        paymentOk: null,
        mode: 'none',
      };
    }

    const assetOk = await check(assetToken);
    const paymentOk = await check(fee.fixedToken);
    const bothUsable = assetOk === true && paymentOk === true;

    let mode: PercentageFeeValuation['mode'];
    if (percentageTokenMatchesPreferred && preferredMatchesOffered) {
      mode = 'same-token';
    } else if (percentageTokenMatchesPreferred) {
      mode = 'preferred-token';
    } else if (percentageTokenMatchesOffered) {
      mode = 'fallback-offered-token';
    } else {
      mode = 'preferred-token';
    }

    return {
      hasPercentageFee,
      preferredMatchesOffered,
      percentageTokenMatchesOffered,
      percentageTokenMatchesPreferred,
      assetOk,
      paymentOk,
      mode,
    };
  }

  private percentageFeeValuationLabel(status: PercentageFeeValuation): string {
    if (!status.hasPercentageFee || status.mode === 'none') {
      return 'No percentage fee charged';
    }

    const offeredSide = this.side() === 'buy' ? 'quote' : 'base';

    if (status.mode === 'fallback-offered-token') {
      return `No conversion possible, percentage fee is paid in ${offeredSide} token`;
    }

    if (status.mode === 'same-token') {
      return `No conversion needed; percentage fee is paid in ${offeredSide} token`;
    }

    return 'Trade value converted to preferred fee token for the percentage fee';
  }

  private feeTokenSourceLabel(percentageToken: string, offeredKey?: string): string {
    const returnedKey = contractAddrToKey(percentageToken);
    const offered = offeredKey ? normalizeKey(offeredKey) : '';
    const formatted = this.formatTokenAmount(returnedKey, 0n).replace(/^0(?:\.0+)?\s+/, '');

    if (offered && normalizeKey(returnedKey) === offered) {
      return `${formatted} (offered/locked token returned by FeeManager)`;
    }

    return `${formatted} (preferred fee token returned by FeeManager)`;
  }

  private async latestChainTimestamp(): Promise<bigint | null> {
    try {
      const provider: any = this.wallet.provider?.() ?? null;
      if (!provider) return null;

      const block = await provider.getBlock('latest');
      const ts = block?.timestamp;
      return typeof ts === 'number' && Number.isFinite(ts) && ts > 0
        ? BigInt(ts)
        : null;
    } catch {
      return null;
    }
  }

  private formatFeeTokenAmount(token: string, raw: bigint): string {
    const key = n(token) === n(ZERO) ? n(ETH_ADDRESS) : normalizeKey(token);
    return this.formatTokenAmount(key, raw);
  }

  private formatTokenAmount(tokenKey: string, raw: bigint): string {
    const key = normalizeKey(tokenKey);
    const info = this.tokens.getToken(key)();
    const decimals = info?.decimals ?? 18;
    const symbol = info?.symbol ?? (key === n(ETH_ADDRESS) ? 'ETH' : shortAddr(key));
    return formatTokenAmount(raw, decimals, symbol, { maxDecimals: 6, compactFrom: 1_000_000 });
  }

  private buildRequirementsFromFee(
    offeredKey: string,
    offeredRaw: bigint,
    fee: {
      fixedAmount: bigint;
      fixedToken: string;
      percentageAmount: bigint;
      percentageToken: string;
    },
  ): RequirementRow[] {
    const requirements = [
      { tokenKey: offeredKey, label: 'Trade value lock', raw: offeredRaw },
      {
        tokenKey: n(fee.fixedToken) === n(ZERO) ? n(ETH_ADDRESS) : normalizeKey(fee.fixedToken),
        label: 'Fixed fee lock',
        raw: fee.fixedAmount,
      },
      {
        tokenKey: n(fee.percentageToken) === n(ZERO) ? n(ETH_ADDRESS) : normalizeKey(fee.percentageToken),
        label: 'Percentage fee lock',
        raw: fee.percentageAmount,
      },
    ];

    return buildOrderFlowRequirementRows(requirements, {
      normalizeTokenKey: (token) => normalizeKey(token),
      displayTokenAddress: (key) => key === n(ETH_ADDRESS) ? 'address(0)' : key,
      tokenSymbol: (key) => this.tokens.getToken(key)()?.symbol ?? (key === n(ETH_ADDRESS) ? 'ETH' : shortAddr(key)),
      tokenDecimals: (key) => this.tokens.getToken(key)()?.decimals ?? 18,
      availableRaw: (key) => this.getAvailableRaw(key),
    });
  }

  async openConfirmation(): Promise<void> {
    const runId = this.nextConfirmRun();

    // reset VM modal state
    this.confirmError.set(null);
    this.confirmRequirements.set([]);
    this.confirmFields.set([]);

    // Route by mode
    if (this.mode() === 'cancel') {
      await this.openCancelById(runId);
      return;
    }

    if (this.mode() === 'accept') {
      await this.openAcceptById(runId);
      return;
    }

    // Default: PLACE
    await this.openPlaceConfirmation(runId);
  }
}
