export type WhitelistedTokenConfig = {
  symbol: string;
  address: string;
  note?: string;
};

// UI trust markers only. These addresses should be reviewed before production builds.
// Main protocol tokens are treated as trusted separately by TokenService.
export const WHITELISTED_TOKENS = [
  {
    symbol: 'USDC',
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    note: 'Ethereum mainnet USDC',
  },
  {
    symbol: 'WETH',
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    note: 'Ethereum mainnet WETH',
  },
  {
    symbol: 'WBTC',
    address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    note: 'Ethereum mainnet Wrapped Bitcoin',
  },
  {
    symbol: 'LINK',
    address: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
    note: 'Ethereum mainnet Chainlink',
  },
  {
    symbol: 'UNI',
    address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    note: 'Ethereum mainnet Uniswap',
  },
  {
    symbol: 'AAVE',
    address: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
    note: 'Ethereum mainnet Aave',
  },
  {
    symbol: 'LDO',
    address: '0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32',
    note: 'Ethereum mainnet Lido DAO',
  },
  {
    symbol: 'DAI',
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    note: 'Ethereum mainnet Dai',
  },
] as const satisfies readonly WhitelistedTokenConfig[];
