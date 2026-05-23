import { Injectable, inject } from '@angular/core';
import { ethers } from 'ethers';
import { WalletConnectService } from '../../../wallet/wallet-connect.service';
import { getContractAddress } from '../../../contracts/contract-registry';
import { CONTRACT_ABIS } from '../../../contracts/generated';
import * as abiFunctions from '../../../shared/functions/abi.functions';

export type OptionOrder = {
  orderId: bigint;
  user: string; // account address
  marketKey: string; // bytes32
  intent: number; // enum OptionsOrderBook.OrderIntent
  size: bigint;
  askPrice: bigint;
  expiry: bigint;
  feeToken: string;
  optionType: number; // enum OptionContract.OptionType
  assetToken: string;
  quoteToken: string;
  strikePrice: bigint;
  optionExpiry: bigint;
  filled: bigint;
  closed: boolean;
  fixedFeeCharged: boolean;
};

export type OrderBookMarketMeta = {
  optionType: number;
  assetToken: string;
  quoteToken: string;
  strikePrice: bigint;
  optionExpiry: bigint;
};

function normAddr(x: unknown): string {
  return String(x ?? '')
    .trim()
    .toLowerCase();
}

function bi(x: any): bigint {
  try {
    return typeof x === 'bigint' ? x : BigInt(x.toString());
  } catch {
    return 0n;
  }
}

@Injectable({ providedIn: 'root' })
export class OptionsOrderBookReadService {
  private readonly wallet = inject(WalletConnectService);

  readonly orderBookAddress = getContractAddress('OptionsOrderBook');

  private async contractOrNull(): Promise<any | null> {
    const provider = await this.wallet.getEthersProvider();
    if (!provider) return null;

    return new ethers.Contract(
      this.orderBookAddress,
      CONTRACT_ABIS.OptionsOrderBook,
      provider,
    ) as any;
  }

  /**
   * Maps an Order struct returned by the contract.
   * NOTE: getOpenOrders() returns Order[] without marketKey, so we allow a fallback.
   */
  private mapOrder(o: any, marketKeyFallback?: string): OptionOrder | null {
    const user = normAddr(o?.user);
    if (!user || user === normAddr(ethers.ZeroAddress)) return null;

    return {
      orderId: bi(o.orderId),
      user,
      marketKey: String(o.marketKey ?? marketKeyFallback ?? '').toLowerCase(),
      intent: Number(o.intent ?? 0),
      size: bi(o.size),
      askPrice: bi(o.askPrice),
      expiry: bi(o.expiry),
      feeToken: normAddr(o.feeToken),
      optionType: Number(o.optionType ?? 0),
      assetToken: normAddr(o.assetToken),
      quoteToken: normAddr(o.quoteToken),
      strikePrice: bi(o.strikePrice),
      optionExpiry: bi(o.optionExpiry),
      filled: bi(o.filled),
      closed: Boolean(o.closed),
      fixedFeeCharged: Boolean(o.fixedFeeCharged),
    };
  }

  // -----------------
  // Active markets (Option A)
  // -----------------

  async getActiveMarketsCount(): Promise<bigint> {
    const c = await this.contractOrNull();
    const res = await c['getActiveMarketsCount']();
    return bi(res);
  }

  async getActiveMarketsPaged(
    offset: number,
    limit: number,
  ): Promise<string[]> {
    const c = await this.contractOrNull();
    if (!c) return []; // ✅ safe empty

    const res = await c['getActiveMarketsPaged'](offset, limit);

    console.log('res from getActivemarkets: ', res);
    const result = (res ?? []).map((x: any) => String(x).toLowerCase());
    console.log('result: ', result);
    return result;
  }

  async getActiveMarketOrderCount(marketKey: string): Promise<bigint> {
    const c = await this.contractOrNull();
    const res = await c['getActiveMarketOrderCount'](marketKey);
    return bi(res);
  }

  // -----------------
  // Market metadata (cached in orderbook)
  // -----------------
  async getMarketMeta(marketKey: string): Promise<OrderBookMarketMeta | null> {
    const c = await this.contractOrNull();
    if (!c) return null;
    try {
      const res = await c['marketMeta'](marketKey);
      // res can be array-like or object-like depending on ethers
      // Solidity struct fields are: (t, asset, quote, strike, expiry)
      const optionType = Number(res?.t ?? res?.optionType ?? res?.[0] ?? 0);
      const assetToken = normAddr(res?.asset ?? res?.assetToken ?? res?.[1]);
      const quoteToken = normAddr(res?.quote ?? res?.quoteToken ?? res?.[2]);
      const strikePrice = bi(res?.strike ?? res?.strikePrice ?? res?.[3]);
      const optionExpiry = bi(res?.expiry ?? res?.optionExpiry ?? res?.[4]);

      // if meta hasn't been set yet, strike/expiry will be 0
      if (strikePrice === 0n || optionExpiry === 0n) return null;

      // NOTE: asset/quote can legitimately be address(0) to represent ETH

      return { optionType, assetToken, quoteToken, strikePrice, optionExpiry };
    } catch {
      return null;
    }
  }

  // -----------------
  // Orders
  // -----------------

  /**
   * Returns open resting orders for the market (already expanded by the contract).
   */
  async getOpenOrders(
    marketKey: string,
    isLongSide: boolean,
  ): Promise<OptionOrder[]> {
    const c = await this.contractOrNull();
    if (!c) return [];

    const fnSig = 'getOpenOrders(bytes32,bool)';
    const orders = await c[fnSig](marketKey, isLongSide);

    const keys = abiFunctions.structKeysFromTupleArrayOutput(
      c.interface,
      fnSig,
    );

    const out: OptionOrder[] = [];
    for (const o of orders ?? []) {
      const named = abiFunctions.rehydrateNamedStruct(o, keys);

      const mapped = this.mapOrder(named, marketKey);

      // While debugging, don’t filter by closed unless you compute it.
      if (mapped) out.push(mapped);
    }
    return out;
  }

  async getUserOrderIds(account: string): Promise<bigint[]> {
    const c = await this.contractOrNull();
    const res = await c['getUserOrders'](account);
    return (res ?? []).map((x: any) => bi(x)).filter((id: bigint) => id !== 0n);
  }

  async getOrder(orderId: bigint): Promise<OptionOrder | null> {
    const c = await this.contractOrNull();
    const res = await c['getOrder'](orderId);
    return this.mapOrder(res);
  }

  async getMarketTotals(marketKey: string): Promise<{
    bidRemaining: bigint;
    askRemaining: bigint;
    totalRemaining: bigint;
  }> {
    const c = await this.contractOrNull();
    if (!c) return { bidRemaining: 0n, askRemaining: 0n, totalRemaining: 0n };

    const res = await c['getMarketTotals'](marketKey);

    const bidRemaining = bi(res?.bidRemaining ?? res?.[0]);
    const askRemaining = bi(res?.askRemaining ?? res?.[1]);

    return {
      bidRemaining,
      askRemaining,
      totalRemaining: bidRemaining + askRemaining,
    };
  }
}
