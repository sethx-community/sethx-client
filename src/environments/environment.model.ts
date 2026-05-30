export type SethxClientEnvironmentName = 'local' | 'testnet' | 'production';

export interface SethxClientEnvironment {
  name: SethxClientEnvironmentName;
  production: boolean;

  chainId: number;
  chainName: string;
  nativeCurrencySymbol: string;
  rpcUrl: string;
  websocketRpcUrl?: string;
  blockExplorerUrl: string;

  siteUrl: string;
  governanceUrl: string;
  githubUrl: string;
  clientRepositoryUrl: string;
  releaseUrl: string;

  reownProjectId: string;

}
