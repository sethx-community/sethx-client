import { Injectable, computed, inject, signal, resource } from '@angular/core';
import { ethers } from 'ethers';
import { formatUnitsHuman, formatTokenAmount, formatDecimal } from '../../../core/format/number-format';
import { stableComputed, stableResourceValue, structuralEqual } from '../../../core/signals/stable-resource';

import { TriggerService } from '../trigger.service';
import { TradeSettingsService } from '../trade-settings.service';
import { MarketTimeService } from '../market-time.service';
import { norm } from '../../../core/tokens/token-normalize';

import {
  FuturesOrderBookReadService,
  FuturesOrder,
} from '../../onchain/contracts/futures-orderbook-read.service';
import {
  FuturesContractReadService,
  FuturesMarket,
} from '../../onchain/contracts/futures-contract-read.service';

export type ActiveFuturesMarketRow = {
  marketKey: string;
  isActive: boolean;
  market: FuturesMarket | null;
  buyCount: number;
  sellCount: number;
  longHolders: number;
  shortHolders: number;
  totalLongUnits: bigint;
  totalShortUnits: bigint;
  totalLongMargin: bigint;
  totalShortMargin: bigint;
};

export type FuturesMyOrderRow = FuturesOrder & {
  marketLabel: string;
  sideLabel: 'Buy / Long' | 'Sell / Short';
  isMine: boolean;
};

export type FuturesPositionRow = {
  marketKey: string;
  market: FuturesMarket | null;
  longSize: bigint;
  shortSize: bigint;
  longMargin: bigint;
  shortMargin: bigint;
  margin: bigint;
  longRequiredMargin: bigint;
  shortRequiredMargin: bigint;
  longReclaimableMargin: bigint;
  shortReclaimableMargin: bigint;
  requiredMargin: bigint;
};

function bi(x: any): bigint {
  try {
    return typeof x === 'bigint' ? x : BigInt(x?.toString?.() ?? '0');
  } catch {
    return 0n;
  }
}

@Injectable({ providedIn: 'root' })
export class FuturesOrderBookStore {
  private readonly reads = inject(FuturesOrderBookReadService);
  private readonly futuresReads = inject(FuturesContractReadService);
  private readonly trigger = inject(TriggerService);
  private readonly settings = inject(TradeSettingsService);
  private readonly marketTime = inject(MarketTimeService);

  readonly marketOffset = signal(0);
  readonly marketLimit = signal(25);
  readonly marketSearch = signal('');
  readonly marketsWithMyOrdersOnly = signal(false);
  readonly myOrdersOnly = signal(false);
  readonly selectedMarketKey = signal<string | null>(null);
  readonly activeView = signal<'markets' | 'orders' | 'positions' | 'my-orders'>('markets');
  readonly selectedPositionMarketKey = signal<string | null>(null);

  readonly activeAccount = computed(() =>
    norm(this.settings.selectedAccountId() ?? ''),
  );

  formatQuotePrice(raw: bigint, quoteDecimals: number): string {
    try {
      return formatUnitsHuman(raw, Math.max(0, Number(quoteDecimals ?? 18)), { maxDecimals: 8, mode: 'scaled-small', compactFrom: 1_000_000 });
    } catch {
      return String(raw ?? 0n);
    }
  }

  formatOraclePrice(raw: bigint, oracleDecimals: number): string {
    return this.formatQuotePrice(raw, Math.max(0, Number(oracleDecimals ?? 18)));
  }

  normalizeOraclePrice(
    raw: bigint | number | string | null | undefined,
    oracleDecimals: number | null | undefined,
    marginDecimals = 18,
  ): bigint {
    const value = bi(raw ?? 0n);
    if (value === 0n) return 0n;

    const oracleDec = Math.max(0, Number(oracleDecimals ?? marginDecimals));
    const marginDec = Math.max(0, Number(marginDecimals ?? 18));

    if (oracleDec === marginDec) return value;
    if (oracleDec < marginDec) return value * 10n ** BigInt(marginDec - oracleDec);
    return value / 10n ** BigInt(oracleDec - marginDec);
  }

  formatSize(raw: bigint, decimals: number): string {
    try {
      return formatUnitsHuman(raw, Math.max(0, Number(decimals ?? 18)), { maxDecimals: 6, compactFrom: 1_000_000 });
    } catch {
      return String(raw ?? 0n);
    }
  }

  formatContracts(raw: bigint | number | string | null | undefined): string {
    try {
      return formatUnitsHuman(BigInt(raw?.toString?.() ?? '0'), 18, { maxDecimals: 6, compactFrom: 1_000_000 });
    } catch {
      return String(raw ?? '0');
    }
  }

  formatPercentBps(raw: bigint): string {
    const n = Number(raw ?? 0n) / 100;
    return `${n.toFixed(2)}%`;
  }

  shortAddress(x: string | null | undefined): string {
    const s = String(x ?? '');
    if (s.length <= 12) return s || '—';
    return `${s.slice(0, 6)}...${s.slice(-4)}`;
  }

  // ============================================================
  // Markets list
  // ============================================================

  private readonly _marketsRes = resource<
    ActiveFuturesMarketRow[],
    { tick: number; offset: number; limit: number }
  >({
    params: () => ({
      tick: this.trigger.futuresOrderbookTick(),
      offset: this.marketOffset(),
      limit: this.marketLimit(),
    }),
    loader: async ({ params }) => {
      const keys = await this.futuresReads.marketKeysPaged(
        params.offset,
        params.limit,
      );
      if (!keys.length) return [];

      const rows = await Promise.all(
        keys.map(async (k) => {
          const [m, isActive, buyIds, sellIds, stats] = await Promise.all([
            this.futuresReads.getMarket(k),
            this.futuresReads.isMarketActive(k),
            this.reads.getBook(k, true),
            this.reads.getBook(k, false),
            this.futuresReads.getMarketStats(k),
          ]);

          return {
            marketKey: k,
            isActive,
            market: m,
            buyCount: buyIds.length,
            sellCount: sellIds.length,
            longHolders: stats.longHolders,
            shortHolders: stats.shortHolders,
            totalLongUnits: stats.totalLongUnits,
            totalShortUnits: stats.totalShortUnits,
            totalLongMargin: stats.totalLongMargin,
            totalShortMargin: stats.totalShortMargin,
          } as ActiveFuturesMarketRow;
        }),
      );

      rows.sort(
        (a, b) =>
          b.buyCount +
          b.sellCount +
          b.longHolders +
          b.shortHolders -
          (a.buyCount + a.sellCount + a.longHolders + a.shortHolders),
      );

      return rows;
    },
  });

  private readonly _stableMarkets = stableResourceValue(() => this._marketsRes.value(), [] as ActiveFuturesMarketRow[], {
    equal: structuralEqual,
    keepPreviousWhen: (previous, next) => previous.length > 0 && next.length === 0,
  });

  readonly activeMarkets = stableComputed(() => this._stableMarkets());

  readonly filteredMarkets = stableComputed(() => {
    const q = this.marketSearch().trim().toLowerCase();
    const onlyMine = this.marketsWithMyOrdersOnly();
    const myMarkets = new Set(this.myOrders().map((o) => String(o.marketKey ?? '').toLowerCase()));
    const positionMarkets = new Set(this.myPositions().map((p) => String(p.marketKey ?? '').toLowerCase()));
    let list = this.activeMarkets().filter((m) =>
      m.isActive ||
      myMarkets.has(String(m.marketKey ?? '').toLowerCase()) ||
      positionMarkets.has(String(m.marketKey ?? '').toLowerCase()),
    );
    if (q) {
      list = list.filter((m) => [m.market?.ticker, m.marketKey].some((v) => String(v ?? '').toLowerCase().includes(q)));
    }
    if (onlyMine) {
      list = list.filter((m) => myMarkets.has(String(m.marketKey ?? '').toLowerCase()));
    }
    return list;
  });

  readonly visibleMarkets = stableComputed(() => this.filteredMarkets());

  selectMarket(marketKey: string) {
    this.selectedMarketKey.set(String(marketKey ?? '').toLowerCase());
  }

  clearMarket() {
    this.selectedMarketKey.set(null);
  }

  readonly selectedMarketRow = computed(
    () =>
      this.activeMarkets().find(
        (m) => m.marketKey === this.selectedMarketKey(),
      ) ?? null,
  );

  readonly selectedMarketLabel = computed(() => {
    const row = this.selectedMarketRow();
    const ticker = row?.market?.ticker?.trim?.();
    return ticker || this.selectedMarketKey() || null;
  });

  // ============================================================
  // Orderbook
  // ============================================================

  private readonly _bookRes = resource<
    { buy: FuturesOrder[]; sell: FuturesOrder[] },
    { tick: number; marketKey: string | null }
  >({
    params: () => ({
      tick: this.trigger.futuresOrderbookTick(),
      marketKey: this.selectedMarketKey(),
    }),
    loader: async ({ params }) => {
      const mk = params.marketKey;
      if (!mk) return { buy: [], sell: [] };

      const [buyIds, sellIds] = await Promise.all([
        this.reads.getBook(mk, true),
        this.reads.getBook(mk, false),
      ]);

      const [buyOrders, sellOrders] = await Promise.all([
        Promise.all(buyIds.map((id) => this.reads.getOrder(id))),
        Promise.all(sellIds.map((id) => this.reads.getOrder(id))),
      ]);

      const buy = (buyOrders.filter(Boolean) as FuturesOrder[]).filter(
        (o) => o.amount > 0n,
      );
      const sell = (sellOrders.filter(Boolean) as FuturesOrder[]).filter(
        (o) => o.amount > 0n,
      );

      return { buy, sell };
    },
  });

  private readonly _stableBook = stableResourceValue(
    () => this._bookRes.value(),
    { buy: [] as FuturesOrder[], sell: [] as FuturesOrder[] },
    { resetKey: () => this.selectedMarketKey(), equal: structuralEqual },
  );

  readonly buyOrders = stableComputed(() => {
    const rows = this._stableBook().buy;
    return this.myOrdersOnly() ? rows.filter((o) => norm(o.user) === this.activeAccount()) : rows;
  });
  readonly sellOrders = stableComputed(() => {
    const rows = this._stableBook().sell;
    return this.myOrdersOnly() ? rows.filter((o) => norm(o.user) === this.activeAccount()) : rows;
  });

  // ============================================================
  // My orders across all active futures markets
  // ============================================================

  private readonly _myOrdersRes = resource<
    FuturesMyOrderRow[],
    { tick: number; acct: string; mkHash: string }
  >({
    params: () => ({
      tick: this.trigger.futuresOrderbookTick(),
      acct: this.activeAccount(),
      mkHash: this.activeMarkets().map((m) => m.marketKey).join('|') || '',
    }),
    loader: async ({ params }) => {
      const acct = params.acct;
      if (!acct) return [];

      const rows: FuturesMyOrderRow[] = [];

      for (const market of this.activeMarkets()) {
        try {
          const [buyIds, sellIds] = await Promise.all([
            this.reads.getBook(market.marketKey, true),
            this.reads.getBook(market.marketKey, false),
          ]);

          const decorate = async (id: bigint, side: 0 | 1) => {
            const order = await this.reads.getOrder(id);
            if (!order || order.amount <= 0n) return;
            if (norm(order.user) !== acct) return;
            rows.push({
              ...order,
              marketLabel: market.market?.ticker?.trim?.() || market.marketKey,
              sideLabel: side === 0 ? 'Buy / Long' : 'Sell / Short',
              isMine: true,
            });
          };

          await Promise.all([
            ...buyIds.map((id) => decorate(id, 0)),
            ...sellIds.map((id) => decorate(id, 1)),
          ]);
        } catch {
          // Keep the page usable if one market cannot be read.
        }
      }

      return rows.sort((a, b) => Number(b.orderId - a.orderId));
    },
  });

  private readonly _stableMyOrders = stableResourceValue(() => this._myOrdersRes.value(), [] as FuturesMyOrderRow[], { resetKey: () => this.activeAccount(), equal: structuralEqual });

  readonly myOrders = stableComputed(() => this._stableMyOrders());


  // ============================================================
  // Inline market action inputs
  // ============================================================

  // Fill inputs are reactive so shared selected-order safety recomputes while typing.
  private readonly fillAmounts = signal<Record<string, string>>({});

  fillAmountByOrderId(orderId: bigint): string {
    return this.fillAmounts()[orderId.toString()] ?? '';
  }

  setFillAmount(orderId: bigint, value: string): void {
    const key = orderId.toString();
    const next = String(value ?? '');
    this.fillAmounts.update((current) => ({ ...current, [key]: next }));
  }

  // ============================================================
  // My positions
  // ============================================================

  private readonly _posRes = resource<
    FuturesPositionRow[],
    { tick: number; acct: string; mkHash: string }
  >({
    params: () => ({
      tick: this.trigger.futuresOrderbookTick(),
      acct: this.activeAccount(),
      mkHash:
        this.activeMarkets()
          .map((m) => m.marketKey)
          .join('|') || '',
    }),
    loader: async ({ params }) => {
      const acct = params.acct;
      if (!acct) return [];

      const out: FuturesPositionRow[] = [];
      const markets = this.activeMarkets();

      for (const m of markets) {
        try {
          const [lp, sp] = await Promise.all([
            this.futuresReads.getPosition(acct, m.marketKey, true),
            this.futuresReads.getPosition(acct, m.marketKey, false),
          ]);

          const longSize = bi(lp?.size ?? 0n);
          const shortSize = bi(sp?.size ?? 0n);
          const longMargin = bi(lp?.margin ?? 0n);
          const shortMargin = bi(sp?.margin ?? 0n);
          const margin = longMargin + shortMargin;

          const requiredLong = this.computeRequiredMarginRaw(
            longSize,
            m.market,
          );
          const requiredShort = this.computeRequiredMarginRaw(
            shortSize,
            m.market,
          );
          const requiredMargin = requiredLong + requiredShort;
          const longReclaimable =
            longMargin > requiredLong ? longMargin - requiredLong : 0n;

          const shortReclaimable =
            shortMargin > requiredShort ? shortMargin - requiredShort : 0n;

          if (
            longSize > 0n ||
            shortSize > 0n ||
            longMargin > 0n ||
            shortMargin > 0n
          ) {
            out.push({
              marketKey: m.marketKey,
              market: m.market,
              longSize,
              shortSize,
              longMargin,
              shortMargin,
              margin,
              longRequiredMargin: requiredLong,
              longReclaimableMargin: longReclaimable,
              shortRequiredMargin: requiredShort,
              shortReclaimableMargin: shortReclaimable,
              requiredMargin: requiredMargin,
            });
          }
        } catch {
          // ignore bad market reads
        }
      }

      return out;
    },
  });

  private readonly _stableMyPositions = stableResourceValue(() => this._posRes.value(), [] as FuturesPositionRow[], { resetKey: () => this.activeAccount(), equal: structuralEqual });

  readonly myPositions = stableComputed(() => this._stableMyPositions());

  selectPosition(marketKey: string) {
    this.selectedPositionMarketKey.set(String(marketKey ?? '').toLowerCase());
  }

  clearSelectedPosition() {
    this.selectedPositionMarketKey.set(null);
  }

  readonly selectedPosition = computed(
    () => this.myPositions().find((p) => p.marketKey === this.selectedPositionMarketKey()) ?? null,
  );

  readonly selectedMarketPosition = computed(() => {
    const mk = this.selectedMarketKey();
    if (!mk) return null;
    return this.myPositions().find((p) => p.marketKey === mk) ?? null;
  });

  private normalizedMultiplier(multiplier: bigint | number | string | null | undefined): bigint {
    const raw = bi(multiplier ?? 0n);
    if (raw <= 0n) return 0n;
    return raw >= 10n ** 12n ? raw : raw * 10n ** 18n;
  }

  private computeRequiredMarginRaw(
    size: bigint,
    market: FuturesMarket | null,
  ): bigint {
    if (!market || size <= 0n) return 0n;

    const settlementPrice18 = this.normalizeOraclePrice(
      market.lastSettlementPrice,
      market.oraclePriceDecimals,
      18,
    );
    const multiplier18 = this.normalizedMultiplier(market.multiplier);

    return (
      size *
      multiplier18 *
      settlementPrice18 *
      bi(market.initialMarginBps ?? 0n)
    ) / (10_000n * 10n ** 18n * 10n ** 18n);
  }
}
