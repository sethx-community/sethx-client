export type ContractName =
  'SethxToken'
  | 'FounderTokenTimelock'
  | 'TreasuryAuthority'
  | 'ProtocolTreasury'
  | 'SethxTimelock'
  | 'SethxGovernor'
  | 'AccountRegistry'
  | 'SethxVault'
  | 'PriceManager'
  | 'FeeManager'
  | 'TokenSpotOrderBook'
  | 'NFTSpotOrderBook'
  | 'OptionContract'
  | 'OptionsOrderBook'
  | 'BinaryMarginOptionContract'
  | 'BinaryMarginOptionsOrderBook'
  | 'MarginOptionContract'
  | 'MarginOptionsOrderBook'
  | 'FuturesContract'
  | 'FuturesOrderBook'
  | 'SettlementManager'
  | 'LendingContract'
  | 'LendingOrderBook'
  | 'OptionsValuationAdapter'
  | 'FuturesValuationAdapter'
  | 'ValuationModule'
  | 'RiskModule'
  | 'LiquidationEngine'
  | 'AccountFactory'
  | 'LendingAccountFactory'
  | 'TreasuryPaymentsModule'
  | 'TreasuryVaultModule'
  | 'TreasuryTradeModule'
  | 'SethxFeeConversionOracle'
  | 'PassiveFuturesSnapshotPublisher'
  | 'PassiveFuturesPoolFactory'
;

export const CONTRACT_NAMES = [
  'SethxToken',
  'FounderTokenTimelock',
  'TreasuryAuthority',
  'ProtocolTreasury',
  'SethxTimelock',
  'SethxGovernor',
  'AccountRegistry',
  'SethxVault',
  'PriceManager',
  'FeeManager',
  'TokenSpotOrderBook',
  'NFTSpotOrderBook',
  'OptionContract',
  'OptionsOrderBook',
  'BinaryMarginOptionContract',
  'BinaryMarginOptionsOrderBook',
  'MarginOptionContract',
  'MarginOptionsOrderBook',
  'FuturesContract',
  'FuturesOrderBook',
  'SettlementManager',
  'LendingContract',
  'LendingOrderBook',
  'OptionsValuationAdapter',
  'FuturesValuationAdapter',
  'ValuationModule',
  'RiskModule',
  'LiquidationEngine',
  'AccountFactory',
  'LendingAccountFactory',
  'TreasuryPaymentsModule',
  'TreasuryVaultModule',
  'TreasuryTradeModule',
  'SethxFeeConversionOracle',
  'PassiveFuturesSnapshotPublisher',
  'PassiveFuturesPoolFactory',
] as const satisfies readonly ContractName[];
