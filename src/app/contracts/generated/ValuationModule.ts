export const ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_priceManager",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_lendingContract",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_vaultView",
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
    "name": "InvalidHaircut",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidLtvConfig",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidRiskLevel",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "RiskTierDisabled",
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
        "name": "futuresView",
        "type": "address"
      }
    ],
    "name": "FuturesViewSet",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "optionsView",
        "type": "address"
      }
    ],
    "name": "OptionsViewSet",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint16",
        "name": "riskLevel",
        "type": "uint16"
      },
      {
        "indexed": false,
        "internalType": "uint32",
        "name": "maxLtvBps",
        "type": "uint32"
      },
      {
        "indexed": false,
        "internalType": "uint32",
        "name": "liquidationLtvBps",
        "type": "uint32"
      },
      {
        "indexed": false,
        "internalType": "uint16",
        "name": "longOptionHaircutBps",
        "type": "uint16"
      },
      {
        "indexed": false,
        "internalType": "uint16",
        "name": "shortOptionHaircutBps",
        "type": "uint16"
      },
      {
        "indexed": false,
        "internalType": "uint16",
        "name": "bondHaircutBps",
        "type": "uint16"
      },
      {
        "indexed": false,
        "internalType": "uint16",
        "name": "futuresHaircutStepBps",
        "type": "uint16"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "enabled",
        "type": "bool"
      }
    ],
    "name": "RiskTierSet",
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
    "name": "RAY",
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
    "name": "RISK_ADMIN_ROLE",
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
        "internalType": "address",
        "name": "buyer",
        "type": "address"
      },
      {
        "internalType": "uint16",
        "name": "riskLevel",
        "type": "uint16"
      },
      {
        "internalType": "address",
        "name": "liquidationEngine",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "auctionedAccount",
        "type": "address"
      }
    ],
    "name": "canBuyAuctionedAccount",
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
        "internalType": "uint16",
        "name": "riskLevel",
        "type": "uint16"
      },
      {
        "internalType": "uint256",
        "name": "additionalPrincipalEth",
        "type": "uint256"
      }
    ],
    "name": "canPlaceBorrowOrder",
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
        "internalType": "uint16",
        "name": "riskLevel",
        "type": "uint16"
      },
      {
        "internalType": "bytes32",
        "name": "repayMarketKey",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "rolloverPrincipalEth",
        "type": "uint256"
      }
    ],
    "name": "canPlaceRolloverBorrowOrder",
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
        "internalType": "uint16",
        "name": "riskLevel",
        "type": "uint16"
      }
    ],
    "name": "canTrade",
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
    "name": "futuresView",
    "outputs": [
      {
        "internalType": "contract FuturesValuationAdapter",
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
      },
      {
        "internalType": "uint16",
        "name": "riskLevel",
        "type": "uint16"
      }
    ],
    "name": "getAccountValues",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "collateralValueEth",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "liquidationValueEth",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "activeDebtEth",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "effectiveDebtEth",
            "type": "uint256"
          }
        ],
        "internalType": "struct ValuationModule.AccountValues",
        "name": "values",
        "type": "tuple"
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
        "internalType": "uint16",
        "name": "riskLevel",
        "type": "uint16"
      }
    ],
    "name": "getBreakdown",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "freeEth",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "reservedOrderEth",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "freeErc20Eth",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "reservedOrderErc20Eth",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "longOptionsEth",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "shortOptionsEth",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "futuresEth",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "bondClaimsEth",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "nftEth",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "binaryOptionsEth",
            "type": "uint256"
          }
        ],
        "internalType": "struct ValuationModule.Breakdown",
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
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "internalType": "uint16",
        "name": "riskLevel",
        "type": "uint16"
      }
    ],
    "name": "getCollateralValue",
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
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "getDebtValue",
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
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "getEffectiveDebtValue",
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
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "internalType": "uint16",
        "name": "riskLevel",
        "type": "uint16"
      }
    ],
    "name": "getLiquidationValue",
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
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "internalType": "uint16",
        "name": "riskLevel",
        "type": "uint16"
      }
    ],
    "name": "getLtvAgainstCollateral",
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
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "internalType": "uint16",
        "name": "riskLevel",
        "type": "uint16"
      }
    ],
    "name": "getLtvAgainstLiquidation",
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
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "internalType": "uint16",
        "name": "riskLevel",
        "type": "uint16"
      }
    ],
    "name": "isLiquidatable",
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
    "name": "optionsView",
    "outputs": [
      {
        "internalType": "contract OptionsValuationAdapter",
        "name": "",
        "type": "address"
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
        "internalType": "uint16",
        "name": "",
        "type": "uint16"
      }
    ],
    "name": "riskTiers",
    "outputs": [
      {
        "internalType": "bool",
        "name": "enabled",
        "type": "bool"
      },
      {
        "internalType": "uint32",
        "name": "maxLtvBps",
        "type": "uint32"
      },
      {
        "internalType": "uint32",
        "name": "liquidationLtvBps",
        "type": "uint32"
      },
      {
        "internalType": "uint16",
        "name": "longOptionHaircutBps",
        "type": "uint16"
      },
      {
        "internalType": "uint16",
        "name": "shortOptionHaircutBps",
        "type": "uint16"
      },
      {
        "internalType": "uint16",
        "name": "bondHaircutBps",
        "type": "uint16"
      },
      {
        "internalType": "uint16",
        "name": "futuresHaircutStepBps",
        "type": "uint16"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_futuresView",
        "type": "address"
      }
    ],
    "name": "setFuturesView",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_optionsView",
        "type": "address"
      }
    ],
    "name": "setOptionsView",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint16",
        "name": "riskLevel",
        "type": "uint16"
      },
      {
        "internalType": "bool",
        "name": "enabled",
        "type": "bool"
      },
      {
        "internalType": "uint32",
        "name": "maxLtvBps",
        "type": "uint32"
      },
      {
        "internalType": "uint32",
        "name": "liquidationLtvBps",
        "type": "uint32"
      },
      {
        "internalType": "uint16",
        "name": "longOptionHaircutBps",
        "type": "uint16"
      },
      {
        "internalType": "uint16",
        "name": "shortOptionHaircutBps",
        "type": "uint16"
      },
      {
        "internalType": "uint16",
        "name": "bondHaircutBps",
        "type": "uint16"
      },
      {
        "internalType": "uint16",
        "name": "futuresHaircutStepBps",
        "type": "uint16"
      }
    ],
    "name": "setRiskTier",
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
    "inputs": [],
    "name": "vaultView",
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
