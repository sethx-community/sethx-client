import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CURRENT_NETWORK_CONFIG } from '../../constants/network.config';
import { ProtocolConfigService } from '../../services/shared/config/protocol-config.service';
import { WalletConnectService } from '../../wallet/wallet-connect.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  readonly wallet = inject(WalletConnectService);
  private readonly protocol = inject(ProtocolConfigService);

  readonly networkName = CURRENT_NETWORK_CONFIG.name;
  readonly chainId = CURRENT_NETWORK_CONFIG.id;
  readonly products = this.protocol.products;
  readonly enabledProductCount = computed(() => this.products().length);
  readonly configuredContractCount = computed(() => Object.values(this.protocol.contracts()).filter(Boolean).length);

  short(value: string | null | undefined): string {
    if (!value) return '—';
    return value.length > 14 ? `${value.slice(0, 6)}…${value.slice(-4)}` : value;
  }
}
