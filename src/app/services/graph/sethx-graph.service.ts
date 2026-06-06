import { Injectable } from '@angular/core';
import { ethers } from 'ethers';
import { formatDecimal, formatUnitsHuman } from '../../core/format/number-format';

import { environment } from '../../../environments/environment';
import { CONTRACT_ADDRESSES } from '../../contracts/generated/addresses';
import { RECENT_PROTOCOL_ACTIVITY_QUERY } from './sethx-graph.queries';
import { GraphExchangeMatch, GraphOraclePriceUpdate, RecentGraphActivity, RecentGraphActivityResult } from './sethx-graph.types';

type RecentProtocolActivityResponse = {
  oraclePriceUpdates?: GraphOraclePriceUpdate[];
  exchangeMatches?: GraphExchangeMatch[];
};

const ZERO = '0x0000000000000000000000000000000000000000';

@Injectable({ providedIn: 'root' })
export class SethxGraphService {
  readonly endpoint = (environment.sethxGraphUrl ?? '').trim();

  async recentActivity(first = 8): Promise<RecentGraphActivityResult> {
    if (!this.endpoint) {
      return { status: 'not-configured', activities: [] };
    }

    try {
      const data = await this.query<RecentProtocolActivityResponse>(RECENT_PROTOCOL_ACTIVITY_QUERY, { first });
      const oracleRows = (data.oraclePriceUpdates ?? []).map((row) => this.mapOracleActivity(row));
      const tradeRows = (data.exchangeMatches ?? []).map((row) => this.mapTradeActivity(row));
      const activities = [...oracleRows, ...tradeRows]
        .sort((a, b) => b.timestamp - a.timestamp || b.blockNumber - a.blockNumber)
        .slice(0, first);

      return { status: 'ready', activities };
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unable to load SethX Graph activity.',
        activities: [],
      };
    }
  }

  private async query<T>(query: string, variables: Record<string, unknown>): Promise<T> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      throw new Error(`SethX Graph responded with HTTP ${response.status}`);
    }

    const payload = (await response.json()) as { data?: T; errors?: { message?: string }[] };
    if (payload.errors?.length) {
      throw new Error(payload.errors.map((err) => err.message ?? 'Graph query error').join('; '));
    }
    if (!payload.data) throw new Error('SethX Graph returned no data.');
    return payload.data;
  }

  private mapOracleActivity(row: GraphOraclePriceUpdate): RecentGraphActivity {
    const meta = this.oracleMeta(row.feed);
    const timestamp = Number(row.timestamp || '0');
    return {
      id: row.id,
      kind: 'oracle',
      title: meta.title,
      ticker: meta.ticker,
      subtitle: `Oracle update · ${this.short(row.feed)} · round ${row.roundId}`,
      primaryValue: this.formatOraclePrice(meta, row.normalizedPrice),
      secondaryValue: this.formatRelativeTime(timestamp),
      blockNumber: Number(row.blockNumber ?? 0),
      timestamp,
      explorerLabel: `Block ${row.blockNumber}`,
    };
  }

  private mapTradeActivity(row: GraphExchangeMatch): RecentGraphActivity {
    const meta = this.orderBookMeta(row.orderBook, row.marketType);
    const timestamp = Number(row.timestamp || '0');
    return {
      id: row.id,
      kind: 'trade',
      title: `${meta.label} match`,
      ticker: meta.ticker,
      subtitle: `Maker #${row.makerOrderId} · Taker #${row.takerOrderId} · ${this.short(row.takerUser)}`,
      primaryValue: this.formatTradeValue(row),
      secondaryValue: this.formatRelativeTime(timestamp),
      blockNumber: Number(row.blockNumber ?? 0),
      timestamp,
      explorerLabel: `Block ${row.blockNumber}`,
    };
  }

  private oracleMeta(feed: string): { ticker: string; title: string; mode: 'ethPerUsdc' | 'sethxPerEth' | 'generic' } {
    const normalized = feed.toLowerCase();
    if (normalized === CONTRACT_ADDRESSES.SethxFeeConversionOracle.toLowerCase()) {
      return { ticker: 'SETHX/ETH', title: 'SETHX fee conversion', mode: 'sethxPerEth' };
    }
    if (normalized === '0x986b5e1e1755e3c2440e960477f25201b0a8bbd4') {
      return { ticker: 'USDC/ETH', title: 'USDC priced in ETH', mode: 'ethPerUsdc' };
    }
    
    if (normalized === '0x6786d468d6d1eb1461ac80d61058270cca67d9e2') {
      return { ticker: 'USDC/ETH', title: 'USDC priced in ETH', mode: 'ethPerUsdc' };
    }
    return { ticker: 'ORACLE', title: 'Protocol oracle sync', mode: 'generic' };
  }

  private orderBookMeta(orderBook: string, marketType: string): { ticker: string; label: string } {
    const normalized = orderBook.toLowerCase();
    const rows: Record<string, { ticker: string; label: string }> = {
      [CONTRACT_ADDRESSES.TokenSpotOrderBook.toLowerCase()]: { ticker: 'TOKEN/SPOT', label: 'Token spot' },
      [CONTRACT_ADDRESSES.NFTSpotOrderBook.toLowerCase()]: { ticker: 'NFT/SPOT', label: 'NFT spot' },
      [CONTRACT_ADDRESSES.OptionsOrderBook.toLowerCase()]: { ticker: 'OPTIONS', label: 'Options' },
      [CONTRACT_ADDRESSES.BinaryMarginOptionsOrderBook.toLowerCase()]: { ticker: 'BINARY', label: 'Binary options' },
      [CONTRACT_ADDRESSES.MarginOptionsOrderBook.toLowerCase()]: { ticker: 'MARGIN', label: 'Margin options' },
      [CONTRACT_ADDRESSES.FuturesOrderBook.toLowerCase()]: { ticker: 'FUTURES', label: 'Futures' },
      [CONTRACT_ADDRESSES.LendingOrderBook.toLowerCase()]: { ticker: 'LENDING', label: 'Lending' },
    };
    return rows[normalized] ?? { ticker: marketType || 'MARKET', label: marketType || 'Market' };
  }

  private formatOraclePrice(meta: { mode: 'ethPerUsdc' | 'sethxPerEth' | 'generic' }, raw: string): string {
    try {
      if (meta.mode === 'ethPerUsdc') {
        return this.formatEthPerUsdc(raw);
      }
      if (meta.mode === 'sethxPerEth') {
        return `1 ETH = ${formatUnitsHuman(BigInt(raw || '0'), 18, { maxDecimals: 2, compactFrom: 1_000_000 })} SETHX`;
      }
      return formatUnitsHuman(BigInt(raw || '0'), 18, { maxDecimals: 6, compactFrom: 1_000_000 });
    } catch {
      return raw || '—';
    }
  }


  private formatEthPerUsdc(raw: string): string {
    const value = Number(ethers.formatUnits(BigInt(raw || '0'), 18));
    if (!Number.isFinite(value) || value <= 0) return '—';
    if (value < 0.000001) return `${formatDecimal(value * 1_000_000, { maxDecimals: 6 })} ETH / M USDC`;
    if (value < 0.001) return `${formatDecimal(value * 1_000, { maxDecimals: 6 })} ETH / K USDC`;
    return `${formatDecimal(value, { maxDecimals: 8 })} ETH / USDC`;
  }

  private formatTradeValue(row: GraphExchangeMatch): string {
    const premium = this.toBigInt(row.premiumAmount);
    const payout = this.toBigInt(row.payoutAmount);
    const fee = this.toBigInt(row.totalFeeCharged);
    if (premium > 0n) return `${formatUnitsHuman(premium, 18, { maxDecimals: 6, compactFrom: 1_000_000 })} ETH premium`;
    if (payout > 0n) return `${formatUnitsHuman(payout, 18, { maxDecimals: 6, compactFrom: 1_000_000 })} ETH notional`;
    if (fee > 0n) return `${formatUnitsHuman(fee, 18, { maxDecimals: 6, compactFrom: 1_000_000 })} ETH fee`;
    return 'Matched';
  }

  private toBigInt(value: string | null | undefined): bigint {
    try { return BigInt(value ?? '0'); } catch { return 0n; }
  }

  private short(value: string | null | undefined): string {
    if (!value || value === ZERO) return '—';
    return value.length > 14 ? `${value.slice(0, 6)}…${value.slice(-4)}` : value;
  }

  private formatRelativeTime(timestampSeconds: number): string {
    if (!timestampSeconds) return '—';
    const diff = Math.max(0, Date.now() - timestampSeconds * 1000);
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 48) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }
}
