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
        "name": "futuresOrderBook_",
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
    "name": "Unauthorized",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "oldOrderBook",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOrderBook",
        "type": "address"
      }
    ],
    "name": "FuturesOrderBookSet",
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
        "internalType": "address",
        "name": "futuresOrderBook",
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
        "internalType": "uint128",
        "name": "bidPrice",
        "type": "uint128"
      },
      {
        "indexed": false,
        "internalType": "uint128",
        "name": "bidSize",
        "type": "uint128"
      },
      {
        "indexed": false,
        "internalType": "uint128",
        "name": "askPrice",
        "type": "uint128"
      },
      {
        "indexed": false,
        "internalType": "uint128",
        "name": "askSize",
        "type": "uint128"
      },
      {
        "indexed": false,
        "internalType": "uint64",
        "name": "validForBlocks",
        "type": "uint64"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "memo",
        "type": "string"
      }
    ],
    "name": "PassiveSnapshotPublishedByTreasurer",
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
    "name": "futuresOrderBook",
    "outputs": [
      {
        "internalType": "contract IFuturesPassiveSnapshotOrderBook",
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
        "internalType": "uint128",
        "name": "bidPrice",
        "type": "uint128"
      },
      {
        "internalType": "uint128",
        "name": "bidSize",
        "type": "uint128"
      },
      {
        "internalType": "uint128",
        "name": "askPrice",
        "type": "uint128"
      },
      {
        "internalType": "uint128",
        "name": "askSize",
        "type": "uint128"
      },
      {
        "internalType": "uint64",
        "name": "validForBlocks",
        "type": "uint64"
      },
      {
        "internalType": "string",
        "name": "memo",
        "type": "string"
      }
    ],
    "name": "publishPassiveSnapshot",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newFuturesOrderBook",
        "type": "address"
      }
    ],
    "name": "setFuturesOrderBook",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;
