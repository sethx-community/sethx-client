import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';

import { OrderFlowService } from '../../../core/overlay/order-flow.service';
import { NftSpotOrderModalComponent } from '../../../core/overlay/order-modal/nftspotorder-modal.component';
import { TokenService } from '../../../services/shared/token.service';
import { norm } from '../../../core/tokens/token-normalize';
import {
  MarketDetailPanelComponent,
  OrderbookSelectionService,
  SpotSummaryHeaderComponent,
  type MarketDetailItem,
  type SpotSummaryMetric,
  type SharedOrderSelection,
} from '../../../shared/orderbook';
import {
  NftSpotMarket,
  NftSpotOwnedNft,
  NftSpotOrder,
  NftSpotOrderbookStore,
} from '../../../services/shared/nft-spot-orderbook/nft-spot-orderbook.store';

@Component({
  selector: 'app-nft-spot-trade',
  standalone: true,
  imports: [CommonModule, MarketDetailPanelComponent, SpotSummaryHeaderComponent],
  templateUrl: './nft-spot-trade.component.html',
})
export class NftSpotTradeComponent {
  readonly store = inject(NftSpotOrderbookStore);
  readonly orderSelection = inject(OrderbookSelectionService);
  private readonly flow = inject(OrderFlowService);
  private readonly tokens = inject(TokenService);

  readonly mainTokens = this.tokens.main;
  readonly whitelistTokens = this.tokens.whitelist;

  readonly view = signal<'markets' | 'orders' | 'my-nfts' | 'my-orders'>('markets');
  readonly hoveredMarket = signal<NftSpotMarket | null>(null);
  readonly hoveredOrder = signal<NftSpotOrder | null>(null);
  readonly copiedValue = signal<string | null>(null);

  readonly search = this.store.search;
  readonly myMarketsOnly = this.store.myMarketsOnly;
  readonly myOrdersOnly = this.store.myOrdersOnly;
  readonly myNftsOnlyAvailable = this.store.myNftsOnlyAvailable;
  readonly myNfts = this.store.myNfts;
  readonly myNftsStatus = this.store.myNftsStatus;
  readonly showAllRows = this.store.showAllRows;
  readonly ladderFocus = this.store.ladderFocus;
  readonly pinnedMarket = this.store.pinnedMarket;
  readonly selectedMarketKey = this.store.selectedMarketKey;
  readonly markets = this.store.markets;
  readonly visibleMarkets = this.store.visibleMarkets;
  readonly selectedMarket = this.store.selectedMarket;
  readonly visibleOrders = this.store.visibleOrders;
  readonly bidOrders = this.store.bidOrders;
  readonly askOrders = this.store.askOrders;
  readonly pairedRows = this.store.pairedRows;
  readonly focusRows = this.store.focusRows;
  readonly restRows = this.store.restRows;
  readonly marketDetailItems = this.store.marketDetailItems;
  readonly status = this.store.status;
  readonly error = this.store.error;
  readonly myOrders = this.store.myOrders;

  readonly marketsMetrics = computed<SpotSummaryMetric[]>(() => [
    { label: 'Markets', value: this.markets().length },
    { label: 'My NFTs', value: this.myNfts().length },
    { label: 'My orders', value: this.myOrders().length },
    { label: 'Filtered', value: this.myMarketsOnly() ? 'My orders only' : 'All markets', tone: 'muted' },
  ]);


  setLadderFocus(value: number): void {
    const n = Math.max(3, Math.min(20, Number(value) || 5));
    this.store.ladderFocus.set(n);
  }

  toggleShowAllRows(): void {
    this.store.showAllRows.update((value) => !value);
  }

  readonly selectedMarketMetrics = computed<SpotSummaryMetric[]>(() => {
    const market = this.selectedMarket();
    return [
      { label: 'Best Bid', value: market?.bestBid ?? '—', tone: 'up' },
      { label: 'Best Ask', value: market?.bestAsk ?? '—', tone: 'down' },
      { label: 'Floor Hint', value: market?.floorHint ?? '—' },
      { label: 'Orders', value: market?.totalOrders ?? '—' },
      { label: 'My Orders', value: market?.myOrders ?? '—' },
    ];
  });

  readonly myNftsMetrics = computed<SpotSummaryMetric[]>(() => [
    { label: 'NFTs', value: this.myNfts().length },
    { label: 'Open orders', value: this.myOrders().length },
    { label: 'Filter', value: this.myNftsOnlyAvailable() ? 'Available only' : 'All NFTs', tone: 'muted' },
  ]);

  readonly myOrdersMetrics = computed<SpotSummaryMetric[]>(() => [
    { label: 'My orders', value: this.myOrders().length },
    { label: 'Markets', value: this.markets().length },
    { label: 'Filter', value: this.myMarketsOnly() ? 'My orders only' : 'All markets', tone: 'muted' },
  ]);

  openFeeQuote(): void {
    const market = this.selectedMarket();
    this.flow.open(NftSpotOrderModalComponent, {
      intent: 'quote',
      defaultNft: market?.collectionAddress,
      defaultTokenId: market?.tokenId,
      defaultQuoteToken: market?.quoteToken,
      defaultMarketKey: market?.key,
    });
  }

  openPlaceOrder(): void {
    const market = this.selectedMarket();
    this.flow.open(NftSpotOrderModalComponent, {
      intent: 'place',
      defaultNft: market?.collectionAddress,
      defaultTokenId: market?.tokenId,
      defaultQuoteToken: market?.quoteToken,
      defaultMarketKey: market?.key,
    });
  }

  readonly selectedNftOrder = computed(() => {
    const selected = this.orderSelection.selected();
    return selected?.product === 'nft-spot' ? selected : null;
  });

  readonly selectedOrderDetailItems = computed<MarketDetailItem[]>(() => {
    const selected = this.selectedNftOrder();
    return this.store.selectedOrderDetailItems((selected?.order as NftSpotOrder | undefined) ?? null);
  });

  openMarket(market: NftSpotMarket): void {
    this.orderSelection.clear('nft-spot');
    this.store.selectMarket(market.key);
    this.view.set('orders');
  }

  showMarketInfo(market: NftSpotMarket, event?: Event): void {
    event?.stopPropagation();
    this.store.toggleMarketInfo(market);
  }

  isMarketDetailOpen(market: NftSpotMarket): boolean {
    return this.pinnedMarket()?.key === market.key || this.hoveredMarket()?.key === market.key;
  }

  marketDetailItemsFor(market: NftSpotMarket): MarketDetailItem[] {
    return this.store.marketDetailItemsFor(market);
  }

  showMarkets(): void {
    this.orderSelection.clear('nft-spot');
    this.store.clearMarket();
    this.view.set('markets');
  }

  showMyNfts(): void {
    this.orderSelection.clear('nft-spot');
    this.store.clearMarket();
    this.view.set('my-nfts');
  }

  showMyOrders(): void {
    this.orderSelection.clear('nft-spot');
    this.store.clearMarket();
    this.view.set('my-orders');
  }

  selectMyOrder(order: NftSpotOrder, event?: Event): void {
    this.selectOrder(order, event);
    this.store.selectMarket(order.marketKey);
  }

  isMyOrderSelected(order: NftSpotOrder): boolean {
    return this.isSelected(order);
  }

  sellNft(nft: NftSpotOwnedNft, event?: Event): void {
    event?.stopPropagation();
    if (nft.locked) return;
    this.flow.open(NftSpotOrderModalComponent, {
      intent: 'place',
      defaultSide: 1,
      defaultNft: nft.collectionAddress,
      defaultTokenId: nft.tokenId,
    });
  }

  selectOrder(order: NftSpotOrder | null, event?: Event): void {
    event?.stopPropagation();
    if (!order) return;
    const selection: SharedOrderSelection<NftSpotOrder> = {
      product: 'nft-spot',
      marketKey: order.marketKey,
      orderId: order.id,
      side: order.side,
      isMine: order.isMine,
      order,
    };
    this.orderSelection.selectOrToggle(selection);
  }

  isSelected(order: NftSpotOrder | null): boolean {
    return !!order && this.orderSelection.isSelected('nft-spot', order.id);
  }

  onOrderHover(order: NftSpotOrder | null): void {
    if (!order) return;
    this.hoveredOrder.set(order);
  }

  clearOrderHover(): void {
    this.hoveredOrder.set(null);
  }

  displayedOrderForRow(row: { bid: NftSpotOrder | null; ask: NftSpotOrder | null }): NftSpotOrder | null {
    if (row.bid && this.isSelected(row.bid)) return row.bid;
    if (row.ask && this.isSelected(row.ask)) return row.ask;
    const hovered = this.hoveredOrder();
    if (hovered && (hovered === row.bid || hovered === row.ask)) return hovered;
    return null;
  }

  ladderOrderDetailItems(order: NftSpotOrder | null | undefined): MarketDetailItem[] {
    return this.store.selectedOrderDetailItems(order ?? null);
  }

  refresh(): void {
    this.store.refresh();
  }


  isWhitelistedToken(address: string | null | undefined): boolean {
    const key = norm(String(address ?? ''));
    if (!key) return false;
    return (
      this.mainTokens().some((token) => norm(token.address) === key) ||
      this.whitelistTokens().some((token) => norm(token.address) === key)
    );
  }

  clearPinnedMarket(): void {
    this.store.pinnedMarketKey.set(null);
  }

  shortAddress(address: string): string {
    return this.store.shortAddress(address);
  }

  async copyValue(value: string | number | bigint | null | undefined, event?: Event): Promise<void> {
    event?.stopPropagation();
    const text = value === null || value === undefined || value === '' ? '' : String(value);
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      this.copiedValue.set(text);
      window.setTimeout(() => {
        if (this.copiedValue() === text) this.copiedValue.set(null);
      }, 1400);
    } catch {
      this.copiedValue.set(null);
    }
  }


  marketsPageLabel(): string { const limit = Math.max(1, Number(this.store.marketLimit() || 25)); return String(Math.floor(Number(this.store.marketOffset() || 0) / limit) + 1); }
  previousMarketsPage(): void { const limit = Math.max(1, Number(this.store.marketLimit() || 25)); this.store.marketOffset.set(Math.max(0, Number(this.store.marketOffset() || 0) - limit)); }
  nextMarketsPage(): void { const limit = Math.max(1, Number(this.store.marketLimit() || 25)); this.store.marketOffset.set(Number(this.store.marketOffset() || 0) + limit); }

  trackMarket = (_: number, market: NftSpotMarket) => market.key;
  trackNft = (_: number, nft: NftSpotOwnedNft) => nft.key;
  trackOrder = (_: number, order: NftSpotOrder) => order.id;
  trackRow = (_: number, row: { bid: NftSpotOrder | null; ask: NftSpotOrder | null }) => `${row.bid?.id ?? 'x'}_${row.ask?.id ?? 'y'}`;
}
