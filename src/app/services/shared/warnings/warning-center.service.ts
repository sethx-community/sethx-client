import { Injectable, computed, effect, inject, signal, untracked } from '@angular/core';
import {
  WARNING_EXPIRY_ORANGE_WINDOW_SECONDS,
  WARNING_LTV_RED_FRACTION_BPS,
  WARNING_ORACLE_FETCH_ORANGE_WINDOW_SECONDS,
  WARNING_ORACLE_FETCH_RED_WINDOW_SECONDS,
  WarningStatus,
} from '../../../constants/warnings.constants';
import { norm } from '../../../core/tokens/token-normalize';
import { ValuationModuleReadService } from '../../onchain/contracts/valuation-module-read.service';
import { LendingMarketReadService } from '../../onchain/contracts/lending-market-read.service';
import { BinaryOptionsOrderBookStore } from '../binary-options-orderbook/binary-options-orderbook.store';
import { MarginOptionsOrderBookStore } from '../margin-options-orderbook/margin-options-orderbook.store';
import { OptionsOrderBookStore } from '../options-orderbook/options-orderbook.store';
import { TradeSettingsService } from '../trade-settings.service';
import { TriggerService } from '../trigger.service';
import { FuturesOrderBookStore } from '../futures-orderbook/futures-orderbook.store';
import { FuturesMaintenanceService } from '../../onchain/contracts/futures-maintenance.service';
import { ProtocolDataService, type ProtocolOracleInfo } from '../data/protocol-data.service';
import { structuralEqual } from '../../../core/signals/stable-resource';

export type WarningRow = {
  level: WarningStatus;
  type: string;
  title: string;
  detail: string;
  due: bigint;
  action: string;
};

@Injectable({ providedIn: 'root' })
export class WarningCenterService {
  private readonly options = inject(OptionsOrderBookStore);
  private readonly margin = inject(MarginOptionsOrderBookStore);
  private readonly binary = inject(BinaryOptionsOrderBookStore);
  private readonly lending = inject(LendingMarketReadService);
  private readonly valuation = inject(ValuationModuleReadService);
  private readonly settings = inject(TradeSettingsService);
  private readonly trigger = inject(TriggerService);
  private readonly futures = inject(FuturesOrderBookStore);
  private readonly futuresMaintenance = inject(FuturesMaintenanceService);
  private readonly protocolData = inject(ProtocolDataService);

  private readonly _warnings = signal<WarningRow[]>([]);
  private readonly _loading = signal(false);
  private readonly _lastUpdatedAt = signal<number | null>(null);
  private refreshNonce = 0;
  private refreshInFlight: Promise<void> | null = null;
  private refreshQueued = false;

  readonly warnings = this._warnings.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly lastUpdatedAt = this._lastUpdatedAt.asReadonly();
  readonly redCount = computed(() => this._warnings().filter((w) => w.level === 'red').length);
  readonly orangeCount = computed(() => this._warnings().filter((w) => w.level === 'orange').length);
  readonly totalCount = computed(() => this._warnings().length);

  private readonly account = computed(() => norm(this.settings.selectedAccountId() ?? ''));

  constructor() {
    effect(() => {
      this.trigger.warningsTick();
      this.account();
      void this.refresh();
    });
  }

  async refresh(): Promise<void> {
    if (this.refreshInFlight) {
      this.refreshQueued = true;
      return this.refreshInFlight;
    }

    const run = async () => {
      do {
        this.refreshQueued = false;
        await this.refreshOnce();
      } while (this.refreshQueued);
    };

    this.refreshInFlight = run().finally(() => {
      this.refreshInFlight = null;
    });

    return this.refreshInFlight;
  }

  private async refreshOnce(): Promise<void> {
    const nonce = ++this.refreshNonce;
    const account = this.account();
    const now = BigInt(Math.floor(Date.now() / 1000));
    const rows: WarningRow[] = [];

    this._loading.set(true);
    try {
      const oracleInfo = await this.protocolData.refreshOracleInfo();
      if (!oracleInfo && this.protocolData.liveOverview().oracleReadStatus !== 'loaded') return;

      this.addOptionWarnings(rows, now);
      this.addMarginOptionWarnings(rows, now);
      this.addBinaryOptionWarnings(rows, now);
      this.addOracleWarnings(rows, now, oracleInfo ?? this.protocolData.liveOverview().oracleInfo);
      if (account) {
        const snapshot = await this.lending.loadAccountSnapshot(account).catch(() => ({ debts: [], pendingDebts: [], bonds: [], orders: [] }));
        this.addLendingExpiryWarnings(rows, now, snapshot);
        await this.addLendingLtvWarnings(rows, account, snapshot);
        await this.addFuturesWarnings(rows, account, now);
      }
      const committedRows = this.dedupeWarnings(rows).sort((a, b) => Number(a.due - b.due));
      if (nonce === this.refreshNonce) {
        const currentRows = untracked(() => this._warnings());
        if (!structuralEqual(currentRows, committedRows)) {
          this._warnings.set(committedRows);
        }
        this._lastUpdatedAt.set(Date.now());
      }
    } finally {
      if (nonce === this.refreshNonce) this._loading.set(false);
    }
  }


  private addOracleWarnings(rows: WarningRow[], now: bigint, oracleInfo: readonly ProtocolOracleInfo[]): void {
    for (const oracle of oracleInfo) {
      const label = oracle.label || oracle.pair || oracle.oracle;
      const reasons: string[] = [];
      let level: WarningStatus | null = null;
      let due = 0n;
      let action = 'Fetch price and sync oracle data from Info → Oracles.';

      if (oracle.statusLabel && oracle.statusLabel !== 'OK') {
        reasons.push(`${oracle.statusLabel} status`);
        level = oracle.statusLabel === 'PENDING' ? this.highestLevel(level, 'orange') : this.highestLevel(level, 'red');
      }

      const fetched = oracle.lastFetchTimestamp ?? 0n;
      if (fetched <= 0n) {
        reasons.push('no successful fetch timestamp');
        level = this.highestLevel(level, 'orange');
      } else if (now > fetched + WARNING_ORACLE_FETCH_RED_WINDOW_SECONDS) {
        reasons.push(`last fetched ${this.formatAge(now - fetched)} ago`);
        level = this.highestLevel(level, 'red');
        due = fetched + WARNING_ORACLE_FETCH_RED_WINDOW_SECONDS;
        action = 'Fetch price and sync oracle data immediately.';
      } else if (now > fetched + WARNING_ORACLE_FETCH_ORANGE_WINDOW_SECONDS) {
        reasons.push(`last fetched ${this.formatAge(now - fetched)} ago`);
        level = this.highestLevel(level, 'orange');
        due = fetched + WARNING_ORACLE_FETCH_ORANGE_WINDOW_SECONDS;
      }

      if (!level) continue;

      rows.push({
        level,
        type: 'Oracle',
        title: level === 'red' ? 'Oracle needs attention' : 'Oracle needs review',
        detail: `${label}: ${reasons.join('; ')}.`,
        due,
        action,
      });
    }
  }

  private highestLevel(current: WarningStatus | null, next: WarningStatus): WarningStatus {
    if (current === 'red' || next === 'red') return 'red';
    return 'orange';
  }

  private dedupeWarnings(rows: WarningRow[]): WarningRow[] {
    const byKey = new Map<string, WarningRow>();
    for (const row of rows) {
      const key = row.type === 'Oracle'
        ? `${row.type}:${row.detail.split(':')[0].toLowerCase()}`
        : `${row.type}:${row.title}:${row.detail}:${row.due.toString()}`;
      const previous = byKey.get(key);
      if (!previous) {
        byKey.set(key, row);
        continue;
      }
      if (previous.level !== 'red' && row.level === 'red') byKey.set(key, row);
    }
    return Array.from(byKey.values());
  }


  private formatAge(secondsRaw: bigint): string {
    const seconds = Number(secondsRaw);
    if (!Number.isFinite(seconds) || seconds < 0) return '—';
    if (seconds < 120) return `${seconds}s`;
    if (seconds < 7200) return `${Math.round(seconds / 60)}m`;
    if (seconds < 172800) return `${Math.round(seconds / 3600)}h`;
    return `${Math.round(seconds / 86400)}d`;
  }

  private addOptionWarnings(rows: WarningRow[], now: bigint): void {
    for (const pos of this.options.myPositions()) {
      const expiry = BigInt(pos.optionExpiry ?? 0n);
      if (this.isApproaching(expiry, now)) {
        rows.push({ level: 'orange', type: 'Options', title: 'Option close to expiry', detail: pos.marketKey, due: expiry, action: 'Review or close before expiry.' });
      }
      if (pos.exerciseStart && pos.exerciseEnd && now >= pos.exerciseStart && now <= pos.exerciseEnd && pos.canExercise) {
        rows.push({ level: 'red', type: 'Options', title: 'Exercise window open', detail: pos.marketKey, due: pos.exerciseEnd, action: 'Exercise before the window closes.' });
      }
      if (pos.reclaimAfter && now >= pos.reclaimAfter && pos.canReclaim) {
        rows.push({ level: 'red', type: 'Options', title: 'Writer reclaim available', detail: pos.marketKey, due: pos.reclaimAfter, action: 'Reclaim expired writer collateral.' });
      }
    }
  }

  private addMarginOptionWarnings(rows: WarningRow[], now: bigint): void {
    for (const pos of this.margin.myPositions()) {
      const expiry = pos.market.expiry ?? 0n;
      if (this.isApproaching(expiry, now)) rows.push({ level: 'orange', type: 'Margin Options', title: 'Market close to expiry', detail: pos.marketKey, due: expiry, action: 'Review holder/writer exposure.' });
      if (expiry <= now && (pos.canClaim || pos.canReclaim)) rows.push({ level: 'red', type: 'Margin Options', title: 'Settlement action available', detail: pos.marketKey, due: expiry, action: pos.canClaim ? 'Claim holder payout or clear position.' : 'Reclaim writer margin.' });
    }
  }

  private addBinaryOptionWarnings(rows: WarningRow[], now: bigint): void {
    for (const pos of this.binary.myPositions()) {
      const expiry = pos.market.expiry ?? 0n;
      if (this.isApproaching(expiry, now)) rows.push({ level: 'orange', type: 'Binary Options', title: 'Market close to expiry', detail: pos.marketKey, due: expiry, action: 'Review payout/writer exposure.' });
      if (expiry <= now && (pos.canClaim || pos.canReclaim)) rows.push({ level: 'red', type: 'Binary Options', title: 'Settlement action available', detail: pos.marketKey, due: expiry, action: pos.canClaim ? pos.claimLabel : 'Reclaim writer margin.' });
    }
  }

  private addLendingExpiryWarnings(rows: WarningRow[], now: bigint, snapshot: any): void {
    for (const debt of [...(snapshot.debts ?? []), ...(snapshot.pendingDebts ?? [])]) {
      const due = debt.market?.expiry ?? 0n;
      if (this.isApproaching(due, now)) rows.push({ level: 'orange', type: 'Lending', title: 'Loan maturity approaching', detail: debt.marketKey, due, action: 'Prepare repayment or rollover.' });
      if (due > 0n && due <= now) rows.push({ level: 'red', type: 'Lending', title: 'Loan matured', detail: debt.marketKey, due, action: 'Repayment/settlement action may be required.' });
    }
    for (const bond of snapshot.bonds ?? []) {
      const due = bond.market?.expiry ?? 0n;
      if (this.isApproaching(due, now)) rows.push({ level: 'orange', type: 'Lending', title: 'Bond maturity approaching', detail: bond.marketKey, due, action: 'Monitor repayment and settlement.' });
      if (due > 0n && due <= now && ((bond.initialClaimable ?? 0n) > 0n || (bond.supplementalClaimable ?? 0n) > 0n)) rows.push({ level: 'red', type: 'Lending', title: 'Bond claim available', detail: bond.marketKey, due, action: 'Claim available lender recovery.' });
    }
  }

  private async addLendingLtvWarnings(rows: WarningRow[], account: string, snapshot: any): Promise<void> {
    const riskLevels = new Set<number>();
    for (const debt of [...(snapshot.debts ?? []), ...(snapshot.pendingDebts ?? [])]) {
      const risk = Number(debt.market?.riskLevel ?? 0);
      if (risk > 0) riskLevels.add(risk);
    }
    for (const riskLevel of riskLevels) {
      const preview = await this.valuation.previewBorrowOrder(account, riskLevel, 0n).catch(() => null);
      const currentLtv = preview?.currentLtvBps;
      const tier = preview?.riskTier;
      if (currentLtv === null || currentLtv === undefined || !tier?.enabled) continue;
      const maxLtv = BigInt(tier.maxLtvBps || 0);
      const liquidationLtv = BigInt(tier.liquidationLtvBps || 0);
      if (liquidationLtv > 0n && currentLtv >= (liquidationLtv * WARNING_LTV_RED_FRACTION_BPS) / 10_000n) {
        rows.push({ level: 'red', type: 'Lending', title: 'High lending LTV', detail: `Risk ${riskLevel}: ${this.formatBps(currentLtv)} LTV / ${this.formatBps(liquidationLtv)} liquidation LTV`, due: 0n, action: 'Reduce debt or add collateral.' });
      } else if (maxLtv > 0n && currentLtv >= maxLtv) {
        rows.push({ level: 'orange', type: 'Lending', title: 'Lending LTV above max borrow level', detail: `Risk ${riskLevel}: ${this.formatBps(currentLtv)} LTV / ${this.formatBps(maxLtv)} max LTV`, due: 0n, action: 'Consider reducing debt before liquidation risk increases.' });
      }
    }
  }


  private async addFuturesWarnings(rows: WarningRow[], account: string, _now: bigint): Promise<void> {
    const markets = this.futures.activeMarkets();
    const positions = this.futures.myPositions();

    for (const row of markets) {
      const marketKey = row.marketKey;
      const ticker = row.market?.ticker || marketKey;
      const imbalance = await this.futuresMaintenance.getImbalanceOrder(marketKey).catch(() => null);
      if (imbalance?.active && imbalance.amount > 0n) {
        rows.push({
          level: 'orange',
          type: 'Futures',
          title: 'Active imbalance order',
          detail: `${ticker}: ${this.formatTokenLike(imbalance.amount)} contracts waiting for imbalance matching.`,
          due: 0n,
          action: 'Sync settlement price, then match imbalance from an account or treasury account.',
        });
      }
    }

    for (const position of positions) {
      const health = await this.futuresMaintenance.positionHealth(position.marketKey, account).catch(() => null);
      if (!health || health.size <= 0n) continue;

      const ticker = position.market?.ticker || position.marketKey;
      const side = health.side === 1 ? 'long' : health.side === 2 ? 'short' : 'position';
      const risk = health.riskRatioBps;

      if (health.liquidatable) {
        rows.push({
          level: 'red',
          type: 'Futures',
          title: 'Futures position liquidatable',
          detail: `${ticker} ${side}: live margin ${this.formatTokenLike(health.liveMargin)} / maintenance ${this.formatTokenLike(health.maintenanceMargin)}.`,
          due: 0n,
          action: 'Add margin, reduce exposure, or close the position immediately if possible.',
        });
      } else if (risk !== null && risk < 12_000n) {
        rows.push({
          level: 'orange',
          type: 'Futures',
          title: 'Futures position near liquidation',
          detail: `${ticker} ${side}: live margin is ${this.formatBps(risk)} of maintenance requirement.`,
          due: 0n,
          action: 'Add margin or reduce exposure before the next price move.',
        });
      }
    }
  }

  private formatTokenLike(value: bigint): string {
    const raw = value.toString();
    if (raw.length <= 18) return raw;
    const head = raw.slice(0, raw.length - 18) || '0';
    const frac = raw.slice(raw.length - 18, raw.length - 14).replace(/0+$/u, '');
    return frac ? `${head}.${frac}` : head;
  }

  private isApproaching(due: bigint, now: bigint): boolean {
    return due > now && due <= now + WARNING_EXPIRY_ORANGE_WINDOW_SECONDS;
  }

  private formatBps(value: bigint): string {
    return `${(Number(value) / 100).toFixed(2).replace(/\.00$/, '')}%`;
  }
}
