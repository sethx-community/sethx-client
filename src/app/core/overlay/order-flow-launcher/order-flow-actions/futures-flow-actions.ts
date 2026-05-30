import {
  OrderFlowAction,
  FuturesOrderModalData,
} from '../../../../../types/order_flow/order-flow.types';
import { FuturesOrderModalComponent } from '../../order-modal/futuresorder-modal.component';

export interface FuturesTradePageCtx {
  selectedMarketKey?: string | null;
}

export const futuresPageActions: Array<
  OrderFlowAction<FuturesTradePageCtx, FuturesOrderModalData>
> = [
  {
    id: 'futures.buy',
    group: 'Trading',
    label: 'Buy / Open Long',
    description: 'Place a long-side futures order. Select an existing market or paste a market key in the modal.',
    buildData: (ctx) => ({
      intent: 'buy',
      defaultMarketKey: ctx.selectedMarketKey ?? undefined,
    }),
    modal: FuturesOrderModalComponent,
  },
  {
    id: 'futures.sell',
    group: 'Trading',
    label: 'Sell / Open Short',
    description: 'Place a short-side futures order. Select an existing market or paste a market key in the modal.',
    buildData: (ctx) => ({
      intent: 'sell',
      defaultMarketKey: ctx.selectedMarketKey ?? undefined,
    }),
    modal: FuturesOrderModalComponent,
  },
  {
    id: 'futures.quote',
    group: 'Quotes',
    label: 'Preview Margin & Fees',
    description: 'Preview required margin and fee locks before signing. Select an existing market or paste a market key in the modal.',
    buildData: (ctx) => ({
      intent: 'quote',
      defaultMarketKey: ctx.selectedMarketKey ?? undefined,
    }),
    modal: FuturesOrderModalComponent,
  },
  {
    id: 'futures.cancel',
    group: 'Orders',
    label: 'Cancel Order',
    description: 'Cancel a resting futures order by orderId',
    buildData: (ctx) => ({
      intent: 'cancel',
      defaultMarketKey: ctx.selectedMarketKey ?? undefined,
    }),
    modal: FuturesOrderModalComponent,
  },
];
