// Minimal ABIs used by the frontend for Futures.
// If you have full build artifacts, replace these with the generated ABIs.

export const FUTURES_CONTRACT_ABI = [
  {
    inputs: [
      {
        internalType: 'address',
        name: '_accountRegistry',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [],
    name: 'AccessControlBadConfirmation',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        internalType: 'bytes32',
        name: 'neededRole',
        type: 'bytes32',
      },
    ],
    name: 'AccessControlUnauthorizedAccount',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'marketKey',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'reason',
        type: 'string',
      },
    ],
    name: 'ImbalanceBufferFunded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'marketKey',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'ImbalanceBufferUsed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'marketKey',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'isLong',
        type: 'bool',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'size',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'rawPrice',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'seizedMarginToLiqBuffer',
        type: 'uint256',
      },
    ],
    name: 'Liquidated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'marketKey',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'reason',
        type: 'string',
      },
    ],
    name: 'LiquidationBufferFunded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'marketKey',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'LiquidationBufferUsed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'marketKey',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'isLong',
        type: 'bool',
      },
      {
        indexed: false,
        internalType: 'int256',
        name: 'delta',
        type: 'int256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'newMargin',
        type: 'uint256',
      },
    ],
    name: 'MarginAdjusted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'marketKey',
        type: 'bytes32',
      },
    ],
    name: 'MarketClosed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'marketKey',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'oracle',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'quoteToken',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'ticker',
        type: 'string',
      },
    ],
    name: 'MarketCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'marketKey',
        type: 'bytes32',
      },
    ],
    name: 'MarketOpened',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'marketKey',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'rawPrice',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'blockNumber',
        type: 'uint256',
      },
    ],
    name: 'MarketPriceUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'marketKey',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'initialMarginBps',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'maintenanceMarginBps',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'multiplier',
        type: 'uint256',
      },
    ],
    name: 'MarketRiskParamsUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'marketKey',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'isLong',
        type: 'bool',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'creditAmount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'newMargin',
        type: 'uint256',
      },
    ],
    name: 'PositionCredited',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'marketKey',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'sizeDelta',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'marginDelta',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'isLong',
        type: 'bool',
      },
    ],
    name: 'PositionOpened',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'marketKey',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'reduction',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'isLong',
        type: 'bool',
      },
    ],
    name: 'PositionReduced',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'marketKey',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'isLong',
        type: 'bool',
      },
      {
        indexed: false,
        internalType: 'int256',
        name: 'pnlApplied',
        type: 'int256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'newMargin',
        type: 'uint256',
      },
    ],
    name: 'PositionSettled',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'marketKey',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'isLong',
        type: 'bool',
      },
      {
        indexed: false,
        internalType: 'int256',
        name: 'pnlTheoretical',
        type: 'int256',
      },
      {
        indexed: false,
        internalType: 'int256',
        name: 'pnlApplied',
        type: 'int256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'maxLossCollectible',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'uncollectedLoss',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'newMargin',
        type: 'uint256',
      },
    ],
    name: 'PositionSettledCapped',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'marketKey',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'newSize',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'newIsLong',
        type: 'bool',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'mergedMargin',
        type: 'uint256',
      },
    ],
    name: 'PositionsNetted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'previousAdminRole',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'newAdminRole',
        type: 'bytes32',
      },
    ],
    name: 'RoleAdminChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
    ],
    name: 'RoleGranted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
    ],
    name: 'RoleRevoked',
    type: 'event',
  },
  {
    inputs: [],
    name: 'DEFAULT_ADMIN_ROLE',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'GOVERNOR_ROLE',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'MARKET_MANAGER_ROLE',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'ORDERBOOK_ROLE',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'SETTLEMENT_MANAGER_ROLE',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'accountRegistry',
    outputs: [
      {
        internalType: 'contract IAccountRegistry',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'marketKey',
        type: 'bytes32',
      },
      {
        internalType: 'bool',
        name: 'isLong',
        type: 'bool',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'addMargin',
    outputs: [
      {
        internalType: 'uint256',
        name: 'newMargin',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        internalType: 'bytes32',
        name: 'marketKey',
        type: 'bytes32',
      },
      {
        internalType: 'bool',
        name: 'isLong',
        type: 'bool',
      },
      {
        internalType: 'int256',
        name: 'delta',
        type: 'int256',
      },
    ],
    name: 'adjustMargin',
    outputs: [
      {
        internalType: 'uint256',
        name: 'newMargin',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'marketKey',
        type: 'bytes32',
      },
      {
        internalType: 'uint256',
        name: 'markRawPrice',
        type: 'uint256',
      },
    ],
    name: 'canSkipLiquidationScan',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'marketKey',
        type: 'bytes32',
      },
    ],
    name: 'closeMarket',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'ticker',
        type: 'string',
      },
      {
        internalType: 'address',
        name: 'oracle',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'initialMarginBps',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'maintenanceMarginBps',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'multiplier',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'initialPriceRaw',
        type: 'uint256',
      },
    ],
    name: 'createMarket',
    outputs: [
      {
        internalType: 'bytes32',
        name: 'marketKey',
        type: 'bytes32',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'oracle',
        type: 'address',
      },
    ],
    name: 'deriveMarketKey',
    outputs: [
      {
        internalType: 'bytes32',
        name: 'marketKey',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: 'baseToken',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'quoteToken',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'baseToken',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'quoteToken',
        type: 'address',
      },
    ],
    name: 'deriveMarketKeyFromTokens',
    outputs: [
      {
        internalType: 'bytes32',
        name: 'marketKey',
        type: 'bytes32',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'marketKey',
        type: 'bytes32',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        internalType: 'string',
        name: 'reason',
        type: 'string',
      },
    ],
    name: 'fundImbalanceBuffer',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'marketKey',
        type: 'bytes32',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        internalType: 'string',
        name: 'reason',
        type: 'string',
      },
    ],
    name: 'fundLiquidationBuffer',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'marketKey',
        type: 'bytes32',
      },
    ],
    name: 'getApproxMinMarginPerUnit',
    outputs: [
      {
        internalType: 'uint256',
        name: 'minLong',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'minShort',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'marketKey',
        type: 'bytes32',
      },
    ],
    name: 'getLongHolders',
    outputs: [
      {
        internalType: 'address[]',
        name: '',
        type: 'address[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'marketKey',
        type: 'bytes32',
      },
    ],
    name: 'getMarket',
    outputs: [
      {
        components: [
          {
            internalType: 'string',
            name: 'ticker',
            type: 'string',
          },
          {
            internalType: 'address',
            name: 'oracle',
            type: 'address',
          },
          {
            internalType: 'uint8',
            name: 'oraclePriceDecimals',
            type: 'uint8',
          },
          {
            internalType: 'address',
            name: 'quoteToken',
            type: 'address',
          },
          {
            internalType: 'uint8',
            name: 'quoteTokenDecimals',
            type: 'uint8',
          },
          {
            internalType: 'uint256',
            name: 'initialMarginBps',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'maintenanceMarginBps',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'multiplier',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'lastSettlementPrice',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'lastSettlementBlock',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'minMarginPerUnitLongNorm',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'minMarginPerUnitShortNorm',
            type: 'uint256',
          },
        ],
        internalType: 'struct FuturesContract.MarketConfig',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getMarketKeys',
    outputs: [
      {
        internalType: 'bytes32[]',
        name: '',
        type: 'bytes32[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'marketKey',
        type: 'bytes32',
      },
    ],
    name: 'getOpenInterestImbalance',
    outputs: [
      {
        internalType: 'int256',
        name: '',
        type: 'int256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        internalType: 'bytes32',
        name: 'marketKey',
        type: 'bytes32',
      },
      {
        internalType: 'bool',
        name: 'isLong',
        type: 'bool',
      },
    ],
    name: 'getPosition',
    outputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'size',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'margin',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'marginPerUnitNorm',
            type: 'uint256',
          },
          {
            internalType: 'bool',
            name: 'isActive',
            type: 'bool',
          },
        ],
        internalType: 'struct FuturesContract.Position',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
    ],
    name: 'getRoleAdmin',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'marketKey',
        type: 'bytes32',
      },
    ],
    name: 'getShortHolders',
    outputs: [
      {
        internalType: 'address[]',
        name: '',
        type: 'address[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'grantRole',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'hasRole',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    name: 'imbalanceBuffer',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'marketKey',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        internalType: 'bool',
        name: 'isLong',
        type: 'bool',
      },
      {
        internalType: 'uint256',
        name: 'markRawPrice',
        type: 'uint256',
      },
    ],
    name: 'liquidatePosition',
    outputs: [
      {
        internalType: 'uint256',
        name: 'seizedMargin',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'liqSize',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    name: 'liquidationBuffer',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'marketKey',
        type: 'bytes32',
      },
      {
        internalType: 'uint256',
        name: 'size',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'markRawPrice',
        type: 'uint256',
      },
    ],
    name: 'maintenanceRequiredAtMark',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        internalType: 'bytes32',
        name: 'marketKey',
        type: 'bytes32',
      },
      {
        internalType: 'bool',
        name: 'isLong',
        type: 'bool',
      },
      {
        internalType: 'uint256',
        name: 'markRawPrice',
        type: 'uint256',
      },
    ],
    name: 'marginLiveAtMark',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    name: 'marketActive',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'marketCount',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'index',
        type: 'uint256',
      },
    ],
    name: 'marketKeyAt',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    name: 'markets',
    outputs: [
      {
        internalType: 'string',
        name: 'ticker',
        type: 'string',
      },
      {
        internalType: 'address',
        name: 'oracle',
        type: 'address',
      },
      {
        internalType: 'uint8',
        name: 'oraclePriceDecimals',
        type: 'uint8',
      },
      {
        internalType: 'address',
        name: 'quoteToken',
        type: 'address',
      },
      {
        internalType: 'uint8',
        name: 'quoteTokenDecimals',
        type: 'uint8',
      },
      {
        internalType: 'uint256',
        name: 'initialMarginBps',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'maintenanceMarginBps',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'multiplier',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'lastSettlementPrice',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'lastSettlementBlock',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'minMarginPerUnitLongNorm',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'minMarginPerUnitShortNorm',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'marketKey',
        type: 'bytes32',
      },
    ],
    name: 'netPositions',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        internalType: 'bytes32',
        name: 'marketKey',
        type: 'bytes32',
      },
    ],
    name: 'netPositionsFor',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'marketKey',
        type: 'bytes32',
      },
      {
        internalType: 'uint256',
        name: 'rawPrice',
        type: 'uint256',
      },
    ],
    name: 'normalizePrice',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        internalType: 'bytes32',
        name: 'marketKey',
        type: 'bytes32',
      },
      {
        internalType: 'uint256',
        name: 'sizeDelta',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'marginDelta',
        type: 'uint256',
      },
      {
        internalType: 'bool',
        name: 'isLong',
        type: 'bool',
      },
    ],
    name: 'openPosition',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    name: 'positions',
    outputs: [
      {
        internalType: 'uint256',
        name: 'size',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'margin',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'marginPerUnitNorm',
        type: 'uint256',
      },
      {
        internalType: 'bool',
        name: 'isActive',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'priceManager',
    outputs: [
      {
        internalType: 'contract PriceManager',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        internalType: 'bytes32',
        name: 'marketKey',
        type: 'bytes32',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        internalType: 'bool',
        name: 'isLong',
        type: 'bool',
      },
    ],
    name: 'reducePosition',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: 'callerConfirmation',
        type: 'address',
      },
    ],
    name: 'renounceRole',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'marketKey',
        type: 'bytes32',
      },
    ],
    name: 'reopenMarket',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'revokeRole',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'marketKey',
        type: 'bytes32',
      },
      {
        internalType: 'uint256',
        name: 'newPriceRaw',
        type: 'uint256',
      },
    ],
    name: 'setLastSettlementPrice',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'marketKey',
        type: 'bytes32',
      },
      {
        internalType: 'uint256',
        name: 'newInitialMarginBps',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'newMaintenanceMarginBps',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'newMultiplier',
        type: 'uint256',
      },
    ],
    name: 'setMarketRiskParams',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'orderBook',
        type: 'address',
      },
    ],
    name: 'setOrderBook',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_priceManager',
        type: 'address',
      },
    ],
    name: 'setPriceManager',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'settlementManager',
        type: 'address',
      },
    ],
    name: 'setSettlementManager',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'marketKey',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        internalType: 'bool',
        name: 'isLong',
        type: 'bool',
      },
      {
        internalType: 'uint256',
        name: 'newSettlementRaw',
        type: 'uint256',
      },
    ],
    name: 'settlePosition',
    outputs: [
      {
        internalType: 'int256',
        name: 'pnlApplied',
        type: 'int256',
      },
      {
        internalType: 'uint256',
        name: 'newMargin',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'marketKey',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        internalType: 'bool',
        name: 'isLong',
        type: 'bool',
      },
      {
        internalType: 'uint256',
        name: 'newSettlementRaw',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'maxLossCollectible',
        type: 'uint256',
      },
    ],
    name: 'settlePositionCapped',
    outputs: [
      {
        internalType: 'int256',
        name: 'pnlApplied',
        type: 'int256',
      },
      {
        internalType: 'uint256',
        name: 'newMargin',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'uncollectedLoss',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'marketKey',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        internalType: 'bool',
        name: 'isLong',
        type: 'bool',
      },
      {
        internalType: 'uint256',
        name: 'creditAmount',
        type: 'uint256',
      },
    ],
    name: 'settlePositionCredit',
    outputs: [
      {
        internalType: 'uint256',
        name: 'newMargin',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes4',
        name: 'interfaceId',
        type: 'bytes4',
      },
    ],
    name: 'supportsInterface',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    name: 'totalLongs',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    name: 'totalShorts',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'marketKey',
        type: 'bytes32',
      },
      {
        internalType: 'bool',
        name: 'isLong',
        type: 'bool',
      },
      {
        internalType: 'uint256',
        name: 'size',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'markRawPrice',
        type: 'uint256',
      },
    ],
    name: 'unrealizedPnLAtMark',
    outputs: [
      {
        internalType: 'int256',
        name: '',
        type: 'int256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'marketKey',
        type: 'bytes32',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'useImbalanceBuffer',
    outputs: [
      {
        internalType: 'uint256',
        name: 'used',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'marketKey',
        type: 'bytes32',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'useLiquidationBuffer',
    outputs: [
      {
        internalType: 'uint256',
        name: 'used',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'marketKey',
        type: 'bytes32',
      },
      {
        internalType: 'bool',
        name: 'isLong',
        type: 'bool',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'withdrawMargin',
    outputs: [
      {
        internalType: 'uint256',
        name: 'newMargin',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

export const FUTURES_ORDERBOOK_ABI = [
  {
    inputs: [
      {
        internalType: 'address',
        name: '_futures',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_vault',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_feeManager',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_accountRegistry',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [],
    name: 'AccessControlBadConfirmation',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        internalType: 'bytes32',
        name: 'neededRole',
        type: 'bytes32',
      },
    ],
    name: 'AccessControlUnauthorizedAccount',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'orderId',
        type: 'uint256',
      },
    ],
    name: 'OrderCancelled',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'orderId',
        type: 'uint256',
      },
    ],
    name: 'OrderExpiredCancelled',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'takerOrderId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'makerOrderId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'execPrice',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'feeChargedThisStep',
        type: 'uint256',
      },
    ],
    name: 'OrderMatched',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'takerOrderId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'marketKey',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'execPrice',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'enum FuturesOrderBook.Side',
        name: 'syntheticMakerSide',
        type: 'uint8',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'feeChargedThisStep',
        type: 'uint256',
      },
    ],
    name: 'OrderMatchedWithSynthetic',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'orderId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'marketKey',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'enum FuturesOrderBook.Side',
        name: 'side',
        type: 'uint8',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'price',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'expiry',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'feeToken',
        type: 'address',
      },
    ],
    name: 'OrderPlaced',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'previousAdminRole',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'newAdminRole',
        type: 'bytes32',
      },
    ],
    name: 'RoleAdminChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
    ],
    name: 'RoleGranted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
    ],
    name: 'RoleRevoked',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'marketKey',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'filled',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'remaining',
        type: 'uint256',
      },
    ],
    name: 'SyntheticConsumed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'marketKey',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'active',
        type: 'bool',
      },
      {
        indexed: false,
        internalType: 'enum FuturesOrderBook.Side',
        name: 'makerSide',
        type: 'uint8',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'price',
        type: 'uint256',
      },
    ],
    name: 'SyntheticReplaced',
    type: 'event',
  },
  {
    inputs: [],
    name: 'ADMIN_ROLE',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'DEFAULT_ADMIN_ROLE',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'MAX_ORDERS_PER_BLOCK',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'MAX_UNMATCHED_ORDERS',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'SETTLEMENT_MANAGER_ROLE',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'accountRegistry',
    outputs: [
      {
        internalType: 'contract IAccountRegistry',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'buyBook',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'orderId',
        type: 'uint256',
      },
    ],
    name: 'cancelOrder',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'feeManager',
    outputs: [
      {
        internalType: 'contract FeeManager',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'futures',
    outputs: [
      {
        internalType: 'contract FuturesContract',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'marketKey',
        type: 'bytes32',
      },
      {
        internalType: 'bool',
        name: 'wantBuyBook',
        type: 'bool',
      },
    ],
    name: 'getBook',
    outputs: [
      {
        internalType: 'uint256[]',
        name: '',
        type: 'uint256[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
    ],
    name: 'getRoleAdmin',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
    ],
    name: 'getUserOrders',
    outputs: [
      {
        internalType: 'uint256[]',
        name: '',
        type: 'uint256[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'grantRole',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'hasRole',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'isOrderCancelled',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    name: 'lastOrderBlock',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'nextOrderId',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'ordersById',
    outputs: [
      {
        internalType: 'uint256',
        name: 'orderId',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        internalType: 'bytes32',
        name: 'marketKey',
        type: 'bytes32',
      },
      {
        internalType: 'enum FuturesOrderBook.Side',
        name: 'side',
        type: 'uint8',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'initial',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'price',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'expiry',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'timestamp',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'marginLocked',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'pnlLocked',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'collateralLocked',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'collateralSpent',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'feeToken',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'fixedFeeToken',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'fixedFeeTotal',
        type: 'uint256',
      },
      {
        internalType: 'bool',
        name: 'fixedFeeCharged',
        type: 'bool',
      },
      {
        internalType: 'address',
        name: 'pctFeeToken',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'pctFeeTotal',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'pctFeeCharged',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    name: 'ordersInBlock',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'marketKey',
        type: 'bytes32',
      },
      {
        internalType: 'enum FuturesOrderBook.Side',
        name: 'side',
        type: 'uint8',
      },
      {
        internalType: 'uint256',
        name: 'price',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'expiry',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'feeToken',
        type: 'address',
      },
    ],
    name: 'placeOrder',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: 'callerConfirmation',
        type: 'address',
      },
    ],
    name: 'renounceRole',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'marketKey',
        type: 'bytes32',
      },
      {
        internalType: 'bool',
        name: 'active',
        type: 'bool',
      },
      {
        internalType: 'enum FuturesOrderBook.Side',
        name: 'makerSide',
        type: 'uint8',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'execPrice',
        type: 'uint256',
      },
    ],
    name: 'replaceSyntheticImbalanceOrder',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'revokeRole',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'sellBook',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'sm',
        type: 'address',
      },
    ],
    name: 'setSettlementManager',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes4',
        name: 'interfaceId',
        type: 'bytes4',
      },
    ],
    name: 'supportsInterface',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    name: 'synthetic',
    outputs: [
      {
        internalType: 'bool',
        name: 'active',
        type: 'bool',
      },
      {
        internalType: 'enum FuturesOrderBook.Side',
        name: 'makerSide',
        type: 'uint8',
      },
      {
        internalType: 'uint256',
        name: 'price',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'updatedAt',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    name: 'unmatchedOrderCount',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'userOrders',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'vault',
    outputs: [
      {
        internalType: 'contract SethxVault',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];
