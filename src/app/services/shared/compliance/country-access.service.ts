import { Injectable, computed, inject, signal } from '@angular/core';

import { ProtocolConfigService } from '../config/protocol-config.service';

@Injectable({ providedIn: 'root' })
export class CountryAccessService {
  private readonly protocolConfig = inject(ProtocolConfigService);
  private readonly _countryCode = signal<string | null>(null);
  private readonly _checked = signal(false);
  private refreshPromise: Promise<void> | null = null;

  readonly countryCode = this._countryCode.asReadonly();
  readonly checked = this._checked.asReadonly();
  readonly isBlocked = computed(() => this.protocolConfig.isBlockedCountry(this._countryCode()));

  constructor() {
    this.refreshPromise = this.refresh();
  }

  async ensureChecked(): Promise<void> {
    if (this._checked()) return;
    await (this.refreshPromise ?? this.refresh());
  }

  async refresh(): Promise<void> {
    const countryCode = await this.fetchCountryCode();
    this._countryCode.set(countryCode);
    this._checked.set(true);
    this.refreshPromise = null;
  }

  isCountryBlocked(countryCode: string | null): boolean {
    return this.protocolConfig.isBlockedCountry(countryCode);
  }

  private async fetchCountryCode(): Promise<string | null> {
    if (typeof fetch === 'undefined') return null;

    try {
      const response = await fetch(this.protocolConfig.compliance().geoEndpoint, { cache: 'no-store' });
      if (!response.ok) return null;
      const body = (await response.json()) as { countryCode?: string };
      return body.countryCode ?? null;
    } catch {
      return null;
    }
  }
}
