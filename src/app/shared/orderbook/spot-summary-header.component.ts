import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface SpotSummaryMetric {
  label: string;
  value: string | number | bigint | null | undefined;
  tone?: 'default' | 'up' | 'down' | 'muted';
  mono?: boolean;
}

@Component({
  selector: 'app-spot-summary-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="sethx-spot-summary">
      <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div class="min-w-0 space-y-1">
          <div class="sethx-panel-heading !py-0 !text-left">{{ eyebrow }}</div>
          <div class="sethx-section-title text-base truncate">{{ title || '—' }}</div>
          <div *ngIf="subtitle" class="sethx-spot-summary-subtitle" [class.font-mono]="subtitleMono">
            {{ subtitle }}
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2 shrink-0" *ngIf="showActions">
          <button
            *ngIf="secondaryLabel"
            type="button"
            class="sethx-button-secondary !py-1.5"
            [disabled]="secondaryDisabled"
            (click)="secondary.emit()"
          >
            {{ secondaryLabel }}
          </button>
          <button
            *ngIf="primaryLabel"
            type="button"
            class="sethx-button-primary !w-auto !py-1.5"
            [disabled]="primaryDisabled"
            (click)="primary.emit()"
          >
            {{ primaryLabel }}
          </button>
        </div>
      </div>

      <div class="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-[11px] sm:grid-cols-3 xl:grid-cols-5" *ngIf="metrics?.length">
        <div class="min-w-0" *ngFor="let metric of metrics">
          <div class="sethx-field-label !mb-0 truncate">{{ metric.label }}</div>
          <div
            class="truncate font-semibold"
            [class.text-white]="!metric.tone || metric.tone === 'default'"
            [class.text-up]="metric.tone === 'up'"
            [class.text-down]="metric.tone === 'down'"
            [class.text-text-muted]="metric.tone === 'muted'"
            [class.font-mono]="metric.mono"
            [title]="display(metric.value)"
          >
            {{ display(metric.value) }}
          </div>
        </div>
      </div>
    </section>
  `,
})
export class SpotSummaryHeaderComponent {
  @Input() eyebrow = 'Spot market';
  @Input() title = '';
  @Input() subtitle = '';
  @Input() subtitleMono = false;
  @Input() metrics: SpotSummaryMetric[] = [];
  @Input() showActions = true;
  @Input() primaryLabel = 'Place Order';
  @Input() secondaryLabel = 'Fee Quote';
  @Input() primaryDisabled = false;
  @Input() secondaryDisabled = false;

  @Output() primary = new EventEmitter<void>();
  @Output() secondary = new EventEmitter<void>();

  display(value: SpotSummaryMetric['value']): string {
    if (value === null || value === undefined || value === '') return '—';
    return String(value);
  }
}
