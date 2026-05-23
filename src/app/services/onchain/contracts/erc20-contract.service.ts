import { Injectable } from '@angular/core';
import { Contract as EthersContract } from 'ethers';
import { EthersContractService } from './ethers-contract.service';
import { ERC20_ABI } from './sethx.abi';
import { WalletConnectService } from '../../../wallet/wallet-connect.service';
import { ErrorService } from '../../shared/error.service';
import { norm } from '../../../core/tokens//token-normalize';

@Injectable({ providedIn: 'root' })
export class ERC20ContractService extends EthersContractService<EthersContract> {
  protected readonly abi = ERC20_ABI;
  protected readonly defaultAddress = undefined;

  private readonly symbolCache = new Map<string, Promise<string>>();
  private readonly nameCache = new Map<string, Promise<string>>();
  private readonly decimalsCache = new Map<string, Promise<number>>();

  constructor(wallet: WalletConnectService, error: ErrorService) {
    super(wallet, error);
  }

  private cached<T>(
    cache: Map<string, Promise<T>>,
    key: string,
    factory: () => Promise<T>,
  ): Promise<T> {
    const hit = cache.get(key);
    if (hit) return hit;

    const p = factory().catch((e) => {
      cache.delete(key);
      throw e;
    });

    cache.set(key, p);
    return p;
  }

  private readString(
    address: string,
    method: 'symbol' | 'name',
  ): Promise<string> {
    return this.read(method as any, [] as any, address).then((x: any) =>
      String(x),
    );
  }

  private readNumber(address: string, method: 'decimals'): Promise<number> {
    return this.read(method as any, [] as any, address).then((d: any) =>
      Number(d),
    );
  }

  getSymbol(token: string): Promise<string> {
    const key = norm(token);
    if (!key) return Promise.reject(new Error('Missing token address'));
    return this.cached(this.symbolCache, key, () =>
      this.readString(key, 'symbol'),
    );
  }

  getName(token: string): Promise<string> {
    const key = norm(token);
    if (!key) return Promise.reject(new Error('Missing token address'));
    return this.cached(this.nameCache, key, () => this.readString(key, 'name'));
  }

  getDecimals(token: string): Promise<number> {
    const key = norm(token);
    if (!key) return Promise.reject(new Error('Missing token address'));
    return this.cached(this.decimalsCache, key, () =>
      this.readNumber(key, 'decimals'),
    );
  }
}
