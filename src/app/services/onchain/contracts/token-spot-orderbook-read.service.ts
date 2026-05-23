import { Injectable, inject } from '@angular/core';
import { ethers } from 'ethers';
import { WalletConnectService } from '../../../wallet/wallet-connect.service';
import { CONTRACT_ABIS } from '../../../contracts/generated';
import { getContractAddress } from '../../../contracts/contract-registry';

export type SpotOrder = {
  orderId: bigint;
  user: string; // account address
  baseToken: string;
  quoteToken: string;
  side: 0 | 1; // 0 Bid, 1 Ask
  price: bigint;
  amount: bigint;
  initialAmount: bigint;
  expiry: bigint;
  fixedFeeAmount: bigint;
  fixedFeeToken: string;
  percentageFeeAmount: bigint;
  percentageFeeToken: string;
  fixedFeeCharged: boolean;
};

function normAddr(x: unknown): string {
  return String(x ?? '')
    .trim()
    .toLowerCase();
}

function bi(x: any): bigint {
  // handles bigint, BigNumber-like, string, number
  try {
    return typeof x === 'bigint' ? x : BigInt(x.toString());
  } catch {
    return 0n;
  }
}

@Injectable({ providedIn: 'root' })
export class TokenSpotOrderBookReadService {
  private readonly wallet = inject(WalletConnectService);

  readonly orderBookAddress = getContractAddress('TokenSpotOrderBook');

  private async contractOrNull(): Promise<any | null> {
    const provider = await this.wallet.getEthersProvider();
    if (!provider) return null;

    return new ethers.Contract(
      this.orderBookAddress,
      CONTRACT_ABIS.TokenSpotOrderBook,
      provider,
    ) as any;
  }

  private mapOrder(o: any): SpotOrder | null {
    const user = normAddr(o?.user);
    if (!user || user === normAddr(ethers.ZeroAddress)) return null;

    return {
      orderId: bi(o.orderId),
      user,
      baseToken: normAddr(o.baseToken),
      quoteToken: normAddr(o.quoteToken),
      side: Number(o.side) === 0 ? 0 : 1,
      price: bi(o.price),
      amount: bi(o.amount),
      initialAmount: bi(o.initialAmount),
      expiry: bi(o.expiry),
      fixedFeeAmount: bi(o.fixedFeeAmount),
      fixedFeeToken: normAddr(o.fixedFeeToken),
      percentageFeeAmount: bi(o.percentageFeeAmount),
      percentageFeeToken: normAddr(o.percentageFeeToken),
      fixedFeeCharged: Boolean(o.fixedFeeCharged),
    };
  }

  async getOrder(orderId: bigint): Promise<SpotOrder | null> {
    const c = await this.contractOrNull();
    const o = await c.getOrder(orderId); // contract typed as any -> no TS4111
    return this.mapOrder(o);
  }

  async getOrderBookIds(
    baseToken: string,
    quoteToken: string,
  ): Promise<bigint[]> {
    const c = await this.contractOrNull();
    const res = await c.getOrderBook(baseToken, quoteToken);

    // res.bids/res.asks can be bigint[] or BigNumber-like depending on env.
    const ids = [...(res?.bids ?? []), ...(res?.asks ?? [])].map((x: any) =>
      bi(x),
    );
    return ids.filter((id) => id !== 0n);
  }

  async getUserOrderIds(account: string): Promise<bigint[]> {
    const c = await this.contractOrNull();
    const arr = await c.getUserOrders(account);
    return (arr ?? []).map((x: any) => bi(x)).filter((id: bigint) => id !== 0n);
  }

  // ---- concurrency-limited loader ----
  async loadOrdersByIds(
    ids: bigint[],
    opts?: { max?: number; includeExpired?: boolean },
  ): Promise<SpotOrder[]> {
    const max = opts?.max ?? 10;
    const includeExpired = opts?.includeExpired ?? true;

    const out: SpotOrder[] = [];
    let i = 0;

    const runOne = async () => {
      while (i < ids.length) {
        const id = ids[i++];
        const o = await this.getOrder(id);
        if (!o) continue;
        if (o.amount <= 0n) continue;

        if (!includeExpired && o.expiry !== 0n) {
          const now = BigInt(Math.floor(Date.now() / 1000));
          if (now > o.expiry) continue;
        }

        out.push(o);
      }
    };

    const workers = Array.from({ length: Math.min(max, ids.length) }, () =>
      runOne(),
    );
    await Promise.all(workers);

    return out;
  }

  // in TokenSpotOrderBookReadService
  async getActiveBooksPaged(
    offset: number,
    limit: number,
  ): Promise<{ bases: string[]; quotes: string[] }> {
    const c = await this.contractOrNull();
    const res = await c['getActiveBooksPaged'](offset, limit);
    const bases = (res.bases as string[]).map((x) => String(x).toLowerCase());
    const quotes = (res.quotes as string[]).map((x) => String(x).toLowerCase());
    return { bases, quotes };
  }

  async getActiveBookOrderCount(
    baseToken: string,
    quoteToken: string,
  ): Promise<bigint> {
    const c = await this.contractOrNull();
    const count = await c['getActiveBookOrderCount'](baseToken, quoteToken);
    return count;
  }
}
