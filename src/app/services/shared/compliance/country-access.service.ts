import { Injectable, computed, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CountryAccessService {
  private readonly _countryCode = signal<string | null>(null);
  private readonly _checked = signal(true);

  readonly countryCode = this._countryCode.asReadonly();
  readonly checked = this._checked.asReadonly();
  readonly isBlocked = computed(() => false);

  async ensureChecked(): Promise<void> {
    this._checked.set(true);
  }

  async refresh(): Promise<void> {
    this._countryCode.set(null);
    this._checked.set(true);
  }

  isCountryBlocked(_countryCode: string | null): boolean {
    return false;
  }
}
