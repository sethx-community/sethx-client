import { Injectable } from '@angular/core';
import { Contract as EthersContract } from 'ethers';

import { EthersContractService } from './ethers-contract.service';
import { CONTRACT_ABIS } from '../../../contracts/generated';
import { WalletConnectService } from '../../../wallet/wallet-connect.service';
import { ErrorService } from '../../shared/error.service';
import { getContractAddress } from '../../../contracts/contract-registry';

@Injectable({ providedIn: 'root' })
export class OptionContractWriteService extends EthersContractService<EthersContract> {
  protected readonly abi = CONTRACT_ABIS.OptionContract;
  protected readonly defaultAddress = getContractAddress('OptionContract');

  constructor(wallet: WalletConnectService, error: ErrorService) {
    super(wallet, error);
  }

  async exercise(marketKey: string, size: bigint): Promise<string | null> {
    return await this.call('exercise' as any, [marketKey, size] as any, 'Exercise failed');
  }

  async reclaimExpired(marketKey: string): Promise<string | null> {
    return await this.call('reclaimExpired' as any, [marketKey] as any, 'Reclaim failed');
  }
}
