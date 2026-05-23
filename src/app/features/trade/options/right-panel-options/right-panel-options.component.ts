import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TradeSettingsComponent } from '../../../../components/trade-settings/trade-settings.component';
import { OrderFlowService } from '../../../../core/overlay/order-flow.service';
import { OptionsOrderModalComponent } from '../../../../core/overlay/order-modal/optionsorder-modal.component';
import { OptionsOrderBookFacade } from '../../../../services/shared/options-orderbook/options-orderbook.facade';
import { MyPositionRow } from '../../../../services/shared/options-orderbook/options-orderbook.store';
import { OrderbookSelectionService, SelectedOrderActionsComponent } from '../../../../shared/orderbook';
import { selectedOrderCancelSafety, selectedOrderFillSafety, toNumber } from '../../../../shared/safety';
import { TradeSettingsService } from '../../../../services/shared/trade-settings.service';

@Component({
  selector: 'app-right-panel-options',
  standalone: true,
  imports: [CommonModule, TradeSettingsComponent, SelectedOrderActionsComponent],
  templateUrl: './right-panel-options.component.html',
})
export class RightPanelOptionsComponent {
  readonly ob = inject(OptionsOrderBookFacade);
  readonly orderSelection = inject(OrderbookSelectionService);
  readonly settings = inject(TradeSettingsService);
  readonly flow = inject(OrderFlowService);
  readonly copiedValue = signal<string | null>(null);

  readonly isMarketOrderView = computed(() => this.ob.store.activeView() === 'orders');
  readonly isOrdersView = computed(() => this.ob.store.activeView() === 'orders' || this.ob.store.activeView() === 'my-orders');
  readonly isPositionsView = computed(() => this.ob.store.activeView() === 'positions');
  readonly selectedPosition = this.ob.store.selectedPosition;

  readonly selectedMarket = this.ob.store.selectedMarket;

  openPlaceOrder(): void {
    this.flow.open(OptionsOrderModalComponent, {
      intent: 'buy',
      defaultMarketKey: this.ob.store.selectedMarketKey() ?? undefined,
    });
  }

  openFeeQuote(): void {
    this.flow.open(OptionsOrderModalComponent, {
      intent: 'quote',
      defaultMarketKey: this.ob.store.selectedMarketKey() ?? undefined,
    });
  }


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

  selectedMarketLabel(): string {
    const row = this.selectedMarket();
    if (!row) return 'No market selected';
    const info = row.market ?? row.derived;
    if (!info) return row.marketKey;
    const type = Number(info.optionType ?? 0) === 0 ? 'CALL' : 'PUT';
    return `${type} ${this.ob.store.tokenLabel(info.assetToken)} / ${this.ob.store.tokenLabel(info.quoteToken)}`;
  }

  readonly selected = computed(() => {
    const s = this.orderSelection.selected();
    return s?.product === 'options' ? s : null;
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
    this.ob.actions.requestFill(row.order, row.marketKey ?? this.ob.store.selectedMarketKey() ?? '');
  }

  cancelSelected(): void {
    const row = this.selected();
    if (!row || this.selectedCancelSafety().disabled) return;
    this.ob.actions.requestCancel(row.order, row.marketKey ?? this.ob.store.selectedMarketKey() ?? '');
  }

  clearSelected(): void {
    this.orderSelection.clear('options');
  }

  clearPosition(): void {
    this.ob.store.clearSelectedPosition();
  }

  private positionInfo(row: MyPositionRow): NonNullable<MyPositionRow['market']> | NonNullable<MyPositionRow['derived']> | null {
    return row.market ?? row.derived ?? null;
  }

  positionMarketLabel(row: MyPositionRow): string {
    const info = this.positionInfo(row);
    if (!info) return row.marketKey;
    const optionType = Number(info.optionType ?? 0) === 0 ? 'CALL' : 'PUT';
    return `${optionType} ${this.ob.store.tokenLabel(info.assetToken)} / ${this.ob.store.tokenLabel(info.quoteToken)}`;
  }

  roleLabel(row: MyPositionRow): string {
    const roles: string[] = [];
    if ((row.holderAvail ?? 0n) > 0n) roles.push('Holder');
    if ((row.writerSize ?? 0n) > 0n) roles.push('Writer');
    return roles.join(' + ') || '—';
  }

  holderAvailableLabel(row: MyPositionRow): string {
    const info = this.positionInfo(row);
    return info ? this.ob.store.formatSize(row.holderAvail, info.assetToken) : row.holderAvail.toString();
  }

  writerSizeLabel(row: MyPositionRow): string {
    const info = this.positionInfo(row);
    return info ? this.ob.store.formatSize(row.writerSize, info.assetToken) : row.writerSize.toString();
  }

  placeOrderForPosition(row: MyPositionRow): void {
    const info = this.positionInfo(row);
    this.flow.open(OptionsOrderModalComponent, {
      intent: 'buy',
      defaultMarketKey: row.marketKey,
      defaultOptionType: info ? (Number(info.optionType ?? 0) as 0 | 1) : undefined,
      defaultAssetToken: info?.assetToken,
      defaultQuoteToken: info?.quoteToken,
      defaultStrikePrice: info?.strikePrice,
      defaultOptionExpiry: info ? (info as any).optionExpiry ?? (info as any).expiry : undefined,
    });
  }

  exercisePosition(row: MyPositionRow): void {
    if (!row.canExercise || row.holderAvail <= 0n) return;
    this.ob.actions.requestExercise(row.marketKey, row.holderAvail, { marketLabel: this.positionMarketLabel(row) });
  }

  reclaimPosition(row: MyPositionRow): void {
    if (!row.canReclaim) return;
    this.ob.actions.requestReclaimExpired(row.marketKey, { marketLabel: this.positionMarketLabel(row) });
  }
}
