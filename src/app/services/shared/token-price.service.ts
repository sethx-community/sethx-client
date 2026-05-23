import {
  Injectable,
  inject,
  computed,
  resource,
  signal,
  effect,
} from '@angular/core';
import { TokenService, TokenInfo } from './token.service';
import { TriggerService } from './trigger.service';
import { toStatus, type Status } from '../../core/tokens/resource-status';

export type PriceSource = { price: number | null; timestamp?: number };

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
  readonly oraclePrices = computed(() => this._oraclePricesRes.value() ?? {});
  readonly onchainPrices = computed(() => this._onchainPricesRes.value() ?? {});
  readonly apiPrices = computed(() => this._apiPricesRes.value() ?? {});

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
      const oracleMap = this.oraclePrices();
      const onchainMap = this.onchainPrices();
      const apiMap = this.apiPrices();

      const curOracle = oracleMap[key]?.price ?? null;
      const curOnchain = onchainMap[key]?.price ?? null;
      const curApi = apiMap[key]?.price ?? null;

      const prevO = this._prevOracle().get(key) ?? null;
      const prevC = this._prevOnchain().get(key) ?? null;
      const prevA = this._prevApi().get(key) ?? null;

      return {
        address: key,
        prices: {
          oracle: oracleMap[key],
          onchain: onchainMap[key],
          api: apiMap[key],
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

  readonly allTokenPrices = computed(() => {
    const tokens = this.tokenService.list() ?? [];
    const oracleMap = this.oraclePrices();
    const onchainMap = this.onchainPrices();
    const apiMap = this.apiPrices();

    return tokens.map((t) => {
      const key = t.address.toLowerCase();
      return {
        address: key,
        prices: {
          oracle: oracleMap[key],
          onchain: onchainMap[key],
          api: apiMap[key],
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
    try {
      const res = await fn();
      return { price: res.price ?? 0, timestamp: res.timestamp ?? Date.now() };
    } catch {
      return { price: 0, timestamp: Date.now() };
    }
  }

  private async _getPriceFromChain(_address: string): Promise<PriceSource> {
    return { price: 0, timestamp: Date.now() };
  }
  private async _getPriceFromOracle(_address: string): Promise<PriceSource> {
    return { price: 0, timestamp: Date.now() };
  }
  private async _getPriceFromAPI(_address: string): Promise<PriceSource> {
    return { price: 0, timestamp: Date.now() };
  }
}
