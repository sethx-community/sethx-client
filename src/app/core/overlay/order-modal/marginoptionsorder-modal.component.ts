import { Component, Input, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { OrderReviewFlowComponent } from '../../../shared/order-flow';
import { MarginOptionsOrderBookFacade } from '../../../services/shared/margin-options-orderbook/margin-options-orderbook.facade';
import { MarginOptionsOrderBookActionsService } from '../../../services/shared/margin-options-orderbook/margin-options-orderbook-actions.service';
import { MarginOptionsOrderBookStore } from '../../../services/shared/margin-options-orderbook/margin-options-orderbook.store';
import { MarginOptionsOrderModalData } from '../../../../types/order_flow/order-flow.types';

@Component({
  selector: 'app-margin-options-order-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, OrderReviewFlowComponent],
  templateUrl: './marginoptionsorder-modal.component.html',
  styleUrl: './marginoptionsorder-modal.component.scss',
})
export class MarginOptionsOrderModalComponent implements OnInit {
  readonly ob = inject(MarginOptionsOrderBookFacade);
  readonly actions = inject(MarginOptionsOrderBookActionsService);
  readonly store = inject(MarginOptionsOrderBookStore);

  @Input({ required: true }) data!: MarginOptionsOrderModalData;
  @Input() onClose?: (result?: any) => void;

  readonly intent = signal<'0' | '1' | '2' | '3'>('0');
  readonly sizeHuman = signal('1');
  readonly priceHuman = signal('0.5');
  readonly expiryPreset = signal<'default' | '1h' | '1d' | '7d' | 'max' | 'custom'>('default');
  readonly customExpiryUnix = signal('');
  readonly selectedMarket = computed(() => this.store.selectedMarket());
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    if (this.data.defaultMarketKey) this.store.selectMarket(this.data.defaultMarketKey);
    if (this.data.defaultIntent !== undefined) this.intent.set(String(this.data.defaultIntent) as '0' | '1' | '2' | '3');
    if (this.data.defaultSizeHuman) this.sizeHuman.set(this.data.defaultSizeHuman);
    if (this.data.defaultPriceHuman) this.priceHuman.set(this.data.defaultPriceHuman);
  }

  title(): string {
    return this.data.intent === 'quote' ? 'Margin Option Fee Quote' : 'Place Margin Option Order';
  }

  subtitle(): string {
    return 'Create or preview margin option orders using the shared account, fee-token, and confirmation flow.';
  }

  marketSummary(): string {
    const row = this.selectedMarket();
    return row ? this.store.marketTitle(row.market) : 'Select a margin option market first';
  }

  setIntent(value: unknown): void {
    const n = Number(value);
    if (n === 0 || n === 1 || n === 2 || n === 3) this.intent.set(String(n) as '0' | '1' | '2' | '3');
  }

  setExpiryPreset(value: unknown): void {
    const v = String(value) as 'default' | '1h' | '1d' | '7d' | 'max' | 'custom';
    if (['default', '1h', '1d', '7d', 'max', 'custom'].includes(v)) this.expiryPreset.set(v);
  }

  close(result?: any): void {
    this.actions.closeConfirmModal();
    this.onClose?.(result);
  }

  preview(): void {
    this.error.set(null);
    try {
      void this.actions.requestPlace({
        marketKey: this.store.selectedMarketKey(),
        intent: Number(this.intent()),
        sizeHuman: this.sizeHuman(),
        priceHuman: this.priceHuman(),
        expiryPreset: this.expiryPreset(),
        customExpiryUnix: this.customExpiryUnix() ? BigInt(this.customExpiryUnix()) : null,
        quoteOnly: this.data.intent === 'quote',
      }).catch((e: any) => this.error.set(e?.message ?? 'Unable to build margin option preview'));
    } catch (e: any) {
      this.error.set(e?.message ?? 'Unable to build margin option preview');
    }
  }
}
