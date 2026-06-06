export const RECENT_PROTOCOL_ACTIVITY_QUERY = `
  query RecentProtocolActivity($first: Int!) {
    oraclePriceUpdates(first: $first, orderBy: timestamp, orderDirection: desc) {
      id
      feed
      roundId
      normalizedPrice
      feedTimestamp
      blockNumber
      timestamp
    }
    exchangeMatches(first: $first, orderBy: timestamp, orderDirection: desc) {
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
