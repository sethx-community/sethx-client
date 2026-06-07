import { Component, inject, signal } from '@angular/core';
import { stableComputed } from '../../../core/signals/stable-resource';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderFlowService } from '../../../core/overlay/order-flow.service';
import { MarginOptionsOrderModalComponent } from '../../../core/overlay/order-modal/marginoptionsorder-modal.component';
import { MarginOptionsOrderBookFacade } from '../../../services/shared/margin-options-orderbook/margin-options-orderbook.facade';
import { MarginLadderRow, MarginPositionRow } from '../../../services/shared/margin-options-orderbook/margin-options-orderbook.store';
import { marginOptionsPageActions, MarginOptionsPageCtx } from '../../../core/overlay/order-flow-launcher/order-flow-actions/margin-options-flow-actions';
import { OrderReviewFlowComponent } from '../../../shared/order-flow';
import { OrderbookSelectionService, MarketDetailPanelComponent, SpotSummaryHeaderComponent, type MarketDetailItem, type SpotSummaryMetric } from '../../../shared/orderbook';

@Component({
  selector: 'app-margin-options-trade',
  standalone: true,
  imports: [CommonModule, FormsModule, OrderReviewFlowComponent, MarketDetailPanelComponent, SpotSummaryHeaderComponent],
  templateUrl: './margin-options-trade.component.html',
  styleUrl: './margin-options-trade.component.css',
})
export class MarginOptionsTradeComponent {
  readonly ob = inject(MarginOptionsOrderBookFacade);
  readonly flow = inject(OrderFlowService);
  readonly orderSelection = inject(OrderbookSelectionService);
  readonly ctx: MarginOptionsPageCtx = {};
  readonly actions = marginOptionsPageActions;
  readonly view = signal<'markets' | 'orders' | 'positions' | 'my-orders'>('markets');
  readonly expandedMarketInfo = signal<Record<string, boolean>>({});
  readonly hoveredMarketKey = signal<string | null>(null);
  readonly copiedValue = signal<string | null>(null);

  openMarket(m: { marketKey: string }): void { this.ob.store.selectMarket(m.marketKey); this.orderSelection.clear('margin-options'); this.view.set('orders'); this.ob.store.activeView.set('orders'); }
  backToMarkets(): void { this.ob.store.clearMarket(); this.orderSelection.clear('margin-options'); this.ob.store.clearSelectedPosition(); this.view.set('markets'); this.ob.store.activeView.set('markets'); }
  openPositions(): void { this.ob.store.clearMarket(); this.orderSelection.clear('margin-options'); this.ob.store.clearSelectedPosition(); this.view.set('positions'); this.ob.store.activeView.set('positions'); }
  openMyOrders(): void { this.ob.store.clearMarket(); this.ob.store.clearSelectedPosition(); this.orderSelection.clear('margin-options'); this.view.set('my-orders'); this.ob.store.activeView.set('my-orders'); }

  trackMarket = (_: number, m: { marketKey: string }) => m.marketKey;
  trackOrder = (_: number, r: MarginLadderRow) => r.orderId.toString();

  readonly marginLadderRows = stableComputed<Array<{ key: string; bid: MarginLadderRow | null; ask: MarginLadderRow | null }>>(() => { const bids = this.ob.store.bids(); const asks = this.ob.store.asks(); const length = Math.max(bids.length, asks.length); return Array.from({ length }, (_, index) => ({ key: `${bids[index]?.orderId?.toString() ?? 'empty-bid'}:${asks[index]?.orderId?.toString() ?? 'empty-ask'}:${index}`, bid: bids[index] ?? null, ask: asks[index] ?? null })); });
  trackMarginLadderRow = (_: number, row: { key: string }) => row.key;


  formatExpiry(x: any): string { try { const s = typeof x === 'bigint' ? Number(x) : Number(x ?? 0); if (!s || !Number.isFinite(s)) return '—'; const d = new Date(s * 1000); return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')} ${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')} UTC`; } catch { return '—'; } }
  async copyValue(value: string | number | bigint | null | undefined, ev?: Event): Promise<void> { ev?.stopPropagation(); const text = value === null || value === undefined || value === '' ? '' : String(value); if (!text) return; try { await navigator.clipboard.writeText(text); this.copiedValue.set(text); window.setTimeout(() => { if (this.copiedValue() === text) this.copiedValue.set(null); }, 1400); } catch {} }

  isSelectedOrder(r: MarginLadderRow | null): boolean { return !!r && this.orderSelection.isSelected('margin-options', r.orderId); }
  isSelectedPosition(r: MarginPositionRow | null): boolean { return !!r && this.ob.store.selectedPositionKey() === r.marketKey; }
  selectPosition(r: MarginPositionRow | null, ev?: MouseEvent): void { if (!r) return; const t = ev?.target as HTMLElement | null; if (t?.closest('button,input,select,textarea,label')) return; this.orderSelection.clear('margin-options'); this.ob.store.selectPosition(r.marketKey); }
  selectOrder(r: MarginLadderRow | null, ev?: MouseEvent): void { if (!r) return; const t = ev?.target as HTMLElement | null; if (t?.closest('button,input,select,textarea,label')) return; this.orderSelection.selectOrToggle({ product: 'margin-options', marketKey: r.order.marketKey || this.ob.store.selectedMarketKey(), orderId: r.orderId.toString(), side: r.side, isMine: !!r.isMine, order: r.order }); }
  toggleMarketInfo(k: string, ev?: Event): void { ev?.stopPropagation?.(); this.expandedMarketInfo.update((c) => ({ ...c, [k]: !c[k] })); }
  closeMarketInfo(k: string): void { this.expandedMarketInfo.update((c) => ({ ...c, [k]: false })); }
  isMarketInfoOpen(k: string): boolean { return !!this.expandedMarketInfo()[k] || this.hoveredMarketKey() === k; }
  shortAddress(x: string | null | undefined): string { const s = String(x ?? ''); return !s ? '—' : s.length <= 12 ? s : `${s.slice(0, 6)}...${s.slice(-4)}`; }
  marketSubtitle(row: any): string { return row?.market?.ticker || row?.marketKey || '—'; }
  paymentTokenLabel(): string { const m = this.ob.store.selectedMarket()?.market ?? this.ob.store.activeMarkets()[0]?.market; return this.ob.store.tokenLabel(m?.paymentToken); }
  latestOraclePriceLabel(row: any): string { const m = row?.market; if (!m) return '—'; if (m.settled && m.settlementPrice && m.settlementPrice > 0n) return `${this.ob.store.formatOraclePrice(m.settlementPrice, m.oraclePriceDecimals)} (settlement)`; if (m.latestOraclePrice !== undefined && m.latestOraclePrice !== null) return this.ob.store.formatOraclePrice(m.latestOraclePrice, m.latestOraclePriceDecimals ?? m.oraclePriceDecimals); return '—'; }
  latestOracleTimeLabel(row: any): string { const ts = row?.market?.latestOracleTimestamp; if (!ts || ts === 0n) return '—'; return this.formatExpiry(ts); }

  marginPerOptionLabel(row: any): string {
    const m = row?.market ?? {};
    try {
      const strike = BigInt(m.strikePrice ?? 0n);
      const bps = BigInt(m.collateralBps ?? 0n);
      if (strike <= 0n || bps <= 0n) return '—';
      return this.ob.store.formatPrice((strike * bps) / 10000n, m.paymentToken);
    } catch { return '—'; }
  }

  readonly marketsMetrics = stableComputed<SpotSummaryMetric[]>(() => [
    { label: 'Markets', value: this.ob.store.visibleMarkets().length },
    { label: 'Payment token', value: this.paymentTokenLabel() },
    { label: 'Open orders', value: this.ob.store.activeMarkets().reduce((s, m) => s + Number(m.orderCount ?? 0n), 0) },
    { label: 'My Positions', value: this.ob.store.myPositions().length },
    { label: 'My Orders', value: this.ob.store.myOrders().length },
    { label: 'Filtered', value: this.ob.store.marketsWithMyOrdersOnly() ? 'My orders only' : 'All markets', tone: 'muted' },
  ]);

  selectedMarketSummaryMetrics(selected: any): SpotSummaryMetric[] { return [
    { label: 'Strike', value: this.ob.store.formatStrike(selected?.market?.strikePrice) },
    { label: 'Expiry', value: this.formatExpiry(selected?.market?.expiry) },
    { label: 'Token', value: this.ob.store.tokenLabel(selected?.market?.paymentToken) },
    { label: 'Writer coverage', value: this.ob.store.formatBpsPercent(selected?.market?.collateralBps) },
    { label: 'Best Bid', value: this.ob.store.bestBid() !== null ? this.ob.store.formatPrice(this.ob.store.bestBid()!, selected?.market?.paymentToken) : '—', tone: 'up' },
    { label: 'Best Ask', value: this.ob.store.bestAsk() !== null ? this.ob.store.formatPrice(this.ob.store.bestAsk()!, selected?.market?.paymentToken) : '—', tone: 'down' },
  ]; }

  readonly selectedMarketPositions = stableComputed<MarginPositionRow[]>(() => {
    const key = this.ob.store.selectedMarketKey();
    if (!key) return [];
    return this.ob.store.myPositions().filter((p) => String(p.marketKey ?? '').toLowerCase() === String(key).toLowerCase());
  });

  readonly myOrdersMetrics = stableComputed<SpotSummaryMetric[]>(() => { const orders = this.ob.store.myOrders(); return [
    { label: 'Orders', value: orders.length },
    { label: 'Bids', value: orders.filter((o) => o.side === 'bid').length, tone: 'up' },
    { label: 'Asks', value: orders.filter((o) => o.side === 'ask').length, tone: 'down' },
    { label: 'Remaining size', value: this.ob.store.formatQuantity(orders.reduce((s, o) => s + ((o.order?.size ?? 0n) > (o.order?.filled ?? 0n) ? (o.order.size - o.order.filled) : 0n), 0n)) },
  ]; });

  readonly positionMetrics = stableComputed<SpotSummaryMetric[]>(() => [
    { label: 'Positions', value: this.ob.store.myPositions().length },
    { label: 'Holder available', value: this.ob.store.formatQuantity(this.ob.store.myPositions().reduce((s, p) => s + (p.holderAvailable ?? 0n), 0n)) },
    { label: 'Writer available', value: this.ob.store.formatQuantity(this.ob.store.myPositions().reduce((s, p) => s + (p.writerAvailable ?? 0n), 0n)) },
  ]);

  marketDetailItems(row: any): MarketDetailItem[] { const m = row?.market ?? {}; return [{ label: 'Market key', value: row?.marketKey, mono: true, copyable: true, fullWidth: true }, { label: 'Ticker', value: m.ticker || '—' }, { label: 'Type', value: this.ob.store.optionTypeLabel(m.optionType) }, { label: 'Payment token', value: this.ob.store.tokenLabel(m.paymentToken) }, { label: 'Oracle address', value: m.oracle || '—', mono: true }, { label: 'Latest oracle price', value: this.latestOraclePriceLabel(row) }, { label: 'Latest oracle update', value: this.latestOracleTimeLabel(row) }, { label: 'Writer coverage', value: this.ob.store.formatBpsPercent(m.collateralBps) }, { label: 'Margin / option', value: this.marginPerOptionLabel(row) }, { label: 'Settlement', value: m.settled ? this.ob.store.formatStrike(m.settlementPrice) : 'Open' }]; }
  openPlaceOrder(): void { this.flow.open(MarginOptionsOrderModalComponent, { intent: 'place', defaultMarketKey: this.ob.store.selectedMarketKey() ?? undefined }); }
  openFeeQuote(): void { this.flow.open(MarginOptionsOrderModalComponent, { intent: 'quote', defaultMarketKey: this.ob.store.selectedMarketKey() ?? undefined }); }

  setMarketSearch(value: string): void { this.ob.store.marketSearch.set(String(value ?? '')); this.ob.store.marketOffset.set(0); }
  setMarketsWithMyOrdersOnly(value: boolean): void { this.ob.store.marketsWithMyOrdersOnly.set(!!value); this.ob.store.marketOffset.set(0); }
  marketsPageLabel(): string { const limit = Math.max(1, Number(this.ob.store.marketLimit() || 25)); return String(Math.floor(Number(this.ob.store.marketOffset() || 0) / limit) + 1); }
  previousMarketsPage(): void { const limit = Math.max(1, Number(this.ob.store.marketLimit() || 25)); this.ob.store.marketOffset.set(Math.max(0, Number(this.ob.store.marketOffset() || 0) - limit)); }
  nextMarketsPage(): void { const limit = Math.max(1, Number(this.ob.store.marketLimit() || 25)); this.ob.store.marketOffset.set(Number(this.ob.store.marketOffset() || 0) + limit); }
}
