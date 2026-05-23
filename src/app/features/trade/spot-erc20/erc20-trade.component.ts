import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ethers } from 'ethers';
import { OrderBookFacade } from '../../../services/shared/orderbook/orderbook.facade';
import { ConfirmationModalComponent } from '../../../core/modals/confirmation/confirmation-modal.component';
import {
  OrderbookSelectionService,
  type SharedOrderSelection,
  MarketDetailPanelComponent,
  type MarketDetailItem,
  SpotSummaryHeaderComponent,
  type SpotSummaryMetric,
} from '../../../shared/orderbook';
import type {
  LadderRow,
  LadderPairRow,
  Book,
} from '../../../services/shared/orderbook/orderbook.store';
import type { SpotOrder } from '../../../services/onchain/contracts/token-spot-orderbook-read.service';
import { OrderFlowService } from '../../../core/overlay/order-flow.service';
import { SpotOrderModalComponent } from '../../../core/overlay/order-modal/spotorder-modal.component';
import { DepositWithdrawModalComponent } from '../../../core/overlay/deposit-withdraw/deposit-withdraw-modal.component';
import { TradeSettingsService } from '../../../services/shared/trade-settings.service';
import { PortfolioService } from '../../../services/onchain/portfolio.service';
import { TokenPriceService } from '../../../services/shared/token-price.service';
import {
  TokenService,
  type TokenInfo,
} from '../../../services/shared/token.service';
import { AccountsChainService } from '../../../services/onchain/accounts.service';
import { ETH_ADDRESS } from '../../../services/shared/main.tokens';

const NATIVE_SENTINEL = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

@Component({
  selector: 'app-erc20-trade',
  standalone: true,
  imports: [
    CommonModule,
    ConfirmationModalComponent,
    MarketDetailPanelComponent,
    SpotSummaryHeaderComponent,
  ],
  templateUrl: './erc20-trade.component.html',
})
export class Erc20TradeComponent {
  readonly ob = inject(OrderBookFacade);
  readonly orderSelection = inject(OrderbookSelectionService);
  private readonly flow = inject(OrderFlowService);
  private readonly settings = inject(TradeSettingsService);
  private readonly portfolio = inject(PortfolioService);
  private readonly prices = inject(TokenPriceService);
  private readonly tokens = inject(TokenService);
  private readonly accounts = inject(AccountsChainService);
  private readonly route = inject(ActivatedRoute);

  // UI only: books list vs selected book ladder
  readonly view = signal<'books' | 'orders' | 'tokens' | 'my-orders'>('books');
  readonly hoveredBook = signal<Book | null>(null);
  readonly pinnedBook = signal<Book | null>(null);
  readonly hoveredOrder = signal<LadderRow | null>(null);
  constructor() {
    this.route.queryParamMap.subscribe((params) => {
      const requestedView = params.get('tokenSpotView');
      if (requestedView === 'tokens' || requestedView === 'my-tokens') {
        this.openMyTokens();
      } else if (requestedView === 'orders' || requestedView === 'my-orders') {
        this.openMyOrders();
      }
    });
  }

  readonly selectedSpotOrder = computed(() => {
    const s = this.orderSelection.selected();
    return s?.product === 'spot' ? s : null;
  });

  readonly showTokenUSD = signal(true);
  readonly accountBalances = this.portfolio.accountBalances;
  readonly portfolioStatus = this.portfolio.readStatus;
  readonly portfolioError = this.portfolio.readError;
  readonly lastRefreshedAt = this.portfolio.lastRefreshedAt;
  readonly mainTokens = this.tokens.main;
  readonly whitelistTokens = this.tokens.whitelist;
  readonly otherTokens = this.tokens.other;

  readonly isLoading = computed(() => this.portfolioStatus() === 'pending');

  readonly selectedAccountLabel = computed(() => {
    const account = this.settings.selectedAccountId();
    return account
      ? this.accounts.accountLabel(account)
      : 'No account selected';
  });

  readonly trackedTokenCount = computed(
    () =>
      this.mainTokens().length +
      this.whitelistTokens().length +
      this.otherTokens().length,
  );

  readonly balanceEntryCount = computed(
    () => Object.keys(this.accountBalances() ?? {}).length,
  );

  readonly myTokenCount = computed(() => {
    const balances = this.accountBalances() ?? {};
    return Object.values(balances).filter((entry: any) => {
      const balance = BigInt(entry?.balance ?? 0);
      const locked = BigInt(entry?.locked ?? 0);
      return balance > 0n || locked > 0n;
    }).length;
  });

  readonly tokenHoldingsMetrics = computed<SpotSummaryMetric[]>(() => [
    { label: 'Tracked tokens', value: this.trackedTokenCount() },
    { label: 'Balance rows', value: this.balanceEntryCount() },
    { label: 'Account', value: this.selectedAccountLabel(), tone: 'muted' },
    { label: 'Last refresh', value: this.lastRefreshedText(), tone: 'muted' },
  ]);

  readonly tokenPrices = (addr: string) => this.prices.tokenPrices(addr);

  readonly selectedBookMetrics = computed<SpotSummaryMetric[]>(() => {
    const book = this.ob.selectedBook();
    return [
      {
        label: 'Best Bid',
        value: this.ob.bestBid()
          ? this.ob.formatPrice(this.ob.bestBid()!.order)
          : '—',
        tone: 'up',
      },
      {
        label: 'Best Ask',
        value: this.ob.bestAsk()
          ? this.ob.formatPrice(this.ob.bestAsk()!.order)
          : '—',
        tone: 'down',
      },
      {
        label: 'Spread',
        value:
          this.ob.bestBid() && this.ob.bestAsk() && this.ob.spreadP18() !== null
            ? this.ob.formatPriceP18(this.ob.spreadP18())
            : '—',
      },
      { label: 'Orders', value: book?.total ?? '—' },
      {
        label: 'My Orders',
        value: this.ob.supportsMyTotals() ? (book?.myTotal ?? 0) : '—',
      },
    ];
  });

  readonly booksMetrics = computed<SpotSummaryMetric[]>(() => [
    { label: 'Markets', value: this.ob.visibleBooks().length },
    { label: 'My Tokens', value: this.myTokenCount() },
    { label: 'My orders', value: this.ob.myOrders().length },
    {
      label: 'Filtered',
      value: this.ob.booksWithMyOrdersOnly() ? 'My orders only' : 'All markets',
      tone: 'muted',
    },
  ]);

  readonly myOrdersMetrics = computed<SpotSummaryMetric[]>(() => [
    { label: 'My orders', value: this.ob.myOrders().length },
    { label: 'Account', value: this.selectedAccountLabel(), tone: 'muted' },
    {
      label: 'Status',
      value: this.ob.loadingMyOrders() ? 'Loading' : 'Ready',
      tone: 'muted',
    },
  ]);

  openFeeQuote(): void {
    const book = this.ob.selectedBook();
    this.flow.open(SpotOrderModalComponent, {
      intent: 'quote',
      defaultBaseToken: book?.base,
      defaultQuoteToken: book?.quote,
    });
  }

  openPlaceOrder(): void {
    const book = this.ob.selectedBook();
    this.flow.open(SpotOrderModalComponent, {
      intent: 'place',
      defaultBaseToken: book?.base,
      defaultQuoteToken: book?.quote,
    });
  }

  readonly bookDetailItems = computed<MarketDetailItem[]>(() => {
    const b = this.pinnedBook() ?? this.hoveredBook();
    return b ? this.bookDetailItemsFor(b) : [];
  });

  isBookDetailOpen(book: Book): boolean {
    return this.pinnedBook()?.key === book.key || this.hoveredBook()?.key === book.key;
  }

  bookDetailItemsFor(b: Book): MarketDetailItem[] {
    return [
      { label: 'Pair', value: this.ob.pairLabel(b) },
      { label: 'Orders', value: b.total?.toString?.() ?? b.total },
      { label: 'My orders', value: b.myTotal?.toString?.() ?? b.myTotal },
      {
        label: 'Base',
        value: b.base,
        mono: true,
        copyable: true,
        fullWidth: true,
      },
      {
        label: 'Quote',
        value: b.quote,
        mono: true,
        copyable: true,
        fullWidth: true,
      },
      {
        label: 'Book key',
        value: b.key,
        mono: true,
        copyable: true,
        fullWidth: true,
      },
    ];
  }

  openBook(b: { key: string }) {
    this.orderSelection.clear('spot');
    this.ob.openBook(b.key); // sets selectedBookKey; orders resource reruns
    this.view.set('orders');
  }

  backToBooks() {
    this.orderSelection.clear('spot');
    this.ob.closeBook(); // clears selectedBookKey
    this.view.set('books');
  }

  openMyTokens(): void {
    this.orderSelection.clear('spot');
    this.view.set('tokens');
  }

  openMyOrders(): void {
    this.orderSelection.clear('spot');
    this.ob.closeBook();
    this.view.set('my-orders');
  }

  booksPageLabel(): string {
    const limit = Math.max(1, Number(this.ob.bookLimit() || 25));
    return String(Math.floor(Number(this.ob.bookOffset() || 0) / limit) + 1);
  }

  previousBooksPage(): void {
    const limit = Math.max(1, Number(this.ob.bookLimit() || 25));
    this.ob.setBookOffset(
      Math.max(0, Number(this.ob.bookOffset() || 0) - limit),
    );
  }

  nextBooksPage(): void {
    const limit = Math.max(1, Number(this.ob.bookLimit() || 25));
    this.ob.setBookOffset(Number(this.ob.bookOffset() || 0) + limit);
  }

  showBookInfo(b: Book, event?: Event): void {
    event?.stopPropagation();
    this.pinnedBook.set(this.pinnedBook()?.key === b.key ? null : b);
  }

  selectOrder(row: LadderRow | undefined | null, event?: Event): void {
    event?.stopPropagation();
    if (!row) return;
    const selection: SharedOrderSelection = {
      product: 'spot',
      marketKey: this.ob.selectedBook()?.key ?? null,
      orderId: row.orderId.toString(),
      side: row.side,
      isMine: row.isMine,
      order: row.order,
    };
    this.orderSelection.selectOrToggle(selection);
  }

  isSelected(row: LadderRow | undefined | null): boolean {
    return !!row && this.orderSelection.isSelected('spot', row.orderId);
  }

  onOrderHover(row: LadderRow | undefined | null): void {
    if (!row) return;
    this.hoveredOrder.set(row);
  }

  clearOrderHover(): void {
    this.hoveredOrder.set(null);
  }

  displayedOrderForRow(row: LadderPairRow): LadderRow | null {
    if (row.bid && this.isSelected(row.bid)) return row.bid;
    if (row.ask && this.isSelected(row.ask)) return row.ask;
    const hovered = this.hoveredOrder();
    if (hovered && (hovered === row.bid || hovered === row.ask)) return hovered;
    return null;
  }

  ladderOrderDetailItems(
    row: LadderRow | null | undefined,
  ): MarketDetailItem[] {
    if (!row) return [];
    return this.orderDetailItems(
      row.order,
      row.orderId.toString(),
      row.side,
      row.isMine,
    );
  }

  selectMyOrder(order: SpotOrder, event?: Event): void {
    event?.stopPropagation();
    const selection: SharedOrderSelection = {
      product: 'spot',
      marketKey: this.orderPairLabel(order),
      orderId: order.orderId.toString(),
      side: this.orderSideLabel(order),
      isMine: true,
      order,
    };
    this.orderSelection.selectOrToggle(selection);
  }

  isMyOrderSelected(order: SpotOrder): boolean {
    return this.orderSelection.isSelected('spot', order.orderId);
  }

  orderSideLabel(order: SpotOrder | null | undefined): 'buy' | 'sell' {
    return order?.side === 0 ? 'buy' : 'sell';
  }

  orderPairLabel(order: SpotOrder | null | undefined): string {
    if (!order) return '—';
    return `${this.ob.tokenLabel(order.baseToken)}/${this.ob.tokenLabel(order.quoteToken)}`;
  }

  selectedOrderDetailItems(): MarketDetailItem[] {
    const selected = this.selectedSpotOrder();
    if (!selected) return [];
    const order = selected.order as SpotOrder;
    const side = selected.side ?? this.orderSideLabel(order);
    return this.orderDetailItems(
      order,
      selected.orderId,
      side,
      selected.isMine,
    );
  }

  private orderDetailItems(
    order: SpotOrder,
    orderId: string,
    side: string,
    isMine: boolean,
  ): MarketDetailItem[] {
    return [
      { label: 'orderId', value: orderId, mono: true },
      { label: 'side', value: side },
      { label: 'owner', value: isMine ? 'Active account' : 'Other account' },
      {
        label: 'maker',
        value: order.user,
        mono: true,
        copyable: true,
        fullWidth: true,
      },
      { label: 'pair', value: this.orderPairLabel(order) },
      { label: 'remaining', value: this.ob.formatAmount(order) },
      { label: 'price', value: this.ob.formatPrice(order) },
      { label: 'expiry', value: this.ob.formatExpiry(order.expiry) },
      {
        label: 'base',
        value: order.baseToken,
        mono: true,
        copyable: true,
        fullWidth: true,
      },
      {
        label: 'quote',
        value: order.quoteToken,
        mono: true,
        copyable: true,
        fullWidth: true,
      },
    ];
  }

  private normKey(addr: string): string {
    const a = (addr ?? '').trim().toLowerCase();
    if (a === 'eth' || a === NATIVE_SENTINEL) return ETH_ADDRESS.toLowerCase();
    return a;
  }

  openTokenAction(token: TokenInfo, intent: 'deposit' | 'withdraw'): void {
    this.flow.open(DepositWithdrawModalComponent, {
      intent,
      asset: token.address === ETH_ADDRESS.toLowerCase() ? 'ETH' : 'TOKEN',
      tokenAddress: token.address,
      tokenSymbol: token.symbol,
      tokenDecimals: token.decimals,
    });
  }

  actionLabel(intent: 'deposit' | 'withdraw', token: TokenInfo): string {
    return `${intent === 'deposit' ? 'Deposit' : 'Withdraw'} ${token.symbol}`;
  }

  toggleTokenValueView(): void {
    this.showTokenUSD.update((v) => !v);
  }

  refreshBalances(): void {
    this.portfolio.refreshPortfolio();
  }

  lastRefreshedText(): string {
    const at = this.lastRefreshedAt();
    return at ? at.toLocaleTimeString() : 'Not refreshed yet';
  }

  private getOraclePrice(tokenAddress: string): number {
    const info = this.tokenPrices(tokenAddress)();
    const p = info?.prices?.oracle?.price || 0;
    return Number.isFinite(p) ? p : 0;
  }

  formatValue(amount: string, price?: number | null): string {
    const amt = Number(amount);
    if (!Number.isFinite(amt)) return '—';
    if (this.showTokenUSD() && price != null)
      return '$' + (amt * price).toFixed(2);
    return amt.toFixed(4);
  }

  getFormattedTokenValue(tokenAddress: string, decimals = 18): string {
    const balances = this.accountBalances();
    const key = this.normKey(tokenAddress);
    const entry = balances?.[key];
    const raw = entry?.balance ?? 0n;
    const price = this.getOraclePrice(tokenAddress);
    const human = ethers.formatUnits(raw, decimals);
    return this.formatValue(human, price);
  }

  getFormattedLockedValue(tokenAddress: string, decimals = 18): string {
    const balances = this.accountBalances();
    const key = this.normKey(tokenAddress);
    const entry = balances?.[key];
    const raw = entry?.locked ?? 0n;
    const price = this.getOraclePrice(tokenAddress);
    const human = ethers.formatUnits(raw, decimals);
    return this.formatValue(human, price);
  }

  getFormattedAvailableValue(tokenAddress: string, decimals = 18): string {
    const balances = this.accountBalances();
    const key = this.normKey(tokenAddress);
    const entry = balances?.[key];
    const balance = entry?.balance ?? 0n;
    const locked = entry?.locked ?? 0n;
    const available = balance - locked;
    const price = this.getOraclePrice(tokenAddress);
    const human = ethers.formatUnits(available, decimals);
    return this.formatValue(human, price);
  }

  getOraclePriceText(address: string): string {
    const info = this.tokenPrices(address)();
    const p = info?.prices?.oracle?.price ?? 0;
    if (p == null || !Number.isFinite(p)) return '—';
    return `$${p}`;
  }

  getOracleChangePercent(address: string): string {
    const info = this.tokenPrices(address)();
    if (!info) return '—';
    const diff = info.lastChange.oracle ?? 0;
    const current = info.prices.oracle?.price ?? 0;
    if (current === 0 || diff === 0 || isNaN(current) || isNaN(diff))
      return '—';
    const previous = current - diff;
    if (previous === 0) return '—';
    const percent = (diff / previous) * 100;
    const formatted = percent.toFixed(2);
    const prefix = diff > 0 ? '+' : '';
    return `${prefix}${formatted}%`;
  }

  getOracleChangeClass(address: string): string {
    const info = this.tokenPrices(address)();
    const diff = info?.lastChange?.oracle ?? 0;
    if (!Number.isFinite(diff) || diff === 0) return '';
    return diff > 0 ? 'text-up' : 'text-down';
  }

  trackLadderRow = (_: number, r: LadderPairRow) =>
    `${r.bid?.orderId?.toString?.() ?? 'x'}_${r.ask?.orderId?.toString?.() ?? 'y'}`;

  trackBook = (_: number, b: { key: string }) => b.key;
}
