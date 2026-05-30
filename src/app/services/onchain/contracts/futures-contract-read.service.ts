import { Injectable, inject } from '@angular/core';
import { ethers } from 'ethers';

import { WalletConnectService } from '../../../wallet/wallet-connect.service';
import { getContractAddress } from '../../../contracts/contract-registry';
import { CONTRACT_ABIS } from '../../../contracts/generated';

export type FuturesMarket = {
  ticker: string;
  oracle: string;
  oraclePriceDecimals: number;
  quoteToken: string;
  quoteTokenDecimals: number;
  initialMarginBps: bigint;
  maintenanceMarginBps: bigint;
  multiplier: bigint;
  lastSettlementPrice: bigint;
  lastSettlementBlock: bigint;
  minMarginPerUnitLongNorm: bigint;
  minMarginPerUnitShortNorm: bigint;
};

export type FuturesPosition = {
  size: bigint;
  margin: bigint;
  marginPerUnitNorm: bigint;
  isActive: boolean;
};

export type FuturesMarketStats = {
  longHolders: number;
  shortHolders: number;
  totalLongUnits: bigint;
  totalShortUnits: bigint;
  totalLongMargin: bigint;
  totalShortMargin: bigint;
};

function normAddr(x: unknown): string {
  return String(x ?? '')
    .trim()
    .toLowerCase();
}

function bi(x: any): bigint {
  try {
    return typeof x === 'bigint' ? x : BigInt(x?.toString?.() ?? '0');
  } catch {
    return 0n;
  }
}

@Injectable({ providedIn: 'root' })
export class FuturesContractReadService {
  private readonly wallet = inject(WalletConnectService);
  readonly futuresAddress = getContractAddress('FuturesContract');

  private async contractOrNull(): Promise<any | null> {
    const provider = await this.wallet.getEthersProvider();
    if (!provider) return null;
    return new ethers.Contract(
      this.futuresAddress,
      CONTRACT_ABIS.FuturesContract,
      provider,
    ) as any;
  }

  async marketCount(): Promise<number> {
    const c = await this.contractOrNull();
    if (!c) return 0;
    const res = await c['marketCount']();
    return Number(res ?? 0);
  }

  async marketKeyAt(index: number): Promise<string | null> {
    const c = await this.contractOrNull();
    if (!c) return null;
    const res = await c['marketKeyAt'](index);
    return String(res ?? '').toLowerCase();
  }

  async marketKeysPaged(offset: number, limit: number): Promise<string[]> {
    const n = await this.marketCount();
    const out: string[] = [];
    const start = Math.max(0, Math.floor(offset));
    const end = Math.min(n, start + Math.max(0, Math.floor(limit)));
    for (let i = start; i < end; i++) {
      const k = await this.marketKeyAt(i);
      if (k) out.push(k);
    }
    return out;
  }

  async isMarketActive(marketKey: string): Promise<boolean> {
    const c = await this.contractOrNull();
    if (!c) return false;
    const res = await c['marketActive'](marketKey);
    return Boolean(res);
  }

  async getMarket(marketKey: string): Promise<FuturesMarket | null> {
    const c = await this.contractOrNull();
    if (!c) return null;

    const res: any = await c['getMarket'](marketKey);
    const oracle = normAddr(res?.oracle ?? res?.[1]);
    if (!oracle || oracle === normAddr(ethers.ZeroAddress)) return null;

    return {
      ticker: String(res?.ticker ?? res?.[0] ?? ''),
      oracle,
      oraclePriceDecimals: Number(res?.oraclePriceDecimals ?? res?.[2] ?? 0),
      quoteToken: normAddr(res?.quoteToken ?? res?.[3]),
      quoteTokenDecimals: Number(res?.quoteTokenDecimals ?? res?.[4] ?? 18),
      initialMarginBps: bi(res?.initialMarginBps ?? res?.[5]),
      maintenanceMarginBps: bi(res?.maintenanceMarginBps ?? res?.[6]),
      multiplier: bi(res?.multiplier ?? res?.[7]),
      lastSettlementPrice: bi(res?.lastSettlementPrice ?? res?.[8]),
      lastSettlementBlock: bi(res?.lastSettlementBlock ?? res?.[9]),
      minMarginPerUnitLongNorm: bi(res?.minMarginPerUnitLongNorm ?? res?.[10]),
      minMarginPerUnitShortNorm: bi(
        res?.minMarginPerUnitShortNorm ?? res?.[11],
      ),
    };
  }

  async getPosition(
    account: string,
    marketKey: string,
    isLong: boolean,
  ): Promise<FuturesPosition | null> {
    const c = await this.contractOrNull();
    if (!c || !account) return null;

    const res: any = await c['getPosition'](account, marketKey, isLong);
    return {
      size: bi(res?.size ?? res?.[0]),
      margin: bi(res?.margin ?? res?.[1]),
      marginPerUnitNorm: bi(res?.marginPerUnitNorm ?? res?.[2]),
      isActive: Boolean(res?.isActive ?? res?.[3]),
    };
  }

  async getLongHolders(marketKey: string): Promise<string[]> {
    const c = await this.contractOrNull();
    if (!c) return [];
    try {
      const res: any[] = await c['getLongHolders'](marketKey);
      return (res ?? []).map((x) => normAddr(x)).filter(Boolean);
    } catch {
      return [];
    }
  }

  async getShortHolders(marketKey: string): Promise<string[]> {
    const c = await this.contractOrNull();
    if (!c) return [];
    try {
      const res: any[] = await c['getShortHolders'](marketKey);
      return (res ?? []).map((x) => normAddr(x)).filter(Boolean);
    } catch {
      return [];
    }
  }

  async getMarketStats(marketKey: string): Promise<FuturesMarketStats> {
    const [longHolders, shortHolders] = await Promise.all([
      this.getLongHolders(marketKey),
      this.getShortHolders(marketKey),
    ]);

    const [longPositions, shortPositions] = await Promise.all([
      Promise.all(longHolders.map((account) => this.getPosition(account, marketKey, true))),
      Promise.all(shortHolders.map((account) => this.getPosition(account, marketKey, false))),
    ]);

    const activeLongPositions = longPositions.filter((position) => position?.isActive);
    const activeShortPositions = shortPositions.filter((position) => position?.isActive);

    const totalLongUnits = activeLongPositions.reduce(
      (sum, position) => sum + bi(position?.size ?? 0n),
      0n,
    );
    const totalShortUnits = activeShortPositions.reduce(
      (sum, position) => sum + bi(position?.size ?? 0n),
      0n,
    );
    const totalLongMargin = activeLongPositions.reduce(
      (sum, position) => sum + bi(position?.margin ?? 0n),
      0n,
    );
    const totalShortMargin = activeShortPositions.reduce(
      (sum, position) => sum + bi(position?.margin ?? 0n),
      0n,
    );

    return {
      longHolders: activeLongPositions.length,
      shortHolders: activeShortPositions.length,
      totalLongUnits,
      totalShortUnits,
      totalLongMargin,
      totalShortMargin,
    };
  }
}
