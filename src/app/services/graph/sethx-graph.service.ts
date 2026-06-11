import { Injectable } from "@angular/core";
import { ethers } from "ethers";
import {
  formatDecimal,
  formatUnitsHuman,
} from "../../core/format/number-format";

import { environment } from "../../../environments/environment";
import { CONTRACT_ADDRESSES } from "../../contracts/generated/addresses";
import {
  BinaryMarginOptionsOrderBookAbi,
  FuturesOrderBookAbi,
  LendingOrderBookAbi,
  NFTSpotOrderBookAbi,
  OptionsOrderBookAbi,
  PriceManagerAbi,
  TokenSpotOrderBookAbi,
  MarginOptionsOrderBookAbi,
} from "../../contracts/generated/abis";
import {
  GRAPH_META_QUERY,
  RECENT_PROTOCOL_ACTIVITY_QUERY,
} from "./sethx-graph.queries";
import {
  GraphExchangeMatch,
  GraphOraclePriceUpdate,
  RecentGraphActivity,
  RecentGraphActivityOptions,
  RecentGraphActivityResult,
  RecentGraphBlockRange,
} from "./sethx-graph.types";

type ActivitySource = {
  address: string;
  ticker: string;
  label: string;
  interface: ethers.Interface;
  eventNames: readonly string[];
};

type ParsedActivityLog = {
  source: ActivitySource;
  eventName: string;
  log: ethers.Log;
  parsed: ethers.LogDescription;
};

type ActivityLogWindow = {
  fromBlock: number;
  toBlock: number;
  logs: ParsedActivityLog[];
};

type RecentActivityScanState = {
  activitiesById: Map<string, RecentGraphActivity>;
  minTimestamp: number;
  scannedRange: RecentGraphBlockRange | undefined;
  scannedWindows: number;
  publishProgress: (currentWindow?: RecentGraphBlockRange) => void;
};

type RecentProtocolActivityGraphResponse = {
  oraclePriceUpdates?: GraphOraclePriceUpdate[];
  exchangeMatches?: GraphExchangeMatch[];
};

type GraphMetaResponse = {
  _meta?: {
    block?: {
      number?: number | string;
    };
  };
};

type GraphEnvelope<T> = {
  data?: T;
  errors?: Array<{ message?: string }>;
};

const ZERO = "0x0000000000000000000000000000000000000000";
const RECENT_HISTORY_BLOCK_WINDOW = 10;
const RECENT_GRAPH_WINDOW_RESULT_LIMIT = 100;
const RECENT_HISTORY_LOOKBACK_SECONDS = 1 * 5 * 60;
const RECENT_HISTORY_HEAD_SAFETY_BLOCKS = 2;
const RECENT_HISTORY_HEAD_RETRY_LIMIT = 12;
const RECENT_HISTORY_ESTIMATED_BLOCK_SECONDS = 12;
const RECENT_HISTORY_LOOKBACK_BLOCK_BUFFER = 32;
const RECENT_HISTORY_LOG_REQUEST_DELAY_MS = 1_000;
const RECENT_HISTORY_RATE_LIMIT_RETRY_LIMIT = 5;
const RECENT_HISTORY_RATE_LIMIT_BASE_DELAY_MS = 1_000;

@Injectable({ providedIn: "root" })
export class SethxGraphService {
  /**
   * Recent activity is read through the configured Graph proxy. The proxy keeps
   * the The Graph gateway API key out of the browser bundle.
   */
  readonly endpoint = (environment.sethxGraphUrl ?? "").trim();

  private provider: ethers.JsonRpcProvider | null = null;
  private readonly rpcEndpoint = (environment.rpcUrl ?? "").trim();
  private readonly blockTimestampCache = new Map<number, number>();
  private readonly sources = this.createActivitySources();
  private readonly topicToSources = this.createTopicToSources();
  private readonly activityTopics = [...this.topicToSources.keys()];
  private readonly recentActivityCache = new Map<string, RecentGraphActivity>();
  private recentActivityScannedRange: RecentGraphBlockRange | undefined;
  private recentActivityScannedWindows = 0;
  private recentActivityLookbackSeconds = RECENT_HISTORY_LOOKBACK_SECONDS;
  private recentActivityLoaded = false;

  async recentActivity(
    options: RecentGraphActivityOptions = {},
  ): Promise<RecentGraphActivityResult> {
    if (!this.endpoint) {
      return { status: "not-configured", activities: [] };
    }

    const lookbackSeconds = Math.max(
      60,
      Math.floor(options.lookbackSeconds ?? RECENT_HISTORY_LOOKBACK_SECONDS),
    );
    const minTimestamp = Math.floor(Date.now() / 1000) - lookbackSeconds;

    try {
      return await this.recentActivityFromGraph(lookbackSeconds, minTimestamp, options);
    } catch (graphError) {
      try {
        return await this.recentActivityFromRpc(lookbackSeconds, minTimestamp, options);
      } catch (rpcError) {
        const activities = this.sortAndRefreshActivities(
          new Map(this.recentActivityCache),
          minTimestamp,
        );
        return {
          status: "error",
          error: this.cleanRecentActivityError(graphError, rpcError),
          activities,
          scannedRange: this.recentActivityScannedRange,
          scannedWindows: this.recentActivityScannedWindows,
          lookbackSeconds,
        };
      }
    }
  }

  async updateRecentActivity(
    options: RecentGraphActivityOptions = {},
  ): Promise<RecentGraphActivityResult> {
    return this.recentActivity(options);
  }

  private async recentActivityFromGraph(
    lookbackSeconds: number,
    minTimestamp: number,
    options: RecentGraphActivityOptions,
  ): Promise<RecentGraphActivityResult> {
    const head = await this.readGraphHead();
    const safeHead = Math.max(0, head - RECENT_HISTORY_HEAD_SAFETY_BLOCKS);
    const startBlock = this.estimatedLookbackStartBlock(
      safeHead,
      lookbackSeconds,
    );
    const activitiesById = new Map<string, RecentGraphActivity>();
    let scannedRange: RecentGraphBlockRange | undefined;
    let scannedWindows = 0;

    for (
      let toBlock = safeHead;
      toBlock >= startBlock;
      toBlock -= RECENT_HISTORY_BLOCK_WINDOW
    ) {
      const fromBlock = Math.max(
        startBlock,
        toBlock - RECENT_HISTORY_BLOCK_WINDOW + 1,
      );
      const windowRange = { fromBlock, toBlock };
      const data = await this.queryGraph<RecentProtocolActivityGraphResponse>(
        RECENT_PROTOCOL_ACTIVITY_QUERY,
        {
          fromBlock,
          toBlock,
          first: RECENT_GRAPH_WINDOW_RESULT_LIMIT,
        },
      );

      scannedWindows += 1;
      scannedRange = this.mergeBlockRange(scannedRange, windowRange);

      for (const activity of this.mapGraphActivities(data, minTimestamp)) {
        activitiesById.set(activity.id, activity);
      }

      const activities = this.sortAndRefreshActivities(
        new Map(activitiesById),
        minTimestamp,
      );
      options.onProgress?.({
        currentWindow: windowRange,
        scannedRange,
        scannedWindows,
        activities,
      });
    }

    const activities = this.sortAndRefreshActivities(
      activitiesById,
      minTimestamp,
    );
    this.storeRecentActivityCache(
      activities,
      scannedRange,
      scannedWindows,
      lookbackSeconds,
    );

    return {
      status: "ready",
      activities,
      scannedRange,
      scannedWindows,
      lookbackSeconds,
    };
  }

  private async recentActivityFromRpc(
    lookbackSeconds: number,
    minTimestamp: number,
    options: RecentGraphActivityOptions,
  ): Promise<RecentGraphActivityResult> {
    const head = await this.readProviderHeadSafely();
    if (head === null) throw new Error("RPC endpoint is not available for recent protocol activity.");

    const safeHead = Math.max(0, head - RECENT_HISTORY_HEAD_SAFETY_BLOCKS);
    const startBlock = this.estimatedLookbackStartBlock(
      safeHead,
      lookbackSeconds,
    );
    const state: RecentActivityScanState = {
      activitiesById: new Map<string, RecentGraphActivity>(),
      minTimestamp,
      scannedRange: undefined,
      scannedWindows: 0,
      publishProgress: (currentWindow?: RecentGraphBlockRange) => {
        const activities = this.sortAndRefreshActivities(
          new Map(state.activitiesById),
          minTimestamp,
        );
        options.onProgress?.({
          currentWindow,
          scannedRange: state.scannedRange,
          scannedWindows: state.scannedWindows,
          activities,
        });
      },
    };

    for (
      let toBlock = safeHead;
      toBlock >= startBlock;
      toBlock -= RECENT_HISTORY_BLOCK_WINDOW
    ) {
      const window = await this.fetchActivityLogWindow(toBlock, startBlock);
      if (window.toBlock <= 0 && window.logs.length === 0) break;

      state.scannedWindows += 1;
      state.scannedRange = this.mergeBlockRange(state.scannedRange, {
        fromBlock: window.fromBlock,
        toBlock: window.toBlock,
      });
      await this.addActivitiesFromLogs(
        window.logs,
        state.activitiesById,
        minTimestamp,
      );
      state.publishProgress({ fromBlock: window.fromBlock, toBlock: window.toBlock });
    }

    await this.scanNewHeadRange(state);

    const activities = this.sortAndRefreshActivities(
      state.activitiesById,
      minTimestamp,
    );
    this.storeRecentActivityCache(
      activities,
      state.scannedRange,
      state.scannedWindows,
      lookbackSeconds,
    );

    return {
      status: "ready",
      activities,
      scannedRange: state.scannedRange,
      scannedWindows: state.scannedWindows,
      lookbackSeconds,
    };
  }

  private async readGraphHead(): Promise<number> {
    const data = await this.queryGraph<GraphMetaResponse>(GRAPH_META_QUERY, {});
    const head = this.graphNumber(data._meta?.block?.number);
    if (!head)
      throw new Error("Graph response did not include the indexed head block.");
    return head;
  }

  private async queryGraph<T>(
    query: string,
    variables: Record<string, unknown>,
  ): Promise<T> {
    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      throw new Error(
        `Graph request failed: ${response.status} ${response.statusText}`,
      );
    }

    const json = (await response.json()) as GraphEnvelope<T>;
    if (json.errors?.length) {
      throw new Error(
        json.errors.map((error) => error.message ?? "Graph error").join(", "),
      );
    }
    if (!json.data) {
      throw new Error("Graph response did not include data.");
    }

    return json.data;
  }

  private mapGraphActivities(
    data: RecentProtocolActivityGraphResponse,
    minTimestamp: number,
  ): RecentGraphActivity[] {
    const activities: RecentGraphActivity[] = [
      ...(data.oraclePriceUpdates ?? []).map((row) =>
        this.mapGraphOracleUpdate(row),
      ),
      ...(data.exchangeMatches ?? []).map((row) =>
        this.mapGraphExchangeMatch(row),
      ),
    ].filter((activity): activity is RecentGraphActivity => {
      if (!activity) return false;
      return activity.timestamp >= minTimestamp;
    });

    return activities
      .map((activity) => ({
        ...activity,
        secondaryValue: this.formatRelativeTime(activity.timestamp),
      }))
      .sort(
        (a, b) =>
          b.blockNumber - a.blockNumber ||
          b.timestamp - a.timestamp ||
          b.id.localeCompare(a.id),
      );
  }

  private mapGraphOracleUpdate(
    row: GraphOraclePriceUpdate,
  ): RecentGraphActivity | null {
    const timestamp = this.graphTimestamp(row.timestamp);
    const blockNumber = this.graphNumber(row.blockNumber);
    if (!timestamp || !blockNumber) return null;

    const meta = this.oracleMeta(row.feed);
    return {
      id: `oracle:${row.id}`,
      kind: "oracle",
      title: meta.title,
      ticker: meta.ticker,
      subtitle: `Oracle update · ${this.short(row.feed)}${row.roundId ? ` · round ${row.roundId}` : ""}`,
      primaryValue: this.formatOraclePrice(meta, row.normalizedPrice),
      secondaryValue: this.formatRelativeTime(timestamp),
      blockNumber,
      timestamp,
      explorerLabel: `Block ${blockNumber}`,
    };
  }

  private mapGraphExchangeMatch(
    row: GraphExchangeMatch,
  ): RecentGraphActivity | null {
    const timestamp = this.graphTimestamp(row.timestamp);
    const blockNumber = this.graphNumber(row.blockNumber);
    if (!timestamp || !blockNumber) return null;

    const label = this.graphMarketLabel(row.marketType);
    return {
      id: `trade:${row.id}`,
      kind: "trade",
      title: `${label.label} match`,
      ticker: label.ticker,
      subtitle: `Maker #${row.makerOrderId ?? "—"} · taker #${row.takerOrderId ?? "—"} · ${this.short(row.takerUser)}`,
      primaryValue: this.graphTradePrimaryValue(row),
      secondaryValue: this.formatRelativeTime(timestamp),
      blockNumber,
      timestamp,
      explorerLabel: `Block ${blockNumber}`,
    };
  }

  private graphTradePrimaryValue(row: GraphExchangeMatch): string {
    const payoutAmount = this.safeBigInt(row.payoutAmount);
    const premiumAmount = this.safeBigInt(row.premiumAmount);
    const totalFeeCharged = this.safeBigInt(row.totalFeeCharged);

    if (premiumAmount > 0n) return `${this.eth(premiumAmount)} ETH premium`;
    if (payoutAmount > 0n) return `${this.eth(payoutAmount)} ETH payout`;
    if (totalFeeCharged > 0n) return `${this.eth(totalFeeCharged)} ETH fee`;
    return "Matched";
  }

  private graphMarketLabel(marketType: string | null | undefined): {
    label: string;
    ticker: string;
  } {
    const key = (marketType ?? "").toLowerCase();
    if (key.includes("token"))
      return { label: "Token spot", ticker: "TOKEN/SPOT" };
    if (key.includes("nft")) return { label: "NFT spot", ticker: "NFT/SPOT" };
    if (key.includes("margin"))
      return { label: "Margin options", ticker: "MARGIN" };
    if (key.includes("binary"))
      return { label: "Binary options", ticker: "BINARY" };
    if (key.includes("future")) return { label: "Futures", ticker: "FUTURES" };
    if (key.includes("lend")) return { label: "Lending", ticker: "LENDING" };
    if (key.includes("option")) return { label: "Options", ticker: "OPTIONS" };
    return { label: marketType || "Protocol", ticker: marketType || "TRADE" };
  }

  private rangeFromActivities(
    activities: readonly RecentGraphActivity[],
  ): RecentGraphBlockRange | undefined {
    if (activities.length === 0) return undefined;
    return activities.reduce<RecentGraphBlockRange>(
      (range, activity) => ({
        fromBlock: Math.min(range.fromBlock, activity.blockNumber),
        toBlock: Math.max(range.toBlock, activity.blockNumber),
      }),
      {
        fromBlock: activities[0].blockNumber,
        toBlock: activities[0].blockNumber,
      },
    );
  }

  private graphTimestamp(value: string | number | null | undefined): number {
    const parsed = Number(value ?? 0);
    return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 0;
  }

  private graphNumber(value: string | number | null | undefined): number {
    const parsed = Number(value ?? 0);
    return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 0;
  }

  private safeBigInt(
    value: string | number | bigint | null | undefined,
  ): bigint {
    try {
      if (value === null || value === undefined || value === "") return 0n;
      return BigInt(value);
    } catch {
      return 0n;
    }
  }

  private cleanGraphError(error: unknown): string {
    const text = this.errorText(error);
    if (text.includes("Failed to fetch"))
      return "Unable to reach the graph proxy. Check the Cloudflare Worker URL and CORS settings.";
    if (text.toLowerCase().includes("bad indexers"))
      return "The graph indexer rejected the recent activity query.";
    return text || "Unable to load recent protocol activity from the graph.";
  }

  private cleanRecentActivityError(graphError: unknown, rpcError: unknown): string {
    const graphText = this.cleanGraphError(graphError);
    const rpcText = this.cleanRpcError(rpcError);
    if (graphText && rpcText) return `${graphText} RPC fallback also failed: ${rpcText}`;
    return graphText || rpcText || "Unable to load recent protocol activity.";
  }

  private async scanNewHeadRange(
    state: RecentActivityScanState,
  ): Promise<void> {
    if (!state.scannedRange) return;

    while (true) {
      const latestBlock = await this.readProviderHeadSafely();
      if (latestBlock === null) return;

      const safeHead = Math.max(
        0,
        latestBlock - RECENT_HISTORY_HEAD_SAFETY_BLOCKS,
      );
      const scannedTop = state.scannedRange.toBlock;
      if (scannedTop >= safeHead) return;

      const targetToBlock = Math.min(
        safeHead,
        scannedTop + RECENT_HISTORY_BLOCK_WINDOW,
      );
      const window = await this.fetchActivityLogWindow(
        targetToBlock,
        scannedTop + 1,
      );
      if (window.toBlock <= scannedTop) return;

      state.scannedWindows += 1;
      state.scannedRange = this.mergeBlockRange(state.scannedRange, {
        fromBlock: window.fromBlock,
        toBlock: window.toBlock,
      });
      await this.addActivitiesFromLogs(
        window.logs,
        state.activitiesById,
        state.minTimestamp,
        scannedTop,
      );
      state.publishProgress({
        fromBlock: window.fromBlock,
        toBlock: window.toBlock,
      });
    }
  }

  private async addActivitiesFromLogs(
    logs: ParsedActivityLog[],
    activitiesById: Map<string, RecentGraphActivity>,
    minTimestamp: number,
    minBlockExclusive = -1,
  ): Promise<void> {
    const mapped = (
      await Promise.all(
        logs
          .filter((entry) => entry.log.blockNumber > minBlockExclusive)
          .map((entry) => this.mapLogActivity(entry)),
      )
    )
      .filter((activity): activity is RecentGraphActivity => Boolean(activity))
      .filter((activity) => activity.timestamp >= minTimestamp);

    for (const activity of mapped) activitiesById.set(activity.id, activity);
  }

  private sortAndRefreshActivities(
    activitiesById: Map<string, RecentGraphActivity>,
    minTimestamp: number,
  ): RecentGraphActivity[] {
    for (const [id, activity] of activitiesById) {
      if (activity.timestamp < minTimestamp) activitiesById.delete(id);
    }

    return [...activitiesById.values()]
      .map((activity) => ({
        ...activity,
        secondaryValue: this.formatRelativeTime(activity.timestamp),
      }))
      .sort(
        (a, b) =>
          b.blockNumber - a.blockNumber ||
          b.timestamp - a.timestamp ||
          b.id.localeCompare(a.id),
      );
  }

  private getProvider(): ethers.JsonRpcProvider | null {
    if (!this.rpcEndpoint) return null;
    if (!this.provider)
      this.provider = new ethers.JsonRpcProvider(this.rpcEndpoint);
    return this.provider;
  }

  private resetRecentActivityCache(): void {
    this.recentActivityCache.clear();
    this.recentActivityScannedRange = undefined;
    this.recentActivityScannedWindows = 0;
    this.recentActivityLookbackSeconds = RECENT_HISTORY_LOOKBACK_SECONDS;
    this.recentActivityLoaded = false;
  }

  private storeRecentActivityCache(
    activities: RecentGraphActivity[],
    scannedRange: RecentGraphBlockRange | undefined,
    scannedWindows: number,
    lookbackSeconds: number,
  ): void {
    this.recentActivityCache.clear();
    for (const activity of activities)
      this.recentActivityCache.set(activity.id, activity);
    this.recentActivityScannedRange = scannedRange;
    this.recentActivityScannedWindows = scannedWindows;
    this.recentActivityLookbackSeconds = lookbackSeconds;
    this.recentActivityLoaded = true;
  }

  private mergeBlockRange(
    current: RecentGraphBlockRange | undefined,
    next: RecentGraphBlockRange,
  ): RecentGraphBlockRange {
    return current
      ? {
          fromBlock: Math.min(current.fromBlock, next.fromBlock),
          toBlock: Math.max(current.toBlock, next.toBlock),
        }
      : next;
  }

  private estimatedLookbackStartBlock(
    safeHead: number,
    lookbackSeconds: number,
  ): number {
    const estimatedBlocks =
      Math.ceil(lookbackSeconds / RECENT_HISTORY_ESTIMATED_BLOCK_SECONDS) +
      RECENT_HISTORY_LOOKBACK_BLOCK_BUFFER;
    return Math.max(0, safeHead - estimatedBlocks);
  }

  private async fetchActivityLogWindow(
    initialToBlock: number,
    minFromBlock = 0,
  ): Promise<ActivityLogWindow> {
    if (!this.getProvider()) return { fromBlock: 0, toBlock: 0, logs: [] };

    let toBlock = Math.max(0, Math.floor(initialToBlock));
    let lastError: unknown = null;

    for (
      let attempt = 0;
      attempt < RECENT_HISTORY_HEAD_RETRY_LIMIT;
      attempt += 1
    ) {
      const fromBlock = Math.max(
        0,
        minFromBlock,
        toBlock - RECENT_HISTORY_BLOCK_WINDOW + 1,
      );

      try {
        const logs = await this.fetchActivityLogs(fromBlock, toBlock);
        return { fromBlock, toBlock, logs };
      } catch (error) {
        if (!this.isBeyondCurrentHeadError(error)) throw error;
        lastError = error;

        const latestBlock = await this.readProviderHeadSafely();
        const safeHead =
          latestBlock === null
            ? toBlock - 1
            : Math.max(0, latestBlock - RECENT_HISTORY_HEAD_SAFETY_BLOCKS);
        const nextToBlock = Math.min(toBlock - 1, safeHead);

        if (nextToBlock < 0 || nextToBlock >= toBlock) break;
        toBlock = nextToBlock;
      }
    }

    throw (
      lastError ??
      new Error(
        "Unable to read recent history below the current provider head.",
      )
    );
  }

  private async fetchActivityLogs(
    fromBlock: number,
    toBlock: number,
  ): Promise<ParsedActivityLog[]> {
    if (!this.getProvider() || this.activityTopics.length === 0) return [];

    const filter: ethers.Filter = {
      address: this.sources.map((source) => source.address),
      fromBlock,
      toBlock,
      topics: [this.activityTopics],
    };

    try {
      const logs = await this.getLogsWithPacing(filter);
      return this.parseLogs(logs);
    } catch (error) {
      if (this.isBeyondCurrentHeadError(error) || this.isRateLimitError(error))
        throw error;
      if (!this.shouldRetryWithPerContractFilters(error)) throw error;

      const batches: ethers.Log[][] = [];
      for (const source of this.sources) {
        const topics = source.eventNames
          .map((eventName) => source.interface.getEvent(eventName)?.topicHash)
          .filter(Boolean) as string[];
        if (topics.length === 0) continue;
        const logs = await this.getLogsWithPacing({
          address: source.address,
          fromBlock,
          toBlock,
          topics: [topics],
        });
        batches.push(logs);
      }
      return this.parseLogs(batches.flat());
    }
  }

  private lastLogRequestAt = 0;

  private async getLogsWithPacing(
    filter: ethers.Filter,
  ): Promise<ethers.Log[]> {
    for (
      let attempt = 0;
      attempt <= RECENT_HISTORY_RATE_LIMIT_RETRY_LIMIT;
      attempt += 1
    ) {
      await this.waitForNextLogRequestSlot(attempt);

      try {
        return await this.getProvider()!.getLogs(filter);
      } catch (error) {
        if (
          !this.isRateLimitError(error) ||
          attempt >= RECENT_HISTORY_RATE_LIMIT_RETRY_LIMIT
        )
          throw error;
      }
    }

    return [];
  }

  private async waitForNextLogRequestSlot(rateLimitAttempt = 0): Promise<void> {
    const now = Date.now();
    const normalDelay = Math.max(
      0,
      RECENT_HISTORY_LOG_REQUEST_DELAY_MS - (now - this.lastLogRequestAt),
    );
    const rateLimitDelay =
      rateLimitAttempt > 0
        ? RECENT_HISTORY_RATE_LIMIT_BASE_DELAY_MS * 2 ** (rateLimitAttempt - 1)
        : 0;
    const delay = Math.max(normalDelay, rateLimitDelay);

    if (delay > 0) await new Promise((resolve) => setTimeout(resolve, delay));
    this.lastLogRequestAt = Date.now();
  }

  private parseLogs(logs: ethers.Log[]): ParsedActivityLog[] {
    const parsed: ParsedActivityLog[] = [];
    const seen = new Set<string>();

    for (const log of logs) {
      const sourceCandidates =
        this.topicToSources.get(log.topics[0]?.toLowerCase() ?? "") ?? [];
      const matchingSources = sourceCandidates.filter(
        (source) => source.address.toLowerCase() === log.address.toLowerCase(),
      );
      for (const source of matchingSources) {
        try {
          const description = source.interface.parseLog({
            topics: log.topics as string[],
            data: log.data,
          });
          if (!description || !source.eventNames.includes(description.name))
            continue;
          const id = `${log.transactionHash}:${log.index}:${description.name}`;
          if (seen.has(id)) continue;
          seen.add(id);
          parsed.push({
            source,
            eventName: description.name,
            log,
            parsed: description,
          });
          break;
        } catch {
          // Ignore logs from compatible topic filters that do not decode against this source.
        }
      }
    }

    return parsed;
  }

  private async mapLogActivity(
    entry: ParsedActivityLog,
  ): Promise<RecentGraphActivity | null> {
    const timestamp = await this.blockTimestamp(entry.log.blockNumber);
    const base = {
      id: `${entry.log.transactionHash}:${entry.log.index}`,
      kind: (entry.eventName === "OracleSynced" ? "oracle" : "trade") as
        | "oracle"
        | "trade",
      blockNumber: entry.log.blockNumber,
      timestamp,
      secondaryValue: this.formatRelativeTime(timestamp),
      explorerLabel: `Block ${entry.log.blockNumber}`,
    };

    if (entry.eventName === "OracleSynced") {
      const oracle = this.argString(entry.parsed, "oracle", 0);
      const price = this.argBigInt(entry.parsed, "price", 1);
      const status = this.argString(entry.parsed, "status", 2);
      const meta = this.oracleMeta(oracle || entry.log.address);
      return {
        ...base,
        kind: "oracle",
        title: meta.title,
        ticker: meta.ticker,
        subtitle: `Oracle update · ${this.short(oracle)}${status ? ` · ${status}` : ""}`,
        primaryValue: this.formatOraclePrice(meta, price.toString()),
      };
    }

    return {
      ...base,
      kind: "trade",
      title: `${entry.source.label} ${this.tradeVerb(entry.eventName)}`,
      ticker: entry.source.ticker,
      subtitle: this.tradeSubtitle(entry),
      primaryValue: this.tradePrimaryValue(entry),
    };
  }

  private tradeVerb(eventName: string): string {
    if (eventName === "ImbalanceMatched") return "imbalance match";
    if (eventName === "OrderMatchedWithPassive") return "passive match";
    if (eventName === "RolloverMatched") return "rollover match";
    return "match";
  }

  private tradeSubtitle(entry: ParsedActivityLog): string {
    const takerOrderId = this.argBigInt(entry.parsed, "takerOrderId", 0);
    const makerOrderId = this.argBigInt(entry.parsed, "makerOrderId", 1);
    const takerUser = this.argString(entry.parsed, "takerUser", 2);
    const marketKey =
      this.argString(entry.parsed, "marketKey", 0) ||
      this.argString(entry.parsed, "marketKey", 1);

    if (entry.eventName === "ImbalanceMatched") {
      return `Market ${this.shortBytes(marketKey)} · caller ${this.short(this.argString(entry.parsed, "caller", 1))}`;
    }
    if (entry.eventName === "OrderMatchedWithPassive") {
      return `Taker #${takerOrderId.toString()} · passive pool ${this.short(this.argString(entry.parsed, "passivePool", 2))}`;
    }
    if (entry.eventName === "RolloverMatched") {
      return `Taker #${takerOrderId.toString()} · maker #${makerOrderId.toString()} · rollover`;
    }
    if (takerUser && takerUser !== ZERO) {
      return `Maker #${makerOrderId.toString()} · taker #${takerOrderId.toString()} · ${this.short(takerUser)}`;
    }
    if (marketKey) {
      return `Maker #${makerOrderId.toString()} · taker #${takerOrderId.toString()} · market ${this.shortBytes(marketKey)}`;
    }
    return `Maker #${makerOrderId.toString()} · taker #${takerOrderId.toString()}`;
  }

  private tradePrimaryValue(entry: ParsedActivityLog): string {
    const grossPremium = this.argBigInt(entry.parsed, "grossPremium");
    const premiumAmount = this.argBigInt(entry.parsed, "premiumAmount");
    const payoutAmount = this.argBigInt(entry.parsed, "payoutAmount");
    const totalFeeCharged = this.argBigInt(entry.parsed, "totalFeeCharged");
    const feeChargedThisStep = this.argBigInt(
      entry.parsed,
      "feeChargedThisStep",
    );
    const baseAmount = this.argBigInt(entry.parsed, "baseAmount");
    const price = this.argBigInt(entry.parsed, "price");
    const principal = this.argBigInt(entry.parsed, "principal");
    const amount = this.argBigInt(entry.parsed, "amount");
    const execPrice = this.argBigInt(entry.parsed, "execPrice");
    const settlementPrice = this.argBigInt(entry.parsed, "settlementPrice");
    const rateBps = this.argBigInt(entry.parsed, "rateBps");

    if (grossPremium > 0n) return `${this.eth(grossPremium)} ETH premium`;
    if (premiumAmount > 0n) return `${this.eth(premiumAmount)} ETH premium`;
    if (payoutAmount > 0n) return `${this.eth(payoutAmount)} ETH payout`;
    if (price > 0n) return `${this.eth(price)} ETH price`;
    if (principal > 0n)
      return `${this.eth(principal)} ETH principal${rateBps > 0n ? ` @ ${formatDecimal(Number(rateBps) / 100, { maxDecimals: 2 })}%` : ""}`;
    if (baseAmount > 0n) return `${this.units(baseAmount)} base matched`;
    if (amount > 0n && execPrice > 0n)
      return `${this.units(amount)} @ ${this.eth(execPrice)} ETH`;
    if (amount > 0n && settlementPrice > 0n)
      return `${this.units(amount)} @ ${this.eth(settlementPrice)} ETH`;
    if (totalFeeCharged > 0n) return `${this.eth(totalFeeCharged)} ETH fee`;
    if (feeChargedThisStep > 0n)
      return `${this.eth(feeChargedThisStep)} ETH fee`;
    if (amount > 0n) return `${this.units(amount)} matched`;
    return "Matched";
  }

  private createActivitySources(): ActivitySource[] {
    return [
      {
        address: CONTRACT_ADDRESSES.PriceManager,
        ticker: "ORACLE",
        label: "Oracle",
        interface: new ethers.Interface(PriceManagerAbi),
        eventNames: ["OracleSynced"],
      },
      {
        address: CONTRACT_ADDRESSES.TokenSpotOrderBook,
        ticker: "TOKEN/SPOT",
        label: "Token spot",
        interface: new ethers.Interface(TokenSpotOrderBookAbi),
        eventNames: ["OrderMatched"],
      },
      {
        address: CONTRACT_ADDRESSES.NFTSpotOrderBook,
        ticker: "NFT/SPOT",
        label: "NFT spot",
        interface: new ethers.Interface(NFTSpotOrderBookAbi),
        eventNames: ["OrderMatched"],
      },
      {
        address: CONTRACT_ADDRESSES.OptionsOrderBook,
        ticker: "OPTIONS",
        label: "Options",
        interface: new ethers.Interface(OptionsOrderBookAbi),
        eventNames: ["OrderMatched"],
      },
      {
        address: CONTRACT_ADDRESSES.MarginOptionsOrderBook,
        ticker: "MARGIN",
        label: "Margin options",
        interface: new ethers.Interface(MarginOptionsOrderBookAbi),
        eventNames: ["OrderMatched"],
      },
      {
        address: CONTRACT_ADDRESSES.BinaryMarginOptionsOrderBook,
        ticker: "BINARY",
        label: "Binary options",
        interface: new ethers.Interface(BinaryMarginOptionsOrderBookAbi),
        eventNames: ["OrderMatched"],
      },
      {
        address: CONTRACT_ADDRESSES.FuturesOrderBook,
        ticker: "FUTURES",
        label: "Futures",
        interface: new ethers.Interface(FuturesOrderBookAbi),
        eventNames: [
          "OrderMatched",
          "OrderMatchedWithPassive",
          "ImbalanceMatched",
        ],
      },
      {
        address: CONTRACT_ADDRESSES.LendingOrderBook,
        ticker: "LENDING",
        label: "Lending",
        interface: new ethers.Interface(LendingOrderBookAbi),
        eventNames: ["OrderMatched", "RolloverMatched"],
      },
    ].filter((source) => ethers.isAddress(source.address));
  }

  private createTopicToSources(): Map<string, ActivitySource[]> {
    const topics = new Map<string, ActivitySource[]>();
    for (const source of this.sources) {
      for (const eventName of source.eventNames) {
        const event = source.interface.getEvent(eventName);
        if (!event) continue;
        const key = event.topicHash.toLowerCase();
        topics.set(key, [...(topics.get(key) ?? []), source]);
      }
    }
    return topics;
  }

  private async blockTimestamp(blockNumber: number): Promise<number> {
    const cached = this.blockTimestampCache.get(blockNumber);
    if (cached) return cached;
    const block = await this.getProvider()?.getBlock(blockNumber);
    const timestamp = Number(block?.timestamp ?? 0);
    if (timestamp) this.blockTimestampCache.set(blockNumber, timestamp);
    return timestamp;
  }

  private oracleMeta(feed: string): {
    ticker: string;
    title: string;
    mode: "ethPerUsdc" | "sethxPerEth" | "generic";
  } {
    const normalized = feed.toLowerCase();
    if (
      normalized === CONTRACT_ADDRESSES.SethxFeeConversionOracle.toLowerCase()
    ) {
      return {
        ticker: "SETHX/ETH",
        title: "SETHX fee conversion",
        mode: "sethxPerEth",
      };
    }
    if (normalized === "0x986b5e1e1755e3c2440e960477f25201b0a8bbd4") {
      return {
        ticker: "USDC/ETH",
        title: "USDC priced in ETH",
        mode: "ethPerUsdc",
      };
    }
    if (normalized === "0x6786d468d6d1eb1461ac80d61058270cca67d9e2") {
      return {
        ticker: "USDC/ETH",
        title: "USDC priced in ETH",
        mode: "ethPerUsdc",
      };
    }
    return { ticker: "ORACLE", title: "Protocol oracle sync", mode: "generic" };
  }

  private formatOraclePrice(
    meta: { mode: "ethPerUsdc" | "sethxPerEth" | "generic" },
    raw: string,
  ): string {
    try {
      if (meta.mode === "ethPerUsdc") return this.formatEthPerUsdc(raw);
      if (meta.mode === "sethxPerEth")
        return `1 ETH = ${formatUnitsHuman(BigInt(raw || "0"), 18, { maxDecimals: 2, compactFrom: 1_000_000 })} SETHX`;
      return formatUnitsHuman(BigInt(raw || "0"), 18, {
        maxDecimals: 6,
        compactFrom: 1_000_000,
      });
    } catch {
      return raw || "—";
    }
  }

  private formatEthPerUsdc(raw: string): string {
    const value = Number(ethers.formatUnits(BigInt(raw || "0"), 18));
    if (!Number.isFinite(value) || value <= 0) return "—";
    if (value < 0.000001)
      return `${formatDecimal(value * 1_000_000, { maxDecimals: 6 })} ETH / M USDC`;
    if (value < 0.001)
      return `${formatDecimal(value * 1_000, { maxDecimals: 6 })} ETH / K USDC`;
    return `${formatDecimal(value, { maxDecimals: 8 })} ETH / USDC`;
  }

  private formatRelativeTime(timestampSeconds: number): string {
    if (!timestampSeconds) return "—";
    const diff = Math.max(0, Date.now() - timestampSeconds * 1000);
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 48) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  private argBigInt(
    parsed: ethers.LogDescription,
    name: string,
    index?: number,
  ): bigint {
    try {
      const value =
        parsed.args.getValue(name) ??
        (index === undefined ? undefined : parsed.args[index]);
      if (value === undefined || value === null) return 0n;
      return BigInt(value.toString());
    } catch {
      return 0n;
    }
  }

  private argString(
    parsed: ethers.LogDescription,
    name: string,
    index?: number,
  ): string {
    try {
      const value =
        parsed.args.getValue(name) ??
        (index === undefined ? undefined : parsed.args[index]);
      return value === undefined || value === null ? "" : value.toString();
    } catch {
      return "";
    }
  }

  private eth(value: bigint): string {
    return formatUnitsHuman(value, 18, {
      maxDecimals: 6,
      compactFrom: 1_000_000,
    });
  }

  private units(value: bigint): string {
    return formatUnitsHuman(value, 18, {
      maxDecimals: 6,
      compactFrom: 1_000_000,
    });
  }

  private short(value: string | null | undefined): string {
    if (!value || value === ZERO) return "—";
    return value.length > 14
      ? `${value.slice(0, 6)}…${value.slice(-4)}`
      : value;
  }

  private shortBytes(value: string | null | undefined): string {
    if (!value) return "—";
    return value.length > 18
      ? `${value.slice(0, 10)}…${value.slice(-6)}`
      : value;
  }

  private async readProviderHeadSafely(): Promise<number | null> {
    try {
      return this.getProvider()
        ? await this.getProvider()!.getBlockNumber()
        : null;
    } catch {
      return null;
    }
  }

  private isBeyondCurrentHeadError(error: unknown): boolean {
    const message = this.errorText(error).toLowerCase();
    return (
      message.includes("beyond current head") ||
      message.includes("header not found") ||
      message.includes("future block")
    );
  }

  private isRateLimitError(error: unknown): boolean {
    const message = this.errorText(error).toLowerCase();
    return (
      message.includes("429") ||
      message.includes("rate limit") ||
      message.includes("too many requests")
    );
  }

  private shouldRetryWithPerContractFilters(error: unknown): boolean {
    const message = this.errorText(error).toLowerCase();
    return (
      message.includes("address") ||
      message.includes("topic") ||
      message.includes("filter") ||
      message.includes("array") ||
      message.includes("coalesce")
    );
  }

  private cleanRpcError(error: unknown): string {
    const text = this.errorText(error);
    if (this.isBeyondCurrentHeadError(error)) {
      return "History provider is slightly behind the latest block. Refresh recent history and try again.";
    }
    if (text.includes("eth_getLogs") && text.includes("10 block")) {
      return "Graph proxy rejected the recent activity request. Recent activity scans the last day in 10-block windows; refresh and try again.";
    }
    if (text.includes("429") || text.toLowerCase().includes("rate")) {
      return "History provider is rate limiting requests. Wait a moment and try again.";
    }
    return text || "Unable to load recent protocol history.";
  }

  private errorText(error: unknown): string {
    if (error instanceof Error) return error.message;
    try {
      return JSON.stringify(error);
    } catch {
      return String(error);
    }
  }
}
