import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WalletConnectService } from '../wallet-connect.service';

@Component({
  selector: 'app-wallet-connect',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './wallet-connect.component.html',
})
export class WalletConnectComponent {
  wallet = inject(WalletConnectService);

  address = this.wallet.address;
  constructor() {}

  // Actions

  connect() {
    this.wallet.connect();
  }

  disconnect() {
    this.wallet.disconnect();
  }
}
