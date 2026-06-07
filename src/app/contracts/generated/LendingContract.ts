export const ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_accountRegistry",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_vault",
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
    "name": "AlreadyRedeemed",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "AppliedMismatch",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "BadRecipient",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "BondNotInOwnerList",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "BorrowerMustBeLendingAccount",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "CancelExceedsPending",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "CancelExceedsRollover",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "DirectETHNotAccepted",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ExpiryPassed",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InsufficientMarketLiquidity",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidAmount",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidLtvConfig",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidMarket",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidRiskLevel",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "LossExceedsBorrowerDebt",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "MarketAlreadySettled",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "MarketExpired",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "MarketInactive",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "MarketNotMatured",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "MarketNotSettled",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "MatchedExceedsPending",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "MatchedExceedsRollover",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "NoDebt",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "NoRolloverDebt",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "NotOwner",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "NotRegisteredAccount",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "NothingClaimable",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "OrderBookOnly",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "OutdatedRiskModule",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ResolvedExceedsFace",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "RiskModuleNotSet",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "SameMarketRollover",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "UnknownBond",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "UnknownMarket",
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
        "name": "bondIndex",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "marketKey",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "BondInitialRedeemed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "bondIndex",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "marketKey",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "BondSupplementalClaimed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "bondIndex",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      }
    ],
    "name": "BondTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "borrower",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "marketKey",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "BorrowOrderRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "borrower",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "marketKey",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "BorrowOrderReleased",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "borrower",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "marketKey",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amountSent",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amountApplied",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "principalReduced",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "remainingPrincipal",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "remainingFaceValue",
        "type": "uint256"
      }
    ],
    "name": "DebtRepaid",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "lender",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "borrower",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "marketKey",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "principal",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "faceValue",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "rateBps",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "bondIndex",
        "type": "uint256"
      }
    ],
    "name": "LoanMatched",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "marketKey",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "borrowToken",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint64",
        "name": "expiry",
        "type": "uint64"
      },
      {
        "indexed": false,
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
      }
    ],
    "name": "MarketCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "marketKey",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newClaimedEth",
        "type": "uint256"
      }
    ],
    "name": "MarketEscrowClaimed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "marketKey",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newEscrowedEth",
        "type": "uint256"
      }
    ],
    "name": "MarketEscrowFunded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "borrower",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "marketKey",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "lossAmount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "cumulativeLosses",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "remainingBorrowerPrincipal",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "remainingBorrowerFaceValue",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "remainingOutstandingFaceValue",
        "type": "uint256"
      }
    ],
    "name": "MarketLossRecorded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "marketKey",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "initialRecoveryRateRay",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "totalRecoveredAtSettlement",
        "type": "uint256"
      }
    ],
    "name": "MarketPrimarySettled",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "marketKey",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "active",
        "type": "bool"
      }
    ],
    "name": "MarketStatusChanged",
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
        "internalType": "bool",
        "name": "enabled",
        "type": "bool"
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
      }
    ],
    "name": "RiskLevelSet",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "oldRiskModule",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newRiskModule",
        "type": "address"
      }
    ],
    "name": "RiskModuleSet",
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
    "name": "LOSS_MANAGER_ROLE",
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
    "name": "ORDERBOOK_ROLE",
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
    "name": "YEAR",
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
    "name": "accountHasDebt",
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
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "bondLots",
    "outputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "marketKey",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "faceValue",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "initialRedeemed",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "supplementalClaimedPerFaceRay",
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
        "name": "bondIndex",
        "type": "uint256"
      }
    ],
    "name": "claimSupplemental",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "amount",
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
        "name": "",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "debts",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "principal",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "faceValue",
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
        "name": "borrowToken",
        "type": "address"
      },
      {
        "internalType": "uint64",
        "name": "expiry",
        "type": "uint64"
      },
      {
        "internalType": "uint16",
        "name": "riskLevel",
        "type": "uint16"
      }
    ],
    "name": "ensureMarket",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "marketKey",
        "type": "bytes32"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "lender",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "borrower",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "marketKey",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "principal",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "rateBps",
        "type": "uint256"
      }
    ],
    "name": "executeMatch",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "bondIndex",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "faceValue",
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
        "name": "account",
        "type": "address"
      }
    ],
    "name": "getAccountPendingBorrow",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "pendingBorrowEth",
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
    "name": "getAccountPendingBorrowProceeds",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "pendingBorrowProceedsEth",
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
    "name": "getAccountTotalDebt",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "totalDebtEth",
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
        "name": "bondIndex",
        "type": "uint256"
      }
    ],
    "name": "getBondInitialClaimable",
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
        "name": "bondIndex",
        "type": "uint256"
      }
    ],
    "name": "getBondLot",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "internalType": "bytes32",
            "name": "marketKey",
            "type": "bytes32"
          },
          {
            "internalType": "uint256",
            "name": "faceValue",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "initialRedeemed",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "supplementalClaimedPerFaceRay",
            "type": "uint256"
          }
        ],
        "internalType": "struct LendingContract.BondLot",
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
        "internalType": "uint256",
        "name": "bondIndex",
        "type": "uint256"
      }
    ],
    "name": "getBondSupplementalClaimable",
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
    "name": "getBorrowerActiveMarkets",
    "outputs": [
      {
        "internalType": "bytes32[]",
        "name": "",
        "type": "bytes32[]"
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
    "name": "getBorrowerPendingMarkets",
    "outputs": [
      {
        "internalType": "bytes32[]",
        "name": "",
        "type": "bytes32[]"
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
      }
    ],
    "name": "getDebt",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "principal",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "faceValue",
            "type": "uint256"
          }
        ],
        "internalType": "struct LendingContract.DebtPosition",
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
        "name": "marketKey",
        "type": "bytes32"
      }
    ],
    "name": "getMarket",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "borrowToken",
            "type": "address"
          },
          {
            "internalType": "uint64",
            "name": "expiry",
            "type": "uint64"
          },
          {
            "internalType": "uint16",
            "name": "riskLevel",
            "type": "uint16"
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
            "internalType": "bool",
            "name": "active",
            "type": "bool"
          }
        ],
        "internalType": "struct LendingContract.MarketConfig",
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
        "name": "marketKey",
        "type": "bytes32"
      }
    ],
    "name": "getMarketClaimableLiquidity",
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
      }
    ],
    "name": "getMarketSettlement",
    "outputs": [
      {
        "components": [
          {
            "internalType": "bool",
            "name": "primarySettled",
            "type": "bool"
          },
          {
            "internalType": "uint64",
            "name": "settlementTimestamp",
            "type": "uint64"
          },
          {
            "internalType": "uint256",
            "name": "initialRecoveryRateRay",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "supplementalRecoveryPerFaceRay",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "totalRecoveredAtSettlement",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "settledTotalFaceValue",
            "type": "uint256"
          }
        ],
        "internalType": "struct LendingContract.MarketSettlement",
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
        "name": "marketKey",
        "type": "bytes32"
      }
    ],
    "name": "getMarketTotals",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "totalPrincipal",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "totalFaceValue",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "outstandingPrincipal",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "outstandingFaceValue",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "cumulativeLosses",
            "type": "uint256"
          }
        ],
        "internalType": "struct LendingContract.MarketTotals",
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
        "name": "marketKey",
        "type": "bytes32"
      }
    ],
    "name": "getRecoveryRate",
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
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "getUserBondLots",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
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
      }
    ],
    "name": "isRestricted",
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
        "name": "borrowToken",
        "type": "address"
      },
      {
        "internalType": "uint64",
        "name": "expiry",
        "type": "uint64"
      },
      {
        "internalType": "uint16",
        "name": "riskLevel",
        "type": "uint16"
      }
    ],
    "name": "isValidMarket",
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
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "marketClaimedEth",
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
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "marketEscrowedEth",
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
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "marketExists",
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
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "marketSettlements",
    "outputs": [
      {
        "internalType": "bool",
        "name": "primarySettled",
        "type": "bool"
      },
      {
        "internalType": "uint64",
        "name": "settlementTimestamp",
        "type": "uint64"
      },
      {
        "internalType": "uint256",
        "name": "initialRecoveryRateRay",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "supplementalRecoveryPerFaceRay",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "totalRecoveredAtSettlement",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "settledTotalFaceValue",
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
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "marketTotals",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "totalPrincipal",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "totalFaceValue",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "outstandingPrincipal",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "outstandingFaceValue",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "cumulativeLosses",
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
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "markets",
    "outputs": [
      {
        "internalType": "address",
        "name": "borrowToken",
        "type": "address"
      },
      {
        "internalType": "uint64",
        "name": "expiry",
        "type": "uint64"
      },
      {
        "internalType": "uint16",
        "name": "riskLevel",
        "type": "uint16"
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
        "internalType": "bool",
        "name": "active",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "nextBondIndex",
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
        "name": "borrower",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "marketKey",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "onBorrowOrderCancelled",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "borrower",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "marketKey",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "onBorrowOrderPlaced",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "borrower",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "newMarketKey",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "onRolloverBorrowOrderCancelled",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "borrower",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "newMarketKey",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "onRolloverBorrowOrderMatched",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "borrower",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "newMarketKey",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "bytes32",
        "name": "repayMarketKey",
        "type": "bytes32"
      }
    ],
    "name": "onRolloverBorrowOrderPlaced",
    "outputs": [],
    "stateMutability": "nonpayable",
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
    "name": "pendingBorrowPrincipal",
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
        "name": "",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "pendingRolloverBorrowPrincipal",
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
        "name": "borrower",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "marketKey",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "lossAmount",
        "type": "uint256"
      }
    ],
    "name": "recordBorrowerMarketLoss",
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
      }
    ],
    "name": "recoveredBeforeSettlement",
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
        "name": "bondIndex",
        "type": "uint256"
      }
    ],
    "name": "redeemInitial",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "amount",
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
        "name": "marketKey",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "repayDebtFromAccountVault",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "applied",
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
        "name": "borrower",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "marketKey",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "repayDebtFromAccountVaultFor",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "applied",
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
        "name": "borrower",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "marketKey",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "repayDebtFromVaultRecovery",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "applied",
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
    "name": "riskLevels",
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
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "riskModule",
    "outputs": [
      {
        "internalType": "contract ILendingRiskModuleHook",
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
        "name": "manager",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "allowed",
        "type": "bool"
      }
    ],
    "name": "setLossManager",
    "outputs": [],
    "stateMutability": "nonpayable",
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
        "name": "active",
        "type": "bool"
      }
    ],
    "name": "setMarketActive",
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
        "internalType": "bool",
        "name": "allowed",
        "type": "bool"
      }
    ],
    "name": "setOrderBook",
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
      }
    ],
    "name": "setRiskLevel",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newRiskModule",
        "type": "address"
      }
    ],
    "name": "setRiskModule",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "marketKey",
        "type": "bytes32"
      }
    ],
    "name": "settleMarket",
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
        "internalType": "uint256",
        "name": "bondIndex",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      }
    ],
    "name": "transferBond",
    "outputs": [],
    "stateMutability": "nonpayable",
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
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "userBondLots",
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
  },
  {
    "stateMutability": "payable",
    "type": "receive"
  }
] as const;
