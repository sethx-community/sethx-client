import { Injectable } from '@angular/core';
import { Contract, ethers } from 'ethers';
import { EthersContractService } from './ethers-contract.service';
import { getContractAddress } from '../../../contracts/contract-registry';
import { CONTRACT_ABIS } from '../../../contracts/generated';
import { WalletConnectService } from '../../../wallet/wallet-connect.service';
import { ErrorService } from '../../shared/error.service';


const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const ETH_PSEUDO_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

function normalizeFeeAddress(value: string, label: string): string {
  const raw = String(value ?? '').trim();
  if (!raw) throw new Error(`${label} is required for fee quote.`);

  const lower = raw.toLowerCase();
  if (
    lower === 'eth' ||
    lower === 'ether' ||
    lower === 'native' ||
    lower === ETH_PSEUDO_ADDRESS.toLowerCase()
  ) {
    return ZERO_ADDRESS;
  }

  if (!ethers.isAddress(raw)) {
    throw new Error(`${label} is not a valid address: ${raw}`);
  }

  return ethers.getAddress(raw);
}

export type FeeOutput = {
  fixedAmount: bigint;
  fixedToken: string;
  percentageAmount: bigint;
  percentageToken: string;
};

@Injectable({ providedIn: 'root' })
export class FeeManagerContractService extends EthersContractService<Contract> {
  protected readonly abi = CONTRACT_ABIS.FeeManager;
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
    const normalizedPaymentToken = normalizeFeeAddress(paymentToken, 'Fee payment token');
    const normalizedAssetToken = normalizeFeeAddress(assetToken, 'Fee asset token');
    const normalizedAccount = normalizeFeeAddress(account, 'Fee account');

    const fee = await this.read(
      'getFeeForAccount' as any,
      [
        normalizedPaymentToken,
        normalizedAssetToken,
        assetValue,
        context,
        normalizedAccount,
        isMaker,
      ] as any,
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

  async getPendingRoleFeeUpdate(context: string): Promise<{ makerFixedFee: bigint; makerPercentageFee: bigint; takerFixedFee: bigint; takerPercentageFee: bigint; executeAfter: bigint }> {
    const pending = await this.read('pendingRoleUpdates' as any, [context] as any);
    return {
      makerFixedFee: pending.makerFixedFee ?? pending[0],
      makerPercentageFee: pending.makerPercentageFee ?? pending[1],
      takerFixedFee: pending.takerFixedFee ?? pending[2],
      takerPercentageFee: pending.takerPercentageFee ?? pending[3],
      executeAfter: pending.executeAfter ?? pending[4],
    };
  }

  async getPendingSethxDiscountUpdate(): Promise<{ discountBps: bigint; executeAfter: bigint }> {
    const pending = await this.read('pendingSethxDiscountUpdate' as any, [] as any);
    return {
      discountBps: pending.discountBps ?? pending[0],
      executeAfter: pending.executeAfter ?? pending[1],
    };
  }

  async getFeeUpdateDelay(): Promise<bigint> {
    return this.read('feeUpdateDelay' as any, [] as any);
  }

}
