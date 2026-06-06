import {
  Injectable,
  inject,
  signal,
  resource,
  computed,
  effect,
} from '@angular/core';
import { stableResourceValue } from '../../core/signals/stable-resource';
import { WalletConnectService } from '../../wallet/wallet-connect.service';
import { Contract, JsonRpcProvider, ZeroAddress } from 'ethers';
import { AccountRegistryContractService } from './contracts/account-registry-contract.service';
import { AccountFactoryContractService } from './contracts/accountFactory-contract.service';
import { LendingAccountFactoryContractService } from './contracts/lending-account-factory-contract.service';
import { TriggerService } from '../shared/trigger.service';
import { TransactionAccessService } from '../shared/compliance/transaction-access.service';
import { ProtocolConfigService } from '../shared/config/protocol-config.service';
import { toStatus, type Status } from '../../core/tokens/resource-status';
import { norm } from '../../core/tokens/token-normalize';
import { CURRENT_NETWORK } from '../../constants/network.config';
import { NETWORKS } from '../../constants/networks';
import { getContractAddress } from '../../contracts/contract-registry';
import { TreasuryModeService } from '../shared/treasury-mode.service';

const ACCOUNT_NAME_ABI = [
  'function accountName() view returns (string)',
  'function setAccountName(string newName)',
] as const;

export type AccountType = 'normal' | 'lending' | 'treasury';

export type AccountRecord = {
  address: string;
  name: string;
  active: boolean;
  type: AccountType;
};

@Injectable({ providedIn: 'root' })
export class AccountsChainService {
  private readonly wallet = inject(WalletConnectService);
  private readonly address = this.wallet.address;

  private readonly registry = inject(AccountRegistryContractService);
  private readonly factory = inject(AccountFactoryContractService);
  private readonly lendingFactory = inject(
    LendingAccountFactoryContractService,
  );
  private readonly trigger = inject(TriggerService);
  private readonly transactionAccess = inject(TransactionAccessService);
  private readonly protocolConfig = inject(ProtocolConfigService);
  private readonly treasuryMode = inject(TreasuryModeService);

  private _accountsFp = '';

  readonly accountNames = signal<Record<string, string>>({});
  readonly accountActive = signal<Record<string, boolean>>({});
  readonly accountTypes = signal<Record<string, AccountType>>({});

  private readonly _accountRecordsResource = resource<
    AccountRecord[],
    { addr: string | null }
  >({
    params: () => ({ addr: this.address() }),
    loader: async ({ params }) => {
      if (!params.addr) {
        this.accountNames.set({});
        this.accountActive.set({});
        this.accountTypes.set({});
        this._emitAccountsChangedIfNeeded([]);
        return [];
      }

      const [normalAccounts, lendingAccounts] = await Promise.all([
        this.registry.getNormalAccounts(params.addr).catch(() => []),
        this.registry.getLendingAccounts(params.addr).catch(() => []),
      ]);

      const byAddress = new Map<string, AccountType>();

      for (const account of normalAccounts)
        byAddress.set(norm(account), 'normal');
      for (const account of lendingAccounts)
        byAddress.set(norm(account), 'lending');

      if (byAddress.size === 0) {
        const fallback = (await this.registry.getAccounts(params.addr)) ?? [];
        for (const account of fallback) byAddress.set(norm(account), 'normal');
      }

      const allAccounts = Array.from(byAddress.keys());
      const [names, active] = await Promise.all([
        this._loadAccountNames(allAccounts),
        this._loadAccountActive(allAccounts),
      ]);

      const records = allAccounts.map((account) => ({
        address: account,
        name: names[account] ?? '',
        active: active[account] ?? true,
        type: byAddress.get(account) ?? 'normal',
      }));

      this.accountNames.set(names);
      this.accountActive.set(active);
      this.accountTypes.set(Object.fromEntries(byAddress));
      this._emitAccountsChangedIfNeeded(
        records
          .filter((account) => account.active)
          .map((account) => account.address),
      );

      return records;
    },
  });

  private _emitAccountsChangedIfNeeded(accounts: string[]) {
    const fp = accounts.map(norm).sort().join('|');
    if (fp === this._accountsFp) return;

    this._accountsFp = fp;
    this.trigger.emitDomainEvent({ type: 'accountsChanged', accounts });
  }

  private readonly _stablePersonalAccountRecords = stableResourceValue(() => this._accountRecordsResource.value(), [] as AccountRecord[], { resetKey: () => this.address() });

  readonly personalAccountRecords = computed(() => this._stablePersonalAccountRecords());

  readonly treasuryAccountRecords = computed<AccountRecord[]>(() =>
    this.treasuryMode.accounts()
      .filter((row) => row.allowed)
      .map((row) => {
        const address = norm(row.account);
        return {
          address,
          name: `Treasury account ${this.shortAddress(address)}`,
          active: true,
          type: 'treasury' as const,
        };
      }),
  );

  readonly accountRecords = computed(() => {
    const byAddress = new Map<string, AccountRecord>();
    for (const account of this.personalAccountRecords()) byAddress.set(norm(account.address), account);
    for (const account of this.treasuryAccountRecords()) byAddress.set(norm(account.address), account);
    return Array.from(byAddress.values());
  });

  readonly allAccounts = computed(() =>
    this.accountRecords().map((account) => account.address),
  );

  readonly accounts = computed(() =>
    this.personalAccountRecords()
      .filter((account) => account.active)
      .map((account) => account.address),
  );

  readonly normalAccounts = computed(() =>
    this.personalAccountRecords()
      .filter((account) => account.active && account.type === 'normal')
      .map((account) => account.address),
  );

  readonly lendingAccounts = computed(() =>
    this.personalAccountRecords()
      .filter((account) => account.active && account.type === 'lending')
      .map((account) => account.address),
  );
  readonly isInitialLoading = computed(() =>
    toStatus(this._accountRecordsResource.status()) === 'pending' && this.accountRecords().length === 0,
  );

  readonly status = computed<Status>(() => {
    const status = toStatus(this._accountRecordsResource.status());
    if (status === 'pending' && this.accountRecords().length > 0) return 'success';
    return status;
  });
  readonly error = computed(() => this._accountRecordsResource.error() ?? null);

  private readonly _latestAccountResource = resource<
    string | null,
    { addr: string | null }
  >({
    params: () => ({ addr: this.address() }),
    loader: async ({ params }) => {
      if (!params.addr) return null;
      const result = await this.registry.latestAccount(params.addr);
      return result === ZeroAddress ? null : norm(result);
    },
  });

  private readonly _stableLatestAccount = stableResourceValue(() => this._latestAccountResource.value(), null as string | null, { resetKey: () => this.address() });

  readonly latestAccount = computed(() => this._stableLatestAccount());
  readonly latestAccountStatus = computed(() =>
    this._latestAccountResource.status(),
  );
  readonly latestAccountError = computed(
    () => this._latestAccountResource.error() ?? null,
  );

  constructor() {
    effect(() => {
      this.trigger.accountsTick();
      this.refreshAccounts();
    });
  }

  refreshAccounts() {
    this._accountRecordsResource.reload();
    this._latestAccountResource.reload();
  }

  readonly creating = signal(false);
  readonly createError = signal<string | null>(null);
  readonly createSuccess = signal(false);
  readonly updatingAccount = signal<string | null>(null);
  readonly updateError = signal<string | null>(null);
  readonly lastTransactionHash = signal<string | null>(null);

  readonly lastExplorerUrl = computed(() => {
    const hash = this.lastTransactionHash();
    const explorer = this.protocolConfig.network().explorerUrl;
    if (!hash || !explorer) return null;
    return `${explorer.replace(/\/$/, '')}/tx/${hash}`;
  });

  async create(name?: string, type: AccountType = 'normal'): Promise<void> {
    if (this.creating()) return;

    this.transactionAccess.assertWriteAllowed('account creation');

    this.creating.set(true);
    this.createError.set(null);
    this.createSuccess.set(false);

    try {
      const owner = this.address();

      const txHash =
        type === 'lending'
          ? await this.lendingFactory.createLendingAccount()
          : await this.factory.createAccount();

      this.lastTransactionHash.set(txHash);

      const trimmedName = name?.trim();

      if (owner && trimmedName) {
        const latest =
          type === 'lending'
            ? await this.registry.latestLendingAccount(owner)
            : await this.registry.latestNormalAccount(owner);

        if (latest && latest !== ZeroAddress) {
          const renameHash = await this.setAccountName(latest, trimmedName);
          if (renameHash) this.lastTransactionHash.set(renameHash);
        }
      }

      this.refreshAccounts();
      this.trigger.emitDomainEvent({ type: 'accountCreated' });

      this.createSuccess.set(true);
      setTimeout(() => this.createSuccess.set(false), 5000);
    } catch (e: any) {
      this.createError.set(e?.message ?? 'Account creation failed');
    } finally {
      this.creating.set(false);
    }
  }

  readonly createStatus = computed(() => {
    if (this.creating()) return 'pending';
    if (this.createError()) return 'error';
    if (this.createSuccess()) return 'success';
    return 'idle';
  });

  async renameAccount(account: string, name: string): Promise<void> {
    this.transactionAccess.assertWriteAllowed('account rename');

    const key = norm(account);
    const trimmedName = name.trim();

    this.updatingAccount.set(key);
    this.updateError.set(null);

    try {
      const txHash = await this.setAccountName(key, trimmedName);
      if (txHash) this.lastTransactionHash.set(txHash);
      this.accountNames.update((names) => ({ ...names, [key]: trimmedName }));
      this.refreshAccounts();
    } catch (e: any) {
      this.updateError.set(e?.message ?? 'Account rename failed');
      throw e;
    } finally {
      this.updatingAccount.set(null);
    }
  }

  async setActive(account: string, active: boolean): Promise<void> {
    this.transactionAccess.assertWriteAllowed('account status update');

    const key = norm(account);

    this.updatingAccount.set(key);
    this.updateError.set(null);

    try {
      await this.registry.setAccountActive(key, active);
      this.accountActive.update((current) => ({ ...current, [key]: active }));
      this.refreshAccounts();
      this.trigger.emitDomainEvent({
        type: 'accountsChanged',
        accounts: this.accounts(),
      });
    } catch (e: any) {
      this.updateError.set(e?.message ?? 'Account status update failed');
      throw e;
    } finally {
      this.updatingAccount.set(null);
    }
  }

  accountLabel(account: string): string {
    const key = norm(account);
    const treasuryAccount = this.treasuryAccountRecords().find((row) => norm(row.address) === key);
    if (treasuryAccount) return treasuryAccount.name;

    const name = this.accountNames()[key];
    return name?.trim() ? name : this.shortAddress(account);
  }

  accountType(account: string): AccountType {
    const key = norm(account);
    if (this.treasuryAccountRecords().some((row) => norm(row.address) === key)) return 'treasury';
    return this.accountTypes()[key] ?? 'normal';
  }

  isAccountActive(account: string): boolean {
    return this.accountActive()[norm(account)] ?? true;
  }

  private async getAccountName(account: string): Promise<string> {
    const contract = await this.withAccountContract(account);
    return String(await contract['accountName']());
  }

  private async setAccountName(
    account: string,
    name: string,
  ): Promise<string | null> {
    const contract = await this.withAccountContract(account, true);
    const tx = await contract['setAccountName'](name);
    const receipt = await tx.wait();
    return receipt?.hash ?? tx.hash ?? null;
  }

  private async withAccountContract(
    account: string,
    requireSigner = false,
  ): Promise<Contract> {
    let provider = await this.wallet.getEthersProvider();

    if (!provider || typeof provider.getSigner !== 'function') {
      const rpcUrl = NETWORKS[CURRENT_NETWORK].rpcUrls.default.http[0];
      provider = new JsonRpcProvider(rpcUrl) as any;
    }

    if (!provider) {
      throw new Error('No provider available');
    }

    const signer = await provider.getSigner().catch(() => null);

    if (requireSigner && !signer) {
      throw new Error('No signer available');
    }

    return new Contract(account, ACCOUNT_NAME_ABI, signer ?? provider);
  }

  private async _loadAccountNames(
    accounts: string[],
  ): Promise<Record<string, string>> {
    const entries = await Promise.all(
      accounts.map(async (account) => {
        const key = norm(account);

        try {
          const name = await this.getAccountName(account);
          return [key, name?.trim() ?? ''] as const;
        } catch {
          return [key, ''] as const;
        }
      }),
    );

    return Object.fromEntries(entries);
  }

  private async _loadAccountActive(
    accounts: string[],
  ): Promise<Record<string, boolean>> {
    const entries = await Promise.all(
      accounts.map(async (account) => {
        const key = norm(account);

        try {
          const active = await this.registry.isAccountActive(account);
          return [key, Boolean(active)] as const;
        } catch {
          return [key, true] as const;
        }
      }),
    );

    return Object.fromEntries(entries);
  }

  private shortAddress(account: string): string {
    const a = norm(account);
    if (a.length < 10) return a;
    return `${a.slice(0, 6)}...${a.slice(-4)}`;
  }
}
