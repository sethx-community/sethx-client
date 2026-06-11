import { Injectable, computed, inject, signal } from '@angular/core';
import { Contract, ethers } from 'ethers';
import { formatTokenAmount } from '../../../core/format/number-format';
import type { ConfirmationField, RequirementRow } from '../../../core/modals/confirmation/confirmation-modal.component';
import { AccountContractService } from '../../onchain/contracts/account-contract.service';
import { ContractRegistryService } from '../../../contracts/contract-registry.service';
import { TriggerService } from '../trigger.service';
import { BinaryOptionsReadService, BinaryOrder } from '../../onchain/contracts/binary-options-read.service';
import { BinaryOptionsOrderBookStore } from './binary-options-orderbook.store';
import { BinaryOptionsFormatService } from './binary-options-format.service';
import { FeeManagerContractService, FeeOutput } from '../../onchain/contracts/fee-manager-contract.service';
import { TradeSettingsService } from '../trade-settings.service';
import { PortfolioService } from '../../onchain/portfolio.service';
import { ETH_ADDRESS } from '../main.tokens';
import { norm } from '../../../core/tokens/token-normalize';
import { TransactionReceiptService } from '../../../shared/transaction-receipt';
import { WalletConnectService } from '../../../wallet/wallet-connect.service';
import { CONTRACT_ABIS } from '../../../contracts/generated';

const ONE_E18 = 10n ** 18n;
const ZERO_ADDRESS = ethers.ZeroAddress;
const BINARY_FEE_CONTEXT = 'Binary Option Trade';
type Status = 'idle' | 'pending' | 'success' | 'error';

type BinaryIntent = 0 | 1 | 2;

@Injectable({ providedIn: 'root' })
export class BinaryOptionsOrderBookActionsService {
  private readonly accountContract = inject(AccountContractService);
  private readonly contracts = inject(ContractRegistryService);
  private readonly trigger = inject(TriggerService);
  private readonly txReceipt = inject(TransactionReceiptService);
  private readonly store = inject(BinaryOptionsOrderBookStore);
  private readonly fmt = inject(BinaryOptionsFormatService);
  private readonly reads = inject(BinaryOptionsReadService);
  private readonly feeManager = inject(FeeManagerContractService);
  private readonly settings = inject(TradeSettingsService);
  private readonly portfolio = inject(PortfolioService);
  private readonly wallet = inject(WalletConnectService);

  private readonly orderBookAddress = this.contracts.getContractAddress('BinaryMarginOptionsOrderBook');
  private readonly binaryContractAddress = this.contracts.getContractAddress('BinaryMarginOptionContract');

  readonly preferredFeeToken = computed(() => {
    const pref = norm(this.settings.preferredFeeToken?.() ?? '');
    if (!pref || pref === norm(ETH_ADDRESS) || pref === 'eth' || pref === norm(ZERO_ADDRESS)) return ZERO_ADDRESS;
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
  private readonly _success = signal(false);
  readonly status = computed<Status>(() => this._pending() ? 'pending' : this.confirmError() ? 'error' : this._success() ? 'success' : 'idle');
  private pendingConfirmAction: null | (() => Promise<string | null | void>) = null;

  closeConfirmModal() {
    this.confirmOpen.set(false);
    this.confirmError.set(null);
    this.txReceipt.clear();
    this._pending.set(false);
    this._success.set(false);
    this.pendingConfirmAction = null;
    this.confirmShowConfirmButton.set(true);
  }

  private openConfirmModal(o: { title: string; confirmLabel: string; fields: ConfirmationField[]; requirements?: RequirementRow[] | null; confirmDisabled?: boolean; showConfirmButton?: boolean }) {
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

  async onConfirmModalConfirm() {
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
      const message = e?.reason ?? e?.shortMessage ?? e?.message ?? 'Transaction failed';
      this.confirmError.set(message);
      this.txReceipt.error('Transaction failed', e, message);
      this._pending.set(false);
    }
  }

  private async quoteBinaryFee(assetValue: bigint, account?: string, isMaker = true): Promise<FeeOutput | null> {
    if (assetValue <= 0n) return null;
    return this.feeManager.getFeeForAccount(
      this.preferredFeeToken(),
      ZERO_ADDRESS,
      assetValue,
      BINARY_FEE_CONTEXT,
      account && ethers.isAddress(account) ? account : ethers.ZeroAddress,
      isMaker,
    );
  }

  private formatFeeToken(token: string | null | undefined): string {
    const t = norm(token ?? '');
    return !t || t === norm(ZERO_ADDRESS) || t === norm(ETH_ADDRESS) ? 'ETH' : String(token);
  }

  private ethAvailableRaw(): bigint {
    const balances = this.portfolio.accountBalances?.() ?? {};
    const eth = balances[norm(ETH_ADDRESS)] ?? balances[norm(ZERO_ADDRESS)];
    if (!eth) return 0n;
    return eth.balance - eth.locked;
  }

  private buildEthRequirement(label: string, baseLockRaw: bigint, fee: FeeOutput | null, includeTradeLock = true): RequirementRow[] {
    const comps: { label: 'Premium lock' | 'Writer margin lock' | 'Fixed fee lock' | 'Percentage fee lock'; raw: bigint }[] = [];
    if (includeTradeLock && baseLockRaw > 0n) comps.push({ label: label === 'Writer margin lock' ? 'Writer margin lock' : 'Premium lock', raw: baseLockRaw });
    if (fee?.fixedAmount && fee.fixedAmount > 0n && norm(fee.fixedToken) === norm(ZERO_ADDRESS)) comps.push({ label: 'Fixed fee lock', raw: fee.fixedAmount });
    if (fee?.percentageAmount && fee.percentageAmount > 0n && norm(fee.percentageToken) === norm(ZERO_ADDRESS)) comps.push({ label: 'Percentage fee lock', raw: fee.percentageAmount });
    const total = comps.reduce((sum, c) => sum + c.raw, 0n);
    const available = this.ethAvailableRaw();
    const fmt = (raw: bigint) => formatTokenAmount(raw, 18, 'ETH', { maxDecimals: 6, compactFrom: 1_000_000 });
    return [{
      tokenSymbol: 'ETH',
      tokenAddress: 'address(0)',
      available: fmt(available),
      ok: available >= total,
      totalRequired: fmt(total),
      components: comps.map((c) => ({ label: c.label, amount: fmt(c.raw), raw: c.raw.toString() })),
      requiredRaw: total.toString(),
      availableRaw: available.toString(),
      decimals: 18,
    }];
  }

  private appendFeeFields(fields: ConfirmationField[], fee: FeeOutput | null): ConfirmationField[] {
    const next: ConfirmationField[] = [...fields, { label: 'Fee context', value: BINARY_FEE_CONTEXT, tone: 'system' }];
    if (!fee) {
      next.push({ label: 'Fee quote', value: 'FeeManager quote unavailable.', tone: 'warn' });
      return next;
    }
    next.push({ label: 'Fee token', value: this.formatFeeToken(this.preferredFeeToken()), tone: 'system' });
    next.push({ label: 'Fixed fee', value: `${this.fmt.formatEth(fee.fixedAmount)} ${this.formatFeeToken(fee.fixedToken)}`, tone: 'system' });
    next.push({ label: 'Percentage fee', value: `${this.fmt.formatEth(fee.percentageAmount)} ${this.formatFeeToken(fee.percentageToken)}`, tone: 'system' });
    return next;
  }

  private intentLabel(intent: number): string {
    if (intent === 0) return 'Buy payout (bid)';
    if (intent === 1) return 'Sell holder payout (ask)';
    return 'Write payout (ask)';
  }

  private premiumRaw(payoutAmount: bigint, askPrice: bigint): bigint {
    return (payoutAmount * askPrice) / ONE_E18;
  }

  private feePayingLock(intent: number, payoutAmount: bigint, askPrice: bigint): bigint {
    // Binary fee follows the same principle as Options: the premium payer pays fixed + percentage fee.
    // Maker BUY pays premium immediately. Maker SELL_HOLDER / WRITE does not pay premium on placement.
    return intent === 0 ? this.premiumRaw(payoutAmount, askPrice) : 0n;
  }


  async requestCreateMarket(args: { ticker: string; optionType: number; oracle: string; strikePriceHuman: string; marketExpiry: bigint }): Promise<void> {
    const ticker = String(args.ticker ?? '').trim();
    if (!ticker) throw new Error('Enter a market ticker.');
    if (![0, 1].includes(Number(args.optionType))) throw new Error('Select Above or Below.');
    if (!ethers.isAddress(args.oracle)) throw new Error('Enter a valid approved oracle address.');
    const strikePrice = ethers.parseUnits(String(args.strikePriceHuman ?? '0').replace(',', '.'), 18);
    if (strikePrice <= 0n) throw new Error('Enter a strike price.');
    if (!args.marketExpiry || args.marketExpiry <= 0n) throw new Error('Select a valid market expiry.');

    this.pendingConfirmAction = async () => {
      const provider = await this.wallet.getEthersProvider();
      if (!provider) throw new Error('Wallet provider is not connected.');
      const signer = await provider.getSigner?.().catch(() => null);
      if (!signer) throw new Error('No wallet signer available.');
      const contract = new Contract(this.binaryContractAddress, CONTRACT_ABIS.BinaryMarginOptionContract, signer) as any;
      const tx = await contract['createMarket'](
        ticker,
        Number(args.optionType),
        ethers.getAddress(args.oracle),
        strikePrice,
        args.marketExpiry,
      );
      const receipt = await tx.wait();
      return receipt?.hash ?? tx.hash ?? null;
    };

    this.openConfirmModal({
      title: 'Create binary option market',
      confirmLabel: 'Create Market',
      showConfirmButton: true,
      fields: [
        { label: 'Ticker', value: ticker },
        { label: 'Condition', value: Number(args.optionType) === 0 ? 'Above' : 'Below' },
        { label: 'Oracle', value: ethers.getAddress(args.oracle) },
        { label: 'Strike', value: args.strikePriceHuman },
        { label: 'Market expiry', value: new Date(Number(args.marketExpiry) * 1000).toLocaleString() },
      ],
    });
  }

  async requestPlace(args: { marketKey: string; intent: number; payoutHuman: string; priceHuman: string; expiryPreset: 'default' | '1h' | '1d' | '7d' | 'max' | 'custom'; customExpiryUnix?: bigint | null; quoteOnly?: boolean }) {
    const marketKey = String(args.marketKey ?? '').toLowerCase();
    if (!marketKey) throw new Error('Select an existing binary market.');
    const payoutAmount = ethers.parseEther(String(args.payoutHuman ?? '0').replace(',', '.'));
    if (payoutAmount <= 0n) throw new Error('Enter a payout amount');
    const askPrice = ethers.parseEther(String(args.priceHuman ?? '0').replace(',', '.'));
    if (askPrice <= 0n) throw new Error('Enter a premium price');
    if (askPrice > ONE_E18) throw new Error('Premium price cannot exceed 1 ETH per 1 ETH payout');
    const intent = Number(args.intent) as BinaryIntent;
    if (![0, 1, 2].includes(intent)) throw new Error('Unsupported binary order intent');

    const market = marketKey ? (this.store.activeMarkets().find((m) => m.marketKey === marketKey)?.market
      ?? this.store.selectedMarket()?.market
      ?? await this.reads.getMarket(marketKey)) : null;
    const now = await this.reads.latestTimestamp();
    const marketExpiry = market?.expiry ?? 0n;
    const offset = args.expiryPreset === '1h' ? 3600n : args.expiryPreset === '1d' ? 86400n : args.expiryPreset === '7d' ? 604800n : 0n;
    let expiry = offset > 0n ? now + offset : 0n;
    if (args.expiryPreset === 'max') expiry = marketExpiry;
    if (args.expiryPreset === 'custom') expiry = args.customExpiryUnix ?? 0n;
    const disabledByExpiry = expiry !== 0n && marketExpiry !== 0n && expiry > marketExpiry;
    const disabledByPastExpiry = expiry !== 0n && expiry <= now;

    const premium = this.premiumRaw(payoutAmount, askPrice);
    const economicLockRaw = intent === 0 ? premium : intent === 2 ? payoutAmount : 0n;
    const economicLockLabel = intent === 0 ? 'Premium lock' : intent === 2 ? 'Writer margin lock' : 'Holder payout reserved';
    const feeBaseRaw = this.feePayingLock(intent, payoutAmount, askPrice);
    const fee = feeBaseRaw > 0n ? await this.quoteBinaryFee(feeBaseRaw) : null;
    const requirements = intent === 0 || intent === 2 ? this.buildEthRequirement(economicLockLabel, economicLockRaw, fee, true) : null;
    const insufficient = !!requirements?.some((r) => !r.ok);
    const disabled = !!args.quoteOnly || disabledByExpiry || disabledByPastExpiry || insufficient;

    this.pendingConfirmAction = disabled ? null : async () => {
      return await this.accountContract.placeOrderBinaryMarginOption({
        orderBook: this.orderBookAddress,
        marketKey,
        intent,
        payoutAmount,
        askPrice,
        expiry,
        feeToken: this.preferredFeeToken(),
      });
    };

    const baseFields: ConfirmationField[] = args.quoteOnly
      ? [
          { label: 'Fee quote for', value: this.intentLabel(intent) },
          { label: 'Payout amount', value: this.fmt.formatEth(payoutAmount) },
          { label: 'Premium value', value: this.fmt.formatEth(premium) },
          { label: economicLockLabel, value: intent === 1 ? this.fmt.formatEth(payoutAmount) : this.fmt.formatEth(economicLockRaw) },
          { label: 'Payment token', value: 'ETH' },
        ]
      : [
          { label: 'Action', value: this.intentLabel(intent) },
          { label: 'Market', value: market ? `${this.fmt.condition(market.optionType, this.fmt.tokenLabel(market.baseToken), market.strikePrice)} · ${marketKey}` : `Binary market · ${marketKey}` },
          { label: 'Payout amount', value: this.fmt.formatEth(payoutAmount) },
          { label: 'Premium price', value: this.fmt.formatProbability(askPrice) },
          { label: 'Premium value', value: this.fmt.formatEth(premium) },
          { label: economicLockLabel, value: intent === 1 ? this.fmt.formatEth(payoutAmount) : this.fmt.formatEth(economicLockRaw) },
          { label: 'Payment token', value: 'ETH' },
          { label: 'Order expiry', value: expiry === 0n ? 'No extra order expiry; market expiry still applies' : new Date(Number(expiry) * 1000).toLocaleString() },
          { label: 'Settlement rule', value: 'Above uses > strike. Below uses < strike. Equal does not pay holders.' },
        ];
    const fields = this.appendFeeFields(baseFields, fee);

    this.openConfirmModal({
      title: args.quoteOnly ? 'Binary Option Fee Quote' : 'Place binary option order',
      confirmLabel: args.quoteOnly ? 'Close' : 'Confirm & Sign',
      confirmDisabled: disabled,
      showConfirmButton: !args.quoteOnly,
      requirements,
      fields,
    });
    if (disabledByExpiry) this.confirmError.set('Order expiry cannot be after the binary market expiry.');
    else if (disabledByPastExpiry) this.confirmError.set('Order expiry must be in the future.');
    else if (insufficient) this.confirmError.set('Action required: deposit enough ETH to cover locked amount and fees.');
  }

  async requestFill(order: BinaryOrder, marketKey: string, quoteOnly = false) {
    const market = this.store.activeMarkets().find((m) => m.marketKey === String(marketKey ?? '').toLowerCase())?.market ?? null;
    const human = this.store.fillAmountByOrderId(order.orderId);
    let payoutAmount = ethers.parseEther(String(human ?? '0').replace(',', '.'));
    if (payoutAmount <= 0n) throw new Error('Enter a payout amount');
    if (payoutAmount > order.payoutAmount) payoutAmount = order.payoutAmount;
    const premium = this.premiumRaw(payoutAmount, order.askPrice);
    const makerIntent = Number(order.intent ?? 0);
    const takerPaysPremium = makerIntent !== 0;
    const takerAction = makerIntent === 0 ? 'Sell/write payout' : 'Buy payout';
    const takerLockRaw = makerIntent === 0 ? payoutAmount : premium;
    const lockLabel = makerIntent === 0 ? 'Writer margin / holder payout lock' : 'Premium lock';
    const fee = takerPaysPremium ? await this.quoteBinaryFee(premium) : null;
    const requirements = this.buildEthRequirement(lockLabel === 'Premium lock' ? 'Premium lock' : 'Writer margin lock', takerLockRaw, fee, true);
    const insufficient = requirements.some((r) => !r.ok);

    this.pendingConfirmAction = quoteOnly || insufficient ? null : async () => {
      return await this.accountContract.acceptBinaryMarginOptionOrder({
        orderBook: this.orderBookAddress,
        makerOrderId: order.orderId,
        payoutAmount,
        feeToken: takerPaysPremium ? this.preferredFeeToken() : ZERO_ADDRESS,
      });
    };
    const fields = this.appendFeeFields([
      { label: 'Action', value: takerAction },
      { label: 'Order ID', value: order.orderId.toString() },
      { label: 'Market', value: market ? `${this.fmt.condition(market.optionType, this.fmt.tokenLabel(market.baseToken), market.strikePrice)} · ${marketKey}` : `Binary market · ${marketKey}` },
      { label: 'Payout amount', value: this.fmt.formatEth(payoutAmount) },
      { label: 'Premium price', value: this.fmt.formatProbability(order.askPrice) },
      { label: makerIntent === 0 ? 'You receive premium' : 'You pay premium', value: this.fmt.formatEth(premium) },
      { label: makerIntent === 0 ? 'You provide payout/writer margin' : 'Max payout', value: this.fmt.formatEth(payoutAmount) },
      { label: 'Payment token', value: 'ETH' },
    ], fee);
    this.openConfirmModal({
      title: quoteOnly ? 'Binary Accept Fee Quote' : 'Accept binary option order',
      confirmLabel: 'Confirm & Sign',
      fields,
      requirements,
      confirmDisabled: quoteOnly || insufficient,
    });
    if (insufficient) this.confirmError.set('Action required: deposit enough ETH to cover locked amount and fees.');
  }

  requestCancel(order: BinaryOrder) {
    this.pendingConfirmAction = async () => {
      return await this.accountContract.cancelBinaryMarginOptionOrder({ orderBook: this.orderBookAddress, orderId: order.orderId });
    };
    this.openConfirmModal({
      title: 'Cancel binary option order',
      confirmLabel: 'Cancel Order',
      fields: [
        { label: 'Order ID', value: order.orderId.toString() },
        { label: 'Remaining payout', value: this.fmt.formatEth(order.payoutAmount) },
        { label: 'Premium price', value: this.fmt.formatProbability(order.askPrice) },
        { label: 'Fee handling', value: 'Locked maker fees are released according to the orderbook cancel rules.', tone: 'system' },
      ],
    });
  }

  requestClaim(marketKey: string, payoutAmount: bigint, label = 'Claim payout') {
    const market = this.store.activeMarkets().find((m) => m.marketKey === String(marketKey ?? '').toLowerCase())?.market ?? null;
    this.pendingConfirmAction = async () => await this.accountContract.claimBinaryMarginOption({ binaryContract: this.binaryContractAddress, marketKey, payoutAmount });
    this.openConfirmModal({
      title: label === 'Clear position' ? 'Clear binary holder position' : 'Claim binary option payout',
      confirmLabel: label,
      fields: [
        { label: 'Market', value: market ? `${this.fmt.condition(market.optionType, this.fmt.tokenLabel(market.baseToken), market.strikePrice)} · ${marketKey}` : `Binary market · ${marketKey}` },
        { label: label === 'Clear position' ? 'Holder payout to clear' : 'Claim amount', value: this.fmt.formatEth(payoutAmount) },
        { label: 'Settlement rule', value: 'Above requires settlement price > strike. Below requires settlement price < strike. Equal does not pay.' },
        { label: 'Note', value: label === 'Clear position' ? 'This clears an out-of-the-money/equal holder position with zero ETH payout.' : 'This claims the winning binary payout in ETH.' },
      ],
    });
  }

  requestReclaim(marketKey: string, amount: bigint) {
    const market = this.store.activeMarkets().find((m) => m.marketKey === String(marketKey ?? '').toLowerCase())?.market ?? null;
    this.pendingConfirmAction = async () => await this.accountContract.reclaimWriterBinaryMarginOption({ binaryContract: this.binaryContractAddress, marketKey });
    this.openConfirmModal({
      title: 'Reclaim binary writer margin',
      confirmLabel: 'Reclaim',
      fields: [
        { label: 'Market', value: market ? `${this.fmt.condition(market.optionType, this.fmt.tokenLabel(market.baseToken), market.strikePrice)} · ${marketKey}` : `Binary market · ${marketKey}` },
        { label: 'Available writer margin', value: this.fmt.formatEth(amount) },
      ],
    });
  }
}
