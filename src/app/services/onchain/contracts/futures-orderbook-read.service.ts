import { Injectable, inject } from '@angular/core';
import { ethers } from 'ethers';

import { WalletConnectService } from '../../../wallet/wallet-connect.service';
import { getContractAddress } from '../../../contracts/contract-registry';
import { CONTRACT_ABIS } from '../../../contracts/generated';

export type FuturesOrder = {
  orderId: bigint;
  user: string;
  marketKey: string;
  side: number; // 0=Buy, 1=Sell
  amount: bigint;
  initial: bigint;
  price: bigint;
  expiry: bigint;
  timestamp: bigint;
  marginLocked: bigint;
  pnlLocked: bigint;
  collateralLocked: bigint;
  collateralSpent: bigint;
  feeToken: string;
  fixedFeeToken: string;
  fixedFeeTotal: bigint;
  fixedFeeCharged: boolean;
  pctFeeToken: string;
  pctFeeTotal: bigint;
  pctFeeCharged: bigint;
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
export class FuturesOrderBookReadService {
  private readonly wallet = inject(WalletConnectService);
  readonly orderBookAddress = getContractAddress('FuturesOrderBook');

  private async contractOrNull(): Promise<any | null> {
    const provider = await this.wallet.getEthersProvider();
    if (!provider) return null;
    return new ethers.Contract(this.orderBookAddress, CONTRACT_ABIS.FuturesOrderBook, provider) as any;
  }

  async getBook(marketKey: string, wantBuyBook: boolean): Promise<bigint[]> {
    const c = await this.contractOrNull();
    if (!c) return [];
    const res = await c['getBook'](marketKey, wantBuyBook);
    return (res ?? []).map((x: any) => bi(x)).filter((id: bigint) => id !== 0n);
  }

  async getUserOrderIds(account: string): Promise<bigint[]> {
    const c = await this.contractOrNull();
    if (!c || !account) return [];
    const res = await c['getUserOrders'](account);
    return (res ?? []).map((x: any) => bi(x)).filter((id: bigint) => id !== 0n);
  }

  async getOrder(orderId: bigint): Promise<FuturesOrder | null> {
    const c = await this.contractOrNull();
    if (!c) return null;
    const res: any = await c['ordersById'](orderId);
    const id = bi(res?.orderId ?? res?.[0]);
    if (id === 0n) return null;
    return {
      orderId: id,
      user: normAddr(res?.user ?? res?.[1]),
      marketKey: String(res?.marketKey ?? res?.[2] ?? '').toLowerCase(),
      side: Number(res?.side ?? res?.[3] ?? 0),
      amount: bi(res?.amount ?? res?.[4]),
      initial: bi(res?.initial ?? res?.[5]),
      price: bi(res?.price ?? res?.[6]),
      expiry: bi(res?.expiry ?? res?.[7]),
      timestamp: bi(res?.timestamp ?? res?.[8]),
      marginLocked: bi(res?.marginLocked ?? res?.[9]),
      pnlLocked: bi(res?.pnlLocked ?? res?.[10]),
      collateralLocked: bi(res?.collateralLocked ?? res?.[11]),
      collateralSpent: bi(res?.collateralSpent ?? res?.[12]),
      feeToken: normAddr(res?.feeToken ?? res?.[13]),
      fixedFeeToken: normAddr(res?.fixedFeeToken ?? res?.[14]),
      fixedFeeTotal: bi(res?.fixedFeeTotal ?? res?.[15]),
      fixedFeeCharged: Boolean(res?.fixedFeeCharged ?? res?.[16]),
      pctFeeToken: normAddr(res?.pctFeeToken ?? res?.[17]),
      pctFeeTotal: bi(res?.pctFeeTotal ?? res?.[18]),
      pctFeeCharged: bi(res?.pctFeeCharged ?? res?.[19]),
    };
  }
}
