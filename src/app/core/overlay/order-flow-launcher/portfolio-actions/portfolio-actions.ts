import { OrderFlowAction } from '../../../../../types/order_flow/order-flow.types';
import { DepositWithdrawModalComponent } from '../../deposit-withdraw/deposit-withdraw-modal.component';

export interface TradePageCtx {
  baseToken?: string;
  quoteToken?: string;
  disabled?: boolean;
}

export const portfolioPageActions: Array<OrderFlowAction<TradePageCtx, any>> = [
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
    buildData: () => ({ intent: 'deposit', asset: 'TOKEN' }),
    modal: DepositWithdrawModalComponent,
  },
  {
    id: 'withdraw.token',
    group: 'Wallet',
    label: 'Withdraw Token',
    buildData: () => ({ intent: 'withdraw', asset: 'TOKEN' }),
    modal: DepositWithdrawModalComponent,
  },
];
