import { Injectable, computed, inject, signal, resource } from '@angular/core';
import { stableResourceValue } from '../../../core/signals/stable-resource';
import { ethers } from 'ethers';
import { ETH_ADDRESS } from '../main.tokens';
import { SpotOrder } from '../../onchain/contracts/token-spot-orderbook-read.service';
import { norm } from '../../../core/tokens/token-normalize';
import { OrderBookFormatService } from './orderbook-format.service';
import { TradeSettingsService } from '../trade-settings.service';
import { TokenSpotOrderBookReadService } from '../../onchain/contracts/token-spot-orderbook-read.service';
import { TriggerService } from '../../shared/trigger.service';

type BookDir = { base: string; quote: string; count: bigint; volume: bigint };

export type LadderRow = {
  orderId: bigint;
  side: 'buy' | 'sell';
  isMine: boolean;
  user: string;
  order: SpotOrder;
};

export type LadderPairRow = { bid?: LadderRow; ask?: LadderRow };

export type Book = {
  key: string;
  base: string;
  quote: string;
  a: BookDir;
  b: BookDir;
  total: bigint;
  myTotal?: bigint;
};

type SortDir = 'asc' | 'desc';
type BookSortKey = 'pair' | 'orders' | 'myOrders';

const ZERO = ethers.ZeroAddress;
const ETH_KEY = norm(ETH_ADDRESS);

function tokenKey(addr: string): string {
  const a = norm(addr);
  if (!a) return '';
  return a === norm(ZERO) ? ETH_KEY : a;
}
function contractAddressFromKey(key: string): string {
  const k = norm(key);
  return k === ETH_KEY ? ZERO : k;
}
function canon(x: string, y: string) {
  const a = tokenKey(x);
  const b = tokenKey(y);
  return a < b ? { base: a, quote: b } : { base: b, quote: a };
}
function makeBookKey(x: string, y: string) {
  const c = canon(x, y);
  return `${c.base}_${c.quote}`;
}
function bi(x: any): bigint {
  try {
    return BigInt(x?.toString?.() ?? '0');
  } catch {
    return 0n;
  }
}

@Injectable({ providedIn: 'root' })
export class OrderBookStore {
  private readonly reads = inject(TokenSpotOrderBookReadService);
  private readonly fmt = inject(OrderBookFormatService);
  private readonly settings = inject(TradeSettingsService);
  private readonly trigger = inject(TriggerService);

  // expose formatting helpers
  shortAddr = (a: string) => this.fmt.shortAddr(a);
  formatAmount = (o: SpotOrder) => this.fmt.formatAmount(o);
  formatPrice = (o: SpotOrder) => this.fmt.formatPrice(o);
  formatExpiry = (e: bigint) => this.fmt.formatExpiry(e);
  tokenLabel = (a: string) => this.fmt.tokenLabel(a);
  formatPriceP18 = (p: bigint | null | undefined) => this.fmt.formatPriceP18(p);

  // ---------- UI state ----------
  readonly myOrdersOnly = signal(false);
  readonly selectedBookKey = signal<string | null>(null);

  readonly bookSearch = signal('');
  readonly booksWithMyOrdersOnly = signal(false);
  readonly bookSortKey = signal<BookSortKey>('orders');
  readonly bookSortDir = signal<SortDir>('desc');

  readonly bookOffset = signal(0);
  readonly bookLimit = signal(25);

  readonly ladderFocus = signal(5);
  readonly showAllRows = signal(false);

  // per-order fill inputs (UI only)
  // Keep this as a signal so right-panel computed safety states update as soon as the user types.
  private readonly fillAmounts = signal<Record<string, string>>({});
  fillAmountByOrderId(id: bigint): string {
    return this.fillAmounts()[id.toString()] ?? '';
  }
  setFillAmount(id: bigint, v: string): void {
    const key = id.toString();
    const value = String(v ?? '');
    this.fillAmounts.update((current) => ({ ...current, [key]: value }));
  }

  // active account is ACCOUNT CONTRACT address
  readonly activeAccount = computed(() =>
    norm(this.settings.selectedAccountId() ?? ''),
  );

  // ============================================================
  // ========================= RESOURCES =========================
  // ============================================================

  private readonly _booksRes = resource<
    Book[],
    { tick: number; acct: string; offset: number; limit: number }
  >({
    params: () => ({
      tick: this.trigger.orderbookTick(), // ✅ central
      acct: this.activeAccount(),
      offset: this.bookOffset(),
      limit: this.bookLimit(),
    }),
    loader: async ({ params }) => {
      const { bases, quotes } = await this.reads.getActiveBooksPaged(
        params.offset,
        params.limit,
      );

      const acct = params.acct;
      const myIds = acct ? await this.reads.getUserOrderIds(acct) : [];
      const mySet = new Set(myIds.map((x) => x.toString()));

      const map = new Map<string, Book>();

      for (let i = 0; i < (bases?.length ?? 0); i++) {
        const baseRaw = bases[i];
        const quoteRaw = quotes[i];
        if (!baseRaw || !quoteRaw) continue;

        const baseKey = tokenKey(baseRaw);
        const quoteKey = tokenKey(quoteRaw);
        if (!baseKey || !quoteKey || baseKey === quoteKey) continue;

        const key = makeBookKey(baseRaw, quoteRaw);
        const c = canon(baseRaw, quoteRaw);

        const [idsA, idsB] = await Promise.all([
          this.reads.getOrderBookIds(
            contractAddressFromKey(baseKey),
            contractAddressFromKey(quoteKey),
          ),
          this.reads.getOrderBookIds(
            contractAddressFromKey(quoteKey),
            contractAddressFromKey(baseKey),
          ),
        ]);

        const [ordersA, ordersB] = await Promise.all([
          this.reads.loadOrdersByIds(idsA, { max: 4, includeExpired: false }),
          this.reads.loadOrdersByIds(idsB, { max: 4, includeExpired: false }),
        ]);

        const cntA = BigInt(ordersA.length);
        const cntB = BigInt(ordersB.length);
        const volumeA = ordersA.reduce((sum, order) => sum + (order.amount ?? 0n), 0n);
        const volumeB = ordersB.reduce((sum, order) => sum + (order.amount ?? 0n), 0n);

        let myTotal = 0n;
        if (mySet.size) {
          for (const id of idsA) if (mySet.has(id.toString())) myTotal++;
          for (const id of idsB) if (mySet.has(id.toString())) myTotal++;
        }

        const a: BookDir = { base: baseKey, quote: quoteKey, count: cntA, volume: volumeA };
        const b: BookDir = { base: quoteKey, quote: baseKey, count: cntB, volume: volumeB };

        map.set(key, {
          key,
          base: c.base,
          quote: c.quote,
          a,
          b,
          total: cntA + cntB,
          myTotal,
        });
      }

      return [...map.values()];
    },
  });

  private readonly _ordersRes = resource<
    SpotOrder[],
    { tick: number; bookKey: string | null; acct: string }
  >({
    params: () => ({
      tick: this.trigger.orderbookTick(), // ✅ central
      bookKey: this.selectedBookKey(),
      acct: this.activeAccount(), // ✅ so isMine recalcs without extra reads
    }),
    loader: async ({ params }) => {
      const bookKey = params.bookKey;
      if (!bookKey) return [];

      const book = this.books().find((b) => b.key === bookKey) ?? null;
      if (!book) return [];

      const baseKey = tokenKey(book.base);
      const quoteKey = tokenKey(book.quote);

      const baseAddr = contractAddressFromKey(baseKey);
      const quoteAddr = contractAddressFromKey(quoteKey);

      const [idsA, idsB] = await Promise.all([
        this.reads.getOrderBookIds(baseAddr, quoteAddr),
        this.reads.getOrderBookIds(quoteAddr, baseAddr),
      ]);

      const [rawA, rawB] = await Promise.all([
        Promise.all(idsA.map((id) => this.reads.getOrder(id))),
        Promise.all(idsB.map((id) => this.reads.getOrder(id))),
      ]);

      const A = (rawA.filter(Boolean) as SpotOrder[])
        .filter((o) => o.amount > 0n)
        .map((o) => ({
          ...o,
          baseToken: baseKey,
          quoteToken: quoteKey,
          user: norm(o.user),
        }));

      const B = (rawB.filter(Boolean) as SpotOrder[])
        .filter((o) => o.amount > 0n)
        .map((o) =>
          this.invertToOrientation(
            { ...o, user: norm(o.user) },
            baseKey,
            quoteKey,
          ),
        );

      const seen = new Map<string, SpotOrder>();
      for (const o of [...A, ...B]) seen.set(o.orderId.toString(), o);
      return [...seen.values()];
    },
  });


  private readonly _myOrdersRes = resource<
    SpotOrder[],
    { tick: number; acct: string }
  >({
    params: () => ({
      tick: this.trigger.orderbookTick(),
      acct: this.activeAccount(),
    }),
    loader: async ({ params }) => {
      if (!params.acct) return [];
      const ids = await this.reads.getUserOrderIds(params.acct);
      const orders = await this.reads.loadOrdersByIds(ids, {
        max: 8,
        includeExpired: true,
      });
      return orders.sort((a, b) => {
        const ae = a.expiry === 0n ? 2n ** 62n : a.expiry;
        const be = b.expiry === 0n ? 2n ** 62n : b.expiry;
        return ae === be ? Number(b.orderId - a.orderId) : Number(ae - be);
      });
    },
  });

  // ---- public computed exposures (stable committed values, not raw resources) ----
  private readonly _stableBooks = stableResourceValue(
    () => this._booksRes.value(),
    [] as Book[],
    { resetKey: () => `${this.bookOffset()}|${this.bookLimit()}` },
  );
  private readonly _stableBookOrders = stableResourceValue(
    () => this._ordersRes.value(),
    [] as SpotOrder[],
    { resetKey: () => this.selectedBookKey() },
  );
  private readonly _stableMyOrders = stableResourceValue(
    () => this._myOrdersRes.value(),
    [] as SpotOrder[],
    { resetKey: () => this.activeAccount() },
  );

  readonly books = computed(() => this._stableBooks());
  readonly booksStatus = computed(() => this._booksRes.status());
  readonly booksError = computed(() => this._booksRes.error() ?? null);

  readonly bookOrders = computed(() => this._stableBookOrders());
  readonly ordersStatus = computed(() => this._ordersRes.status());
  readonly ordersError = computed(() => this._ordersRes.error() ?? null);

  readonly myOrders = computed(() => this._stableMyOrders());
  readonly myOrdersStatus = computed(() => this._myOrdersRes.status());
  readonly myOrdersError = computed(() => this._myOrdersRes.error() ?? null);

  // ---------- selected book ----------
  readonly selectedBook = computed(() => {
    const key = this.selectedBookKey();
    if (!key) return null;
    return this.books().find((b) => b.key === key) ?? null;
  });

  // ---------- derived ----------
  readonly visibleOrders = computed(() => {
    const acct = this.activeAccount();
    const mineOnly = this.myOrdersOnly();

    let list = this.bookOrders();
    if (mineOnly && acct) list = list.filter((o) => norm(o.user) === acct);
    return list;
  });

  // ============================================================
  // ======================== UI COMMANDS ========================
  // ============================================================

  selectBook(key: string) {
    this.selectedBookKey.set(key);
  }
  openBook(key: string) {
    this.selectBook(key);
  }
  closeBook() {
    this.selectedBookKey.set(null);
  }

  private invertToOrientation(
    o: SpotOrder,
    baseKey: string,
    quoteKey: string,
  ): SpotOrder {
    const invPrice = 10n ** 36n / o.price;
    const invAmount = (o.amount * 10n ** 18n) / invPrice;
    const invInitial = (o.initialAmount * 10n ** 18n) / invPrice;

    return {
      ...o,
      baseToken: baseKey,
      quoteToken: quoteKey,
      side: o.side === 0 ? 1 : 0,
      price: invPrice,
      amount: invAmount,
      initialAmount: invInitial,
    };
  }

  // ---------- ladder UI ----------
  readonly ladderBids = computed<LadderRow[]>(() => {
    const acct = this.activeAccount();
    const list = this.visibleOrders()
      .filter((o) => o.side === 0)
      .sort((a, b) => (a.price === b.price ? 0 : a.price > b.price ? -1 : 1));

    return list.map((o) => ({
      orderId: BigInt(o.orderId.toString()),
      side: 'buy',
      isMine: acct ? norm(o.user) === acct : false,
      user: norm(o.user),
      order: o,
    }));
  });

  readonly ladderAsks = computed<LadderRow[]>(() => {
    const acct = this.activeAccount();
    const list = this.visibleOrders()
      .filter((o) => o.side === 1)
      .sort((a, b) => (a.price === b.price ? 0 : a.price < b.price ? -1 : 1));

    return list.map((o) => ({
      orderId: BigInt(o.orderId.toString()),
      side: 'sell',
      isMine: acct ? norm(o.user) === acct : false,
      user: norm(o.user),
      order: o,
    }));
  });

  readonly ladderPairs = computed<LadderPairRow[]>(() => {
    const bids = this.ladderBids();
    const asks = this.ladderAsks();
    const n = Math.max(bids.length, asks.length);

    const out: LadderPairRow[] = [];
    for (let i = 0; i < n; i++) out.push({ bid: bids[i], ask: asks[i] });
    return out;
  });

  readonly focusRows = computed(() => {
    const f = Math.max(1, Number(this.ladderFocus() || 5));
    return this.ladderPairs().slice(0, f);
  });

  readonly restRows = computed(() => {
    const f = Math.max(1, Number(this.ladderFocus() || 5));
    return this.ladderPairs().slice(f);
  });

  readonly bestBid = computed(() => this.ladderBids()[0] ?? null);
  readonly bestAsk = computed(() => this.ladderAsks()[0] ?? null);

  readonly spreadP18 = computed<bigint | null>(() => {
    const bid = this.bestBid();
    const ask = this.bestAsk();
    if (!bid || !ask) return null;
    const bp = bid.order.price;
    const ap = ask.order.price;
    return ap > bp ? ap - bp : 0n;
  });

  pairLabel(b: Book): string {
    return `${this.tokenLabel(b.base)}/${this.tokenLabel(b.quote)}`;
  }

  readonly supportsMyTotals = computed(() => true); // paged mode has myTotals

  readonly visibleBooks = computed(() => {
    const q = this.bookSearch().trim().toLowerCase();
    const onlyMine = this.booksWithMyOrdersOnly();
    const key = this.bookSortKey();
    const dir = this.bookSortDir();

    let list = this.books() ?? [];

    if (q) {
      list = list.filter((b) => {
        const label = this.pairLabel(b).toLowerCase();
        return (
          label.includes(q) ||
          (b.base ?? '').toLowerCase().includes(q) ||
          (b.quote ?? '').toLowerCase().includes(q) ||
          this.tokenLabel(b.base).toLowerCase().includes(q) ||
          this.tokenLabel(b.quote).toLowerCase().includes(q)
        );
      });
    }

    if (onlyMine && this.supportsMyTotals()) {
      list = list.filter((b) => (b.myTotal ?? 0n) > 0n);
    }

    const mul = dir === 'asc' ? 1 : -1;

    const cmp = (a: Book, b: Book) => {
      if (key === 'pair') {
        const av = this.pairLabel(a).toLowerCase();
        const bv = this.pairLabel(b).toLowerCase();
        if (av === bv) return 0;
        return mul * (av > bv ? 1 : -1);
      }

      if (key === 'myOrders') {
        const av = a.myTotal ?? 0n;
        const bv = b.myTotal ?? 0n;
        return mul * (av === bv ? 0 : av > bv ? 1 : -1);
      }

      const av = a.total ?? 0n;
      const bv = b.total ?? 0n;
      return mul * (av === bv ? 0 : av > bv ? 1 : -1);
    };

    return [...list].sort(cmp);
  });

  toggleBookSort(key: BookSortKey) {
    if (key === 'myOrders' && !this.supportsMyTotals()) return;

    if (this.bookSortKey() === key) {
      this.bookSortDir.set(this.bookSortDir() === 'asc' ? 'desc' : 'asc');
    } else {
      this.bookSortKey.set(key);
      this.bookSortDir.set('desc');
    }
  }

  trackBook = (_: number, b: Book) => b.key;

  bookOrderCount = (b: Book) => (b.total ?? 0n).toString();
  bookMyOrderCount = (b: Book) => (b.myTotal ?? 0n).toString();
}
