import type { SethxClientEnvironment } from "./environment.model";

export const environment: SethxClientEnvironment = {
  name: "production",
  production: true,

  chainId: 1,
  chainName: "Ethereum",
  nativeCurrencySymbol: "ETH",
  rpcUrl: "https://ethereum-rpc.publicnode.com",
  websocketRpcUrl: "",
  blockExplorerUrl: "https://etherscan.io",

  siteUrl: "https://sethx.com",
  governanceUrl: "https://governance.sethx.eth.limo",
  githubUrl: "https://github.com/sethx-community",
  clientRepositoryUrl: "https://github.com/sethx-community/sethx-client",
  releaseUrl: "https://github.com/sethx-community/sethx-client/releases",

  reownProjectId: "a06102eecc532a455cd608c2934914c2",
  sethxGraphUrl: "https://graph.sethx.com/graph",
};
