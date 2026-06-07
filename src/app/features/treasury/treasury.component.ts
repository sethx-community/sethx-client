import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { stableComputed } from '../../core/signals/stable-resource';
import { FormsModule } from '@angular/forms';

import { TreasuryContractService, TreasurerInfo, TreasuryAssetOverview, TreasuryAccountBalance } from '../../services/onchain/contracts/treasury-contract.service';
import { TreasuryDataService } from '../../services/shared/data/treasury-data.service';
import { TreasuryActionKey, TreasuryModeService } from '../../services/shared/treasury-mode.service';
import { WalletConnectService } from '../../wallet/wallet-connect.service';

type PermissionKey = 'callVault' | 'manageLiquidity' | 'managePayments' | 'tradeSethx';
type PermissionRow = { key: PermissionKey; label: string; description: string };
type ActionRow = { key: TreasuryActionKey; label: string; description: string };

type TreasuryAccountRow = {
  account: string;
  allowed: boolean;
  balance: TreasuryAccountBalance | null;
};

@Component({ selector: 'app-treasury', standalone: true, imports: [CommonModule, FormsModule], templateUrl: './treasury.component.html' })
export class TreasuryComponent implements OnInit {
  readonly treasury = inject(TreasuryContractService);
  private readonly treasuryData = inject(TreasuryDataService);
  readonly treasuryMode = inject(TreasuryModeService);
  readonly wallet = inject(WalletConnectService);

  readonly loading = this.treasuryData.loading;
  readonly readError = this.treasuryData.error;
  readonly localError = signal<string | null>(null);
  readonly success = signal<string | null>(null);
  readonly busy = signal(false);
  readonly address = signal<string | null>(null);
  readonly hasTreasuryAccess = signal(false);
  readonly treasurerInfo = signal<TreasurerInfo | null>(null);
  readonly accountRows = signal<TreasuryAccountRow[]>([]);

  tokenForAccountBalance = '';
  selectedTreasuryAccount = '';
  vaultEthAmount = '';
  vaultToken = '';
  vaultTokenAmount = '';
  paymentRecipient = '';
  paymentEthAmount = '';
  paymentToken = '';
  paymentTokenAmount = '';
  paymentMemo = '';
  accountEthAmount = '';
  accountToken = '';
  accountTokenAmount = '';

  readonly permissionRows: PermissionRow[] = [
    { key: 'callVault', label: 'Call Vault', description: 'Pull protocol-owned ETH/ERC20 balances from SethxVault.' },
    { key: 'manageLiquidity', label: 'Manage Liquidity', description: 'Move treasury capital through passive pools and treasury accounts.' },
    { key: 'managePayments', label: 'Manage Payments', description: 'Pay governance-approved recipients from payment modules.' },
    { key: 'tradeSethx', label: 'Trade SETHX', description: 'Use treasury trading modules for approved SETHX actions.' },
  ];

  readonly actionRows: ActionRow[] = [
    { key: 'fundAccount', label: 'Fund account', description: 'Deposit ProtocolTreasury ETH/ERC20 into an approved treasury account.' },
    { key: 'withdrawAccount', label: 'Withdraw account', description: 'Return ETH/ERC20 from an approved treasury account to ProtocolTreasury.' },
    { key: 'spotTrade', label: 'Token Spot', description: 'Place and cancel treasury token spot orders through TreasuryTradeModule.' },
    { key: 'lend', label: 'Lending', description: 'Place/cancel lending orders and redeem/claim lending bonds through TreasuryTradeModule.' },
    { key: 'passiveLp', label: 'Passive LP', description: 'Deposit, request, cancel, and process passive pool withdrawals.' },
  ];

  async ngOnInit() { await this.refresh(); }

  async refresh() {
    this.localError.set(null);
    this.success.set(null);
    try {
      const address = await this.treasury.currentAddress();
      this.address.set(address);
      await this.treasuryData.loadDashboard(true);
      await this.treasuryMode.refresh(true);
      if (!address) {
        this.hasTreasuryAccess.set(false);
        this.treasurerInfo.set(null);
        this.accountRows.set([]);
        return;
      }
      const access = await this.treasuryData.hasTreasuryAccess(address, true);
      this.hasTreasuryAccess.set(access);
      this.treasurerInfo.set(access ? await this.treasuryData.loadTreasurerInfo(address, true) : null);
      await this.refreshAccountRows();
      this.selectedTreasuryAccount = this.treasuryMode.selectedTreasuryAccount() ?? this.accountRows().find((row) => row.allowed)?.account ?? '';
    } catch (err) {
      this.localError.set(err instanceof Error ? err.message : 'Unable to load treasury data.');
      this.hasTreasuryAccess.set(false);
    }
  }

  async refreshAccountRows(): Promise<void> {
    const rows = await Promise.all(this.treasuryMode.accounts().map(async (row) => ({
      ...row,
      balance: await this.treasury.treasuryAccountBalance(row.account, this.tokenForAccountBalance).catch(() => null),
    })));
    this.accountRows.set(rows);
  }

  readonly dashboard = this.treasuryData.dashboard;


  trackTokenRow(_: number, row: { token: string }): string { return row.token; }
  trackTreasuryAccount(_: number, row: TreasuryAccountRow): string { return row.account; }
  trackTreasurer(_: number, treasurer: string): string { return treasurer; }

  trackPermission(_: number, row: PermissionRow): string { return row.key; }
  trackAction(_: number, row: ActionRow): string { return row.key; }


  readonly tokenRows = stableComputed<{ token: string; balance: bigint }[]>(() => {
    const overview = this.overview();
    if (!overview) return [];
    return overview.tokens.map((token, index) => ({ token, balance: overview.balances[index] ?? 0n }));
  });

  overview(): TreasuryAssetOverview | null { return this.dashboard().overview; }
  readonly treasurers = stableComputed<string[]>(() => this.dashboard().treasurers);
  killed(): boolean { return Boolean(this.dashboard().killed); }
  ethBalance(): bigint { return this.overview()?.ethBal ?? 0n; }
  error(): string | null { return this.localError() ?? this.readError(); }

  hasPermission(permission: PermissionRow): boolean {
    return this.hasGlobalPermission(permission.key);
  }

  hasGlobalPermission(key: PermissionKey): boolean {
    const info = this.treasurerInfo();
    if (!info) return false;
    return (info.permissions & this.treasury.permissions[key]) !== 0n;
  }

  hasAction(action: TreasuryActionKey): boolean {
    return this.treasuryMode.actionPermissions()[action];
  }

  selectTreasuryAccount(account: string): void {
    this.selectedTreasuryAccount = account;
    this.treasuryMode.selectTreasuryAccount(account);
  }

  async execute(label: string, operation: () => Promise<unknown>): Promise<void> {
    this.busy.set(true);
    this.localError.set(null);
    this.success.set(null);
    try {
      const tx = await operation();
      const maybeTx = tx as { wait?: () => Promise<unknown> } | null;
      if (maybeTx?.wait) await maybeTx.wait();
      this.success.set(`${label} submitted successfully.`);
      await this.refresh();
    } catch (error) {
      this.localError.set(error instanceof Error ? error.message : `${label} failed.`);
    } finally {
      this.busy.set(false);
    }
  }

  async openTreasuryAccount(): Promise<void> {
    await this.execute('Open treasury account', () => this.treasury.openTreasuryAccount());
  }

  async pullVaultEth(): Promise<void> {
    await this.execute('Vault ETH pull', () => this.treasury.pullVaultETH(this.vaultEthAmount));
  }

  async pullVaultToken(): Promise<void> {
    await this.execute('Vault ERC20 pull', () => this.treasury.pullVaultERC20(this.vaultToken, this.vaultTokenAmount));
  }

  async payEth(): Promise<void> {
    await this.execute('ETH payment', () => this.treasury.payETH(this.paymentRecipient, this.paymentEthAmount, this.paymentMemo));
  }

  async payToken(): Promise<void> {
    await this.execute('ERC20 payment', () => this.treasury.payERC20(this.paymentToken, this.paymentRecipient, this.paymentTokenAmount, this.paymentMemo));
  }

  async depositEth(): Promise<void> {
    await this.execute('Treasury account ETH funding', () => this.treasury.depositETHToAccount(this.selectedTreasuryAccount, this.accountEthAmount));
  }

  async withdrawEth(): Promise<void> {
    await this.execute('Treasury account ETH withdrawal', () => this.treasury.withdrawETHFromAccount(this.selectedTreasuryAccount, this.accountEthAmount));
  }

  async depositToken(): Promise<void> {
    await this.execute('Treasury account ERC20 funding', () => this.treasury.depositERC20ToAccount(this.selectedTreasuryAccount, this.accountToken, this.accountTokenAmount));
  }

  async withdrawToken(): Promise<void> {
    await this.execute('Treasury account ERC20 withdrawal', () => this.treasury.withdrawERC20FromAccount(this.selectedTreasuryAccount, this.accountToken, this.accountTokenAmount));
  }

  canUseAccountActions(action: TreasuryActionKey): boolean {
    return Boolean(this.selectedTreasuryAccount && this.treasuryMode.actionPermissions()[action] && !this.killed());
  }

  formatEth(value: bigint): string { return this.treasuryData.formatEth(value); }
  formatRaw(value: bigint | null | undefined): string { return (value ?? 0n).toString(); }
  accountEth(row: TreasuryAccountRow): string { return this.formatEth(row.balance?.ethBalance ?? 0n); }
  accountLockedEth(row: TreasuryAccountRow): string { return this.formatEth(row.balance?.lockedEthBalance ?? 0n); }

  short(value: string | null | undefined): string {
    if (!value) return '—';
    return value.length > 14 ? `${value.slice(0, 6)}…${value.slice(-4)}` : value;
  }
}
