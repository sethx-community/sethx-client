import { Injectable } from '@angular/core';
import { Contract } from 'ethers';
import { EthersContractService } from './ethers-contract.service';
import { CONTRACT_ABIS } from '../../../contracts/generated';
import { getContractAddress } from '../../../contracts/contract-registry';
import { WalletConnectService } from '../../../wallet/wallet-connect.service';
import { ErrorService } from '../../shared/error.service';

@Injectable({ providedIn: 'root' })
export class LendingAccountFactoryContractService extends EthersContractService<Contract> {
  protected readonly abi = CONTRACT_ABIS.LendingAccountFactory;
  protected readonly defaultAddress = getContractAddress(
    'LendingAccountFactory',
  );

  constructor(wallet: WalletConnectService, error: ErrorService) {
    super(wallet, error);
  }

  async createLendingAccount(): Promise<string | null> {
    return this.call(
      'createLendingAccount' as any,
      [],
      'Lending account creation failed',
    );
  }
}
