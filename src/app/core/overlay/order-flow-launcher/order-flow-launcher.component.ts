import { Component, Input, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderFlowService } from '../order-flow.service';
import { OrderFlowAction } from '../../../../types/order_flow/order-flow.types';

export interface TradeHostContext {
  walletConnected?: boolean;
  baseToken?: string;
  quoteToken?: string;
  chainId?: number;
  account?: string;
}

@Component({
  selector: 'app-order-flow-launcher',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order-flow-launcher.component.html',
  styleUrl: './order-flow-launcher.component.scss',
})
export class OrderFlowLauncherComponent {
  private readonly flow = inject(OrderFlowService);

  @Input({ required: true }) actions!: Array<OrderFlowAction<any, any>>;
  @Input({ required: true }) ctx!: any;

  readonly selectedId = signal<string>('');
  readonly launchError = signal<string>('');

  readonly actionsById = computed(() => {
    const map = new Map<string, OrderFlowAction<any, any>>();
    for (const a of this.actions) map.set(a.id, a);
    return map;
  });

  readonly selectedAction = computed(() => {
    const id = this.selectedId();
    return id ? (this.actionsById().get(id) ?? null) : null;
  });

  readonly grouped = computed(() => {
    const out: Record<string, Array<OrderFlowAction<any, any>>> = {};
    for (const a of this.actions) {
      out[a.group] ??= [];
      out[a.group].push(a);
    }
    return out;
  });

  readonly groups = computed(() => Object.keys(this.grouped()));

  async onSelect(event: Event) {
    const select = event.target as HTMLSelectElement | null;
    const id = select?.value ?? '';
    if (select) {
      select.value = '';
      select.selectedIndex = 0;
    }
    this.launchError.set('');
    this.selectedId.set('');

    if (!id) return;

    const action = this.actionsById().get(id);
    if (!action) {
      this.selectedId.set('');
      return;
    }

    if (this.isDisabled(action)) {
      this.launchError.set(this.disabledReason(action) || 'This action is not available.');
      return;
    }

    await this.launch(action);
  }

  isDisabled(a: OrderFlowAction<any>) {
    return a.enabled ? !a.enabled(this.ctx) : false;
  }

  disabledReason(a: OrderFlowAction<any>) {
    return a.disabledReason?.(this.ctx);
  }

  async launch(a: OrderFlowAction<any>) {
    try {
      if (a.run) {
        await a.run(this.ctx);
        this.selectedId.set('');
        return;
      }

      if (!a.modal || !a.buildData) {
        console.warn(
          `[OrderFlowLauncher] Action "${a.id}" has no run() and is missing modal/buildData.`,
        );
        this.launchError.set('This action is not configured.');
        return;
      }

      const data = a.buildData(this.ctx);
      this.selectedId.set('');
      this.flow.open(a.modal, data);
      queueMicrotask(() => this.selectedId.set(''));
    } catch (e: any) {
      this.launchError.set(String(e?.reason ?? e?.message ?? 'Action failed'));
    }
  }
}
