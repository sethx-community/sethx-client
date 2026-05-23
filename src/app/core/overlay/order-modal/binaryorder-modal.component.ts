import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { OrderReviewFlowComponent } from '../../../shared/order-flow';
import { BinaryOptionsOrderBookFacade } from '../../../services/shared/binary-options-orderbook/binary-options-orderbook.facade';
import { BinaryOptionsOrderBookActionsService } from '../../../services/shared/binary-options-orderbook/binary-options-orderbook-actions.service';
import { BinaryOptionsOrderBookStore } from '../../../services/shared/binary-options-orderbook/binary-options-orderbook.store';
import { BinaryOptionsOrderModalData } from '../../../../types/order_flow/order-flow.types';

@Component({
  selector: 'app-binary-order-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, OrderReviewFlowComponent],
  templateUrl: './binaryorder-modal.component.html',
  styleUrl: './binaryorder-modal.component.scss',
})
export class BinaryOrderModalComponent implements OnInit {
  readonly ob = inject(BinaryOptionsOrderBookFacade);
  readonly actions = inject(BinaryOptionsOrderBookActionsService);
  readonly store = inject(BinaryOptionsOrderBookStore);

  @Input({ required: true }) data!: BinaryOptionsOrderModalData;
  @Input() onClose?: (result?: any) => void;

  readonly intent = signal<'0' | '1' | '2'>('0');
  readonly marketKey = signal('');
  readonly payoutHuman = signal('1');
  readonly priceHuman = signal('0.5');
  readonly expiryPreset = signal<'default' | '1h' | '1d' | '7d' | 'max' | 'custom'>('default');
  readonly customExpiryLocal = signal('');
  readonly orderId = signal('');
  readonly fillPayoutHuman = signal('');
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    const intent = this.data.intent ?? 'place';
    if (this.data.defaultMarketKey) {
      const key = String(this.data.defaultMarketKey);
      this.marketKey.set(key);
      this.store.selectMarket(key);
    } else if (this.store.selectedMarketKey()) {
      this.marketKey.set(this.store.selectedMarketKey()!);
    }

    if (this.data.defaultIntent !== undefined) {
      this.intent.set(String(this.data.defaultIntent) as '0' | '1' | '2');
    }
    if (this.data.defaultPayoutHuman) this.payoutHuman.set(this.data.defaultPayoutHuman);
    if (this.data.defaultPriceHuman) this.priceHuman.set(this.data.defaultPriceHuman);

    if ((intent === 'place' || intent === 'quote') && this.data.defaultIntent === undefined) this.intent.set('0');
  }

  title(): string {
    switch (this.data.intent) {
      case 'quote': return 'Binary Option Fee Quote';
      case 'accept': return 'Accept Binary Option Order';
      case 'cancel': return 'Cancel Binary Option Order';
      case 'claim': return 'Claim Binary Payout';
      case 'reclaim': return 'Reclaim Binary Writer Margin';
      default: return 'Place Binary Option Order';
    }
  }

  subtitle(): string {
    switch (this.data.intent) {
      case 'quote': return 'Preview locked amount and fees for a binary option order.';
      case 'accept': return 'Fill an existing binary option order by order ID.';
      case 'cancel': return 'Cancel one of your resting binary orders.';
      case 'claim': return 'Claim or clear a holder position after oracle settlement.';
      case 'reclaim': return 'Reclaim writer margin after holder positions are claimed or cleared.';
      default: return 'Create an ETH-settled Above / Below binary option order.';
    }
  }

  marketSummary(): string {
    const key = this.marketKey() || this.store.selectedMarketKey() || '';
    const row = this.store.activeMarkets().find((m) => m.marketKey.toLowerCase() === key.toLowerCase());
    if (!row) return 'No market selected';
    const condition = this.store.condition(row.market.optionType, this.store.tokenLabel(row.market.baseToken), row.market.strikePrice);
    const expiry = new Date(Number(row.market.expiry) * 1000).toISOString().slice(0, 16).replace('T', ' ');
    return `${condition} · Expiry ${expiry} UTC`;
  }

  setIntent(value: string): void {
    if (value === '0' || value === '1' || value === '2') this.intent.set(value);
  }

  setExpiryPreset(value: string): void {
    if (value === 'default' || value === '1h' || value === '1d' || value === '7d' || value === 'max' || value === 'custom') this.expiryPreset.set(value);
  }


  marketExpiry(): bigint {
    const key = this.marketKey() || this.store.selectedMarketKey() || '';
    return this.store.activeMarkets().find((m) => m.marketKey.toLowerCase() === key.toLowerCase())?.market.expiry ?? 0n;
  }

  maxOrderExpiryLabel(): string {
    const expiry = this.marketExpiry();
    return expiry > 0n ? this.formatExpiry(expiry) : 'No market expiry available';
  }

  customExpiryUnix(): bigint | null {
    const raw = this.customExpiryLocal().trim();
    if (!raw) return null;
    const ms = Date.parse(raw);
    return Number.isFinite(ms) ? BigInt(Math.floor(ms / 1000)) : null;
  }

  formatExpiry(x: bigint | number | string | null | undefined): string {
    try {
      const s = typeof x === 'bigint' ? Number(x) : Number(x ?? 0);
      if (!s || !Number.isFinite(s)) return '—';
      const d = new Date(s * 1000);
      return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')} ${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')} UTC`;
    } catch { return '—'; }
  }

  async previewPlace(quoteOnly = false): Promise<void> {
    this.error.set(null);
    const marketKey = this.marketKey();
    if (!marketKey) {
      this.error.set('Choose a binary market in the market view first, then open this action.');
      return;
    }
    this.store.selectMarket(marketKey);
    try {
      await this.actions.requestPlace({
        marketKey,
        intent: Number(this.intent()),
        payoutHuman: this.payoutHuman(),
        priceHuman: this.priceHuman(),
        expiryPreset: this.expiryPreset(),
        customExpiryUnix: this.customExpiryUnix(),
        quoteOnly,
      });
    } catch (e: any) {
      this.error.set(e?.reason ?? e?.message ?? 'Could not build binary order preview');
    }
  }

  async previewAccept(): Promise<void> {
    this.error.set(null);
    const id = BigInt(String(this.orderId() || '0'));
    if (id <= 0n) {
      this.error.set('Enter a valid order ID.');
      return;
    }
    const marketKey = this.marketKey();
    const order = [...this.store.bids(), ...this.store.asks()].find((row) => row.orderId === id)?.order;
    if (!order) {
      this.error.set('Open the market that contains this order first, then try again.');
      return;
    }
    if (this.fillPayoutHuman().trim()) this.store.setFillAmount(id, this.fillPayoutHuman());
    try {
      await this.actions.requestFill(order, marketKey || order.marketKey);
    } catch (e: any) {
      this.error.set(e?.reason ?? e?.message ?? 'Could not build accept preview');
    }
  }

  async previewCancel(): Promise<void> {
    this.error.set(null);
    const id = BigInt(String(this.orderId() || '0'));
    if (id <= 0n) {
      this.error.set('Enter a valid order ID.');
      return;
    }
    const order = [...this.store.bids(), ...this.store.asks()].find((row) => row.orderId === id)?.order;
    if (!order) {
      this.error.set('Open the market that contains this order first, then try again.');
      return;
    }
    try {
      this.actions.requestCancel(order);
    } catch (e: any) {
      this.error.set(e?.reason ?? e?.message ?? 'Could not build cancel preview');
    }
  }

  async previewClaim(): Promise<void> {
    this.error.set(null);
    const key = this.marketKey();
    const row = this.store.myPositions().find((p) => p.marketKey === key);
    if (!row) {
      this.error.set('Select a market where you hold a binary position.');
      return;
    }
    if (!row.canClaim) {
      this.error.set(row.claimHint || 'Holder claim is not available yet.');
      return;
    }
    this.actions.requestClaim(row.marketKey, row.holderClaimable, row.claimLabel);
  }

  async previewReclaim(): Promise<void> {
    this.error.set(null);
    const key = this.marketKey();
    const row = this.store.myPositions().find((p) => p.marketKey === key);
    if (!row) {
      this.error.set('Select a market where you hold writer margin.');
      return;
    }
    if (!row.canReclaim) {
      this.error.set(row.reclaimHint || 'Writer reclaim is not available yet.');
      return;
    }
    this.actions.requestReclaim(row.marketKey, row.writerMargin);
  }

  preview(): Promise<void> {
    switch (this.data.intent) {
      case 'quote': return this.previewPlace(true);
      case 'accept': return this.previewAccept();
      case 'cancel': return this.previewCancel();
      case 'claim': return this.previewClaim();
      case 'reclaim': return this.previewReclaim();
      default: return this.previewPlace();
    }
  }

  close(result?: any): void {
    this.actions.closeConfirmModal();
    this.onClose?.(result);
  }
}
