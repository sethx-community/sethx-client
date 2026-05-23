import { Component, Input, OnInit, inject } from '@angular/core';
import { ethers } from 'ethers';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { OptionsOrderDraftService } from '../../../services/onchain/options-order-draft.service';
import { OrderReviewFlowComponent } from '../../../shared/order-flow';
import { ExpiryPickerComponent } from '../../../shared/expiry-picker/expiry-picker.component';
import { ETH_ADDRESS } from '../../../services/shared/main.tokens';

import { OptionsOrderModalData } from '../../../../types/order_flow/order-flow.types';
import { TransactionReceiptService } from '../../../shared/transaction-receipt';

@Component({
  selector: 'app-options-order-modal',
  standalone: true,
  imports: [CommonModule, OrderReviewFlowComponent, FormsModule, ExpiryPickerComponent],
  templateUrl: './optionsorder-modal.component.html',
})
export class OptionsOrderModalComponent implements OnInit {
  readonly vm = inject(OptionsOrderDraftService);
  readonly txReceipt = inject(TransactionReceiptService);

  @Input({ required: true }) data!: OptionsOrderModalData;
  @Input() onClose?: (result?: any) => void;

  isQuote = false;

  ngOnInit() {
    this.isQuote = this.data.intent === 'quote';
    this.vm.quoteOnly.set(this.isQuote);

    // set mode
    if (this.data.intent === 'accept') this.vm.mode.set('accept');
    else if (this.data.intent === 'cancel') this.vm.mode.set('cancel');
    else if (this.data.intent === 'exercise') this.vm.mode.set('exercise');
    else if (this.data.intent === 'reclaim') this.vm.mode.set('reclaim');
    else this.vm.mode.set('place');

    // default intent mapping for modal launches
    if (this.data.intent === 'buy') this.vm.intent.set(0);
    if (this.data.intent === 'selloption') this.vm.intent.set(1);
    if (this.data.intent === 'write') this.vm.intent.set(2);
    if (this.data.intent === 'sellwriter') this.vm.intent.set(3);

    // optional defaults
    if (this.data.defaultAssetToken)
      this.vm.assetInput.set(this.data.defaultAssetToken);
    // Options currently settle/pay premiums in ETH in this frontend.
    this.vm.onQuoteInput('ETH');

    if (this.data.defaultMarketKey)
      this.vm.marketKey.set(String(this.data.defaultMarketKey).toLowerCase());
    if (this.data.defaultOptionType !== undefined)
      this.vm.optionType.set(this.data.defaultOptionType);
    if (this.data.defaultStrikePrice !== undefined)
      this.vm.strikeHuman.set(ethers.formatUnits(this.data.defaultStrikePrice, 18));
    if (this.data.defaultOptionExpiry !== undefined)
      this.vm.optionExpiryUnix.set(String(this.data.defaultOptionExpiry));
    if (this.data.defaultSizeHuman)
      this.vm.sizeHuman.set(String(this.data.defaultSizeHuman));
  }

  close(result?: any) {
    this.vm.closeConfirm();
    this.onClose?.(result);
  }

  async submitAndClose() {
    await this.vm.submit();
  }
}
