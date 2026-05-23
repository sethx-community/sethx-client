import { CommonModule } from '@angular/common';
import { Component, computed, inject, resource, signal } from '@angular/core';
import { ethers } from 'ethers';

import {
  MarketDetailItem,
  MarketDetailPanelComponent,
  MarketSummaryMetric,
  SpotSummaryHeaderComponent,
} from '../../../shared/orderbook';
import {
  LendingAccountSnapshot,
  LendingBondLotRow,
  LendingDebtRow,
  LendingMarketReadService,
  LendingMarketRow,
  LendingMarketSpec,
  LendingOrder,
} from '../../../services/onchain/contracts/lending-market-read.service';
import { TradeSettingsService } from '../../../services/shared/trade-settings.service';
import { AccountsChainService } from '../../../services/onchain/accounts.service';
import { LendingMarketSelectionService } from '../../../services/shared/lending-market/lending-market-selection.service';
import { TriggerService } from '../../../services/shared/trigger.service';
import { OrderFlowService } from '../../../core/overlay/order-flow.service';
import { LendingOrderModalComponent } from '../../../core/overlay/order-modal/lendingorder-modal.component';
import type { LendingOrderModalData } from '../../../../types/order_flow/order-flow.types';

const ETH_BORROW_TOKEN = ethers.ZeroAddress;
const RISK_LEVELS = [1, 2, 3] as const;
const EMPTY_SNAPSHOT: LendingAccountSnapshot = {
  debts: [],
  pendingDebts: [],
  bonds: [],
  orders: [],
};

type LendingView = 'markets' | 'book' | 'loans' | 'bonds' | 'my-orders';

@Component({
  selector: 'app-lending-orderbook',
  standalone: true,
  imports: [CommonModule, MarketDetailPanelComponent, SpotSummaryHeaderComponent],
  templateUrl: './lending-ob.component.html',
  styleUrl: './lending-ob.component.css',
})
export class LendingObComponent {
  private readonly read = inject(LendingMarketReadService);
  private readonly settings = inject(TradeSettingsService);
  private readonly accounts = inject(AccountsChainService);
  private readonly selection = inject(LendingMarketSelectionService);
  private readonly trigger = inject(TriggerService);
  private readonly flow = inject(OrderFlowService);

  readonly ethers = ethers;
  readonly view = signal<LendingView>('markets');
  readonly search = signal('');
  readonly refreshTick = signal(0);
  readonly selectedMarketKey = signal<string | null>(null);
  readonly expandedMarketInfo = signal<Record<string, boolean>>({});
  readonly hoveredMarketKey = signal<string | null>(null);
  readonly copiedValue = signal<string | null>(null);
  readonly marketOffset = signal(0);
  readonly marketLimit = signal(25);
  readonly marketsWithMyOrdersOnly = signal(false);
  readonly myOrdersOnly = signal(false);

  readonly selectedAccount = this.settings.selectedAccountId;

  readonly marketSpecs = computed(() => this.buildMarketSpecs());

  readonly marketRowsResource = resource<
    LendingMarketRow[],
    { account: string | null; tick: number; specKey: string }
  >({
    params: () => ({
      account: this.selectedAccount(),
      tick: this.refreshTick() + this.trigger.lendingOrderbookTick(),
      specKey: this.marketSpecs().map((m) => `${m.expiry}:${m.riskLevel}`).join('|'),
    }),
    loader: async ({ params }) => this.read.loadMarketRows(this.marketSpecs(), params.account),
  });

  readonly accountSnapshotResource = resource<
    LendingAccountSnapshot,
    { account: string | null; tick: number }
  >({
    params: () => ({ account: this.selectedAccount(), tick: this.refreshTick() + this.trigger.lendingOrderbookTick() }),
    loader: async ({ params }) => this.read.loadAccountSnapshot(params.account),
  });

  readonly marketRows = computed(() => this.marketRowsResource.value() ?? this.fallbackMarketRows());
  readonly accountSnapshot = computed(() => this.accountSnapshotResource.value() ?? EMPTY_SNAPSHOT);

  readonly configuredMarketRows = computed(() =>
    this.marketRows().filter((row) => this.shouldDisplayMarket(row)),
  );

  readonly hiddenDisabledSpecs = computed(() =>
    this.marketRows().filter((row) => !this.shouldDisplayMarket(row)).length,
  );

  readonly filteredMarkets = computed(() => {
    const q = this.search().trim().toLowerCase();
    const onlyMine = this.marketsWithMyOrdersOnly();
    const rows = [...this.configuredMarketRows()];

    const filtered = rows.filter((row) => {
      const matchesSearch = !q || [
        row.marketKey,
        this.marketLabel(row),
        `risk ${row.riskLevel}`,
        this.expiryLabel(row.expiry),
        this.marketStatusText(row),
      ].join(' ').toLowerCase().includes(q);
      const matchesMine = !onlyMine || row.myLendOrders + row.myBorrowOrders > 0;
      return matchesSearch && matchesMine;
    });

    return filtered.sort((a, b) => {
      const aScore = (a.exists ? 4 : 0) + (a.active ? 2 : 0) + (a.riskEnabled ? 1 : 0);
      const bScore = (b.exists ? 4 : 0) + (b.active ? 2 : 0) + (b.riskEnabled ? 1 : 0);
      if (aScore !== bScore) return bScore - aScore;
      if (a.expiry !== b.expiry) return a.expiry - b.expiry;
      return a.riskLevel - b.riskLevel;
    });
  });

  readonly visibleMarkets = computed(() => {
    const start = Math.max(0, Number(this.marketOffset() || 0));
    const limit = Math.max(1, Number(this.marketLimit() || 25));
    return this.filteredMarkets().slice(start, start + limit);
  });

  readonly selectedMarket = computed(() => {
    const key = this.selectedMarketKey();
    const rows = this.configuredMarketRows();
    if (key) return rows.find((row) => row.marketKey === key) ?? null;
    return rows.find((row) => row.exists && row.active)
      ?? rows.find((row) => row.riskEnabled)
      ?? rows[0]
      ?? null;
  });

  readonly selectedLendOrders = computed(() => {
    const rows = this.selectedMarket()?.lendOrders ?? [];
    return this.myOrdersOnly() ? rows.filter((order) => this.isMyOrder(order)) : rows;
  });
  readonly selectedBorrowOrders = computed(() => {
    const rows = this.selectedMarket()?.borrowOrders ?? [];
    return this.myOrdersOnly() ? rows.filter((order) => this.isMyOrder(order)) : rows;
  });

  readonly myOpenOrders = computed(() => this.accountSnapshot().orders);
  readonly myLendOrders = computed(() => this.myOpenOrders().filter((order) => order.side === 0));
  readonly myBorrowOrders = computed(() => this.myOpenOrders().filter((order) => order.side === 1));

  readonly selectedAccountRecord = computed(() => {
    const key = this.selectedAccount();
    return this.accounts.accountRecords().find((account) => account.address === key) ?? null;
  });

  readonly isSelectedAccountLending = computed(() => this.selectedAccountRecord()?.type === 'lending');

  readonly pageMetrics = computed<MarketSummaryMetric[]>(() => {
    const rows = this.configuredMarketRows();
    const hiddenDisabled = this.hiddenDisabledSpecs();
    const snapshot = this.accountSnapshot();
    return [
      { label: 'Markets', value: rows.length },
      { label: 'Created', value: rows.filter((row) => row.exists).length },
      { label: 'Ready', value: rows.filter((row) => !row.exists && row.riskEnabled).length },
      { label: 'Disabled specs', value: hiddenDisabled, tone: hiddenDisabled ? 'muted' : 'default' },
      { label: 'Open orders', value: rows.reduce((sum, row) => sum + row.lendOrders.length + row.borrowOrders.length, 0) },
      { label: 'My debt', value: this.formatEth(snapshot.debts.reduce((sum, row) => sum + row.faceValue, 0n)), tone: snapshot.debts.length ? 'down' : 'default' },
      { label: 'My bonds', value: snapshot.bonds.length },
    ];
  });

  readonly selectedMarketMetrics = computed<MarketSummaryMetric[]>(() => {
    const row = this.selectedMarket();
    if (!row) return [];
    return [
      { label: 'Best lend APR', value: this.bestLendRateText(row), tone: 'up' },
      { label: 'Best borrow APR', value: this.bestBorrowRateText(row), tone: 'down' },
      { label: 'Spread', value: this.rateSpreadText(row) },
      { label: 'Outstanding', value: this.formatEth(row.outstandingFaceValue) },
      { label: 'Recovery', value: this.recoveryRateText(row) },
      { label: 'Status', value: this.marketStatusText(row), tone: row.active ? 'up' : 'muted' },
    ];
  });

  readonly accountMetrics = computed<MarketSummaryMetric[]>(() => {
    const snapshot = this.accountSnapshot();
    const debtFace = snapshot.debts.reduce((sum, row) => sum + row.faceValue, 0n);
    const pending = snapshot.pendingDebts.reduce((sum, row) => sum + row.pendingPrincipal, 0n);
    const bondFace = snapshot.bonds.reduce((sum, row) => sum + row.faceValue, 0n);
    const claimable = snapshot.bonds.reduce((sum, row) => sum + row.initialClaimable + row.supplementalClaimable, 0n);

    return [
      { label: 'Account', value: this.selectedAccountLabel() },
      { label: 'Type', value: this.selectedAccountRecord()?.type ?? '—' },
      { label: 'Active debt', value: this.formatEth(debtFace), tone: debtFace > 0n ? 'down' : 'default' },
      { label: 'Pending borrow', value: this.formatEth(pending), tone: pending > 0n ? 'down' : 'default' },
      { label: 'Bond face', value: this.formatEth(bondFace), tone: bondFace > 0n ? 'up' : 'default' },
      { label: 'Claimable', value: this.formatEth(claimable), tone: claimable > 0n ? 'up' : 'default' },
    ];
  });

  readonly marketDetailItems = computed<MarketDetailItem[]>(() => {
    const row = this.selectedMarket();
    if (!row) return [];
    return [
      { label: 'Market key', value: row.marketKey, mono: true },
      { label: 'Borrow asset', value: row.tokenLabel },
      { label: 'Maturity', value: this.expiryLabel(row.expiry) },
      { label: 'Risk level', value: `R${row.riskLevel}` },
      { label: 'Max LTV', value: this.formatBps(row.maxLtvBps) },
      { label: 'Liquidation LTV', value: this.formatBps(row.liquidationLtvBps) },
      { label: 'Total principal', value: this.formatEth(row.totalPrincipal) },
      { label: 'Total face value', value: this.formatEth(row.totalFaceValue) },
      { label: 'Outstanding principal', value: this.formatEth(row.outstandingPrincipal) },
      { label: 'Outstanding face value', value: this.formatEth(row.outstandingFaceValue) },
      { label: 'Cumulative losses', value: this.formatEth(row.cumulativeLosses) },
      { label: 'My orders here', value: row.myLendOrders + row.myBorrowOrders },
    ];
  });

  setSearch(value: string): void {
    this.search.set(value);
    this.marketOffset.set(0);
  }

  setMarketsWithMyOrdersOnly(value: boolean): void {
    this.marketsWithMyOrdersOnly.set(!!value);
    this.marketOffset.set(0);
  }

  setMyOrdersOnly(value: boolean): void {
    this.myOrdersOnly.set(!!value);
  }

  marketsPageLabel(): string {
    const limit = Math.max(1, Number(this.marketLimit() || 25));
    return String(Math.floor(Number(this.marketOffset() || 0) / limit) + 1);
  }

  previousMarketsPage(): void {
    const limit = Math.max(1, Number(this.marketLimit() || 25));
    this.marketOffset.set(Math.max(0, Number(this.marketOffset() || 0) - limit));
  }

  nextMarketsPage(): void {
    const limit = Math.max(1, Number(this.marketLimit() || 25));
    this.marketOffset.set(Number(this.marketOffset() || 0) + limit);
  }

  async copyValue(value: string | null | undefined, ev?: Event): Promise<void> {
    ev?.stopPropagation?.();
    const text = String(value ?? '');
    if (!text) return;
    try {
      await navigator.clipboard?.writeText(text);
      this.copiedValue.set(text);
      setTimeout(() => {
        if (this.copiedValue() === text) this.copiedValue.set(null);
      }, 1200);
    } catch {
      this.copiedValue.set(text);
    }
  }

  refresh(): void {
    this.refreshTick.update((v) => v + 1);
  }

  openMarkets(): void {
    this.view.set('markets');
  }

  openMarket(row: LendingMarketRow): void {
    this.setSelectedMarket(row);
    this.view.set('book');
  }

  openBook(): void {
    const row = this.selectedMarket();
    if (row) this.openMarket(row);
    else this.view.set('book');
  }

  openLoans(): void {
    this.view.set('loans');
  }

  openBonds(): void {
    this.view.set('bonds');
  }

  openMyOrders(): void {
    this.view.set('my-orders');
  }

  toggleMarketInfo(marketKey: string, ev?: Event): void {
    ev?.stopPropagation?.();
    this.expandedMarketInfo.update((curr) => ({ ...curr, [marketKey]: !curr[marketKey] }));
  }

  isMarketInfoOpen(marketKey: string): boolean {
    return !!this.expandedMarketInfo()[marketKey];
  }


  canUseMarket(row: LendingMarketRow): boolean {
    const now = Math.floor(Date.now() / 1000);
    return row.riskEnabled && !row.primarySettled && (!row.exists || row.active) && row.expiry > now;
  }

  canBorrowMarket(row: LendingMarketRow): boolean {
    return this.canUseMarket(row) && this.isSelectedAccountLending();
  }

  openLendOrder(row: LendingMarketRow, ev?: Event): void {
    ev?.stopPropagation?.();
    this.setSelectedMarket(row);
    this.openLendingModal(this.lendingModalData(row, 'lend', 0));
  }

  openBorrowOrder(row: LendingMarketRow, ev?: Event): void {
    ev?.stopPropagation?.();
    if (!this.canBorrowMarket(row)) return;
    this.setSelectedMarket(row);
    this.openLendingModal(this.lendingModalData(row, 'borrow', 1));
  }

  openCancelLendingOrder(order: LendingOrder, ev?: Event): void {
    ev?.stopPropagation?.();
    const row = this.marketRows().find((market) => market.marketKey === order.marketKey) ?? null;
    this.openLendingModal({
      intent: 'cancel',
      marketKey: order.marketKey,
      marketLabel: row ? this.marketLabel(row) : this.shortKey(order.marketKey),
      riskLevel: row?.riskLevel ?? order.riskLevel,
      marketExpiry: row?.expiry ?? null,
      defaultOrderId: order.orderId.toString(),
      selectedAccountType: this.selectedAccountRecord()?.type ?? null,
      selectedAccountLabel: this.selectedAccountLabel(),
    });
  }

  openRepayDebt(row: LendingDebtRow, ev?: Event): void {
    ev?.stopPropagation?.();
    if (!this.isSelectedAccountLending()) return;
    const market = this.marketRows().find((item) => item.marketKey === row.marketKey) ?? null;
    this.openLendingModal({
      intent: 'repay',
      marketKey: row.marketKey,
      marketLabel: market ? this.marketLabel(market) : this.debtMarketLabel(row),
      riskLevel: market?.riskLevel ?? row.market?.riskLevel ?? null,
      marketExpiry: market?.expiry ?? (row.market ? Number(row.market.expiry) : null),
      defaultAmountHuman: ethers.formatEther(row.faceValue),
      selectedAccountType: this.selectedAccountRecord()?.type ?? null,
      selectedAccountLabel: this.selectedAccountLabel(),
    });
  }


  openRolloverDebt(row: LendingDebtRow, ev?: Event): void {
    ev?.stopPropagation?.();
    if (!this.isSelectedAccountLending()) return;
    const oldMarket = this.marketRows().find((item) => item.marketKey === row.marketKey) ?? null;
    const candidates = this.configuredMarketRows()
      .filter((market) => this.canBorrowMarket(market))
      .filter((market) => market.marketKey !== row.marketKey)
      .filter((market) => !oldMarket || market.riskLevel === oldMarket.riskLevel)
      .filter((market) => market.expiry > Number(oldMarket?.expiry ?? row.market?.expiry ?? 0));
    const target = candidates[0] ?? this.selectedMarket() ?? oldMarket;
    if (!target || target.marketKey === row.marketKey) return;
    this.setSelectedMarket(target);
    this.openLendingModal({
      intent: 'rollover',
      marketKey: target.marketKey,
      marketLabel: `Rollover into ${this.marketLabel(target)}`,
      riskLevel: target.riskLevel,
      marketExpiry: target.expiry,
      defaultSide: 1,
      defaultPrincipalHuman: ethers.formatEther(row.faceValue),
      repayMarketKey: row.marketKey,
      repayMarketLabel: oldMarket ? this.marketLabel(oldMarket) : this.debtMarketLabel(row),
      selectedAccountType: this.selectedAccountRecord()?.type ?? null,
      selectedAccountLabel: this.selectedAccountLabel(),
    });
  }

  openClaimBond(row: LendingBondLotRow, action: 'initial' | 'supplemental', ev?: Event): void {
    ev?.stopPropagation?.();
    const market = this.marketRows().find((item) => item.marketKey === row.marketKey) ?? null;
    this.openLendingModal({
      intent: 'claim',
      marketKey: row.marketKey,
      marketLabel: market ? this.marketLabel(market) : this.bondMarketLabel(row),
      riskLevel: market?.riskLevel ?? row.market?.riskLevel ?? null,
      marketExpiry: market?.expiry ?? (row.market ? Number(row.market.expiry) : null),
      defaultBondIndex: row.bondIndex.toString(),
      defaultClaimAction: action,
      selectedAccountType: this.selectedAccountRecord()?.type ?? null,
      selectedAccountLabel: this.selectedAccountLabel(),
    });
  }

  hasInitialClaim(row: LendingBondLotRow): boolean {
    return !row.initialRedeemed && row.initialClaimable > 0n;
  }

  hasSupplementalClaim(row: LendingBondLotRow): boolean {
    return row.supplementalClaimable > 0n;
  }

  hasAnyBondClaim(row: LendingBondLotRow): boolean {
    return this.hasInitialClaim(row) || this.hasSupplementalClaim(row);
  }

  marketLabel(row: LendingMarketRow): string {
    return `${row.tokenLabel} • ${this.expiryShort(row.expiry)} • R${row.riskLevel}`;
  }

  marketStatusText(row: LendingMarketRow): string {
    if (row.primarySettled) return 'Settled';
    if (row.exists && row.active) return 'Active';
    if (row.exists) return 'Inactive';
    if (!row.riskEnabled) return 'Risk tier disabled';
    return 'Ready for first order';
  }

  marketStatusClass(row: LendingMarketRow): string {
    if (row.primarySettled) return 'text-frame';
    if (row.exists && row.active) return 'text-up';
    if (!row.riskEnabled) return 'text-down';
    return 'text-textlight';
  }

  marketStatusPillClass(row: LendingMarketRow): string {
    if (row.primarySettled) return 'is-muted';
    if (row.exists && row.active) return 'is-ok';
    if (!row.riskEnabled) return 'is-warning';
    return 'is-warning';
  }

  marketInfoItems(row: LendingMarketRow): MarketDetailItem[] {
    return [
      { label: 'Market key', value: row.marketKey, mono: true, copyable: true, fullWidth: true },
      { label: 'Borrow asset', value: row.tokenLabel },
      { label: 'Maturity', value: this.expiryLabel(row.expiry) },
      { label: 'Risk level', value: `R${row.riskLevel}` },
      { label: 'Max LTV', value: this.formatBps(row.maxLtvBps) },
      { label: 'Liquidation LTV', value: this.formatBps(row.liquidationLtvBps) },
      { label: 'Best lend APR', value: this.bestLendRateText(row) },
      { label: 'Best borrow APR', value: this.bestBorrowRateText(row) },
      { label: 'Matched principal', value: this.formatEth(row.totalPrincipal) },
      { label: 'Outstanding face', value: this.formatEth(row.outstandingFaceValue) },
      { label: 'Utilization', value: this.utilizationText(row) },
      { label: 'Recovery estimate', value: this.recoveryRateText(row) },
      { label: 'My orders', value: `${row.myLendOrders} lend / ${row.myBorrowOrders} borrow` },
    ];
  }

  bestLendRate(row: LendingMarketRow): bigint | null {
    if (!row.lendOrders.length) return null;
    return row.lendOrders.reduce((best: bigint | null, order) => best === null || order.rateBps < best ? order.rateBps : best, null);
  }

  bestBorrowRate(row: LendingMarketRow): bigint | null {
    if (!row.borrowOrders.length) return null;
    return row.borrowOrders.reduce((best: bigint | null, order) => best === null || order.rateBps > best ? order.rateBps : best, null);
  }

  bestLendRateText(row: LendingMarketRow): string {
    return this.formatRate(this.bestLendRate(row));
  }

  bestBorrowRateText(row: LendingMarketRow): string {
    return this.formatRate(this.bestBorrowRate(row));
  }

  rateSpreadText(row: LendingMarketRow): string {
    const lend = this.bestLendRate(row);
    const borrow = this.bestBorrowRate(row);
    if (lend === null || borrow === null || borrow < lend) return '—';
    return this.formatRate(borrow - lend);
  }

  utilizationText(row: LendingMarketRow): string {
    if (row.totalPrincipal <= 0n) return '—';
    const bps = Number((row.outstandingPrincipal * 10000n) / row.totalPrincipal);
    return `${(bps / 100).toFixed(2)}%`;
  }

  recoveryRateText(row: LendingMarketRow): string {
    if (row.totalFaceValue <= 0n) return '100.00%';
    if (row.cumulativeLosses >= row.totalFaceValue) return '0.00%';
    const bps = Number(((row.totalFaceValue - row.cumulativeLosses) * 10000n) / row.totalFaceValue);
    return `${(bps / 100).toFixed(2)}%`;
  }

  selectedAccountLabel(): string {
    const account = this.selectedAccount();
    return account ? this.accounts.accountLabel(account) : 'No account selected';
  }

  sideLabel(side: 0 | 1): string {
    return side === 0 ? 'Lend' : 'Borrow';
  }

  sideClass(side: 0 | 1): string {
    return side === 0 ? 'text-up' : 'text-down';
  }

  isMyOrder(order: LendingOrder): boolean {
    const account = String(this.selectedAccount() ?? '').toLowerCase();
    return !!account && String(order.user ?? '').toLowerCase() === account;
  }

  debtMarketLabel(row: LendingDebtRow): string {
    if (row.market) {
      return `ETH • ${this.expiryShort(Number(row.market.expiry))} • R${row.market.riskLevel}`;
    }
    return this.shortKey(row.marketKey);
  }

  bondMarketLabel(row: LendingBondLotRow): string {
    if (row.market) {
      return `ETH • ${this.expiryShort(Number(row.market.expiry))} • R${row.market.riskLevel}`;
    }
    return this.shortKey(row.marketKey);
  }

  orderMarketLabel(order: LendingOrder): string {
    const row = this.marketRows().find((market) => market.marketKey === order.marketKey);
    return row ? this.marketLabel(row) : this.shortKey(order.marketKey);
  }

  recoveryRateForDebt(row: LendingDebtRow): string {
    return this.read.recoveryRateText(row.settlement, row.totals);
  }

  formatEth(raw: bigint | null | undefined): string {
    const value = raw ?? 0n;
    if (value === 0n) return '0 ETH';
    const formatted = ethers.formatEther(value);
    const [whole, fraction = ''] = formatted.split('.');
    const trimmedFraction = fraction.slice(0, 4).replace(/0+$/, '');
    return `${trimmedFraction ? `${whole}.${trimmedFraction}` : whole} ETH`;
  }

  formatRate(raw: bigint | number | null | undefined): string {
    if (raw === null || raw === undefined) return '—';
    const n = typeof raw === 'bigint' ? Number(raw) : raw;
    if (!Number.isFinite(n) || n <= 0) return '—';
    return `${(n / 100).toFixed(2)}%`;
  }

  formatBps(raw: bigint | number | null | undefined): string {
    if (raw === null || raw === undefined) return '—';
    const n = typeof raw === 'bigint' ? Number(raw) : raw;
    if (!Number.isFinite(n) || n <= 0) return '—';
    return `${(n / 100).toFixed(2)}%`;
  }

  expiryLabel(unixSeconds: number | bigint | null | undefined): string {
    const seconds = Number(unixSeconds ?? 0);
    if (!seconds) return '—';
    const d = new Date(seconds * 1000);
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')} 12:00 UTC`;
  }

  expiryShort(unixSeconds: number | bigint | null | undefined): string {
    const seconds = Number(unixSeconds ?? 0);
    if (!seconds) return '—';
    const d = new Date(seconds * 1000);
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
  }

  timeLeftText(unixSeconds: number | bigint | null | undefined): string {
    const seconds = Number(unixSeconds ?? 0);
    if (!seconds) return '—';
    const diff = seconds - Math.floor(Date.now() / 1000);
    if (diff <= 0) return 'Matured';
    const days = Math.floor(diff / 86400);
    if (days > 0) return `${days}d`;
    const hours = Math.floor(diff / 3600);
    return `${Math.max(hours, 1)}h`;
  }

  shortKey(key: string | null | undefined): string {
    const value = String(key ?? '');
    if (value.length <= 14) return value || '—';
    return `${value.slice(0, 8)}...${value.slice(-6)}`;
  }

  lastUpdatedText(): string {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  isLoading(): boolean {
    const marketStatus = String(this.marketRowsResource.status());
    const accountStatus = String(this.accountSnapshotResource.status());
    return marketStatus === 'loading' || accountStatus === 'loading';
  }

  trackMarket = (_: number, row: LendingMarketRow) => row.marketKey;
  trackOrder = (_: number, order: LendingOrder) => order.orderId.toString();
  trackDebt = (_: number, row: LendingDebtRow) => row.marketKey;
  trackBond = (_: number, row: LendingBondLotRow) => row.bondIndex.toString();

  private setSelectedMarket(row: LendingMarketRow): void {
    this.selectedMarketKey.set(row.marketKey);
    this.selection.setMarket({
      marketKey: row.marketKey,
      label: this.marketLabel(row),
      riskLevel: row.riskLevel,
      expiry: row.expiry,
    });
  }

  private lendingModalData(
    row: LendingMarketRow,
    intent: LendingOrderModalData['intent'],
    defaultSide?: 0 | 1,
  ): LendingOrderModalData {
    return {
      intent,
      marketKey: row.marketKey,
      marketLabel: this.marketLabel(row),
      riskLevel: row.riskLevel,
      marketExpiry: row.expiry,
      defaultSide,
      selectedAccountType: this.selectedAccountRecord()?.type ?? null,
      selectedAccountLabel: this.selectedAccountLabel(),
    };
  }

  private openLendingModal(data: LendingOrderModalData): void {
    this.flow.open(LendingOrderModalComponent, data);
  }

  private shouldDisplayMarket(row: LendingMarketRow): boolean {
    // Show actual created markets even if their risk tier is later disabled so users can still monitor, repay, cancel, and redeem.
    // Show uncreated markets only when governance has enabled the risk tier and the first order can lazily create the market.
    return row.exists || row.riskEnabled;
  }

  private fallbackMarketRows(): LendingMarketRow[] {
    return this.marketSpecs().map((spec) => ({
      marketKey: this.read.marketKeyFor(spec),
      borrowToken: ETH_BORROW_TOKEN.toLowerCase(),
      tokenLabel: 'ETH',
      expiry: spec.expiry,
      riskLevel: spec.riskLevel,
      riskEnabled: false,
      maxLtvBps: 0,
      liquidationLtvBps: 0,
      exists: false,
      active: false,
      primarySettled: false,
      totalPrincipal: 0n,
      totalFaceValue: 0n,
      outstandingPrincipal: 0n,
      outstandingFaceValue: 0n,
      cumulativeLosses: 0n,
      lendOrders: [],
      borrowOrders: [],
      myLendOrders: 0,
      myBorrowOrders: 0,
    }));
  }

  private buildMarketSpecs(): LendingMarketSpec[] {
    const expiries = this.nextMonthlyExpiries(6);
    const specs: LendingMarketSpec[] = [];
    for (const expiry of expiries) {
      for (const riskLevel of RISK_LEVELS) {
        specs.push({ borrowToken: ETH_BORROW_TOKEN, expiry, riskLevel });
      }
    }
    return specs;
  }

  private nextMonthlyExpiries(count: number): number[] {
    const out: number[] = [];
    const now = new Date();
    let monthOffset = 0;

    while (out.length < count && monthOffset < count + 18) {
      const y = now.getUTCFullYear();
      const m = now.getUTCMonth() + monthOffset;
      const expiry = this.lastFridayAtNoonUtc(y, m);
      const expirySeconds = Math.floor(expiry.getTime() / 1000);
      if (expirySeconds > Math.floor(Date.now() / 1000)) out.push(expirySeconds);
      monthOffset++;
    }

    return out;
  }

  private lastFridayAtNoonUtc(year: number, zeroBasedMonth: number): Date {
    const d = new Date(Date.UTC(year, zeroBasedMonth + 1, 0, 12, 0, 0));
    while (d.getUTCDay() !== 5) {
      d.setUTCDate(d.getUTCDate() - 1);
    }
    return d;
  }
}
