import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TransactionAccessService {
  assertWriteAllowed(_actionLabel = 'transaction'): void {
    return;
  }

  canWrite(): boolean {
    return true;
  }
}
