export const GRAPH_META_QUERY = `
  query GraphMeta {
    _meta {
      block {
        number
      }
    }
  }
`;

export const RECENT_PROTOCOL_ACTIVITY_QUERY = `
  query RecentProtocolActivity($fromBlock: Int!, $toBlock: Int!, $first: Int!) {
    oraclePriceUpdates(
      first: $first
      orderBy: timestamp
      orderDirection: desc
      where: { blockNumber_gte: $fromBlock, blockNumber_lte: $toBlock }
    ) {
      id
      feed
      roundId
      normalizedPrice
      feedTimestamp
      blockNumber
      timestamp
    }
    exchangeMatches(
      first: $first
      orderBy: timestamp
      orderDirection: desc
      where: { blockNumber_gte: $fromBlock, blockNumber_lte: $toBlock }
    ) {
      id
      orderBook
      marketType
      makerOrderId
      takerOrderId
      takerUser
      payoutAmount
      premiumAmount
      totalFeeCharged
      blockNumber
      timestamp
    }
  }
`;
