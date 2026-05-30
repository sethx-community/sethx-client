import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TransactionReceiptState } from './transaction-receipt.service';

@Component({
  selector: 'app-transaction-receipt',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transaction-receipt.component.html',
})
export class TransactionReceiptComponent {
  @Input() receipt: TransactionReceiptState | null = null;
  @Input() explorerUrl: string | null = null;

  copied = false;

  visible(): boolean { return !!this.receipt && this.receipt.status !== 'idle'; }
  statusLabel(): string {
    switch (this.receipt?.status) {
      case 'pending': return 'Pending';
      case 'success': return 'Success';
      case 'error': return 'Error';
      default: return '';
    }
  }
  statusClass(): string {
    switch (this.receipt?.status) {
      case 'pending': return 'border-frame text-frame';
      case 'success': return 'border-up text-up';
      case 'error': return 'border-down text-down';
      default: return 'border-frame text-frame';
    }
  }
  async copyTxHash(hash: string): Promise<void> {
    if (!hash) return;
    try {
      await navigator.clipboard.writeText(hash);
      this.copied = true;
      window.setTimeout(() => { this.copied = false; }, 1400);
    } catch {
      // Full hash remains selectable when clipboard access is unavailable.
    }
  }
}

