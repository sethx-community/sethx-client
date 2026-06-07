export const ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_sethxToken",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_priceManager",
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
    "name": "FeeUpdateTooEarly",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidBps",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidFeeUpdateDelay",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "NoPendingUpdate",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "Unauthorized",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "UnsupportedFeeToken",
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
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "accepted",
        "type": "bool"
      }
    ],
    "name": "AcceptedFeeTokenUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "discountBps",
        "type": "uint256"
      }
    ],
    "name": "AccountDiscountSet",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "oldDelay",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newDelay",
        "type": "uint256"
      }
    ],
    "name": "FeeUpdateDelaySet",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "oldPriceManager",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newPriceManager",
        "type": "address"
      }
    ],
    "name": "PriceManagerUpdated",
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
        "indexed": false,
        "internalType": "string",
        "name": "context",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "makerFixedFee",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "makerPercentageFee",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "takerFixedFee",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "takerPercentageFee",
        "type": "uint256"
      }
    ],
    "name": "RoleFeeConfigSet",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "string",
        "name": "context",
        "type": "string"
      }
    ],
    "name": "RoleFeeUpdateCancelled",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "string",
        "name": "context",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "makerFixedFee",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "makerPercentageFee",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "takerFixedFee",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "takerPercentageFee",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "executeAfter",
        "type": "uint256"
      }
    ],
    "name": "RoleFeeUpdateQueued",
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
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "discountBps",
        "type": "uint256"
      }
    ],
    "name": "SethxDiscountSet",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [],
    "name": "SethxDiscountUpdateCancelled",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "discountBps",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "executeAfter",
        "type": "uint256"
      }
    ],
    "name": "SethxDiscountUpdateQueued",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "BPS_DENOMINATOR",
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
    "name": "MAX_FEE_BPS",
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
    "name": "acceptedPaymentTokens",
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
        "name": "",
        "type": "address"
      }
    ],
    "name": "accountDiscountBps",
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
        "internalType": "string",
        "name": "context",
        "type": "string"
      }
    ],
    "name": "cancelRoleFeeUpdate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "cancelSethxDiscountUpdate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "context",
        "type": "string"
      }
    ],
    "name": "executeRoleFeeUpdate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "executeSethxDiscountUpdate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "feeUpdateDelay",
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
    "name": "getAcceptedPaymentTokens",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "",
        "type": "address[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "paymentToken",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "assetToken",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "assetValue",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "context",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "isMaker",
        "type": "bool"
      }
    ],
    "name": "getFeeForAccount",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "fixedAmount",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "fixedToken",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "percentageAmount",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "percentageToken",
            "type": "address"
          }
        ],
        "internalType": "struct FeeManager.FeeOutput",
        "name": "fee",
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
        "internalType": "string",
        "name": "context",
        "type": "string"
      }
    ],
    "name": "getRoleFeeConfig",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "makerFixedFee",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "makerPercentageFee",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "takerFixedFee",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "takerPercentageFee",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "configured",
        "type": "bool"
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
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "isAcceptedFeeToken",
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
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "name": "pendingRoleUpdates",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "makerFixedFee",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "makerPercentageFee",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "takerFixedFee",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "takerPercentageFee",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "executeAfter",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "pendingSethxDiscountUpdate",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "discountBps",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "executeAfter",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "priceManager",
    "outputs": [
      {
        "internalType": "contract PriceManager",
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
        "internalType": "string",
        "name": "context",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "makerFixedFee",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "makerPercentageFee",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "takerFixedFee",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "takerPercentageFee",
        "type": "uint256"
      }
    ],
    "name": "queueRoleFeeUpdate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "discountBps",
        "type": "uint256"
      }
    ],
    "name": "queueSethxDiscountUpdate",
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
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "name": "roleFeeConfigs",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "makerFixedFee",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "makerPercentageFee",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "takerFixedFee",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "takerPercentageFee",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "configured",
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
        "name": "token",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "accepted",
        "type": "bool"
      }
    ],
    "name": "setAcceptedFeeToken",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "discountBps",
        "type": "uint256"
      }
    ],
    "name": "setAccountDiscount",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bool",
        "name": "accepted",
        "type": "bool"
      }
    ],
    "name": "setETHAsAcceptedFeeToken",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "newDelay",
        "type": "uint256"
      }
    ],
    "name": "setFeeUpdateDelay",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newPriceManager",
        "type": "address"
      }
    ],
    "name": "setPriceManager",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "sethxDiscountBps",
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
    "name": "sethxToken",
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
  }
] as const;
