import { ContractRegistryService } from '../../contracts/contract-registry.service';
import { Injectable } from '@angular/core';

export const ETH_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

@Injectable({ providedIn: 'root' })
export class TokenRegistryService {
  constructor(private contracts: ContractRegistryService) {}

  mainTokens() {
    return [
      {
        symbol: 'ETH',
        icon: 'assets/tokens/eth.png',
        address: ETH_ADDRESS,
      },
      {
        symbol: 'SETHX',
        icon: 'assets/tokens/sethx.png',
        address: this.contracts.getContractAddress('SethxToken'),
      },
    ];
  }
}
