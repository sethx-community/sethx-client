import { getContractAddress } from '../contracts/contract-registry';

export const ETH_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

function optionalContractAddress(name: Parameters<typeof getContractAddress>[0]): string {
  try {
    return getContractAddress(name);
  } catch {
    return '';
  }
}

export const MAIN_TOKENS = [
  {
    symbol: 'ETH',
    icon: 'assets/tokens/eth.svg',
    address: ETH_ADDRESS,
  },
  {
    symbol: 'SETHX',
    address: optionalContractAddress('SethxToken'),
  },
];
