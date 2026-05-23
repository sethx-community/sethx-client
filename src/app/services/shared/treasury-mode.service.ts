import { Injectable, computed, inject, signal } from '@angular/core';

import { WalletConnectService } from '../../wallet/wallet-connect.service';
import { TreasuryContractService, TreasurerInfo } from '../onchain/contracts/treasury-contract.service';

export type TreasuryActionKey = 'fundAccount' | 'withdrawAccount' | 'spotTrade' | 'lend' | 'passiveLp';
export type TreasuryAccountAccess = { account: string; allowed: boolean };

@Injectable({ providedIn: 'root' })
export class TreasuryModeService {
  private readonly wallet = inject(WalletConnectService);
  private readonly treasury = inject(TreasuryContractService);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly treasurerInfo = signal<TreasurerInfo | null>(null);
  readonly killed = signal<boolean | null>(null);
  readonly accounts = signal<TreasuryAccountAccess[]>([]);
  readonly selectedTreasuryAccount = signal<string | null>(null);
  readonly actingAsTreasurer = signal(false);
  readonly actionPermissions = signal<Record<TreasuryActionKey, boolean>>({
    fundAccount: false,
    withdrawAccount: false,
    spotTrade: false,
    lend: false,
    passiveLp: false,
  });

  readonly walletAddress = this.wallet.address;
  readonly isTreasurerWallet = computed(() => Boolean(this.treasurerInfo()?.active));
  readonly selectedAccountAccess = computed(() => {
    const selected = this.selectedTreasuryAccount()?.toLowerCase();
    if (!selected) return false;
    return this.accounts().some((row) => row.allowed && row.account.toLowerCase() === selected);
  });
  readonly canActAsTreasurer = computed(() => {
    return Boolean(this.isTreasurerWallet() && this.killed() !== true && this.selectedAccountAccess());
  });

  async refresh(force = false): Promise<void> {
    const address = this.walletAddress();
    if (!address) {
      this.reset();
      return;
    }

    if (!force && this.loading()) return;
    this.loading.set(true);
    this.error.set(null);

    try {
      const [info, killed, accounts] = await Promise.all([
        this.treasury.treasurerInfo(address).catch(() => null),
        this.treasury.killed().catch(() => null),
        this.treasury.getTreasuryAccounts().catch(() => [] as string[]),
      ]);

      this.treasurerInfo.set(info && info.active ? info : null);
      this.killed.set(killed);

      const accessRows = await Promise.all(
        accounts.map(async (account) => ({
          account,
          allowed: await this.treasury.hasAccountAccess(address, account).catch(() => false),
        })),
      );
      this.accounts.set(accessRows);

      const selected = this.selectedTreasuryAccount();
      const stillAllowed = selected
        ? accessRows.some((row) => row.allowed && row.account.toLowerCase() === selected.toLowerCase())
        : false;
      if (!stillAllowed) {
        this.selectedTreasuryAccount.set(accessRows.find((row) => row.allowed)?.account ?? null);
      }

      const actionEntries = await Promise.all(
        (Object.keys(this.treasury.actionFlags) as TreasuryActionKey[]).map(async (key) => [
          key,
          await this.treasury.hasActionPermission(address, this.treasury.actionFlags[key]).catch(() => false),
        ] as const),
      );
      this.actionPermissions.set(Object.fromEntries(actionEntries) as Record<TreasuryActionKey, boolean>);

      if (!this.canActAsTreasurer()) this.actingAsTreasurer.set(false);
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Unable to refresh treasury mode.');
      this.actingAsTreasurer.set(false);
    } finally {
      this.loading.set(false);
    }
  }

  setActingAsTreasurer(value: boolean): void {
    if (!value) {
      this.actingAsTreasurer.set(false);
      return;
    }
    if (this.canActAsTreasurer()) this.actingAsTreasurer.set(true);
  }

  selectTreasuryAccount(account: string): void {
    this.selectedTreasuryAccount.set(account || null);
    if (!this.canActAsTreasurer()) this.actingAsTreasurer.set(false);
  }

  canUse(action: TreasuryActionKey): boolean {
    return Boolean(this.actingAsTreasurer() && this.selectedAccountAccess() && this.actionPermissions()[action]);
  }

  reset(): void {
    this.treasurerInfo.set(null);
    this.killed.set(null);
    this.accounts.set([]);
    this.selectedTreasuryAccount.set(null);
    this.actingAsTreasurer.set(false);
    this.actionPermissions.set({ fundAccount: false, withdrawAccount: false, spotTrade: false, lend: false, passiveLp: false });
  }

  short(value: string | null | undefined): string {
    if (!value) return '—';
    return value.length > 14 ? `${value.slice(0, 6)}…${value.slice(-4)}` : value;
  }
}
