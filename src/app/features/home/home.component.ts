import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';

import { CURRENT_NETWORK_CONFIG } from '../../constants/network.config';
import { WalletConnectService } from '../../wallet/wallet-connect.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  readonly wallet = inject(WalletConnectService);

  readonly networkName = CURRENT_NETWORK_CONFIG.name;
  readonly chainId = CURRENT_NETWORK_CONFIG.id;
  readonly copiedWallet = signal(false);

  short(value: string | null | undefined): string {
    if (!value) return '—';
    return value.length > 14 ? `${value.slice(0, 6)}…${value.slice(-4)}` : value;
  }

  async copyWalletAddress(): Promise<void> {
    const address = this.wallet.address();
    if (!address) return;

    try {
      await navigator.clipboard.writeText(address);
      this.copiedWallet.set(true);
      setTimeout(() => this.copiedWallet.set(false), 1400);
    } catch {
      this.copiedWallet.set(false);
    }
  }
}
