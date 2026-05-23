import { Injectable, computed, effect, inject, signal } from '@angular/core';

import { WalletConnectService } from '../../../wallet/wallet-connect.service';
import { GovernanceDataService } from '../data/governance-data.service';
import { TreasuryDataService } from '../data/treasury-data.service';

export type AccessTier = 'public' | 'wallet' | 'token-holder' | 'governance-eligible' | 'treasury';

export type AccessSnapshot = {
  walletConnected: boolean;
  walletAddress: string | null;
  sethxBalance: bigint;
  votingPower: bigint;
  treasuryAccess: boolean;
};

@Injectable({ providedIn: 'root' })
export class AccessLayerService {
  private readonly wallet = inject(WalletConnectService);
  private readonly governanceData = inject(GovernanceDataService);
  private readonly treasuryData = inject(TreasuryDataService);

  private readonly _sethxBalance = signal(0n);
  private readonly _votingPower = signal(0n);
  private readonly _treasuryAccess = signal(false);

  readonly walletAddress = this.wallet.address;
  readonly walletConnected = computed(() => Boolean(this.walletAddress()));
  readonly sethxBalance = this._sethxBalance.asReadonly();
  readonly votingPower = this._votingPower.asReadonly();
  readonly isTokenHolder = computed(() => this._sethxBalance() > 0n);
  readonly isGovernanceEligible = computed(() => this._votingPower() > 0n);
  readonly hasTreasuryAccess = this._treasuryAccess.asReadonly();
  readonly snapshot = computed<AccessSnapshot>(() => ({
    walletConnected: this.walletConnected(),
    walletAddress: this.walletAddress(),
    sethxBalance: this._sethxBalance(),
    votingPower: this._votingPower(),
    treasuryAccess: this._treasuryAccess(),
  }));

  constructor() {
    effect(() => {
      const address = this.walletAddress();
      void this.refreshForAddress(address);
    });
  }

  async refreshForAddress(address: string | null): Promise<void> {
    if (!address) {
      this._sethxBalance.set(0n);
      this._votingPower.set(0n);
      this._treasuryAccess.set(false);
      return;
    }

    const [governance, treasuryAccess] = await Promise.all([
      this.governanceData.loadVotingPower(address).catch(() => null),
      this.treasuryData.hasTreasuryAccess(address).catch(() => false),
    ]);

    this._sethxBalance.set(governance?.walletBalance ?? 0n);
    this._votingPower.set(governance?.effectiveVotingPower ?? 0n);
    this._treasuryAccess.set(treasuryAccess);
  }


  async waitForTier(tier: AccessTier, timeoutMs = 2500): Promise<boolean> {
    const start = Date.now();

    while (Date.now() - start < timeoutMs) {
      if (this.hasTier(tier)) return true;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return this.hasTier(tier);
  }

  hasTier(tier: AccessTier): boolean {
    if (tier === 'public') return true;
    if (tier === 'wallet') return this.walletConnected();
    if (tier === 'token-holder') return this.isTokenHolder();
    if (tier === 'governance-eligible') return this.isGovernanceEligible();
    if (tier === 'treasury') return this.hasTreasuryAccess();
    return false;
  }
}
