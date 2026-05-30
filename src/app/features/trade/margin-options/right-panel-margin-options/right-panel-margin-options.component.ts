import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TradeSettingsComponent } from '../../../../components/trade-settings/trade-settings.component';
import { OrderFlowService } from '../../../../core/overlay/order-flow.service';
import { MarginOptionsOrderModalComponent } from '../../../../core/overlay/order-modal/marginoptionsorder-modal.component';
import { OrderbookSelectionService, SelectedOrderActionsComponent } from '../../../../shared/orderbook';
import { selectedOrderCancelSafety, selectedOrderFillSafety, toNumber } from '../../../../shared/safety';
import { TradeSettingsService } from '../../../../services/shared/trade-settings.service';
import { MarginOptionsOrderBookFacade } from '../../../../services/shared/margin-options-orderbook/margin-options-orderbook.facade';
import { MarginPositionRow } from '../../../../services/shared/margin-options-orderbook/margin-options-orderbook.store';

@Component({
  selector: 'app-right-panel-margin-options',
  standalone: true,
  imports: [CommonModule, TradeSettingsComponent, SelectedOrderActionsComponent],
  templateUrl: './right-panel-margin-options.component.html',
})
export class RightPanelMarginOptionsComponent {
  readonly ob = inject(MarginOptionsOrderBookFacade);
  readonly orderSelection = inject(OrderbookSelectionService);
  readonly settings = inject(TradeSettingsService);
  readonly flow = inject(OrderFlowService);
  readonly copiedValue = signal<string | null>(null);

  readonly isMarketOrderView = computed(() => this.ob.store.activeView() === 'markets' || this.ob.store.activeView() === 'orders');
  readonly isOrdersView = computed(() => this.ob.store.activeView() === 'orders' || this.ob.store.activeView() === 'my-orders');
  readonly isPositionsView = computed(() => this.ob.store.activeView() === 'positions');
  readonly selectedMarket = this.ob.store.selectedMarket;
  readonly selectedPosition = this.ob.store.selectedPosition;

  readonly selected = computed(() => { const s = this.orderSelection.selected(); return s?.product === 'margin-options' ? s : null; });
  private readonly nowUnixSec = () => Math.floor(Date.now() / 1000);
  private readonly selectedOrderExpired = computed(() => { const row = this.selected(); const expiry = toNumber(row?.order?.expiry); return !!expiry && expiry <= this.nowUnixSec(); });
  readonly selectedFillSafety = computed(() => selectedOrderFillSafety({ selectedOrder: this.selected(), isMine: !!this.selected()?.isMine, fillAmount: this.fillAmount(), activeAccountId: this.settings.selectedAccountId(), orderExpired: this.selectedOrderExpired() }));
  readonly selectedCancelSafety = computed(() => selectedOrderCancelSafety({ selectedOrder: this.selected(), isMine: !!this.selected()?.isMine, activeAccountId: this.settings.selectedAccountId(), orderExpired: this.selectedOrderExpired() }));

  async copyValue(value: string | number | bigint | null | undefined, ev?: Event): Promise<void> { ev?.stopPropagation(); const text = value === null || value === undefined || value === '' ? '' : String(value); if (!text) return; try { await navigator.clipboard.writeText(text); this.copiedValue.set(text); window.setTimeout(() => { if (this.copiedValue() === text) this.copiedValue.set(null); }, 1400); } catch {} }
  openPlaceOrder(): void { this.flow.open(MarginOptionsOrderModalComponent, { intent: 'place', defaultMarketKey: this.ob.store.selectedMarketKey() ?? undefined }); }
  openFeeQuote(): void { this.flow.open(MarginOptionsOrderModalComponent, { intent: 'quote', defaultMarketKey: this.ob.store.selectedMarketKey() ?? undefined }); }

  fillAmount(): string { const row = this.selected(); return row ? this.ob.store.fillAmountByOrderId(BigInt(row.orderId)) : ''; }
  setFillAmount(v: string): void { const row = this.selected(); if (row) this.ob.store.setFillAmount(BigInt(row.orderId), v); }
  fillSelected(): void { const row = this.selected(); if (!row || this.selectedFillSafety().disabled) return; void this.ob.actions.requestFill(row.order, row.marketKey ?? this.ob.store.selectedMarketKey() ?? ''); }
  cancelSelected(): void { const row = this.selected(); if (!row || this.selectedCancelSafety().disabled) return; this.ob.actions.requestCancel(row.order); }
  clearSelected(): void { this.orderSelection.clear('margin-options'); }
  clearPosition(): void { this.ob.store.clearSelectedPosition(); }
  placeOrderForPosition(row: MarginPositionRow): void { this.flow.open(MarginOptionsOrderModalComponent, { intent: 'place', defaultMarketKey: row.marketKey }); }
  claimPosition(row: MarginPositionRow): void { if (!row.canClaim) return; this.ob.actions.requestClaim(row.marketKey, row.holderAvailable); }
  reclaimPosition(row: MarginPositionRow): void { if (!row.canReclaim) return; this.ob.actions.requestReclaim(row.marketKey, row.writerAvailable); }
}
