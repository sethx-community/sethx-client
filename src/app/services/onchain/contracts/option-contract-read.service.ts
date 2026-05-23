import { Injectable, inject } from '@angular/core';
import { ethers } from 'ethers';
import { WalletConnectService } from '../../../wallet/wallet-connect.service';
import { getContractAddress } from '../../../contracts/contract-registry';
import { CONTRACT_ABIS } from '../../../contracts/generated';

export type OptionMarket = {
  initialized: boolean;
  optionType: number;
  assetToken: string;
  quoteToken: string;
  strikePrice: bigint;
  expiry: bigint;
  exerciseWindow: bigint;
  totalSize: bigint;
  exercisedSize: bigint;
  writerCursor: bigint;
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
export class OptionContractReadService {
  private readonly wallet = inject(WalletConnectService);

  readonly optionContractAddress = getContractAddress('OptionContract');

  private async contractOrNull(): Promise<any | null> {
    const provider = await this.wallet.getEthersProvider();
    if (!provider) return null;
    return new ethers.Contract(
      this.optionContractAddress,
      CONTRACT_ABIS.OptionContract,
      provider,
    ) as any;
  }

  async latestTimestamp(): Promise<bigint> {
    const provider = await this.wallet.getEthersProvider();
    if (!provider) return BigInt(Math.floor(Date.now() / 1000));
    const block = await provider.getBlock('latest');
    return BigInt(block?.timestamp ?? Math.floor(Date.now() / 1000));
  }

  async computeMarketKey(args: {
    optionType: number;
    assetToken: string;
    quoteToken: string;
    strikePrice: bigint;
    expiry: bigint;
  }): Promise<string> {
    const c = await this.contractOrNull();
    const key = await c['computeMarketKey'](
      args.optionType,
      args.assetToken,
      args.quoteToken,
      args.strikePrice,
      args.expiry,
    );
    return String(key).toLowerCase();
  }

  async normalizeStrike(strikeInput: bigint): Promise<bigint> {
    const c = await this.contractOrNull();
    const res = await c['normalizeStrike'](strikeInput);
    return bi(res);
  }

  async tickForStrike(strikeInput: bigint): Promise<bigint> {
    const c = await this.contractOrNull();
    const res = await c['tickForStrike'](strikeInput);
    return bi(res);
  }

  async isValidExpiry(expiry: bigint): Promise<boolean> {
    const c = await this.contractOrNull();
    const res = await c['isValidExpiry'](expiry);
    return Boolean(res);
  }

  async getMarket(marketKey: string): Promise<OptionMarket | null> {
    const c = await this.contractOrNull();
    const res = await c['getMarket'](marketKey);

    // ethers v6 returns tuples as arrays with named props
    const initialized = Boolean(res?.initialized ?? res?.[0]);
    if (!initialized) return null;

    return {
      initialized,
      optionType: Number(res?.optionType ?? res?.[1] ?? 0),
      assetToken: normAddr(res?.assetToken ?? res?.[2]),
      quoteToken: normAddr(res?.quoteToken ?? res?.[3]),
      strikePrice: bi(res?.strikePrice ?? res?.[4]),
      expiry: bi(res?.expiry ?? res?.[5]),
      exerciseWindow: bi(res?.exerciseWindow ?? res?.[6]),
      totalSize: bi(res?.totalSize ?? res?.[7]),
      exercisedSize: bi(res?.exercisedSize ?? res?.[8]),
      writerCursor: bi(res?.writerCursor ?? res?.[9]),
    };
  }

  async getUserPosition(
    marketKey: string,
    account: string,
  ): Promise<{
    writerSize: bigint;
    holderSize: bigint;
    holderExercised: bigint;
  }> {
    const c = await this.contractOrNull();
    if (!c || !account)
      return { writerSize: 0n, holderSize: 0n, holderExercised: 0n };

    const res: any = await c['getUserPosition'](marketKey, account);
    return {
      writerSize: BigInt(res?.writerSize ?? res?.[0] ?? 0),
      holderSize: BigInt(res?.holderSize ?? res?.[1] ?? 0),
      holderExercised: BigInt(res?.holderExercised ?? res?.[2] ?? 0),
    };
  }
}
