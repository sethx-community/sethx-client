import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';

import {
  ConfirmationField,
  ConfirmationModalComponent,
  RequirementRow,
} from '../../core/modals/confirmation/confirmation-modal.component';
import { TransactionReceiptState } from '../transaction-receipt';

export type TransactionPreviewKind = 'transaction' | 'quote';

@Component({
  selector: 'app-transaction-preview-modal',
  standalone: true,
  imports: [CommonModule, ConfirmationModalComponent],
  templateUrl: './transaction-preview-modal.component.html',
})
export class TransactionPreviewModalComponent {
  @Input() title = 'Transaction preview';
  @Input() kind: TransactionPreviewKind = 'transaction';
  @Input() confirmLabel = 'Confirm';
  @Input() fields: ConfirmationField[] = [];
  @Input() requirements: RequirementRow[] | null = null;
  @Input() confirmDisabled = false;
  @Input() loading = false;
  @Input() error: string | null = null;
  @Input() receipt: TransactionReceiptState | null = null;
  @Input() explorerUrl: string | null = null;
  @Input() riskNote = 'Review the details, locked balances, and fee quote before signing. On-chain execution can still revert if market state changes before confirmation.';

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  showConfirmButton(): boolean {
    return this.kind === 'transaction';
  }

  helperText(): string {
    return this.kind === 'quote'
      ? 'Quote-only preview. No transaction will be submitted from this screen.'
      : 'Transaction preview. Confirm only after checking locks, fees, and risks.';
  }

  badgeLabel(): string {
    return this.kind === 'quote' ? 'Quote only' : 'Transaction';
  }
}
