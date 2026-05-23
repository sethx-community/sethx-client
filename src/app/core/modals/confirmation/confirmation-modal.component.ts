import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionReceiptComponent, TransactionReceiptState } from '../../../shared/transaction-receipt';

export interface ConfirmationField {
  label: string;
  value: string;
  tone?: 'default' | 'muted' | 'system' | 'good' | 'warn';
}

export interface RequirementLine {
  label: string;
  amount: string;
  raw?: string;
}

export interface RequirementRow {
  tokenSymbol: string;
  tokenAddress: string;
  available: string;
  ok: boolean;

  required?: string;
  note?: string;

  totalRequired?: string;
  components?: RequirementLine[];

  requiredRaw?: string;
  availableRaw?: string;
  decimals?: number;
}

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule, TransactionReceiptComponent],
  templateUrl: './confirmation-modal.component.html',
})
export class ConfirmationModalComponent {
  @Input() title = 'Confirm Action';
  @Input() confirmLabel = 'Confirm';
  @Input() fields: ConfirmationField[] = [];

  @Input() showConfirmButton = true;
  @Input() previewBadge = '';
  @Input() previewHelper = '';
  @Input() riskNote = '';

  @Input() requirements: RequirementRow[] | null = null;
  @Input() confirmDisabled = false;
  @Input() loading = false;
  @Input() error: string | null = null;
  @Input() receipt: TransactionReceiptState | null = null;
  @Input() explorerUrl: string | null = null;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm() {
    if (this.loading || this.confirmDisabled) return;
    this.confirm.emit();
  }

  onCancel() {
    this.cancel.emit();
  }

  cancelLabel(): string {
    if (this.receipt?.status === 'success' || this.receipt?.status === 'error') return 'Close';
    return this.showConfirmButton ? 'Cancel' : 'Close';
  }

  hasInsufficientRequirements(): boolean {
    return !!this.requirements?.some((row) => !row.ok);
  }

  shouldShowTokenAddress(row: RequirementRow): boolean {
    const address = (row.tokenAddress ?? '').trim();
    const symbol = (row.tokenSymbol ?? '').trim();

    if (!address || address === 'address(0)') return false;
    if (/^0x[a-fA-F0-9]{40}$/.test(symbol)) return false;
    if (symbol.includes('…')) return false;

    // Known token symbols are easier to scan without addresses in the
    // primary lock summary. Unknown assets can still surface their address.
    return !/^[A-Z][A-Z0-9]{1,12}$/.test(symbol);
  }

  tokenTitle(row: RequirementRow): string {
    const address = (row.tokenAddress ?? '').trim();
    if (!address || address === 'address(0)') return row.tokenSymbol;
    return `${row.tokenSymbol} ${address}`;
  }

  fieldToneClass(tone: ConfirmationField['tone']): string {
    switch (tone) {
      case 'muted':
      case 'system':
        return 'text-text-muted';
      case 'good':
        return 'text-up';
      case 'warn':
        return 'text-down';
      default:
        return 'text-white';
    }
  }
}
