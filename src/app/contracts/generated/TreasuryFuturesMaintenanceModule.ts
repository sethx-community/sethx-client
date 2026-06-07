export const ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "authority_",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "protocolTreasury_",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "futuresContract_",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "EmptyMemo",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidAddress",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidAmount",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "Unauthorized",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "oldFuturesContract",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newFuturesContract",
        "type": "address"
      }
    ],
    "name": "FuturesContractSet",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "treasurer",
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
        "internalType": "enum FuturesTypes.PositionSide",
        "name": "losingSide",
        "type": "uint8"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "scanned",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "rebased",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amountCollected",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "settlementBufferAfter",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "reimbursement",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "memo",
        "type": "string"
      }
    ],
    "name": "FuturesLosingPositionsRebasedByTreasurer",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "treasurer",
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
        "name": "newPriceRaw",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "reimbursement",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "memo",
        "type": "string"
      }
    ],
    "name": "FuturesSettlementPriceSyncedByTreasurer",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "oldValue",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newValue",
        "type": "uint256"
      }
    ],
    "name": "GasReimbursementOverheadUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "oldValue",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newValue",
        "type": "uint256"
      }
    ],
    "name": "MaxGasReimbursementUpdated",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "authority",
    "outputs": [
      {
        "internalType": "contract TreasuryAuthority",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "futuresContract",
    "outputs": [
      {
        "internalType": "contract IFuturesMaintenance",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "gasReimbursementOverhead",
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
    "name": "maxGasReimbursement",
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
    "name": "protocolTreasury",
    "outputs": [
      {
        "internalType": "contract ProtocolTreasury",
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
        "internalType": "enum FuturesTypes.PositionSide",
        "name": "losingSide",
        "type": "uint8"
      },
      {
        "internalType": "uint256",
        "name": "targetSettlementBuffer",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "maxSteps",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "memo",
        "type": "string"
      }
    ],
    "name": "rebaseFuturesLosingPositionsToBufferTarget",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "scanned",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "rebased",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "amountCollected",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "settlementBufferAfter",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "reimbursement",
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
        "name": "newFuturesContract",
        "type": "address"
      }
    ],
    "name": "setFuturesContract",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "newValue",
        "type": "uint256"
      }
    ],
    "name": "setGasReimbursementOverhead",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "newValue",
        "type": "uint256"
      }
    ],
    "name": "setMaxGasReimbursement",
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
        "internalType": "string",
        "name": "memo",
        "type": "string"
      }
    ],
    "name": "syncFuturesSettlementPrice",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "newPriceRaw",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "reimbursement",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;
