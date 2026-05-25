import { environment } from "../../environments/environment";
import { NetworkName, NETWORKS } from "./networks";

export const CURRENT_NETWORK: NetworkName =
  environment.name === "local"
    ? "localhost"
    : environment.name === "testnet"
      ? "sepolia"
      : "mainnet";

const BASE_NETWORK = NETWORKS[CURRENT_NETWORK];

export const CURRENT_NETWORK_CONFIG = {
  ...BASE_NETWORK,
  id: environment.chainId,
  name: environment.chainName,
  nativeCurrency: {
    ...BASE_NETWORK.nativeCurrency,
    symbol: environment.nativeCurrencySymbol,
  },
  rpcUrls: {
    default: {
      http: [
        environment.rpcUrl ||
          BASE_NETWORK.rpcUrls.default.http[0] ||
          BASE_NETWORK.rpcUrls["public"].http[0],
      ],
    },
    public: {
      http: [BASE_NETWORK.rpcUrls["public"].http[0] || environment.rpcUrl],
    },
  },
  blockExplorers: {
    default: {
      name: BASE_NETWORK.blockExplorers?.default.name ?? environment.chainName,
      url:
        environment.blockExplorerUrl ||
        BASE_NETWORK.blockExplorers?.default.url ||
        "",
    },
  },
};
