import { BinaryOptionsOrderModalData, OrderFlowAction } from '../../../../../types/order_flow/order-flow.types';
import { BinaryOrderModalComponent } from '../../order-modal/binaryorder-modal.component';

export interface BinaryOptionsPageCtx {
  selectedMarketKey?: string | null;
}

const modal = BinaryOrderModalComponent;
const marketKey = (ctx: BinaryOptionsPageCtx) => ctx.selectedMarketKey ?? null;

export const binaryOptionsPageActions: Array<OrderFlowAction<BinaryOptionsPageCtx, BinaryOptionsOrderModalData>> = [
  {
    id: 'binaryoptions.place',
    group: 'Trading',
    label: 'Place Binary Option Order',
    description: 'Create a binary margin option order. Payment token is ETH.',
    buildData: (ctx) => ({ intent: 'place', defaultMarketKey: marketKey(ctx) ?? undefined }),
    modal,
  },
  {
    id: 'binaryoptions.quote',
    group: 'Quotes',
    label: 'Get Fee Quote',
    description: 'Preview premium, locked amount and fees before placing a binary option order.',
    buildData: (ctx) => ({ intent: 'quote', defaultMarketKey: marketKey(ctx) ?? undefined }),
    modal,
  },
  {
    id: 'binaryoptions.accept',
    group: 'Orders',
    label: 'Accept Binary Order',
    description: 'Accept an existing binary option order by order ID.',
    buildData: (ctx) => ({ intent: 'accept', defaultMarketKey: marketKey(ctx) ?? undefined }),
    modal,
  },
  {
    id: 'binaryoptions.cancel',
    group: 'Orders',
    label: 'Cancel Binary Order',
    description: 'Cancel a user-owned binary option order by order ID.',
    buildData: (ctx) => ({ intent: 'cancel', defaultMarketKey: marketKey(ctx) ?? undefined }),
    modal,
  },
  {
    id: 'binaryoptions.claim',
    group: 'Account',
    label: 'Claim / Clear Holder Payout',
    description: 'Claim winning holder payout or clear an expired losing/equal holder position.',
    buildData: (ctx) => ({ intent: 'claim', defaultMarketKey: marketKey(ctx) ?? undefined }),
    modal,
  },
  {
    id: 'binaryoptions.reclaim',
    group: 'Account',
    label: 'Reclaim Writer Margin',
    description: 'Reclaim writer margin after settlement and holder claims/clears.',
    buildData: (ctx) => ({ intent: 'reclaim', defaultMarketKey: marketKey(ctx) ?? undefined }),
    modal,
  },
];
