import { Type } from '@angular/core';

export type OrderFlowActionId =
  | 'spot.buy'
  | 'spot.sell'
  | 'spot.quote'
  | 'options.buy'
  | 'options.write'
  | 'options.selloption'
  | 'options.sellwriter'
  | 'options.quote'
  | 'options.accept'
  | 'options.cancel'
  | 'options.exercise'
  | 'options.reclaim'
  | 'futures.buy'
  | 'futures.sell'
  | 'futures.quote'
  | 'futures.cancel'
  | 'deposit.eth'
  | 'withdraw.eth'
  | 'deposit.token'
  | 'withdraw.token'
  | 'order.cancel'
  | 'order.accept'
  | 'create.account'
  | 'nftspot.place'
  | 'nftspot.quote'
  | 'nftspot.accept'
  | 'nftspot.cancel'
  | 'nftspot.sweep'
  | 'binaryoptions.place'
  | 'binaryoptions.quote'
  | 'binaryoptions.accept'
  | 'binaryoptions.cancel'
  | 'binaryoptions.claim'
  | 'binaryoptions.reclaim'
  | 'marginoptions.place'
  | 'marginoptions.quote'
  | 'marginoptions.accept'
  | 'marginoptions.cancel'
  | 'marginoptions.claim'
  | 'marginoptions.reclaim'
  | 'lending.place'
  | 'lending.lend'
  | 'lending.borrow'
  | 'lending.cancel'
  | 'lending.repay'
  | 'lending.redeem'
  | 'lending.review';

export type OrderFlowGroup =
  | 'Trading'
  | 'Quotes'
  | 'Wallet'
  | 'Orders'
  | 'Account';

export interface OrderFlowAction<HostCtx = unknown, ModalData = unknown> {
  id: OrderFlowActionId;
  group: OrderFlowGroup;
  label: string;
  description?: string;

  enabled?: (ctx: HostCtx) => boolean;
  disabledReason?: (ctx: HostCtx) => string | undefined;
  run?: (ctx: HostCtx) => void | Promise<void>;

  buildData?: (ctx: HostCtx) => ModalData;
  modal?: Type<any>;
}

export type SpotIntent =
  | 'place'
  | 'buy'
  | 'sell'
  | 'quote'
  | 'deposit'
  | 'withdraw'
  | 'accept'
  | 'cancel'
  | 'exercise'
  | 'reclaim';

export interface SpotOrderModalData {
  intent: SpotIntent;
  feeToken?: string;
  defaultBaseToken?: string;
  defaultQuoteToken?: string;
}

// ---------------- Options ----------------
export type OptionsIntent =
  | 'buy' // BuyOption (long-side)
  | 'write' // WriteOption (short-side)
  | 'selloption' // SellOption (short-side transfer)
  | 'sellwriter' // SellWriter (long-side)
  | 'quote'
  | 'accept'
  | 'cancel'
  | 'exercise'
  | 'reclaim';

export interface OptionsOrderModalData {
  intent: OptionsIntent;
  // optional defaults
  defaultAssetToken?: string;
  defaultQuoteToken?: string;

  // context defaults (for positions / market prefill)
  defaultMarketKey?: string; // bytes32
  defaultOptionType?: 0 | 1;
  defaultStrikePrice?: bigint;
  defaultOptionExpiry?: bigint;
  defaultSizeHuman?: string; // human units of asset token
}



// ---------------- NFT Spot ----------------
export type NftSpotIntent = 'place' | 'quote' | 'accept' | 'cancel';

export interface NftSpotOrderModalData {
  intent: NftSpotIntent;
  order?: any;
  defaultSide?: 0 | 1;
  defaultNft?: string;
  defaultTokenId?: string;
  defaultQuoteToken?: string;
  defaultPriceHuman?: string;
  defaultMarketKey?: string;
}

// ---------------- Binary Options ----------------
export type BinaryOptionsIntent = 'place' | 'quote' | 'accept' | 'cancel' | 'claim' | 'reclaim';

export interface BinaryOptionsOrderModalData {
  intent: BinaryOptionsIntent;
  defaultMarketKey?: string;
  defaultIntent?: 0 | 1 | 2;
  defaultPayoutHuman?: string;
  defaultPriceHuman?: string;
}

// ---------------- Margin Options ----------------
export type MarginOptionsIntent = 'place' | 'quote' | 'accept' | 'cancel' | 'claim' | 'reclaim';
export interface MarginOptionsOrderModalData { intent: MarginOptionsIntent; defaultMarketKey?: string; defaultIntent?: 0 | 1 | 2 | 3; defaultSizeHuman?: string; defaultPriceHuman?: string; }

// ---------------- Futures ----------------
export type FuturesIntent = 'buy' | 'sell' | 'quote' | 'cancel';

export interface FuturesOrderModalData {
  intent: FuturesIntent;
  defaultMarketKey?: string;
  defaultPriceHuman?: string;
  defaultAmountHuman?: string;
}

// ---------------- Lending ----------------
export type LendingIntent = 'place' | 'lend' | 'borrow' | 'rollover' | 'cancel' | 'repay' | 'redeem' | 'claim';

export interface LendingOrderModalData {
  intent: LendingIntent;

  // Current lending modal fields
  marketKey?: string | null;
  marketLabel?: string | null;
  riskLevel?: number | null;
  marketExpiry?: number | bigint | null;
  defaultSide?: 0 | 1;
  defaultPrincipalHuman?: string;
  defaultAprHuman?: string;
  maxLtvBps?: number | null;
  liquidationLtvBps?: number | null;
  riskTierConfigs?: Array<{ riskLevel: number; maxLtvBps: number | null; liquidationLtvBps: number | null }>;

  // Forward-compatible aliases used by the lending draft service and inline launchers
  defaultMarketKey?: string;
  defaultMarketLabel?: string;
  defaultBorrowToken?: string;
  defaultMarketExpiry?: number;
  defaultRiskLevel?: number;
  defaultOrderExpiry?: number;
  defaultOrderId?: string;
  defaultBondIndex?: string;
  defaultAmountHuman?: string;
  defaultRatePercent?: string;
  defaultClaimAction?: 'initial' | 'supplemental';
  repayMarketKey?: string;
  repayMarketLabel?: string;
  selectedAccountType?: 'normal' | 'lending' | null;
  selectedAccountLabel?: string | null;
}
