import { Injectable, computed, inject, signal } from '@angular/core';

import { ProtocolConfigService } from '../config/protocol-config.service';

export type SupportedLanguage = 'en' | 'es' | 'pt';

const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  en: 'English',
  es: 'Español',
  pt: 'Português',
};

function normalizeLanguage(value: string | null): SupportedLanguage | null {
  const code = value?.toLowerCase().slice(0, 2) ?? null;
  if (code === 'en' || code === 'es' || code === 'pt') return code;
  return null;
}

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly protocolConfig = inject(ProtocolConfigService);
  private readonly _language = signal<SupportedLanguage>(this.initialLanguage());

  readonly language = this._language.asReadonly();
  readonly availableLanguages = computed(() =>
    this.protocolConfig.language().supportedLanguages.map((code) => ({
      code,
      label: LANGUAGE_LABELS[code],
    })),
  );
  readonly currentLanguageLabel = computed(() => LANGUAGE_LABELS[this._language()]);

  constructor() {
    void this.initializeFromGeoHint();
  }

  setLanguage(language: SupportedLanguage): void {
    this._language.set(language);
    this.safeLocalStorageSet(this.protocolConfig.language().storageKey, language);
  }

  private initialLanguage(): SupportedLanguage {
    const stored = normalizeLanguage(this.safeLocalStorageGet(this.protocolConfig.language().storageKey));
    if (stored) return stored;

    if (typeof navigator !== 'undefined') {
      const browserLanguage = normalizeLanguage(navigator.language);
      if (browserLanguage) return browserLanguage;
    }

    return this.protocolConfig.language().defaultLanguage;
  }

  private async initializeFromGeoHint(): Promise<void> {
    if (this.safeLocalStorageGet(this.protocolConfig.language().storageKey)) return;

    const countryCode = await this.fetchCountryCodeHint();
    if (!countryCode) return;

    const language = this.protocolConfig.language().countryHints[countryCode.toUpperCase()];
    if (language) this._language.set(language);
  }

  private async fetchCountryCodeHint(): Promise<string | null> {
    if (typeof fetch === 'undefined') return null;

    try {
      const response = await fetch(this.protocolConfig.compliance().geoEndpoint, { cache: 'no-store' });
      if (!response.ok) return null;
      const body = (await response.json()) as { countryCode?: string; country?: string };
      return body.countryCode ?? body.country ?? null;
    } catch {
      return null;
    }
  }

  private safeLocalStorageGet(key: string): string | null {
    try {
      return typeof localStorage === 'undefined' ? null : localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  private safeLocalStorageSet(key: string, value: string): void {
    try {
      if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
    } catch {
      // Browser storage may be disabled. Language still works for this session.
    }
  }
}
