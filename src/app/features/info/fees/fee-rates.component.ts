import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';

import { FeeService } from '../../../services/shared/fee.service';
import { ProtocolConfigService } from '../../../services/shared/config/protocol-config.service';

@Component({
  selector: 'app-fee-rates',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fee-rates.component.html',
})
export class FeeRatesComponent {
  private readonly feeService = inject(FeeService);
  private readonly protocolConfig = inject(ProtocolConfigService);

  readonly feeNote = computed(() => this.protocolConfig.config().fees.note);
  readonly acceptedTokens = this.feeService.acceptedPaymentTokens;
  readonly sethxToken = this.feeService.sethxToken;
  readonly status = this.feeService.acceptedPaymentTokensStatus;

  constructor() {
    this.refresh();
  }

  refresh(): void {
    this.feeService.refreshAcceptedPaymentTokens();
    this.feeService.refreshSethxToken();
  }

  short(value: string | null | undefined): string {
    if (!value) return '—';
    return value.length > 14 ? `${value.slice(0, 6)}…${value.slice(-4)}` : value;
  }
}
