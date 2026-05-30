import { OrderFlowAction, LendingOrderModalData } from '../../../../../types/order_flow/order-flow.types';
import { LendingOrderModalComponent } from '../../order-modal/lendingorder-modal.component';
import {
  ContractActionModalComponent,
  ContractActionModalData,
} from '../../order-modal/contract-action-modal.component';

export interface LendingOrderbookPageCtx {
  selectedMarketKey?: string | null;
  selectedMarketLabel?: string | null;
  selectedRiskLevel?: number | null;
  selectedExpiry?: number | null;
  selectedMaxLtvBps?: number | null;
  selectedLiquidationLtvBps?: number | null;
  selectedAccountType?: 'normal' | 'lending' | null;
  selectedAccountLabel?: string | null;
}

const selectedMarketRequired = (ctx?: LendingOrderbookPageCtx): string | undefined =>
  ctx?.selectedMarketKey ? undefined : 'No market is selected. The order modal can still create a new lending market if you enter maturity and risk tier.';

const lendingAccountRequired = (ctx?: LendingOrderbookPageCtx): string | undefined => {
  return ctx?.selectedAccountType === 'lending'
    ? undefined
    : 'Borrowing and repayment require a lending account';
};

const marketData = (
  ctx: LendingOrderbookPageCtx | undefined,
  intent: LendingOrderModalData['intent'],
  defaultSide?: 0 | 1,
): LendingOrderModalData => ({
  intent,
  marketKey: ctx?.selectedMarketKey ?? null,
  marketLabel: ctx?.selectedMarketLabel ?? null,
  riskLevel: ctx?.selectedRiskLevel ?? null,
  marketExpiry: ctx?.selectedExpiry ?? null,
  maxLtvBps: ctx?.selectedMaxLtvBps ?? null,
  liquidationLtvBps: ctx?.selectedLiquidationLtvBps ?? null,
  defaultSide,
  selectedAccountType: ctx?.selectedAccountType ?? null,
  selectedAccountLabel: ctx?.selectedAccountLabel ?? null,
});

const selectedNote = (ctx?: LendingOrderbookPageCtx): string => {
  const account = ctx?.selectedAccountLabel
    ? ` Selected account: ${ctx.selectedAccountLabel} (${ctx.selectedAccountType ?? 'unknown'}).`
    : '';

  if (!ctx?.selectedMarketKey) {
    return `Select a lending market to prefill market-specific actions. Markets are opened lazily by the first valid order after governance enables the risk tier. Borrow orders require a lending account. Rollover is available from active debt rows on the My Loans tab.${account}`;
  }

  return `Selected market: ${ctx.selectedMarketLabel ?? ctx.selectedMarketKey}. Market key: ${ctx.selectedMarketKey}. Markets are opened lazily by the first valid order after governance enables the risk tier. Borrow orders require a lending account. Rollover is available from active debt rows on the My Loans tab.${account}`;
};

const data = (
  title: string,
  subtitle: string,
  functions: ContractActionModalData['functions'],
  ctx?: LendingOrderbookPageCtx,
  contractNames: string[] = ['LendingContract', 'LendingOrderBook', 'LendingAccount'],
): ContractActionModalData => ({
  title,
  subtitle,
  contractNames,
  functions,
  note: selectedNote(ctx),
});

export const lendingOrderbookPageActions: Array<
  OrderFlowAction<LendingOrderbookPageCtx, LendingOrderModalData | ContractActionModalData>
> = [
  {
    id: 'lending.lend',
    group: 'Trading',
    label: 'Place Lend Offer',
    description: 'Post ETH principal into the selected lending market. The first valid order opens the market.',

    buildData: (ctx) => marketData(ctx, 'lend', 0),
    modal: LendingOrderModalComponent,
  },
  {
    id: 'lending.borrow',
    group: 'Trading',
    label: 'Place Borrow Bid',
    description: 'Borrow against the selected lending market using a lending account only.',
    enabled: (ctx) => ctx.selectedAccountType === 'lending',
    disabledReason: lendingAccountRequired,
    buildData: (ctx) => marketData(ctx, 'borrow', 1),
    modal: LendingOrderModalComponent,
  },
  {
    id: 'lending.place',
    group: 'Trading',
    label: 'Place Lend / Borrow Order',
    description: 'Advanced combined order form for the selected lending market.',

    buildData: (ctx) => marketData(ctx, 'place', 0),
    modal: LendingOrderModalComponent,
  },
  {
    id: 'lending.cancel',
    group: 'Orders',
    label: 'Cancel Lending Order',
    description: 'Cancel a resting lend or borrow order owned by the selected account.',
    buildData: (ctx) => marketData(ctx, 'cancel'),
    modal: LendingOrderModalComponent,
  },
  {
    id: 'lending.repay',
    group: 'Account',
    label: 'Repay Debt',
    description: 'Repay borrower debt from the selected lending account vault balance.',
    enabled: (ctx) => ctx.selectedAccountType === 'lending',
    disabledReason: lendingAccountRequired,
    buildData: (ctx) => marketData(ctx, 'repay'),
    modal: LendingOrderModalComponent,
  },
  {
    id: 'lending.redeem',
    group: 'Account',
    label: 'Redeem / Claim Bond',
    description: 'Redeem initial or supplemental lender bond proceeds after settlement.',
    buildData: (ctx) => marketData(ctx, 'redeem'),
    modal: LendingOrderModalComponent,
  },
  {
    id: 'lending.review',
    group: 'Quotes',
    label: 'Review Market Reads',
    description: 'Review market state, totals, debt and bond accounting before action.',
    enabled: (ctx) => !!ctx.selectedMarketKey,
    disabledReason: selectedMarketRequired,
    buildData: (ctx) =>
      data('Review Lending Market', 'Reads lending market state before action.', [
        {
          name: 'LendingContract.riskLevels',
          signature: 'riskLevels(uint16 riskLevel) view returns (enabled, maxLtvBps, liquidationLtvBps)',
          purpose: 'Risk tiers must be enabled before a new market can be created by the first order.',
        },
        {
          name: 'LendingContract.getMarket',
          signature: 'getMarket(bytes32 marketKey) view returns (MarketConfig)',
          purpose: 'Reads borrow token, expiry, risk level, LTV values and active flag.',
        },
        {
          name: 'LendingContract.getMarketTotals',
          signature: 'getMarketTotals(bytes32 marketKey) view returns (MarketTotals)',
          purpose: 'Reads aggregate principal, face value, outstanding debt and cumulative losses.',
        },
        {
          name: 'LendingContract.getMarketSettlement',
          signature: 'getMarketSettlement(bytes32 marketKey) view returns (MarketSettlement)',
          purpose: 'Reads settlement and recovery-rate state.',
        },
        {
          name: 'LendingOrderBook.getBook',
          signature: 'getBook(bytes32 marketKey, bool wantLendBook) view returns (uint256[])',
          purpose: 'Reads lend offer or borrow bid order ids for the market.',
        },
      ], ctx, ['LendingContract', 'LendingOrderBook']),
    modal: ContractActionModalComponent,
  },
];
