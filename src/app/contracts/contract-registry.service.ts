import { Injectable } from '@angular/core';
import {
  getContractAbi,
  getContractAddress,
  getContractConfig,
  type NetworkKey,
} from './contract-registry';
import { ContractName } from './contract-names';

@Injectable({ providedIn: 'root' })
export class ContractRegistryService {
  getContractAddress(name: ContractName, network?: NetworkKey): string {
    return getContractAddress(name, network);
  }

  getContractAbi(name: ContractName): unknown {
    return getContractAbi(name);
  }

  getContractConfig(name: ContractName, network?: NetworkKey) {
    return getContractConfig(name, network);
  }
}
