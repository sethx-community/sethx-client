import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';

import { CURRENT_NETWORK_CONFIG } from '../../constants/network.config';
import { NetworkStatusService } from '../../services/shared/network-status.service';
import { WalletConnectService } from '../../wallet/wallet-connect.service';
import { WalletConnectComponent } from '../../wallet/wallet-connect/wallet-connect.component';

@Component({
  selector: 'app-client-landing',
  standalone: true,
  imports: [CommonModule, WalletConnectComponent],
  templateUrl: './client-landing.component.html',
  styleUrl: './client-landing.component.css',
})
export class ClientLandingComponent {
  readonly wallet = inject(WalletConnectService);
  readonly network = inject(NetworkStatusService);
  readonly requiredNetworkName = CURRENT_NETWORK_CONFIG.name;
}
