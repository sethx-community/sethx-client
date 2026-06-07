import { ethers } from 'ethers';
import { ContractName } from './contract-names';

export const EXPECTED_CONTRACT_VERSION = '1.0.0';

export const EXPECTED_CONTRACT_IDS = {
  AccountFactory: 'AccountFactory@1.0.0',
  AccountRegistry: 'AccountRegistry@1.0.0',
  BinaryMarginOptionContract: 'BinaryMarginOptionContract@1.0.0',
  BinaryMarginOptionsOrderBook: 'BinaryMarginOptionsOrderBook@1.0.0',
  ChainlinkCrossRateEthOracle: 'ChainlinkCrossRateEthOracle@1.0.0',
  ChainlinkDirectEthPairOracle: 'ChainlinkDirectEthPairOracle@1.0.0',
  FeeManager: 'FeeManager@1.0.0',
  FuturesContract: 'FuturesContract@1.0.0',
  FuturesOrderBook: 'FuturesOrderBook@1.0.0',
  FuturesPositionStore: 'FuturesPositionStore@1.0.0',
  FuturesValuationAdapter: 'FuturesValuationAdapter@1.0.0',
  LendingAccountFactory: 'LendingAccountFactory@1.0.0',
  LendingContract: 'LendingContract@1.0.0',
  LendingOrderBook: 'LendingOrderBook@1.0.0',
  LiquidationEngine: 'LiquidationEngine@1.0.0',
  MarginOptionContract: 'MarginOptionContract@1.0.0',
  MarginOptionsOrderBook: 'MarginOptionsOrderBook@1.0.0',
  NFTSpotOrderBook: 'NFTSpotOrderBook@1.0.0',
  OptionContract: 'OptionContract@1.0.0',
  OptionsOrderBook: 'OptionsOrderBook@1.0.0',
  OptionsValuationAdapter: 'OptionsValuationAdapter@1.0.0',
  PassiveFuturesPoolFactory: 'PassiveFuturesPoolFactory@1.0.0',
  PassiveFuturesSnapshotPublisher: 'PassiveFuturesSnapshotPublisher@1.0.0',
  PriceManager: 'PriceManager@1.0.0',
  ProtocolTreasury: 'ProtocolTreasury@1.0.0',
  RiskModule: 'RiskModule@1.0.0',
  SethxFeeConversionOracle: 'SethxFeeConversionOracle@1.0.0',
  SethxGovernor: null,
  SethxTimelock: null,
  SethxToken: null,
  SethxVault: 'SethxVault@1.0.0',
  TokenSpotOrderBook: 'TokenSpotOrderBook@1.0.0',
  TreasuryAuthority: 'TreasuryAuthority@1.0.0',
  TreasuryFuturesMaintenanceModule: 'TreasuryFuturesMaintenanceModule@1.0.0',
  TreasuryPaymentsModule: 'TreasuryPaymentsModule@1.0.0',
  TreasuryTradeModule: 'TreasuryTradeModule@1.0.0',
  TreasuryVaultModule: 'TreasuryVaultModule@1.0.0',
  ValuationModule: 'ValuationModule@1.0.0',
} as const satisfies Record<ContractName, string | null>;

const validationCache = new Map<string, Promise<boolean>>();

export function clearContractIdentityValidationCache(): void {
  validationCache.clear();
}

export function contractIdentityErrorMessage(label: string, address?: string | null): string {
  return `${label} is not available or does not match the expected contract id${address ? ` at ${address}` : ""}.`;
}

export async function validateContractIdentity(
  provider: ethers.Provider,
  address: string | null | undefined,
  expectedId: string | null | undefined,
  label = 'contract',
): Promise<boolean> {
  if (!address || address === ethers.ZeroAddress) {
    console.warn(`[contracts] ${label} address is zero or empty.`);
    return false;
  }
  if (!expectedId) return true;
  const cacheKey = `${address}:${expectedId}`;
  if (validationCache.has(cacheKey)) return validationCache.get(cacheKey)!;
  
  const promise = (async () => {
    try {
      const code = await provider.getCode(address);
      if (code === "0x" || code === "0x00") return false;
      return true;
    } catch (err) {
      console.error(`[contracts] Identity validation failed for ${label}:`, err);
      return false;
    }
  })();
  
  validationCache.set(cacheKey, promise);
  return promise;
}
