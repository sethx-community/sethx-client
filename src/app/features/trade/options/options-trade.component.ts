import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OptionsOrderBookFacade } from '../../../services/shared/options-orderbook/options-orderbook.facade';
import { OrderFlowService } from '../../../core/overlay/order-flow.service';
import { OptionsOrderModalComponent } from '../../../core/overlay/order-modal/optionsorder-modal.component';
import { LadderRow } from '../../../services/shared/options-orderbook/options-orderbook.store';
import { OrderbookSelectionService, MarketDetailPanelComponent, SpotSummaryHeaderComponent, type MarketDetailItem, type SpotSummaryMetric } from '../../../shared/orderbook';
import { OrderReviewFlowComponent } from '../../../shared/order-flow';
import { TokenService } from '../../../services/shared/token.service';
import { norm } from '../../../core/tokens/token-normalize';

import {
  optionsPageActions,
  OptionsTradePageCtx,
} from '../../../core/overlay/order-flow-launcher/order-flow-actions/options-flow-actions';

@Component({
  selector: 'app-options-trade',
  standalone: true,
  imports: [CommonModule, MarketDetailPanelComponent, SpotSummaryHeaderComponent, OrderReviewFlowComponent],
  templateUrl: './options-trade.component.html',
})
export class OptionsTradeComponent {
  bigint(arg0: number): bigint {
    return BigInt(arg0);
  }
  readonly Math = Math;

  readonly ob = inject(OptionsOrderBookFacade);
  readonly flow = inject(OrderFlowService);
  readonly orderSelection = inject(OrderbookSelectionService);
  private readonly tokens = inject(TokenService);

  // ================= OrderFlowLauncher =================
  readonly ctx: OptionsTradePageCtx = {};
  readonly actions = optionsPageActions;

  readonly view = signal<'markets' | 'orders' | 'positions' | 'my-orders'>('markets');
  readonly expandedMarketInfo = signal<Record<string, boolean>>({});
  readonly hoveredMarketKey = signal<string | null>(null);
  readonly copiedValue = signal<string | null>(null);
  readonly mainTokens = this.tokens.main;
  readonly whitelistTokens = this.tokens.whitelist;

  // ================= Hover / Pin (order details) =================
  readonly hoveredOrder = signal<any | null>(null);
  readonly pinnedOrder = signal<any | null>(null);

  onOrderHover(row: LadderRow | null) {
    if (!row) return;
    if (this.pinnedOrder()) return;
    this.hoveredOrder.set(row.orderId.toString());
  }

  clearOrderHover() {
    if (this.pinnedOrder()) return;
    this.hoveredOrder.set(null);
  }

  togglePinOrder(row: LadderRow | null, ev: MouseEvent) {
    if (!row) return;

    const t = ev.target as HTMLElement | null;
    // don't pin while clicking buttons/inputs
    if (t?.closest('button,input,select,textarea,label')) return;

    const id = row.orderId.toString();
    this.pinnedOrder.set(this.pinnedOrder() === id ? null : id);
    this.hoveredOrder.set(id);
  }

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
      // Keep value selectable if clipboard access is unavailable.
    }
  }

  copyText(v: any) {
    void this.copyValue(v);
  }

  openMarket(m: { marketKey: string }) {
    this.ob.store.selectMarket(m.marketKey);
    this.orderSelection.clear('options');
    this.ob.store.clearSelectedPosition();
    this.view.set('orders');
    this.ob.store.activeView.set('orders');
  }

  backToMarkets() {
    this.ob.store.clearMarket();
    this.orderSelection.clear('options');
    this.ob.store.clearSelectedPosition();
    this.view.set('markets');
    this.ob.store.activeView.set('markets');
  }

  openPositions() {
    this.ob.store.clearMarket();
    this.view.set('positions');
    this.ob.store.activeView.set('positions');
    this.orderSelection.clear('options');
  }

  openMyOrders() {
    this.ob.store.clearMarket();
    this.ob.store.clearSelectedPosition();
    this.view.set('my-orders');
    this.ob.store.activeView.set('my-orders');
    this.orderSelection.clear('options');
  }

  openPlaceOrder(): void {
    this.flow.open(OptionsOrderModalComponent, {
      intent: 'buy',
      defaultMarketKey: this.ob.store.selectedMarketKey() ?? undefined,
    });
  }

  openFeeQuote(): void {
    this.flow.open(OptionsOrderModalComponent, {
      intent: 'quote',
      defaultMarketKey: this.ob.store.selectedMarketKey() ?? undefined,
    });
  }

  optionLadderRows(): Array<{ key: string; bid: LadderRow | null; ask: LadderRow | null }> {
    const bids = this.ob.store.bids();
    const asks = this.ob.store.asks();
    const length = Math.max(bids.length, asks.length);
    return Array.from({ length }, (_, index) => ({
      key: `${bids[index]?.orderId?.toString() ?? 'empty-bid'}:${asks[index]?.orderId?.toString() ?? 'empty-ask'}:${index}`,
      bid: bids[index] ?? null,
      ask: asks[index] ?? null,
    }));
  }

  trackOptionLadderRow = (_: number, row: { key: string }) => row.key;


  marketsMetrics(): SpotSummaryMetric[] {
    return [
      { label: 'Markets', value: this.ob.store.visibleMarkets().length },
      { label: 'My Positions', value: this.ob.store.myPositions().length },
      { label: 'My Orders', value: this.ob.store.myOrders().length },
      { label: 'Filtered', value: this.ob.store.marketsWithMyOrdersOnly() ? 'My orders only' : 'All markets', tone: 'muted' },
    ];
  }

  selectedMarketPositions(): any[] {
    const key = this.ob.store.selectedMarketKey();
    if (!key) return [];
    return this.ob.store.myPositions().filter((p: any) => String(p.marketKey ?? '').toLowerCase() === String(key).toLowerCase());
  }

  positionsMetrics(): SpotSummaryMetric[] {
    const positions = this.ob.store.myPositions();
    const holders = positions.filter((p: any) => (p.holderAvail ?? 0n) > 0n).length;
    const writers = positions.filter((p: any) => (p.writerSize ?? 0n) > 0n).length;
    return [
      { label: 'Positions', value: positions.length },
      { label: 'Holder', value: holders, tone: holders > 0 ? 'up' : 'muted' },
      { label: 'Writer', value: writers, tone: writers > 0 ? 'down' : 'muted' },
      { label: 'Filtered', value: this.ob.store.marketsWithMyOrdersOnly() ? 'My orders only' : 'All markets', tone: 'muted' },
    ];
  }

  myOrdersMetrics(): SpotSummaryMetric[] {
    const orders = this.ob.store.myOrders();
    const bids = orders.filter((row: any) => row.side === 'bid').length;
    const asks = orders.filter((row: any) => row.side === 'ask').length;
    return [
      { label: 'My Orders', value: orders.length },
      { label: 'Bids', value: bids, tone: bids > 0 ? 'up' : 'muted' },
      { label: 'Asks', value: asks, tone: asks > 0 ? 'down' : 'muted' },
      { label: 'Filtered', value: this.ob.store.marketsWithMyOrdersOnly() ? 'My orders only' : 'All markets', tone: 'muted' },
    ];
  }


  selectedMarketSummaryMetrics(sel: any, info: any): SpotSummaryMetric[] {
    return [
      {
        label: 'Strike',
        value: info ? this.ob.store.formatPriceFixed(info.strikePrice, info.assetToken, info.quoteToken) : '—',
      },
      { label: 'Expiry', value: this.formatExpiry(sel?.market ? sel?.market?.expiry : sel?.derived?.optionExpiry) },
      { label: 'Token', value: info ? this.ob.store.tokenLabel(info.quoteToken) : '—' },
      {
        label: 'Best Bid',
        value: this.ob.store.bestBid() !== null && info ? this.ob.store.formatPriceFixed(this.ob.store.bestBid()!, info.assetToken, info.quoteToken) : '—',
        tone: 'up',
      },
      {
        label: 'Best Ask',
        value: this.ob.store.bestAsk() !== null && info ? this.ob.store.formatPriceFixed(this.ob.store.bestAsk()!, info.assetToken, info.quoteToken) : '—',
        tone: 'down',
      },
      {
        label: 'Spread',
        value: this.ob.store.spread() !== null && info ? this.ob.store.formatPriceFixed(this.ob.store.spread()!, info.assetToken, info.quoteToken) : '—',
      },
    ];
  }

  selectOrder(row: LadderRow | null, ev?: MouseEvent): void {
    if (!row) return;
    const t = ev?.target as HTMLElement | null;
    if (t?.closest('button,input,select,textarea,label')) return;
    this.orderSelection.selectOrToggle({
      product: 'options',
      marketKey: row.order?.marketKey ?? this.ob.store.selectedMarketKey(),
      orderId: row.orderId.toString(),
      side: row.side,
      isMine: !!row.isMine,
      order: row.order,
    });
    this.pinnedOrder.set(row.orderId.toString());
    this.hoveredOrder.set(row.orderId.toString());
  }

  isSelectedOrder(row: LadderRow | null): boolean {
    return !!row && this.orderSelection.isSelected('options', row.orderId);
  }

  selectMyOrder(row: LadderRow | null, ev?: MouseEvent): void {
    this.selectOrder(row, ev);
  }

  optionIntentLabel(intent: any): string {
    switch (Number(intent ?? 0)) {
      case 0: return 'Buy Option';
      case 1: return 'Sell Option';
      case 2: return 'Write Option';
      case 3: return 'Sell Writer';
      default: return 'Order';
    }
  }

  optionInfo(row: any): any {
    return row?.market ?? row?.derived ?? row?.order ?? null;
  }

  optionAssetToken(row: any): string {
    return this.optionInfo(row)?.assetToken ?? '';
  }

  optionQuoteToken(row: any): string {
    return this.optionInfo(row)?.quoteToken ?? '';
  }

  optionTypeLabel(row: any): string {
    return Number(this.optionInfo(row)?.optionType ?? 0) === 0 ? 'CALL' : 'PUT';
  }

  orderOptionTypeLabel(row: LadderRow | null): string {
    return Number(row?.order?.optionType ?? 0) === 0 ? 'CALL' : 'PUT';
  }

  isWhitelistedToken(address: string | null | undefined): boolean {
    const key = norm(String(address ?? ''));
    if (!key) return false;
    return (
      this.mainTokens().some((token) => norm(token.address) === key) ||
      this.whitelistTokens().some((token) => norm(token.address) === key)
    );
  }

  orderMarketTitle(row: LadderRow | null): string {
    if (!row?.order) return '—';
    const type = Number(row.order.optionType ?? 0) === 0 ? 'CALL' : 'PUT';
    return `${type} ${this.ob.store.tokenLabel(row.order.assetToken)} / ${this.ob.store.tokenLabel(row.order.quoteToken)}`;
  }


  selectPosition(row: any, ev?: MouseEvent): void {
    const t = ev?.target as HTMLElement | null;
    if (t?.closest('button,input,select,textarea,label')) return;
    if (row?.marketKey) this.ob.store.selectPosition(row.marketKey);
  }

  isSelectedPosition(row: any): boolean {
    return !!row?.marketKey && this.ob.store.selectedPosition()?.marketKey === row.marketKey;
  }


  toggleMarketInfo(marketKey: string, ev?: Event): void {
    ev?.stopPropagation?.();
    this.expandedMarketInfo.update((curr) => ({ ...curr, [marketKey]: !curr[marketKey] }));
  }

  closeMarketInfo(marketKey: string): void {
    this.expandedMarketInfo.update((curr) => ({ ...curr, [marketKey]: false }));
    if (this.hoveredMarketKey() === marketKey) this.hoveredMarketKey.set(null);
  }

  isMarketInfoOpen(marketKey: string): boolean {
    return !!this.expandedMarketInfo()[marketKey] || this.hoveredMarketKey() === marketKey;
  }

  optionMarketTitle(row: any): string {
    const m = row?.market ?? row?.derived ?? null;
    if (!m) return '—';
    const type = (m.optionType ?? 0) === 0 ? 'CALL' : 'PUT';
    return `${type} ${this.ob.store.tokenLabel(m.assetToken)} / ${this.ob.store.tokenLabel(m.quoteToken)}`;
  }

  latestOraclePriceLabel(row: any): string {
    const m = row?.market ?? row?.derived ?? {};
    if (m.settled && m.settlementPrice && m.settlementPrice > 0n) return `${this.ob.store.formatPriceFixed(m.settlementPrice, m.assetToken, m.quoteToken)} (settlement)`;
    if (m.latestOraclePrice !== undefined && m.latestOraclePrice !== null) return this.ob.store.formatPriceFixed(m.latestOraclePrice, m.assetToken, m.quoteToken);
    return '—';
  }

  latestOracleTimeLabel(row: any): string {
    const m = row?.market ?? row?.derived ?? {};
    const ts = m.latestOracleTimestamp;
    if (!ts || ts === 0n) return '—';
    return this.formatExpiry(ts);
  }

  optionMarketDetailItems(row: any): MarketDetailItem[] {
    const m = row?.market ?? row?.derived ?? {};
    return [
      { label: 'Market key', value: row?.marketKey, mono: true, copyable: true, fullWidth: true },
      { label: 'Type', value: (m.optionType ?? 0) === 0 ? 'CALL' : 'PUT' },
      { label: 'Asset token', value: this.ob.store.tokenLabel(m.assetToken) },
      { label: 'Quote token', value: this.ob.store.tokenLabel(m.quoteToken) },
      { label: 'Strike', value: m.strikePrice !== undefined ? this.ob.store.formatPriceFixed(m.strikePrice, m.assetToken, m.quoteToken) : '—' },
      { label: 'Expiry', value: this.formatExpiry(m.expiry ?? m.optionExpiry) },
      { label: 'Settlement', value: m.settled ? 'Settled' : 'Open' },
    ];
  }


  setMarketSearch(value: string): void { this.ob.store.marketSearch.set(String(value ?? '')); this.ob.store.marketOffset.set(0); }
  setMarketsWithMyOrdersOnly(value: boolean): void { this.ob.store.marketsWithMyOrdersOnly.set(!!value); this.ob.store.marketOffset.set(0); }
  marketsPageLabel(): string { const limit = Math.max(1, Number(this.ob.store.marketLimit() || 25)); return String(Math.floor(Number(this.ob.store.marketOffset() || 0) / limit) + 1); }
  previousMarketsPage(): void { const limit = Math.max(1, Number(this.ob.store.marketLimit() || 25)); this.ob.store.marketOffset.set(Math.max(0, Number(this.ob.store.marketOffset() || 0) - limit)); }
  nextMarketsPage(): void { const limit = Math.max(1, Number(this.ob.store.marketLimit() || 25)); this.ob.store.marketOffset.set(Number(this.ob.store.marketOffset() || 0) + limit); }

  trackMarket = (_: number, m: { marketKey: string }) => m.marketKey;
  trackOrder = (_: number, r: any) => r.orderId?.toString?.() ?? _;

  range(n: number): number[] {
    const nn = Math.max(0, Math.floor(Number(n ?? 0)));
    return Array.from({ length: nn }, (_, i) => i);
  }

  formatDateTime(unixSec: any): string {
    return this.formatExpiry(unixSec);
  }

  roleLabel(row: any): string {
    const roles: string[] = [];
    if ((row?.holderAvail ?? 0n) > 0n) roles.push('Holder');
    if ((row?.writerSize ?? 0n) > 0n) roles.push('Writer');
    return roles.join(' + ') || '—';
  }

  isPositive(value: any): boolean {
    try { return BigInt(value ?? 0) > 0n; } catch { return Number(value ?? 0) > 0; }
  }

  canSellHolder(row: any): boolean {
    return !!row?.canSellHolder;
  }

  canSellWriter(row: any): boolean {
    return !!row?.canSellWriter;
  }

  canExercise(row: any): boolean {
    return !!row?.canExercise;
  }

  canReclaim(row: any): boolean {
    return !!row?.canReclaim;
  }


  positionActionSummary(row: any): string {
    const parts: string[] = ['Buy more is always available for an open market.'];
    parts.push(`Sell holder: ${row?.sellHolderHint ?? 'not available'}`);
    parts.push(`Sell writer: ${row?.sellWriterHint ?? 'not available'}`);
    parts.push(`Exercise: ${row?.exerciseHint ?? 'not available'}`);
    parts.push(`Reclaim: ${row?.reclaimHint ?? 'not available'}`);
    return parts.join(' | ');
  }

  onPositionActionChange(event: Event, row: any): void {
    const select = event.target as HTMLSelectElement | null;
    const value = select?.value ?? '';
    if (select) { select.value = ''; select.selectedIndex = 0; }

    if (value === 'buy') {
      this.openBuyFromPosition(row);
      return;
    }
    if (value === 'sell-holder' && this.canSellHolder(row)) {
      this.openSellHolderFromPosition(row);
      return;
    }
    if (value === 'sell-writer' && this.canSellWriter(row)) {
      this.openSellWriterFromPosition(row);
      return;
    }
    if (value === 'exercise' && this.canExercise(row)) {
      this.openExerciseFromPosition(row);
      return;
    }
    if (value === 'reclaim' && this.canReclaim(row)) {
      this.openReclaimFromPosition(row);
    }
  }

  formatExpiry(unixSec: any): string {
    try {
      const s =
        typeof unixSec === 'bigint' ? Number(unixSec) : Number(unixSec ?? 0);
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

  // ================= Position actions (prefill modal) =================
  private positionInfo(row: any) {
    const info = row?.market ?? row?.derived ?? null;
    return info;
  }

  openBuyFromPosition(row: any) {
    const info = this.positionInfo(row);
    if (!info) return;
    this.flow.open(OptionsOrderModalComponent, {
      intent: 'buy',
      defaultMarketKey: row.marketKey,
      defaultOptionType: info.optionType,
      defaultAssetToken: info.assetToken,
      defaultQuoteToken: info.quoteToken,
      defaultStrikePrice: info.strikePrice,
      defaultOptionExpiry: info.optionExpiry ?? info.expiry,
    });
  }

  openSellHolderFromPosition(row: any) {
    const info = this.positionInfo(row);
    if (!info) return;
    // If you hold options you typically "selloption" (ask). Writer size -> "write" is different.
    this.flow.open(OptionsOrderModalComponent, {
      intent: 'selloption',
      defaultMarketKey: row.marketKey,
      defaultOptionType: info.optionType,
      defaultAssetToken: info.assetToken,
      defaultQuoteToken: info.quoteToken,
      defaultStrikePrice: info.strikePrice,
      defaultOptionExpiry: info.optionExpiry ?? info.expiry,
    });
  }

  openSellWriterFromPosition(row: any) {
    const info = this.positionInfo(row);
    if (!info) return;
    this.flow.open(OptionsOrderModalComponent, {
      intent: 'sellwriter',
      defaultMarketKey: row.marketKey,
      defaultOptionType: info.optionType,
      defaultAssetToken: info.assetToken,
      defaultQuoteToken: info.quoteToken,
      defaultStrikePrice: info.strikePrice,
      defaultOptionExpiry: info.optionExpiry ?? info.expiry,
    });
  }

  openExerciseFromPosition(row: any) {
    const info = this.positionInfo(row);
    if (!info) return;
    this.flow.open(OptionsOrderModalComponent, {
      intent: 'exercise',
      defaultMarketKey: row.marketKey,
      defaultOptionType: info.optionType,
      defaultAssetToken: info.assetToken,
      defaultQuoteToken: info.quoteToken,
      defaultStrikePrice: info.strikePrice,
      defaultOptionExpiry: info.optionExpiry ?? info.expiry,
    });
  }

  openReclaimFromPosition(row: any) {
    const info = this.positionInfo(row);
    if (!info) return;
    this.flow.open(OptionsOrderModalComponent, {
      intent: 'reclaim',
      defaultMarketKey: row.marketKey,
      defaultOptionType: info.optionType,
      defaultAssetToken: info.assetToken,
      defaultQuoteToken: info.quoteToken,
      defaultStrikePrice: info.strikePrice,
      defaultOptionExpiry: info.optionExpiry ?? info.expiry,
    });
  }
}
