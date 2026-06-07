export const CONTRACT_BUILD = "production" as const;
export const DEPLOYMENT_ENVIRONMENT = "mainnet" as const;
export const DEPLOYMENT_CHAIN_ID = "1" as const;
export const DEPLOYMENT_UPDATED_AT = "2026-06-06T08:35:14.591Z" as const;

export const DEPLOYED_ADDRESSES = {
  "sethxToken": "0xd603b12f7458d44ddf30e48e72c640c9b6f9d61f",
  "founderTokenTimelocks": [
    {
      "id": "founder-1-63072000s",
      "founderIndex": 0,
      "beneficiary": "0x313F940b838919b23166aa2d705E3c447D26AFF7",
      "releaseDelaySeconds": "63072000",
      "releaseTime": "1843502111",
      "allocationBps": "350",
      "allocation": "35000000000000000000000000",
      "address": "0x0eb8ad5a29e8b0b9d8bc881b0616cdfd18dbab5c"
    },
    {
      "id": "founder-1-157680000s",
      "founderIndex": 0,
      "beneficiary": "0x313F940b838919b23166aa2d705E3c447D26AFF7",
      "releaseDelaySeconds": "157680000",
      "releaseTime": "1938110111",
      "allocationBps": "350",
      "allocation": "35000000000000000000000000",
      "address": "0xcfce437e96446cd267a2065fb061e7bb84ba9ee9"
    },
    {
      "id": "founder-2-63072000s",
      "founderIndex": 1,
      "beneficiary": "0x9E8f482B2d55e62a8DF0DDB89D96912DDaC73f71",
      "releaseDelaySeconds": "63072000",
      "releaseTime": "1843502111",
      "allocationBps": "350",
      "allocation": "35000000000000000000000000",
      "address": "0x7ecb3cfe513fc5d50dfd1e692eb238b9ac16e4ba"
    },
    {
      "id": "founder-2-157680000s",
      "founderIndex": 1,
      "beneficiary": "0x9E8f482B2d55e62a8DF0DDB89D96912DDaC73f71",
      "releaseDelaySeconds": "157680000",
      "releaseTime": "1938110111",
      "allocationBps": "350",
      "allocation": "35000000000000000000000000",
      "address": "0x79db98abb1010fb4ac01a3190ad0e58c86b280e5"
    },
    {
      "id": "founder-3-63072000s",
      "founderIndex": 2,
      "beneficiary": "0x114D075560F21e90C8d3340abc804A3900157dA1",
      "releaseDelaySeconds": "63072000",
      "releaseTime": "1843502111",
      "allocationBps": "350",
      "allocation": "35000000000000000000000000",
      "address": "0x32bb020af61c9989cf548cea9e1535f832fd264e"
    },
    {
      "id": "founder-3-157680000s",
      "founderIndex": 2,
      "beneficiary": "0x114D075560F21e90C8d3340abc804A3900157dA1",
      "releaseDelaySeconds": "157680000",
      "releaseTime": "1938110111",
      "allocationBps": "350",
      "allocation": "35000000000000000000000000",
      "address": "0x919ed980d36c4731bbae285c738384178eb545b2"
    }
  ],
  "treasuryAuthority": "0x5c396c7d1ac1701c37ea696a4589a9b1ed5352f7",
  "protocolTreasury": "0xf11d44d2e793e3d30509bc8c2a224398b27b61ef",
  "sethxTimelock": "0x5fa4E0674Dff940A07f097195De83Dfd14257e48",
  "sethxGovernor": "0x85b887426f7B27Fba11DbD94c722a70242A81691",
  "accountRegistry": "0x38D4F2F307657Cc6972711fb1cA52071E9805e12",
  "sethxVault": "0x2D598EEe72cBEAf2Fa020D1c068051D4801Ba3D4",
  "priceManager": "0xA712C58cF895E7e61b58cfdFE0d8114e89348466",
  "feeManager": "0x3ed08Faf6b891f2Ca2736248bEd3A0E913cdcbeE",
  "tokenSpotOrderBook": "0x772785E3F84Ee14341FddCD6196ad0Daa977ed32",
  "nftSpotOrderBook": "0x87935d67FfEA9179d8B308b579409aF23C119D3F",
  "optionContract": "0xf549EE616B30fd128dC11797Bdb0E0664697A428",
  "optionsOrderBook": "0x53a30A181F680575E5f0e5E37258d890087dA724",
  "binaryMarginOptionContract": "0x3A7C03648081f0aCDe8bcD6436A2D286c6C297ae",
  "binaryMarginOptionsOrderBook": "0xD94CF444314279A88FEc8167912B9eE4310bbaFb",
  "marginOptionContract": "0x79fC4fA292c5451c0e6ff22EC3fe249CBECCf344",
  "marginOptionsOrderBook": "0xBCcC49F3FDf0b3da79DFf8cc7a947Fccd3954529",
  "futuresPositionStore": "0x9648BEb66cA9f1c1Dfdc432B68730d11f1313A36",
  "futuresContract": "0x46977c7125Df736F16822aad14C7499A33A157fa",
  "futuresOrderBook": "0xFF842278cdBDA0Be408aFb657712EC194CfA14E6",
  "lendingContract": "0xC9B4Afe942F1cfBb20fBf28D32d4218162e0Eccb",
  "lendingOrderBook": "0x51572293e989e1B5b1C58b497ad5De8d99997638",
  "optionsValuationAdapter": "0x1dBd8b5e93579F12126E95970bF557EA94064b8e",
  "futuresValuationAdapter": "0x8691Cef4452Fa8B62858954e9946E1BC0a0366FD",
  "valuationModule": "0x1ED0b607F3bc504a956fdEB56eB16B6917593DcD",
  "riskModule": "0x546b9fC3960437271EceEcEfed0afD443bA22A13",
  "liquidationEngine": "0x22E5584D24A7aEf3E372498E6B4D012d290c3A08",
  "accountFactory": "0x599298246488e79e30b73f083a980F1561F1E347",
  "lendingAccountFactory": "0xA0481fF3Be07142A860fbB5BeD6d79C5bb2eC17D",
  "treasuryPaymentsModule": "0xC4416a553bbe06C2aFbf367801F7CF12a3d864D9",
  "treasuryVaultModule": "0xdAEcA5ad0CeE6d197039CDAF3fEF25ea3edd7879",
  "treasuryTradeModule": "0x0f240f8e833A10eC00B05F182093b12b0573C868",
  "treasuryFuturesMaintenanceModule": "0x06A3326D6a77488ad7AE1e5E010AbF075966C589",
  "sethxFeeConversionOracle": "0xF6CC59b7086C7AD12b1989EbeCF313222567181C",
  "usdcToken": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  "usdcEthFeed": "0x986b5E1e1755e3C2440e960477f25201B0a8bbD4",
  "usdcEthOracle": "0x6786D468D6d1Eb1461Ac80d61058270Cca67d9E2",
  "passiveFuturesSnapshotPublisher": "0x6AF55Bc18D06368f8D7D13d6e2f36B3A42F596A4",
  "passiveFuturesPoolFactory": "0xa17784eC210E72d2612eaBdB1A1691101fDD92cE",
  "previousTreasuryTradeModule": "0xAFC436afFe98164d36de81AACaAce6EbD2954Ea7"
} as const;

export const DEPLOYED_CONTRACTS = [
  {
    "addressKey": "sethxToken",
    "instanceKey": "SethxToken",
    "contractName": "SethxToken",
    "address": "0xd603b12f7458d44ddf30e48e72c640c9b6f9d61f",
    "label": "sethxToken",
    "source": "deployment.addresses"
  },
  {
    "addressKey": "treasuryAuthority",
    "instanceKey": "TreasuryAuthority",
    "contractName": "TreasuryAuthority",
    "address": "0x5c396c7d1ac1701c37ea696a4589a9b1ed5352f7",
    "label": "treasuryAuthority",
    "source": "deployment.addresses"
  },
  {
    "addressKey": "protocolTreasury",
    "instanceKey": "ProtocolTreasury",
    "contractName": "ProtocolTreasury",
    "address": "0xf11d44d2e793e3d30509bc8c2a224398b27b61ef",
    "label": "protocolTreasury",
    "source": "deployment.addresses"
  },
  {
    "addressKey": "sethxTimelock",
    "instanceKey": "SethxTimelock",
    "contractName": "SethxTimelock",
    "address": "0x5fa4E0674Dff940A07f097195De83Dfd14257e48",
    "label": "sethxTimelock",
    "source": "deployment.addresses"
  },
  {
    "addressKey": "sethxGovernor",
    "instanceKey": "SethxGovernor",
    "contractName": "SethxGovernor",
    "address": "0x85b887426f7B27Fba11DbD94c722a70242A81691",
    "label": "sethxGovernor",
    "source": "deployment.addresses"
  },
  {
    "addressKey": "accountRegistry",
    "instanceKey": "AccountRegistry",
    "contractName": "AccountRegistry",
    "address": "0x38D4F2F307657Cc6972711fb1cA52071E9805e12",
    "label": "accountRegistry",
    "source": "deployment.addresses"
  },
  {
    "addressKey": "sethxVault",
    "instanceKey": "SethxVault",
    "contractName": "SethxVault",
    "address": "0x2D598EEe72cBEAf2Fa020D1c068051D4801Ba3D4",
    "label": "sethxVault",
    "source": "deployment.addresses"
  },
  {
    "addressKey": "priceManager",
    "instanceKey": "PriceManager",
    "contractName": "PriceManager",
    "address": "0xA712C58cF895E7e61b58cfdFE0d8114e89348466",
    "label": "priceManager",
    "source": "deployment.addresses"
  },
  {
    "addressKey": "feeManager",
    "instanceKey": "FeeManager",
    "contractName": "FeeManager",
    "address": "0x3ed08Faf6b891f2Ca2736248bEd3A0E913cdcbeE",
    "label": "feeManager",
    "source": "deployment.addresses"
  },
  {
    "addressKey": "tokenSpotOrderBook",
    "instanceKey": "TokenSpotOrderBook",
    "contractName": "TokenSpotOrderBook",
    "address": "0x772785E3F84Ee14341FddCD6196ad0Daa977ed32",
    "label": "tokenSpotOrderBook",
    "source": "deployment.addresses"
  },
  {
    "addressKey": "nftSpotOrderBook",
    "instanceKey": "NFTSpotOrderBook",
    "contractName": "NFTSpotOrderBook",
    "address": "0x87935d67FfEA9179d8B308b579409aF23C119D3F",
    "label": "nftSpotOrderBook",
    "source": "deployment.addresses"
  },
  {
    "addressKey": "optionContract",
    "instanceKey": "OptionContract",
    "contractName": "OptionContract",
    "address": "0xf549EE616B30fd128dC11797Bdb0E0664697A428",
    "label": "optionContract",
    "source": "deployment.addresses"
  },
  {
    "addressKey": "optionsOrderBook",
    "instanceKey": "OptionsOrderBook",
    "contractName": "OptionsOrderBook",
    "address": "0x53a30A181F680575E5f0e5E37258d890087dA724",
    "label": "optionsOrderBook",
    "source": "deployment.addresses"
  },
  {
    "addressKey": "binaryMarginOptionContract",
    "instanceKey": "BinaryMarginOptionContract",
    "contractName": "BinaryMarginOptionContract",
    "address": "0x3A7C03648081f0aCDe8bcD6436A2D286c6C297ae",
    "label": "binaryMarginOptionContract",
    "source": "deployment.addresses"
  },
  {
    "addressKey": "binaryMarginOptionsOrderBook",
    "instanceKey": "BinaryMarginOptionsOrderBook",
    "contractName": "BinaryMarginOptionsOrderBook",
    "address": "0xD94CF444314279A88FEc8167912B9eE4310bbaFb",
    "label": "binaryMarginOptionsOrderBook",
    "source": "deployment.addresses"
  },
  {
    "addressKey": "marginOptionContract",
    "instanceKey": "MarginOptionContract",
    "contractName": "MarginOptionContract",
    "address": "0x79fC4fA292c5451c0e6ff22EC3fe249CBECCf344",
    "label": "marginOptionContract",
    "source": "deployment.addresses"
  },
  {
    "addressKey": "marginOptionsOrderBook",
    "instanceKey": "MarginOptionsOrderBook",
    "contractName": "MarginOptionsOrderBook",
    "address": "0xBCcC49F3FDf0b3da79DFf8cc7a947Fccd3954529",
    "label": "marginOptionsOrderBook",
    "source": "deployment.addresses"
  },
  {
    "addressKey": "futuresPositionStore",
    "instanceKey": "FuturesPositionStore",
    "contractName": "FuturesPositionStore",
    "address": "0x9648BEb66cA9f1c1Dfdc432B68730d11f1313A36",
    "label": "futuresPositionStore",
    "source": "deployment.addresses"
  },
  {
    "addressKey": "futuresContract",
    "instanceKey": "FuturesContract",
    "contractName": "FuturesContract",
    "address": "0x46977c7125Df736F16822aad14C7499A33A157fa",
    "label": "futuresContract",
    "source": "deployment.addresses"
  },
  {
    "addressKey": "futuresOrderBook",
    "instanceKey": "FuturesOrderBook",
    "contractName": "FuturesOrderBook",
    "address": "0xFF842278cdBDA0Be408aFb657712EC194CfA14E6",
    "label": "futuresOrderBook",
    "source": "deployment.addresses"
  },
  {
    "addressKey": "lendingContract",
    "instanceKey": "LendingContract",
    "contractName": "LendingContract",
    "address": "0xC9B4Afe942F1cfBb20fBf28D32d4218162e0Eccb",
    "label": "lendingContract",
    "source": "deployment.addresses"
  },
  {
    "addressKey": "lendingOrderBook",
    "instanceKey": "LendingOrderBook",
    "contractName": "LendingOrderBook",
    "address": "0x51572293e989e1B5b1C58b497ad5De8d99997638",
    "label": "lendingOrderBook",
    "source": "deployment.addresses"
  },
  {
    "addressKey": "optionsValuationAdapter",
    "instanceKey": "OptionsValuationAdapter",
    "contractName": "OptionsValuationAdapter",
    "address": "0x1dBd8b5e93579F12126E95970bF557EA94064b8e",
    "label": "optionsValuationAdapter",
    "source": "deployment.addresses"
  },
  {
    "addressKey": "futuresValuationAdapter",
    "instanceKey": "FuturesValuationAdapter",
    "contractName": "FuturesValuationAdapter",
    "address": "0x8691Cef4452Fa8B62858954e9946E1BC0a0366FD",
    "label": "futuresValuationAdapter",
    "source": "deployment.addresses"
  },
  {
    "addressKey": "valuationModule",
    "instanceKey": "ValuationModule",
    "contractName": "ValuationModule",
    "address": "0x1ED0b607F3bc504a956fdEB56eB16B6917593DcD",
    "label": "valuationModule",
    "source": "deployment.addresses"
  },
  {
    "addressKey": "riskModule",
    "instanceKey": "RiskModule",
    "contractName": "RiskModule",
    "address": "0x546b9fC3960437271EceEcEfed0afD443bA22A13",
    "label": "riskModule",
    "source": "deployment.addresses"
  },
  {
    "addressKey": "liquidationEngine",
    "instanceKey": "LiquidationEngine",
    "contractName": "LiquidationEngine",
    "address": "0x22E5584D24A7aEf3E372498E6B4D012d290c3A08",
    "label": "liquidationEngine",
    "source": "deployment.addresses"
  },
  {
    "addressKey": "accountFactory",
    "instanceKey": "AccountFactory",
    "contractName": "AccountFactory",
    "address": "0x599298246488e79e30b73f083a980F1561F1E347",
    "label": "accountFactory",
    "source": "deployment.addresses"
  },
  {
    "addressKey": "lendingAccountFactory",
    "instanceKey": "LendingAccountFactory",
    "contractName": "LendingAccountFactory",
    "address": "0xA0481fF3Be07142A860fbB5BeD6d79C5bb2eC17D",
    "label": "lendingAccountFactory",
    "source": "deployment.addresses"
  },
  {
    "addressKey": "treasuryPaymentsModule",
    "instanceKey": "TreasuryPaymentsModule",
    "contractName": "TreasuryPaymentsModule",
    "address": "0xC4416a553bbe06C2aFbf367801F7CF12a3d864D9",
    "label": "treasuryPaymentsModule",
    "source": "deployment.addresses"
  },
  {
    "addressKey": "treasuryVaultModule",
    "instanceKey": "TreasuryVaultModule",
    "contractName": "TreasuryVaultModule",
    "address": "0xdAEcA5ad0CeE6d197039CDAF3fEF25ea3edd7879",
    "label": "treasuryVaultModule",
    "source": "deployment.addresses"
  },
  {
    "addressKey": "treasuryTradeModule",
    "instanceKey": "TreasuryTradeModule",
    "contractName": "TreasuryTradeModule",
    "address": "0x0f240f8e833A10eC00B05F182093b12b0573C868",
    "label": "treasuryTradeModule",
    "source": "deployment.addresses"
  },
  {
    "addressKey": "treasuryFuturesMaintenanceModule",
    "instanceKey": "TreasuryFuturesMaintenanceModule",
    "contractName": "TreasuryFuturesMaintenanceModule",
    "address": "0x06A3326D6a77488ad7AE1e5E010AbF075966C589",
    "label": "treasuryFuturesMaintenanceModule",
    "source": "deployment.addresses"
  },
  {
    "addressKey": "sethxFeeConversionOracle",
    "instanceKey": "SethxFeeConversionOracle",
    "contractName": "SethxFeeConversionOracle",
    "address": "0xF6CC59b7086C7AD12b1989EbeCF313222567181C",
    "label": "sethxFeeConversionOracle",
    "source": "deployment.addresses"
  },
  {
    "addressKey": "passiveFuturesSnapshotPublisher",
    "instanceKey": "PassiveFuturesSnapshotPublisher",
    "contractName": "PassiveFuturesSnapshotPublisher",
    "address": "0x6AF55Bc18D06368f8D7D13d6e2f36B3A42F596A4",
    "label": "passiveFuturesSnapshotPublisher",
    "source": "deployment.addresses"
  },
  {
    "addressKey": "passiveFuturesPoolFactory",
    "instanceKey": "PassiveFuturesPoolFactory",
    "contractName": "PassiveFuturesPoolFactory",
    "address": "0xa17784eC210E72d2612eaBdB1A1691101fDD92cE",
    "label": "passiveFuturesPoolFactory",
    "source": "deployment.addresses"
  },
  {
    "addressKey": "oracle.chainlinkEthOracles.BTC/ETH.oracle",
    "instanceKey": "BTCETHOracle",
    "contractName": "ChainlinkDirectEthPairOracle",
    "address": "0x973890649625573475dba1f54C16A453D7161028",
    "label": "BTC/ETH",
    "source": "deployment.oracle.chainlinkEthOracles",
    "metadata": {
      "pairName": "BTC/ETH",
      "symbol": "BTC",
      "tokenSymbol": "WBTC",
      "feedType": "ASSET_ETH",
      "feed": "0xdeb288F737066589598e9214E782fa5A8eD689e8",
      "ethUsdFeed": null,
      "token": "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599"
    }
  },
  {
    "addressKey": "oracle.chainlinkEthOracles.LINK/ETH.oracle",
    "instanceKey": "LINKETHOracle",
    "contractName": "ChainlinkDirectEthPairOracle",
    "address": "0x2547f566463C2EE6B72b61034596021df735CE11",
    "label": "LINK/ETH",
    "source": "deployment.oracle.chainlinkEthOracles",
    "metadata": {
      "pairName": "LINK/ETH",
      "symbol": "LINK",
      "tokenSymbol": "LINK",
      "feedType": "ASSET_ETH",
      "feed": "0xDC530D9457755926550b59e8ECcdaE7624181557",
      "ethUsdFeed": null,
      "token": "0x514910771AF9Ca656af840dff83E8264EcF986CA"
    }
  },
  {
    "addressKey": "oracle.chainlinkEthOracles.UNI/ETH.oracle",
    "instanceKey": "UNIETHOracle",
    "contractName": "ChainlinkCrossRateEthOracle",
    "address": "0x33648629fc1EaAC377A057ff7C76ac1eAAD35bDD",
    "label": "UNI/ETH",
    "source": "deployment.oracle.chainlinkEthOracles",
    "metadata": {
      "pairName": "UNI/ETH",
      "symbol": "UNI",
      "tokenSymbol": "UNI",
      "feedType": "ASSET_USD",
      "feed": "0x553303d460EE0afB37EdFf9bE42922D8FF63220e",
      "ethUsdFeed": "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
      "token": "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984"
    }
  },
  {
    "addressKey": "oracle.chainlinkEthOracles.AAVE/ETH.oracle",
    "instanceKey": "AAVEETHOracle",
    "contractName": "ChainlinkCrossRateEthOracle",
    "address": "0xdD84A0D493ca8564e9E57EC72871547283D7D2Db",
    "label": "AAVE/ETH",
    "source": "deployment.oracle.chainlinkEthOracles",
    "metadata": {
      "pairName": "AAVE/ETH",
      "symbol": "AAVE",
      "tokenSymbol": "AAVE",
      "feedType": "ASSET_USD",
      "feed": "0x547a514d5e3769680Ce22B2361c10Ea13619e8a9",
      "ethUsdFeed": "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
      "token": "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9"
    }
  },
  {
    "addressKey": "oracle.chainlinkEthOracles.LDO/ETH.oracle",
    "instanceKey": "LDOETHOracle",
    "contractName": "ChainlinkDirectEthPairOracle",
    "address": "0x20104997F2E294726669C766958Da1a5cf719ceB",
    "label": "LDO/ETH",
    "source": "deployment.oracle.chainlinkEthOracles",
    "metadata": {
      "pairName": "LDO/ETH",
      "symbol": "LDO",
      "tokenSymbol": "LDO",
      "feedType": "ASSET_ETH",
      "feed": "0x4e844125952D32AcdF339BE976c98E22F6F318dB",
      "ethUsdFeed": null,
      "token": "0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32"
    }
  },
  {
    "addressKey": "oracle.chainlinkEthOracles.DAI/ETH.oracle",
    "instanceKey": "DAIETHOracle",
    "contractName": "ChainlinkCrossRateEthOracle",
    "address": "0x26E94Ec0885D93880eb05830317b024054fb6e16",
    "label": "DAI/ETH",
    "source": "deployment.oracle.chainlinkEthOracles",
    "metadata": {
      "pairName": "DAI/ETH",
      "symbol": "DAI",
      "tokenSymbol": "DAI",
      "feedType": "ASSET_USD",
      "feed": "0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9",
      "ethUsdFeed": "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
      "token": "0x6B175474E89094C44Da98b954EedeAC495271d0F"
    }
  },
  {
    "addressKey": "oracle.chainlinkEthOracles.EUR/ETH.oracle",
    "instanceKey": "EURETHOracle",
    "contractName": "ChainlinkCrossRateEthOracle",
    "address": "0xABc9618ea1225fdB0315f7523851Da9E4dDe3FE3",
    "label": "EUR/ETH",
    "source": "deployment.oracle.chainlinkEthOracles",
    "metadata": {
      "pairName": "EUR/ETH",
      "symbol": "EUR",
      "tokenSymbol": null,
      "feedType": "ASSET_USD",
      "feed": "0xb49f677943BC038e9857d61E7d053CaA2C1734C1",
      "ethUsdFeed": "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
      "token": null
    }
  },
  {
    "addressKey": "oracle.chainlinkEthOracles.GBP/ETH.oracle",
    "instanceKey": "GBPETHOracle",
    "contractName": "ChainlinkCrossRateEthOracle",
    "address": "0x8c28eC77E3514d551A9016296B46A79650043290",
    "label": "GBP/ETH",
    "source": "deployment.oracle.chainlinkEthOracles",
    "metadata": {
      "pairName": "GBP/ETH",
      "symbol": "GBP",
      "tokenSymbol": null,
      "feedType": "ASSET_USD",
      "feed": "0x5c0Ab2d9b5a7ed9f470386e82BB36A3613cDd4b5",
      "ethUsdFeed": "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
      "token": null
    }
  },
  {
    "addressKey": "oracle.chainlinkEthOracles.JPY/ETH.oracle",
    "instanceKey": "JPYETHOracle",
    "contractName": "ChainlinkCrossRateEthOracle",
    "address": "0xc003122aD00C673838272385e3aa0dd2C4671795",
    "label": "JPY/ETH",
    "source": "deployment.oracle.chainlinkEthOracles",
    "metadata": {
      "pairName": "JPY/ETH",
      "symbol": "JPY",
      "tokenSymbol": null,
      "feedType": "ASSET_USD",
      "feed": "0xBcE206caE7f0ec07b545EddE332A47C2F75bbeb3",
      "ethUsdFeed": "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
      "token": null
    }
  },
  {
    "addressKey": "oracle.chainlinkEthOracles.CHF/ETH.oracle",
    "instanceKey": "CHFETHOracle",
    "contractName": "ChainlinkCrossRateEthOracle",
    "address": "0x277757Ca4B34De35037009690d8eACa6767060AC",
    "label": "CHF/ETH",
    "source": "deployment.oracle.chainlinkEthOracles",
    "metadata": {
      "pairName": "CHF/ETH",
      "symbol": "CHF",
      "tokenSymbol": null,
      "feedType": "ASSET_USD",
      "feed": "0x449d117117838fFA61263B61dA6301AA2a88B13A",
      "ethUsdFeed": "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
      "token": null
    }
  },
  {
    "addressKey": "oracle.chainlinkEthOracles.XAU/ETH.oracle",
    "instanceKey": "XAUETHOracle",
    "contractName": "ChainlinkCrossRateEthOracle",
    "address": "0x9aAb8E6912ea29B490CcBDedfdE165E194EbddFF",
    "label": "XAU/ETH",
    "source": "deployment.oracle.chainlinkEthOracles",
    "metadata": {
      "pairName": "XAU/ETH",
      "symbol": "XAU",
      "tokenSymbol": null,
      "feedType": "ASSET_USD",
      "feed": "0x214eD9Da11D2fbe465a6fc601a91E62EbEc1a0D6",
      "ethUsdFeed": "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
      "token": null
    }
  },
  {
    "addressKey": "oracle.chainlinkEthOracles.XAG/ETH.oracle",
    "instanceKey": "XAGETHOracle",
    "contractName": "ChainlinkCrossRateEthOracle",
    "address": "0x00C51B89EA0ac7eb369e307b60a8d2948211ebee",
    "label": "XAG/ETH",
    "source": "deployment.oracle.chainlinkEthOracles",
    "metadata": {
      "pairName": "XAG/ETH",
      "symbol": "XAG",
      "tokenSymbol": null,
      "feedType": "ASSET_USD",
      "feed": "0x379589227b15F1a12195D3f2d90bBc9F31f95235",
      "ethUsdFeed": "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
      "token": null
    }
  }
] as const;
