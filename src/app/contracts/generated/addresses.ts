import { IGNITION_DEPLOYED_ADDRESSES } from './deployed-addresses';

export const CONTRACT_ADDRESSES = {
  localhost: {
    SethxToken: IGNITION_DEPLOYED_ADDRESSES['FeeManagerModule#SethxToken'],
    MockERC1155: IGNITION_DEPLOYED_ADDRESSES['MockERC1155Module#MockERC1155'],
    MockERC20A: IGNITION_DEPLOYED_ADDRESSES['MockERC20AModule#MockERC20A'],
    MockERC20B: IGNITION_DEPLOYED_ADDRESSES['MockERC20BModule#MockERC20B'],
    MockERC20C: IGNITION_DEPLOYED_ADDRESSES['MockERC20CModule#MockERC20C'],
    MockERC721: IGNITION_DEPLOYED_ADDRESSES['MockERC721Module#MockERC721'],
    MockOracle: IGNITION_DEPLOYED_ADDRESSES['MockOracleModule#MockOracle'],
    BtcUsdChainlinkOracle:
      IGNITION_DEPLOYED_ADDRESSES['ChainlinkMarketOraclesModule#BtcUsdChainlinkOracle'],
    EthUsdChainlinkOracle:
      IGNITION_DEPLOYED_ADDRESSES['ChainlinkMarketOraclesModule#EthUsdChainlinkOracle'],
    LinkUsdChainlinkOracle:
      IGNITION_DEPLOYED_ADDRESSES['ChainlinkMarketOraclesModule#LinkUsdChainlinkOracle'],
    SethxFeeConversionOracle:
      IGNITION_DEPLOYED_ADDRESSES['SethxFeeConversionOracleModule#SethxFeeConversionOracle'],
    SethxTimelock:
      IGNITION_DEPLOYED_ADDRESSES['TimelockModule#SethxTimelock'] ??
      IGNITION_DEPLOYED_ADDRESSES['TimelockModule#TimelockControllerWrapper'],
    TimelockControllerWrapper:
      IGNITION_DEPLOYED_ADDRESSES['TimelockModule#SethxTimelock'] ??
      IGNITION_DEPLOYED_ADDRESSES['TimelockModule#TimelockControllerWrapper'],
    DerivativeSettlementOracle:
      IGNITION_DEPLOYED_ADDRESSES[
        'ValuationMockOraclesModule#DerivativeSettlementOracle'
      ],
    QuoteCollateralOracle:
      IGNITION_DEPLOYED_ADDRESSES[
        'ValuationMockOraclesModule#QuoteCollateralOracle'
      ],
    PriceManager:
      IGNITION_DEPLOYED_ADDRESSES['PriceManagerModule#PriceManager'],
    AccountRegistry:
      IGNITION_DEPLOYED_ADDRESSES['RegistryModule#AccountRegistry'],
    TreasuryAuthority:
      IGNITION_DEPLOYED_ADDRESSES['TreasuryAuthorityModule#TreasuryAuthority'],
    FeeManager: IGNITION_DEPLOYED_ADDRESSES['FeeManagerModule#FeeManager'],
    ProtocolTreasury:
      IGNITION_DEPLOYED_ADDRESSES['ProtocolTreasuryModule#ProtocolTreasury'],
    SethxVault: IGNITION_DEPLOYED_ADDRESSES['VaultModule#SethxVault'],
    AccountFactory:
      IGNITION_DEPLOYED_ADDRESSES['AccountFactoryModule#AccountFactory'],
    BinaryMarginOptionContract:
      IGNITION_DEPLOYED_ADDRESSES[
        'BinaryMarginOptionContractModule#BinaryMarginOptionContract'
      ],
    FuturesContract:
      IGNITION_DEPLOYED_ADDRESSES['FuturesContractModule#FuturesContract'],
    SethxGovernor: IGNITION_DEPLOYED_ADDRESSES['GovernorModule#SethxGovernor'],
    LendingContract:
      IGNITION_DEPLOYED_ADDRESSES['LendingContractModule#LendingContract'],
    MarginOptionContract:
      IGNITION_DEPLOYED_ADDRESSES[
        'MarginOptionContractModule#MarginOptionContract'
      ],
    NFTSpotOrderBook:
      IGNITION_DEPLOYED_ADDRESSES['NFTSpotCoreModule#NFTSpotOrderBook'],
    OptionContract:
      IGNITION_DEPLOYED_ADDRESSES['OptionsCoreModule#OptionContract'],
    TokenSpotOrderBook:
      IGNITION_DEPLOYED_ADDRESSES['SpotCoreModule#TokenSpotOrderBook'],
    TreasuryPaymentsModule:
      IGNITION_DEPLOYED_ADDRESSES[
        'TreasuryPaymentsModuleModule#TreasuryPaymentsModule'
      ],
    TreasuryVaultModule:
      IGNITION_DEPLOYED_ADDRESSES[
        'TreasuryVaultModuleModule#TreasuryVaultModule'
      ],
    BinaryMarginOptionsOrderBook:
      IGNITION_DEPLOYED_ADDRESSES[
        'BinaryMarginOptionsOrderBookModule#BinaryMarginOptionsOrderBook'
      ],
    FuturesOrderBook:
      IGNITION_DEPLOYED_ADDRESSES['FuturesOrderBookModule#FuturesOrderBook'],
    LendingOrderBook:
      IGNITION_DEPLOYED_ADDRESSES['LendingOrderBookModule#LendingOrderBook'],
    MarginOptionsOrderBook:
      IGNITION_DEPLOYED_ADDRESSES[
        'MarginOptionsOrderBookModule#MarginOptionsOrderBook'
      ],
    OptionsOrderBook:
      IGNITION_DEPLOYED_ADDRESSES['OptionsCoreModule#OptionsOrderBook'],
    SettlementManager:
      IGNITION_DEPLOYED_ADDRESSES['SettlementManagerModule#SettlementManager'],
    TreasuryTradeModule:
      IGNITION_DEPLOYED_ADDRESSES[
        'TreasuryTradeModuleModule#TreasuryTradeModule'
      ],
    FuturesValuationAdapter:
      IGNITION_DEPLOYED_ADDRESSES[
        'ValuationAdaptersModule#FuturesValuationAdapter'
      ],
    ValuationModule:
      IGNITION_DEPLOYED_ADDRESSES['ValuationModuleModule#ValuationModule'],
    LiquidationEngine:
      IGNITION_DEPLOYED_ADDRESSES['LiquidationEngineModule#LiquidationEngine'],
    PassiveFuturesSnapshotPublisher:
      IGNITION_DEPLOYED_ADDRESSES[
        'PassiveFuturesSnapshotPublisherModule#PassiveFuturesSnapshotPublisher'
      ],
    PassiveFuturesPoolFactory:
      IGNITION_DEPLOYED_ADDRESSES[
        'PassiveFuturesPoolFactoryModule#PassiveFuturesPoolFactory'
      ],
    RiskModule: IGNITION_DEPLOYED_ADDRESSES['RiskModuleModule#RiskModule'],
    OptionsValuationAdapter:
      IGNITION_DEPLOYED_ADDRESSES[
        'ValuationAdaptersModule#OptionsValuationAdapter'
      ],
    LendingAccountFactory:
      IGNITION_DEPLOYED_ADDRESSES[
        'LendingAccountFactoryModule#LendingAccountFactory'
      ],
  },
  mainnet: {},
  sepolia: {},
  arbitrum: {},
} as const;
