import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WalletConnectService } from '../wallet-connect.service';
import { TradeSettingsService } from '../../services/shared/trade-settings.service';
import { AccountsChainService } from '../../services/onchain/accounts.service';

@Component({
  selector: 'app-wallet-state',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './wallet-state.component.html',
})
export class WalletStateComponent {
  private readonly wallet = inject(WalletConnectService);
  private readonly settings = inject(TradeSettingsService);
  private readonly accountsSvc = inject(AccountsChainService);

  readonly address = this.wallet.address;

  readonly selectedId = computed(() => this.settings.selectedAccountId());
  readonly selectedAccountLabel = computed(() => {
    const account = this.selectedId();
    return account ? this.accountsSvc.accountLabel(account) : '';
  });

  // keep your exposures if you still need them elsewhere
  readonly accounts = this.accountsSvc.accounts;
  readonly accountsStatus = this.accountsSvc.status;
  readonly accountsError = this.accountsSvc.error;

  shorten(addr: string | null): string {
    return addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';
  }
}
