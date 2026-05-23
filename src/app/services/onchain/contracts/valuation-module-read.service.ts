import { Injectable, inject } from '@angular/core';
import { ethers } from 'ethers';

import { CURRENT_NETWORK } from '../../../constants/network.config';
import { NETWORKS } from '../../../constants/networks';
import { CONTRACT_ABIS } from '../../../contracts/generated';
import { getContractAddress } from '../../../contracts/contract-registry';
import { WalletConnectService } from '../../../wallet/wallet-connect.service';

const BPS = 10_000n;
const ZERO = 0n;
const ZERO_ADDRESS = ethers.ZeroAddress.toLowerCase();
const LENDING_RISK_MODULE_ABI = [
  'function riskModule() view returns (address)',
] as const;

export type ValuationRiskTier = {
  enabled: boolean;
  maxLtvBps: number;
  liquidationLtvBps: number;
  longOptionHaircutBps: number;
  shortOptionHaircutBps: number;
  bondHaircutBps: number;
  futuresHaircutStepBps: number;
  maxRecognizedMultiplier: number;
};

export type ValuationAccountValues = {
  collateralValueEth: bigint;
  liquidationValueEth: bigint;
  activeDebtEth: bigint;
  effectiveDebtEth: bigint;
};

export type ValuationBreakdown = {
  freeEth: bigint;
  reservedOrderEth: bigint;
  freeErc20Eth: bigint;
  reservedOrderErc20Eth: bigint;
  longOptionsEth: bigint;
  shortOptionsEth: bigint;
  futuresEth: bigint;
  bondClaimsEth: bigint;
  nftEth: bigint;
  binaryOptionsEth: bigint;
};

export type LendingRiskModuleCheck = {
  configured: boolean;
  address: string | null;
  expectedAddress: string;
  reason: string | null;
};

export type BorrowValuationPreview = {
  account: string;
  riskLevel: number;
  requestedPrincipalEth: bigint;
  riskTier: ValuationRiskTier;
  values: ValuationAccountValues;
  breakdown: ValuationBreakdown;
  riskModule: LendingRiskModuleCheck;
  canBorrow: boolean;
  reason: string | null;
  valuationCanBorrow: boolean;
  projectedEffectiveDebtEth: bigint;
  maxDebtAllowedEth: bigint;
  remainingBorrowCapacityEth: bigint;
  minimumCollateralRequiredEth: bigint;
  minimumStartingCollateralIfBorrowCountsEth: bigint;
  collateralShortfallEth: bigint;
  projectedCollateralAfterBorrowEth: bigint;
  currentLtvBps: bigint | null;
  valuationCheckLtvBps: bigint | null;
  projectedLtvBps: bigint | null;
};

function bi(value: unknown): bigint {
  try {
    if (typeof value === 'bigint') return value;
    return BigInt((value as { toString?: () => string })?.toString?.() ?? '0');
  } catch {
    return 0n;
  }
}

function num(value: unknown): number {
  return Number(bi(value));
}

function bool(value: unknown): boolean {
  return Boolean(value ?? false);
}

function ceilDiv(numerator: bigint, denominator: bigint): bigint {
  if (denominator <= 0n) return 0n;
  if (numerator <= 0n) return 0n;
  return (numerator + denominator - 1n) / denominator;
}

function emptyValues(): ValuationAccountValues {
  return {
    collateralValueEth: ZERO,
    liquidationValueEth: ZERO,
    activeDebtEth: ZERO,
    effectiveDebtEth: ZERO,
  };
}

function emptyBreakdown(): ValuationBreakdown {
  return {
    freeEth: ZERO,
    reservedOrderEth: ZERO,
    freeErc20Eth: ZERO,
    reservedOrderErc20Eth: ZERO,
    longOptionsEth: ZERO,
    shortOptionsEth: ZERO,
    futuresEth: ZERO,
    bondClaimsEth: ZERO,
    nftEth: ZERO,
    binaryOptionsEth: ZERO,
  };
}

@Injectable({ providedIn: 'root' })
export class ValuationModuleReadService {
  private readonly wallet = inject(WalletConnectService);
  readonly valuationAddress = getContractAddress('ValuationModule');
  readonly lendingContractAddress = getContractAddress('LendingContract');
  readonly expectedRiskModuleAddress = getContractAddress('RiskModule');

  async previewBorrowOrder(
    account: string,
    riskLevel: number,
    requestedPrincipalEth: bigint,
  ): Promise<BorrowValuationPreview> {
    const normalizedAccount = account.trim().toLowerCase();
    const provider = await this.provider();
    const contract = this.valuationContract(provider);

    const [riskTier, riskModule] = await Promise.all([
      this.getRiskTier(contract, riskLevel),
      this.getLendingRiskModuleCheck(provider),
    ]);

    let values = emptyValues();
    let breakdown = emptyBreakdown();
    let valuationCanBorrow = false;
    let readReason: string | null = null;

    if (riskTier.enabled) {
      const [valuesResult, breakdownResult, canBorrowResult] = await Promise.allSettled([
        contract['getAccountValues'](normalizedAccount, riskLevel),
        contract['getBreakdown'](normalizedAccount, riskLevel),
        contract['canPlaceBorrowOrder'](normalizedAccount, riskLevel, requestedPrincipalEth),
      ]);

      if (valuesResult.status === 'fulfilled') {
        values = this.mapAccountValues(valuesResult.value);
      } else {
        readReason = this.errorMessage(valuesResult.reason, 'Could not read account values from ValuationModule.');
      }

      if (breakdownResult.status === 'fulfilled') {
        breakdown = this.mapBreakdown(breakdownResult.value);
      }

      if (canBorrowResult.status === 'fulfilled') {
        valuationCanBorrow = Boolean(canBorrowResult.value);
      } else if (!readReason) {
        readReason = this.errorMessage(canBorrowResult.reason, 'Could not read canPlaceBorrowOrder from ValuationModule.');
      }
    }

    const projectedEffectiveDebtEth = values.effectiveDebtEth + requestedPrincipalEth;
    const projectedCollateralAfterBorrowEth = values.collateralValueEth + requestedPrincipalEth;
    const maxLtv = BigInt(riskTier.maxLtvBps || 0);
    const maxDebtAllowedEth = maxLtv > 0n
      ? (values.collateralValueEth * maxLtv) / BPS
      : ZERO;
    const remainingBorrowCapacityEth = maxDebtAllowedEth > values.effectiveDebtEth
      ? maxDebtAllowedEth - values.effectiveDebtEth
      : ZERO;
    const minimumCollateralRequiredEth = maxLtv > 0n
      ? ceilDiv(projectedEffectiveDebtEth * BPS, maxLtv)
      : ZERO;
    const minimumStartingCollateralIfBorrowCountsEth = minimumCollateralRequiredEth > requestedPrincipalEth
      ? minimumCollateralRequiredEth - requestedPrincipalEth
      : ZERO;
    const collateralShortfallEth = minimumCollateralRequiredEth > values.collateralValueEth
      ? minimumCollateralRequiredEth - values.collateralValueEth
      : ZERO;
    const currentLtvBps = values.collateralValueEth > 0n
      ? (values.effectiveDebtEth * BPS) / values.collateralValueEth
      : null;
    const valuationCheckLtvBps = values.collateralValueEth > 0n
      ? (projectedEffectiveDebtEth * BPS) / values.collateralValueEth
      : null;
    const projectedLtvBps = projectedCollateralAfterBorrowEth > 0n
      ? (projectedEffectiveDebtEth * BPS) / projectedCollateralAfterBorrowEth
      : null;

    const canBorrow = riskModule.configured && valuationCanBorrow;
    const reason = this.borrowReason({
      riskTier,
      riskModule,
      values,
      requestedPrincipalEth,
      projectedEffectiveDebtEth,
      collateralShortfallEth,
      valuationCanBorrow,
      readReason,
    });

    return {
      account: normalizedAccount,
      riskLevel,
      requestedPrincipalEth,
      riskTier,
      values,
      breakdown,
      riskModule,
      canBorrow,
      reason,
      valuationCanBorrow,
      projectedEffectiveDebtEth,
      maxDebtAllowedEth,
      remainingBorrowCapacityEth,
      minimumCollateralRequiredEth,
      minimumStartingCollateralIfBorrowCountsEth,
      collateralShortfallEth,
      projectedCollateralAfterBorrowEth,
      currentLtvBps,
      valuationCheckLtvBps,
      projectedLtvBps,
    };
  }

  private async provider(): Promise<ethers.BrowserProvider | ethers.JsonRpcProvider> {
    const walletProvider = await this.wallet.getEthersProvider().catch(() => null);
    if (walletProvider) return walletProvider;

    const rpcUrl = NETWORKS[CURRENT_NETWORK].rpcUrls.default.http[0];
    return new ethers.JsonRpcProvider(rpcUrl);
  }

  private valuationContract(provider: ethers.BrowserProvider | ethers.JsonRpcProvider): ethers.Contract {
    return new ethers.Contract(
      this.valuationAddress,
      CONTRACT_ABIS.ValuationModule,
      provider,
    );
  }

  private async getLendingRiskModuleCheck(
    provider: ethers.BrowserProvider | ethers.JsonRpcProvider,
  ): Promise<LendingRiskModuleCheck> {
    const expectedAddress = this.expectedRiskModuleAddress;

    try {
      const lending = new ethers.Contract(
        this.lendingContractAddress,
        LENDING_RISK_MODULE_ABI,
        provider,
      );
      const raw = String(await lending['riskModule']()).toLowerCase();
      const configured = ethers.isAddress(raw) && raw !== ZERO_ADDRESS;
      const matchesExpected = configured && raw === expectedAddress.toLowerCase();

      if (!configured) {
        return {
          configured: false,
          address: null,
          expectedAddress,
          reason: 'LendingContract riskModule is not set. Borrow orders will revert until governance calls LendingContract.setRiskModule(RiskModule).',
        };
      }

      if (!matchesExpected) {
        return {
          configured: false,
          address: raw,
          expectedAddress,
          reason: `LendingContract riskModule points to ${raw}, but the frontend deployment expects ${expectedAddress}. Borrow orders are disabled until the deployment wiring is corrected.`,
        };
      }

      return {
        configured: true,
        address: raw,
        expectedAddress,
        reason: null,
      };
    } catch (err: unknown) {
      return {
        configured: false,
        address: null,
        expectedAddress,
        reason: this.errorMessage(err, 'Could not verify LendingContract riskModule wiring.'),
      };
    }
  }

  private async getRiskTier(contract: ethers.Contract, riskLevel: number): Promise<ValuationRiskTier> {
    const raw = await contract['riskTiers'](riskLevel).catch(() => null);

    return {
      enabled: bool(raw?.enabled ?? raw?.[0]),
      maxLtvBps: num(raw?.maxLtvBps ?? raw?.[1]),
      liquidationLtvBps: num(raw?.liquidationLtvBps ?? raw?.[2]),
      longOptionHaircutBps: num(raw?.longOptionHaircutBps ?? raw?.[3]),
      shortOptionHaircutBps: num(raw?.shortOptionHaircutBps ?? raw?.[4]),
      bondHaircutBps: num(raw?.bondHaircutBps ?? raw?.[5]),
      futuresHaircutStepBps: num(raw?.futuresHaircutStepBps ?? raw?.[6]),
      maxRecognizedMultiplier: num(raw?.maxRecognizedMultiplier ?? raw?.[7]),
    };
  }

  private mapAccountValues(raw: any): ValuationAccountValues {
    return {
      collateralValueEth: bi(raw?.collateralValueEth ?? raw?.[0]),
      liquidationValueEth: bi(raw?.liquidationValueEth ?? raw?.[1]),
      activeDebtEth: bi(raw?.activeDebtEth ?? raw?.[2]),
      effectiveDebtEth: bi(raw?.effectiveDebtEth ?? raw?.[3]),
    };
  }

  private mapBreakdown(raw: any): ValuationBreakdown {
    return {
      freeEth: bi(raw?.freeEth ?? raw?.[0]),
      reservedOrderEth: bi(raw?.reservedOrderEth ?? raw?.[1]),
      freeErc20Eth: bi(raw?.freeErc20Eth ?? raw?.[2]),
      reservedOrderErc20Eth: bi(raw?.reservedOrderErc20Eth ?? raw?.[3]),
      longOptionsEth: bi(raw?.longOptionsEth ?? raw?.[4]),
      shortOptionsEth: bi(raw?.shortOptionsEth ?? raw?.[5]),
      futuresEth: bi(raw?.futuresEth ?? raw?.[6]),
      bondClaimsEth: bi(raw?.bondClaimsEth ?? raw?.[7]),
      nftEth: bi(raw?.nftEth ?? raw?.[8]),
      binaryOptionsEth: bi(raw?.binaryOptionsEth ?? raw?.[9]),
    };
  }

  private borrowReason(input: {
    riskTier: ValuationRiskTier;
    riskModule: LendingRiskModuleCheck;
    values: ValuationAccountValues;
    requestedPrincipalEth: bigint;
    projectedEffectiveDebtEth: bigint;
    collateralShortfallEth: bigint;
    valuationCanBorrow: boolean;
    readReason: string | null;
  }): string | null {
    if (input.riskModule.reason) return input.riskModule.reason;
    if (input.readReason) return input.readReason;
    if (!input.riskTier.enabled) return 'Borrow disallowed: selected valuation risk tier is disabled.';
    if (input.requestedPrincipalEth <= 0n) return 'Borrow disallowed: requested principal must be greater than zero.';
    if (input.values.collateralValueEth <= 0n) {
      return 'Borrow disallowed: the ValuationModule recognizes 0 ETH of collateral for this lending account.';
    }
    if (!input.valuationCanBorrow) {
      return `Borrow disallowed: current recognized collateral is below the minimum needed for the projected debt. Shortfall: ${ethers.formatEther(input.collateralShortfallEth)} ETH.`;
    }
    return null;
  }

  private errorMessage(err: unknown, fallback: string): string {
    const raw = err as { reason?: string; shortMessage?: string; message?: string };
    return raw?.reason ?? raw?.shortMessage ?? raw?.message ?? fallback;
  }
}
