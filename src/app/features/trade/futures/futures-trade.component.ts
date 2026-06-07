import { Component, inject, signal } from '@angular/core';
import { stableComputed } from '../../../core/signals/stable-resource';
import { CommonModule } from '@angular/common';
import { ethers } from 'ethers';

import { FuturesOrderBookFacade } from '../../../services/shared/futures-orderbook/futures-orderbook.facade';
import { OrderFlowService } from '../../../core/overlay/order-flow.service';
import { FuturesOrderModalComponent } from '../../../core/overlay/order-modal/futuresorder-modal.component';
import { OrderbookSelectionService, MarketDetailPanelComponent, SpotSummaryHeaderComponent, type MarketDetailItem, type SpotSummaryMetric } from '../../../shared/orderbook';
import { OrderReviewFlowComponent } from '../../../shared/order-flow';
import { FuturesMaintenanceService } from '../../../services/onchain/contracts/futures-maintenance.service';

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
  readonly maintenance = inject(FuturesMaintenanceService);

  trackMetric = (_: number, row: SpotSummaryMetric) => row.label;

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


  async syncSelectedSettlement(): Promise<void> {
    const marketKey = this.ob.store.selectedMarketKey();
    if (!marketKey) return;
    await this.maintenance.syncSettlementPrice(marketKey);
  }

  async syncSelectedSettlementAsTreasurer(): Promise<void> {
    const marketKey = this.ob.store.selectedMarketKey();
    if (!marketKey) return;
    await this.maintenance.syncSettlementPriceAsTreasurer(marketKey);
  }

  async matchSelectedImbalance(): Promise<void> {
    const marketKey = this.ob.store.selectedMarketKey();
    if (!marketKey) return;
    await this.maintenance.matchImbalanceFromSelectedAccount(marketKey, 25n);
  }

  readonly selectedMaintenanceActions = stableComputed<SpotSummaryMetric[]>(() => {
    const row = this.ob.store.selectedMarketRow();
    const marketKey = this.ob.store.selectedMarketKey();
    if (!row || !marketKey) return [];
    return [
      { label: 'Settlement block', value: row.market?.lastSettlementBlock?.toString?.() ?? '—' },
      { label: 'Last settlement', value: this.formatSettlementPriceFull(row) },
      { label: 'Account path', value: this.maintenance.selectedExecutionAccount() ? this.shortAddress(this.maintenance.selectedExecutionAccount()) : 'No account', tone: this.maintenance.selectedExecutionAccount() ? 'muted' : 'down' },
    ];
  });

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
    return this.ob.store.formatOraclePrice(v, this.ob.store.selectedMarketRow()?.market?.oraclePriceDecimals ?? 18);
  }

  formatFuturesOrderPrice(row: any): string {
    const market = row?.marketKey
      ? this.ob.store.activeMarkets().find((m) => m.marketKey === row.marketKey)?.market
      : this.ob.store.selectedMarketRow()?.market;
    return this.ob.store.formatOraclePrice(BigInt(row?.price ?? 0n), market?.oraclePriceDecimals ?? 18);
  }

  readonly marketsMetrics = stableComputed<SpotSummaryMetric[]>(() => [
    { label: 'Markets', value: this.ob.store.visibleMarkets().length },
    { label: 'My Positions', value: this.ob.store.myPositions().length },
    { label: 'My Orders', value: this.ob.store.myOrders().length },
    { label: 'Filtered', value: this.ob.store.marketsWithMyOrdersOnly() ? 'My orders only' : 'All markets', tone: 'muted' },
  ]);

  readonly myOrdersMetrics = stableComputed<SpotSummaryMetric[]>(() => {
    const orders = this.ob.store.myOrders();
    const buy = orders.filter((order: any) => order.side === 0).length;
    const sell = orders.filter((order: any) => order.side === 1).length;
    return [
      { label: 'My Orders', value: orders.length },
      { label: 'Buy / Long', value: buy, tone: buy > 0 ? 'up' : 'muted' },
      { label: 'Sell / Short', value: sell, tone: sell > 0 ? 'down' : 'muted' },
      { label: 'Filtered', value: this.ob.store.marketsWithMyOrdersOnly() ? 'My orders only' : 'All markets', tone: 'muted' },
    ];
  });

  readonly positionsMetrics = stableComputed<SpotSummaryMetric[]>(() => {
    const positions = this.ob.store.myPositions();
    const long = positions.reduce((acc, p) => acc + BigInt(p.longSize ?? 0n), 0n);
    const short = positions.reduce((acc, p) => acc + BigInt(p.shortSize ?? 0n), 0n);
    return [
      { label: 'Positions', value: positions.length },
      { label: 'Long contracts', value: this.ob.store.formatContracts(long), tone: long > 0n ? 'up' : 'muted' },
      { label: 'Short contracts', value: this.ob.store.formatContracts(short), tone: short > 0n ? 'down' : 'muted' },
      { label: 'Filtered', value: this.ob.store.marketsWithMyOrdersOnly() ? 'My orders only' : 'All markets', tone: 'muted' },
    ];
  });

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


  readonly futuresLadderRows = stableComputed<Array<{ bid: any | null; ask: any | null }>>(() => {
    const bids = this.ob.store.buyOrders();
    const asks = this.ob.store.sellOrders();
    const length = Math.max(bids.length, asks.length);
    return Array.from({ length }, (_, index) => ({
      bid: bids[index] ?? null,
      ask: asks[index] ?? null,
    }));
  });

  trackFuturesLadderRow(index: number, row: { bid: any | null; ask: any | null }): string {
    return `${row.bid?.orderId?.toString?.() ?? 'b'}-${row.ask?.orderId?.toString?.() ?? 'a'}-${index}`;
  }

  selectLadderOrder(row: any | null, side: 'buy' | 'sell', ev?: MouseEvent): void {
    if (!row) return;
    ev?.stopPropagation();
    this.orderSelection.selectOrToggle({
      product: 'futures',
      marketKey: this.ob.store.selectedMarketKey(),
      orderId: row.orderId?.toString?.() ?? String(row.orderId ?? ''),
      side,
      isMine: this.isOwnOrder(row),
      order: row,
    });
  }

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

  oracleDecimalsFor(m: any): number {
    return (m?.market?.oraclePriceDecimals ?? 18) as number;
  }

  formatSettlementPriceFull(m: any): string {
    return this.ob.store.formatOraclePrice(
      this.settlementPriceFor(m),
      this.oracleDecimalsFor(m),
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

    // Most protocol deployments use WAD-scaled multipliers. Some local/test
    // seeds use plain unit values. Keep the display adaptive so a multiplier
    // of 1 is shown as 1x, while 1e18 is also shown as 1x.
    if (raw >= 10n ** 12n) {
      const formatted = ethers.formatUnits(raw, 18);
      const trimmed = formatted.includes('.')
        ? formatted.replace(/0+$/, '').replace(/\.$/, '')
        : formatted;
      return `${trimmed || '0'}x`;
    }

    return `${raw.toString()}x`;
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

  private readonly wad = 10n ** 18n;

  normalizedMultiplier(m: any): bigint {
    const raw = BigInt(m?.market?.multiplier ?? 0n);
    if (raw <= 0n) return 0n;

    // Protocol multipliers can be WAD-scaled; local seeds sometimes use
    // plain unit values. Normalize both to 1e18 for notional math.
    return raw >= 10n ** 12n ? raw : raw * this.wad;
  }

  normalizedOraclePrice18(m: any): bigint {
    const market = m?.market;
    if (!market) return 0n;
    return this.ob.store.normalizeOraclePrice(
      market.lastSettlementPrice,
      market.oraclePriceDecimals,
      18,
    );
  }

  notionalPerContract(m: any): bigint {
    const price = this.normalizedOraclePrice18(m);
    const multiplier = this.normalizedMultiplier(m);
    if (!price || !multiplier) return 0n;
    return (price * multiplier) / this.wad;
  }

  currentRequiredMarginPerUnit(m: any): bigint {
    const market = m?.market;
    if (!market) return 0n;

    return (
      this.notionalPerContract(m) *
      BigInt(market.initialMarginBps ?? 0n)
    ) / 10_000n;
  }

  notionalExposure(m: any, rawContracts: bigint | number | string | null | undefined): bigint {
    const contracts = BigInt(rawContracts?.toString?.() ?? '0');
    if (!contracts) return 0n;
    return (contracts * this.notionalPerContract(m)) / this.wad;
  }

  openInterestContracts(row: any): bigint {
    const long = BigInt(row?.totalLongUnits?.toString?.() ?? '0');
    const short = BigInt(row?.totalShortUnits?.toString?.() ?? '0');
    return long < short ? long : short;
  }

  futuresMarketDetailItems(row: any): MarketDetailItem[] {
    const m = row?.market ?? {};
    const openInterest = this.openInterestContracts(row);
    return [
      { label: 'Market key', value: row?.marketKey, mono: true, copyable: true, fullWidth: true },
      { label: 'Ticker', value: m.ticker || '—' },
      { label: 'Payment token', value: 'ETH' },
      { label: 'Oracle address', value: m.oracle || '—', mono: true, copyable: true, fullWidth: true },
      { label: 'Latest oracle price', value: this.formatSettlementPriceFull(row) },
      { label: 'Latest oracle update', value: m.lastSettlementBlock ? `block ${m.lastSettlementBlock?.toString?.() ?? m.lastSettlementBlock}` : '—' },
      { label: 'Contract multiplier', value: this.formatMultiplier(row) },
      { label: 'Notional / contract', value: `${this.formatEthValue(this.notionalPerContract(row))} ETH` },
      { label: 'Required margin / contract', value: `${this.formatEthValue(this.currentRequiredMarginPerUnit(row))} ETH` },
      { label: 'Long holders', value: row?.longHolders ?? 0, fullWidth: true },
      { label: 'Long contracts', value: this.formatMarketUnits(row?.totalLongUnits ?? 0n), fullWidth: true },
      { label: 'Long notional exposure', value: `${this.formatEthValue(this.notionalExposure(row, row?.totalLongUnits ?? 0n))} ETH`, fullWidth: true },
      { label: 'Long margin', value: `${this.formatMarketMargin(row?.totalLongMargin ?? 0n, row)} ETH`, fullWidth: true },
      { label: 'Short holders', value: row?.shortHolders ?? 0, fullWidth: true },
      { label: 'Short contracts', value: this.formatMarketUnits(row?.totalShortUnits ?? 0n), fullWidth: true },
      { label: 'Short notional exposure', value: `${this.formatEthValue(this.notionalExposure(row, row?.totalShortUnits ?? 0n))} ETH`, fullWidth: true },
      { label: 'Short margin', value: `${this.formatMarketMargin(row?.totalShortMargin ?? 0n, row)} ETH`, fullWidth: true },
      { label: 'Open interest', value: this.formatMarketUnits(openInterest), fullWidth: true },
      { label: 'Open interest notional', value: `${this.formatEthValue(this.notionalExposure(row, openInterest))} ETH`, fullWidth: true },
      { label: 'Initial margin', value: this.formatPercentBps(m.initialMarginBps) },
      { label: 'Maintenance margin', value: this.formatPercentBps(m.maintenanceMarginBps) },
    ];
  }

  formatCurrentRequiredMarginPerUnit(m: any): string {
    return this.formatEthValue(this.currentRequiredMarginPerUnit(m));
  }

  formatEthValue(raw: bigint | number | string | null | undefined): string {
    try {
      const formatted = this.ob.store.formatSize(BigInt(raw?.toString?.() ?? '0'), 18);
      return formatted.includes('.')
        ? formatted.replace(/0+$/u, '').replace(/\.$/u, '') || '0'
        : formatted;
    } catch {
      return '0';
    }
  }

  formatMarketMargin(raw: bigint | number | string | null | undefined, _m: any): string {
    return this.formatEthValue(raw);
  }

  formatMarketUnits(raw: bigint | number | string | null | undefined): string {
    return this.ob.store.formatContracts(raw);
  }

  formatMarketNotional(row: any): string {
    return `${this.formatEthValue(this.notionalExposure(row, this.openInterestContracts(row)))} ETH`;
  }

}