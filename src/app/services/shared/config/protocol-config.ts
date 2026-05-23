import { CONTRACT_ADDRESSES } from '../../../contracts/generated';
import { CURRENT_NETWORK_CONFIG } from '../../../constants/network.config';
import { ETH_ADDRESS } from '../../../constants/main.tokens';

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

export type FeatureAvailability = 'public' | 'wallet' | 'holder' | 'role' | 'coming-soon';

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
  cookieConsentVersion: string;
  analyticsEnabledByDefault: false;
  analyticsMeasurementId: string;
  noRampReason: string;
};

export type ProtocolLanguageConfig = {
  storageKey: string;
  defaultLanguage: 'en';
  supportedLanguages: readonly ['en', 'es', 'pt'];
  countryHints: Record<string, 'en' | 'es' | 'pt'>;
};

export type ProtocolAssistantConfig = {
  modes: readonly ['protocol', 'user-context', 'crypto-education'];
  knowledgeSources: string[];
  guardrails: string[];
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
    publicHome: '/';
    docs: '/docs';
    community: '/community';
    governanceInfo: '/protocol';
    protocolInfo: '/protocol';
    appRoot: '/app';
  };
  contracts: Record<string, string>;
  assets: ProtocolAssetConfig[];
  products: ProtocolProductConfig[];
  fees: ProtocolFeeConfig;
  compliance: ProtocolComplianceConfig;
  language: ProtocolLanguageConfig;
  assistant: ProtocolAssistantConfig;
};

const localContracts = CONTRACT_ADDRESSES.localhost as Record<string, string>;

export const PROTOCOL_CONFIG: ProtocolConfig = {
  appName: 'SETHX',
  currentNetwork: {
    name: CURRENT_NETWORK_CONFIG.name,
    chainId: CURRENT_NETWORK_CONFIG.id,
    nativeSymbol: CURRENT_NETWORK_CONFIG.nativeCurrency.symbol,
    explorerUrl: CURRENT_NETWORK_CONFIG.blockExplorers?.default.url ?? '',
  },
  routes: {
    publicHome: '/',
    docs: '/docs',
    community: '/community',
    governanceInfo: '/protocol',
    protocolInfo: '/protocol',
    appRoot: '/app',
  },
  contracts: localContracts,
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
      address: localContracts['SethxToken'] ?? '',
      decimals: 18,
      role: 'governance',
      enabled: true,
    },
    {
      symbol: 'MOCK-A',
      name: 'Mock ERC20 A',
      address: localContracts['MockERC20A'] ?? '',
      decimals: 18,
      role: 'mock',
      enabled: true,
    },
    {
      symbol: 'MOCK-B',
      name: 'Mock ERC20 B',
      address: localContracts['MockERC20B'] ?? '',
      decimals: 18,
      role: 'mock',
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
    note: 'Exact fees should be read from FeeManager and product contracts whenever a wallet/provider is available. These placeholders only support public copy and assistant scaffolding.',
    placeholders: {
      trading: 'Live contract read pending',
      settlement: 'Live contract read pending',
      treasury: 'Governance-controlled',
    },
  },
  compliance: {
    geoEndpoint: '/api/geo',
    blockedCountries: ['KP', 'IR', 'SY'],
    cookieConsentVersion: '2026-05-18-minimal-analytics',
    analyticsEnabledByDefault: false,
    analyticsMeasurementId: 'G-REPLACE_WITH_SETHX_ID',
    noRampReason:
      'The MVP does not sell crypto or provide a fiat ramp because that may require additional permits, banking relationships, and compliance operations.',
  },
  language: {
    storageKey: 'sethx.language',
    defaultLanguage: 'en',
    supportedLanguages: ['en', 'es', 'pt'],
    countryHints: {
      ES: 'es',
      MX: 'es',
      AR: 'es',
      CO: 'es',
      CL: 'es',
      PE: 'es',
      VE: 'es',
      EC: 'es',
      UY: 'es',
      PY: 'es',
      BO: 'es',
      CR: 'es',
      PA: 'es',
      DO: 'es',
      GT: 'es',
      HN: 'es',
      NI: 'es',
      SV: 'es',
      PR: 'es',
      BR: 'pt',
      PT: 'pt',
      AO: 'pt',
      MZ: 'pt',
      CV: 'pt',
      GW: 'pt',
      ST: 'pt',
      TL: 'pt',
    },
  },
  assistant: {
    modes: ['protocol', 'user-context', 'crypto-education'],
    knowledgeSources: [
      'Public docs and library pages',
      'Protocol configuration service',
      'Generated contract addresses and ABIs',
      'Live FeeManager reads',
      'Governance and treasury data services',
    ],
    guardrails: [
      'Answer protocol questions from configured facts and live reads where available.',
      'Explain crypto and investment concepts educationally, not as personalized financial advice.',
      'Do not claim fiat ramp, broker, or crypto sale functionality exists in the MVP.',
      'Respect country, wallet, role, and voting-power restrictions before suggesting actions.',
    ],
  },
};
