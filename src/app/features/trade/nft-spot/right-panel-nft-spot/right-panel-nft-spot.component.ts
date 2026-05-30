import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';

import { TradeSettingsComponent } from '../../../../components/trade-settings/trade-settings.component';
import { OrderFlowService } from '../../../../core/overlay/order-flow.service';
import { OrderbookSelectionService, SelectedOrderActionsComponent } from '../../../../shared/orderbook';
import { selectedOrderCancelSafety, selectedOrderFillSafety } from '../../../../shared/safety';
import { NftSpotOrder } from '../../../../services/shared/nft-spot-orderbook/nft-spot-orderbook.store';
import { NftSpotOrderModalComponent } from '../../../../core/overlay/order-modal/nftspotorder-modal.component';
import { TradeSettingsService } from '../../../../services/shared/trade-settings.service';

@Component({
  selector: 'app-right-panel-nft-spot',
  standalone: true,
  imports: [CommonModule, TradeSettingsComponent, SelectedOrderActionsComponent],
  templateUrl: './right-panel-nft-spot.component.html',
})
export class RightPanelNftSpotComponent {
  readonly orderSelection = inject(OrderbookSelectionService);
  private readonly settings = inject(TradeSettingsService);
  private readonly flow = inject(OrderFlowService);

  readonly selected = computed(() => {
    const selected = this.orderSelection.selected();
    return selected?.product === 'nft-spot' ? selected : null;
  });

  readonly selectedAcceptSafety = computed(() => {
    const selected = this.selected();
    const base = selectedOrderFillSafety({
      selectedOrder: selected,
      isMine: !!selected?.isMine,
      fillAmount: '1',
      activeAccountId: this.settings.selectedAccountId(),
    });
    const order = selected?.order as NftSpotOrder | undefined;
    if (base.disabled || !order?.acceptDisabledReason) return base;
    return { disabled: true, reason: order.acceptDisabledReason };
  });

  readonly selectedCancelSafety = computed(() =>
    selectedOrderCancelSafety({
      selectedOrder: this.selected(),
      isMine: !!this.selected()?.isMine,
      activeAccountId: this.settings.selectedAccountId(),
    }),
  );


  readonly ctx = computed(() => ({
    activeAccount: this.settings.selectedAccountId(),
    selectedOrder: (this.selected()?.order as NftSpotOrder | undefined) ?? null,
  }));

  readonly acceptButtonLabel = computed(() => {
    const order = this.selected()?.order as NftSpotOrder | undefined;
    if (order?.side === 'ask') return 'Buy NFT';
    if (order?.side === 'bid') return 'Sell NFT';
    return 'Accept Order';
  });

  acceptSelected(): void {
    const order = this.selected()?.order as NftSpotOrder | undefined;
    if (!order || this.selectedAcceptSafety().disabled || order.acceptDisabledReason) return;
    this.flow.open(NftSpotOrderModalComponent, { intent: 'accept', order });
  }

  cancelSelected(): void {
    const order = this.selected()?.order as NftSpotOrder | undefined;
    if (!order || this.selectedCancelSafety().disabled) return;
    this.flow.open(NftSpotOrderModalComponent, { intent: 'cancel', order });
  }

  openPlaceOrder(): void {
    const order = this.selected()?.order as NftSpotOrder | undefined;
    this.flow.open(NftSpotOrderModalComponent, {
      intent: 'place',
      defaultNft: order?.raw.nft,
      defaultTokenId: order?.raw.tokenId,
      defaultQuoteToken: order?.raw.quoteToken,
      defaultMarketKey: this.selected()?.marketKey,
    });
  }

  openFeeQuote(): void {
    const order = this.selected()?.order as NftSpotOrder | undefined;
    this.flow.open(NftSpotOrderModalComponent, {
      intent: 'quote',
      defaultNft: order?.raw.nft,
      defaultTokenId: order?.raw.tokenId,
      defaultQuoteToken: order?.raw.quoteToken,
      defaultMarketKey: this.selected()?.marketKey,
    });
  }

  clearSelected(): void {
    this.orderSelection.clear('nft-spot');
  }
}
