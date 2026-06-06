import { ethers } from 'ethers';
import { ContractName } from './contract-names';
import { CONTRACT_ABIS } from './generated/abis';
import { CONTRACT_ADDRESSES } from './generated/addresses';

export const EXPECTED_CONTRACT_VERSION = '1.0.0';

export const EXPECTED_CONTRACT_IDS = {
  SethxToken: null,
  FounderTokenTimelock: null,
  TreasuryAuthority: 'TreasuryAuthority@1.0.0',
  ProtocolTreasury: 'ProtocolTreasury@1.0.0',
  SethxTimelock: null,
  SethxGovernor: null,
  AccountRegistry: 'AccountRegistry@1.0.0',
  SethxVault: 'SethxVault@1.0.0',
  PriceManager: 'PriceManager@1.0.0',
  FeeManager: 'FeeManager@1.0.0',
  TokenSpotOrderBook: 'TokenSpotOrderBook@1.0.0',
  NFTSpotOrderBook: 'NFTSpotOrderBook@1.0.0',
  OptionContract: 'OptionContract@1.0.0',
  OptionsOrderBook: 'OptionsOrderBook@1.0.0',
  BinaryMarginOptionContract: 'BinaryMarginOptionContract@1.0.0',
  BinaryMarginOptionsOrderBook: 'BinaryMarginOptionsOrderBook@1.0.0',
  MarginOptionContract: 'MarginOptionContract@1.0.0',
  MarginOptionsOrderBook: 'MarginOptionsOrderBook@1.0.0',
  FuturesContract: 'FuturesContract@1.0.0',
  FuturesOrderBook: 'FuturesOrderBook@1.0.0',
  LendingContract: 'LendingContract@1.0.0',
  LendingOrderBook: 'LendingOrderBook@1.0.0',
  OptionsValuationAdapter: 'OptionsValuationAdapter@1.0.0',
  FuturesValuationAdapter: 'FuturesValuationAdapter@1.0.0',
  ValuationModule: 'ValuationModule@1.0.0',
  RiskModule: 'RiskModule@1.0.0',
  LiquidationEngine: 'LiquidationEngine@1.0.0',
  AccountFactory: 'AccountFactory@1.0.0',
  LendingAccountFactory: 'LendingAccountFactory@1.0.0',
  TreasuryPaymentsModule: 'TreasuryPaymentsModule@1.0.0',
  TreasuryVaultModule: 'TreasuryVaultModule@1.0.0',
  TreasuryTradeModule: 'TreasuryTradeModule@1.0.0',
  SethxFeeConversionOracle: 'SethxFeeConversionOracle@1.0.0',
  PassiveFuturesSnapshotPublisher: 'PassiveFuturesSnapshotPublisher@1.0.0',
  PassiveFuturesPoolFactory: 'PassiveFuturesPoolFactory@1.0.0',
} as const satisfies Partial<Record<ContractName, string | null>>;

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
    console.warn(`[contracts] ${label} has no configured address.`);
    return false;
  }

  const key = `${address.toLowerCase()}::${expectedId ?? "code-only"}`;
  let cached = validationCache.get(key);
  if (!cached) {
    cached = performContractIdentityValidation(provider, address, expectedId, label);
    validationCache.set(key, cached);
  }
  return cached;
}

export async function validatedContractOrNull(
  provider: ethers.Provider | null | undefined,
  address: string | null | undefined,
  abi: ethers.InterfaceAbi,
  expectedId: string | null | undefined,
  label = 'contract',
): Promise<ethers.Contract | null> {
  if (!provider || !(await validateContractIdentity(provider, address, expectedId, label))) {
    return null;
  }
  return new ethers.Contract(address!, abi, provider);
}

export async function validatedConfiguredContractOrNull(
  provider: ethers.Provider | null | undefined,
  name: ContractName,
): Promise<ethers.Contract | null> {
  const address = CONTRACT_ADDRESSES[name];
  const abi = CONTRACT_ABIS[name];
  const expectedId = EXPECTED_CONTRACT_IDS[name];
  return validatedContractOrNull(provider, address, abi, expectedId, name);
}

async function performContractIdentityValidation(
  provider: ethers.Provider,
  address: string,
  expectedId: string | null | undefined,
  label: string,
): Promise<boolean> {
  try {
    if ((await provider.getCode(address)) === '0x') {
      console.warn(`[contracts] ${label} is not deployed at ${address}`);
      return false;
    }

    if (expectedId === null) {
      return true;
    }

    if (!expectedId) {
      console.warn(`[contracts] ${label} has no expected contract id.`);
      return false;
    }

    const contract = new ethers.Contract(address, ['function contractId() view returns (string)'], provider);
    const actualId = String(await contract['contractId']());
    if (actualId !== expectedId) {
      console.warn(`[contracts] ${label} identity mismatch at ${address}: expected ${expectedId}, got ${actualId}`);
      return false;
    }
    return true;
  } catch (error) {
    console.warn(`[contracts] ${label} identity check failed at ${address}`, error);
    return false;
  }
}
