import { Injectable } from '@angular/core';
import { Contract } from 'ethers';
import { EthersContractService } from './ethers-contract.service';
import { getContractAddress } from '../../../contracts/contract-registry';
import { WalletConnectService } from '../../../wallet/wallet-connect.service';
import { ErrorService } from '../../shared/error.service';

export type FeeOutput = {
  fixedAmount: bigint;
  fixedToken: string;
  percentageAmount: bigint;
  percentageToken: string;
};

@Injectable({ providedIn: 'root' })
export class FeeManagerContractService extends EthersContractService<Contract> {
  protected readonly abi = [
    'function getFeeForAccount(address paymentToken,address assetToken,uint256 assetValue,string context,address account,bool isMaker) view returns (tuple(uint256 fixedAmount,address fixedToken,uint256 percentageAmount,address percentageToken) fee)',
    'function getRoleFeeConfig(string context) view returns (uint256 makerFixedFee,uint256 makerPercentageFee,uint256 takerFixedFee,uint256 takerPercentageFee,bool configured)',
    'function accountDiscountBps(address account) view returns (uint256)',
    'function sethxDiscountBps() view returns (uint256)',
    'function sethxToken() view returns (address)',
    'function getAcceptedPaymentTokens() view returns (address[])',
    'function isAcceptedFeeToken(address token) view returns (bool)',
    'function priceManager() view returns (address)',
  ];
  protected readonly defaultAddress = getContractAddress('FeeManager');

  constructor(wallet: WalletConnectService, error: ErrorService) {
    super(wallet, error);
  }
  private mapFeeOutput(fee: any): FeeOutput {
    return {
      fixedAmount: fee.fixedAmount as bigint,
      fixedToken: fee.fixedToken as string,
      percentageAmount: fee.percentageAmount as bigint,
      percentageToken: fee.percentageToken as string,
    };
  }

  async getFeeForAccount(
    paymentToken: string,
    assetToken: string,
    assetValue: bigint,
    context: string,
    account: string,
    isMaker: boolean,
  ): Promise<FeeOutput> {
    const fee = await this.read(
      'getFeeForAccount' as any,
      [paymentToken, assetToken, assetValue, context, account, isMaker] as any,
    );
    return this.mapFeeOutput(fee);
  }

  async getRoleFeeConfig(context: string): Promise<{ makerFixedFee: bigint; makerPercentageFee: bigint; takerFixedFee: bigint; takerPercentageFee: bigint; configured: boolean }> {
    const cfg = await this.read('getRoleFeeConfig' as any, [context] as any);
    return {
      makerFixedFee: cfg.makerFixedFee ?? cfg[0],
      makerPercentageFee: cfg.makerPercentageFee ?? cfg[1],
      takerFixedFee: cfg.takerFixedFee ?? cfg[2],
      takerPercentageFee: cfg.takerPercentageFee ?? cfg[3],
      configured: Boolean(cfg.configured ?? cfg[4] ?? false),
    };
  }

  async getAccountDiscountBps(account: string): Promise<bigint> {
    return this.read('accountDiscountBps' as any, [account] as any);
  }


  async getSethxDiscountBps(): Promise<bigint> {
    return this.read('sethxDiscountBps' as any, [] as any);
  }

  async getSethxToken(): Promise<string> {
    return this.read('sethxToken' as any, [] as any);
  }

  async getAcceptedPaymentTokens(): Promise<string[]> {
    return this.read('getAcceptedPaymentTokens' as any, [] as any);
  }
}
