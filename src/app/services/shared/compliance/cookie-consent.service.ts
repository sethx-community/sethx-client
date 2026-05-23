import { Injectable, inject, signal } from '@angular/core';

import { ProtocolConfigService } from '../config/protocol-config.service';

export type CookieConsentState = 'unknown' | 'accepted' | 'declined';

const CONSENT_KEY = 'sethx.cookieConsent';
const CONSENT_VERSION_KEY = 'sethx.cookieConsentVersion';

@Injectable({ providedIn: 'root' })
export class CookieConsentService {
  private readonly protocolConfig = inject(ProtocolConfigService);
  private readonly _state = signal<CookieConsentState>(this.initialState());

  readonly state = this._state.asReadonly();
  readonly version = this.protocolConfig.compliance().cookieConsentVersion;

  accept(): void {
    this.setState('accepted');
  }

  decline(): void {
    this.setState('declined');
  }

  reset(): void {
    this.setState('unknown');
  }

  private setState(state: CookieConsentState): void {
    this._state.set(state);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(CONSENT_KEY, state);
        localStorage.setItem(CONSENT_VERSION_KEY, this.version);
      }
    } catch {
      // Consent remains in memory when storage is unavailable.
    }
  }

  private initialState(): CookieConsentState {
    try {
      if (typeof localStorage === 'undefined') return 'unknown';
      const storedVersion = localStorage.getItem(CONSENT_VERSION_KEY);
      if (storedVersion !== this.version) return 'unknown';
      const value = localStorage.getItem(CONSENT_KEY);
      if (value === 'accepted' || value === 'declined') return value;
    } catch {
      // Ignore unavailable storage.
    }
    return 'unknown';
  }
}
