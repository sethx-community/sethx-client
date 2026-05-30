import { Injectable, computed, inject, signal, resource } from '@angular/core';
import { ethers } from 'ethers';
import { TriggerService } from '../trigger.service';
import { TradeSettingsService } from '../trade-settings.service';
import { MarketTimeService } from '../market-time.service';
import { norm } from '../../../core/tokens/token-normalize';
import {
  OptionsOrderBookReadService,
  OptionOrder,
} from '../../onchain/contracts/options-orderbook-read.service';
import {
  OptionContractReadService,
  OptionMarket,
} from '../../onchain/contracts/option-contract-read.service';
import { OptionsOrderBookFormatService } from './options-orderbook-format.service';

export type ActiveMarketRow = {
  marketKey: string;
  orderCount: bigint;
  totalSize: bigint; // NEW: remaining (bid+ask) in asset units
  market: OptionMarket | null;
  derived?: {
    optionType: number;
    assetToken: string;
    quoteToken: string;
    strikePrice: bigint;
    optionExpiry: bigint;
  } | null;
};

export type MyPositionRow = {
  marketKey: string;
  market: OptionMarket | null;
  derived?: ActiveMarketRow['derived'] | null;
  writerSize: bigint;
  holderAvail: bigint;
  optionExpiry: bigint;
  exerciseWindow: bigint;
  exerciseStart: bigint | null;
  exerciseEnd: bigint | null;
  reclaimAfter: bigint | null;
  canExercise: boolean;
  canReclaim: boolean;
  canSellHolder: boolean;
  canSellWriter: boolean;
  sellHolderHint: string;
  sellWriterHint: string;
  exerciseHint: string;
  reclaimHint: string;
};

export type LadderRow = {
  orderId: bigint;
  side: 'bid' | 'ask'; // bid = long side, ask = short side
  isMine: boolean;
  order: OptionOrder;
};

const ONE_E18 = 10n ** 18n;

function bi(x: any): bigint {
  try {
    return typeof x === 'bigint' ? x : BigInt(x?.toString?.() ?? '0');
  } catch {
    return 0n;
  }
}

@Injectable({ providedIn: 'root' })
export class OptionsOrderBookStore {
  private readonly reads = inject(OptionsOrderBookReadService);
  private readonly optionReads = inject(OptionContractReadService);
  private readonly trigger = inject(TriggerService);
  private readonly settings = inject(TradeSettingsService);
  private readonly marketTime = inject(MarketTimeService);
  private readonly fmt = inject(OptionsOrderBookFormatService);

  // formatting helpers
  tokenLabel = (a: string) => this.fmt.tokenLabel(a);
  tokenDecimals = (a: string) => this.fmt.tokenDecimals(a);
  formatSize = (s: bigint, asset: string) => this.fmt.formatSize(s, asset);
  formatPriceFixed = (p: bigint, asset: string, quote: string) =>
    this.fmt.formatPriceFixed(p, asset, quote);

  // ---------------- UI state ----------------
  readonly marketOffset = signal(0);
  readonly marketLimit = signal(25);
  readonly marketSearch = signal('');
  readonly marketsWithMyOrdersOnly = signal(false);
  readonly myOrdersOnly = signal(false);
  readonly selectedMarketKey = signal<string | null>(null);
  readonly activeView = signal<'markets' | 'orders' | 'positions' | 'my-orders'>('markets');
  readonly selectedPositionMarketKey = signal<string | null>(null);

  // fill amounts per order
  // Reactive map: selected-order fill safety must update immediately when the amount field changes.
  private readonly fillAmounts = signal<Record<string, string>>({});
  fillAmountByOrderId(id: bigint): string {
    return this.fillAmounts()[id.toString()] ?? '';
  }
  setFillAmount(id: bigint, v: string): void {
    const key = id.toString();
    const value = String(v ?? '');
    this.fillAmounts.update((current) => ({ ...current, [key]: value }));
  }

  readonly activeAccount = computed(() =>
    norm(this.settings.selectedAccountId() ?? ''),
  );

  // cancel amounts per order
  private readonly cancelAmounts = new Map<string, string>();

  cancelAmountByOrderId(id: bigint): string {
    return this.cancelAmounts.get(id.toString()) ?? '';
  }

  setCancelAmount(id: bigint, v: string) {
    this.cancelAmounts.set(id.toString(), String(v ?? ''));
  }

  // ============================================================
  // Active markets list (Option A)
  // ============================================================

  private readonly _activeMarketsRes = resource<
    ActiveMarketRow[],
    { tick: number; offset: number; limit: number }
  >({
    params: () => ({
      tick: this.trigger.optionsOrderbookTick(),
      offset: this.marketOffset(),
      limit: this.marketLimit(),
    }),
    loader: async ({ params }) => {
      const keys = await this.reads.getActiveMarketsPaged(
        params.offset,
        params.limit,
      );
      if (!keys.length) return [];

      const rows = await Promise.all(
        keys.map(async (k) => {
          const [cnt, market, totals] = await Promise.all([
            this.reads.getActiveMarketOrderCount(k).then(bi),
            this.optionReads.getMarket(k),
            this.reads.getMarketTotals(k), // NEW
          ]);

          const totalSize = bi(totals?.totalRemaining ?? 0n); // or totals.bidRemaining + totals.askRemaining

          // If the OptionContract market is not initialized yet, try to derive basic metadata
          // from cached orderbook marketMeta so the UI can show pair/strike/expiry.
          let derived: ActiveMarketRow['derived'] = null;
          if (!market) {
            try {
              const meta = await this.reads.getMarketMeta(k);
              if (meta) {
                derived = {
                  optionType: Number(meta.optionType ?? 0),
                  assetToken: meta.assetToken,
                  quoteToken: meta.quoteToken,
                  strikePrice: meta.strikePrice,
                  optionExpiry: meta.optionExpiry,
                };
              }
            } catch {
              derived = null;
            }
          }

          return {
            marketKey: String(k).toLowerCase(),
            orderCount: cnt,
            totalSize, // NEW
            market,
            derived,
          } as ActiveMarketRow;
        }),
      );

      // sort by orderCount desc
      rows.sort((a, b) => Number((b.orderCount ?? 0n) - (a.orderCount ?? 0n)));
      return rows;
    },
  });

  readonly activeMarkets = computed(() => this._activeMarketsRes.value() ?? []);

  readonly filteredMarkets = computed(() => {
    const q = this.marketSearch().trim().toLowerCase();
    const onlyMine = this.marketsWithMyOrdersOnly();
    const myMarkets = new Set(this.myOrders().map((o) => String(o.order?.marketKey ?? '').toLowerCase()));
    const positionMarkets = new Set(this.myPositions().map((p) => String(p.marketKey ?? '').toLowerCase()));
    let list = this.activeMarkets().filter((m) => {
      const info = m.market ?? m.derived;
      const expiry = (info as any)?.expiry ?? (info as any)?.optionExpiry;
      return this.marketTime.hasOpenOptionWindow({ active: true, settled: false, expiry })
        || myMarkets.has(String(m.marketKey ?? '').toLowerCase())
        || positionMarkets.has(String(m.marketKey ?? '').toLowerCase());
    });
    if (q) {
      list = list.filter((m) => {
        const info = m.market ?? m.derived;
        return [m.marketKey, this.tokenLabel(info?.assetToken ?? ''), this.tokenLabel(info?.quoteToken ?? '')]
          .some((v) => String(v ?? '').toLowerCase().includes(q));
      });
    }
    if (onlyMine) {
      list = list.filter((m) => myMarkets.has(String(m.marketKey ?? '').toLowerCase()));
    }
    return list;
  });

  readonly visibleMarkets = computed(() => this.filteredMarkets());

  // ============================================================
  // My positions (best-effort): scans active markets and queries OptionContract positions.
  // Until we add an on-chain market tracker, this only finds positions in markets that are
  // currently active in the orderbook.
  // ============================================================

  private readonly _myPositionsRes = resource<
    MyPositionRow[],
    { tick: number; acct: string; mkHash: string }
  >({
    params: () => ({
      tick: this.trigger.optionsOrderbookTick(),
      acct: this.activeAccount(),
      mkHash:
        this.activeMarkets()
          .map((m) => m.marketKey)
          .join('|') || '',
    }),
    loader: async ({ params }) => {
      const acct = params.acct;
      if (!acct) return [];

      const markets = this.activeMarkets();
      const limit = 50;
      const rows: MyPositionRow[] = [];
      const now = await this.optionReads.latestTimestamp();

      for (let i = 0; i < markets.length && rows.length < limit; i++) {
        const m = markets[i];
        try {
          const p = await this.optionReads.getUserPosition(m.marketKey, acct);
          const holderAvail =
            p.holderSize > p.holderExercised
              ? p.holderSize - p.holderExercised
              : 0n;
          if (p.writerSize > 0n || holderAvail > 0n) {
            const optionExpiry = m.market?.expiry ?? m.derived?.optionExpiry ?? 0n;
            const exerciseWindow = m.market?.exerciseWindow ?? 24n * 60n * 60n;
            const exerciseStart = holderAvail > 0n && optionExpiry > 0n ? optionExpiry : null;
            const exerciseEnd = holderAvail > 0n && optionExpiry > 0n ? optionExpiry + exerciseWindow : null;
            const reclaimAfter = p.writerSize > 0n && optionExpiry > 0n ? optionExpiry + exerciseWindow : null;

            const canSellHolder = holderAvail > 0n && optionExpiry > 0n && now < optionExpiry;
            const canSellWriter = p.writerSize > 0n && optionExpiry > 0n && now < optionExpiry;

            const canExercise =
              holderAvail > 0n &&
              exerciseStart !== null &&
              exerciseEnd !== null &&
              now >= exerciseStart &&
              now <= exerciseEnd;

            const canReclaim =
              p.writerSize > 0n &&
              reclaimAfter !== null &&
              now > reclaimAfter;

            const sellHolderHint =
              holderAvail <= 0n
                ? 'No holder position'
                : optionExpiry <= 0n
                  ? 'Missing market expiry'
                  : now >= optionExpiry
                    ? 'Holder sale closes at option expiry'
                    : 'Sell holder exposure before option expiry';

            const sellWriterHint =
              p.writerSize <= 0n
                ? 'No writer position'
                : optionExpiry <= 0n
                  ? 'Missing market expiry'
                  : now >= optionExpiry
                    ? 'Writer sale closes at option expiry'
                    : 'Sell writer exposure before option expiry';

            const exerciseHint =
              holderAvail <= 0n
                ? 'No holder position'
                : exerciseStart === null || exerciseEnd === null
                  ? 'Missing market expiry'
                  : now < exerciseStart
                    ? 'Exercise opens at expiry'
                    : now > exerciseEnd
                      ? 'Exercise window closed'
                      : 'Exercise window open';

            const reclaimHint =
              p.writerSize <= 0n
                ? 'No writer position'
                : reclaimAfter === null
                  ? 'Missing market expiry'
                  : now <= reclaimAfter
                    ? 'Reclaim opens after exercise window closes'
                    : 'Reclaim available for unexercised collateral';

            rows.push({
              marketKey: m.marketKey,
              market: m.market,
              derived: m.derived,
              writerSize: p.writerSize,
              holderAvail: BigInt(holderAvail),
              optionExpiry: BigInt(optionExpiry),
              exerciseWindow: BigInt(exerciseWindow),
              exerciseStart,
              exerciseEnd,
              reclaimAfter,
              canExercise,
              canReclaim,
              canSellHolder,
              canSellWriter,
              sellHolderHint,
              sellWriterHint,
              exerciseHint,
              reclaimHint,
            });
          }
        } catch {
          // ignore
        }
      }
      return rows;
    },
  });



  // ============================================================
  // My orders: selected-account orders across all active option markets.
  // ============================================================

  private readonly _myOrdersRes = resource<
    LadderRow[],
    { tick: number; acct: string }
  >({
    params: () => ({
      tick: this.trigger.optionsOrderbookTick(),
      acct: this.activeAccount(),
    }),
    loader: async ({ params }) => {
      const acct = params.acct;
      if (!acct) return [];

      const ids = await this.reads.getUserOrderIds(acct);
      if (!ids.length) return [];

      const orders = (await Promise.all(ids.map((id) => this.reads.getOrder(id))))
        .filter(Boolean) as OptionOrder[];

      const rows = orders
        .filter((o) => !o.closed)
        .map((o) => ({
          orderId: o.orderId,
          side: (o.intent === 0 || o.intent === 3 ? 'bid' : 'ask') as 'bid' | 'ask',
          isMine: true,
          order: o,
        }));

      rows.sort((a, b) => Number((b.orderId ?? 0n) - (a.orderId ?? 0n)));
      return rows;
    },
  });

  readonly myOrders = computed(() => this._myOrdersRes.value() ?? []);

  readonly myPositions = computed(() => this._myPositionsRes.value() ?? []);

  selectPosition(marketKey: string) {
    this.selectedPositionMarketKey.set(String(marketKey ?? '').toLowerCase());
  }

  clearSelectedPosition() {
    this.selectedPositionMarketKey.set(null);
  }

  readonly selectedPosition = computed(
    () => this.myPositions().find((p) => p.marketKey === this.selectedPositionMarketKey()) ?? null,
  );

  selectMarket(marketKey: string) {
    this.selectedMarketKey.set(String(marketKey ?? '').toLowerCase());
  }

  clearMarket() {
    this.selectedMarketKey.set(null);
  }

  readonly selectedMarket = computed(
    () =>
      this.activeMarkets().find(
        (m) => m.marketKey === this.selectedMarketKey(),
      ) ?? null,
  );

  // ============================================================
  // Ladder for selected market
  // ============================================================

  private readonly _ladderRes = resource<
    { bids: LadderRow[]; asks: LadderRow[] },
    { tick: number; marketKey: string | null; acct: string }
  >({
    params: () => ({
      tick: this.trigger.optionsOrderbookTick(),
      marketKey: this.selectedMarketKey(),
      acct: this.activeAccount(),
    }),
    loader: async ({ params }) => {
      const mk = params.marketKey;
      if (!mk) return { bids: [], asks: [] };

      const acct = params.acct;
      const myIds = acct ? await this.reads.getUserOrderIds(acct) : [];
      const mySet = new Set(myIds.map((x) => x.toString()));

      const [bidIds, askIds] = await Promise.all([
        this.reads.getOpenOrders(mk, true),
        this.reads.getOpenOrders(mk, false),
      ]);

      const [bidOrders, askOrders] = await Promise.all([
        Promise.all(bidIds.map((order) => this.reads.getOrder(order.orderId))),
        Promise.all(askIds.map((order) => this.reads.getOrder(order.orderId))),
      ]);

      const bids = (bidOrders.filter(Boolean) as OptionOrder[])
        .filter((o) => !o.closed)
        .map((o) => ({
          orderId: o.orderId,
          side: 'bid' as const,
          isMine: mySet.has(o.orderId.toString()) || (!!acct && norm(o.user) === acct),
          order: o,
        }));

      const asks = (askOrders.filter(Boolean) as OptionOrder[])
        .filter((o) => !o.closed)
        .map((o) => ({
          orderId: o.orderId,
          side: 'ask' as const,
          isMine: mySet.has(o.orderId.toString()) || (!!acct && norm(o.user) === acct),
          order: o,
        }));

      // sort like spot: bids desc by price, asks asc by price
      bids.sort((a, b) =>
        Number((b.order.askPrice ?? 0n) - (a.order.askPrice ?? 0n)),
      );
      asks.sort((a, b) =>
        Number((a.order.askPrice ?? 0n) - (b.order.askPrice ?? 0n)),
      );

      return { bids, asks };
    },
  });

  readonly bids = computed(() => {
    const rows = this._ladderRes.value()?.bids ?? [];
    return this.myOrdersOnly() ? rows.filter((r) => r.isMine) : rows;
  });
  readonly asks = computed(() => {
    const rows = this._ladderRes.value()?.asks ?? [];
    return this.myOrdersOnly() ? rows.filter((r) => r.isMine) : rows;
  });

  readonly bestBid = computed(() => this.bids()[0]?.order?.askPrice ?? null);
  readonly bestAsk = computed(() => this.asks()[0]?.order?.askPrice ?? null);
  readonly spread = computed(() => {
    const b = this.bestBid();
    const a = this.bestAsk();
    if (b === null || a === null) return null;
    return a - b;
  });

  // ============================================================
  // Conversions (match spot semantics)
  // ============================================================

  /**
   * Converts a human quote-per-asset price into the contract's fixed format.
   * Same conversion as SpotOrderDraftService.
   */
  priceHumanToFixed(
    priceHuman: string,
    assetDecimals: number,
    quoteDecimals: number,
  ): bigint {
    const p18 = ethers.parseUnits(
      String(priceHuman ?? '0').replace(',', '.'),
      18,
    );
    const diff = quoteDecimals - assetDecimals;
    if (diff === 0) return p18;
    if (diff > 0) return p18 * 10n ** BigInt(diff);
    return p18 / 10n ** BigInt(-diff);
  }

  /** Inverse: fixed -> p18 */
  fixedToP18(
    priceFixed: bigint,
    assetDecimals: number,
    quoteDecimals: number,
  ): bigint {
    let p18 = priceFixed;
    const diff = quoteDecimals - assetDecimals;
    if (diff > 0) p18 = p18 * 10n ** BigInt(diff);
    if (diff < 0) p18 = p18 / 10n ** BigInt(-diff);
    return p18;
  }

  /** Computes quote token raw amount = (assetRaw * priceFixed) / 1e18 */
  quoteNotional(assetRaw: bigint, priceFixed: bigint): bigint {
    return (assetRaw * priceFixed) / ONE_E18;
  }
}
