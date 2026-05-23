import { Injectable, inject, signal, computed } from '@angular/core';

import type {
  ConfirmationField,
  RequirementRow,
} from '../../../core/modals/confirmation/confirmation-modal.component';
import { TriggerService } from '../trigger.service';
import { FuturesOrderBookWriteService } from '../../onchain/contracts/futures-orderbook-write.service';
import { FuturesOrderBookStore } from './futures-orderbook.store';
import { FuturesOrder } from '../../onchain/contracts/futures-orderbook-read.service';
import { TransactionReceiptService } from '../../../shared/transaction-receipt';

@Injectable({ providedIn: 'root' })
export class FuturesOrderBookActionsService {
  private readonly writes = inject(FuturesOrderBookWriteService);
  private readonly trigger = inject(TriggerService);
  private readonly txReceipt = inject(TransactionReceiptService);
  private readonly store = inject(FuturesOrderBookStore);

  readonly confirmOpen = signal(false);
  readonly confirmTitle = signal('Confirm futures action');
  readonly confirmLabel = signal('Confirm & Sign');
  readonly confirmFields = signal<ConfirmationField[]>([]);
  readonly confirmRequirements = signal<RequirementRow[] | null>(null);
  readonly confirmDisabled = signal(false);
  readonly confirmError = signal<string | null>(null);
  readonly receipt = this.txReceipt.receipt;
  readonly explorerTxUrl = this.txReceipt.explorerTxUrl;

  private readonly _pending = signal(false);
  readonly status = computed(() => (this._pending() ? 'pending' : this.confirmError() ? 'error' : 'idle'));

  private pendingConfirmAction: null | (() => Promise<string | null | void>) = null;

  async placeOrder(args: {
    marketKey: string;
    side: 0 | 1; // 0=Buy, 1=Sell
    priceHuman: string;
    amountHuman: string;
    expiry: bigint;
  }): Promise<string | null> {
    const txHash = await this.writes.placeOrder(args);
    this.trigger.emitDomainEvent({ type: 'futuresOrderPlaced' });
    return txHash;
  }

  async cancelOrder(orderId: bigint): Promise<string | null> {
    const txHash = await this.writes.cancelOrder(orderId);
    this.trigger.emitDomainEvent({ type: 'futuresOrderPlaced' });
    return txHash;
  }

  closeConfirmModal() {
    this.confirmOpen.set(false);
    this.confirmError.set(null);
    this.confirmDisabled.set(false);
    this.txReceipt.clear();
    this._pending.set(false);
    this.pendingConfirmAction = null;
  }

  async onConfirmModalConfirm() {
    if (this.confirmDisabled() || !this.pendingConfirmAction || this._pending()) return;
    this._pending.set(true);
    this.confirmError.set(null);
    this.txReceipt.pending(this.confirmTitle(), 'Waiting for wallet signature and on-chain confirmation...');
    try {
      const txHash = await this.pendingConfirmAction();
      this.trigger.emitDomainEvent({ type: 'futuresOrderPlaced' });
      this.confirmDisabled.set(true);
      this.pendingConfirmAction = null;
      this.txReceipt.success('Transaction confirmed', typeof txHash === 'string' ? txHash : null);
      this._pending.set(false);
    } catch (e: any) {
      const message = String(e?.reason ?? e?.shortMessage ?? e?.message ?? 'Transaction failed');
      this.confirmError.set(message);
      this.txReceipt.error('Transaction failed', e, message);
      this._pending.set(false);
    }
  }

  requestCancel(order: FuturesOrder) {
    this.confirmTitle.set('Cancel futures order');
    this.confirmLabel.set('Cancel order');
    this.confirmFields.set([
      { label: 'Action', value: 'Cancel order' },
      { label: 'Order ID', value: order.orderId.toString() },
      { label: 'Market key', value: order.marketKey, tone: 'muted' },
      { label: 'Side', value: order.side === 0 ? 'Buy / Long' : 'Sell / Short' },
      { label: 'Remaining amount', value: this.store.formatContracts(order.amount) },
      { label: 'Limit price', value: `${this.formatOrderPrice(order)} ETH` },
      { label: 'Routing', value: 'Via selected account contract', tone: 'muted' },
    ]);
    this.confirmRequirements.set(null);
    this.confirmDisabled.set(false);
    this.confirmError.set(null);
    this.txReceipt.clear();
    this.pendingConfirmAction = async () => {
      return await this.writes.cancelOrder(order.orderId);
    };
    this.confirmOpen.set(true);
  }

  requestFill(order: FuturesOrder) {
    const amountInput = this.store.fillAmountByOrderId(order.orderId).trim();
    let amount: bigint;
    try {
      amount = BigInt(amountInput || '0');
    } catch {
      this.confirmError.set('Enter a whole contract amount to fill.');
      this.confirmOpen.set(true);
      return;
    }

    if (amount <= 0n) {
      this.confirmError.set('Enter a fill amount greater than zero.');
      this.confirmOpen.set(true);
      return;
    }

    const remaining = order.amount > 0n ? order.amount : 0n;
    if (remaining > 0n && amount > remaining) amount = remaining;

    const takerSide: 0 | 1 = order.side === 0 ? 1 : 0;
    const actionLabel = takerSide === 0 ? 'Buy / Open Long' : 'Sell / Open Short';

    this.confirmTitle.set('Fill futures order');
    this.confirmLabel.set('Confirm & Sign');
    this.confirmFields.set([
      { label: 'Action', value: 'Fill resting futures order' },
      { label: 'Maker order ID', value: order.orderId.toString() },
      { label: 'Maker side', value: order.side === 0 ? 'Buy / Long' : 'Sell / Short' },
      { label: 'Your taker side', value: actionLabel },
      { label: 'Market key', value: order.marketKey, tone: 'muted' },
      { label: 'Fill amount', value: amount.toString() },
      { label: 'Limit price', value: `${this.formatOrderPrice(order)} ETH` },
      { label: 'Payment token', value: 'ETH' },
      {
        label: 'Execution route',
        value: 'Places an opposite-side taker order at the resting order price',
        tone: 'muted',
      },
    ]);
    this.confirmRequirements.set(null);
    this.confirmDisabled.set(false);
    this.confirmError.set(null);

    const fillAmount = amount;
    this.pendingConfirmAction = async () => {
      return await this.writes.placeOrderRaw({
        marketKey: order.marketKey,
        side: takerSide,
        price: order.price,
        amount: fillAmount,
        expiry: 0n,
      });
    };
    this.confirmOpen.set(true);
  }

  private formatOrderPrice(order: FuturesOrder): string {
    const decimals = this.store.selectedMarketRow()?.market?.quoteTokenDecimals ?? 18;
    return this.store.formatQuotePrice(order.price, decimals);
  }
}
