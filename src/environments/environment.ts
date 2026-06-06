import type { SethxClientEnvironment } from './environment.model';

export const environment: SethxClientEnvironment = {
  name: 'local',
  production: false,

  chainId: 31337,
  chainName: 'Hardhat Local',
  nativeCurrencySymbol: 'ETH',
  rpcUrl: 'http://127.0.0.1:8545',
  websocketRpcUrl: 'ws://127.0.0.1:8545',
  blockExplorerUrl: '',

  siteUrl: 'http://localhost:4200',
  governanceUrl: 'http://localhost:4201',
  githubUrl: 'https://github.com/sethx-community',
  clientRepositoryUrl: 'https://github.com/sethx-community/sethx-client',
  releaseUrl: 'https://github.com/sethx-community/sethx-client/releases',

  reownProjectId: 'a06102eecc532a455cd608c2934914c2',
  sethxGraphUrl: '',

};
