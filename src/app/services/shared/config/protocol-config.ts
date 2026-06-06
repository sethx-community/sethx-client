import { CURRENT_NETWORK_CONFIG } from '../../../constants/network.config';
import { ETH_ADDRESS } from '../../../constants/main.tokens';
import { CONTRACT_ADDRESSES } from '../../../contracts/generated/addresses';

export type ProductKey =
  | 'accounts'
  | 'tokens'
  | 'tokenSpot'
  | 'nftSpot'
  | 'futures'
  | 'options'
  | 'binaryOptions'
  | 'marginOptions'
  | 'lending'
  | 'treasury'
  | 'governance';

export type FeatureAvailability = 'wallet' | 'holder' | 'role' | 'coming-soon';

export type ProtocolAssetConfig = {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  role: 'native' | 'governance' | 'mock' | 'collateral';
  enabled: boolean;
};

export type ProtocolProductConfig = {
  key: ProductKey;
  label: string;
  route: string;
  availability: FeatureAvailability;
  enabled: boolean;
  summary: string;
};

export type ProtocolFeeConfig = {
  source: 'contract' | 'static-placeholder';
  note: string;
  placeholders: Record<string, string>;
};

export type ProtocolComplianceConfig = {
  geoEndpoint: string;
  blockedCountries: string[];
  noRampReason: string;
};



export type ProtocolConfig = {
  appName: string;
  currentNetwork: {
    name: string;
    chainId: number;
    nativeSymbol: string;
    explorerUrl: string;
  };
  routes: {
    home: '/home';
    accounts: '/accounts';
    assets: '/assets';
    protocol: '/protocol';
    fees: '/fees';
  };
  contracts: Record<string, string>;
  assets: ProtocolAssetConfig[];
  products: ProtocolProductConfig[];
  fees: ProtocolFeeConfig;
  compliance: ProtocolComplianceConfig;
};

const configuredContracts = CONTRACT_ADDRESSES as unknown as Record<string, string>;

export const PROTOCOL_CONFIG: ProtocolConfig = {
  appName: 'SETHX',
  currentNetwork: {
    name: CURRENT_NETWORK_CONFIG.name,
    chainId: CURRENT_NETWORK_CONFIG.id,
    nativeSymbol: CURRENT_NETWORK_CONFIG.nativeCurrency.symbol,
    explorerUrl: CURRENT_NETWORK_CONFIG.blockExplorers?.default.url ?? '',
  },
  routes: {
    home: '/home',
    accounts: '/accounts',
    assets: '/assets',
    protocol: '/protocol',
    fees: '/fees',
  },
  contracts: configuredContracts,
  assets: [
    {
      symbol: 'ETH',
      name: 'Ether',
      address: ETH_ADDRESS,
      decimals: 18,
      role: 'native',
      enabled: true,
    },
    {
      symbol: 'SETHX',
      name: 'SETHX governance token',
      address: configuredContracts['SethxToken'] ?? '',
      decimals: 18,
      role: 'governance',
      enabled: true,
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      decimals: 6,
      role: 'collateral',
      enabled: true,
    },
  ],
  products: [
    {
      key: 'accounts',
      label: 'Accounts',
      route: '/app/accounts',
      availability: 'wallet',
      enabled: true,
      summary: 'Create and manage protocol accounts and vault access.',
    },
    {
      key: 'tokens',
      label: 'Tokens',
      route: '/app/tokens',
      availability: 'wallet',
      enabled: true,
      summary: 'View supported assets and token balances.',
    },
    {
      key: 'tokenSpot',
      label: 'Token Spot',
      route: '/app/token-spot',
      availability: 'wallet',
      enabled: true,
      summary: 'Token spot order book trading.',
    },
    {
      key: 'nftSpot',
      label: 'NFT Spot',
      route: '/app/nft-spot',
      availability: 'wallet',
      enabled: true,
      summary: 'NFT spot order book trading.',
    },
    {
      key: 'futures',
      label: 'Futures',
      route: '/app/futures',
      availability: 'wallet',
      enabled: true,
      summary: 'Futures contracts and order book trading.',
    },
    {
      key: 'options',
      label: 'Options',
      route: '/app/options',
      availability: 'wallet',
      enabled: true,
      summary: 'Options contracts and order book trading.',
    },
    {
      key: 'binaryOptions',
      label: 'Binary Options',
      route: '/app/binary-options',
      availability: 'wallet',
      enabled: true,
      summary: 'Binary option products.',
    },
    {
      key: 'marginOptions',
      label: 'Margin Options',
      route: '/app/margin-options',
      availability: 'wallet',
      enabled: true,
      summary: 'Margin option products.',
    },
    {
      key: 'lending',
      label: 'Lending',
      route: '/app/lending',
      availability: 'wallet',
      enabled: true,
      summary: 'Lending and borrowing order book.',
    },
    {
      key: 'treasury',
      label: 'Treasury',
      route: '/app/treasury',
      availability: 'role',
      enabled: true,
      summary: 'Treasury balances, permissions, and role-gated actions.',
    },
    {
      key: 'governance',
      label: 'Governance',
      route: '/protocol',
      availability: 'holder',
      enabled: true,
      summary: 'Proposal, voting, and governance state.',
    },
  ],
  fees: {
    source: 'contract',
    note: 'Exact fees should be read from FeeManager and product contracts whenever a wallet/provider is available. These placeholders only support client display while live reads are unavailable.',
    placeholders: {
      trading: 'Live contract read pending',
      settlement: 'Live contract read pending',
      treasury: 'Governance-controlled',
    },
  },
  compliance: {
    geoEndpoint: '/api/geo',
    blockedCountries: ['KP', 'IR', 'SY'],
    noRampReason:
      'The MVP does not sell crypto or provide a fiat ramp because that may require additional permits, banking relationships, and compliance operations.',
  },
};
