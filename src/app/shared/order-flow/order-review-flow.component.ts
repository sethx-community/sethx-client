import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

import {
  ConfirmationField,
  RequirementRow,
} from '../../core/modals/confirmation/confirmation-modal.component';
import { TransactionPreviewKind, TransactionPreviewModalComponent } from '../transaction-preview';
import { TransactionReceiptState } from '../transaction-receipt';

@Component({
  selector: 'app-order-review-flow',
  standalone: true,
  imports: [CommonModule, TransactionPreviewModalComponent],
  templateUrl: './order-review-flow.component.html',
})
export class OrderReviewFlowComponent {
  @Input() title = 'Order review';
  @Input() kind: TransactionPreviewKind = 'transaction';
  @Input() confirmLabel = 'Confirm';
  @Input() fields: ConfirmationField[] = [];
  @Input() requirements: RequirementRow[] | null = null;
  @Input() confirmDisabled = false;
  @Input() loading = false;
  @Input() error: string | null = null;
  @Input() receipt: TransactionReceiptState | null = null;
  @Input() explorerUrl: string | null = null;
  @Input() riskNote = 'Review the details, locked balances, and fee quote before signing.';

  @Output() cancel = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();
}
