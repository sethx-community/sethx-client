export const ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_vault",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_accountRegistry",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_binaryMarginOptionContract",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_feeManager",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "admin",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "AccessControlBadConfirmation",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "neededRole",
        "type": "bytes32"
      }
    ],
    "name": "AccessControlUnauthorizedAccount",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "BadHolderRelease",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "BadHolderReservation",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InsufficientHolderPayout",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InsufficientOrderPayout",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidAccount",
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
    "name": "InvalidOrderIntent",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidOrderLimits",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidPrice",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "MarketClosed",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "MarketExpired",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "MarketSettled",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "MarketUnavailable",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "NotOwnerOrExpired",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "OrderDoesNotExist",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "OrderEmpty",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "OrderNotActive",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "TooManyOpenOrders",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "TooManyOrdersThisBlock",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "UnknownMarket",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "UnmatchableIntents",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "UnsupportedIntent",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "UnsupportedMakerIntent",
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
        "indexed": true,
        "internalType": "uint256",
        "name": "orderId",
        "type": "uint256"
      }
    ],
    "name": "OrderCancelled",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "maxOrdersPerBlock",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "maxUnmatchedOrders",
        "type": "uint256"
      }
    ],
    "name": "OrderLimitsSet",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "makerOrderId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "takerOrderId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "takerUser",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "payoutAmount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "premiumAmount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "totalFeeCharged",
        "type": "uint256"
      }
    ],
    "name": "OrderMatched",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "orderId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "referrer",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "feeToken",
        "type": "address"
      }
    ],
    "name": "OrderPlaced",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "previousAdminRole",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "newAdminRole",
        "type": "bytes32"
      }
    ],
    "name": "RoleAdminChanged",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      }
    ],
    "name": "RoleGranted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      }
    ],
    "name": "RoleRevoked",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "DEFAULT_ADMIN_ROLE",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "FEE_CONTEXT_BINARY_OPTIONS",
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
    "inputs": [],
    "name": "WAD",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "makerOrderId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "payoutAmount",
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
    "name": "acceptOrder",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "accountRegistry",
    "outputs": [
      {
        "internalType": "contract AccountRegistry",
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
        "name": "orderId",
        "type": "uint256"
      }
    ],
    "name": "cancelOrder",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "feeManager",
    "outputs": [
      {
        "internalType": "contract FeeManager",
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
        "internalType": "bytes32",
        "name": "marketKey",
        "type": "bytes32"
      },
      {
        "internalType": "bool",
        "name": "wantBidBook",
        "type": "bool"
      }
    ],
    "name": "getOpenOrders",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "orderId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "user",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "referrer",
            "type": "address"
          },
          {
            "internalType": "bytes32",
            "name": "marketKey",
            "type": "bytes32"
          },
          {
            "internalType": "enum BinaryMarginOptionsOrderBook.OrderIntent",
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
            "name": "originalPayoutAmount",
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
            "internalType": "bool",
            "name": "active",
            "type": "bool"
          },
          {
            "internalType": "address",
            "name": "feeToken",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "fixedFeeToken",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "fixedFeeTotal",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "fixedFeeCharged",
            "type": "bool"
          },
          {
            "internalType": "address",
            "name": "pctFeeToken",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "pctFeeTotal",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "pctFeeCharged",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "premiumLocked",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "premiumSpent",
            "type": "uint256"
          }
        ],
        "internalType": "struct BinaryMarginOptionsOrderBook.Order[]",
        "name": "out",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "orderId",
        "type": "uint256"
      }
    ],
    "name": "getOrder",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "orderId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "user",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "referrer",
            "type": "address"
          },
          {
            "internalType": "bytes32",
            "name": "marketKey",
            "type": "bytes32"
          },
          {
            "internalType": "enum BinaryMarginOptionsOrderBook.OrderIntent",
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
            "name": "originalPayoutAmount",
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
            "internalType": "bool",
            "name": "active",
            "type": "bool"
          },
          {
            "internalType": "address",
            "name": "feeToken",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "fixedFeeToken",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "fixedFeeTotal",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "fixedFeeCharged",
            "type": "bool"
          },
          {
            "internalType": "address",
            "name": "pctFeeToken",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "pctFeeTotal",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "pctFeeCharged",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "premiumLocked",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "premiumSpent",
            "type": "uint256"
          }
        ],
        "internalType": "struct BinaryMarginOptionsOrderBook.Order",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      }
    ],
    "name": "getRoleAdmin",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "grantRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "hasRole",
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
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "isOrderInBook",
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
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "lastOrderBlock",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "marginOptionContract",
    "outputs": [
      {
        "internalType": "contract BinaryMarginOptionContract",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "maxOrdersPerBlock",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "maxUnmatchedOrders",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "nextOrderId",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "orders",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "orderId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "referrer",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "marketKey",
        "type": "bytes32"
      },
      {
        "internalType": "enum BinaryMarginOptionsOrderBook.OrderIntent",
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
        "name": "originalPayoutAmount",
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
        "internalType": "bool",
        "name": "active",
        "type": "bool"
      },
      {
        "internalType": "address",
        "name": "feeToken",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "fixedFeeToken",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "fixedFeeTotal",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "fixedFeeCharged",
        "type": "bool"
      },
      {
        "internalType": "address",
        "name": "pctFeeToken",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "pctFeeTotal",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "pctFeeCharged",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "premiumLocked",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "premiumSpent",
        "type": "uint256"
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
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "ordersInBlock",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "marketKey",
        "type": "bytes32"
      },
      {
        "internalType": "uint8",
        "name": "intentRaw",
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
    "name": "placeOrder",
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
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "callerConfirmation",
        "type": "address"
      }
    ],
    "name": "renounceRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "reservedHolderPayout",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "revokeRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "newMaxOrdersPerBlock",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "newMaxUnmatchedOrders",
        "type": "uint256"
      }
    ],
    "name": "setOrderLimits",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes4",
        "name": "interfaceId",
        "type": "bytes4"
      }
    ],
    "name": "supportsInterface",
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
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "unmatchedOrderCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
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
  }
] as const;
