import { Injectable, inject, signal } from '@angular/core';

import { TreasurerInfo, TreasuryAssetOverview, TreasuryContractService } from '../../onchain/contracts/treasury-contract.service';

export type TreasuryDashboardView = {
  overview: TreasuryAssetOverview | null;
  treasurers: string[];
  killed: boolean | null;
};

@Injectable({ providedIn: 'root' })
export class TreasuryDataService {
  private readonly contracts = inject(TreasuryContractService);
  private readonly accessCache = new Map<string, boolean>();
  private readonly treasurerInfoCache = new Map<string, TreasurerInfo>();

  readonly dashboard = signal<TreasuryDashboardView>({ overview: null, treasurers: [], killed: null });
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  async hasTreasuryAccess(address: string, force = false): Promise<boolean> {
    const key = address.toLowerCase();
    if (!force && this.accessCache.has(key)) return this.accessCache.get(key)!;
    const access = await this.contracts.isTreasurer(address);
    this.accessCache.set(key, access);
    return access;
  }

  async loadTreasurerInfo(address: string, force = false): Promise<TreasurerInfo> {
    const key = address.toLowerCase();
    if (!force && this.treasurerInfoCache.has(key)) return this.treasurerInfoCache.get(key)!;
    const info = await this.contracts.treasurerInfo(address);
    this.treasurerInfoCache.set(key, info);
    return info;
  }

  async loadDashboard(force = false): Promise<TreasuryDashboardView> {
    if (!force && this.dashboard().overview) return this.dashboard();
    this.loading.set(true);
    this.error.set(null);
    try {
      const [overview, treasurers, killed] = await Promise.all([
        this.contracts.assetOverview().catch(() => null),
        this.contracts.getTreasurers().catch(() => [] as string[]),
        this.contracts.killed().catch(() => null),
      ]);
      const dashboard = { overview, treasurers, killed };
      this.dashboard.set(dashboard);
      return dashboard;
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : String(error ?? 'Treasury read failed'));
      return this.dashboard();
    } finally {
      this.loading.set(false);
    }
  }

  clear(address?: string): void {
    if (address) {
      const key = address.toLowerCase();
      this.accessCache.delete(key);
      this.treasurerInfoCache.delete(key);
      return;
    }
    this.accessCache.clear();
    this.treasurerInfoCache.clear();
  }

  formatEth(value: bigint): string {
    return this.contracts.formatEth(value);
  }
}
