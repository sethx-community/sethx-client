import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ethers } from 'ethers';

import { FuturesOrderBookFacade } from '../../../services/shared/futures-orderbook/futures-orderbook.facade';
import { OrderFlowService } from '../../../core/overlay/order-flow.service';
import { FuturesOrderModalComponent } from '../../../core/overlay/order-modal/futuresorder-modal.component';
import { OrderbookSelectionService, MarketDetailPanelComponent, SpotSummaryHeaderComponent, type MarketDetailItem, type SpotSummaryMetric } from '../../../shared/orderbook';
import { OrderReviewFlowComponent } from '../../../shared/order-flow';

@Component({
  selector: 'app-futures-trade',
  standalone: true,
  imports: [CommonModule, MarketDetailPanelComponent, SpotSummaryHeaderComponent, OrderReviewFlowComponent],
  templateUrl: './futures-trade.component.html',
})
export class FuturesTradeComponent {
  readonly Math = Math;
  readonly ethers = ethers;

  readonly ob = inject(FuturesOrderBookFacade);
  readonly flow = inject(OrderFlowService);
  readonly orderSelection = inject(OrderbookSelectionService);

  readonly view = signal<'markets' | 'orders' | 'positions' | 'my-orders'>('markets');
  readonly expandedMarketInfo = signal<Record<string, boolean>>({});
  readonly hoveredMarketKey = signal<string | null>(null);
  readonly copiedValue = signal<string | null>(null);

  async copyValue(value: string | number | bigint | null | undefined, ev?: Event): Promise<void> {
    ev?.stopPropagation();
    const text = value === null || value === undefined || value === '' ? '' : String(value);
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      this.copiedValue.set(text);
      window.setTimeout(() => {
        if (this.copiedValue() === text) this.copiedValue.set(null);
      }, 1400);
    } catch {
      // Keep the value selectable if clipboard access is unavailable.
    }
  }

  openMarket(m: { marketKey: string }) {
    this.ob.store.selectMarket(m.marketKey);
    this.orderSelection.clear('futures');
    this.ob.store.clearSelectedPosition();
    this.view.set('orders');
    this.ob.store.activeView.set('orders');
  }

  backToMarkets() {
    this.ob.store.clearMarket();
    this.orderSelection.clear('futures');
    this.ob.store.clearSelectedPosition();
    this.view.set('markets');
    this.ob.store.activeView.set('markets');
  }

  openSelectedMarketOrders() {
    if (!this.ob.store.selectedMarketKey()) return;
    this.view.set('orders');
    this.ob.store.activeView.set('orders');
  }

  openPositions() {
    this.ob.store.clearMarket();
    this.view.set('positions');
    this.ob.store.activeView.set('positions');
    this.orderSelection.clear('futures');
  }

  openMyOrders() {
    this.ob.store.clearMarket();
    this.ob.store.clearSelectedPosition();
    this.view.set('my-orders');
    this.ob.store.activeView.set('my-orders');
    this.orderSelection.clear('futures');
  }

  openPlaceOrder(): void {
    this.flow.open(FuturesOrderModalComponent, {
      intent: 'buy',
      defaultMarketKey: this.ob.store.selectedMarketKey() ?? undefined,
    });
  }

  openFeeQuote(): void {
    this.flow.open(FuturesOrderModalComponent, {
      intent: 'quote',
      defaultMarketKey: this.ob.store.selectedMarketKey() ?? undefined,
    });
  }


  bestFuturesBid(): bigint | null {
    const orders = this.ob.store.buyOrders();
    if (!orders.length) return null;
    return orders.reduce((best: bigint | null, o: any) => best === null || o.price > best ? o.price : best, null);
  }

  bestFuturesAsk(): bigint | null {
    const orders = this.ob.store.sellOrders();
    if (!orders.length) return null;
    return orders.reduce((best: bigint | null, o: any) => best === null || o.price < best ? o.price : best, null);
  }

  futuresSpread(): bigint | null {
    const bid = this.bestFuturesBid();
    const ask = this.bestFuturesAsk();
    if (bid === null || ask === null || ask < bid) return null;
    return ask - bid;
  }

  formatFuturesPrice(v: bigint | null): string {
    if (v === null) return '—';
    return this.ob.store.formatQuotePrice(v, this.ob.store.selectedMarketRow()?.market?.quoteTokenDecimals ?? 18);
  }

  marketsMetrics(): SpotSummaryMetric[] {
    return [
      { label: 'Markets', value: this.ob.store.visibleMarkets().length },
      { label: 'My Positions', value: this.ob.store.myPositions().length },
      { label: 'My Orders', value: this.ob.store.myOrders().length },
      { label: 'Filtered', value: this.ob.store.marketsWithMyOrdersOnly() ? 'My orders only' : 'All markets', tone: 'muted' },
    ];
  }

  myOrdersMetrics(): SpotSummaryMetric[] {
    const orders = this.ob.store.myOrders();
    const buy = orders.filter((order: any) => order.side === 0).length;
    const sell = orders.filter((order: any) => order.side === 1).length;
    return [
      { label: 'My Orders', value: orders.length },
      { label: 'Buy / Long', value: buy, tone: buy > 0 ? 'up' : 'muted' },
      { label: 'Sell / Short', value: sell, tone: sell > 0 ? 'down' : 'muted' },
      { label: 'Filtered', value: this.ob.store.marketsWithMyOrdersOnly() ? 'My orders only' : 'All markets', tone: 'muted' },
    ];
  }

  positionsMetrics(): SpotSummaryMetric[] {
    const positions = this.ob.store.myPositions();
    const long = positions.reduce((acc, p) => acc + Number(p.longSize ?? 0n), 0);
    const short = positions.reduce((acc, p) => acc + Number(p.shortSize ?? 0n), 0);
    return [
      { label: 'Positions', value: positions.length },
      { label: 'Long size', value: long.toString(), tone: long > 0 ? 'up' : 'muted' },
      { label: 'Short size', value: short.toString(), tone: short > 0 ? 'down' : 'muted' },
      { label: 'Filtered', value: this.ob.store.marketsWithMyOrdersOnly() ? 'My orders only' : 'All markets', tone: 'muted' },
    ];
  }

  selectedMarketSummaryMetrics(row: any): SpotSummaryMetric[] {
    return [
      { label: 'Token', value: 'ETH' },
      { label: 'Best Bid', value: this.formatFuturesPrice(this.bestFuturesBid()), tone: 'up' },
      { label: 'Best Ask', value: this.formatFuturesPrice(this.bestFuturesAsk()), tone: 'down' },
      { label: 'Spread', value: this.formatFuturesPrice(this.futuresSpread()) },
      { label: 'Settlement', value: this.formatSettlementPriceFull(row) },
      { label: 'Initial margin', value: this.formatPercentBps(row?.market?.initialMarginBps) },
    ];
  }

  toggleMarketInfo(marketKey: string, ev?: Event) {
    ev?.stopPropagation?.();
    this.expandedMarketInfo.update((curr) => ({
      ...curr,
      [marketKey]: !curr[marketKey],
    }));
  }

  isMarketInfoOpen(marketKey: string): boolean {
    return !!this.expandedMarketInfo()[marketKey] || this.hoveredMarketKey() === marketKey;
  }


  selectOrder(row: any, side: 'buy' | 'sell', ev?: MouseEvent): void {
    if (!row) return;
    const t = ev?.target as HTMLElement | null;
    if (t?.closest('button,input,select,textarea,label')) return;
    const isMine = this.isOwnOrder(row);
    this.orderSelection.selectOrToggle({
      product: 'futures',
      marketKey: this.ob.store.selectedMarketKey(),
      orderId: row.orderId?.toString?.() ?? String(row.orderId ?? ''),
      side,
      isMine,
      order: row,
    });
  }

  isSelectedOrder(row: any): boolean {
    return !!row && this.orderSelection.isSelected('futures', row.orderId);
  }

  isOwnOrder(row: any): boolean {
    return String(row?.user ?? '').toLowerCase() === String(this.ob.store.activeAccount() ?? '').toLowerCase();
  }

  selectMyOrder(row: any, ev?: MouseEvent): void {
    if (!row) return;
    const t = ev?.target as HTMLElement | null;
    if (t?.closest('button,input,select,textarea,label')) return;
    this.orderSelection.selectOrToggle({
      product: 'futures',
      marketKey: row.marketKey,
      orderId: row.orderId?.toString?.() ?? String(row.orderId ?? ''),
      side: row.side === 0 ? 'buy' : 'sell',
      isMine: true,
      order: row,
    });
  }

  selectPosition(row: any, ev?: MouseEvent): void {
    const t = ev?.target as HTMLElement | null;
    if (t?.closest('button,input,select,textarea,label')) return;
    if (row?.marketKey) this.ob.store.selectPosition(row.marketKey);
  }

  isSelectedPosition(row: any): boolean {
    return !!row?.marketKey && this.ob.store.selectedPosition()?.marketKey === row.marketKey;
  }


  setMarketSearch(value: string): void { this.ob.store.marketSearch.set(String(value ?? '')); this.ob.store.marketOffset.set(0); }
  setMarketsWithMyOrdersOnly(value: boolean): void { this.ob.store.marketsWithMyOrdersOnly.set(!!value); this.ob.store.marketOffset.set(0); }
  marketsPageLabel(): string { const limit = Math.max(1, Number(this.ob.store.marketLimit() || 25)); return String(Math.floor(Number(this.ob.store.marketOffset() || 0) / limit) + 1); }
  previousMarketsPage(): void { const limit = Math.max(1, Number(this.ob.store.marketLimit() || 25)); this.ob.store.marketOffset.set(Math.max(0, Number(this.ob.store.marketOffset() || 0) - limit)); }
  nextMarketsPage(): void { const limit = Math.max(1, Number(this.ob.store.marketLimit() || 25)); this.ob.store.marketOffset.set(Number(this.ob.store.marketOffset() || 0) + limit); }

  trackMarket = (_: number, m: { marketKey: string }) => m.marketKey;
  trackOrder = (_: number, r: any) => r.orderId?.toString?.() ?? _;

  formatTs(unixSec: any): string {
    try {
      const s = Number(unixSec ?? 0);
      if (!s || !isFinite(s)) return '—';
      const d = new Date(s * 1000);
      const yyyy = d.getUTCFullYear();
      const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
      const dd = String(d.getUTCDate()).padStart(2, '0');
      const hh = String(d.getUTCHours()).padStart(2, '0');
      const mi = String(d.getUTCMinutes()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd} ${hh}:${mi} UTC`;
    } catch {
      return '—';
    }
  }

  readonly ZERO_BI = 0n;

  settlementPriceFor(m: any): bigint {
    return (m?.market?.lastSettlementPrice ?? this.ZERO_BI) as bigint;
  }

  quoteDecimalsFor(m: any): number {
    return (m?.market?.quoteTokenDecimals ?? 18) as number;
  }

  formatSettlementPriceFull(m: any): string {
    return this.ob.store.formatQuotePrice(
      this.settlementPriceFor(m),
      this.quoteDecimalsFor(m),
    );
  }

  formatSettlementPrice(m: any): string {
    const full = this.formatSettlementPriceFull(m);
    const parts = full.split('.');
    if (parts.length < 2) return full;
    const frac = parts[1] ?? '';
    if (frac.length <= 5) return full;
    return `${parts[0]}.${frac.slice(0, 5)}...`;
  }


  formatMultiplier(m: any): string {
    const raw = BigInt(m?.market?.multiplier ?? 0n);
    if (raw <= 0n) return '—';

    const formatted = ethers.formatUnits(raw, 18);
    const trimmed = formatted.includes('.')
      ? formatted.replace(/0+$/, '').replace(/\.$/, '')
      : formatted;

    return `${trimmed || '0'}x`;
  }

  formatPercentBps(raw: bigint | null | undefined): string {
    const n = Number(raw ?? 0n) / 100;
    return `${n.toFixed(2)}%`;
  }

  shortAddress(x: string | null | undefined): string {
    const s = String(x ?? '');
    if (s.length <= 12) return s || '—';
    return `${s.slice(0, 6)}...${s.slice(-4)}`;
  }

  formatMarginValue(raw: bigint, m: any): string {
    return this.ob.store.formatSize(raw, m?.market?.quoteTokenDecimals ?? 18);
  }

  formatMinMarginPerUnitLong(m: any): string {
    return this.ob.store.formatSize(
      m?.market?.minMarginPerUnitLongNorm ?? 0,
      m?.market?.quoteTokenDecimals ?? 18,
    );
  }

  formatMinMarginPerUnitShort(m: any): string {
    return this.ob.store.formatSize(
      m?.market?.minMarginPerUnitShortNorm ?? 0,
      m?.market?.quoteTokenDecimals ?? 18,
    );
  }

  currentRequiredMarginPerUnit(m: any): bigint {
    const market = m?.market;
    if (!market) return 0n;

    const quoteDecimals = market.quoteTokenDecimals ?? 18;
    const denom = 10_000n * 10n ** BigInt(quoteDecimals);

    return (
      BigInt(
        market.multiplier *
          market.lastSettlementPrice *
          market.initialMarginBps,
      ) / denom
    );
  }

  
  futuresMarketDetailItems(row: any): MarketDetailItem[] {
    const m = row?.market ?? {};
    return [
      { label: 'Market key', value: row?.marketKey, mono: true, copyable: true, fullWidth: true },
      { label: 'Ticker', value: m.ticker || '—' },
      { label: 'Payment token', value: 'ETH' },
      { label: 'Oracle address', value: m.oracle || '—', mono: true, copyable: true, fullWidth: true },
      { label: 'Latest oracle price', value: this.formatSettlementPriceFull(row) },
      { label: 'Latest oracle update', value: m.lastSettlementBlock ? `block ${m.lastSettlementBlock?.toString?.() ?? m.lastSettlementBlock}` : '—' },
      { label: 'Multiplier', value: this.formatMultiplier(row) },
      { label: 'Current required margin / unit', value: this.formatCurrentRequiredMarginPerUnit(row) },
      { label: 'Initial margin', value: this.formatPercentBps(m.initialMarginBps) },
      { label: 'Maintenance margin', value: this.formatPercentBps(m.maintenanceMarginBps) },
    ];
  }

  formatCurrentRequiredMarginPerUnit(m: any): string {
    return this.ob.store.formatSize(
      this.currentRequiredMarginPerUnit(m),
      m?.market?.quoteTokenDecimals ?? 18,
    );
  }
}
