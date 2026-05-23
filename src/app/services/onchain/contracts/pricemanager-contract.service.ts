import { Injectable } from '@angular/core';
import { Contract } from 'ethers';
import { CONTRACT_ABIS } from '../../../contracts/generated';
import { getContractAddress } from '../../../contracts/contract-registry';
import { EthersContractService } from './ethers-contract.service';
import { WalletConnectService } from '../../../wallet/wallet-connect.service';
import { ErrorService } from '../../shared/error.service';

@Injectable({ providedIn: 'root' })
export class PriceManagerContractService extends EthersContractService<Contract> {
  protected readonly abi = CONTRACT_ABIS.PriceManager;
  protected readonly defaultAddress = getContractAddress('PriceManager');

  constructor(wallet: WalletConnectService, error: ErrorService) {
    super(wallet, error);
  }

  // === Token trust / oracle context ===

  async isTokenAllowedForContext(token: string, context: number): Promise<boolean> {
    return this.read('tokenAllowedForContext' as any, [token, context] as any);
  }

  async getUsableOracleForTokenContext(
    token: string,
    context: number,
  ): Promise<{ ok: boolean; oracle: string }> {
    const result = (await this.read(
      'getUsableOracleForTokenContext' as any,
      [token, context] as any,
    )) as any;

    return {
      ok: Boolean(result?.ok ?? result?.[0] ?? false),
      oracle: String(result?.oracle ?? result?.[1] ?? ''),
    };
  }

  async getApprovedOracles(): Promise<string[]> {
    const res = await this.read('getApprovedOracles' as any, [] as any);
    return Array.from(res as any) as string[];
  }

  async getOracleMetadata(oracle: string): Promise<{ token: string; label: string; description: string }> {
    const meta = await this.read('getOracleMetadata' as any, [oracle] as any) as any;
    return {
      token: String(meta?.token ?? meta?.[0] ?? ''),
      label: String(meta?.label ?? meta?.[1] ?? ''),
      description: String(meta?.description ?? meta?.[2] ?? ''),
    };
  }

  async getOracleStatus(oracle: string): Promise<number> {
    const status = await this.read('getOracleStatus' as any, [oracle] as any);
    return Number(status ?? 0);
  }

  async getApprovedOraclesForContext(context: number): Promise<string[]> {
    const res = await this.read('getApprovedOraclesForContext' as any, [context] as any);
    return Array.from(res as any) as string[];
  }

}
