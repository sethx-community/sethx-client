import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccountType, AccountsChainService } from '../../../services/onchain/accounts.service';
import {
  ConfirmationField,
  ConfirmationModalComponent,
} from '../../../core/modals/confirmation/confirmation-modal.component';
import { TransactionAccessService } from '../../../services/shared/compliance/transaction-access.service';
import { WalletActionsComponent } from '../../../components/wallet-actions/wallet-actions.component';

@Component({
  selector: 'app-right-panel-accounts',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmationModalComponent, WalletActionsComponent],
  templateUrl: './right-panel-accounts.component.html',
})
export class RightPanelAccountsComponent {
  private readonly accounts = inject(AccountsChainService);
  private readonly transactionAccess = inject(TransactionAccessService);

  readonly newAccountName = signal('');
  readonly newAccountType = signal<AccountType>('normal');
  readonly localError = signal<string | null>(null);
  readonly showCreateConfirmation = signal(false);

  readonly creating = this.accounts.creating;
  readonly createError = this.accounts.createError;
  readonly createSuccess = this.accounts.createSuccess;
  readonly lastExplorerUrl = this.accounts.lastExplorerUrl;
  readonly canWrite = computed(() => this.transactionAccess.canWrite());

  readonly createPreviewFields = computed<ConfirmationField[]>(() => [
    {
      label: 'Action',
      value: 'Create account',
    },
    {
      label: 'Account type',
      value: this.newAccountType() === 'lending' ? 'Margin account' : 'Trading account',
    },
    {
      label: 'Display name',
      value: this.newAccountName().trim() || 'No name set',
      tone: this.newAccountName().trim() ? 'default' : 'muted',
    },
    {
      label: 'Write access',
      value: this.canWrite() ? 'Allowed' : 'Blocked by region policy',
      tone: this.canWrite() ? 'good' : 'warn',
    },
  ]);

  setNewAccountType(value: string): void {
    this.newAccountType.set(value === 'lending' ? 'lending' : 'normal');
  }

  openCreateConfirmation(): void {
    this.localError.set(null);

    try {
      this.transactionAccess.assertWriteAllowed('account creation');
      this.showCreateConfirmation.set(true);
    } catch (e: any) {
      this.localError.set(e?.message ?? 'Account creation is not available.');
    }
  }

  async createAccount(): Promise<void> {
    this.localError.set(null);

    try {
      await this.accounts.create(this.newAccountName(), this.newAccountType());
      this.newAccountName.set('');
      this.newAccountType.set('normal');
      this.showCreateConfirmation.set(false);
    } catch (e: any) {
      this.localError.set(e?.message ?? 'Account creation failed');
    }
  }

}