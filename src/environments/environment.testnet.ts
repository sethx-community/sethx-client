import type { SethxClientEnvironment } from "./environment.model";

export const environment: SethxClientEnvironment = {
  name: "testnet",
  production: false,

  chainId: 11155111,
  chainName: "Sepolia",
  nativeCurrencySymbol: "ETH",
  rpcUrl: "https://ethereum-sepolia-rpc.publicnode.com",
  websocketRpcUrl: "",
  blockExplorerUrl: "https://sepolia.etherscan.io",

  siteUrl: "https://sethx.com",
  governanceUrl: "https://governance-testnet.sethx.com",
  githubUrl: "https://github.com/sethx-community",
  clientRepositoryUrl: "https://github.com/sethx-community/sethx-client",
  releaseUrl: "https://github.com/sethx-community/sethx-client/releases",

  reownProjectId: "a06102eecc532a455cd608c2934914c2",
  sethxGraphUrl: "",
};
