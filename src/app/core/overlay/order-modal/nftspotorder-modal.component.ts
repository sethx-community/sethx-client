import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ethers } from 'ethers';

import { getContractAddress } from '../../../contracts/contract-registry';
import { ConfirmationField, RequirementRow } from '../../../core/modals/confirmation/confirmation-modal.component';
import { AccountContractService } from '../../../services/onchain/contracts/account-contract.service';
import { FeeManagerContractService, FeeOutput } from '../../../services/onchain/contracts/fee-manager-contract.service';
import { PortfolioService } from '../../../services/onchain/portfolio.service';
import { NftSpotOrderBookReadService } from '../../../services/onchain/contracts/nft-spot-orderbook-read.service';
import { ETH_ADDRESS } from '../../../services/shared/main.tokens';
import { NftSpotMarket, NftSpotOrder, NftSpotOrderbookStore } from '../../../services/shared/nft-spot-orderbook/nft-spot-orderbook.store';
import { TokenService } from '../../../services/shared/token.service';
import { TradeSettingsService } from '../../../services/shared/trade-settings.service';
import { TriggerService } from '../../../services/shared/trigger.service';
import { OrderReviewFlowComponent, buildOrderFlowRequirementRows } from '../../../shared/order-flow';
import { TransactionReceiptService } from '../../../shared/transaction-receipt';
import { NftSpotOrderModalData } from '../../../../types/order_flow/order-flow.types';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const NFT_SPOT_FEE_CONTEXT = 'ERC721 Spot Trade';
const DEFAULT_EXPIRY_DAYS = 30;

function norm(value: unknown): string {
  return String(value ?? '').trim().toLowerCase();
}

function isNativeFeeToken(value: unknown): boolean {
  const key = norm(value);
  return !key || key === 'eth' || key === norm(ETH_ADDRESS) || key === norm(ZERO_ADDRESS);
}

function feeTokenForContract(value: unknown): string {
  return isNativeFeeToken(value) ? ZERO_ADDRESS : String(value ?? '').trim();
}

function tokenKey(value: unknown): string {
  const key = norm(value);
  if (!key) return '';
  return isNativeFeeToken(key) ? norm(ETH_ADDRESS) : key;
}

function contractTokenKey(value: unknown): string {
  const key = norm(value);
  if (!key || key === norm(ZERO_ADDRESS)) return norm(ETH_ADDRESS);
  return key;
}

function shortAddress(address: string): string {
  const value = String(address ?? '');
  return value.length <= 12 ? value : `${value.slice(0, 6)}…${value.slice(-4)}`;
}

function formatDuration(seconds: bigint): string {
  if (seconds <= 0n) return 'Contract default';
  const days = seconds / 86400n;
  if (days >= 1n) return `${days.toString()} day${days === 1n ? '' : 's'}`;
  const hours = seconds / 3600n;
  if (hours >= 1n) return `${hours.toString()} hour${hours === 1n ? '' : 's'}`;
  const minutes = seconds / 60n;
  return `${minutes.toString()} minute${minutes === 1n ? '' : 's'}`;
}

@Component({
  selector: 'app-nftspot-order-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, OrderReviewFlowComponent],
  templateUrl: './nftspotorder-modal.component.html',
})
export class NftSpotOrderModalComponent implements OnInit {
  private readonly account = inject(AccountContractService);
  private readonly feeManager = inject(FeeManagerContractService);
  private readonly reads = inject(NftSpotOrderBookReadService);
  private readonly portfolio = inject(PortfolioService);
  private readonly tokens = inject(TokenService);
  private readonly nftSpotStore = inject(NftSpotOrderbookStore);
  private readonly settings = inject(TradeSettingsService);
  private readonly trigger = inject(TriggerService);
  readonly txReceipt = inject(TransactionReceiptService);

  @Input({ required: true }) data!: NftSpotOrderModalData;
  @Input() onClose?: (result?: unknown) => void;

  readonly orderBookAddress = getContractAddress('NFTSpotOrderBook');

  readonly side = signal<0 | 1>(0);
  readonly nftAddress = signal('');
  readonly tokenIdHuman = signal('');
  readonly quoteToken = signal('');
  readonly priceHuman = signal('');
  readonly expiryDays = signal(String(DEFAULT_EXPIRY_DAYS));
  readonly selectedMarketKey = signal('');

  readonly previewLoading = signal(false);
  readonly submitLoading = signal(false);
  readonly previewError = signal<string | null>(null);
  readonly submitError = signal<string | null>(null);
  readonly feeQuote = signal<FeeOutput | null>(null);
  readonly previewReady = signal(false);
  readonly reviewOpen = signal(false);

  readonly tokenList = this.tokens.list;
  readonly balances = this.portfolio.accountBalances;
  readonly marketOptions = computed(() => this.nftSpotStore.loadedMarkets());
  readonly selectedMarketOption = computed(() => {
    const key = this.selectedMarketKey();
    return key ? (this.marketOptions().find((market) => market.key === key) ?? null) : null;
  });
  readonly selectedOrder = computed(() => this.data?.order ?? null);
  readonly intent = computed(() => this.data?.intent ?? 'place');
  readonly isPlace = computed(() => this.intent() === 'place');
  readonly isQuote = computed(() => this.intent() === 'quote');
  readonly isAccept = computed(() => this.intent() === 'accept');
  readonly isCancel = computed(() => this.intent() === 'cancel');

  readonly quoteInfo = computed(() => this.tokens.getToken(this.quoteToken())());
  readonly quoteSymbol = computed(() => this.quoteInfo()?.symbol ?? shortAddress(this.quoteToken()));
  readonly quoteDecimals = computed(() => this.quoteInfo()?.decimals ?? 18);
  readonly modalTitle = computed(() => {
    if (this.isQuote()) return 'NFT Spot Fee Quote';
    if (this.isAccept()) return this.selectedOrder()?.side === 'ask' ? 'Buy NFT' : 'Sell NFT';
    if (this.isCancel()) return 'Cancel NFT Spot Order';
    return 'Place NFT Spot Order';
  });
  readonly confirmLabel = computed(() => {
    if (this.isQuote()) return 'Quote Only';
    if (this.isAccept()) return this.selectedOrder()?.side === 'ask' ? 'Confirm Buy' : 'Confirm Sell';
    if (this.isCancel()) return 'Confirm Cancel';
    return this.side() === 1 ? 'Place Ask' : 'Place Bid';
  });

  readonly parsedPrice = computed(() => {
    try {
      const price = this.isPlace() || this.isQuote() ? this.priceHuman() : ethers.formatUnits(this.selectedOrder()?.raw.price ?? 0n, this.quoteDecimals());
      if (!String(price).trim()) return 0n;
      return ethers.parseUnits(String(price), this.quoteDecimals());
    } catch {
      return 0n;
    }
  });

  readonly parsedTokenId = computed(() => {
    try {
      const input = this.isPlace() || this.isQuote() ? this.tokenIdHuman() : this.selectedOrder()?.raw.tokenId.toString();
      if (!String(input ?? '').trim()) return null;
      return BigInt(String(input));
    } catch {
      return null;
    }
  });

  readonly expirySeconds = computed(() => {
    try {
      const days = Number(this.expiryDays());
      if (!Number.isFinite(days) || days <= 0) return 0n;
      return BigInt(Math.floor(days * 86400));
    } catch {
      return 0n;
    }
  });

  readonly feeToken = computed(() => feeTokenForContract(this.settings.preferredFeeToken()));
  readonly feeTokenLabel = computed(() => isNativeFeeToken(this.feeToken()) ? 'ETH' : shortAddress(this.feeToken()));

  readonly validationError = computed(() => {
    if (this.isCancel()) {
      if (!this.selectedOrder()) return 'Select your NFT order first.';
      if (!this.selectedOrder()?.isMine) return 'Only your own order can be cancelled.';
      return null;
    }

    if (this.isAccept()) {
      const order = this.selectedOrder();
      if (!order) return 'Select an NFT order first.';
      if (order.isMine) return 'You cannot accept your own order.';
      if (order.acceptDisabledReason) return order.acceptDisabledReason;
      return null;
    }

    if (!ethers.isAddress(this.nftAddress())) return 'Enter a valid NFT contract address.';
    if (this.parsedTokenId() === null) return 'Enter a valid token ID.';
    if (!ethers.isAddress(this.quoteToken()) || isNativeFeeToken(this.quoteToken())) return 'Select or enter a valid ERC20 quote token.';
    if (this.parsedPrice() <= 0n) return 'Enter a valid price.';
    if (this.expirySeconds() <= 0n) return 'Enter a valid expiry period.';
    return null;
  });

  readonly fields = computed<ConfirmationField[]>(() => {
    const order = this.selectedOrder();
    const isDraft = this.isPlace() || this.isQuote();
    const sideLabel = isDraft ? (this.side() === 1 ? 'Ask / Sell NFT' : 'Bid / Buy NFT') : order?.side === 'ask' ? 'Ask / Buy NFT' : 'Bid / Sell NFT';
    const nft = isDraft ? this.nftAddress() : order?.raw.nft ?? '';
    const tokenId = isDraft ? this.tokenIdHuman() : order?.raw.tokenId.toString() ?? '';
    const quote = isDraft ? this.quoteToken() : order?.raw.quoteToken ?? '';
    const price = isDraft
      ? `${this.priceHuman() || '—'} ${this.quoteSymbol()}`
      : `${ethers.formatUnits(order?.raw.price ?? 0n, this.quoteDecimals())} ${this.quoteSymbol()}`;

    const fields: ConfirmationField[] = [
      { label: 'Action', value: this.modalTitle(), tone: 'system' },
      { label: 'Side', value: sideLabel },
      { label: 'NFT contract', value: nft || '—', tone: 'muted' },
      { label: 'Token ID', value: tokenId || '—' },
      { label: 'Quote token', value: quote || '—', tone: 'muted' },
      { label: 'Price', value: price },
      { label: 'Fee token', value: this.feeTokenLabel(), tone: 'system' },
    ];

    if (isDraft) {
      fields.push({ label: 'Order expiry', value: formatDuration(this.expirySeconds()) });
    } else if (order) {
      fields.push({ label: 'Order ID', value: order.id, tone: 'muted' });
      fields.push({ label: 'Maker', value: order.raw.user, tone: 'muted' });
    }

    const fee = this.feeQuote();
    if (this.isCancel()) {
      fields.push({ label: 'Fee quote', value: 'No new trade fee quote is needed for cancellation.', tone: 'system' });
    } else if (fee) {
      fields.push({ label: 'Fee context', value: NFT_SPOT_FEE_CONTEXT, tone: 'system' });
      fields.push({ label: 'Fixed fee', value: this.formatFeeAmount(fee.fixedAmount, fee.fixedToken), tone: 'system' });
      fields.push({ label: 'Percentage fee', value: this.formatFeeAmount(fee.percentageAmount, fee.percentageToken), tone: 'system' });
    } else {
      fields.push({ label: 'Fee quote', value: 'Click Preview / Quote before confirming.', tone: 'warn' });
    }

    return fields;
  });

  readonly requirements = computed<RequirementRow[]>(() => {
    const rows: RequirementRow[] = [];
    const fee = this.feeQuote();
    const order = this.selectedOrder();
    const price = this.parsedPrice();

    if (this.isCancel()) return rows;

    const fungibleRequirements: { tokenKey: string; label: string; raw: bigint }[] = [];
    const addFungible = (token: string, label: string, amount: bigint) => {
      if (amount > 0n) fungibleRequirements.push({ tokenKey: contractTokenKey(token), label, raw: amount });
    };

    if ((this.isPlace() || this.isQuote()) && this.side() === 1) {
      rows.push({
        tokenSymbol: 'NFT',
        tokenAddress: this.nftAddress(),
        available: 'Required in account vault',
        ok: true,
        totalRequired: `Token #${this.tokenIdHuman() || '—'}`,
        components: [{ label: 'NFT locked by ask', amount: '1 NFT' }],
      });
    } else if (((this.isPlace() || this.isQuote()) && this.side() === 0) || (this.isAccept() && order?.side === 'ask')) {
      const quoteToken = this.isPlace() || this.isQuote() ? this.quoteToken() : order?.raw.quoteToken ?? '';
      const quoteAmount = price || order?.raw.price || 0n;
      addFungible(quoteToken, this.isPlace() || this.isQuote() ? 'Bid lock' : 'Purchase price', quoteAmount);
    } else if (this.isAccept() && order?.side === 'bid') {
      rows.push({
        tokenSymbol: 'NFT',
        tokenAddress: order.raw.nft,
        available: 'Required in account vault',
        ok: !order.acceptDisabledReason,
        totalRequired: `Token #${order.raw.tokenId.toString()}`,
        components: [{ label: 'NFT sold into bid', amount: '1 NFT' }],
      });
    }

    if (fee?.fixedAmount && fee.fixedAmount > 0n) {
      addFungible(fee.fixedToken, 'Fixed fee lock', fee.fixedAmount);
    }

    if (fee?.percentageAmount && fee.percentageAmount > 0n) {
      addFungible(fee.percentageToken, 'Percentage fee lock', fee.percentageAmount);
    }

    return [
      ...rows,
      ...buildOrderFlowRequirementRows(fungibleRequirements, {
        normalizeTokenKey: (token) => tokenKey(token),
        displayTokenAddress: (key) => key === norm(ETH_ADDRESS) ? 'address(0)' : key,
        tokenSymbol: (key) => this.tokenSymbol(key),
        tokenDecimals: (key) => this.tokenDecimals(key),
        availableRaw: (key) => this.availableRaw(key),
      }),
    ];
  });

  readonly confirmDisabled = computed(() => {
    if (this.submitLoading() || this.previewLoading()) return true;
    if (this.validationError()) return true;
    if (!this.isCancel() && !this.previewReady()) return true;
    if (this.requirements().some((row) => !row.ok)) return true;
    if (this.isQuote()) return true;
    return false;
  });

  ngOnInit(): void {
    const order = this.data?.order ?? null;
    if (order) {
      this.side.set(order.side === 'ask' ? 1 : 0);
      this.nftAddress.set(order.raw.nft);
      this.tokenIdHuman.set(order.raw.tokenId.toString());
      this.quoteToken.set(order.raw.quoteToken);
      this.priceHuman.set(ethers.formatUnits(order.raw.price, this.quoteDecimals()));
      this.selectedMarketKey.set(order.marketKey);
    }

    if (this.isPlace() || this.isQuote()) {
      if (this.data.defaultSide === 0 || this.data.defaultSide === 1) this.side.set(this.data.defaultSide);
      if (this.data.defaultNft) this.nftAddress.set(this.data.defaultNft);
      if (this.data.defaultTokenId) this.tokenIdHuman.set(this.data.defaultTokenId);
      if (this.data.defaultQuoteToken) this.quoteToken.set(this.data.defaultQuoteToken);
      if (this.data.defaultPriceHuman) this.priceHuman.set(this.data.defaultPriceHuman);
      const defaultMarketKey = this.data.defaultMarketKey || this.matchingMarketKey();
      if (defaultMarketKey) this.selectedMarketKey.set(defaultMarketKey);
    }

    if (!this.quoteToken()) {
      const firstErc20 = this.tokenList().find((token) => !isNativeFeeToken(token.address));
      this.quoteToken.set(firstErc20?.address ?? '');
    }

    this.txReceipt.clear();

    if (this.isAccept()) {
      void this.preparePreview();
    }
    if (this.isCancel()) {
      this.previewReady.set(true);
      this.reviewOpen.set(true);
    }
  }

  selectSide(side: 0 | 1): void {
    this.side.set(side);
    this.markDirty();
  }

  onMarketSelected(key: string): void {
    this.selectedMarketKey.set(key);
    const market = this.marketOptions().find((option) => option.key === key) ?? null;
    if (market) this.applyMarketDefaults(market);
    this.markDirty();
  }

  onQuoteTokenSelected(value: string): void {
    this.quoteToken.set(value);
    this.selectedMarketKey.set(this.matchingMarketKey());
    this.previewReady.set(false);
    this.reviewOpen.set(false);
    this.feeQuote.set(null);
  }

  onNftAddressChanged(value: string): void {
    this.nftAddress.set(value);
    this.selectedMarketKey.set(this.matchingMarketKey());
    this.markDirty();
  }

  onTokenIdChanged(value: string): void {
    this.tokenIdHuman.set(value);
    this.selectedMarketKey.set(this.matchingMarketKey());
    this.markDirty();
  }

  markDirty(): void {
    this.previewReady.set(false);
    this.reviewOpen.set(false);
    this.feeQuote.set(null);
  }

  async preparePreview(): Promise<void> {
    this.previewError.set(null);
    this.submitError.set(null);
    this.previewReady.set(false);
    this.reviewOpen.set(false);
    this.feeQuote.set(null);

    const validation = this.validationError();
    if (validation) {
      this.previewError.set(validation);
      return;
    }

    if (this.isCancel()) {
      this.previewReady.set(true);
      this.reviewOpen.set(true);
      return;
    }

    this.previewLoading.set(true);
    try {
      const offeredToken = this.quoteTokenForFee();
      const offeredAmount = this.amountForFee();
      const order = this.selectedOrder();
      const isSeller = this.isSellerFeeExempt(order);
      const isMaker = !this.isAccept();
      const fee = isSeller
        ? { fixedAmount: 0n, fixedToken: this.feeToken(), percentageAmount: 0n, percentageToken: this.feeToken() }
        : await this.feeManager.getFeeForAccount(this.feeToken(), offeredToken, offeredAmount, NFT_SPOT_FEE_CONTEXT, String(this.settings.selectedAccountId?.() ?? ZERO_ADDRESS), isMaker);
      this.feeQuote.set(fee);
      this.previewReady.set(true);
      this.reviewOpen.set(true);
    } catch (error: any) {
      this.previewError.set(error?.reason ?? error?.shortMessage ?? error?.message ?? 'Could not quote NFT spot fees.');
    } finally {
      this.previewLoading.set(false);
    }
  }


  private isSellerFeeExempt(order?: any | null): boolean {
    // NFT sellers never pay protocol trading fees. For resting asks the selected account is the seller;
    // when accepting a bid, the taker is also the seller.
    if (this.isCancel() || this.isQuote()) return false;
    if (this.isAccept()) {
      const side = Number(order?.side ?? order?.raw?.side ?? -1);
      // Accepting a bid means the selected account is selling the NFT into buyer liquidity.
      return side === 0;
    }
    return Number(this.side()) === 1;
  }

  async confirm(): Promise<void> {
    if (this.confirmDisabled()) return;
    this.submitLoading.set(true);
    this.submitError.set(null);
    this.txReceipt.pending(this.modalTitle(), 'Waiting for wallet signature and on-chain confirmation...');

    try {
      let txHash: unknown;
      if (this.isCancel()) {
        const order = this.selectedOrder();
        if (!order) throw new Error('Select your NFT order first.');
        txHash = await this.account.cancelNFTSpotOrder({ orderBook: this.orderBookAddress, orderId: order.raw.orderId });
      } else if (this.isAccept()) {
        const order = this.selectedOrder();
        if (!order) throw new Error('Select an NFT order first.');
        txHash = await this.account.acceptNFTSpotOrder({ orderBook: this.orderBookAddress, makerOrderId: order.raw.orderId, feeToken: this.feeToken() });
      } else {
        if (this.isQuote()) throw new Error('Fee quote preview only; no NFT spot order was submitted.');
        const tokenId = this.parsedTokenId();
        if (tokenId === null) throw new Error('Enter a valid token ID.');
        txHash = await this.account.placeOrderNFTSpot({
          orderBook: this.orderBookAddress,
          feeToken: this.feeToken(),
          nft: this.nftAddress(),
          tokenId,
          quoteToken: this.quoteToken(),
          side: this.side(),
          price: this.parsedPrice(),
          expiry: BigInt(Math.floor(Date.now() / 1000)) + this.expirySeconds(),
        });
      }

      this.txReceipt.success('Transaction confirmed', typeof txHash === 'string' ? txHash : undefined, `${this.modalTitle()} completed.`);
      this.trigger.emitDomainEvent({ type: 'orderPlaced' });
      this.onClose?.({ ok: true });
    } catch (error: any) {
      const message = error?.reason ?? error?.shortMessage ?? error?.message ?? `${this.modalTitle()} failed.`;
      this.submitError.set(message);
      this.txReceipt.error('Transaction failed', error, message);
    } finally {
      this.submitLoading.set(false);
    }
  }

  closeReview(): void {
    if ((this.isPlace() || this.isQuote()) && !this.submitLoading()) {
      this.reviewOpen.set(false);
      return;
    }
    this.close();
  }

  close(): void {
    this.onClose?.();
  }

  private applyMarketDefaults(market: NftSpotMarket): void {
    this.nftAddress.set(market.collectionAddress);
    this.tokenIdHuman.set(market.tokenId);
    this.quoteToken.set(market.quoteToken);
  }

  private matchingMarketKey(): string {
    const nft = norm(this.nftAddress());
    const tokenId = String(this.tokenIdHuman() ?? '').trim();
    const quote = norm(this.quoteToken());
    if (!nft || !tokenId || !quote) return '';
    return this.marketOptions().find((market) =>
      norm(market.collectionAddress) === nft &&
      market.tokenId === tokenId &&
      norm(market.quoteToken) === quote
    )?.key ?? '';
  }

  private quoteTokenForFee(): string {
    const order = this.selectedOrder();
    if (this.isAccept() && order) return order.raw.quoteToken;
    return this.quoteToken();
  }

  private amountForFee(): bigint {
    const order = this.selectedOrder();
    if (this.isAccept() && order) return order.raw.price;
    return this.parsedPrice();
  }

  private tokenDecimals(token: string): number {
    return this.tokens.getToken(tokenKey(token))()?.decimals ?? 18;
  }

  private tokenSymbol(token: string): string {
    const key = tokenKey(token);
    return this.tokens.getToken(key)()?.symbol ?? (key === norm(ETH_ADDRESS) ? 'ETH' : shortAddress(key));
  }

  private availableRaw(token: string): bigint {
    const key = tokenKey(token);
    const balance = this.balances()?.[key];
    if (!balance) return 0n;
    return balance.balance - balance.locked;
  }

  private formatTokenAmount(token: string, amount: bigint): string {
    const key = tokenKey(token);
    return `${ethers.formatUnits(amount, this.tokenDecimals(key))} ${this.tokenSymbol(key)}`;
  }

  private formatFeeAmount(amount: bigint, token: string): string {
    return this.formatTokenAmount(contractTokenKey(token), amount);
  }
}
