import type { SethxClientEnvironment } from './environment.model';

export const environment: SethxClientEnvironment = {
  name: 'production',
  production: true,

  chainId: 1,
  chainName: 'Ethereum',
  nativeCurrencySymbol: 'ETH',
  rpcUrl: '',
  blockExplorerUrl: 'https://etherscan.io',

  siteUrl: 'https://sethx.com',
  governanceUrl: 'https://governance.sethx.com',
  githubUrl: 'https://github.com/sethx-community',
  clientRepositoryUrl: 'https://github.com/sethx-community/sethx-client',
  releaseUrl: 'https://github.com/sethx-community/sethx-client/releases',

  reownProjectId: '',

  contracts: {},
};
