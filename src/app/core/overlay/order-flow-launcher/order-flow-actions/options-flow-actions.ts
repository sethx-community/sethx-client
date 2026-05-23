import {
  OrderFlowAction,
  OptionsOrderModalData,
} from '../../../../../types/order_flow/order-flow.types';
import { OptionsOrderModalComponent } from '../../order-modal/optionsorder-modal.component';

export interface OptionsTradePageCtx {
  disabled?: boolean;
}

export const optionsPageActions: Array<
  OrderFlowAction<OptionsTradePageCtx, OptionsOrderModalData>
> = [
  {
    id: 'options.buy',
    group: 'Trading',
    label: 'Buy Option (Bid)',
    description: 'Create a long-side option order (premium payer)',
    buildData: () => ({ intent: 'buy' }),
    modal: OptionsOrderModalComponent,
  },
  {
    id: 'options.sellwriter',
    group: 'Trading',
    label: 'Sell Writer (Bid)',
    description: 'Bid to take over a writer position (premium payer)',
    buildData: () => ({ intent: 'sellwriter' }),
    modal: OptionsOrderModalComponent,
  },
  {
    id: 'options.write',
    group: 'Trading',
    label: 'Write Option (Ask)',
    description: 'Create a short-side writer order (collateral locked)',
    buildData: () => ({ intent: 'write' }),
    modal: OptionsOrderModalComponent,
  },
  {
    id: 'options.selloption',
    group: 'Trading',
    label: 'Sell Option (Ask)',
    description: 'Ask to transfer an option position',
    buildData: () => ({ intent: 'selloption' }),
    modal: OptionsOrderModalComponent,
  },
  {
    id: 'options.quote',
    group: 'Quotes',
    label: 'Get Fee Quote',
    description: 'Preview fee requirements (premium payer only)',
    buildData: () => ({ intent: 'quote' }),
    modal: OptionsOrderModalComponent,
  },
  {
    id: 'options.accept',
    group: 'Orders',
    label: 'Accept Order',
    description: 'Accept an existing resting option order by its orderId',
    buildData: () => ({ intent: 'accept' }),
    modal: OptionsOrderModalComponent,
  },
  {
    id: 'options.cancel',
    group: 'Orders',
    label: 'Cancel Order',
    description: 'Cancel an existing resting option order by its orderId',
    buildData: () => ({ intent: 'cancel' }),
    modal: OptionsOrderModalComponent,
  },

  {
    id: 'options.exercise',
    group: 'Account',
    label: 'Exercise',
    description: 'Exercise an in-the-money option position (by marketKey)',
    buildData: () => ({ intent: 'exercise' }),
    modal: OptionsOrderModalComponent,
  },
  {
    id: 'options.reclaim',
    group: 'Account',
    label: 'Reclaim Expired',
    description: 'Reclaim collateral after option expiry (by marketKey)',
    buildData: () => ({ intent: 'reclaim' }),
    modal: OptionsOrderModalComponent,
  },
];
