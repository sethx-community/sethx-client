export type ContractName =
  | 'SethxToken'
  | 'MockERC1155'
  | 'MockERC20A'
  | 'MockERC20B'
  | 'MockERC20C'
  | 'MockERC721'
  | 'MockOracle'
  | 'BtcUsdChainlinkOracle'
  | 'EthUsdChainlinkOracle'
  | 'LinkUsdChainlinkOracle'
  | 'SethxFeeConversionOracle'
  | 'TimelockControllerWrapper'
  | 'DerivativeSettlementOracle'
  | 'QuoteCollateralOracle'
  | 'PriceManager'
  | 'AccountRegistry'
  | 'TreasuryAuthority'
  | 'FeeManager'
  | 'ProtocolTreasury'
  | 'SethxVault'
  | 'AccountFactory'
  | 'BinaryMarginOptionContract'
  | 'FuturesContract'
  | 'SethxGovernor'
  | 'LendingContract'
  | 'MarginOptionContract'
  | 'NFTSpotOrderBook'
  | 'OptionContract'
  | 'TokenSpotOrderBook'
  | 'TreasuryPaymentsModule'
  | 'TreasuryVaultModule'
  | 'BinaryMarginOptionsOrderBook'
  | 'FuturesOrderBook'
  | 'LendingOrderBook'
  | 'MarginOptionsOrderBook'
  | 'OptionsOrderBook'
  | 'SettlementManager'
  | 'TreasuryTradeModule'
  | 'FuturesValuationAdapter'
  | 'ValuationModule'
  | 'LiquidationEngine'
  | 'PassiveFuturesPoolFactory'
  | 'RiskModule'
  | 'OptionsValuationAdapter'
  | 'LendingAccountFactory';

export const CONTRACT_NAMES = [
  'AccountRegistry',
  'AccountFactory',
  'PriceManager',
  'SethxVault',
  'FeeManager',
  'TokenSpotOrderBook',
  'OptionContract',
  'OptionsOrderBook',
  'FuturesContract',
  'FuturesOrderBook',
  'BinaryMarginOptionContract',
  'BinaryMarginOptionsOrderBook',
  'MarginOptionContract',
  'MarginOptionsOrderBook',
  'NFTSpotOrderBook',
  'SettlementManager',
  'ProtocolTreasury',
  'TreasuryAuthority',
  'LendingContract',
  'LendingOrderBook',
  'LendingAccountFactory',
  'LiquidationEngine',
  'RiskModule',
  'ValuationModule',
  'FuturesValuationAdapter',
  'OptionsValuationAdapter',
  'PassiveFuturesPoolFactory',
  'SethxToken',
  'MockERC20A',
  'MockERC20B',
  'MockERC20C',
  'MockERC721',
  'MockERC1155',
  'MockOracle',
  'BtcUsdChainlinkOracle',
  'EthUsdChainlinkOracle',
  'LinkUsdChainlinkOracle',
  'SethxFeeConversionOracle',
] as const satisfies readonly ContractName[];
