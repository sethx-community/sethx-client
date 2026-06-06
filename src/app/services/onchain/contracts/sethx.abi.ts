export const ORDERBOOK_ABI = [
  {
    inputs: [
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
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'baseToken',
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
        internalType: 'bool',
        name: 'active',
        type: 'bool',
      },
    ],
    name: 'ActiveBookChanged',
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
    name: 'OrderCancelled',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'makerOrderId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'takerOrderId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'takerUser',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
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
        name: 'orderId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'user',
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
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'baseToken',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'quoteToken',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'blockNumber',
        type: 'uint256',
      },
    ],
    name: 'RateLimitHit',
    type: 'event',
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
    inputs: [
      {
        internalType: 'uint256',
        name: 'makerOrderId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'feeToken',
        type: 'address',
      },
    ],
    name: 'acceptOrder',
    outputs: [],
    stateMutability: 'nonpayable',
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
    inputs: [
      {
        internalType: 'uint256',
        name: 'index',
        type: 'uint256',
      },
    ],
    name: 'getActiveBookAt',
    outputs: [
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
    inputs: [],
    name: 'getActiveBookCount',
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
        name: 'baseToken',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'quoteToken',
        type: 'address',
      },
    ],
    name: 'getActiveBookOrderCount',
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
    name: 'getActiveBookOrderIds',
    outputs: [
      {
        internalType: 'uint256[]',
        name: 'bids',
        type: 'uint256[]',
      },
      {
        internalType: 'uint256[]',
        name: 'asks',
        type: 'uint256[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getActiveBooks',
    outputs: [
      {
        internalType: 'address[]',
        name: 'bases',
        type: 'address[]',
      },
      {
        internalType: 'address[]',
        name: 'quotes',
        type: 'address[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'offset',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'limit',
        type: 'uint256',
      },
    ],
    name: 'getActiveBooksPaged',
    outputs: [
      {
        internalType: 'address[]',
        name: 'bases',
        type: 'address[]',
      },
      {
        internalType: 'address[]',
        name: 'quotes',
        type: 'address[]',
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
    name: 'getOrder',
    outputs: [
      {
        components: [
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
            internalType: 'address',
            name: 'baseToken',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'quoteToken',
            type: 'address',
          },
          {
            internalType: 'enum TokenSpotOrderBook.Side',
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
            name: 'initialAmount',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'expiry',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'fixedFeeAmount',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'fixedFeeToken',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'percentageFeeAmount',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'percentageFeeToken',
            type: 'address',
          },
          {
            internalType: 'bool',
            name: 'fixedFeeCharged',
            type: 'bool',
          },
          {
            internalType: 'uint256',
            name: 'prev',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'next',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'userIndex',
            type: 'uint256',
          },
        ],
        internalType: 'struct TokenSpotOrderBook.Order',
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
    name: 'getOrderBook',
    outputs: [
      {
        internalType: 'uint256[]',
        name: 'bids',
        type: 'uint256[]',
      },
      {
        internalType: 'uint256[]',
        name: 'asks',
        type: 'uint256[]',
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
        name: '',
        type: 'bytes32',
      },
    ],
    name: 'isActiveBook',
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
        internalType: 'address',
        name: '',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '',
        type: 'address',
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
    name: 'orders',
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
        internalType: 'address',
        name: 'baseToken',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'quoteToken',
        type: 'address',
      },
      {
        internalType: 'enum TokenSpotOrderBook.Side',
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
        name: 'initialAmount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'expiry',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'fixedFeeAmount',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'fixedFeeToken',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'percentageFeeAmount',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'percentageFeeToken',
        type: 'address',
      },
      {
        internalType: 'bool',
        name: 'fixedFeeCharged',
        type: 'bool',
      },
      {
        internalType: 'uint256',
        name: 'prev',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'next',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'userIndex',
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
        internalType: 'address',
        name: '',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '',
        type: 'address',
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
    inputs: [],
    name: 'owner',
    outputs: [
      {
        internalType: 'address',
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
        name: 'feeToken',
        type: 'address',
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
      {
        internalType: 'enum TokenSpotOrderBook.Side',
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
    ],
    name: 'placeOrder',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
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
        name: 'baseToken',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'quoteToken',
        type: 'address',
      },
      {
        internalType: 'enum TokenSpotOrderBook.Side',
        name: 'side',
        type: 'uint8',
      },
      {
        internalType: 'uint256',
        name: 'limit',
        type: 'uint256',
      },
    ],
    name: 'sweepExpiredOrders',
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
        internalType: 'address',
        name: '',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '',
        type: 'address',
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

export const ACCOUNT_REGISTRY_ABI = [
  {
    type: 'function',
    name: 'getAccounts',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ type: 'address[]' }],
  },
  {
    type: 'function',
    name: 'latestAccount',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ type: 'address' }],
  },
];

export const ACCOUNT_FACTORY_ABI = [
  {
    inputs: [],
    name: 'createAccount',
    outputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

export const ACCOUNT_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_owner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_vault",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "EthOnly",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "EthTransferFailed",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InsufficientETH",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidAmount",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidExpiry",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidOrder",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidRate",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidTarget",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "NotOwner",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "NotPendingOwner",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      }
    ],
    "name": "SafeERC20FailedOperation",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "expectedAccount",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "actualAccount",
        "type": "address"
      }
    ],
    "name": "UnexpectedAccount",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "expectedVault",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "actualVault",
        "type": "address"
      }
    ],
    "name": "UnexpectedVault",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ZeroAddress",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "bool",
        "name": "oldStatus",
        "type": "bool"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "newStatus",
        "type": "bool"
      }
    ],
    "name": "AccountActiveStatusUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "string",
        "name": "oldName",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "newName",
        "type": "string"
      }
    ],
    "name": "AccountNameUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "RescueEth",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "nft",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "RescueNft",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "RescueToken",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "orderbook",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "makerOrderId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "feeToken",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "referrer",
        "type": "address"
      }
    ],
    "name": "acceptOrderBinaryMarginOption",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "orderbook",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "makerOrderId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "feeToken",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "referrer",
        "type": "address"
      }
    ],
    "name": "acceptOrderMarginOption",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "orderBook",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "makerOrderId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "feeToken",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "referrer",
        "type": "address"
      }
    ],
    "name": "acceptOrderNFTSpot",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "orderBook",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "makerOrderId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "feeToken",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "referrer",
        "type": "address"
      }
    ],
    "name": "acceptOrderOption",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "orderBook",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "makerOrderId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "feeToken",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "referrer",
        "type": "address"
      }
    ],
    "name": "acceptOrderTokenSpot",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "acceptOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "accountName",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "futuresContract",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "marketKey",
        "type": "bytes32"
      },
      {
        "internalType": "bool",
        "name": "isLong",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "addFuturesMargin",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "liquidationEngine",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "buyAuctionedLendingAccount",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "lendingOrderBook",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "orderId",
        "type": "uint256"
      }
    ],
    "name": "cancelLendOrder",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "orderbook",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "orderId",
        "type": "uint256"
      }
    ],
    "name": "cancelOrderBinaryMarginOption",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "orderBook",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "orderId",
        "type": "uint256"
      }
    ],
    "name": "cancelOrderFutures",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "orderbook",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "orderId",
        "type": "uint256"
      }
    ],
    "name": "cancelOrderMarginOption",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "orderBook",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "orderId",
        "type": "uint256"
      }
    ],
    "name": "cancelOrderNFTSpot",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "orderBook",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "orderId",
        "type": "uint256"
      }
    ],
    "name": "cancelOrderOption",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "orderBook",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "orderId",
        "type": "uint256"
      }
    ],
    "name": "cancelOrderTokenSpot",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "cancelOwnershipTransfer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "binaryMarginOptionContract",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "marketKey",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "payoutAmount",
        "type": "uint256"
      }
    ],
    "name": "claimBinaryMarginOption",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "marginOptionContract",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "marketKey",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "size",
        "type": "uint256"
      }
    ],
    "name": "claimMarginOption",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "lendingContract",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "bondIndex",
        "type": "uint256"
      }
    ],
    "name": "claimSupplementalLendingBond",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "optionContractAddr",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "marketKey",
        "type": "bytes32"
      }
    ],
    "name": "clearExpiredOptionHolder",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "expectedAccount",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "expectedVault",
        "type": "address"
      }
    ],
    "name": "depositETH",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "nft",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "expectedAccount",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "expectedVault",
        "type": "address"
      }
    ],
    "name": "depositNFT721",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "expectedAccount",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "expectedVault",
        "type": "address"
      }
    ],
    "name": "depositToken",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "optionContractAddr",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "marketKey",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "size",
        "type": "uint256"
      }
    ],
    "name": "exerciseOption",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "isActive",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "bytes",
        "name": "",
        "type": "bytes"
      }
    ],
    "name": "onERC721Received",
    "outputs": [
      {
        "internalType": "bytes4",
        "name": "",
        "type": "bytes4"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "pendingOwner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "lendingOrderBook",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "borrowToken",
        "type": "address"
      },
      {
        "internalType": "uint64",
        "name": "marketExpiry",
        "type": "uint64"
      },
      {
        "internalType": "uint16",
        "name": "riskLevel",
        "type": "uint16"
      },
      {
        "internalType": "uint256",
        "name": "rateBps",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "principal",
        "type": "uint256"
      },
      {
        "internalType": "uint64",
        "name": "orderExpiry",
        "type": "uint64"
      }
    ],
    "name": "placeLendOrder",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "orderbook",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "marketKey",
        "type": "bytes32"
      },
      {
        "internalType": "uint8",
        "name": "intent",
        "type": "uint8"
      },
      {
        "internalType": "uint256",
        "name": "payoutAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "askPrice",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "expiry",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "feeToken",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "referrer",
        "type": "address"
      }
    ],
    "name": "placeOrderBinaryMarginOption",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "orderBook",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "marketKey",
        "type": "bytes32"
      },
      {
        "internalType": "enum FuturesOrderBook.Side",
        "name": "intent",
        "type": "uint8"
      },
      {
        "internalType": "uint256",
        "name": "price",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "expiry",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "feeToken",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "referrer",
        "type": "address"
      }
    ],
    "name": "placeOrderFutures",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "orderbook",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "marketKey",
        "type": "bytes32"
      },
      {
        "internalType": "enum MarginOptionsOrderBook.OrderIntent",
        "name": "intent",
        "type": "uint8"
      },
      {
        "internalType": "uint256",
        "name": "size",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "askPrice",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "expiry",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "feeToken",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "referrer",
        "type": "address"
      }
    ],
    "name": "placeOrderMarginOption",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "orderBook",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "feeToken",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "nft",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "quoteToken",
        "type": "address"
      },
      {
        "internalType": "enum NFTSpotOrderBook.Side",
        "name": "side",
        "type": "uint8"
      },
      {
        "internalType": "uint256",
        "name": "price",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "expiry",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "referrer",
        "type": "address"
      }
    ],
    "name": "placeOrderNFTSpot",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "orderBook",
        "type": "address"
      },
      {
        "internalType": "enum OptionContract.OptionType",
        "name": "optionType",
        "type": "uint8"
      },
      {
        "internalType": "address",
        "name": "assetToken",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "quoteToken",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "strikePrice",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "optionExpiry",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "orderExpiry",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "feeToken",
        "type": "address"
      },
      {
        "internalType": "enum OptionsOrderBook.OrderIntent",
        "name": "intent",
        "type": "uint8"
      },
      {
        "internalType": "uint256",
        "name": "size",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "askPrice",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "referrer",
        "type": "address"
      }
    ],
    "name": "placeOrderOption",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "orderBook",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "feeToken",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "baseToken",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "quoteToken",
        "type": "address"
      },
      {
        "internalType": "enum TokenSpotOrderBook.Side",
        "name": "side",
        "type": "uint8"
      },
      {
        "internalType": "uint256",
        "name": "price",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "expiry",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "referrer",
        "type": "address"
      }
    ],
    "name": "placeOrderTokenSpot",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "optionContractAddr",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "marketKey",
        "type": "bytes32"
      }
    ],
    "name": "reclaimExpiredOption",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "binaryMarginOptionContract",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "marketKey",
        "type": "bytes32"
      }
    ],
    "name": "reclaimWriterBinaryMarginOption",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "marginOptionContract",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "marketKey",
        "type": "bytes32"
      }
    ],
    "name": "reclaimWriterMarginOption",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "lendingContract",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "bondIndex",
        "type": "uint256"
      }
    ],
    "name": "redeemInitialLendingBond",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "futuresContract",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "marketKey",
        "type": "bytes32"
      },
      {
        "internalType": "bool",
        "name": "isLong",
        "type": "bool"
      }
    ],
    "name": "releaseFuturesMargin",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "rescueEth",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "nft",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "rescueNFT721",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "rescueToken",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "newName",
        "type": "string"
      }
    ],
    "name": "setAccountName",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bool",
        "name": "newStatus",
        "type": "bool"
      }
    ],
    "name": "setActive",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "vault",
    "outputs": [
      {
        "internalType": "contract SethxVault",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "withdrawETH",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "nft",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "withdrawNFT721",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "withdrawToken",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "stateMutability": "payable",
    "type": "receive"
  }
];

// src/app/core/abi/erc20.abi.ts
export const ERC20_ABI = [
  {
    type: 'function',
    name: 'name',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'string' }],
  },
  {
    type: 'function',
    name: 'symbol',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'string' }],
  },
  {
    type: 'function',
    name: 'decimals',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint8' }],
  },
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'allowance',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'approve',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ type: 'bool' }],
  },
  {
    type: 'function',
    name: 'transfer',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ type: 'bool' }],
  },
  {
    type: 'function',
    name: 'transferFrom',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ type: 'bool' }],
  },
  {
    type: 'event',
    name: 'Transfer',
    inputs: [
      { name: 'from', type: 'address', indexed: true },
      { name: 'to', type: 'address', indexed: true },
      { name: 'value', type: 'uint256', indexed: false },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Approval',
    inputs: [
      { name: 'owner', type: 'address', indexed: true },
      { name: 'spender', type: 'address', indexed: true },
      { name: 'value', type: 'uint256', indexed: false },
    ],
    anonymous: false,
  },
];

export const PRICEMANAGER_ABI = [
  {
    type: 'function',
    name: 'getERC20WhiteList',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address[]' }],
  },
];

// vault.abi.ts
export const VAULT_ABI = [
  // === View: Token Lists ===
  {
    type: 'function',
    name: 'getERC20Tokens',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address[]' }],
  },
  {
    type: 'function',
    name: 'getERC721Tokens',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address[]' }],
  },
  {
    type: 'function',
    name: 'getERC1155Tokens',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address[]' }],
  },

  // === View: Balances ===
  {
    type: 'function',
    name: 'getLockedERC20',
    stateMutability: 'view',
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'token', type: 'address' },
    ],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'getERC20Balance',
    stateMutability: 'view',
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'token', type: 'address' },
    ],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'getETHBalance',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'getLockedETHBalance',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
];

export const FEE_MANAGER_ABI = [
  {
    type: 'function',
    name: 'getFee',
    stateMutability: 'view',
    inputs: [
      { name: 'paymentToken', type: 'address' },
      { name: 'assetToken', type: 'address' },
      { name: 'assetValue', type: 'uint256' },
      { name: 'context', type: 'string' },
    ],
    outputs: [
      {
        name: 'fee',
        type: 'tuple',
        components: [
          { name: 'fixedAmount', type: 'uint256' },
          { name: 'fixedToken', type: 'address' },
          { name: 'percentageAmount', type: 'uint256' },
          { name: 'percentageToken', type: 'address' },
        ],
      },
    ],
  },
  {
    type: 'function',
    name: 'sethxToken',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
  },
  {
    type: 'function',
    name: 'getAcceptedPaymentTokens',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address[]' }],
  },
];

export const TOKEN_SPOT_ORDERBOOK_ABI = [
  {
    inputs: [
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
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'baseToken',
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
        internalType: 'bool',
        name: 'active',
        type: 'bool',
      },
    ],
    name: 'ActiveBookChanged',
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
    name: 'OrderCancelled',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'makerOrderId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'takerOrderId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'takerUser',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'baseAmount',
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
        name: 'orderId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'user',
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
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'baseToken',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'quoteToken',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'blockNumber',
        type: 'uint256',
      },
    ],
    name: 'RateLimitHit',
    type: 'event',
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
    inputs: [
      {
        internalType: 'uint256',
        name: 'makerOrderId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'feeToken',
        type: 'address',
      },
    ],
    name: 'acceptOrder',
    outputs: [],
    stateMutability: 'nonpayable',
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
    inputs: [
      {
        internalType: 'uint256',
        name: 'index',
        type: 'uint256',
      },
    ],
    name: 'getActiveBookAt',
    outputs: [
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
    inputs: [],
    name: 'getActiveBookCount',
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
        name: 'baseToken',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'quoteToken',
        type: 'address',
      },
    ],
    name: 'getActiveBookOrderCount',
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
    name: 'getActiveBookOrderIds',
    outputs: [
      {
        internalType: 'uint256[]',
        name: 'bids',
        type: 'uint256[]',
      },
      {
        internalType: 'uint256[]',
        name: 'asks',
        type: 'uint256[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getActiveBooks',
    outputs: [
      {
        internalType: 'address[]',
        name: 'bases',
        type: 'address[]',
      },
      {
        internalType: 'address[]',
        name: 'quotes',
        type: 'address[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'offset',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'limit',
        type: 'uint256',
      },
    ],
    name: 'getActiveBooksPaged',
    outputs: [
      {
        internalType: 'address[]',
        name: 'bases',
        type: 'address[]',
      },
      {
        internalType: 'address[]',
        name: 'quotes',
        type: 'address[]',
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
    name: 'getOrder',
    outputs: [
      {
        components: [
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
            internalType: 'address',
            name: 'baseToken',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'quoteToken',
            type: 'address',
          },
          {
            internalType: 'enum TokenSpotOrderBook.Side',
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
            name: 'initialAmount',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'expiry',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'fixedFeeAmount',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'fixedFeeToken',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'percentageFeeAmount',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'percentageFeeToken',
            type: 'address',
          },
          {
            internalType: 'bool',
            name: 'fixedFeeCharged',
            type: 'bool',
          },
          {
            internalType: 'uint256',
            name: 'percentageFeeCharged',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'prev',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'next',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'offeredLocked',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'offeredSpent',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'userIndex',
            type: 'uint256',
          },
        ],
        internalType: 'struct TokenSpotOrderBook.Order',
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
    name: 'getOrderBook',
    outputs: [
      {
        internalType: 'uint256[]',
        name: 'bids',
        type: 'uint256[]',
      },
      {
        internalType: 'uint256[]',
        name: 'asks',
        type: 'uint256[]',
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
        name: '',
        type: 'bytes32',
      },
    ],
    name: 'isActiveBook',
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
        internalType: 'address',
        name: '',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '',
        type: 'address',
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
    name: 'orders',
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
        internalType: 'address',
        name: 'baseToken',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'quoteToken',
        type: 'address',
      },
      {
        internalType: 'enum TokenSpotOrderBook.Side',
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
        name: 'initialAmount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'expiry',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'fixedFeeAmount',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'fixedFeeToken',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'percentageFeeAmount',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'percentageFeeToken',
        type: 'address',
      },
      {
        internalType: 'bool',
        name: 'fixedFeeCharged',
        type: 'bool',
      },
      {
        internalType: 'uint256',
        name: 'percentageFeeCharged',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'prev',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'next',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'offeredLocked',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'offeredSpent',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'userIndex',
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
        internalType: 'address',
        name: '',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '',
        type: 'address',
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
    inputs: [],
    name: 'owner',
    outputs: [
      {
        internalType: 'address',
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
        name: 'feeToken',
        type: 'address',
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
      {
        internalType: 'enum TokenSpotOrderBook.Side',
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
    ],
    name: 'placeOrder',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
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
        name: 'baseToken',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'quoteToken',
        type: 'address',
      },
      {
        internalType: 'enum TokenSpotOrderBook.Side',
        name: 'side',
        type: 'uint8',
      },
      {
        internalType: 'uint256',
        name: 'limit',
        type: 'uint256',
      },
    ],
    name: 'sweepExpiredOrders',
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
        internalType: 'address',
        name: '',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '',
        type: 'address',
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

// ============================================================
// Options
// ============================================================

export const OPTIONS_ORDERBOOK_ABI = [
  {
    inputs: [
      {
        internalType: 'address',
        name: '_vault',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_optionContract',
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
        name: 'size',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'grossPremium',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'totalFeeCharged',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'premiumPaidToCounterparty',
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
        internalType: 'enum OptionsOrderBook.OrderIntent',
        name: 'intent',
        type: 'uint8',
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
        name: 'askPrice',
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
        name: 'blockNumber',
        type: 'uint256',
      },
    ],
    name: 'RateLimitHit',
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
    inputs: [
      {
        internalType: 'uint256',
        name: 'makerOrderId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'feeToken',
        type: 'address',
      },
    ],
    name: 'acceptOrder',
    outputs: [],
    stateMutability: 'nonpayable',
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
    ],
    name: 'activeMarketIndexPlus1',
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
    name: 'activeMarkets',
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
    inputs: [
      {
        internalType: 'bytes32',
        name: 'marketKey',
        type: 'bytes32',
      },
    ],
    name: 'getActiveMarketOrderCount',
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
    name: 'getActiveMarketsCount',
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
        name: 'offset',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'limit',
        type: 'uint256',
      },
    ],
    name: 'getActiveMarketsPaged',
    outputs: [
      {
        internalType: 'bytes32[]',
        name: 'out',
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
    name: 'getMarketTotals',
    outputs: [
      {
        internalType: 'uint256',
        name: 'bidRemaining',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'askRemaining',
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
        name: 'isLongSide_',
        type: 'bool',
      },
    ],
    name: 'getOpenOrders',
    outputs: [
      {
        components: [
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
            internalType: 'enum OptionContract.OptionType',
            name: 'optionType',
            type: 'uint8',
          },
          {
            internalType: 'address',
            name: 'assetToken',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'quoteToken',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'strikePrice',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'optionExpiry',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'feeToken',
            type: 'address',
          },
          {
            internalType: 'enum OptionsOrderBook.OrderIntent',
            name: 'intent',
            type: 'uint8',
          },
          {
            internalType: 'uint256',
            name: 'size',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'filled',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'askPrice',
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
          {
            internalType: 'uint256',
            name: 'premiumLocked',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'premiumSpent',
            type: 'uint256',
          },
        ],
        internalType: 'struct OptionsOrderBook.Order[]',
        name: '',
        type: 'tuple[]',
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
    name: 'getOrder',
    outputs: [
      {
        components: [
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
            internalType: 'enum OptionContract.OptionType',
            name: 'optionType',
            type: 'uint8',
          },
          {
            internalType: 'address',
            name: 'assetToken',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'quoteToken',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'strikePrice',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'optionExpiry',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'feeToken',
            type: 'address',
          },
          {
            internalType: 'enum OptionsOrderBook.OrderIntent',
            name: 'intent',
            type: 'uint8',
          },
          {
            internalType: 'uint256',
            name: 'size',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'filled',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'askPrice',
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
          {
            internalType: 'uint256',
            name: 'premiumLocked',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'premiumSpent',
            type: 'uint256',
          },
        ],
        internalType: 'struct OptionsOrderBook.Order',
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
    name: 'longSideBook',
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
    name: 'marketMeta',
    outputs: [
      {
        internalType: 'enum OptionContract.OptionType',
        name: 't',
        type: 'uint8',
      },
      {
        internalType: 'address',
        name: 'asset',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'quote',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'strike',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'expiry',
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
    name: 'marketMetaSet',
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
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    name: 'openOrderCountByMarket',
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
    name: 'optionContract',
    outputs: [
      {
        internalType: 'contract OptionContract',
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
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'orderMarketKey',
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
        internalType: 'enum OptionContract.OptionType',
        name: 'optionType',
        type: 'uint8',
      },
      {
        internalType: 'address',
        name: 'assetToken',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'quoteToken',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'strikePrice',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'optionExpiry',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'feeToken',
        type: 'address',
      },
      {
        internalType: 'enum OptionsOrderBook.OrderIntent',
        name: 'intent',
        type: 'uint8',
      },
      {
        internalType: 'uint256',
        name: 'size',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'filled',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'askPrice',
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
      {
        internalType: 'uint256',
        name: 'premiumLocked',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'premiumSpent',
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
        internalType: 'enum OptionContract.OptionType',
        name: 'optionType',
        type: 'uint8',
      },
      {
        internalType: 'address',
        name: 'assetToken',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'quoteToken',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'strikePrice',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'optionExpiry',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'orderExpiry',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'feeToken',
        type: 'address',
      },
      {
        internalType: 'enum OptionsOrderBook.OrderIntent',
        name: 'intent',
        type: 'uint8',
      },
      {
        internalType: 'uint256',
        name: 'size',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'askPrice',
        type: 'uint256',
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
    name: 'shortSideBook',
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

export const OPTION_CONTRACT_ABI = [
  {
    inputs: [
      {
        internalType: 'address',
        name: '_vault',
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
    inputs: [],
    name: 'ReentrancyGuardReentrantCall',
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
        indexed: true,
        internalType: 'address',
        name: 'writer',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'remainingSize',
        type: 'uint256',
      },
    ],
    name: 'CollateralReclaimed',
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
        name: 'holder',
        type: 'address',
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
        name: 'strikePrice',
        type: 'uint256',
      },
    ],
    name: 'Exercised',
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
        name: 'holder',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'clearedSize',
        type: 'uint256',
      },
    ],
    name: 'HolderClearedExpired',
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
    name: 'MarketAdded',
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
        internalType: 'enum OptionContract.OptionType',
        name: 'optionType',
        type: 'uint8',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'assetToken',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'quoteToken',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'strikePrice',
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
        internalType: 'uint256',
        name: 'exerciseWindow',
        type: 'uint256',
      },
    ],
    name: 'MarketInitialized',
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
    name: 'MarketRemoved',
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
        name: 'oldOI',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'newOI',
        type: 'uint256',
      },
    ],
    name: 'OpenInterestChanged',
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
        name: 'writer',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'holder',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'size',
        type: 'uint256',
      },
    ],
    name: 'OptionRegistered',
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
        name: 'from',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'size',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'isWriter',
        type: 'bool',
      },
    ],
    name: 'PositionTransferred',
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
        indexed: false,
        internalType: 'uint256',
        name: 'oldDivider',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'newDivider',
        type: 'uint256',
      },
    ],
    name: 'StrikeDividerUpdated',
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
        name: 'inputStrike',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'normalizedStrike',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'tick',
        type: 'uint256',
      },
    ],
    name: 'StrikeNormalized',
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
    ],
    name: 'UserMarketAdded',
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
    ],
    name: 'UserMarketRemoved',
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
        name: 'writer',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'size',
        type: 'uint256',
      },
    ],
    name: 'WriterConsumed',
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
    name: 'FIXED_EXERCISE_WINDOW',
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
    ],
    name: 'clearExpiredHolder',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'enum OptionContract.OptionType',
        name: 'optionType',
        type: 'uint8',
      },
      {
        internalType: 'address',
        name: 'assetToken',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'quoteToken',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'strikePrice',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'expiry',
        type: 'uint256',
      },
    ],
    name: 'computeMarketKey',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
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
        name: 'size',
        type: 'uint256',
      },
    ],
    name: 'exercise',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getAllMarketsCount',
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
        name: 'offset',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'limit',
        type: 'uint256',
      },
    ],
    name: 'getAllMarketsPaged',
    outputs: [
      {
        internalType: 'bytes32[]',
        name: 'out',
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
    name: 'getMarket',
    outputs: [
      {
        internalType: 'bool',
        name: 'initialized',
        type: 'bool',
      },
      {
        internalType: 'enum OptionContract.OptionType',
        name: 'optionType',
        type: 'uint8',
      },
      {
        internalType: 'address',
        name: 'assetToken',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'quoteToken',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'strikePrice',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'expiry',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'exerciseWindow',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'totalSize',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'exercisedSize',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'writerCursor',
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
    name: 'getUserMarketsCount',
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
        internalType: 'uint256',
        name: 'offset',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'limit',
        type: 'uint256',
      },
    ],
    name: 'getUserMarketsPaged',
    outputs: [
      {
        internalType: 'bytes32[]',
        name: 'out',
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
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'getUserPosition',
    outputs: [
      {
        internalType: 'uint256',
        name: 'writerSize',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'holderSize',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'holderExercised',
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
        name: 'expiry',
        type: 'uint256',
      },
    ],
    name: 'isValidExpiry',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
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
    ],
    name: 'marketExists',
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
    name: 'marketOpenInterest',
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
        name: 'strikeInput',
        type: 'uint256',
      },
    ],
    name: 'normalizeStrike',
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
    ],
    name: 'reclaimExpired',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'enum OptionContract.OptionType',
        name: 'optionType',
        type: 'uint8',
      },
      {
        internalType: 'address',
        name: 'assetToken',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'quoteToken',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'strikePriceInput',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'expiry',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'writer',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'holder',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'size',
        type: 'uint256',
      },
    ],
    name: 'registerNewOption',
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
        internalType: 'uint256',
        name: 'expiry',
        type: 'uint256',
      },
    ],
    name: 'requireValidExpiry',
    outputs: [],
    stateMutability: 'pure',
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
        internalType: 'uint256',
        name: 'newDivider',
        type: 'uint256',
      },
    ],
    name: 'setStrikeDivider',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'strikeDivider',
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
        internalType: 'uint256',
        name: 'strikeInput',
        type: 'uint256',
      },
    ],
    name: 'tickForStrike',
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
        name: 'from',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'size',
        type: 'uint256',
      },
      {
        internalType: 'bool',
        name: 'isWriter',
        type: 'bool',
      },
    ],
    name: 'transferPosition',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'vault',
    outputs: [
      {
        internalType: 'contract ISethxVault',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];
