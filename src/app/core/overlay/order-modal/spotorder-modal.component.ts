// src/app/actions/spot-order/spot-order-modal.component.ts
import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SpotOrderDraftService } from '../../../services/onchain/spot-order-draft.service';
import { OrderBookActionsService } from '../../../services/shared/orderbook/orderbook-actions.service';
import { OrderReviewFlowComponent } from '../../../shared/order-flow';
import { ExpiryPickerComponent } from '../../../shared/expiry-picker/expiry-picker.component';

import { SpotOrderModalData } from '../../../../types/order_flow/order-flow.types';
import { TransactionReceiptService } from '../../../shared/transaction-receipt';

@Component({
  selector: 'app-spot-order-modal',
  standalone: true,
  imports: [CommonModule, OrderReviewFlowComponent, FormsModule, ExpiryPickerComponent],
  templateUrl: './spotorder-modal.component.html',
})
export class SpotOrderModalComponent implements OnInit {
  readonly vm = inject(SpotOrderDraftService);
  readonly txReceipt = inject(TransactionReceiptService);
  readonly actions = inject(OrderBookActionsService);

  @Input({ required: true }) data!: SpotOrderModalData;
  @Input() onClose?: (result?: any) => void;

  // derived UI
  isQuote = false;
  isSideSelectable = false;

  ngOnInit() {
    this.isQuote = this.data.intent === 'quote';
    this.isSideSelectable = this.data.intent === 'quote' || this.data.intent === 'place';

    // set mode
    if (this.data.intent === 'accept') this.vm.mode.set('accept');
    else if (this.data.intent === 'cancel') this.vm.mode.set('cancel');
    else this.vm.mode.set('place'); // buy/sell/quote use place flow

    // Side is fixed for buy/sell intents; place/quote let the user choose.
    if (this.data.intent === 'buy') this.vm.side.set('buy');
    if (this.data.intent === 'sell') this.vm.side.set('sell');

    if (this.data.defaultBaseToken) {
      this.vm.onBaseSelected(this.data.defaultBaseToken);
    }
    if (this.data.defaultQuoteToken) {
      this.vm.onQuoteSelected(this.data.defaultQuoteToken);
    }
  }

  /** Close EVERYTHING (flow close semantics) */
  close(result?: any) {
    // close both modal states (draft + actions)
    this.vm.closeConfirm();
    this.actions.closeConfirmModal?.(); // if method exists

    // also clear possible pending confirm action state
    // (closeConfirmModal should do that; keeping here in case)
    this.onClose?.(result);
  }

  modalTitle(): string {
    if (this.isQuote) return 'Token Spot Fee Quote';
    if (this.vm.mode() === 'accept') return 'Accept Token Spot Order';
    if (this.vm.mode() === 'cancel') return 'Cancel Token Spot Order';
    return 'Place Token Spot Order';
  }

  primaryActionLabel(): string {
    if (this.isQuote) return this.vm.showConfirmModal() ? 'Refresh Fee Quote' : 'Get Fee Quote';
    if (this.vm.mode() === 'accept') return 'Review Accept';
    if (this.vm.mode() === 'cancel') return 'Review Cancel';
    return this.vm.showConfirmModal() ? 'Refresh Fee Quote' : 'Preview / Quote Fees';
  }

  sideLabel(): string {
    return this.vm.side() === 'buy' ? 'Bid / Buy' : 'Ask / Sell';
  }

  async submitAndClose() {
    await this.vm.submit();

    // Keep the modal open after submit so the shared receipt/explorer link is visible.
  }
}
