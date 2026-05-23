import {
  OrderFlowAction,
  SpotOrderModalData,
} from '../../../../../types/order_flow/order-flow.types';
import { SpotOrderModalComponent } from '../../order-modal/spotorder-modal.component';
import { DepositWithdrawModalComponent } from '../../deposit-withdraw/deposit-withdraw-modal.component';

export interface TradePageCtx {
  baseToken?: string;
  quoteToken?: string;
  disabled?: boolean;
}

export const tradePageActions: Array<OrderFlowAction<TradePageCtx, any>> = [
  {
    id: 'spot.quote',
    group: 'Quotes',
    label: 'Get Fee Quote',
    description: 'Estimate fees without submitting an order',
    enabled: (ctx) => true, //(ctx) => ctx.walletConnected,
    disabledReason: () => undefined,
    buildData: (ctx) => ({
      intent: 'quote',
      baseToken: ctx.baseToken,
      quoteToken: ctx.quoteToken,
    }),

    modal: SpotOrderModalComponent,
  },
  {
    id: 'spot.buy',
    group: 'Trading',
    label: 'Buy (Spot Order)',
    description: 'Create a buy order',
    enabled: (ctx) => true, //(ctx) => ctx.walletConnected,
    disabledReason: () => undefined,
    buildData: (ctx): SpotOrderModalData => ({
      intent: 'buy',
    }),
    modal: SpotOrderModalComponent,
  },
  {
    id: 'spot.sell',
    group: 'Trading',
    label: 'Sell (Spot Order)',
    description: 'Create a sell order',
    enabled: (ctx) => true, //(ctx) => ctx.walletConnected,
    disabledReason: () => undefined,
    buildData: (ctx): SpotOrderModalData => ({
      intent: 'sell',
    }),
    modal: SpotOrderModalComponent,
  },

  // Wallet actions
  {
    id: 'deposit.eth',
    group: 'Wallet',
    label: 'Deposit ETH',
    buildData: () => ({ intent: 'deposit', asset: 'ETH' }),
    modal: DepositWithdrawModalComponent,
  },
  {
    id: 'withdraw.eth',
    group: 'Wallet',
    label: 'Withdraw ETH',
    buildData: () => ({ intent: 'withdraw', asset: 'ETH' }),
    modal: DepositWithdrawModalComponent,
  },
  {
    id: 'deposit.token',
    group: 'Wallet',
    label: 'Deposit Token',
    buildData: (ctx) => ({
      intent: 'deposit',
      asset: 'TOKEN',
    }),
    modal: DepositWithdrawModalComponent,
  },
  {
    id: 'withdraw.token',
    group: 'Wallet',
    label: 'Withdraw Token',
    buildData: (ctx) => ({
      intent: 'withdraw',
      asset: 'TOKEN',
    }),
    modal: DepositWithdrawModalComponent,
  },

  // Order actions
  {
    id: 'order.cancel',
    group: 'Orders',
    label: 'Cancel Order',
    buildData: () => ({ intent: 'cancel' }),
    modal: SpotOrderModalComponent,
  },
  {
    id: 'order.accept',
    group: 'Orders',
    label: 'Accept Order',
    buildData: () => ({ intent: 'accept' }),
    modal: SpotOrderModalComponent,
  },
];
