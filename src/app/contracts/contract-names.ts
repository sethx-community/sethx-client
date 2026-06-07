export type ContractName =
  'AccountFactory'
  | 'AccountRegistry'
  | 'BinaryMarginOptionContract'
  | 'BinaryMarginOptionsOrderBook'
  | 'ChainlinkCrossRateEthOracle'
  | 'ChainlinkDirectEthPairOracle'
  | 'FeeManager'
  | 'FuturesContract'
  | 'FuturesOrderBook'
  | 'FuturesPositionStore'
  | 'FuturesValuationAdapter'
  | 'LendingAccountFactory'
  | 'LendingContract'
  | 'LendingOrderBook'
  | 'LiquidationEngine'
  | 'MarginOptionContract'
  | 'MarginOptionsOrderBook'
  | 'NFTSpotOrderBook'
  | 'OptionContract'
  | 'OptionsOrderBook'
  | 'OptionsValuationAdapter'
  | 'PassiveFuturesPoolFactory'
  | 'PassiveFuturesSnapshotPublisher'
  | 'PriceManager'
  | 'ProtocolTreasury'
  | 'RiskModule'
  | 'SethxFeeConversionOracle'
  | 'SethxGovernor'
  | 'SethxTimelock'
  | 'SethxToken'
  | 'SethxVault'
  | 'TokenSpotOrderBook'
  | 'TreasuryAuthority'
  | 'TreasuryFuturesMaintenanceModule'
  | 'TreasuryPaymentsModule'
  | 'TreasuryTradeModule'
  | 'TreasuryVaultModule'
  | 'ValuationModule'
;

export const CONTRACT_NAMES = [
  'AccountFactory',
  'AccountRegistry',
  'BinaryMarginOptionContract',
  'BinaryMarginOptionsOrderBook',
  'ChainlinkCrossRateEthOracle',
  'ChainlinkDirectEthPairOracle',
  'FeeManager',
  'FuturesContract',
  'FuturesOrderBook',
  'FuturesPositionStore',
  'FuturesValuationAdapter',
  'LendingAccountFactory',
  'LendingContract',
  'LendingOrderBook',
  'LiquidationEngine',
  'MarginOptionContract',
  'MarginOptionsOrderBook',
  'NFTSpotOrderBook',
  'OptionContract',
  'OptionsOrderBook',
  'OptionsValuationAdapter',
  'PassiveFuturesPoolFactory',
  'PassiveFuturesSnapshotPublisher',
  'PriceManager',
  'ProtocolTreasury',
  'RiskModule',
  'SethxFeeConversionOracle',
  'SethxGovernor',
  'SethxTimelock',
  'SethxToken',
  'SethxVault',
  'TokenSpotOrderBook',
  'TreasuryAuthority',
  'TreasuryFuturesMaintenanceModule',
  'TreasuryPaymentsModule',
  'TreasuryTradeModule',
  'TreasuryVaultModule',
  'ValuationModule',
] as const satisfies readonly ContractName[];
