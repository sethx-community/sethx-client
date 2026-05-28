import { Injectable } from "@angular/core";
import { Contract } from "ethers";
import { CONTRACT_ABIS } from "../../../contracts/generated";
import { getContractAddress } from "../../../contracts/contract-registry";
import { EthersContractService } from "./ethers-contract.service";
import { WalletConnectService } from "../../../wallet/wallet-connect.service";
import { ErrorService } from "../../shared/error.service";

@Injectable({ providedIn: "root" })
export class VaultContractService extends EthersContractService<Contract> {
  protected readonly abi = CONTRACT_ABIS.SethxVault;
  protected readonly defaultAddress = getContractAddress("SethxVault");


  constructor(wallet: WalletConnectService, error: ErrorService) {
    super(wallet, error);
  }

  // === Token Lists ===

  async getERC20Tokens(): Promise<string[]> {
    const res = await this.read("getERC20Tokens" as any, [] as any);
    return Array.from(res as any) as string[];
  }

  async getERC721Tokens(): Promise<string[]> {
    const res = await this.read("getERC721Tokens" as any, [] as any);
    return Array.from(res as any) as string[];
  }


  // === Balances ===

  async getLockedERC20(user: string, token: string): Promise<bigint> {
    return this.read("getLockedERC20" as any, [user, token] as any);
  }

  async getERC20Balance(user: string, token: string): Promise<bigint> {
    return this.read("getERC20Balance" as any, [user, token] as any);
  }

  async getETHBalance(user: string): Promise<bigint> {
    return this.read("getETHBalance" as any, [user] as any);
  }

  async getLockedETHBalance(user: string): Promise<bigint> {
    return this.read("getLockedETHBalance" as any, [user] as any);
  }

  async vaultAddress(): Promise<string> {
    const contract = await this.withProvider();
    return await contract.getAddress();
  }

  async getVaultETHBalance(): Promise<bigint> {
    const contract = await this.withProvider();
    const runner: any = contract.runner;
    const provider = typeof runner?.getBalance === 'function' ? runner : runner?.provider;
    if (!provider || typeof provider.getBalance !== 'function') return 0n;
    return await provider.getBalance(await contract.getAddress());
  }

  async getVaultERC20Balance(token: string): Promise<bigint> {
    const contract = await this.withProvider();
    const runner: any = contract.runner;
    const provider = runner?.provider ?? runner;
    const erc20 = this.getERC20Contract(token, provider);
    return await erc20['balanceOf'](await contract.getAddress()) as bigint;
  }

}
