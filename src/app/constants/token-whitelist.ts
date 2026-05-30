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
] as const satisfies readonly WhitelistedTokenConfig[];
