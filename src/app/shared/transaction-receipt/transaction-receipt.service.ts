import { Injectable, computed, inject, signal } from '@angular/core';
import { ProtocolConfigService } from '../../services/shared/config/protocol-config.service';

export type TransactionReceiptStatus = 'idle' | 'pending' | 'success' | 'error';

export interface TransactionReceiptState {
  status: TransactionReceiptStatus;
  title: string;
  message: string;
  txHash: string | null;
  error: string | null;
}

const IDLE_RECEIPT: TransactionReceiptState = {
  status: 'idle',
  title: '',
  message: '',
  txHash: null,
  error: null,
};

@Injectable({ providedIn: 'root' })
export class TransactionReceiptService {
  private readonly config = inject(ProtocolConfigService);
  private readonly _receipt = signal<TransactionReceiptState>(IDLE_RECEIPT);

  readonly receipt = this._receipt.asReadonly();
  readonly explorerTxUrl = computed(() => {
    const hash = this._receipt().txHash;
    const explorer = this.config.network().explorerUrl;
    if (!hash || !explorer) return null;
    return `${explorer.replace(/\/$/, '')}/tx/${hash}`;
  });

  pending(title = 'Transaction pending', message = 'Waiting for wallet signature and on-chain confirmation...') {
    this._receipt.set({ status: 'pending', title, message, txHash: null, error: null });
  }

  success(title = 'Transaction confirmed', txHash?: string | null, message = 'The transaction was confirmed successfully.') {
    this._receipt.set({ status: 'success', title, message, txHash: txHash ?? null, error: null });
  }

  error(title = 'Transaction failed', error: unknown, message = 'The transaction could not be completed.') {
    this._receipt.set({ status: 'error', title, message, txHash: null, error: this.formatError(error) });
  }

  clear() { this._receipt.set(IDLE_RECEIPT); }

  private formatError(error: unknown): string {
    if (!error) return 'Unknown error';
    if (typeof error === 'string') return error;
    const anyError = error as { reason?: string; shortMessage?: string; message?: string };
    return anyError.reason ?? anyError.shortMessage ?? anyError.message ?? String(error);
  }
}
