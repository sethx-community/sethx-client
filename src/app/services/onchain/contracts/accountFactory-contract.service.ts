import { Injectable } from '@angular/core';
import { Contract } from 'ethers';
import { EthersContractService } from './ethers-contract.service';
import { CONTRACT_ABIS } from '../../../contracts/generated';
import { getContractAddress } from '../../../contracts/contract-registry';
import { WalletConnectService } from '../../../wallet/wallet-connect.service';
import { ErrorService } from '../../shared/error.service';

@Injectable({ providedIn: 'root' })
export class AccountFactoryContractService extends EthersContractService<Contract> {
  protected readonly abi = CONTRACT_ABIS.AccountFactory;
  protected readonly defaultAddress = getContractAddress('AccountFactory');

  constructor(wallet: WalletConnectService, error: ErrorService) {
    super(wallet, error);
  }

  /**
   * Fires tx + waits (because base call() waits).
   * Returns void for now; event parsing stays in consumer service.
   */
  async createAccount(): Promise<string | null> {
    return this.call(
      'createAccount' as any,
      [] as any,
      'Account creation failed',
    );
  }
}
