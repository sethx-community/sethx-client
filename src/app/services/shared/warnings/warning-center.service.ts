import { Injectable, computed, effect, inject, signal } from '@angular/core';
import {
  WARNING_EXPIRY_ORANGE_WINDOW_SECONDS,
  WARNING_LTV_RED_FRACTION_BPS,
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

  private readonly _warnings = signal<WarningRow[]>([]);
  private readonly _loading = signal(false);
  private readonly _lastUpdatedAt = signal<number | null>(null);
  private refreshNonce = 0;

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
    const nonce = ++this.refreshNonce;
    const account = this.account();
    const now = BigInt(Math.floor(Date.now() / 1000));
    const rows: WarningRow[] = [];

    this._loading.set(true);
    try {
      this.addOptionWarnings(rows, now);
      this.addMarginOptionWarnings(rows, now);
      this.addBinaryOptionWarnings(rows, now);
      if (account) {
        const snapshot = await this.lending.loadAccountSnapshot(account).catch(() => ({ debts: [], pendingDebts: [], bonds: [], orders: [] }));
        this.addLendingExpiryWarnings(rows, now, snapshot);
        await this.addLendingLtvWarnings(rows, account, snapshot);
      }
      rows.sort((a, b) => Number(a.due - b.due));
      if (nonce === this.refreshNonce) {
        this._warnings.set(rows);
        this._lastUpdatedAt.set(Date.now());
      }
    } finally {
      if (nonce === this.refreshNonce) this._loading.set(false);
    }
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

  private isApproaching(due: bigint, now: bigint): boolean {
    return due > now && due <= now + WARNING_EXPIRY_ORANGE_WINDOW_SECONDS;
  }

  private formatBps(value: bigint): string {
    return `${(Number(value) / 100).toFixed(2).replace(/\.00$/, '')}%`;
  }
}
