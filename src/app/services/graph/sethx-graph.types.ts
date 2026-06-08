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

export type RecentGraphBlockRange = {
  fromBlock: number;
  toBlock: number;
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

export type RecentGraphActivityProgress = {
  currentWindow?: RecentGraphBlockRange;
  scannedRange?: RecentGraphBlockRange;
  scannedWindows: number;
  activities: RecentGraphActivity[];
};

export type RecentGraphActivityOptions = {
  lookbackSeconds?: number;
  onProgress?: (progress: RecentGraphActivityProgress) => void;
};

export type RecentGraphActivityResult = {
  status: SethxGraphStatus;
  error?: string;
  activities: RecentGraphActivity[];
  scannedRange?: RecentGraphBlockRange;
  scannedWindows?: number;
  lookbackSeconds?: number;
};
