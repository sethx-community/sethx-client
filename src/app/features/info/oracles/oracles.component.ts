import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ethers } from 'ethers';
import { formatUnitsHuman } from '../../../core/format/number-format';

import { ProtocolDataService, type ProtocolOracleInfo } from '../../../services/shared/data/protocol-data.service';

@Component({
  selector: 'app-oracles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './oracles.component.html',
})
export class OraclesComponent {
  readonly protocolData = inject(ProtocolDataService);
  readonly live = this.protocolData.liveOverview;
  readonly filter = signal('');
  readonly selectedOracle = signal<string | null>(null);

  readonly filteredOracles = computed(() => {
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

  trackOracle(_: number, row: ProtocolOracleInfo): string {
    return row.oracle;
  }
}
