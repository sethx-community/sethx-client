import { Injectable, inject } from '@angular/core';
import { Contract, JsonRpcProvider, ethers } from 'ethers';

import { ProtocolTreasuryAbi, TreasuryAuthorityAbi, TreasuryPaymentsModuleAbi, TreasuryTradeModuleAbi, TreasuryVaultModuleAbi } from '../../../contracts/generated';
import { getContractAddress } from '../../../contracts/contract-registry';
import { CURRENT_NETWORK } from '../../../constants/network.config';
import { NETWORKS } from '../../../constants/networks';
import { WalletConnectService } from '../../../wallet/wallet-connect.service';

function optionalContractAddress(name: Parameters<typeof getContractAddress>[0]): string {
  try {
    return getContractAddress(name);
  } catch {
    return '';
  }
}

export type TreasurerInfo = { active: boolean; appointedAt: bigint; revokedAt: bigint; permissions: bigint; label: string };
export type TreasuryAssetOverview = { ethBal: bigint; tokens: string[]; balances: bigint[] };
export type TreasuryAccountBalance = { ethBalance: bigint; lockedEthBalance: bigint; tokenBalance: bigint; lockedTokenBalance: bigint };
export type PassivePoolWithdrawalRequest = { shares: bigint; requestedAt: bigint };

@Injectable({ providedIn: 'root' })
export class TreasuryContractService {
  private readonly wallet = inject(WalletConnectService);

  readonly authorityAddress = optionalContractAddress('TreasuryAuthority');
  readonly treasuryAddress = optionalContractAddress('ProtocolTreasury');
  readonly vaultModuleAddress = optionalContractAddress('TreasuryVaultModule');
  readonly paymentsModuleAddress = optionalContractAddress('TreasuryPaymentsModule');
  readonly tradeModuleAddress = optionalContractAddress('TreasuryTradeModule');

  readonly permissions = {
    callVault: 1n << 0n,
    manageLiquidity: 1n << 1n,
    managePayments: 1n << 2n,
    tradeSethx: 1n << 3n,
  } as const;

  readonly actionFlags = {
    fundAccount: 1n << 0n,
    withdrawAccount: 1n << 1n,
    spotTrade: 1n << 2n,
    lend: 1n << 3n,
    passiveLp: 1n << 4n,
  } as const;

  async authority(): Promise<Contract> { return new Contract(this.authorityAddress, TreasuryAuthorityAbi, await this.runner()); }
  async treasury(): Promise<Contract> { return new Contract(this.treasuryAddress, ProtocolTreasuryAbi, await this.runner()); }
  async paymentsModule(): Promise<Contract> { return new Contract(this.paymentsModuleAddress, TreasuryPaymentsModuleAbi, await this.runner()); }
  async vaultModule(): Promise<Contract> { return new Contract(this.vaultModuleAddress, TreasuryVaultModuleAbi, await this.runner()); }
  async tradeModule(): Promise<Contract> { return new Contract(this.tradeModuleAddress, TreasuryTradeModuleAbi, await this.runner()); }

  async currentAddress(): Promise<string | null> {
    const provider = await this.wallet.getEthersProvider();
    const signer = await provider?.getSigner?.().catch(() => null);
    return (await signer?.getAddress?.()) ?? this.wallet.address();
  }

  async isTreasurer(address: string): Promise<boolean> {
    const authority = await this.authority();
    return Boolean(await authority['isOperationalTreasurer'](address));
  }

  async treasurerInfo(address: string): Promise<TreasurerInfo> {
    const authority = await this.authority();
    const result = await authority['getTreasurerInfo'](address);
    return {
      active: Boolean(result.active),
      appointedAt: BigInt(result.appointedAt ?? 0),
      revokedAt: BigInt(result.revokedAt ?? 0),
      permissions: BigInt(result.permissions ?? 0),
      label: String(result.label ?? ''),
    };
  }

  async killed(): Promise<boolean> {
    const authority = await this.authority();
    return Boolean(await authority['killed']());
  }

  async getTreasurers(): Promise<string[]> {
    const authority = await this.authority();
    return [...((await authority['getTreasurers']()) as string[])];
  }


  async hasActionPermission(treasurer: string, action: bigint): Promise<boolean> {
    const trade = await this.tradeModule();
    return Boolean(await trade['hasActionPermission'](treasurer, action));
  }

  async hasAccountAccess(treasurer: string, account: string): Promise<boolean> {
    const trade = await this.tradeModule();
    return Boolean(await trade['hasAccountAccess'](treasurer, account));
  }

  async getTreasuryAccounts(): Promise<string[]> {
    const trade = await this.tradeModule();
    return [...((await trade['getTreasuryAccounts']()) as string[])];
  }

  async treasuryAccountBalance(account: string, token: string): Promise<TreasuryAccountBalance> {
    const trade = await this.tradeModule();
    const [ethBalance, lockedEthBalance, tokenBalance, lockedTokenBalance] = await Promise.all([
      trade['getVaultEthBalance'](account),
      trade['getVaultLockedEthBalance'](account),
      token ? trade['getVaultTokenBalance'](account, token) : Promise.resolve(0n),
      token ? trade['getVaultLockedTokenBalance'](account, token) : Promise.resolve(0n),
    ]);
    return {
      ethBalance: BigInt(ethBalance ?? 0),
      lockedEthBalance: BigInt(lockedEthBalance ?? 0),
      tokenBalance: BigInt(tokenBalance ?? 0),
      lockedTokenBalance: BigInt(lockedTokenBalance ?? 0),
    };
  }

  async openTreasuryAccount(): Promise<unknown> {
    const trade = await this.tradeModule();
    return trade['openTreasuryAccount']();
  }

  async depositETHToAccount(account: string, amountEth: string): Promise<unknown> {
    const trade = await this.tradeModule();
    return trade['depositETHToAccount'](account, ethers.parseEther(amountEth));
  }

  async withdrawETHFromAccount(account: string, amountEth: string): Promise<unknown> {
    const trade = await this.tradeModule();
    return trade['withdrawETHFromAccount'](account, ethers.parseEther(amountEth));
  }

  async depositERC20ToAccount(account: string, token: string, amountRaw: string): Promise<unknown> {
    const trade = await this.tradeModule();
    return trade['depositERC20ToAccount'](account, token, BigInt(amountRaw));
  }

  async withdrawERC20FromAccount(account: string, token: string, amountRaw: string): Promise<unknown> {
    const trade = await this.tradeModule();
    return trade['withdrawERC20FromAccount'](account, token, BigInt(amountRaw));
  }

  async pullVaultETH(amountEth: string): Promise<unknown> {
    const vault = await this.vaultModule();
    return vault['pullTreasuryETHFromVault'](ethers.parseEther(amountEth));
  }

  async pullVaultERC20(token: string, amountRaw: string): Promise<unknown> {
    const vault = await this.vaultModule();
    return vault['pullTreasuryERC20FromVault'](token, BigInt(amountRaw));
  }

  async payETH(recipient: string, amountEth: string, memo: string): Promise<unknown> {
    const payments = await this.paymentsModule();
    return payments['payETH'](recipient, ethers.parseEther(amountEth), memo);
  }

  async payERC20(token: string, recipient: string, amountRaw: string, memo: string): Promise<unknown> {
    const payments = await this.paymentsModule();
    return payments['payERC20'](token, recipient, BigInt(amountRaw), memo);
  }

  async assetOverview(): Promise<TreasuryAssetOverview> {
    const treasury = await this.treasury();
    const result = await treasury['getAssetOverview']();
    return {
      ethBal: BigInt(result.ethBal ?? result[0] ?? 0),
      tokens: [...((result.tokens ?? result[1] ?? []) as string[])],
      balances: [...((result.balances ?? result[2] ?? []) as bigint[])],
    };
  }

  async runner() {
    const provider = await this.wallet.getEthersProvider();
    if (provider) {
      const signer = await provider.getSigner?.().catch(() => null);
      return signer ?? provider;
    }
    const rpcUrl = NETWORKS[CURRENT_NETWORK].rpcUrls.default.http[0];
    return new JsonRpcProvider(rpcUrl);
  }

  formatEth(value: bigint): string { return ethers.formatEther(value); }
}
