import { Component, Input, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { OrderReviewFlowComponent } from '../../../shared/order-flow';
import { ExpiryPickerComponent } from '../../../shared/expiry-picker/expiry-picker.component';
import { EXPIRY_PRESET_SECONDS, parseExpirySelection } from '../../../shared/expiry/expiry-settings';
import { MarginOptionsOrderBookFacade } from '../../../services/shared/margin-options-orderbook/margin-options-orderbook.facade';
import { MarginOptionsOrderBookActionsService } from '../../../services/shared/margin-options-orderbook/margin-options-orderbook-actions.service';
import { MarginOptionsOrderBookStore } from '../../../services/shared/margin-options-orderbook/margin-options-orderbook.store';
import { ProtocolDataService } from '../../../services/shared/data/protocol-data.service';
import { MarginOptionsOrderModalData } from '../../../../types/order_flow/order-flow.types';

@Component({
  selector: 'app-margin-options-order-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, OrderReviewFlowComponent, ExpiryPickerComponent],
  templateUrl: './marginoptionsorder-modal.component.html',
  styleUrl: './marginoptionsorder-modal.component.scss',
})
export class MarginOptionsOrderModalComponent implements OnInit {
  readonly ob = inject(MarginOptionsOrderBookFacade);
  readonly actions = inject(MarginOptionsOrderBookActionsService);
  readonly store = inject(MarginOptionsOrderBookStore);
  readonly protocol = inject(ProtocolDataService);

  @Input({ required: true }) data!: MarginOptionsOrderModalData;
  @Input() onClose?: (result?: any) => void;

  readonly intent = signal<'0' | '1' | '2' | '3'>('0');
  readonly sizeHuman = signal('1');
  readonly priceHuman = signal('0.5');
  readonly expiryPreset = signal<'default' | '1h' | '1d' | '7d' | 'max' | 'custom'>('default');
  readonly orderExpiryUnix = signal('0');
  readonly marketExpiryMode = signal<'preset' | 'custom'>('preset');
  readonly customExpiryYear = signal('');
  readonly customExpiryMonth = signal('');
  readonly customExpiryWeekUnix = signal('');
  readonly selectedMarketKey = signal('');
  readonly newMarketMode = signal(false);
  readonly newOracle = signal('');
  readonly newOptionType = signal<'0' | '1'>('0');
  readonly newStrikeHuman = signal('0.00025');
  readonly newCollateralPercent = signal('100');
  readonly selectedMarket = computed(() => {
    const key = this.selectedMarketKey() || this.store.selectedMarketKey() || '';
    return this.store.activeMarkets().find((m) => m.marketKey.toLowerCase() === key.toLowerCase()) ?? this.store.selectedMarket();
  });
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    if (this.data.defaultMarketKey) {
      this.selectedMarketKey.set(String(this.data.defaultMarketKey).toLowerCase());
      this.store.selectMarket(this.data.defaultMarketKey);
      this.newMarketMode.set(false);
    } else if (this.store.selectedMarketKey()) {
      this.selectedMarketKey.set(this.store.selectedMarketKey()!);
      this.newMarketMode.set(false);
    } else {
      this.newMarketMode.set(true);
    }
    if (this.data.defaultIntent !== undefined) this.intent.set(String(this.data.defaultIntent) as '0' | '1' | '2' | '3');
    if (this.data.defaultSizeHuman) this.sizeHuman.set(this.data.defaultSizeHuman);
    if (this.data.defaultPriceHuman) this.priceHuman.set(this.data.defaultPriceHuman);
    this.syncCustomExpiryFromMarket();
    void this.protocol.refreshOracleInfo().catch(() => undefined);
  }

  title(): string {
    return this.data.intent === 'quote' ? 'Margin Option Fee Quote' : 'Place Margin Option Order';
  }

  subtitle(): string {
    return this.newMarketMode()
      ? 'Choose the oracle, strike, expiry, and collateral coverage for the new market.'
      : 'Select a market and enter the order details.';
  }

  marketSummary(): string {
    if (this.newMarketMode()) return `${this.newTicker()} · new market`;
    const row = this.selectedMarket();
    return row ? this.store.marketTitle(row.market) : 'Select an existing market or enter new market parameters';
  }

  newTicker(): string {
    const pair = this.oraclePairLabel(this.newOracle());
    const side = this.newOptionType() === '0' ? 'CALL' : 'PUT';
    const expiry = this.formatTickerDate(this.customExpiryUnix());
    const strike = String(this.newStrikeHuman() || '').trim() || '0';
    return `${pair} ${side} ${expiry} @ ${strike}`;
  }

  private oraclePairLabel(oracle: string): string {
    const key = String(oracle ?? '').trim().toLowerCase();
    if (!key) return 'Custom market';
    const row = this.protocol.liveOverview().oracleInfo.find((item) => item.oracle.toLowerCase() === key);
    const pair = String(row?.pair || row?.label || '').trim();
    if (pair) return pair;
    return `${key.slice(0, 6)}…${key.slice(-4)}`;
  }

  private formatTickerDate(value: bigint | null | undefined): string {
    const seconds = typeof value === 'bigint' ? Number(value) : Number(value ?? 0);
    if (!seconds || !Number.isFinite(seconds)) return 'No expiry';
    const d = new Date(seconds * 1000);
    const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getUTCMonth()] ?? '';
    return `${String(d.getUTCDate()).padStart(2, '0')} ${month} ${d.getUTCFullYear()} ${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')} UTC`;
  }

  setNewMarketMode(value: unknown): void {
    const enabled = value === true || value === 'true';
    this.newMarketMode.set(enabled);
  }

  setNewOptionType(value: unknown): void {
    const v = String(value);
    if (v === '0' || v === '1') this.newOptionType.set(v);
  }

  marketOptions() {
    return this.store.activeMarkets();
  }

  marketExpiry(): bigint {
    return this.selectedMarket()?.market.expiry ?? 0n;
  }

  maxOrderExpiryLabel(): string {
    const expiry = this.newMarketMode() ? this.customExpiryUnix() : this.marketExpiry();
    return expiry && expiry > 0n ? this.formatExpiry(expiry) : 'No market expiry available';
  }

  formatExpiry(x: bigint | number | string | null | undefined): string {
    try {
      const s = typeof x === 'bigint' ? Number(x) : Number(x ?? 0);
      if (!s || !Number.isFinite(s)) return '—';
      const d = new Date(s * 1000);
      return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')} ${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')} UTC`;
    } catch { return '—'; }
  }

  selectMarket(value: unknown): void {
    const key = String(value ?? '').trim().toLowerCase();
    this.selectedMarketKey.set(key);
    if (key) this.store.selectMarket(key);
    this.syncCustomExpiryFromMarket();
  }

  setIntent(value: unknown): void {
    const n = Number(value);
    if (n === 0 || n === 1 || n === 2 || n === 3) this.intent.set(String(n) as '0' | '1' | '2' | '3');
  }

  setExpiryPreset(value: unknown): void {
    const v = String(value) as 'default' | '1h' | '1d' | '7d' | 'max' | 'custom';
    if (['default', '1h', '1d', '7d', 'max', 'custom'].includes(v)) this.expiryPreset.set(v);
  }




  validMarketExpiryOptions(): Array<{ unix: string; label: string }> {
    const now = BigInt(Math.floor(Date.now() / 1000));
    const options: Array<{ unix: string; label: string }> = [];
    const cursor = new Date();
    cursor.setUTCHours(12, 0, 0, 0);
    for (let i = 0; options.length < 12 && i < 120; i += 1) {
      const day = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth(), cursor.getUTCDate() + i, 12, 0, 0, 0));
      if (day.getUTCDay() !== 5) continue;
      const unix = BigInt(Math.floor(day.getTime() / 1000));
      if (unix <= now) continue;
      options.push({ unix: unix.toString(), label: this.formatExpiry(unix) });
    }
    return options;
  }

  marketExpiryDropdownValue(): string {
    return this.marketExpiryMode() === 'custom' ? 'custom' : (this.customExpiryWeekUnix() || this.validMarketExpiryOptions()[0]?.unix || 'custom');
  }

  selectMarketExpiryChoice(value: string | number): void {
    const raw = String(value ?? '');
    if (raw === 'custom') {
      this.marketExpiryMode.set('custom');
      this.selectFirstCustomFriday();
      return;
    }
    this.marketExpiryMode.set('preset');
    this.setCustomExpiryWeek(raw);
  }

  isCustomMarketExpiry(): boolean {
    return this.marketExpiryMode() === 'custom';
  }

  useMarketExpiryForOrder(): void {
    const expiry = this.newMarketMode() ? this.customExpiryUnix() : this.marketExpiry();
    if (expiry && expiry > 0n) this.orderExpiryUnix.set(expiry.toString());
  }

  private orderExpiryArgs(): { expiryPreset: 'default' | '1h' | '1d' | '7d' | 'max' | 'custom'; customExpiryUnix: bigint | null } {
    const parsed = parseExpirySelection(this.orderExpiryUnix());
    if (parsed.kind === 'default') return { expiryPreset: 'default', customExpiryUnix: null };
    if (parsed.kind === 'relative') {
      if (parsed.seconds === EXPIRY_PRESET_SECONDS['1h']) return { expiryPreset: '1h', customExpiryUnix: null };
      if (parsed.seconds === EXPIRY_PRESET_SECONDS['1d']) return { expiryPreset: '1d', customExpiryUnix: null };
      if (parsed.seconds === EXPIRY_PRESET_SECONDS['7d']) return { expiryPreset: '7d', customExpiryUnix: null };
      return { expiryPreset: 'custom', customExpiryUnix: BigInt(Math.floor(Date.now() / 1000)) + parsed.seconds };
    }
    if (parsed.kind === 'absolute') return { expiryPreset: 'custom', customExpiryUnix: parsed.unix };
    throw new Error('Select a valid order expiry.');
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
      this.marketExpiryMode.set(this.validMarketExpiryOptions().some((row) => row.unix === expiry.toString()) ? 'preset' : 'custom');
      return;
    }
    const now = new Date();
    this.customExpiryYear.set(String(now.getUTCFullYear()));
    this.customExpiryMonth.set(String(now.getUTCMonth() + 1));
    const months = this.expiryMonths();
    if (!months.some((row) => row.value === this.customExpiryMonth())) this.customExpiryMonth.set(months[0]?.value ?? '');
    this.marketExpiryMode.set('preset');
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

  reviewButtonLabel(): string {
    return this.data.intent === 'quote' ? 'Get Fee Quote' : 'Review Order';
  }

  createMarket(): void {
    this.error.set(null);
    try {
      const marketExpiry = this.customExpiryUnix();
      if (!marketExpiry) throw new Error('Select a valid market expiry.');
      const collateralPercent = Number(String(this.newCollateralPercent() || '100').replace(',', '.'));
      if (!Number.isFinite(collateralPercent) || collateralPercent <= 0 || collateralPercent > 100) {
        throw new Error('Collateral coverage must be between 0 and 100%.');
      }
      void this.actions.requestCreateMarket({
        ticker: this.newTicker(),
        optionType: Number(this.newOptionType()),
        oracle: this.newOracle(),
        strikePriceHuman: this.newStrikeHuman(),
        marketExpiry,
        collateralBps: BigInt(Math.round(collateralPercent * 100)),
      }).catch((e: any) => this.error.set(e?.message ?? 'Unable to prepare market creation'));
    } catch (e: any) {
      this.error.set(e?.message ?? 'Unable to prepare market creation');
    }
  }

  preview(): void {
    this.error.set(null);
    try {
      if (this.newMarketMode()) {
        this.error.set('Use the Create Market button to continue.');
        return;
      }
      const orderExpiry = this.orderExpiryArgs();
      void this.actions.requestPlace({
        marketKey: this.selectedMarketKey() || this.store.selectedMarketKey(),
        intent: Number(this.intent()),
        sizeHuman: this.sizeHuman(),
        priceHuman: this.priceHuman(),
        expiryPreset: orderExpiry.expiryPreset,
        customExpiryUnix: orderExpiry.customExpiryUnix,
        quoteOnly: this.data.intent === 'quote',
      }).catch((e: any) => this.error.set(e?.message ?? 'Unable to build margin option preview'));
    } catch (e: any) {
      this.error.set(e?.message ?? 'Unable to build margin option preview');
    }
  }
}
