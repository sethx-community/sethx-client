import { Injectable, inject, signal } from '@angular/core';

import { GovernanceContractService, VotingPowerOverview } from '../../onchain/contracts/governance-contract.service';

export type GovernanceSettingsView = {
  votingDelay: bigint;
  votingPeriod: bigint;
  proposalThreshold: bigint;
};

export type VotingPowerView = VotingPowerOverview & {
  vaultBalance: bigint;
  effectiveVotingPower: bigint;
  note: string;
};

@Injectable({ providedIn: 'root' })
export class GovernanceDataService {
  private readonly contracts = inject(GovernanceContractService);
  private readonly votingPowerCache = new Map<string, VotingPowerView>();

  readonly settings = signal<GovernanceSettingsView | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  async loadSettings(force = false): Promise<GovernanceSettingsView | null> {
    if (this.settings() && !force) return this.settings();
    this.loading.set(true);
    this.error.set(null);
    try {
      const settings = await this.contracts.settings();
      this.settings.set(settings);
      return settings;
    } catch (error) {
      this.error.set(this.message(error));
      return null;
    } finally {
      this.loading.set(false);
    }
  }

  async loadVotingPower(address: string, force = false): Promise<VotingPowerView> {
    const key = address.toLowerCase();
    if (!force && this.votingPowerCache.has(key)) return this.votingPowerCache.get(key)!;

    const base = await this.contracts.votingPower(address);
    const view: VotingPowerView = {
      ...base,
      vaultBalance: 0n,
      effectiveVotingPower: base.walletVotes > 0n ? base.walletVotes : base.walletBalance,
      note: 'MVP view: wallet SETHX is live. Vault/account SETHX aggregation is reserved for the later voting-power contract/view function.',
    };
    this.votingPowerCache.set(key, view);
    return view;
  }

  clearVotingPower(address?: string): void {
    if (address) this.votingPowerCache.delete(address.toLowerCase());
    else this.votingPowerCache.clear();
  }

  formatToken(value: bigint): string {
    return this.contracts.formatToken(value);
  }

  private message(error: unknown): string {
    return error instanceof Error ? error.message : String(error ?? 'Unknown governance error');
  }
}
