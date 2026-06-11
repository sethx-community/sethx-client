import {
  Injectable,
  inject,
  computed,
  resource,
  signal,
  effect,
} from '@angular/core';
import { ethers } from 'ethers';
import { stableComputed, stableResourceValue } from '../../core/signals/stable-resource';
import { TokenService, TokenInfo } from './token.service';
import { ETH_ADDRESS } from './main.tokens';
import { PriceManagerContractService } from '../onchain/contracts/pricemanager-contract.service';
import { CONTRACT_ADDRESSES } from '../../contracts/generated/addresses';
import { TriggerService } from './trigger.service';
import { toStatus, type Status } from '../../core/tokens/resource-status';

export type PriceSource = { price: number | null; timestamp?: number; checkedAt?: number; source?: string };

export type TokenPriceInfo = {
  address: string;
  prices: {
    oracle?: PriceSource;
    onchain?: PriceSource;
    api?: PriceSource;
  };
  lastChange: {
    oracle: number | null;
    onchain: number | null;
    api: number | null;
  };
};

@Injectable({ providedIn: 'root' })
export class TokenPriceService {
  private readonly tokenService = inject(TokenService);
  private readonly trigger = inject(TriggerService);
  private readonly priceManager = inject(PriceManagerContractService);

  // ---- previous prices (for delta computation) ----
  private readonly _prevOracle = signal(new Map<string, number | null>());
  private readonly _prevOnchain = signal(new Map<string, number | null>());
  private readonly _prevApi = signal(new Map<string, number | null>());

  private readonly _hadSuccess = signal(false);

  // ---- stable token list key (no tick in params) ----
  private readonly _tokensKey = computed(() => {
    const list = this.tokenService.list() ?? [];
    return list
      .map((t: TokenInfo) => t.address.toLowerCase())
      .sort()
      .join('|');
  });

  private readonly _tokensList = computed(() => {
    const list = this.tokenService.list() ?? [];
    // keep deterministic + normalized
    return list.map((t) => t.address.toLowerCase());
  });

  // ============================================================
  // ===================== BULK PRICE RESOURCES =================
  // ============================================================

  // ✅ params contain real inputs only (tokensKey)
  private readonly _oraclePricesRes = resource<
    Record<string, PriceSource>,
    { tokensKey: string }
  >({
    params: () => ({ tokensKey: this._tokensKey() }),
    loader: async () => {
      const tokens = this._tokensList();
      const out: Record<string, PriceSource> = {};

      for (const addr of tokens) {
        out[addr] = await this._safeGet(() => this._getPriceFromOracle(addr));
      }

      this._hadSuccess.set(true);
      this._updatePrev(this._prevOracle, out);
      return out;
    },
  });

  private readonly _onchainPricesRes = resource<
    Record<string, PriceSource>,
    { tokensKey: string }
  >({
    params: () => ({ tokensKey: this._tokensKey() }),
    loader: async () => {
      const tokens = this._tokensList();
      const out: Record<string, PriceSource> = {};

      for (const addr of tokens) {
        out[addr] = await this._safeGet(() => this._getPriceFromChain(addr));
      }

      this._hadSuccess.set(true);
      this._updatePrev(this._prevOnchain, out);
      return out;
    },
  });

  private readonly _apiPricesRes = resource<
    Record<string, PriceSource>,
    { tokensKey: string }
  >({
    params: () => ({ tokensKey: this._tokensKey() }),
    loader: async () => {
      const tokens = this._tokensList();
      const out: Record<string, PriceSource> = {};

      for (const addr of tokens) {
        out[addr] = await this._safeGet(() => this._getPriceFromAPI(addr));
      }

      this._hadSuccess.set(true);
      this._updatePrev(this._prevApi, out);
      return out;
    },
  });

  constructor() {
    // ✅ tick lives in effect; effect triggers reload without clearing values
    effect(() => {
      this.trigger.pricesTick();
      this.refreshPrices();
    });
  }

  refreshPrices() {
    this._oraclePricesRes.reload();
    this._onchainPricesRes.reload();
    this._apiPricesRes.reload();
  }

  // PUBLIC computeds (maps)
  private readonly _stableOraclePrices = stableResourceValue(() => this._oraclePricesRes.value(), {} as Record<string, PriceSource>);
  readonly oraclePrices = computed(() => this._stableOraclePrices());
  private readonly _stableOnchainPrices = stableResourceValue(() => this._onchainPricesRes.value(), {} as Record<string, PriceSource>);
  readonly onchainPrices = computed(() => this._stableOnchainPrices());
  private readonly _stableApiPrices = stableResourceValue(() => this._apiPricesRes.value(), {} as Record<string, PriceSource>);
  readonly apiPrices = computed(() => this._stableApiPrices());

  // PUBLIC computeds (status/error)
  readonly status = computed<Status>(() => {
    const s1 = toStatus(this._oraclePricesRes.status());
    const s2 = toStatus(this._onchainPricesRes.status());
    const s3 = toStatus(this._apiPricesRes.status());

    const anyPending = s1 === 'pending' || s2 === 'pending' || s3 === 'pending';
    const anyError =
      !!this._oraclePricesRes.error() ||
      !!this._onchainPricesRes.error() ||
      !!this._apiPricesRes.error();

    if (anyPending) return 'pending';
    if (anyError) return 'error';
    if (this._hadSuccess()) return 'success';
    return 'idle';
  });

  readonly error = computed(
    () =>
      this._oraclePricesRes.error() ??
      this._onchainPricesRes.error() ??
      this._apiPricesRes.error() ??
      null,
  );

  // ============================================================
  // ======================== PUBLIC API =========================
  // ============================================================

  tokenPrices(address: string) {
    const key = (address ?? '').toLowerCase();

    return computed<TokenPriceInfo>(() => {
      const nativeKey = this.normalizeTokenAddress(key);
      const oracleMap = this.oraclePrices();
      const onchainMap = this.onchainPrices();
      const apiMap = this.apiPrices();

      const curOracle = oracleMap[nativeKey]?.price ?? null;
      const curOnchain = onchainMap[nativeKey]?.price ?? null;
      const curApi = apiMap[nativeKey]?.price ?? null;

      const prevO = this._prevOracle().get(nativeKey) ?? null;
      const prevC = this._prevOnchain().get(nativeKey) ?? null;
      const prevA = this._prevApi().get(nativeKey) ?? null;

      return {
        address: nativeKey,
        prices: {
          oracle: oracleMap[nativeKey],
          onchain: onchainMap[nativeKey],
          api: apiMap[nativeKey],
        },
        lastChange: {
          oracle: prevO != null && curOracle != null ? curOracle - prevO : null,
          onchain:
            prevC != null && curOnchain != null ? curOnchain - prevC : null,
          api: prevA != null && curApi != null ? curApi - prevA : null,
        },
      };
    });
  }

  readonly allTokenPrices = stableComputed(() => {
    const tokens = this.tokenService.list() ?? [];
    const oracleMap = this.oraclePrices();
    const onchainMap = this.onchainPrices();
    const apiMap = this.apiPrices();

    return tokens.map((t) => {
      const key = t.address.toLowerCase();
      const nativeKey = this.normalizeTokenAddress(key);

      return {
        address: nativeKey,
        prices: {
          oracle: oracleMap[nativeKey],
          onchain: onchainMap[nativeKey],
          api: apiMap[nativeKey],
        },
        lastChange: { oracle: null, onchain: null, api: null },
      } satisfies TokenPriceInfo;
    });
  });

  // ============================================================
  // ========================= INTERNALS =========================
  // ============================================================

  private _updatePrev(
    prevSig: ReturnType<typeof signal<Map<string, number | null>>>,
    out: Record<string, PriceSource>,
  ) {
    const next = new Map(prevSig());
    for (const [addr, p] of Object.entries(out))
      next.set(addr, p.price ?? null);
    prevSig.set(next);
  }

  private async _safeGet(fn: () => Promise<PriceSource>): Promise<PriceSource> {
    const checkedAt = Date.now();
    try {
      const res = await fn();
      return { price: res.price ?? 0, timestamp: res.timestamp ?? checkedAt, checkedAt, source: res.source };
    } catch {
      return { price: 0, timestamp: checkedAt, checkedAt };
    }
  }

  private async _getPriceFromChain(_address: string): Promise<PriceSource> {
    return { price: 0, timestamp: Date.now(), source: 'chain' };
  }

  private async _getPriceFromOracle(address: string): Promise<PriceSource> {
    const key = this.normalizeTokenAddress(address);
    const now = Date.now();

    if (this.isNativeEth(key)) {
      return { price: 1, timestamp: now, source: 'native' };
    }

    if (key === CONTRACT_ADDRESSES.SethxToken.toLowerCase()) {
      const sethxPrice = await this.getSethxEthPrice();
      if (sethxPrice.price != null && sethxPrice.price > 0) return sethxPrice;
    }

    try {
      const usable = await this.priceManager.getUsableOracleForTokenContext(key, 1);
      if (usable.ok && usable.oracle) {
        const result = await this.priceManager.read('tryGetOraclePriceInEth' as any, [usable.oracle, 1] as any) as any;
        const ok = Boolean(result?.ok ?? result?.[0] ?? false);
        const raw = BigInt(result?.priceE18 ?? result?.[1] ?? 0);
        if (ok && raw > 0n) {
          return {
            price: Number(ethers.formatUnits(raw, 18)),
            timestamp: now,
            source: 'price-manager',
          };
        }
      }
    } catch {
      // Leave as unvalued if PriceManager cannot return a live token price.
    }

    return { price: 0, timestamp: now, source: 'oracle' };
  }

  private async getSethxEthPrice(): Promise<PriceSource> {
    const now = Date.now();
    try {
      const result = await this.priceManager.read(
        'getOraclePrice' as any,
        [CONTRACT_ADDRESSES.SethxFeeConversionOracle, 5] as any,
      ) as any;
      const raw = BigInt(result?.price ?? result?.[0] ?? 0);
      const decimals = Number(result?.priceDecimals ?? result?.[1] ?? 18);
      const timestampRaw = BigInt(result?.timestamp ?? result?.[2] ?? 0);
      const sethxPerEth = Number(ethers.formatUnits(raw, decimals));
      if (Number.isFinite(sethxPerEth) && sethxPerEth > 0) {
        return {
          price: 1 / sethxPerEth,
          timestamp: timestampRaw > 0n ? Number(timestampRaw) * 1000 : now,
          source: 'sethx-fee-conversion-oracle',
        };
      }
    } catch {
      // Fall through to unvalued.
    }
    return { price: 0, timestamp: now, source: 'sethx-fee-conversion-oracle' };
  }

  private async _getPriceFromAPI(_address: string): Promise<PriceSource> {
    return { price: 0, timestamp: Date.now(), source: 'api' };
  }

  private normalizeTokenAddress(address: string): string {
    const key = String(address ?? '').trim().toLowerCase();
    return this.isNativeEth(key) ? ETH_ADDRESS.toLowerCase() : key;
  }

  private isNativeEth(address: string): boolean {
    const key = String(address ?? '').trim().toLowerCase();
    return key === 'eth'
      || key === ethers.ZeroAddress.toLowerCase()
      || key === ETH_ADDRESS.toLowerCase()
      || key === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
  }
}
