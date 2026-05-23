import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TradeSettingsComponent } from '../../../../components/trade-settings/trade-settings.component';
import { OrderFlowService } from '../../../../core/overlay/order-flow.service';
import { FuturesOrderModalComponent } from '../../../../core/overlay/order-modal/futuresorder-modal.component';
import { FuturesOrderBookFacade } from '../../../../services/shared/futures-orderbook/futures-orderbook.facade';
import { FuturesPositionRow } from '../../../../services/shared/futures-orderbook/futures-orderbook.store';
import { OrderbookSelectionService, SelectedOrderActionsComponent } from '../../../../shared/orderbook';
import { selectedOrderCancelSafety, selectedOrderFillSafety, toNumber } from '../../../../shared/safety';
import { TradeSettingsService } from '../../../../services/shared/trade-settings.service';

@Component({
  selector: 'app-right-panel-futures',
  standalone: true,
  imports: [CommonModule, TradeSettingsComponent, SelectedOrderActionsComponent],
  templateUrl: './right-panel-futures.component.html',
})
export class RightPanelFuturesComponent {
  readonly ob = inject(FuturesOrderBookFacade);
  readonly orderSelection = inject(OrderbookSelectionService);
  readonly settings = inject(TradeSettingsService);
  readonly flow = inject(OrderFlowService);
  readonly copiedValue = signal<string | null>(null);

  readonly isMarketOrderView = computed(() => this.ob.store.activeView() === 'orders');
  readonly isOrderManagementView = computed(() => this.ob.store.activeView() === 'orders' || this.ob.store.activeView() === 'my-orders');
  readonly isPositionsView = computed(() => this.ob.store.activeView() === 'positions');
  readonly selectedPosition = this.ob.store.selectedPosition;

  readonly selected = computed(() => {
    const s = this.orderSelection.selected();
    return s?.product === 'futures' ? s : null;
  });

  private readonly nowUnixSec = () => Math.floor(Date.now() / 1000);
  private readonly selectedOrderExpired = computed(() => {
    const row = this.selected();
    const expiry = toNumber(row?.order?.expiry);
    return !!expiry && expiry <= this.nowUnixSec();
  });

  readonly selectedFillSafety = computed(() => selectedOrderFillSafety({
    selectedOrder: this.selected(),
    isMine: !!this.selected()?.isMine,
    fillAmount: this.fillAmount(),
    activeAccountId: this.settings.selectedAccountId(),
    orderExpired: this.selectedOrderExpired(),
  }));

  readonly selectedCancelSafety = computed(() => selectedOrderCancelSafety({
    selectedOrder: this.selected(),
    isMine: !!this.selected()?.isMine,
    activeAccountId: this.settings.selectedAccountId(),
    orderExpired: this.selectedOrderExpired(),
  }));

  async copyValue(value: string | number | bigint | null | undefined, ev?: Event): Promise<void> {
    ev?.stopPropagation();
    const text = value === null || value === undefined || value === '' ? '' : String(value);
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      this.copiedValue.set(text);
      window.setTimeout(() => {
        if (this.copiedValue() === text) this.copiedValue.set(null);
      }, 1400);
    } catch {
      // Keep the value selectable if clipboard access is unavailable.
    }
  }

  fillAmount(): string {
    const row = this.selected();
    return row ? this.ob.store.fillAmountByOrderId(BigInt(row.orderId)) : '';
  }

  setFillAmount(value: string): void {
    const row = this.selected();
    if (row) this.ob.store.setFillAmount(BigInt(row.orderId), value);
  }

  fillSelected(): void {
    const row = this.selected();
    if (!row || this.selectedFillSafety().disabled) return;
    this.ob.actions.requestFill(row.order);
  }

  cancelSelected(): void {
    const row = this.selected();
    if (!row || this.selectedCancelSafety().disabled) return;
    this.ob.actions.requestCancel(row.order);
  }

  clearSelected(): void {
    this.orderSelection.clear('futures');
  }

  clearPosition(): void {
    this.ob.store.clearSelectedPosition();
  }

  openPlaceOrderForSelectedMarket(): void {
    this.flow.open(FuturesOrderModalComponent, {
      intent: 'buy',
      defaultMarketKey: this.ob.store.selectedMarketKey() ?? undefined,
    });
  }

  openFeeQuoteForSelectedMarket(): void {
    this.flow.open(FuturesOrderModalComponent, {
      intent: 'quote',
      defaultMarketKey: this.ob.store.selectedMarketKey() ?? undefined,
    });
  }

  placeOrderForPosition(row: FuturesPositionRow): void {
    this.flow.open(FuturesOrderModalComponent, {
      intent: 'buy',
      defaultMarketKey: row.marketKey,
    });
  }

  feeQuoteForPosition(row: FuturesPositionRow): void {
    this.flow.open(FuturesOrderModalComponent, {
      intent: 'quote',
      defaultMarketKey: row.marketKey,
    });
  }
}
