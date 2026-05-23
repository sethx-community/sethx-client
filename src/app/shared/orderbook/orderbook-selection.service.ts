import { Injectable, signal, computed } from '@angular/core';

export type SharedOrderProduct = 'spot' | 'futures' | 'options' | 'binary-options' | 'margin-options' | 'nft-spot' | 'lending';

export interface SharedOrderSelection<TOrder = any> {
  product: SharedOrderProduct;
  marketKey?: string | null;
  orderId: string;
  side?: 'bid' | 'ask' | 'buy' | 'sell' | 'lend' | 'borrow' | string;
  isMine: boolean;
  order: TOrder;
}

@Injectable({ providedIn: 'root' })
export class OrderbookSelectionService {
  private readonly _selected = signal<SharedOrderSelection | null>(null);
  readonly selected = this._selected.asReadonly();
  readonly hasSelected = computed(() => !!this._selected());

  select(selection: SharedOrderSelection | null): void {
    this._selected.set(selection);
  }

  clear(product?: SharedOrderProduct): void {
    const current = this._selected();
    if (!product || current?.product === product) this._selected.set(null);
  }

  isSelected(product: SharedOrderProduct, orderId: string | bigint | number | null | undefined): boolean {
    const current = this._selected();
    return !!current && current.product === product && current.orderId === String(orderId ?? '');
  }

  selectOrToggle(selection: SharedOrderSelection): void {
    if (this.isSelected(selection.product, selection.orderId)) {
      this._selected.set(null);
      return;
    }
    this._selected.set(selection);
  }
}
