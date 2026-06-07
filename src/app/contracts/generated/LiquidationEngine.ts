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
        "name": "_lendingContract",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_lendingOrderBook",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_valuationModule",
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
    "name": "AccountNotLiquidatable",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "AuctionAlreadyActive",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "AuctionAlreadyResolved",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "AuctionIsExpired",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "AuctionNotActive",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "AuctionNotExpired",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "BuyerNotAccount",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidAuctionCurve",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidAuctionDuration",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidBuyerOwner",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "NoActiveAuction",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "NoDebtForMarket",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "RecoveryApplyMismatch",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "SweepNotApplied",
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
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "AuctionCancelled",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint64",
        "name": "premiumPhaseDuration",
        "type": "uint64"
      },
      {
        "indexed": false,
        "internalType": "uint64",
        "name": "parPhaseDuration",
        "type": "uint64"
      },
      {
        "indexed": false,
        "internalType": "uint64",
        "name": "discountPhaseDuration",
        "type": "uint64"
      },
      {
        "indexed": false,
        "internalType": "uint32",
        "name": "startPriceBps",
        "type": "uint32"
      },
      {
        "indexed": false,
        "internalType": "uint32",
        "name": "parPriceBps",
        "type": "uint32"
      },
      {
        "indexed": false,
        "internalType": "uint32",
        "name": "endPriceBps",
        "type": "uint32"
      }
    ],
    "name": "AuctionConfigSet",
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
        "indexed": true,
        "internalType": "bytes32",
        "name": "marketKey",
        "type": "bytes32"
      }
    ],
    "name": "AuctionExpired",
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
        "indexed": true,
        "internalType": "bytes32",
        "name": "marketKey",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "winner",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "pricePaid",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "debtSnapshot",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "recoveryRouted",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "borrowerSurplus",
        "type": "uint256"
      }
    ],
    "name": "AuctionPurchased",
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
        "indexed": true,
        "internalType": "bytes32",
        "name": "marketKey",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "uint16",
        "name": "riskLevel",
        "type": "uint16"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "debtBeforeSweep",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "freeEthRecovered",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "cancelledOrders",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "preLiquidationOwner",
        "type": "address"
      }
    ],
    "name": "LiquidationResolvedFromFreeEth",
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
        "indexed": true,
        "internalType": "bytes32",
        "name": "marketKey",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "uint16",
        "name": "riskLevel",
        "type": "uint16"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "debtSnapshot",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "freeEthRecoveredAtTrigger",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "cancelledOrders",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "preLiquidationOwner",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint64",
        "name": "startTime",
        "type": "uint64"
      },
      {
        "indexed": false,
        "internalType": "uint64",
        "name": "endTime",
        "type": "uint64"
      }
    ],
    "name": "LiquidationTriggered",
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
    "name": "BPS",
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
    "name": "GOVERNOR_ROLE",
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
    "inputs": [],
    "name": "auctionConfig",
    "outputs": [
      {
        "internalType": "uint64",
        "name": "premiumPhaseDuration",
        "type": "uint64"
      },
      {
        "internalType": "uint64",
        "name": "parPhaseDuration",
        "type": "uint64"
      },
      {
        "internalType": "uint64",
        "name": "discountPhaseDuration",
        "type": "uint64"
      },
      {
        "internalType": "uint32",
        "name": "startPriceBps",
        "type": "uint32"
      },
      {
        "internalType": "uint32",
        "name": "parPriceBps",
        "type": "uint32"
      },
      {
        "internalType": "uint32",
        "name": "endPriceBps",
        "type": "uint32"
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
    "name": "auctions",
    "outputs": [
      {
        "internalType": "bool",
        "name": "active",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "sold",
        "type": "bool"
      },
      {
        "internalType": "uint64",
        "name": "startTime",
        "type": "uint64"
      },
      {
        "internalType": "uint64",
        "name": "endTime",
        "type": "uint64"
      },
      {
        "internalType": "bytes32",
        "name": "marketKey",
        "type": "bytes32"
      },
      {
        "internalType": "uint16",
        "name": "riskLevel",
        "type": "uint16"
      },
      {
        "internalType": "uint256",
        "name": "debtSnapshot",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "freeEthRecoveredAtTrigger",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "preLiquidationOwner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "winner",
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
        "name": "account",
        "type": "address"
      }
    ],
    "name": "buyAuctionedAccount",
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
      }
    ],
    "name": "cancelAuction",
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
      }
    ],
    "name": "getCurrentAuctionPrice",
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
    "inputs": [],
    "name": "lendingContract",
    "outputs": [
      {
        "internalType": "contract LendingContract",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "lendingOrderBook",
    "outputs": [
      {
        "internalType": "contract LendingOrderBook",
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
        "name": "account",
        "type": "address"
      }
    ],
    "name": "markAuctionExpired",
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
        "internalType": "uint64",
        "name": "premiumPhaseDuration",
        "type": "uint64"
      },
      {
        "internalType": "uint64",
        "name": "parPhaseDuration",
        "type": "uint64"
      },
      {
        "internalType": "uint64",
        "name": "discountPhaseDuration",
        "type": "uint64"
      },
      {
        "internalType": "uint32",
        "name": "startPriceBps",
        "type": "uint32"
      },
      {
        "internalType": "uint32",
        "name": "parPriceBps",
        "type": "uint32"
      },
      {
        "internalType": "uint32",
        "name": "endPriceBps",
        "type": "uint32"
      }
    ],
    "name": "setAuctionConfig",
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
        "name": "account",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "marketKey",
        "type": "bytes32"
      },
      {
        "internalType": "uint16",
        "name": "riskLevel",
        "type": "uint16"
      }
    ],
    "name": "triggerLiquidation",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "valuationModule",
    "outputs": [
      {
        "internalType": "contract ValuationModule",
        "name": "",
        "type": "address"
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
