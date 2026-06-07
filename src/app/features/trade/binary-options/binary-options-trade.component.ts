import { Component, inject, signal } from '@angular/core';
import { stableComputed } from '../../../core/signals/stable-resource';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderFlowService } from '../../../core/overlay/order-flow.service';
import { BinaryOrderModalComponent } from '../../../core/overlay/order-modal/binaryorder-modal.component';
import { BinaryOptionsOrderBookFacade } from '../../../services/shared/binary-options-orderbook/binary-options-orderbook.facade';
import { BinaryLadderRow } from '../../../services/shared/binary-options-orderbook/binary-options-orderbook.store';
import { binaryOptionsPageActions, BinaryOptionsPageCtx } from '../../../core/overlay/order-flow-launcher/order-flow-actions/binary-options-flow-actions';
import { OrderReviewFlowComponent } from '../../../shared/order-flow';
import { OrderbookSelectionService, MarketDetailPanelComponent, SpotSummaryHeaderComponent, type MarketDetailItem, type SpotSummaryMetric } from '../../../shared/orderbook';

@Component({
  selector: 'app-binary-options-trade',
  standalone: true,
  imports: [CommonModule, FormsModule, OrderReviewFlowComponent, MarketDetailPanelComponent, SpotSummaryHeaderComponent],
  templateUrl: './binary-options-trade.component.html',
  styleUrl: './binary-options-trade.component.css',
})
export class BinaryOptionsTradeComponent {
  readonly ob = inject(BinaryOptionsOrderBookFacade);
  readonly flow = inject(OrderFlowService);
  readonly orderSelection = inject(OrderbookSelectionService);
  readonly ctx: BinaryOptionsPageCtx = {};
  readonly actions = binaryOptionsPageActions;
  readonly Math = Math;
  readonly view = signal<'markets' | 'orders' | 'positions' | 'my-orders'>('markets');
  readonly expandedMarketInfo = signal<Record<string, boolean>>({});
  readonly hoveredMarketKey = signal<string | null>(null);
  readonly copiedValue = signal<string | null>(null);

  openMarket(m: { marketKey: string }): void {
    this.ob.store.selectMarket(m.marketKey);
    this.orderSelection.clear('binary-options');
    this.ob.store.clearSelectedPosition();
    this.view.set('orders');
    this.ob.store.activeView.set('orders');
  }

  backToMarkets(): void {
    this.ob.store.clearMarket();
    this.orderSelection.clear('binary-options');
    this.ob.store.clearSelectedPosition();
    this.view.set('markets');
    this.ob.store.activeView.set('markets');
  }

  openPositions(): void {
    this.ob.store.clearMarket();
    this.orderSelection.clear('binary-options');
    this.view.set('positions');
    this.ob.store.activeView.set('positions');
  }

  openMyOrders(): void {
    this.ob.store.clearMarket();
    this.ob.store.clearSelectedPosition();
    this.orderSelection.clear('binary-options');
    this.view.set('my-orders');
    this.ob.store.activeView.set('my-orders');
  }

  trackMarket = (_: number, m: { marketKey: string }) => m.marketKey;
  trackOrder = (_: number, r: BinaryLadderRow) => r.orderId.toString();

  readonly binaryLadderRows = stableComputed<Array<{ key: string; bid: BinaryLadderRow | null; ask: BinaryLadderRow | null }>>(() => { const bids = this.ob.store.bids(); const asks = this.ob.store.asks(); const length = Math.max(bids.length, asks.length); return Array.from({ length }, (_, index) => ({ key: `${bids[index]?.orderId?.toString() ?? 'empty-bid'}:${asks[index]?.orderId?.toString() ?? 'empty-ask'}:${index}`, bid: bids[index] ?? null, ask: asks[index] ?? null })); });
  trackBinaryLadderRow = (_: number, row: { key: string }) => row.key;

  isPositive(v: bigint | null | undefined): boolean { return (v ?? 0n) > 0n; }

  formatExpiry(x: bigint | number | string | null | undefined): string {
    try {
      const s = typeof x === 'bigint' ? Number(x) : Number(x ?? 0);
      if (!s || !Number.isFinite(s)) return '—';
      const d = new Date(s * 1000);
      return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')} ${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')} UTC`;
    } catch { return '—'; }
  }

  async copyValue(value: string | number | bigint | null | undefined, ev?: Event): Promise<void> {
    ev?.stopPropagation();
    const text = value === null || value === undefined || value === '' ? '' : String(value);
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      this.copiedValue.set(text);
      window.setTimeout(() => { if (this.copiedValue() === text) this.copiedValue.set(null); }, 1400);
    } catch {}
  }

  selectOrder(r: BinaryLadderRow | null, ev?: MouseEvent): void {
    if (!r) return;
    const t = ev?.target as HTMLElement | null;
    if (t?.closest('button,input,select,textarea,label')) return;
    this.orderSelection.selectOrToggle({ product: 'binary-options', marketKey: r.order.marketKey || this.ob.store.selectedMarketKey(), orderId: r.orderId.toString(), side: r.side, isMine: !!r.isMine, order: r.order });
  }
  isSelectedOrder(r: BinaryLadderRow | null): boolean { return !!r && this.orderSelection.isSelected('binary-options', r.orderId); }

  selectPosition(row: any, ev?: MouseEvent): void {
    const t = ev?.target as HTMLElement | null;
    if (t?.closest('button,input,select,textarea,label')) return;
    if (row?.marketKey) {
      this.orderSelection.clear('binary-options');
      this.ob.store.selectPosition(row.marketKey);
    }
  }
  isSelectedPosition(row: any): boolean { return !!row?.marketKey && this.ob.store.selectedPosition()?.marketKey === row.marketKey; }

  toggleMarketInfo(marketKey: string, ev?: Event): void { ev?.stopPropagation?.(); this.expandedMarketInfo.update((curr) => ({ ...curr, [marketKey]: !curr[marketKey] })); }
  closeMarketInfo(marketKey: string): void { this.expandedMarketInfo.update((curr) => ({ ...curr, [marketKey]: false })); }
  isMarketInfoOpen(marketKey: string): boolean { return !!this.expandedMarketInfo()[marketKey] || this.hoveredMarketKey() === marketKey; }
  shortAddress(x: string | null | undefined): string { const s = String(x ?? ''); return !s ? '—' : s.length <= 12 ? s : `${s.slice(0, 6)}...${s.slice(-4)}`; }
  marketCondition(row: any): string { const m = row?.market; return m ? this.ob.store.condition(m.optionType, this.binaryPairLabel(m), m.strikePrice) : '—'; }
  binaryPairLabel(m: any): string { const ticker = String(m?.ticker ?? '').trim(); if (ticker) { const parts = ticker.split('-'); if (parts.length >= 2) return `${parts[0]}/${parts[1]}`; } const base = this.ob.store.tokenLabel(m?.baseToken); const payment = this.ob.store.tokenLabel(m?.paymentToken); return payment && payment !== '—' ? `${base}/${payment}` : base; }
  marketSubtitle(row: any): string { return row?.market?.ticker || row?.marketKey || '—'; }
  latestOraclePriceLabel(row: any): string { const m = row?.market; if (!m) return '—'; if (m.settled && m.settlementPrice && m.settlementPrice > 0n) return `${this.ob.store.formatStrike(m.settlementPrice)} (settlement)`; if (m.latestOraclePrice !== undefined && m.latestOraclePrice !== null) return this.ob.store.formatStrike(m.latestOraclePrice); return '—'; }
  latestOracleTimeLabel(row: any): string { const ts = row?.market?.latestOracleTimestamp; if (!ts || ts === 0n) return '—'; return this.formatExpiry(ts); }
  binaryMarketDetailItems(row: any): MarketDetailItem[] { const m = row?.market ?? {}; return [{ label: 'Market key', value: row?.marketKey, mono: true }, { label: 'Condition', value: this.marketCondition(row) }, { label: 'Ticker', value: m.ticker || '—' }, { label: 'Payment token', value: 'ETH' }, { label: 'Writer coverage', value: '100%' }, { label: 'Oracle address', value: m.oracle || '—', mono: true }, { label: 'Latest oracle price', value: this.latestOraclePriceLabel(row) }, { label: 'Latest oracle update', value: this.latestOracleTimeLabel(row) }, { label: 'Settlement status', value: m.settled ? 'SETTLED' : 'OPEN' }, { label: 'Settlement price', value: m.settled ? this.ob.store.formatStrike(m.settlementPrice) : '—' }]; }

  readonly marketsMetrics = stableComputed<SpotSummaryMetric[]>(() => [
    { label: 'Markets', value: this.ob.store.visibleMarkets().length },
    { label: 'Payment token', value: 'ETH' },
    { label: 'Open orders', value: this.ob.store.activeMarkets().reduce((s, m) => s + Number(m.orderCount ?? 0n), 0) },
    { label: 'My Positions', value: this.ob.store.myPositions().length },
    { label: 'My Orders', value: this.ob.store.myOrders().length },
  ]);

  selectedMarketSummaryMetrics(selected: any, info?: any): SpotSummaryMetric[] { const m = info ?? selected?.market; return [
    { label: 'Expiry', value: this.formatExpiry(m?.expiry) },
    { label: 'Token', value: 'ETH' },
    { label: 'Writer coverage', value: '100%' },
    { label: 'Best Bid', value: this.ob.store.bestBid() !== null ? this.ob.store.formatPricePerEth(this.ob.store.bestBid()!) : '—', tone: 'up' },
    { label: 'Best Ask', value: this.ob.store.bestAsk() !== null ? this.ob.store.formatPricePerEth(this.ob.store.bestAsk()!) : '—', tone: 'down' },
    { label: 'Spread', value: this.ob.store.spread() !== null ? this.ob.store.formatPricePerEth(this.ob.store.spread()!) : '—' },
  ]; }

  readonly selectedMarketPositions = stableComputed<any[]>(() => {
    const key = this.ob.store.selectedMarketKey();
    if (!key) return [];
    return this.ob.store.myPositions().filter((p: any) => String(p.marketKey ?? '').toLowerCase() === String(key).toLowerCase());
  });

  readonly myOrdersMetrics = stableComputed<SpotSummaryMetric[]>(() => { const orders = this.ob.store.myOrders(); return [
    { label: 'Orders', value: orders.length },
    { label: 'Bids', value: orders.filter((o) => o.side === 'bid').length, tone: 'up' },
    { label: 'Asks', value: orders.filter((o) => o.side === 'ask').length, tone: 'down' },
    { label: 'Total payout', value: this.ob.store.formatEth(orders.reduce((s, o) => s + (o.order?.payoutAmount ?? 0n), 0n)) },
  ]; });

  readonly positionMetrics = stableComputed<SpotSummaryMetric[]>(() => [
    { label: 'Positions', value: this.ob.store.myPositions().length },
    { label: 'Holder payout', value: this.ob.store.formatEth(this.ob.store.myPositions().reduce((s, p) => s + (p.holderClaimable ?? 0n), 0n)) },
    { label: 'Writer margin', value: this.ob.store.formatEth(this.ob.store.myPositions().reduce((s, p) => s + (p.writerMargin ?? 0n), 0n)) },
  ]);

  openPlaceOrder(): void { this.flow.open(BinaryOrderModalComponent, { intent: 'place', defaultMarketKey: this.ob.store.selectedMarketKey() ?? undefined }); }
  openFeeQuote(): void { this.flow.open(BinaryOrderModalComponent, { intent: 'quote', defaultMarketKey: this.ob.store.selectedMarketKey() ?? undefined }); }
  setMarketSearch(value: string): void { this.ob.store.marketSearch.set(String(value ?? '')); this.ob.store.marketOffset.set(0); }
  setMarketsWithMyOrdersOnly(value: boolean): void { this.ob.store.marketsWithMyOrdersOnly.set(!!value); this.ob.store.marketOffset.set(0); }
  marketsPageLabel(): string { const limit = Math.max(1, Number(this.ob.store.marketLimit() || 25)); return String(Math.floor(Number(this.ob.store.marketOffset() || 0) / limit) + 1); }
  previousMarketsPage(): void { const limit = Math.max(1, Number(this.ob.store.marketLimit() || 25)); this.ob.store.marketOffset.set(Math.max(0, Number(this.ob.store.marketOffset() || 0) - limit)); }
  nextMarketsPage(): void { const limit = Math.max(1, Number(this.ob.store.marketLimit() || 25)); this.ob.store.marketOffset.set(Number(this.ob.store.marketOffset() || 0) + limit); }

}
