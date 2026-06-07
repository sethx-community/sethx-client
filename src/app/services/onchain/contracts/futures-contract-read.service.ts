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
  side: number;
  size: bigint;
  margin: bigint;
  referencePrice: bigint;
  liquidationPrice: bigint;
  liquidationTick: bigint;
  lossIndexSnapshot: bigint;
  marginPerUnitNorm: bigint;
  isActive: boolean;
};

export type FuturesPositionHealth = {
  position: FuturesPosition;
  unrealizedPnl: bigint;
  liveMargin: bigint;
  maintenanceMargin: bigint;
  liquidatable: boolean;
  riskRatioBps: bigint | null;
};

export type FuturesImbalanceOrder = {
  active: boolean;
  syntheticMakerSide: number;
  amount: bigint;
  settlementPrice: bigint;
};

export type FuturesLiquidationList = {
  head: string;
  tail: string;
  count: bigint;
};

export type FuturesLiquidationNode = {
  active: boolean;
  side: number;
  liquidationPrice: bigint;
  liquidationTick: bigint;
  prev: string;
  next: string;
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
    isLong?: boolean,
  ): Promise<FuturesPosition | null> {
    const c = await this.contractOrNull();
    if (!c || !account) return null;

    const res: any = await c['getPosition'](account, marketKey);
    const side = Number(res?.side ?? res?.[0] ?? 0);
    const isActive = bi(res?.size ?? res?.[1]) > 0n && side !== 0;

    // Compatibility shim: older client code asks for long and short separately.
    // New protocol stores one net position with side 1=LONG and 2=SHORT.
    if (isLong === true && side !== 1) return this.emptyPosition(1);
    if (isLong === false && side !== 2) return this.emptyPosition(2);

    return {
      side,
      size: bi(res?.size ?? res?.[1]),
      margin: bi(res?.margin ?? res?.[2]),
      referencePrice: bi(res?.referencePrice ?? res?.[3]),
      liquidationPrice: bi(res?.liquidationPrice ?? res?.[4]),
      liquidationTick: bi(res?.liquidationTick ?? res?.[5]),
      lossIndexSnapshot: bi(res?.lossIndexSnapshot ?? res?.[6]),
      marginPerUnitNorm: 0n,
      isActive,
    };
  }

  private emptyPosition(side: number): FuturesPosition {
    return {
      side,
      size: 0n,
      margin: 0n,
      referencePrice: 0n,
      liquidationPrice: 0n,
      liquidationTick: 0n,
      lossIndexSnapshot: 0n,
      marginPerUnitNorm: 0n,
      isActive: false,
    };
  }

  async positionHealth(marketKey: string, account: string): Promise<FuturesPositionHealth | null> {
    const c = await this.contractOrNull();
    if (!c || !account) return null;
    try {
      const res: any = await c['positionHealth'](marketKey, account);
      const pos = res?.position ?? res?.[0];
      const position: FuturesPosition = {
        side: Number(pos?.side ?? pos?.[0] ?? 0),
        size: bi(pos?.size ?? pos?.[1]),
        margin: bi(pos?.margin ?? pos?.[2]),
        referencePrice: bi(pos?.referencePrice ?? pos?.[3]),
        liquidationPrice: bi(pos?.liquidationPrice ?? pos?.[4]),
        liquidationTick: bi(pos?.liquidationTick ?? pos?.[5]),
        lossIndexSnapshot: bi(pos?.lossIndexSnapshot ?? pos?.[6]),
        marginPerUnitNorm: 0n,
        isActive: bi(pos?.size ?? pos?.[1]) > 0n && Number(pos?.side ?? pos?.[0] ?? 0) !== 0,
      };
      const maintenanceMargin = bi(res?.maintenanceMargin ?? res?.[3]);
      const liveMargin = bi(res?.liveMargin ?? res?.[2]);
      return {
        position,
        unrealizedPnl: bi(res?.unrealizedPnl ?? res?.[1]),
        liveMargin,
        maintenanceMargin,
        liquidatable: Boolean(res?.liquidatable ?? res?.[4]),
        riskRatioBps: maintenanceMargin > 0n ? (liveMargin * 10_000n) / maintenanceMargin : null,
      };
    } catch {
      return null;
    }
  }

  async getImbalanceOrder(marketKey: string): Promise<FuturesImbalanceOrder | null> {
    const c = await this.contractOrNull();
    if (!c) return null;
    try {
      const res: any = await c['getImbalanceOrder'](marketKey);
      return {
        active: Boolean(res?.active ?? res?.[0]),
        syntheticMakerSide: Number(res?.syntheticMakerSide ?? res?.[1] ?? 0),
        amount: bi(res?.amount ?? res?.[2]),
        settlementPrice: bi(res?.settlementPrice ?? res?.[3]),
      };
    } catch {
      return null;
    }
  }

  async getOpenInterestImbalance(marketKey: string): Promise<bigint> {
    const c = await this.contractOrNull();
    if (!c) return 0n;
    try {
      return bi(await c['getOpenInterestImbalance'](marketKey));
    } catch {
      return 0n;
    }
  }

  async getLiquidationList(marketKey: string, side: 1 | 2): Promise<FuturesLiquidationList | null> {
    const c = await this.contractOrNull();
    if (!c) return null;
    try {
      const res: any = await c['getLiquidationList'](marketKey, side);
      return {
        head: normAddr(res?.head ?? res?.[0]),
        tail: normAddr(res?.tail ?? res?.[1]),
        count: bi(res?.count ?? res?.[2]),
      };
    } catch {
      return null;
    }
  }

  async getLiquidationNode(marketKey: string, account: string): Promise<FuturesLiquidationNode | null> {
    const c = await this.contractOrNull();
    if (!c || !account) return null;
    try {
      const res: any = await c['getLiquidationNode'](marketKey, account);
      return {
        active: Boolean(res?.active ?? res?.[0]),
        side: Number(res?.side ?? res?.[1] ?? 0),
        liquidationPrice: bi(res?.liquidationPrice ?? res?.[2]),
        liquidationTick: bi(res?.liquidationTick ?? res?.[3]),
        prev: normAddr(res?.prev ?? res?.[4]),
        next: normAddr(res?.next ?? res?.[5]),
      };
    } catch {
      return null;
    }
  }

  async requireFreshImbalanceSettlement(marketKey: string): Promise<boolean> {
    const c = await this.contractOrNull();
    if (!c) return false;
    try {
      await c['requireFreshImbalanceSettlement'](marketKey);
      return true;
    } catch {
      return false;
    }
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
