import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { TreasuryContractService } from '../../../services/onchain/contracts/treasury-contract.service';
import { TreasuryModeService } from '../../../services/shared/treasury-mode.service';

@Component({ selector: 'app-right-panel-treasury', standalone: true, imports: [CommonModule], templateUrl: './right-panel-treasury.component.html' })
export class RightPanelTreasuryComponent {
  readonly treasury = inject(TreasuryContractService);
  readonly mode = inject(TreasuryModeService);
  short(value: string | null | undefined): string { if (!value) return '—'; return value.length > 14 ? `${value.slice(0, 6)}…${value.slice(-4)}` : value; }
}
