import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface MarketSummaryMetric {
  label: string;
  value: string | number | bigint | null | undefined;
  tone?: 'default' | 'up' | 'down' | 'muted';
}

@Component({
  selector: 'app-market-summary-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="sethx-market-summary">
      <div class="sethx-market-summary-shell">
        <div class="min-w-0">
          <div class="text-white text-base truncate">{{ title || 'Market' }}</div>
          <div class="sethx-market-summary-line" *ngIf="metrics?.length">
            <div class="sethx-market-summary-item" *ngFor="let metric of metrics">
              <span class="text-frame">{{ metric.label }}</span>
              <span [ngClass]="metricClass(metric)">{{ display(metric.value) }}</span>
            </div>
          </div>
          <div class="mt-2 font-mono break-all text-[11px]" *ngIf="marketKey">{{ marketKey }}</div>
        </div>

        <div class="sethx-market-summary-actions" *ngIf="showActions">
          <button class="sethx-button-secondary min-w-[110px]" type="button" (click)="feeQuote.emit()">Fee quote</button>
          <button class="sethx-button-secondary min-w-[110px]" type="button" (click)="placeOrder.emit()">Place order</button>
        </div>
      </div>
    </section>
  `,
})
export class MarketSummaryHeaderComponent {
  @Input() title = 'Market';
  @Input() marketKey: string | null | undefined = null;
  @Input() metrics: MarketSummaryMetric[] = [];
  @Input() showActions = true;

  @Output() feeQuote = new EventEmitter<void>();
  @Output() placeOrder = new EventEmitter<void>();

  display(value: MarketSummaryMetric['value']): string {
    if (value === null || value === undefined || value === '') return '—';
    return String(value);
  }

  metricClass(metric: MarketSummaryMetric): string {
    const base = 'font-bold';
    if (metric.tone === 'up') return `text-up ${base}`;
    if (metric.tone === 'down') return `text-down ${base}`;
    if (metric.tone === 'muted') return `text-frame ${base}`;
    return `text-white ${base}`;
  }
}
