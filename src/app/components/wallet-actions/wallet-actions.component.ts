import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';

import { DepositWithdrawModalComponent } from '../../core/overlay/deposit-withdraw/deposit-withdraw-modal.component';
import { OrderFlowService } from '../../core/overlay/order-flow.service';
import { PortfolioService } from '../../services/onchain/portfolio.service';
import { AccountsChainService } from '../../services/onchain/accounts.service';
import { TransactionAccessService } from '../../services/shared/compliance/transaction-access.service';
import { TradeSettingsService } from '../../services/shared/trade-settings.service';

@Component({
  selector: 'app-wallet-actions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './wallet-actions.component.html',
})
export class WalletActionsComponent {
  private readonly accounts = inject(AccountsChainService);
  private readonly orderFlow = inject(OrderFlowService);
  private readonly portfolio = inject(PortfolioService);
  private readonly transactionAccess = inject(TransactionAccessService);
  private readonly tradeSettings = inject(TradeSettingsService);

  readonly selectedAccountId = this.tradeSettings.selectedAccountId;
  readonly selectedAccountLabel = computed(() => {
    const account = this.selectedAccountId();
    return account ? this.accounts.accountLabel(account) : '';
  });
  readonly canWrite = computed(() => this.transactionAccess.canWrite());
  readonly portfolioWriting = this.portfolio.writing;
  readonly portfolioWriteError = this.portfolio.writeError;
  readonly portfolioWriteSuccess = this.portfolio.writeSuccess;
  readonly portfolioExplorerUrl = this.portfolio.lastExplorerUrl;
  readonly copiedAddress = signal<string | null>(null);
  readonly localError = signal<string | null>(null);

  async copySelectedAccountAddress(): Promise<void> {
    const address = this.selectedAccountId();
    if (!address) return;

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

  openVaultAction(intent: 'deposit' | 'withdraw', asset: 'ETH' | 'TOKEN'): void {
    this.localError.set(null);

    if (!this.selectedAccountId()) {
      this.localError.set('Select an active account before using vault actions.');
      return;
    }

    try {
      this.transactionAccess.assertWriteAllowed(`${intent} ${asset}`);
      this.orderFlow.open(DepositWithdrawModalComponent, { intent, asset });
    } catch (e: any) {
      this.localError.set(e?.message ?? 'Vault action is not available.');
    }
  }
}
