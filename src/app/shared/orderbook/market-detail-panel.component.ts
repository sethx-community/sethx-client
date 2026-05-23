import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';

export interface MarketDetailItem {
  label: string;
  value: string | number | bigint | null | undefined;
  mono?: boolean;
  copyable?: boolean;
  fullWidth?: boolean;
}

@Component({
  selector: 'app-market-detail-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="sethx-market-detail-panel" *ngIf="items?.length">
      <div class="flex items-center justify-between gap-3">
        <div class="min-w-0">
          <div class="sethx-panel-heading !py-0 !text-left">{{ title }}</div>
          <div class="text-[11px] text-accent truncate" *ngIf="subtitle" [title]="subtitle">{{ subtitle }}</div>
        </div>
        <button
          *ngIf="showClose"
          type="button"
          class="sethx-button-secondary !px-2 !py-1"
          (click)="close.emit()"
        >
          Close
        </button>
      </div>

      <div class="mt-3 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-[11px] select-text">
        <div
          class="flex items-start justify-between gap-3 min-w-0"
          [ngClass]="{ 'md:col-span-2': item.fullWidth || item.copyable }"
          *ngFor="let item of items"
        >
          <span class="sethx-detail-label shrink-0">{{ item.label }}</span>
          <span class="sethx-detail-value flex min-w-0 items-center justify-end gap-2 text-right">
            <span
              class="min-w-0"
              [class.font-mono]="item.mono"
              [class.truncate]="item.mono && !item.fullWidth"
              [class.break-all]="item.fullWidth"
              [title]="display(item.value)"
            >
              {{ display(item.value) }}
            </span>
            <button
              *ngIf="item.copyable && display(item.value) !== '—'"
              type="button"
              class="sethx-copy-button shrink-0"
              [class.is-copied]="copiedValue() === display(item.value)"
              [attr.aria-label]="'Copy ' + item.label"
              [title]="copiedValue() === display(item.value) ? 'Copied' : 'Copy ' + item.label"
              (click)="copyValue(item.value, $event)"
            >
              <i class="fa-regular" [class.fa-copy]="copiedValue() !== display(item.value)" [class.fa-circle-check]="copiedValue() === display(item.value)" aria-hidden="true"></i>
            </button>
          </span>
        </div>
      </div>
    </section>
  `,
})
export class MarketDetailPanelComponent {
  @Input() title = 'Details';
  @Input() subtitle = '';
  @Input() items: MarketDetailItem[] = [];
  @Input() showClose = false;
  @Output() close = new EventEmitter<void>();

  readonly copiedValue = signal<string | null>(null);

  display(value: MarketDetailItem['value']): string {
    if (value === null || value === undefined || value === '') return '—';
    return String(value);
  }

  async copyValue(value: MarketDetailItem['value'], event?: Event): Promise<void> {
    event?.stopPropagation();
    const text = this.display(value);
    if (text === '—') return;

    try {
      await navigator.clipboard.writeText(text);
      this.copiedValue.set(text);
      window.setTimeout(() => {
        if (this.copiedValue() === text) this.copiedValue.set(null);
      }, 1400);
    } catch {
      // Keep the UI non-blocking; the value remains selectable if clipboard access is unavailable.
    }
  }
}
