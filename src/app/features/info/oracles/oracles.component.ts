import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ethers } from 'ethers';
import { formatUnitsHuman } from '../../../core/format/number-format';
import { stableComputed } from '../../../core/signals/stable-resource';
import {
  WARNING_ORACLE_FETCH_ORANGE_WINDOW_SECONDS,
  WARNING_ORACLE_FETCH_RED_WINDOW_SECONDS,
} from '../../../constants/warnings.constants';

import { ProtocolDataService, type ProtocolOracleInfo } from '../../../services/shared/data/protocol-data.service';
import { PriceManagerContractService } from '../../../services/onchain/contracts/pricemanager-contract.service';

@Component({
  selector: 'app-oracles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './oracles.component.html',
})
export class OraclesComponent {
  readonly protocolData = inject(ProtocolDataService);
  readonly priceManager = inject(PriceManagerContractService);
  readonly live = this.protocolData.liveOverview;
  readonly filter = signal('');
  readonly selectedOracle = signal<string | null>(null);
  readonly maintenanceBusy = signal<string | null>(null);
  readonly maintenanceMessage = signal<string | null>(null);

  readonly filteredOracles = stableComputed(() => {
    const query = this.filter().trim().toLowerCase();
    const rows = this.live().oracleInfo;
    if (!query) return rows;
    return rows.filter((row) => [row.oracle, row.token, row.label, row.description, row.pair, row.source, row.notes]
      .some((value) => String(value ?? '').toLowerCase().includes(query)));
  });

  readonly selected = computed(() => {
    const selected = this.selectedOracle();
    const rows = this.filteredOracles();
    if (selected) {
      const match = rows.find((row) => row.oracle.toLowerCase() === selected.toLowerCase());
      if (match) return match;
    }
    return rows[0] ?? null;
  });

  constructor() {
    this.protocolData.warmLiveReads();
  }

  refresh(): void {
    this.protocolData.warmLiveReads();
  }

  select(row: ProtocolOracleInfo): void {
    this.selectedOracle.set(row.oracle);
  }

  isSelected(row: ProtocolOracleInfo): boolean {
    const selected = this.selected();
    return selected !== null && selected.oracle === row.oracle;
  }


  onFilter(value: string): void {
    this.filter.set(value);
    const current = this.selectedOracle();
    if (!current) return;
    const stillVisible = this.filteredOracles().some((row) => row.oracle.toLowerCase() === current.toLowerCase());
    if (!stillVisible) this.selectedOracle.set(null);
  }

  short(value: string | null | undefined): string {
    if (!value) return '—';
    return value.length > 14 ? `${value.slice(0, 6)}…${value.slice(-4)}` : value;
  }

  formatPrice(row: ProtocolOracleInfo | null): string {
    if (!row || row.price == null) return '—';
    try {
      return formatUnitsHuman(row.price, row.decimals ?? 18, { maxDecimals: 6, mode: 'scaled-small', compactFrom: 1_000_000 });
    } catch {
      return row.price.toString();
    }
  }


  formatClientCheck(value: number | null | undefined): string {
    if (!value || value <= 0) return '—';
    return new Date(value).toLocaleString();
  }

  formatTimestamp(value: bigint | null): string {
    if (!value || value <= 0n) return '—';
    return new Date(Number(value) * 1000).toLocaleString();
  }

  formatStaleness(value: bigint | null): string {
    if (value == null) return '—';
    if (value === 0n) return 'No limit';
    const seconds = Number(value);
    if (!Number.isFinite(seconds)) return value.toString();
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.round(seconds / 3600)}h`;
    return `${Math.round(seconds / 86400)}d`;
  }


  oracleSeverity(row: ProtocolOracleInfo): 'ok' | 'orange' | 'red' {
    const status = (row.statusLabel || '').toUpperCase();

    if (status && status !== 'OK') {
      return status === 'PENDING' ? 'orange' : 'red';
    }

    const now = BigInt(Math.floor(Date.now() / 1000));
    const fetched = row.lastFetchTimestamp ?? 0n;

    if (fetched <= 0n) return 'orange';
    if (now > fetched + WARNING_ORACLE_FETCH_RED_WINDOW_SECONDS) return 'red';
    if (now > fetched + WARNING_ORACLE_FETCH_ORANGE_WINDOW_SECONDS) return 'orange';

    return 'ok';
  }

  oracleStatusText(row: ProtocolOracleInfo): string {
    const severity = this.oracleSeverity(row);
    const status = (row.statusLabel || '').toUpperCase();

    if (severity === 'red') {
      if (status && status !== 'OK') return row.statusLabel || 'Needs review';
      return 'Fetch very old';
    }

    if (severity === 'orange') {
      if (status === 'PENDING') return 'Pending';
      if (!row.lastFetchTimestamp || row.lastFetchTimestamp <= 0n) return 'Not fetched';
      if (status && status !== 'OK') return row.statusLabel || 'Needs review';
      return 'Fetch old';
    }

    return row.statusLabel || 'OK';
  }

  oraclePillClass(row: ProtocolOracleInfo): Record<string, boolean> {
    const severity = this.oracleSeverity(row);

    return {
      'is-ok': severity === 'ok',
      'is-warning': severity === 'orange',
      'is-attention': severity === 'red',
    };
  }

  async fetchPrice(row: ProtocolOracleInfo): Promise<void> {
    await this.runMaintenance(row, 'fetch', () => this.priceManager.fetchPrice(row.oracle));
  }

  async syncOracle(row: ProtocolOracleInfo): Promise<void> {
    await this.runMaintenance(row, 'sync', () => this.priceManager.syncOracleData(row.oracle));
  }

  async fetchAndSync(row: ProtocolOracleInfo): Promise<void> {
    await this.runMaintenance(row, 'fetch-sync', () => this.priceManager.fetchAndSyncOracle(row.oracle));
  }

  private async runMaintenance(
    row: ProtocolOracleInfo,
    action: 'fetch' | 'sync' | 'fetch-sync',
    task: () => Promise<unknown>,
  ): Promise<void> {
    const key = `${action}:${row.oracle.toLowerCase()}`;
    this.maintenanceBusy.set(key);
    this.maintenanceMessage.set(null);
    try {
      await task();
      this.maintenanceMessage.set(`${row.label || this.short(row.oracle)} ${action === 'fetch-sync' ? 'fetched and synced' : action === 'fetch' ? 'fetched' : 'synced'}.`);
      this.protocolData.warmLiveReads();
    } catch (error: any) {
      this.maintenanceMessage.set(error?.shortMessage ?? error?.reason ?? error?.message ?? 'Oracle maintenance failed.');
    } finally {
      this.maintenanceBusy.set(null);
    }
  }

  isBusy(row: ProtocolOracleInfo, action: 'fetch' | 'sync' | 'fetch-sync'): boolean {
    return this.maintenanceBusy() === `${action}:${row.oracle.toLowerCase()}`;
  }

  trackOracle(_: number, row: ProtocolOracleInfo): string {
    return row.oracle;
  }

  trackContext(_: number, context: string): string {
    return context;
  }
}

