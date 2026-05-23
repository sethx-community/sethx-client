import { NftSpotOrderModalComponent } from '../../order-modal/nftspotorder-modal.component';
import { NftSpotOrderModalData, OrderFlowAction } from '../../../../../types/order_flow/order-flow.types';
import { NftSpotOrder } from '../../../../services/shared/nft-spot-orderbook/nft-spot-orderbook.store';

export interface NftSpotPageCtx {
  activeAccount?: string | null;
  selectedOrder?: NftSpotOrder | null;
}

function hasAccount(ctx: NftSpotPageCtx): boolean {
  return !!ctx.activeAccount;
}

function selectedOtherOrder(ctx: NftSpotPageCtx): NftSpotOrder | null {
  const order = ctx.selectedOrder ?? null;
  return order && !order.isMine ? order : null;
}

function selectedOwnOrder(ctx: NftSpotPageCtx): NftSpotOrder | null {
  const order = ctx.selectedOrder ?? null;
  return order && order.isMine ? order : null;
}

export const nftSpotPageActions: Array<OrderFlowAction<NftSpotPageCtx, NftSpotOrderModalData>> = [
  {
    id: 'nftspot.place',
    group: 'Trading',
    label: 'Place NFT Spot Order',
    description: 'Create a bid or ask for any NFT contract and token ID. No existing market selection is required.',
    enabled: hasAccount,
    disabledReason: (ctx) => hasAccount(ctx) ? undefined : 'Select an active protocol account first.',
    modal: NftSpotOrderModalComponent,
    buildData: () => ({ intent: 'place' }),
  },
  {
    id: 'nftspot.quote',
    group: 'Quotes',
    label: 'NFT Spot Fee Quote',
    description: 'Preview the fee budget for a new NFT spot bid or ask without submitting an order.',
    enabled: hasAccount,
    disabledReason: (ctx) => hasAccount(ctx) ? undefined : 'Select an active protocol account first.',
    modal: NftSpotOrderModalComponent,
    buildData: () => ({ intent: 'quote' }),
  },
  {
    id: 'nftspot.accept',
    group: 'Orders',
    label: 'Accept NFT Order',
    description: 'Preview fees and accept another account\'s selected NFT spot order.',
    enabled: (ctx) => hasAccount(ctx) && !!selectedOtherOrder(ctx),
    disabledReason: (ctx) => {
      if (!hasAccount(ctx)) return 'Select an active protocol account first.';
      if (!ctx.selectedOrder) return 'Select another account\'s NFT order first.';
      if (ctx.selectedOrder.isMine) return 'Your own order can only be cancelled.';
      return undefined;
    },
    modal: NftSpotOrderModalComponent,
    buildData: (ctx) => ({ intent: 'accept', order: selectedOtherOrder(ctx) ?? undefined }),
  },
  {
    id: 'nftspot.cancel',
    group: 'Orders',
    label: 'Cancel NFT Order',
    description: 'Preview and cancel your own selected NFT spot order.',
    enabled: (ctx) => hasAccount(ctx) && !!selectedOwnOrder(ctx),
    disabledReason: (ctx) => {
      if (!hasAccount(ctx)) return 'Select an active protocol account first.';
      if (!ctx.selectedOrder) return 'Select your own NFT order first.';
      if (!ctx.selectedOrder.isMine) return 'Another account\'s order can only be accepted.';
      return undefined;
    },
    modal: NftSpotOrderModalComponent,
    buildData: (ctx) => ({ intent: 'cancel', order: selectedOwnOrder(ctx) ?? undefined }),
  },
];
