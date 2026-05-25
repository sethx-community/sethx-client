import { environment } from '../../environments/environment';
import { CONTRACT_ABIS } from './generated/abis';
import { CONTRACT_ADDRESSES } from './generated/addresses';
import { ContractName } from './contract-names';

export type NetworkKey = keyof typeof CONTRACT_ADDRESSES;

const DEFAULT_NETWORK: NetworkKey =
  environment.name === 'local'
    ? 'localhost'
    : environment.name === 'testnet'
      ? 'sepolia'
      : 'mainnet';

const ADDRESS_BOOK = CONTRACT_ADDRESSES as Record<
  NetworkKey,
  Partial<Record<ContractName, string>>
>;

const ABI_BOOK = CONTRACT_ABIS as Partial<Record<ContractName, unknown>>;

export type ContractConfig = {
  name: ContractName;
  network: NetworkKey;
  address: string;
  abi: unknown;
};

export function getContractAddress(
  name: ContractName,
  network: NetworkKey = DEFAULT_NETWORK,
): string {
  const configuredAddress = environment.contracts[name];
  const generatedAddress = environment.name === 'local' ? ADDRESS_BOOK[network]?.[name] : undefined;
  const contractAddress = configuredAddress || generatedAddress;

  if (!contractAddress) {
    throw new Error(
      `Missing contract address for ${name} on ${environment.name} environment`,
    );
  }

  return contractAddress;
}

export function getContractAbi(name: ContractName): unknown {
  const abi = ABI_BOOK[name];

  if (!abi) {
    throw new Error(`Missing contract ABI for ${name}`);
  }

  return abi;
}

export function getContractConfig(
  name: ContractName,
  network: NetworkKey = DEFAULT_NETWORK,
): ContractConfig {
  return {
    name,
    network,
    address: getContractAddress(name, network),
    abi: getContractAbi(name),
  };
}
