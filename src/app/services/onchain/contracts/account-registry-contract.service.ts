import { Injectable } from '@angular/core';
import { Contract } from 'ethers';
import { EthersContractService } from './ethers-contract.service';
import { CONTRACT_ABIS } from '../../../contracts/generated';
import { getContractAddress } from '../../../contracts/contract-registry';
import { WalletConnectService } from '../../../wallet/wallet-connect.service';
import { ErrorService } from '../../shared/error.service';

@Injectable({ providedIn: 'root' })
export class AccountRegistryContractService extends EthersContractService<Contract> {
  protected readonly abi = CONTRACT_ABIS.AccountRegistry;
  protected readonly defaultAddress = getContractAddress('AccountRegistry');

  constructor(wallet: WalletConnectService, error: ErrorService) {
    super(wallet, error);
  }

  getAccounts(userAddress: string): Promise<string[]> {
    return this.read('getAccounts' as any, [userAddress] as any);
  }

  getNormalAccounts(userAddress: string): Promise<string[]> {
    return this.read('getNormalAccounts' as any, [userAddress] as any);
  }

  getLendingAccounts(userAddress: string): Promise<string[]> {
    return this.read('getLendingAccounts' as any, [userAddress] as any);
  }

  latestAccount(userAddress: string): Promise<string> {
    return this.read('latestAccount' as any, [userAddress] as any);
  }

  latestNormalAccount(userAddress: string): Promise<string> {
    return this.read('latestNormalAccount' as any, [userAddress] as any);
  }

  latestLendingAccount(userAddress: string): Promise<string> {
    return this.read('latestLendingAccount' as any, [userAddress] as any);
  }
  async isRegisteredAccount(account: string): Promise<boolean> {
    return this.read('isRegisteredAccount' as any, [account] as any);
  }

  async isRegisteredLendingAccount(account: string): Promise<boolean> {
    return this.read('isRegisteredLendingAccount' as any, [account] as any);
  }

  async isNormalAccountActive(account: string): Promise<boolean> {
    return this.read('isAccount' as any, [account] as any);
  }

  async isLendingAccountActive(account: string): Promise<boolean> {
    return this.read('isLendingAccount' as any, [account] as any);
  }

  async isAccountActive(account: string): Promise<boolean> {
    const isNormal = await this.isRegisteredAccount(account);

    if (isNormal) {
      return this.isNormalAccountActive(account);
    }

    const isLending = await this.isRegisteredLendingAccount(account);

    if (isLending) {
      return this.isLendingAccountActive(account);
    }

    return false;
  }

  async setAccountActive(account: string, active: boolean): Promise<void> {
    await this.call(
      'setAccountActive' as any,
      [account, active] as any,
      active ? 'Activating account failed' : 'Deactivating account failed',
    );
  }
}
