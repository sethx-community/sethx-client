import { deployed_addresses } from './contracts';

export const ETH_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

export const MAIN_TOKENS = [
  {
    symbol: 'ETH',
    icon: 'assets/tokens/eth.svg',
    address: ETH_ADDRESS,
  },
  {
    symbol: 'SETHX',
    address: deployed_addresses['SethxTokenModule#SethxToken'],
  },
];
