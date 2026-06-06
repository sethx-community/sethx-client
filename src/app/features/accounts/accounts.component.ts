import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AccountRecord,
  AccountsChainService,
} from '../../services/onchain/accounts.service';
import { TradeSettingsService } from '../../services/shared/trade-settings.service';
import { TreasuryModeService } from '../../services/shared/treasury-mode.service';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './accounts.component.html',
  styleUrl: './accounts.component.css',
})
export class AccountsComponent {
  readonly accounts = inject(AccountsChainService);
  private readonly tradeSettings = inject(TradeSettingsService);
  private readonly treasuryMode = inject(TreasuryModeService);

  readonly showAll = signal(false);
  readonly editingAccount = signal<string | null>(null);
  readonly editingName = signal('');
  readonly localError = signal<string | null>(null);
  readonly copiedAddress = signal<string | null>(null);

  readonly status = this.accounts.status;
  readonly updateError = this.accounts.updateError;
  readonly updatingAccount = this.accounts.updatingAccount;
  readonly selectedAccountId = this.tradeSettings.selectedAccountId;

  readonly visibleAccounts = computed<AccountRecord[]>(() => {
    const records = this.accounts.accountRecords();
    return this.showAll() ? records : records.filter((account) => account.active);
  });

  readonly activeCount = computed(
    () => this.accounts.accountRecords().filter((account) => account.active).length,
  );

  readonly inactiveCount = computed(
    () => this.accounts.accountRecords().filter((account) => !account.active).length,
  );

  startRename(account: AccountRecord): void {
    if (account.type === 'treasury') return;
    this.editingAccount.set(account.address);
    this.editingName.set(account.name || '');
  }

  cancelRename(): void {
    this.editingAccount.set(null);
    this.editingName.set('');
  }

  async saveRename(account: AccountRecord): Promise<void> {
    if (account.type === 'treasury') return;
    this.localError.set(null);

    try {
      await this.accounts.renameAccount(account.address, this.editingName());
      this.cancelRename();
    } catch (e: any) {
      this.localError.set(e?.message ?? 'Account rename failed');
    }
  }

  async setActive(account: AccountRecord, active: boolean): Promise<void> {
    if (account.type === 'treasury') return;
    this.localError.set(null);

    try {
      await this.accounts.setActive(account.address, active);

      if (!active && this.selectedAccountId() === account.address) {
        this.tradeSettings.selectAccount(null);
      }
    } catch (e: any) {
      this.localError.set(e?.message ?? 'Account status update failed');
    }
  }

  selectAccount(account: AccountRecord): void {
    if (!account.active) return;

    if (account.type === 'treasury') {
      this.treasuryMode.selectTreasuryAccount(account.address);
      this.treasuryMode.setActingAsTreasurer(true);
      return;
    }

    this.treasuryMode.setActingAsTreasurer(false);
    this.tradeSettings.selectAccount(account.address);
  }

  accountTypeLabel(account: AccountRecord): string {
    if (account.type === 'treasury') return 'Treasury account';
    return account.type === 'lending' ? 'Margin account' : 'Trading account';
  }

  async copyAddress(address: string): Promise<void> {
    this.localError.set(null);

    try {
      await navigator.clipboard.writeText(address);
      this.copiedAddress.set(address);
      window.setTimeout(() => {
        if (this.copiedAddress() === address) this.copiedAddress.set(null);
      }, 1400);
    } catch {
      this.localError.set('Address copy failed. Select the address and copy it manually.');
    }
  }

  accountLabel(account: AccountRecord): string {
    return this.accounts.accountLabel(account.address);
  }

  shortAddress(address: string): string {
    const a = address.toLowerCase();
    if (a.length < 10) return a;
    return `${a.slice(0, 6)}...${a.slice(-4)}`;
  }

  trackAccount(_: number, account: AccountRecord): string {
    return account.address;
  }
}
