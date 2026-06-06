import { Injectable, inject, computed, signal, resource, effect } from '@angular/core';
import { stableResourceValue } from '../../core/signals/stable-resource';
import { VaultContractService } from './contracts/vault-contract.service';
import { VaultChainService } from './vault.service';
import { ErrorService } from '../shared/error.service';
import { AccountsChainService } from './accounts.service';
import { TradeSettingsService } from '../shared/trade-settings.service';
import { AccountContractService } from './contracts/account-contract.service';
import { ETH_ADDRESS } from '../shared/main.tokens';
import { TriggerService } from '../shared/trigger.service';
import { toStatus, type Status } from '../../core/tokens/resource-status';
import { safeCall } from './safe-call';
import { TransactionAccessService } from '../shared/compliance/transaction-access.service';
import { ProtocolConfigService } from '../shared/config/protocol-config.service';
import { TreasuryModeService } from '../shared/treasury-mode.service';

@Injectable({ providedIn: 'root' })
export class PortfolioService {
  private readonly accountContract = inject(AccountContractService);
  private readonly vaultContract = inject(VaultContractService);
  private readonly vault = inject(VaultChainService);

  private readonly errorSvc = inject(ErrorService);
  private readonly trigger = inject(TriggerService);
  private readonly transactionAccess = inject(TransactionAccessService);
  private readonly protocolConfig = inject(ProtocolConfigService);

  private readonly accountsSvc = inject(AccountsChainService);
  private readonly settings = inject(TradeSettingsService);
  private readonly treasuryMode = inject(TreasuryModeService);

  readonly writing = signal(false);
  readonly writeError = signal<string | null>(null);
  readonly writeSuccess = signal(false);
  readonly lastTransactionHash = signal<string | null>(null);

  readonly lastExplorerUrl = computed(() => {
    const hash = this.lastTransactionHash();
    const explorer = this.protocolConfig.network().explorerUrl;
    if (!hash || !explorer) return null;
    return `${explorer.replace(/\/$/, '')}/tx/${hash}`;
  });

  readonly writeStatus = computed<'idle' | 'pending' | 'success' | 'error'>(
    () => {
      if (this.writing()) return 'pending';
      if (this.writeError()) return 'error';
      if (this.writeSuccess()) return 'success';
      return 'idle';
    },
  );

  private beginWrite(): boolean {
    if (this.writing()) return false;
    this.writing.set(true);
    this.writeError.set(null);
    this.writeSuccess.set(false);
    return true;
  }

  private endWriteOk() {
    this.writeSuccess.set(true);
    setTimeout(() => this.writeSuccess.set(false), 5000);
    this.writing.set(false);
  }

  private endWriteErr(e: any, fallbackMsg: string) {
    const msg = e?.message ?? fallbackMsg;
    this.writeError.set(msg);
    this.errorSvc.show(msg);
    this.writing.set(false);
  }

  private normKey(input: string | null | undefined): string {
    return (input ?? '').trim().toLowerCase();
  }

  readonly activeAccount = computed<string | null>(() => {
    const selected = this.normKey(this.settings.selectedAccountId());
    if (selected) return selected;

    const fallback = this.normKey(this.accountsSvc.latestAccount());
    return fallback || null;
  });

  readonly portfolioAccounts = computed(() => {
    const found = new Map<string, string>();
    for (const account of this.accountsSvc.accounts() ?? []) {
      const key = this.normKey(account);
      if (key) found.set(key, account);
    }

    const active = this.activeAccount();
    if (active) found.set(this.normKey(active), active);

    if (this.treasuryMode.actingAsTreasurer()) {
      const treasuryAccount = this.treasuryMode.selectedTreasuryAccount();
      if (treasuryAccount && this.treasuryMode.selectedAccountAccess()) {
        found.set(this.normKey(treasuryAccount), treasuryAccount);
      }
    }

    return Array.from(found.values());
  });

  // ---- Stable keys for params ----
  private readonly _accountsKey = computed(() =>
    this.portfolioAccounts()
      .map((a) => this.normKey(a))
      .sort()
      .join('|'),
  );

  private readonly _erc20TokensKey = computed(() =>
    (this.vault.erc20Tokens() ?? [])
      .map((t) => this.normKey(t))
      .sort()
      .join('|'),
  );

  // ✅ PRIVATE resource: params are REAL inputs only (keys), no ticks
  private readonly _allBalancesResource = resource<
    Record<string, Record<string, { balance: bigint; locked: bigint }>>,
    { addrKey: string; tokKey: string }
  >({
    params: () => ({
      addrKey: this._accountsKey(),
      tokKey: this._erc20TokensKey(),
    }),

    loader: async () => {
      // Use the live lists at execution time (they correspond to the keys)
      const accounts = this.portfolioAccounts();
      const tokens = this.vault.erc20Tokens() ?? [];

      const result: Record<
        string,
        Record<string, { balance: bigint; locked: bigint }>
      > = {};

      for (const account of accounts) {
        const accountKey = this.normKey(account);
        const accountMap: Record<string, { balance: bigint; locked: bigint }> =
          {};

        for (const token of tokens) {
          const tokenKey = this.normKey(token);

          const [balance, locked] = await Promise.all([
            this._getERC20Balance(account, token),
            this._getLockedERC20(account, token),
          ]);

          accountMap[tokenKey] = { balance, locked };
        }

        const ethKey = this.normKey(ETH_ADDRESS);
        const [ethBalance, ethLocked] = await Promise.all([
          this._getETHBalance(account),
          this._getLockedETHBalance(account),
        ]);
        accountMap[ethKey] = { balance: ethBalance, locked: ethLocked };

        result[accountKey] = accountMap;
      }

      return result;
    },
  });

  readonly lastRefreshedAt = signal<Date | null>(null);

  /** ✅ Explicit refresh entrypoint (call on deposit/withdraw/account changes). */
  refreshPortfolio() {
    this._allBalancesResource.reload();
    this.lastRefreshedAt.set(new Date());
  }

  constructor() {
    effect(() => {
      this.trigger.portfolioTick();
      this.refreshPortfolio();
    });
  }

  // computed exposures
  private readonly _stableAllBalances = stableResourceValue(
    () => this._allBalancesResource.value(),
    {} as Record<string, Record<string, { balance: bigint; locked: bigint }>>,
    { resetKey: () => `${this._accountsKey()}|${this._erc20TokensKey()}` },
  );

  readonly allBalances = computed(() => this._stableAllBalances());
  readonly readStatus = computed<Status>(() =>
    toStatus(this._allBalancesResource.status()),
  );
  readonly readError = computed(
    () => this._allBalancesResource.error() ?? null,
  );

  readonly accountBalances = computed(() => {
    const accountKey = this.normKey(this.activeAccount());
    const data = this.allBalances();
    return accountKey ? (data[accountKey] ?? {}) : {};
  });

  async depositETH(amountHuman: string): Promise<void> {
    this.transactionAccess.assertWriteAllowed('ETH deposit');
    if (!this.beginWrite()) return;
    try {
      const txHash = await this.accountContract.depositETH(amountHuman);
      this.lastTransactionHash.set(txHash);

      // Refresh through central policy and also directly for immediate UI feedback.
      this.trigger.emitDomainEvent({ type: 'deposit' });
      this.refreshPortfolio();

      this.endWriteOk();
    } catch (e: any) {
      this.endWriteErr(e, 'ETH deposit failed');
    }
  }

  async withdrawETH(amountHuman: string): Promise<void> {
    this.transactionAccess.assertWriteAllowed('ETH withdrawal');
    if (!this.beginWrite()) return;
    try {
      const txHash = await this.accountContract.withdrawETH(amountHuman);
      this.lastTransactionHash.set(txHash);

      this.trigger.emitDomainEvent({ type: 'withdraw' });
      this.refreshPortfolio();

      this.endWriteOk();
    } catch (e: any) {
      this.endWriteErr(e, 'ETH withdrawal failed');
    }
  }

  async depositToken(token: string, amountHuman: string, decimals = 18): Promise<void> {
    this.transactionAccess.assertWriteAllowed('token deposit');
    if (!this.beginWrite()) return;
    try {
      const txHash = await this.accountContract.depositToken({ token, amountHuman, decimals });
      this.lastTransactionHash.set(txHash);

      this.trigger.emitDomainEvent({ type: 'deposit' });
      this.refreshPortfolio();

      this.endWriteOk();
    } catch (e: any) {
      this.endWriteErr(e, 'Token deposit failed');
    }
  }

  async withdrawToken(token: string, amountHuman: string, decimals = 18): Promise<void> {
    this.transactionAccess.assertWriteAllowed('token withdrawal');
    if (!this.beginWrite()) return;
    try {
      const txHash = await this.accountContract.withdrawToken({ token, amountHuman, decimals });
      this.lastTransactionHash.set(txHash);

      this.trigger.emitDomainEvent({ type: 'withdraw' });
      this.refreshPortfolio();

      this.endWriteOk();
    } catch (e: any) {
      this.endWriteErr(e, 'Token withdrawal failed');
    }
  }

  async depositNFT(nft: string, tokenId: string | bigint): Promise<void> {
    this.transactionAccess.assertWriteAllowed('NFT deposit');
    if (!this.beginWrite()) return;
    try {
      const txHash = await this.accountContract.depositNFT({ nft, tokenId });
      this.lastTransactionHash.set(txHash);

      this.trigger.emitDomainEvent({ type: 'deposit' });
      this.refreshPortfolio();

      this.endWriteOk();
    } catch (e: any) {
      this.endWriteErr(e, 'NFT deposit failed');
    }
  }

  async withdrawNFT(nft: string, tokenId: string | bigint): Promise<void> {
    this.transactionAccess.assertWriteAllowed('NFT withdrawal');
    if (!this.beginWrite()) return;
    try {
      const txHash = await this.accountContract.withdrawNFT({ nft, tokenId });
      this.lastTransactionHash.set(txHash);

      this.trigger.emitDomainEvent({ type: 'withdraw' });
      this.refreshPortfolio();

      this.endWriteOk();
    } catch (e: any) {
      this.endWriteErr(e, 'NFT withdrawal failed');
    }
  }

  // ======================= PRIVATE READS =======================

  private async _getERC20Balance(
    accountAddress: string,
    tokenAddress: string,
  ): Promise<bigint> {
    if (!tokenAddress || !accountAddress) return 0n;

    return safeCall(
      () => this.vaultContract.getERC20Balance(accountAddress, tokenAddress),
      0n,
      `vault.getERC20Balance(${accountAddress},${tokenAddress})`,
    );
  }

  private async _getLockedERC20(
    accountAddress: string,
    tokenAddress: string,
  ): Promise<bigint> {
    if (!tokenAddress || !accountAddress) return 0n;

    return safeCall(
      () => this.vaultContract.getLockedERC20(accountAddress, tokenAddress),
      0n,
      `vault.getLockedERC20(${accountAddress},${tokenAddress})`,
    );
  }

  private async _getETHBalance(accountAddress: string): Promise<bigint> {
    if (!accountAddress) return 0n;

    return safeCall(
      () => this.vaultContract.getETHBalance(accountAddress),
      0n,
      `vault.getETHBalance(${accountAddress})`,
    );
  }

  private async _getLockedETHBalance(accountAddress: string): Promise<bigint> {
    if (!accountAddress) return 0n;

    return safeCall(
      () => this.vaultContract.getLockedETHBalance(accountAddress),
      0n,
      `vault.getLockedETHBalance(${accountAddress})`,
    );
  }
}
