import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TradeSettingsComponent } from '../../../../components/trade-settings/trade-settings.component';
import { OrderFlowService } from '../../../../core/overlay/order-flow.service';
import { BinaryOrderModalComponent } from '../../../../core/overlay/order-modal/binaryorder-modal.component';
import { BinaryOptionsOrderBookFacade } from '../../../../services/shared/binary-options-orderbook/binary-options-orderbook.facade';
import { BinaryPositionRow } from '../../../../services/shared/binary-options-orderbook/binary-options-orderbook.store';
import { OrderbookSelectionService, SelectedOrderActionsComponent } from '../../../../shared/orderbook';
import { selectedOrderCancelSafety, selectedOrderFillSafety, toNumber } from '../../../../shared/safety';
import { TradeSettingsService } from '../../../../services/shared/trade-settings.service';

@Component({
  selector: 'app-right-panel-binary-options',
  standalone: true,
  imports: [CommonModule, TradeSettingsComponent, SelectedOrderActionsComponent],
  templateUrl: './right-panel-binary-options.component.html',
})
export class RightPanelBinaryOptionsComponent {
  readonly ob = inject(BinaryOptionsOrderBookFacade);
  readonly orderSelection = inject(OrderbookSelectionService);
  readonly settings = inject(TradeSettingsService);
  readonly flow = inject(OrderFlowService);
  readonly copiedValue = signal<string | null>(null);

  readonly isMarketOrderView = computed(() => this.ob.store.activeView() === 'orders');
  readonly isOrdersView = computed(() => this.ob.store.activeView() === 'orders' || this.ob.store.activeView() === 'my-orders');
  readonly isPositionsView = computed(() => this.ob.store.activeView() === 'positions');
  readonly selectedPosition = this.ob.store.selectedPosition;
  readonly selectedMarket = this.ob.store.selectedMarket;

  readonly selected = computed(() => {
    const s = this.orderSelection.selected();
    return s?.product === 'binary-options' ? s : null;
  });

  private readonly nowUnixSec = () => Math.floor(Date.now() / 1000);
  private readonly selectedOrderExpired = computed(() => {
    const row = this.selected();
    const expiry = toNumber(row?.order?.expiry);
    return !!expiry && expiry <= this.nowUnixSec();
  });

  readonly selectedFillSafety = computed(() => selectedOrderFillSafety({ selectedOrder: this.selected(), isMine: !!this.selected()?.isMine, fillAmount: this.fillAmount(), activeAccountId: this.settings.selectedAccountId(), orderExpired: this.selectedOrderExpired() }));
  readonly selectedCancelSafety = computed(() => selectedOrderCancelSafety({ selectedOrder: this.selected(), isMine: !!this.selected()?.isMine, activeAccountId: this.settings.selectedAccountId(), orderExpired: this.selectedOrderExpired() }));

  async copyValue(value: string | number | bigint | null | undefined, ev?: Event): Promise<void> { ev?.stopPropagation(); const text = value === null || value === undefined || value === '' ? '' : String(value); if (!text) return; try { await navigator.clipboard.writeText(text); this.copiedValue.set(text); window.setTimeout(() => { if (this.copiedValue() === text) this.copiedValue.set(null); }, 1400); } catch {} }
  selectedMarketLabel(): string { const row = this.selectedMarket(); if (!row) return 'No market selected'; const m = row.market; return this.ob.store.condition(m.optionType, this.ob.store.tokenLabel(m.baseToken), m.strikePrice); }
  openPlaceOrder(): void { this.flow.open(BinaryOrderModalComponent, { intent: 'place', defaultMarketKey: this.ob.store.selectedMarketKey() ?? undefined }); }
  openFeeQuote(): void { this.flow.open(BinaryOrderModalComponent, { intent: 'quote', defaultMarketKey: this.ob.store.selectedMarketKey() ?? undefined }); }

  fillAmount(): string { const row = this.selected(); return row ? this.ob.store.fillAmountByOrderId(BigInt(row.orderId)) : ''; }
  setFillAmount(value: string): void { const row = this.selected(); if (row) this.ob.store.setFillAmount(BigInt(row.orderId), value); }
  fillSelected(): void { const row = this.selected(); if (!row || this.selectedFillSafety().disabled) return; this.ob.actions.requestFill(row.order, row.marketKey ?? this.ob.store.selectedMarketKey() ?? ''); }
  cancelSelected(): void { const row = this.selected(); if (!row || this.selectedCancelSafety().disabled) return; this.ob.actions.requestCancel(row.order); }
  clearSelected(): void { this.orderSelection.clear('binary-options'); }
  clearPosition(): void { this.ob.store.clearSelectedPosition(); }

  positionMarketLabel(row: BinaryPositionRow): string { const m = row.market; return this.ob.store.condition(m.optionType, this.ob.store.tokenLabel(m.baseToken), m.strikePrice); }
  placeOrderForPosition(row: BinaryPositionRow): void { this.flow.open(BinaryOrderModalComponent, { intent: 'place', defaultMarketKey: row.marketKey }); }
  claimPosition(row: BinaryPositionRow): void { if (!row.canClaim) return; this.ob.actions.requestClaim(row.marketKey, row.holderClaimable, row.claimLabel); }
  reclaimPosition(row: BinaryPositionRow): void { if (!row.canReclaim) return; this.ob.actions.requestReclaim(row.marketKey, row.writerMargin); }
}
