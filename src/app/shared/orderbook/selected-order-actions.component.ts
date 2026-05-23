import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-selected-order-actions',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="sethx-panel-section sethx-panel-card" *ngIf="selectedOrder; else emptySelection">
      <div class="sethx-panel-heading">Selected Order</div>
      <div class="space-y-2 text-[11px]">
        <div class="flex justify-between gap-3">
          <span class="sethx-field-label !mb-0">Order ID</span>
          <span class="sethx-address-value-muted">{{ orderId }}</span>
        </div>
        <div class="flex justify-between gap-3" *ngIf="sideLabel">
          <span class="sethx-field-label !mb-0">Side</span>
          <span class="sethx-readonly-value-strong uppercase">{{ sideLabel }}</span>
        </div>
        <div class="flex justify-between gap-3">
          <span class="sethx-field-label !mb-0">Owner</span>
          <span class="sethx-readonly-value-strong">{{ isMine ? 'Active account' : 'Other account' }}</span>
        </div>
      </div>

      <div class="mt-4 space-y-3">
        <button
          *ngIf="isMine"
          type="button"
          class="sethx-button-secondary w-full"
          [disabled]="cancelDisabled"
          [title]="cancelDisabledReason || 'Cancel selected order'"
          (click)="onCancel()"
        >
          Cancel Order
        </button>
        <p *ngIf="isMine && cancelDisabledReason" class="sethx-meta-text leading-relaxed">
          {{ cancelDisabledReason }}
        </p>

        <ng-container *ngIf="!isMine">
          <ng-container *ngIf="showFillAmount">
            <label class="sethx-field-label">{{ fillAmountLabel }}</label>
            <input
              class="sethx-input w-full"
              [value]="fillAmount || ''"
              [placeholder]="fillAmountPlaceholder"
              (input)="fillAmountChange.emit($any($event.target).value)"
            />
          </ng-container>
          <button
            type="button"
            class="sethx-button-primary w-full"
            [disabled]="fillDisabled"
            [title]="fillDisabledReason || fillButtonLabel"
            (click)="onFill()"
          >
            {{ fillButtonLabel }}
          </button>
          <p *ngIf="fillDisabledReason" class="sethx-meta-text leading-relaxed">
            {{ fillDisabledReason }}
          </p>
        </ng-container>

        <button type="button" class="sethx-button-secondary w-full" (click)="clear.emit()">
          Clear Selection
        </button>
      </div>
    </section>

    <ng-template #emptySelection>
      <section class="sethx-panel-section sethx-panel-card">
        <div class="sethx-panel-heading">Selected Order</div>
        <p class="sethx-panel-copy">
          Select an order in the center orderbook to fill another account's order or cancel your own.
        </p>
      </section>
    </ng-template>
  `,
})
export class SelectedOrderActionsComponent {
  @Input() selectedOrder: any | null = null;
  @Input() orderId = '';
  @Input() sideLabel = '';
  @Input() isMine = false;
  @Input() fillAmount = '';
  @Input() showFillAmount = true;
  @Input() fillAmountLabel = 'Fill amount';
  @Input() fillAmountPlaceholder = 'Amount';
  @Input() fillButtonLabel = 'Fill Order';
  @Input() fillDisabled = false;
  @Input() fillDisabledReason: string | null = null;
  @Input() cancelDisabled = false;
  @Input() cancelDisabledReason: string | null = null;

  @Output() fillAmountChange = new EventEmitter<string>();
  @Output() fill = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() clear = new EventEmitter<void>();

  onFill(): void {
    if (this.fillDisabled) return;
    this.fill.emit();
  }

  onCancel(): void {
    if (this.cancelDisabled) return;
    this.cancel.emit();
  }
}
