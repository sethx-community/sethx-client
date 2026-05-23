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
  shortHash(hash: string): string { return hash.length > 13 ? `${hash.slice(0, 8)}...${hash.slice(-5)}` : hash; }
}
