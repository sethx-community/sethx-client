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
  readonly newMarketMode = signal(false);
  readonly newOracle = signal('');
  readonly newOptionType = signal<'0' | '1'>('0');
  readonly newStrikeHuman = signal('0.00025');
  readonly payoutHuman = signal('1');
  readonly priceHuman = signal('0.5');
  readonly expiryPreset = signal<'default' | '1h' | '1d' | '7d' | 'max' | 'custom'>('default');
  readonly customExpiryYear = signal('');
  readonly customExpiryMonth = signal('');
  readonly customExpiryWeekUnix = signal('');
  readonly orderId = signal('');
  readonly fillPayoutHuman = signal('');
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    const intent = this.data.intent ?? 'place';
    if (this.data.defaultMarketKey) {
      const key = String(this.data.defaultMarketKey);
      this.marketKey.set(key);
      this.store.selectMarket(key);
      this.newMarketMode.set(false);
    } else if (this.store.selectedMarketKey()) {
      this.marketKey.set(this.store.selectedMarketKey()!);
      this.newMarketMode.set(false);
    } else {
      this.newMarketMode.set(true);
    }

    if (this.data.defaultIntent !== undefined) {
      this.intent.set(String(this.data.defaultIntent) as '0' | '1' | '2');
    }
    if (this.data.defaultPayoutHuman) this.payoutHuman.set(this.data.defaultPayoutHuman);
    if (this.data.defaultPriceHuman) this.priceHuman.set(this.data.defaultPriceHuman);

    if ((intent === 'place' || intent === 'quote') && this.data.defaultIntent === undefined) this.intent.set('0');
    this.syncCustomExpiryFromMarket();
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
    if (this.newMarketMode()) return `${this.newTicker()} · new market`;
    const key = this.marketKey() || this.store.selectedMarketKey() || '';
    const row = this.store.activeMarkets().find((m) => m.marketKey.toLowerCase() === key.toLowerCase());
    if (!row) return 'No market selected';
    const condition = this.store.condition(row.market.optionType, this.store.tokenLabel(row.market.baseToken), row.market.strikePrice);
    const expiry = new Date(Number(row.market.expiry) * 1000).toISOString().slice(0, 16).replace('T', ' ');
    return `${condition} · Expiry ${expiry} UTC`;
  }

  newTicker(): string {
    const pair = this.newOracle() ? 'ORACLE' : 'CUSTOM';
    return `${pair}-${this.newOptionType() === '0' ? 'ABOVE' : 'BELOW'}-${this.customExpiryUnix() ?? 0n}-${this.newStrikeHuman()}`;
  }

  setNewMarketMode(value: unknown): void {
    this.newMarketMode.set(value === true || value === 'true');
  }

  setNewOptionType(value: unknown): void {
    const v = String(value);
    if (v === '0' || v === '1') this.newOptionType.set(v);
  }

  marketOptions() {
    return this.store.activeMarkets();
  }

  selectMarket(value: unknown): void {
    const key = String(value ?? '').trim().toLowerCase();
    this.marketKey.set(key);
    if (key) this.store.selectMarket(key);
    this.syncCustomExpiryFromMarket();
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


  expiryYears(): string[] {
    const now = new Date();
    const currentYear = now.getUTCFullYear();
    const years: string[] = [];
    for (let i = 0; i <= 30; i += 1) years.push(String(currentYear + i));
    const selected = this.customExpiryYear();
    if (selected && !years.includes(selected)) years.push(selected);
    return years.sort();
  }

  expiryMonths(): Array<{ value: string; label: string }> {
    const year = Number(this.customExpiryYear() || new Date().getUTCFullYear());
    const now = BigInt(Math.floor(Date.now() / 1000));
    const out: Array<{ value: string; label: string }> = [];
    for (let month = 1; month <= 12; month += 1) {
      if (this.fridaysNoonUtcInMonth(year, month).some((expiry) => expiry > now)) {
        out.push({ value: String(month), label: this.monthName(month) });
      }
    }
    return out;
  }

  expiryWeeks(): Array<{ value: string; label: string }> {
    const year = Number(this.customExpiryYear());
    const month = Number(this.customExpiryMonth());
    const now = BigInt(Math.floor(Date.now() / 1000));
    if (!Number.isFinite(year) || !Number.isFinite(month) || year <= 0 || month <= 0) return [];
    return this.fridaysNoonUtcInMonth(year, month)
      .filter((expiry) => expiry > now)
      .map((expiry, index) => ({ value: expiry.toString(), label: `Friday ${index + 1} · ${this.formatExpiry(expiry)}` }));
  }

  setCustomExpiryYear(value: string | number): void {
    this.customExpiryYear.set(String(value ?? ''));
    const months = this.expiryMonths();
    if (!months.some((row) => row.value === this.customExpiryMonth())) {
      this.customExpiryMonth.set(months[0]?.value ?? '');
    }
    this.selectFirstCustomFriday();
  }

  setCustomExpiryMonth(value: string | number): void {
    this.customExpiryMonth.set(String(value ?? ''));
    this.selectFirstCustomFriday();
  }

  setCustomExpiryWeek(value: string | number): void {
    this.customExpiryWeekUnix.set(String(value ?? ''));
  }

  customExpiryUnix(): bigint | null {
    const selected = String(this.customExpiryWeekUnix() ?? '').trim();
    if (/^\d+$/.test(selected)) return BigInt(selected);
    return null;
  }

  customExpiryLabel(): string {
    const expiry = this.customExpiryUnix();
    return expiry ? this.formatExpiry(expiry) : '—';
  }

  private syncCustomExpiryFromMarket(): void {
    const expiry = this.marketExpiry();
    if (expiry > 0n) {
      const d = new Date(Number(expiry) * 1000);
      this.customExpiryYear.set(String(d.getUTCFullYear()));
      this.customExpiryMonth.set(String(d.getUTCMonth() + 1));
      this.customExpiryWeekUnix.set(expiry.toString());
      return;
    }
    const now = new Date();
    this.customExpiryYear.set(String(now.getUTCFullYear()));
    this.customExpiryMonth.set(String(now.getUTCMonth() + 1));
    const months = this.expiryMonths();
    if (!months.some((row) => row.value === this.customExpiryMonth())) this.customExpiryMonth.set(months[0]?.value ?? '');
    this.selectFirstCustomFriday();
  }

  private selectFirstCustomFriday(): void {
    const weeks = this.expiryWeeks();
    if (!weeks.some((row) => row.value === this.customExpiryWeekUnix())) {
      this.customExpiryWeekUnix.set(weeks[0]?.value ?? '');
    }
  }

  private fridaysNoonUtcInMonth(year: number, monthOneBased: number): bigint[] {
    const out: bigint[] = [];
    const d = new Date(Date.UTC(year, monthOneBased - 1, 1, 12, 0, 0, 0));
    const daysUntilFriday = (5 - d.getUTCDay() + 7) % 7;
    d.setUTCDate(1 + daysUntilFriday);
    while (d.getUTCFullYear() === year && d.getUTCMonth() === monthOneBased - 1) {
      out.push(BigInt(Math.floor(d.getTime() / 1000)));
      d.setUTCDate(d.getUTCDate() + 7);
    }
    return out;
  }

  private monthName(monthOneBased: number): string {
    return new Date(Date.UTC(2026, monthOneBased - 1, 1, 12, 0, 0, 0)).toLocaleString('en-US', { month: 'long', timeZone: 'UTC' });
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
    const marketKey = this.newMarketMode() ? '' : this.marketKey();
    if (!marketKey && !this.newMarketMode()) {
      this.error.set('Choose an existing binary market or enter new market parameters.');
      return;
    }
    if (marketKey) this.store.selectMarket(marketKey);
    try {
      await this.actions.requestPlace({
        marketKey,
        intent: Number(this.intent()),
        payoutHuman: this.payoutHuman(),
        priceHuman: this.priceHuman(),
        expiryPreset: this.expiryPreset(),
        customExpiryUnix: this.customExpiryUnix(),
        quoteOnly,
        newMarket: this.newMarketMode() && this.customExpiryUnix() ? {
          ticker: this.newTicker(),
          optionType: Number(this.newOptionType()),
          oracle: this.newOracle(),
          strikePriceHuman: this.newStrikeHuman(),
          marketExpiry: this.customExpiryUnix()!,
        } : null,
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

  handleReviewClose(): void {
    if (this.actions.receipt()?.status === 'success') {
      this.close({ success: true });
      return;
    }
    this.actions.closeConfirmModal();
  }
}
