import { Injectable, inject, signal } from '@angular/core';
import { Contract, ethers } from 'ethers';

import { FuturesContractABI, TreasuryFuturesMaintenanceModuleABI } from '../../../contracts';
import { CONTRACT_ADDRESSES } from '../../../contracts/generated/addresses';
import { getContractAddress } from '../../../contracts/contract-registry';
import { WalletConnectService } from '../../../wallet/wallet-connect.service';
import { TradeSettingsService } from '../../shared/trade-settings.service';
import { TreasuryModeService } from '../../shared/treasury-mode.service';
import { TriggerService } from '../../shared/trigger.service';
import { norm } from '../../../core/tokens/token-normalize';

const ACCOUNT_FUTURES_MAINTENANCE_ABI = [
  'function matchFuturesImbalance(address orderBook,bytes32 marketKey,uint256 maxMatches) external returns (uint256 matchedAmount,uint256 callerReward,uint256 protocolFee)',
  'function liquidateFuturesPosition(address futuresContract,bytes32 marketKey,address account) external returns (uint256 seizedMargin,uint256 callerReward)',
  'function liquidateFuturesHead(address futuresContract,bytes32 marketKey,uint8 side,uint256 maxSteps) external returns (uint256 processed)',
  'function rebaseFuturesLosingPositionsToBufferTarget(address futuresContract,bytes32 marketKey,uint8 losingSide,uint256 targetSettlementBuffer,uint256 maxSteps) external returns (uint256 scanned,uint256 rebased,uint256 amountCollected,uint256 settlementBufferAfter)',
  'function addFuturesMargin(address futuresContract,bytes32 marketKey,uint256 amount) external',
  'function releaseFuturesMargin(address futuresContract,bytes32 marketKey) external',
] as const satisfies ethers.InterfaceAbi;

function bi(value: unknown): bigint {
  try {
    return typeof value === 'bigint' ? value : BigInt((value as any)?.toString?.() ?? '0');
  } catch {
    return 0n;
  }
}

async function waitForHash(tx: any): Promise<string | null> {
  const receipt = await tx?.wait?.();
  return receipt?.hash ?? tx?.hash ?? null;
}

@Injectable({ providedIn: 'root' })
export class FuturesMaintenanceService {
  private readonly wallet = inject(WalletConnectService);
  private readonly settings = inject(TradeSettingsService);
  private readonly treasuryMode = inject(TreasuryModeService);
  private readonly trigger = inject(TriggerService);

  readonly loading = signal(false);
  readonly lastTxHash = signal<string | null>(null);
  readonly error = signal<string | null>(null);

  readonly futuresAddress = getContractAddress('FuturesContract');
  readonly futuresOrderBookAddress = getContractAddress('FuturesOrderBook');
  readonly treasuryFuturesMaintenanceModuleAddress = getContractAddress('TreasuryFuturesMaintenanceModule');

  private async runner(): Promise<any> {
    const provider = await this.wallet.getEthersProvider();
    if (provider) {
      const signer = await provider.getSigner?.().catch(() => null);
      return signer ?? provider;
    }
    throw new Error('Wallet provider is not connected.');
  }

  private async readRunner(): Promise<any> {
    const provider = await this.wallet.getEthersProvider();
    if (provider) return provider;
    throw new Error('Wallet provider is not connected.');
  }

  private async withTx<T>(label: string, fn: () => Promise<T>): Promise<T> {
    this.loading.set(true);
    this.error.set(null);
    try {
      return await fn();
    } catch (err: any) {
      const message = err?.shortMessage ?? err?.reason ?? err?.message ?? label;
      this.error.set(String(message));
      console.error(`[SethX futures maintenance] ${label}`, err);
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  private async futures(readOnly = false): Promise<Contract> {
    return new Contract(
      this.futuresAddress,
      FuturesContractABI,
      readOnly ? await this.readRunner() : await this.runner(),
    );
  }

  private async treasuryModule(): Promise<Contract> {
    return new Contract(
      this.treasuryFuturesMaintenanceModuleAddress,
      TreasuryFuturesMaintenanceModuleABI,
      await this.runner(),
    );
  }

  private async accountContract(account: string): Promise<Contract> {
    return new Contract(account, ACCOUNT_FUTURES_MAINTENANCE_ABI, await this.runner());
  }

  selectedExecutionAccount(): string {
    const treasuryAccount = norm(this.treasuryMode.selectedTreasuryAccount() ?? '');
    if (this.treasuryMode.actingAsTreasurer() && treasuryAccount) return treasuryAccount;
    return norm(this.settings.selectedAccountId() ?? '');
  }

  async syncSettlementPrice(marketKey: string): Promise<string | null> {
    return this.withTx('sync settlement price', async () => {
      const contract = await this.futures();
      const tx = await contract['syncSettlementPrice'](marketKey);
      const hash = await waitForHash(tx);
      this.lastTxHash.set(hash);
      this.trigger.refreshDomains(['futures', 'prices', 'warnings']);
      return hash;
    });
  }

  async syncSettlementPriceAsTreasurer(marketKey: string, memo = 'Treasurer settlement sync'): Promise<string | null> {
    return this.withTx('treasurer sync settlement price', async () => {
      const module = await this.treasuryModule();
      const tx = await module['syncFuturesSettlementPrice'](marketKey, memo);
      const hash = await waitForHash(tx);
      this.lastTxHash.set(hash);
      this.trigger.refreshDomains(['futures', 'prices', 'treasury', 'warnings']);
      return hash;
    });
  }

  async matchImbalanceFromSelectedAccount(
    marketKey: string,
    maxMatches: bigint = 25n,
    orderBook = this.futuresOrderBookAddress,
  ): Promise<string | null> {
    const account = this.selectedExecutionAccount();
    if (!account) throw new Error('No selected account for futures imbalance matching.');
    return this.withTx('match futures imbalance', async () => {
      const contract = await this.accountContract(account);
      const tx = await contract['matchFuturesImbalance'](orderBook, marketKey, maxMatches);
      const hash = await waitForHash(tx);
      this.lastTxHash.set(hash);
      this.trigger.refreshDomains(['futures', 'portfolio', 'treasury', 'warnings']);
      return hash;
    });
  }

  async rebaseAsTreasurer(
    marketKey: string,
    losingSide: 1 | 2,
    targetSettlementBuffer: bigint,
    maxSteps: bigint = 25n,
    memo = 'Treasurer futures rebase',
  ): Promise<string | null> {
    return this.withTx('treasurer rebase losing futures positions', async () => {
      const module = await this.treasuryModule();
      const tx = await module['rebaseFuturesLosingPositionsToBufferTarget'](
        marketKey,
        losingSide,
        targetSettlementBuffer,
        maxSteps,
        memo,
      );
      const hash = await waitForHash(tx);
      this.lastTxHash.set(hash);
      this.trigger.refreshDomains(['futures', 'portfolio', 'treasury', 'warnings']);
      return hash;
    });
  }

  async getImbalanceOrder(marketKey: string): Promise<{
    active: boolean;
    syntheticMakerSide: number;
    amount: bigint;
    settlementPrice: bigint;
  } | null> {
    try {
      const contract = await this.futures(true);
      const res: any = await contract['getImbalanceOrder'](marketKey);
      return {
        active: Boolean(res?.active ?? res?.[0]),
        syntheticMakerSide: Number(res?.syntheticMakerSide ?? res?.[1] ?? 0),
        amount: bi(res?.amount ?? res?.[2]),
        settlementPrice: bi(res?.settlementPrice ?? res?.[3]),
      };
    } catch {
      return null;
    }
  }

  async positionHealth(marketKey: string, account: string): Promise<{
    side: number;
    size: bigint;
    liveMargin: bigint;
    maintenanceMargin: bigint;
    liquidatable: boolean;
    liquidationPrice: bigint;
    riskRatioBps: bigint | null;
  } | null> {
    try {
      const contract = await this.futures(true);
      const res: any = await contract['positionHealth'](marketKey, account);
      const pos = res?.position ?? res?.[0];
      const side = Number(pos?.side ?? pos?.[0] ?? 0);
      const size = bi(pos?.size ?? pos?.[1]);
      const liveMargin = bi(res?.liveMargin ?? res?.[2]);
      const maintenanceMargin = bi(res?.maintenanceMargin ?? res?.[3]);
      return {
        side,
        size,
        liveMargin,
        maintenanceMargin,
        liquidatable: Boolean(res?.liquidatable ?? res?.[4]),
        liquidationPrice: bi(pos?.liquidationPrice ?? pos?.[4]),
        riskRatioBps: maintenanceMargin > 0n ? (liveMargin * 10_000n) / maintenanceMargin : null,
      };
    } catch {
      return null;
    }
  }

  oracleAddressKeys(): Array<{ key: string; address: string }> {
    return Object.entries(CONTRACT_ADDRESSES)
      .filter(([key]) => key.endsWith('Oracle'))
      .map(([key, address]) => ({ key, address: String(address) }));
  }
}
