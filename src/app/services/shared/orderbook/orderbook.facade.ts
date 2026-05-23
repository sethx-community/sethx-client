import { Injectable, computed, inject } from '@angular/core';
import { OrderBookStore } from './orderbook.store';
import { OrderBookActionsService } from './orderbook-actions.service';
import type { SpotOrder } from '../../onchain/contracts/token-spot-orderbook-read.service';
import { toStatus, type Status } from '../../../core/tokens/resource-status';

type BookSortKey = 'pair' | 'orders' | 'myOrders';

@Injectable({ providedIn: 'root' })
export class OrderBookFacade {
  private readonly store = inject(OrderBookStore);
  private readonly actions = inject(OrderBookActionsService);

  // =========================================================
  // ===================== READ-ONLY STATE ====================
  // =========================================================

  // books + selection
  readonly visibleBooks = this.store.visibleBooks;
  readonly selectedBook = this.store.selectedBook;

  // resources: status/error (instead of loadingBooks/loadingOrders/error signals)
  readonly booksUiStatus = computed<Status>(() =>
    toStatus(this.store.booksStatus()),
  );
  readonly booksError = computed(() => this.store.booksError() ?? null);

  readonly ordersUiStatus = computed<Status>(() =>
    toStatus(this.store.ordersStatus()),
  );
  readonly ordersError = computed(() => this.store.ordersError() ?? null);

  // derived "loading" booleans for templates that want old shape
  readonly loadingBooks = computed(() => this.booksUiStatus() === 'pending');
  readonly loadingOrders = computed(() => this.ordersUiStatus() === 'pending');

  // single error stream (optional convenience)
  readonly error = computed(() => this.ordersError() ?? this.booksError());

  // sorting + paging + filters
  readonly supportsMyTotals = this.store.supportsMyTotals;
  readonly bookSortKey = this.store.bookSortKey;
  readonly bookSortDir = this.store.bookSortDir;

  readonly bookOffset = this.store.bookOffset;
  readonly bookLimit = this.store.bookLimit;

  readonly bookSearch = this.store.bookSearch;
  readonly booksWithMyOrdersOnly = this.store.booksWithMyOrdersOnly;
  readonly myOrdersOnly = this.store.myOrdersOnly;
  readonly myOrders = this.store.myOrders;
  readonly myOrdersUiStatus = computed<Status>(() => toStatus(this.store.myOrdersStatus()));
  readonly myOrdersError = computed(() => this.store.myOrdersError() ?? null);
  readonly loadingMyOrders = computed(() => this.myOrdersUiStatus() === 'pending');

  // orders / ladder
  readonly visibleOrders = this.store.visibleOrders;

  readonly ladderPairs = this.store.ladderPairs;
  readonly focusRows = this.store.focusRows;
  readonly restRows = this.store.restRows;

  readonly bestBid = this.store.bestBid;
  readonly bestAsk = this.store.bestAsk;
  readonly spreadP18 = this.store.spreadP18;

  readonly ladderFocus = this.store.ladderFocus;
  readonly showAllRows = this.store.showAllRows;

  // =========================================================
  // ===================== DISPLAY HELPERS ====================
  // =========================================================

  shortAddr = this.store.shortAddr;
  tokenLabel = this.store.tokenLabel;
  formatAmount = this.store.formatAmount;
  formatPrice = this.store.formatPrice;
  formatExpiry = this.store.formatExpiry;
  formatPriceP18 = this.store.formatPriceP18;
  pairLabel = (b: any) => this.store.pairLabel(b);

  trackBook = this.store.trackBook;
  bookOrderCount = this.store.bookOrderCount;
  bookMyOrderCount = this.store.bookMyOrderCount;

  // fill input (UI methods)
  fillAmountByOrderId = (id: bigint) => this.store.fillAmountByOrderId(id);
  setFillAmount = (id: bigint, v: string) => this.store.setFillAmount(id, v);

  // =========================================================
  // ======================== UI MUTATORS =====================
  // =========================================================

  setBookSearch(v: string) {
    this.store.bookSearch.set(String(v ?? ''));
  }

  setBooksWithMyOrdersOnly(v: boolean) {
    this.store.booksWithMyOrdersOnly.set(!!v);
  }

  setMyOrdersOnly(v: boolean) {
    this.store.myOrdersOnly.set(!!v);
  }

  setLadderFocus(v: number) {
    const n = Number(v);
    this.store.ladderFocus.set(Number.isFinite(n) && n > 0 ? n : 5);
  }

  toggleShowAllRows() {
    this.store.showAllRows.update((x) => !x);
  }

  setBookOffset(v: number) {
    const n = Math.max(0, Number(v) || 0);
    this.store.bookOffset.set(n);
  }

  setBookLimit(v: number) {
    const n = Math.max(1, Number(v) || 25);
    this.store.bookLimit.set(n);
  }

  // =========================================================
  // =========================== COMMANDS ======================
  // =========================================================

  openBook(key: string) {
    this.store.openBook(key);
    // orders resource will rerun automatically because selectedBookKey changed
  }

  closeBook() {
    this.store.closeBook();
  }

  toggleBookSort(key: BookSortKey) {
    this.store.toggleBookSort(key);
  }

  // =========================================================
  // ===================== CONFIRMATION MODAL ==================
  // =========================================================

  readonly confirmOpen = this.actions.confirmOpen;
  readonly confirmTitle = this.actions.confirmTitle;
  readonly confirmLabel = this.actions.confirmLabel;
  readonly confirmFields = this.actions.confirmFields;
  readonly confirmRequirements = this.actions.confirmRequirements;
  readonly confirmDisabled = this.actions.confirmDisabled;
  readonly confirmError = this.actions.confirmError;
  readonly receipt = this.actions.receipt;
  readonly explorerTxUrl = this.actions.explorerTxUrl;

  // canonical status replaces confirmLoading
  readonly confirmStatus = this.actions.status;
  readonly confirmLoading = computed(() => this.confirmStatus() === 'pending');

  closeConfirmModal = () => this.actions.closeConfirmModal();
  onConfirmModalConfirm = () => this.actions.onConfirmModalConfirm();

  // =========================================================
  // =========================== ACTIONS =======================
  // =========================================================

  requestCancel = (o: SpotOrder) => this.actions.requestCancel(o);

  requestFill = (o: SpotOrder) => this.actions.requestFill(o);
}
