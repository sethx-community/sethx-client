import { Injectable, inject } from '@angular/core';
import { ethers } from 'ethers';

import { WalletConnectService } from '../../../wallet/wallet-connect.service';
import { CONTRACT_ABIS } from '../../../contracts/generated';
import { getContractAddress } from '../../../contracts/contract-registry';

export type LendingMarketSpec = {
  borrowToken: string;
  expiry: number;
  riskLevel: number;
};

export type LendingRiskConfig = {
  enabled: boolean;
  maxLtvBps: number;
  liquidationLtvBps: number;
};

export type LendingMarketConfig = {
  borrowToken: string;
  expiry: bigint;
  riskLevel: number;
  maxLtvBps: number;
  liquidationLtvBps: number;
  active: boolean;
};

export type LendingMarketTotals = {
  totalPrincipal: bigint;
  totalFaceValue: bigint;
  outstandingPrincipal: bigint;
  outstandingFaceValue: bigint;
  cumulativeLosses: bigint;
};

export type LendingMarketSettlement = {
  primarySettled: boolean;
  settlementTimestamp: bigint;
  initialRecoveryRateRay: bigint;
  supplementalRecoveryPerFaceRay: bigint;
  totalRecoveredAtSettlement: bigint;
  settledTotalFaceValue: bigint;
};

export type LendingOrder = {
  orderId: bigint;
  user: string;
  marketKey: string;
  riskLevel: number;
  side: 0 | 1;
  principal: bigint;
  initialPrincipal: bigint;
  rateBps: bigint;
  orderExpiry: bigint;
  timestamp: bigint;
  collateralLocked: bigint;
  isRollover: boolean;
  repayMarketKey: string;
  cancelled: boolean;
};

export type LendingMarketRow = {
  marketKey: string;
  borrowToken: string;
  tokenLabel: string;
  expiry: number;
  riskLevel: number;
  riskEnabled: boolean;
  maxLtvBps: number;
  liquidationLtvBps: number;
  exists: boolean;
  active: boolean;
  primarySettled: boolean;
  totalPrincipal: bigint;
  totalFaceValue: bigint;
  outstandingPrincipal: bigint;
  outstandingFaceValue: bigint;
  cumulativeLosses: bigint;
  lendOrders: LendingOrder[];
  borrowOrders: LendingOrder[];
  myLendOrders: number;
  myBorrowOrders: number;
};

export type LendingDebtRow = {
  marketKey: string;
  market: LendingMarketConfig | null;
  totals: LendingMarketTotals | null;
  settlement: LendingMarketSettlement | null;
  principal: bigint;
  faceValue: bigint;
  pendingPrincipal: bigint;
};

export type LendingBondLotRow = {
  bondIndex: bigint;
  owner: string;
  marketKey: string;
  market: LendingMarketConfig | null;
  faceValue: bigint;
  initialRedeemed: boolean;
  supplementalClaimedPerFaceRay: bigint;
  initialClaimable: bigint;
  supplementalClaimable: bigint;
};

export type LendingAccountSnapshot = {
  debts: LendingDebtRow[];
  pendingDebts: LendingDebtRow[];
  bonds: LendingBondLotRow[];
  orders: LendingOrder[];
};

const ZERO = ethers.ZeroAddress.toLowerCase();
const RAY = 10n ** 27n;

function normAddr(x: unknown): string {
  return String(x ?? '').trim().toLowerCase();
}

function bi(x: any): bigint {
  try {
    return typeof x === 'bigint' ? x : BigInt(x?.toString?.() ?? '0');
  } catch {
    return 0n;
  }
}

function boolValue(x: any, key: string, index: number): boolean {
  return Boolean(x?.[key] ?? x?.[index] ?? false);
}

function numberValue(x: any, key: string, index: number): number {
  return Number(x?.[key] ?? x?.[index] ?? 0);
}

@Injectable({ providedIn: 'root' })
export class LendingMarketReadService {
  private readonly wallet = inject(WalletConnectService);

  readonly lendingAddress = getContractAddress('LendingContract');
  readonly orderBookAddress = getContractAddress('LendingOrderBook');

  marketKeyFor(spec: LendingMarketSpec): string {
    const encoded = ethers.AbiCoder.defaultAbiCoder().encode(
      ['address', 'uint64', 'uint16'],
      [spec.borrowToken, BigInt(spec.expiry), spec.riskLevel],
    );
    return ethers.keccak256(encoded).toLowerCase();
  }

  recoveryRateText(settlement: LendingMarketSettlement | null, totals: LendingMarketTotals | null): string {
    if (!settlement || !totals) return '100.00%';
    let recoveryRay = RAY;

    if (settlement.primarySettled) {
      recoveryRay = settlement.initialRecoveryRateRay + settlement.supplementalRecoveryPerFaceRay;
      if (recoveryRay > RAY) recoveryRay = RAY;
    } else if (totals.totalFaceValue > 0n) {
      const remaining = totals.cumulativeLosses >= totals.totalFaceValue
        ? 0n
        : totals.totalFaceValue - totals.cumulativeLosses;
      recoveryRay = (remaining * RAY) / totals.totalFaceValue;
    }

    const bps = Number((recoveryRay * 10000n) / RAY);
    return `${(bps / 100).toFixed(2)}%`;
  }

  async loadMarketRows(specs: LendingMarketSpec[], activeAccount: string | null): Promise<LendingMarketRow[]> {
    return Promise.all(specs.map((spec) => this.loadMarketRow(spec, activeAccount)));
  }

  async loadAccountSnapshot(account: string | null): Promise<LendingAccountSnapshot> {
    const empty: LendingAccountSnapshot = { debts: [], pendingDebts: [], bonds: [], orders: [] };
    const accountKey = normAddr(account);
    if (!accountKey) return empty;

    const lending = await this.lendingContractOrNull();
    const orderBook = await this.orderBookContractOrNull();
    if (!lending) return empty;

    const [activeMarkets, pendingMarkets, bondIds, userOrderIds] = await Promise.all([
      this.readBytes32Array(lending, 'getBorrowerActiveMarkets', [accountKey]),
      this.readBytes32Array(lending, 'getBorrowerPendingMarkets', [accountKey]),
      this.readBigintArray(lending, 'getUserBondLots', [accountKey]),
      orderBook ? this.readBigintArray(orderBook, 'getUserOrders', [accountKey]) : Promise.resolve([]),
    ]);

    const [debts, pendingDebts, bonds, orders] = await Promise.all([
      Promise.all(activeMarkets.map((marketKey) => this.loadDebtRow(lending, accountKey, marketKey, false))),
      Promise.all(pendingMarkets.map((marketKey) => this.loadDebtRow(lending, accountKey, marketKey, true))),
      Promise.all(bondIds.map((id) => this.loadBondLot(lending, id))),
      orderBook ? this.loadOrdersByIds(orderBook, userOrderIds) : Promise.resolve([]),
    ]);

    return {
      debts: debts.filter((row): row is LendingDebtRow => !!row && row.faceValue > 0n),
      pendingDebts: pendingDebts.filter((row): row is LendingDebtRow => !!row && row.pendingPrincipal > 0n),
      bonds: bonds.filter((row): row is LendingBondLotRow => !!row && row.faceValue > 0n),
      orders: orders.filter((row) => !row.cancelled && row.principal > 0n),
    };
  }

  private async loadMarketRow(spec: LendingMarketSpec, activeAccount: string | null): Promise<LendingMarketRow> {
    const marketKey = this.marketKeyFor(spec);
    const activeAccountKey = normAddr(activeAccount);
    const fallbackRisk: LendingRiskConfig = {
      enabled: false,
      maxLtvBps: 0,
      liquidationLtvBps: 0,
    };

    const fallback: LendingMarketRow = {
      marketKey,
      borrowToken: normAddr(spec.borrowToken),
      tokenLabel: this.tokenLabel(spec.borrowToken),
      expiry: spec.expiry,
      riskLevel: spec.riskLevel,
      riskEnabled: false,
      maxLtvBps: 0,
      liquidationLtvBps: 0,
      exists: false,
      active: false,
      primarySettled: false,
      totalPrincipal: 0n,
      totalFaceValue: 0n,
      outstandingPrincipal: 0n,
      outstandingFaceValue: 0n,
      cumulativeLosses: 0n,
      lendOrders: [],
      borrowOrders: [],
      myLendOrders: 0,
      myBorrowOrders: 0,
    };

    const lending = await this.lendingContractOrNull();
    const orderBook = await this.orderBookContractOrNull();
    if (!lending) return fallback;

    const risk = await this.getRiskLevel(spec.riskLevel).catch(() => fallbackRisk);
    const exists = await lending['marketExists'](marketKey).catch(() => false) as boolean;

    let market: LendingMarketConfig | null = null;
    let totals: LendingMarketTotals | null = null;
    let settlement: LendingMarketSettlement | null = null;
    let lendOrders: LendingOrder[] = [];
    let borrowOrders: LendingOrder[] = [];

    if (exists) {
      [market, totals, settlement] = await Promise.all([
        this.getMarket(marketKey),
        this.getMarketTotals(marketKey),
        this.getSettlement(marketKey),
      ]);

      if (orderBook) {
        const [lendIds, borrowIds] = await Promise.all([
          this.readBigintArray(orderBook, 'getBook', [marketKey, true]),
          this.readBigintArray(orderBook, 'getBook', [marketKey, false]),
        ]);

        [lendOrders, borrowOrders] = await Promise.all([
          this.loadOrdersByIds(orderBook, lendIds),
          this.loadOrdersByIds(orderBook, borrowIds),
        ]);

        lendOrders = lendOrders.filter((order) => !order.cancelled && order.principal > 0n);
        borrowOrders = borrowOrders.filter((order) => !order.cancelled && order.principal > 0n);
      }
    }

    return {
      ...fallback,
      borrowToken: market?.borrowToken ?? fallback.borrowToken,
      expiry: Number(market?.expiry ?? BigInt(spec.expiry)),
      riskEnabled: risk.enabled,
      maxLtvBps: market?.maxLtvBps ?? risk.maxLtvBps,
      liquidationLtvBps: market?.liquidationLtvBps ?? risk.liquidationLtvBps,
      exists,
      active: market?.active ?? false,
      primarySettled: settlement?.primarySettled ?? false,
      totalPrincipal: totals?.totalPrincipal ?? 0n,
      totalFaceValue: totals?.totalFaceValue ?? 0n,
      outstandingPrincipal: totals?.outstandingPrincipal ?? 0n,
      outstandingFaceValue: totals?.outstandingFaceValue ?? 0n,
      cumulativeLosses: totals?.cumulativeLosses ?? 0n,
      lendOrders,
      borrowOrders,
      myLendOrders: activeAccountKey
        ? lendOrders.filter((order) => order.user === activeAccountKey).length
        : 0,
      myBorrowOrders: activeAccountKey
        ? borrowOrders.filter((order) => order.user === activeAccountKey).length
        : 0,
    };
  }

  async getRiskLevel(riskLevel: number): Promise<LendingRiskConfig> {
    const c = await this.lendingContractOrNull();
    if (!c) return { enabled: false, maxLtvBps: 0, liquidationLtvBps: 0 };
    const res = await c['riskLevels'](riskLevel);
    return {
      enabled: boolValue(res, 'enabled', 0),
      maxLtvBps: numberValue(res, 'maxLtvBps', 1),
      liquidationLtvBps: numberValue(res, 'liquidationLtvBps', 2),
    };
  }

  async getMarket(marketKey: string): Promise<LendingMarketConfig | null> {
    const c = await this.lendingContractOrNull();
    if (!c) return null;
    const res = await c['getMarket'](marketKey);
    const borrowToken = normAddr(res?.borrowToken ?? res?.[0]);
    if (!borrowToken && bi(res?.expiry ?? res?.[1]) === 0n) return null;
    return {
      borrowToken,
      expiry: bi(res?.expiry ?? res?.[1]),
      riskLevel: numberValue(res, 'riskLevel', 2),
      maxLtvBps: numberValue(res, 'maxLtvBps', 3),
      liquidationLtvBps: numberValue(res, 'liquidationLtvBps', 4),
      active: boolValue(res, 'active', 5),
    };
  }

  async getMarketTotals(marketKey: string): Promise<LendingMarketTotals | null> {
    const c = await this.lendingContractOrNull();
    if (!c) return null;
    const res = await c['getMarketTotals'](marketKey);
    return {
      totalPrincipal: bi(res?.totalPrincipal ?? res?.[0]),
      totalFaceValue: bi(res?.totalFaceValue ?? res?.[1]),
      outstandingPrincipal: bi(res?.outstandingPrincipal ?? res?.[2]),
      outstandingFaceValue: bi(res?.outstandingFaceValue ?? res?.[3]),
      cumulativeLosses: bi(res?.cumulativeLosses ?? res?.[4]),
    };
  }

  async getSettlement(marketKey: string): Promise<LendingMarketSettlement | null> {
    const c = await this.lendingContractOrNull();
    if (!c) return null;
    const res = await c['getMarketSettlement'](marketKey);
    return {
      primarySettled: boolValue(res, 'primarySettled', 0),
      settlementTimestamp: bi(res?.settlementTimestamp ?? res?.[1]),
      initialRecoveryRateRay: bi(res?.initialRecoveryRateRay ?? res?.[2]),
      supplementalRecoveryPerFaceRay: bi(res?.supplementalRecoveryPerFaceRay ?? res?.[3]),
      totalRecoveredAtSettlement: bi(res?.totalRecoveredAtSettlement ?? res?.[4]),
      settledTotalFaceValue: bi(res?.settledTotalFaceValue ?? res?.[5]),
    };
  }

  private async loadDebtRow(
    lending: any,
    account: string,
    marketKey: string,
    pendingOnly: boolean,
  ): Promise<LendingDebtRow | null> {
    const [market, totals, settlement] = await Promise.all([
      this.getMarket(marketKey),
      this.getMarketTotals(marketKey),
      this.getSettlement(marketKey),
    ]);

    const debt = pendingOnly
      ? null
      : await lending['getDebt'](account, marketKey).catch(() => null);
    const pending = await lending['pendingBorrowPrincipal'](account, marketKey).catch(() => 0n);

    return {
      marketKey,
      market,
      totals,
      settlement,
      principal: bi(debt?.principal ?? debt?.[0]),
      faceValue: bi(debt?.faceValue ?? debt?.[1]),
      pendingPrincipal: bi(pending),
    };
  }

  private async loadBondLot(lending: any, bondIndex: bigint): Promise<LendingBondLotRow | null> {
    const lot = await lending['getBondLot'](bondIndex).catch(() => null);
    if (!lot) return null;

    const marketKey = String(lot?.marketKey ?? lot?.[1] ?? '').toLowerCase();
    const [market, initialClaimable, supplementalClaimable] = await Promise.all([
      marketKey ? this.getMarket(marketKey) : Promise.resolve(null),
      lending['getBondInitialClaimable'](bondIndex).catch(() => 0n),
      lending['getBondSupplementalClaimable'](bondIndex).catch(() => 0n),
    ]);

    return {
      bondIndex,
      owner: normAddr(lot?.owner ?? lot?.[0]),
      marketKey,
      market,
      faceValue: bi(lot?.faceValue ?? lot?.[2]),
      initialRedeemed: boolValue(lot, 'initialRedeemed', 3),
      supplementalClaimedPerFaceRay: bi(lot?.supplementalClaimedPerFaceRay ?? lot?.[4]),
      initialClaimable: bi(initialClaimable),
      supplementalClaimable: bi(supplementalClaimable),
    };
  }

  private async loadOrdersByIds(orderBook: any, ids: bigint[]): Promise<LendingOrder[]> {
    const orders = await Promise.all(ids.map(async (id) => {
      const [raw, cancelled] = await Promise.all([
        orderBook['ordersById'](id).catch(() => null),
        orderBook['isOrderCancelled'](id).catch(() => false),
      ]);
      return raw ? this.mapOrder(raw, cancelled) : null;
    }));

    return orders.filter((order): order is LendingOrder => !!order && order.orderId > 0n);
  }

  private mapOrder(raw: any, cancelled: boolean): LendingOrder {
    return {
      orderId: bi(raw?.orderId ?? raw?.[0]),
      user: normAddr(raw?.user ?? raw?.[1]),
      marketKey: String(raw?.marketKey ?? raw?.[2] ?? '').toLowerCase(),
      riskLevel: numberValue(raw, 'riskLevel', 3),
      side: Number(raw?.side ?? raw?.[4] ?? 0) === 1 ? 1 : 0,
      principal: bi(raw?.principal ?? raw?.[5]),
      initialPrincipal: bi(raw?.initialPrincipal ?? raw?.[6]),
      rateBps: bi(raw?.rateBps ?? raw?.[7]),
      orderExpiry: bi(raw?.orderExpiry ?? raw?.[8]),
      timestamp: bi(raw?.timestamp ?? raw?.[9]),
      collateralLocked: bi(raw?.collateralLocked ?? raw?.[10]),
      isRollover: Boolean(raw?.isRollover ?? raw?.[11] ?? false),
      repayMarketKey: String(raw?.repayMarketKey ?? raw?.[12] ?? ethers.ZeroHash).toLowerCase(),
      cancelled,
    };
  }

  private async readBytes32Array(contract: any, method: string, args: any[]): Promise<string[]> {
    const res = await contract[method](...args).catch(() => []);
    return (res ?? []).map((x: any) => String(x).toLowerCase()).filter(Boolean);
  }

  private async readBigintArray(contract: any, method: string, args: any[]): Promise<bigint[]> {
    const res = await contract[method](...args).catch(() => []);
    return (res ?? []).map((x: any) => bi(x)).filter((x: bigint) => x > 0n);
  }

  private async lendingContractOrNull(): Promise<any | null> {
    const provider = await this.wallet.getEthersProvider();
    if (!provider) return null;
    return new ethers.Contract(this.lendingAddress, CONTRACT_ABIS.LendingContract, provider) as any;
  }

  private async orderBookContractOrNull(): Promise<any | null> {
    const provider = await this.wallet.getEthersProvider();
    if (!provider) return null;
    return new ethers.Contract(this.orderBookAddress, CONTRACT_ABIS.LendingOrderBook, provider) as any;
  }

  private tokenLabel(token: string): string {
    return normAddr(token) === ZERO ? 'ETH' : `${token.slice(0, 6)}...${token.slice(-4)}`;
  }
}
