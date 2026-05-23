// right-panel-erc20-trade.component.ts
import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TradeSettingsComponent } from '../../../../components/trade-settings/trade-settings.component';
import { OrderBookFacade } from '../../../../services/shared/orderbook/orderbook.facade';
import { OrderbookSelectionService, SelectedOrderActionsComponent } from '../../../../shared/orderbook';
import { selectedOrderCancelSafety, selectedOrderFillSafety, toNumber } from '../../../../shared/safety';
import { TradeSettingsService } from '../../../../services/shared/trade-settings.service';

@Component({
  selector: 'app-right-panel-erc20-trade',
  standalone: true,
  imports: [CommonModule, TradeSettingsComponent, SelectedOrderActionsComponent],
  templateUrl: './right-panel-erc20-trade.component.html',
})
export class RightPanelErc20TradeComponent {
  readonly ob = inject(OrderBookFacade);
  readonly orderSelection = inject(OrderbookSelectionService);
  readonly settings = inject(TradeSettingsService);


  readonly selected = computed(() => {
    const s = this.orderSelection.selected();
    return s?.product === 'spot' ? s : null;
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
    return row ? this.ob.fillAmountByOrderId(BigInt(row.orderId)) : '';
  }

  setFillAmount(value: string): void {
    const row = this.selected();
    if (row) this.ob.setFillAmount(BigInt(row.orderId), value);
  }

  fillSelected(): void {
    const row = this.selected();
    if (!row || this.selectedFillSafety().disabled) return;
    this.ob.requestFill(row.order);
  }

  cancelSelected(): void {
    const row = this.selected();
    if (!row || this.selectedCancelSafety().disabled) return;
    this.ob.requestCancel(row.order);
  }

  clearSelected(): void {
    this.orderSelection.clear('spot');
  }
}
