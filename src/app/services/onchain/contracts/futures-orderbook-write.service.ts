import { Injectable, inject } from '@angular/core';
import { ethers } from 'ethers';

import { TradeSettingsService } from '../../shared/trade-settings.service';
import { AccountContractService } from './account-contract.service';
import { FuturesContractReadService } from './futures-contract-read.service';
import { getContractAddress } from '../../../contracts/contract-registry';

function parseFuturesSize(value: string): bigint {
  const v = String(value ?? '').trim().replace(',', '.');
  if (!/^(?:\d+|\d*\.\d+)$/.test(v)) {
    throw new Error('Futures amount must be a valid contract amount.');
  }
  const parsed = ethers.parseUnits(v, 18);
  if (parsed <= 0n) {
    throw new Error('Futures amount must be greater than zero.');
  }
  return parsed;
}

@Injectable({ providedIn: 'root' })
export class FuturesOrderBookWriteService {
  private readonly settings = inject(TradeSettingsService);
  private readonly accountContract = inject(AccountContractService);
  private readonly futuresReads = inject(FuturesContractReadService);
  private readonly orderBookAddress = getContractAddress('FuturesOrderBook');

  private feeTokenForContract(): string {
    const pref = String(this.settings.preferredFeeToken?.() ?? '').trim().toLowerCase();
    if (!pref || pref === 'eth' || pref === 'native' || pref === 'ether' || pref === ethers.ZeroAddress.toLowerCase()) {
      return ethers.ZeroAddress;
    }
    return pref;
  }

  async placeOrder(args: {
    marketKey: string;
    side: 0 | 1;
    priceHuman: string;
    amountHuman: string;
    expiry: bigint;
  }): Promise<string | null> {
    const feeToken = this.feeTokenForContract();
    const market = await this.futuresReads.getMarket(args.marketKey);
    if (!market) throw new Error('Unknown futures market');

    const priceDecimals = Math.max(0, Number(market.oraclePriceDecimals ?? market.quoteTokenDecimals ?? 18));
    const price = ethers.parseUnits(String(args.priceHuman ?? '0').replace(',', '.'), priceDecimals);
    const amount = parseFuturesSize(String(args.amountHuman ?? '0'));

    return await this.accountContract.placeOrderFutures({
      orderBook: this.orderBookAddress,
      marketKey: args.marketKey,
      side: args.side,
      price,
      amount,
      expiry: args.expiry ?? 0n,
      feeToken,
    });
  }


  async placeOrderRaw(args: {
    marketKey: string;
    side: 0 | 1;
    price: bigint;
    amount: bigint;
    expiry?: bigint;
  }): Promise<string | null> {
    const feeToken = this.feeTokenForContract();
    return await this.accountContract.placeOrderFutures({
      orderBook: this.orderBookAddress,
      marketKey: args.marketKey,
      side: args.side,
      price: args.price,
      amount: args.amount,
      expiry: args.expiry ?? 0n,
      feeToken,
    });
  }

  async cancelOrder(orderId: bigint): Promise<string | null> {
    return await this.accountContract.cancelFuturesOrder({
      orderBook: this.orderBookAddress,
      orderId,
    });
  }
}
