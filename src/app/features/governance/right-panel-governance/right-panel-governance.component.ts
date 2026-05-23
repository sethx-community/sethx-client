import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { GovernanceContractService } from '../../../services/onchain/contracts/governance-contract.service';

@Component({ selector: 'app-right-panel-governance', standalone: true, imports: [CommonModule], templateUrl: './right-panel-governance.component.html' })
export class RightPanelGovernanceComponent {
  readonly governance = inject(GovernanceContractService);
  short(value: string | null | undefined): string { if (!value) return '—'; return value.length > 14 ? `${value.slice(0, 6)}…${value.slice(-4)}` : value; }
}
