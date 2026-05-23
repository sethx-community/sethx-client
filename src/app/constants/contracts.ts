import { NetworkName } from './networks';

type ContractName =
  | 'AccountRegistry'
  | 'AccountFactory'
  | 'PriceManager'
  | 'Vault'
  | 'FeeManager'
  | 'TokenSpotOrderBook'
  | 'OptionContract'
  | 'OptionsOrderBook'
  // Futures
  | 'FuturesContract'
  | 'FuturesOrderBook';

type ContractAddresses = Record<ContractName, string>;

export const deployed_addresses = {
  'MockERC1155Module#MockERC1155': '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  'MockERC20AModule#MockERC20A': '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
  'MockERC20BModule#MockERC20B': '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
  'MockERC20CModule#MockERC20C': '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
  'MockERC721Module#MockERC721': '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
  'MockOracleModule#MockOracle': '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707',
  'PriceManagerModule#PriceManager':
    '0x0165878A594ca255338adfa4d48449f69242Eb8F',
  'RegistryModule#AccountRegistry':
    '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853',
  'SethxTokenModule#SethxToken': '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6',
  'TimelockModule#TimelockControllerWrapper':
    '0x8A791620dd6260079BF849Dc5567aDC3F2FdC318',
  'FeeManagerModule#FeeManager': '0x610178dA211FEF7D417bC0e6FeD39F05609AD788',
  'FuturesContractModule#FuturesContract':
    '0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e',
  'VaultModule#SethxVault': '0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82',
  'AccountFactoryModule#AccountFactory':
    '0x9A676e781A523b5d0C0e43731313A708CB607508',
  'BinaryMarginOptionContractModule#BinaryMarginOptionContract':
    '0x0B306BF915C4d645ff596e518fAf3F9669b97016',
  'FuturesOrderBookModule#FuturesOrderBook':
    '0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1',
  'MarginOptionContractModule#MarginOptionContract':
    '0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE',
  'NFTSpotCoreModule#NFTSpotOrderBook':
    '0x68B1D87F95878fE05B998F19b66F4baba5De1aed',
  'OptionsCoreModule#OptionContract':
    '0x3Aa5ebB10DC797CAC828524e59A333d0A371443c',
  'SettlementManagerModule#SettlementManager':
    '0xc6e7DF5E7b4f2A278906862b61205850344D4e7d',
  'SpotCoreModule#TokenSpotOrderBook':
    '0x59b670e9fA9D0A427751Af201D676719a970857b',
  'BinaryMarginOptionsOrderBookModule#BinaryMarginOptionsOrderBook':
    '0x4ed7c70F96B99c776995fB64377f0d4aB3B0e1C1',
  'MarginOptionsOrderBookModule#MarginOptionsOrderBook':
    '0x7a2088a1bFc9d81c55368AE168C2C02570cB814F',
  'OptionsCoreModule#OptionsOrderBook':
    '0x67d269191c92Caf3cD7723F116c85e6E9bf55933',
  'TreasuryModule#Treasury': '0xc3e53F4d16Ae77Db1c982e75a937B9f60FE63690',
  'GovernorModule#SethxGovernor': '0xf5059a5D33d5853360D16C683c16e67980206f36',
};
export const CONTRACTS: Record<NetworkName, ContractAddresses> = {
  mainnet: {
    AccountRegistry: '0xMainnetRegistryAddress',
    AccountFactory: '0xMainnetFactoryAddress',
    PriceManager: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    Vault: '0xMainnetFactoryAddress',
    FeeManager: '0xMainnetFactoryAddress',
    TokenSpotOrderBook: '0xMainnetFactoryAddress',
    OptionContract: '0xMainnetOptionContractAddress',
    OptionsOrderBook: '0xMainnetOptionsOrderBookAddress',
    FuturesContract: '0xMainnetFuturesContractAddress',
    FuturesOrderBook: '0xMainnetFuturesOrderBookAddress',
  },
  arbitrum: {
    AccountRegistry: '0xArbitrumRegistryAddress',
    AccountFactory: '0xArbitrumFactoryAddress',
    PriceManager: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    Vault: '0xMainnetFactoryAddress',
    FeeManager: '0xMainnetFactoryAddress',
    TokenSpotOrderBook: '0xMainnetFactoryAddress',
    OptionContract: '0xMainnetOptionContractAddress',
    OptionsOrderBook: '0xMainnetOptionsOrderBookAddress',
    FuturesContract: '0xArbitrumFuturesContractAddress',
    FuturesOrderBook: '0xArbitrumFuturesOrderBookAddress',
  },
  localhost: {
    AccountRegistry: deployed_addresses['RegistryModule#AccountRegistry'],
    AccountFactory: deployed_addresses['AccountFactoryModule#AccountFactory'],
    PriceManager: deployed_addresses['PriceManagerModule#PriceManager'],
    Vault: deployed_addresses['VaultModule#SethxVault'],
    FeeManager: deployed_addresses['FeeManagerModule#FeeManager'],
    TokenSpotOrderBook: deployed_addresses['SpotCoreModule#TokenSpotOrderBook'],
    OptionContract: deployed_addresses['OptionsCoreModule#OptionContract'],
    OptionsOrderBook: deployed_addresses['OptionsCoreModule#OptionsOrderBook'],
    FuturesContract:
      deployed_addresses['FuturesContractModule#FuturesContract'],
    FuturesOrderBook:
      deployed_addresses['FuturesOrderBookModule#FuturesOrderBook'],
  },
};
