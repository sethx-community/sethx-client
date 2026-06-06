export type SethxGraphStatus = 'ready' | 'not-configured' | 'error';

export type GraphOraclePriceUpdate = {
  id: string;
  feed: string;
  roundId: string;
  normalizedPrice: string;
  feedTimestamp: string;
  blockNumber: number;
  timestamp: string;
};

export type GraphExchangeMatch = {
  id: string;
  orderBook: string;
  marketType: string;
  makerOrderId: string;
  takerOrderId: string;
  takerUser: string;
  payoutAmount: string;
  premiumAmount: string;
  totalFeeCharged: string;
  blockNumber: number;
  timestamp: string;
};

export type RecentGraphActivity = {
  id: string;
  kind: 'oracle' | 'trade';
  title: string;
  ticker: string;
  subtitle: string;
  primaryValue: string;
  secondaryValue: string;
  blockNumber: number;
  timestamp: number;
  explorerLabel: string;
};

export type RecentGraphActivityResult = {
  status: SethxGraphStatus;
  error?: string;
  activities: RecentGraphActivity[];
};
