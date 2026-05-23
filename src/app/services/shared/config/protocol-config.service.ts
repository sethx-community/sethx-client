import { Injectable, computed, signal } from '@angular/core';

import { PROTOCOL_CONFIG, ProductKey, ProtocolConfig } from './protocol-config';

@Injectable({ providedIn: 'root' })
export class ProtocolConfigService {
  private readonly _config = signal<ProtocolConfig>(PROTOCOL_CONFIG);

  readonly config = this._config.asReadonly();
  readonly network = computed(() => this._config().currentNetwork);
  readonly contracts = computed(() => this._config().contracts);
  readonly assets = computed(() => this._config().assets.filter((asset) => asset.enabled));
  readonly products = computed(() => this._config().products.filter((product) => product.enabled));
  readonly compliance = computed(() => this._config().compliance);
  readonly language = computed(() => this._config().language);
  readonly assistant = computed(() => this._config().assistant);

  product(key: ProductKey) {
    return this._config().products.find((product) => product.key === key) ?? null;
  }

  contractAddress(name: string): string | null {
    return this._config().contracts[name] ?? null;
  }

  isBlockedCountry(countryCode: string | null): boolean {
    if (!countryCode) return false;
    return this._config().compliance.blockedCountries.includes(countryCode.toUpperCase());
  }
}
