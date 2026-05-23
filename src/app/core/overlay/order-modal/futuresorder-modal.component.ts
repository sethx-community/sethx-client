import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { FuturesOrderDraftService } from '../../../services/onchain/futures-order-draft.service';
import { FuturesOrderBookFacade } from '../../../services/shared/futures-orderbook/futures-orderbook.facade';
import { OrderReviewFlowComponent } from '../../../shared/order-flow';
import { ExpiryPickerComponent } from '../../../shared/expiry-picker/expiry-picker.component';
import { FuturesOrderModalData } from '../../../../types/order_flow/order-flow.types';
import { TransactionReceiptService } from '../../../shared/transaction-receipt';

@Component({
  selector: 'app-futures-order-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, OrderReviewFlowComponent, ExpiryPickerComponent],
  templateUrl: './futuresorder-modal.component.html',
})
export class FuturesOrderModalComponent implements OnInit {
  readonly vm = inject(FuturesOrderDraftService);
  readonly ob = inject(FuturesOrderBookFacade);
  readonly txReceipt = inject(TransactionReceiptService);

  @Input({ required: true }) data!: FuturesOrderModalData;
  @Input() onClose?: (result?: any) => void;

  isQuote = false;

  ngOnInit() {
    this.isQuote = this.data.intent === 'quote';

    this.vm.prefill({
      intent: this.data.intent,
      defaultMarketKey: this.data.defaultMarketKey,
      defaultPriceHuman: this.data.defaultPriceHuman,
      defaultAmountHuman: this.data.defaultAmountHuman,
    });
  }

  close(result?: any) {
    this.vm.closeConfirm();
    this.onClose?.(result);
  }

  modalTitle(): string {
    if (this.vm.mode() === 'cancel') return 'Cancel Futures Order';
    return this.isQuote ? 'Futures Fee Quote' : 'Place Futures Order';
  }

  marketOptions() {
    return this.ob.store.activeMarkets();
  }

  selectMarket(marketKey: string) {
    this.vm.marketKey.set(String(marketKey ?? '').toLowerCase());
  }

  setIntent(next: 'buy' | 'sell') {
    this.vm.side.set(next);
    if (!this.isQuote) this.vm.intent.set(next);
  }

  async submitAndClose() {
    await this.vm.openConfirmation();
  }

  async confirmAndClose() {
    await this.vm.submit();
  }
}
