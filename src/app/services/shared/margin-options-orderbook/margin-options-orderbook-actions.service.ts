import { Injectable, computed, inject, signal } from '@angular/core';
import { Contract, ethers } from 'ethers';

import type { ConfirmationField, RequirementRow } from '../../../core/modals/confirmation/confirmation-modal.component';
import { AccountContractService } from '../../onchain/contracts/account-contract.service';
import { FeeManagerContractService, FeeOutput } from '../../onchain/contracts/fee-manager-contract.service';
import { TransactionReceiptService } from '../../../shared/transaction-receipt';
import { TriggerService } from '../trigger.service';
import { TradeSettingsService } from '../trade-settings.service';
import { ETH_ADDRESS } from '../main.tokens';
import { norm } from '../../../core/tokens/token-normalize';
import { MarginOptionsReadService, MarginOrder } from '../../onchain/contracts/margin-options-read.service';
import { MarginOptionsOrderBookStore } from './margin-options-orderbook.store';
import { MarginOptionsFormatService } from './margin-options-format.service';
import { appendFeePreviewFields } from '../fee-preview-fields';
import { WalletConnectService } from '../../../wallet/wallet-connect.service';
import { CONTRACT_ABIS } from '../../../contracts/generated';

const ZERO = ethers.ZeroAddress;
const FEE_CONTEXT = 'Margin Option Trade';
const ONE_E18 = 10n ** 18n;
type Status = 'idle' | 'pending' | 'success' | 'error';

type MarginIntent = 0 | 1 | 2 | 3;

@Injectable({ providedIn: 'root' })
export class MarginOptionsOrderBookActionsService {
  private readonly accountContract = inject(AccountContractService);
  private readonly feeManager = inject(FeeManagerContractService);
  private readonly trigger = inject(TriggerService);
  private readonly settings = inject(TradeSettingsService);
  private readonly reads = inject(MarginOptionsReadService);
  private readonly store = inject(MarginOptionsOrderBookStore);
  private readonly fmt = inject(MarginOptionsFormatService);
  private readonly txReceipt = inject(TransactionReceiptService);
  private readonly wallet = inject(WalletConnectService);

  readonly orderBookAddress = this.reads.orderBookAddress;
  readonly marginContractAddress = this.reads.marginContractAddress;

  readonly preferredFeeToken = computed(() => {
    const pref = norm(this.settings.preferredFeeToken?.() ?? '');
    if (!pref || pref === norm(ETH_ADDRESS) || pref === 'eth' || pref === norm(ZERO)) return ZERO;
    return ethers.getAddress(pref);
  });

  readonly confirmOpen = signal(false);
  readonly confirmTitle = signal('Confirm Action');
  readonly confirmLabel = signal('Confirm');
  readonly confirmFields = signal<ConfirmationField[]>([]);
  readonly confirmRequirements = signal<RequirementRow[] | null>(null);
  readonly confirmDisabled = signal(false);
  readonly confirmShowConfirmButton = signal(true);
  readonly confirmError = signal<string | null>(null);
  readonly receipt = this.txReceipt.receipt;
  readonly explorerTxUrl = this.txReceipt.explorerTxUrl;

  private readonly _pending = signal(false);
  readonly pending = this._pending.asReadonly();
  private readonly _success = signal(false);
  readonly status = computed<Status>(() =>
    this._pending() ? 'pending' : this.confirmError() ? 'error' : this._success() ? 'success' : 'idle',
  );

  private pendingConfirmAction: null | (() => Promise<string | null | void>) = null;

  closeConfirmModal(): void {
    this.confirmOpen.set(false);
    this.confirmError.set(null);
    this.txReceipt.clear();
    this._pending.set(false);
    this._success.set(false);
    this.pendingConfirmAction = null;
    this.confirmShowConfirmButton.set(true);
  }

  private openConfirmModal(o: {
    title: string;
    confirmLabel: string;
    fields: ConfirmationField[];
    requirements?: RequirementRow[] | null;
    confirmDisabled?: boolean;
    showConfirmButton?: boolean;
  }): void {
    this.confirmTitle.set(o.title);
    this.confirmLabel.set(o.confirmLabel);
    this.confirmFields.set(o.fields);
    this.confirmRequirements.set(o.requirements ?? null);
    this.confirmDisabled.set(!!o.confirmDisabled);
    this.confirmShowConfirmButton.set(o.showConfirmButton ?? true);
    this.confirmError.set(null);
    this.txReceipt.clear();
    this._pending.set(false);
    this._success.set(false);
    this.confirmOpen.set(true);
  }

  async onConfirmModalConfirm(): Promise<void> {
    if (this.confirmDisabled() || !this.pendingConfirmAction || this._pending()) return;
    this._pending.set(true);
    this.confirmError.set(null);
    this.txReceipt.pending(this.confirmTitle(), 'Waiting for wallet signature and on-chain confirmation...');
    try {
      const txHash = await this.pendingConfirmAction();
      this._success.set(true);
      this._pending.set(false);
      this.confirmDisabled.set(true);
      this.pendingConfirmAction = null;
      this.txReceipt.success('Transaction confirmed', typeof txHash === 'string' ? txHash : null);
      this.trigger.emitDomainEvent({ type: 'optionOrderPlaced' });
    } catch (e: any) {
      const msg = this.enrichErrorMessage(e?.reason ?? e?.shortMessage ?? e?.message ?? 'Transaction failed');
      this.confirmError.set(msg);
      this.txReceipt.error('Transaction failed', e, msg);
      this._pending.set(false);
    }
  }

  private enrichErrorMessage(message: unknown): string {
    const msg = String(message ?? 'Transaction failed');
    if (msg.toLowerCase().includes('risk level not set')) {
      return `${msg}. Assign a RiskModule risk level to the selected lending/margin account before placing restricted trades. Use the setLendingAccountRiskLevel.js script, or call RiskModule.setAccountRiskLevel(account, riskLevel) through the risk admin/timelock.`;
    }
    return msg;
  }

  private premiumRaw(size: bigint, askPrice: bigint): bigint {
    return (size * askPrice) / ONE_E18;
  }

  private isEth(token: string | null | undefined): boolean {
    const t = norm(token ?? '');
    return !t || t === norm(ZERO) || t === norm(ETH_ADDRESS) || t === 'eth';
  }

  private async quoteFee(assetToken: string, assetValue: bigint, account?: string, isMaker = true): Promise<FeeOutput | null> {
    if (assetValue <= 0n) return null;
    try {
      return await this.feeManager.getFeeForAccount(
        this.preferredFeeToken(),
        assetToken,
        assetValue,
        FEE_CONTEXT,
        account && ethers.isAddress(account) ? account : ethers.ZeroAddress,
        isMaker,
      );
    } catch {
      return null;
    }
  }

  private appendFeeFields(fields: ConfirmationField[], fee: FeeOutput | null): ConfirmationField[] {
    return appendFeePreviewFields(fields, {
      context: FEE_CONTEXT,
      preferredFeeToken: this.preferredFeeToken(),
      fee,
      format: {
        tokenLabel: (token) => this.fmt.tokenLabel(token),
        formatTokenAmount: (amount, token) => this.fmt.formatAmount(amount, token),
      },
    });
  }

  private appendLockSplitFields(
    fields: ConfirmationField[],
    args: {
      paymentToken: string;
      premium?: bigint;
      premiumLabel?: string;
      writerMargin?: bigint;
      fixedFee?: bigint;
      fixedFeeToken?: string;
      percentageFee?: bigint;
      percentageFeeToken?: string;
      totalLabel?: string;
    },
  ): ConfirmationField[] {
    const paymentToken = args.paymentToken || ZERO;
    const next = [...fields];
    let sameTokenTotal = 0n;
    let canTotal = true;

    if (args.premium !== undefined) {
      next.push({ label: args.premiumLabel ?? 'Premium value', value: this.fmt.formatAmount(args.premium, paymentToken), tone: 'system' });
      sameTokenTotal += args.premium;
    }

    if (args.writerMargin !== undefined && args.writerMargin > 0n) {
      next.push({ label: 'Writer margin locked', value: this.fmt.formatAmount(args.writerMargin, paymentToken), tone: 'warn' });
      sameTokenTotal += args.writerMargin;
    }

    if (args.fixedFee !== undefined && args.fixedFeeToken) {
      const token = args.fixedFeeToken;
      if (norm(token) === norm(paymentToken)) sameTokenTotal += args.fixedFee;
      else if (args.fixedFee > 0n) canTotal = false;
    }

    if (args.percentageFee !== undefined && args.percentageFeeToken) {
      const token = args.percentageFeeToken;
      if (norm(token) === norm(paymentToken)) sameTokenTotal += args.percentageFee;
      else if (args.percentageFee > 0n) canTotal = false;
    }

    next.push({
      label: args.totalLabel ?? 'Total same-token lock/value',
      value: canTotal ? this.fmt.formatAmount(sameTokenTotal, paymentToken) : 'Split across multiple tokens; review rows above',
      tone: 'good',
    });

    return next;
  }

  private feePayingPremium(intent: number, premium: bigint): bigint {
    // Mirrors the option/binary pattern: the premium payer pays the fee.
    return intent === 0 ? premium : 0n;
  }

  private oneXExpectedWriterMargin(args: { size: bigint; strikePrice: bigint; collateralBps: bigint }): bigint {
    if (args.size <= 0n || args.strikePrice <= 0n || args.collateralBps <= 0n) return 0n;
    const grossNotional = (args.size * args.strikePrice) / ONE_E18;
    return (grossNotional * args.collateralBps) / 10_000n;
  }

  private appendMarketConfigWarningFields(fields: ConfirmationField[], args: { market: { multiplier: bigint; strikePrice: bigint; collateralBps: bigint; paymentToken: string }; size: bigint; contractWriterMargin: bigint }): ConfirmationField[] {
    const multiplier = args.market.multiplier ?? 0n;
    if (multiplier >= 1_000_000_000_000n || args.contractWriterMargin <= 0n) return fields;

    const oneXMargin = this.oneXExpectedWriterMargin({
      size: args.size,
      strikePrice: args.market.strikePrice,
      collateralBps: args.market.collateralBps,
    });

    return [
      ...fields,
      {
        label: 'Market config warning',
        value: `Multiplier is ${multiplier.toString()} raw. Standard 1x margin markets should use 1e18. The current writer lock is the contract value, so recreate this market if 100% coverage should lock full notional.`,
        tone: 'warn',
      },
      ...(oneXMargin > args.contractWriterMargin
        ? [{
            label: 'Expected 1x margin guide',
            value: this.fmt.formatAmount(oneXMargin, args.market.paymentToken),
            tone: 'warn' as const,
          }]
        : []),
    ];
  }


  async requestCreateMarket(args: { ticker: string; optionType: number; oracle: string; strikePriceHuman: string; marketExpiry: bigint; collateralBps: bigint }): Promise<void> {
    const ticker = String(args.ticker ?? '').trim();
    if (!ticker) throw new Error('Enter a market ticker.');
    if (![0, 1].includes(Number(args.optionType))) throw new Error('Select Call or Put.');
    if (!ethers.isAddress(args.oracle)) throw new Error('Enter a valid approved oracle address.');
    const strikePrice = ethers.parseUnits(String(args.strikePriceHuman ?? '0').replace(',', '.'), 18);
    if (strikePrice <= 0n) throw new Error('Enter a strike price.');
    if (!args.marketExpiry || args.marketExpiry <= 0n) throw new Error('Select a valid market expiry.');
    if (!args.collateralBps || args.collateralBps <= 0n || args.collateralBps > 10_000n) throw new Error('Collateral coverage must be between 0 and 100%.');

    this.pendingConfirmAction = async () => {
      const provider = await this.wallet.getEthersProvider();
      if (!provider) throw new Error('Wallet provider is not connected.');
      const signer = await provider.getSigner?.().catch(() => null);
      if (!signer) throw new Error('No wallet signer available.');
      const contract = new Contract(this.marginContractAddress, CONTRACT_ABIS.MarginOptionContract, signer) as any;
      const tx = await contract['createMarket'](
        ticker,
        Number(args.optionType),
        ethers.getAddress(args.oracle),
        strikePrice,
        args.marketExpiry,
        args.collateralBps,
      );
      const receipt = await tx.wait();
      return receipt?.hash ?? tx.hash ?? null;
    };

    this.openConfirmModal({
      title: 'Create margin option market',
      confirmLabel: 'Create Market',
      showConfirmButton: true,
      fields: [
        { label: 'Ticker', value: ticker },
        { label: 'Type', value: Number(args.optionType) === 0 ? 'Call' : 'Put' },
        { label: 'Oracle', value: ethers.getAddress(args.oracle) },
        { label: 'Strike', value: args.strikePriceHuman },
        { label: 'Market expiry', value: new Date(Number(args.marketExpiry) * 1000).toLocaleString() },
        { label: 'Collateral coverage', value: `${Number(args.collateralBps) / 100}%` },
      ],
    });
  }

  async requestPlace(args: {
    marketKey?: string | null;
    intent: number;
    sizeHuman: string;
    priceHuman: string;
    expiryPreset: 'default' | '1h' | '1d' | '7d' | 'max' | 'custom';
    customExpiryUnix?: bigint | null;
    quoteOnly?: boolean;
  }): Promise<void> {
    const requestedMarketKey = String(args.marketKey ?? '').toLowerCase();
    const storeRow = requestedMarketKey
      ? this.store.activeMarkets().find((m) => m.marketKey === requestedMarketKey) ?? this.store.selectedMarket()
      : this.store.selectedMarket();
    const loadedMarket = !storeRow && requestedMarketKey ? await this.reads.getMarket(requestedMarketKey) : null;
    const row = storeRow ?? (loadedMarket ? { marketKey: requestedMarketKey, market: loadedMarket } : null);
    if (!row) throw new Error('Select an existing margin option market.');

    const m = row.market;
    const size = ethers.parseUnits(String(args.sizeHuman ?? '0').replace(',', '.'), m.paymentTokenDecimals || 18);
    if (size <= 0n) throw new Error('Enter an option size');

    const askPrice = ethers.parseUnits(String(args.priceHuman ?? '0').replace(',', '.'), 18);
    if (askPrice <= 0n) throw new Error('Enter a premium price');

    const intent = Number(args.intent) as MarginIntent;
    if (![0, 1, 2, 3].includes(intent)) throw new Error('Unsupported margin option intent');

    const now = await this.reads.latestTimestamp();
    const offset = args.expiryPreset === '1h' ? 3600n : args.expiryPreset === '1d' ? 86400n : args.expiryPreset === '7d' ? 604800n : 0n;
    let expiry = offset > 0n ? now + offset : 0n;
    if (args.expiryPreset === 'max') expiry = m.expiry;
    if (args.expiryPreset === 'custom') expiry = args.customExpiryUnix ?? 0n;

    const disabledByExpiry = expiry !== 0n && m.expiry !== 0n && expiry > m.expiry;
    const disabledByPastExpiry = expiry !== 0n && expiry <= now;

    const premium = this.premiumRaw(size, askPrice);
    const writerMargin = intent === 2 ? await this.reads.getRequiredMargin(row.marketKey, size) : 0n;
    const feeBase = this.feePayingPremium(intent, premium);
    const fee = feeBase > 0n ? await this.quoteFee(m.paymentToken, feeBase) : null;
    const disabled = !!args.quoteOnly || disabledByExpiry || disabledByPastExpiry;

    this.pendingConfirmAction = disabled
      ? null
      : async () => this.accountContract.placeOrderMarginOption({
          orderBook: this.orderBookAddress,
          marketKey: row.marketKey,
          intent,
          size,
          askPrice,
          expiry,
          feeToken: this.preferredFeeToken(),
        });

    const baseLockFields = this.appendLockSplitFields([
      { label: 'Action', value: args.quoteOnly ? 'Margin option quote' : this.fmt.intentLabel(intent) },
      { label: 'Market', value: this.fmt.marketTitle(m) },
      { label: 'Size', value: this.fmt.formatQuantity(size) },
      { label: 'Premium price', value: this.fmt.formatPrice(askPrice, m.paymentToken) },
      { label: 'Order expiry', value: expiry === 0n ? 'Default / market expiry' : new Date(Number(expiry) * 1000).toLocaleString() },
    ], {
      paymentToken: m.paymentToken,
      premium,
      premiumLabel: intent === 0 ? 'Premium locked' : 'Premium value',
      writerMargin,
      fixedFee: fee?.fixedAmount ?? 0n,
      fixedFeeToken: fee?.fixedToken ?? this.preferredFeeToken(),
      percentageFee: fee?.percentageAmount ?? 0n,
      percentageFeeToken: fee?.percentageToken ?? this.preferredFeeToken(),
      totalLabel: intent === 2 ? 'Estimated writer lock' : 'Estimated premium / fee lock',
    });

    const lockFields = intent === 2
      ? this.appendMarketConfigWarningFields(baseLockFields, { market: m, size, contractWriterMargin: writerMargin })
      : baseLockFields;

    const fields = this.appendFeeFields(lockFields, fee);

    this.openConfirmModal({
      title: args.quoteOnly ? 'Margin Option Fee Quote' : 'Place margin option order',
      confirmLabel: args.quoteOnly ? 'Close' : 'Confirm & Sign',
      fields,
      confirmDisabled: disabled,
      showConfirmButton: !args.quoteOnly,
    });

    if (disabledByExpiry) this.confirmError.set('Order expiry cannot be after the margin option market expiry.');
    else if (disabledByPastExpiry) this.confirmError.set('Order expiry must be in the future.');
  }

  async requestFill(order: MarginOrder, marketKey: string, quoteOnly = false): Promise<void> {
    const row = this.store.activeMarkets().find((m) => m.marketKey === norm(marketKey));
    const market = row?.market;
    let amount = ethers.parseUnits(String(this.store.fillAmountByOrderId(order.orderId) ?? '0').replace(',', '.'), market?.paymentTokenDecimals ?? 18);
    if (amount <= 0n) throw new Error('Enter a fill size');
    const remaining = order.size > order.filled ? order.size - order.filled : 0n;
    if (amount > remaining) amount = remaining;

    const premium = this.premiumRaw(amount, order.askPrice);
    const makerIntent = Number(order.intent);
    const takerPaysPremium = makerIntent !== 0 && makerIntent !== 3;
    const fee = takerPaysPremium ? await this.quoteFee(market?.paymentToken ?? ZERO, premium) : null;

    this.pendingConfirmAction = quoteOnly
      ? null
      : async () => this.accountContract.acceptMarginOptionOrder({
          orderBook: this.orderBookAddress,
          makerOrderId: order.orderId,
          amount,
          feeToken: takerPaysPremium ? this.preferredFeeToken() : ZERO,
        });

    const writerMargin = makerIntent === 0 || makerIntent === 1 ? await this.reads.getRequiredMargin(marketKey, amount).catch(() => 0n) : 0n;
    const baseLockFields = this.appendLockSplitFields([
      { label: 'Action', value: quoteOnly ? 'Margin option fill quote' : 'Accept margin option order' },
      { label: 'Order ID', value: order.orderId.toString() },
      { label: 'Market', value: market ? this.fmt.marketTitle(market) : marketKey },
      { label: 'Maker intent', value: this.fmt.intentLabel(makerIntent) },
      { label: 'Fill size', value: this.fmt.formatQuantity(amount) },
    ], {
      paymentToken: market?.paymentToken ?? ZERO,
      premium,
      premiumLabel: takerPaysPremium ? 'Premium locked' : 'Premium received',
      writerMargin,
      fixedFee: fee?.fixedAmount ?? 0n,
      fixedFeeToken: fee?.fixedToken ?? this.preferredFeeToken(),
      percentageFee: fee?.percentageAmount ?? 0n,
      percentageFeeToken: fee?.percentageToken ?? this.preferredFeeToken(),
      totalLabel: writerMargin > 0n ? 'Estimated writer fill lock' : 'Estimated taker lock/value',
    });

    const lockFields = market && writerMargin > 0n
      ? this.appendMarketConfigWarningFields(baseLockFields, { market, size: amount, contractWriterMargin: writerMargin })
      : baseLockFields;

    const fields = this.appendFeeFields(lockFields, fee);

    this.openConfirmModal({
      title: quoteOnly ? 'Margin Option Fill Quote' : 'Accept margin option order',
      confirmLabel: quoteOnly ? 'Close' : 'Confirm & Sign',
      fields,
      confirmDisabled: quoteOnly,
      showConfirmButton: !quoteOnly,
    });
  }

  requestCancel(order: MarginOrder): void {
    this.pendingConfirmAction = async () => this.accountContract.cancelMarginOptionOrder({ orderBook: this.orderBookAddress, orderId: order.orderId });
    this.openConfirmModal({
      title: 'Cancel margin option order',
      confirmLabel: 'Cancel Order',
      fields: [
        { label: 'Action', value: 'Cancel margin option order' },
        { label: 'Order ID', value: order.orderId.toString() },
        { label: 'Intent', value: this.fmt.intentLabel(order.intent) },
      ],
    });
  }

  requestClaim(marketKey: string, size: bigint): void {
    if (size <= 0n) throw new Error('No holder size available');
    this.pendingConfirmAction = async () => this.accountContract.claimMarginOption({ marginContract: this.marginContractAddress, marketKey, size });
    this.openConfirmModal({
      title: 'Claim margin option payout',
      confirmLabel: 'Claim',
      fields: [
        { label: 'Market', value: marketKey },
        { label: 'Claim size', value: this.fmt.formatQuantity(size) },
      ],
    });
  }

  requestReclaim(marketKey: string, amount: bigint): void {
    this.pendingConfirmAction = async () => this.accountContract.reclaimWriterMarginOption({ marginContract: this.marginContractAddress, marketKey });
    this.openConfirmModal({
      title: 'Reclaim margin option writer margin',
      confirmLabel: 'Reclaim',
      fields: [
        { label: 'Market', value: marketKey },
        { label: 'Available writer margin', value: this.fmt.formatAmount(amount, ZERO) },
      ],
    });
  }
}
