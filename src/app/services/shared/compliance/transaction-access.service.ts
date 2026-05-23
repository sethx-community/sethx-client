import { Injectable, inject } from '@angular/core';

import { CountryAccessService } from './country-access.service';

@Injectable({ providedIn: 'root' })
export class TransactionAccessService {
  private readonly country = inject(CountryAccessService);

  assertWriteAllowed(actionLabel = 'transaction'): void {
    if (this.country.isBlocked()) {
      const code = this.country.countryCode();
      throw new Error(`Blocked ${actionLabel}: SETHX is not available in this region${code ? ` (${code})` : ''}.`);
    }
  }

  canWrite(): boolean {
    return !this.country.isBlocked();
  }
}
