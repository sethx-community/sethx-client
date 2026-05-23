import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';

import { CURRENT_NETWORK_CONFIG } from '../../constants/network.config';
import { NetworkStatusService } from '../../services/shared/network-status.service';
import { WalletConnectService } from '../../wallet/wallet-connect.service';

@Component({
  selector: 'app-client-landing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './client-landing.component.html',
  styleUrl: './client-landing.component.css',
})
export class ClientLandingComponent {
  readonly wallet = inject(WalletConnectService);
  readonly network = inject(NetworkStatusService);
  readonly requiredNetworkName = CURRENT_NETWORK_CONFIG.name;

  connect(): void {
    void this.wallet.connect();
  }
}
