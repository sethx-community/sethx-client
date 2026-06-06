import {
  Component,
  Input,
  signal,
  inject,
  computed,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ethers, isAddress } from 'ethers';
import { formatUnitsHuman } from '../../format/number-format';
import { ETH_ADDRESS } from '../../../services/shared/main.tokens';
import {
  ConfirmationModalComponent,
  ConfirmationField,
} from '../../modals/confirmation/confirmation-modal.component';
import { ApproveModalComponent } from '../../modals/approval/approve-modal.component';

import { TradeSettingsService } from '../../../services/shared/trade-settings.service';
import {
  TokenService,
  TokenInfo,
} from '../../../services/shared/token.service';
import { AccountsChainService } from '../../../services/onchain/accounts.service';
import { PortfolioService } from '../../../services/onchain/portfolio.service';
import { AccountContractService } from '../../../services/onchain/contracts/account-contract.service';
import { TransactionAccessService } from '../../../services/shared/compliance/transaction-access.service';
import { WalletConnectService } from '../../../wallet/wallet-connect.service';

import { DepositWithdrawModalData } from '../../../../types/order_flow/deposit-withdraw-modal.types';

function n(v: unknown): string {
  return String(v ?? '')
    .trim()
    .toLowerCase();
}
function isNativeLike(v: unknown): boolean {
  const k = n(v);
  return k === 'eth' || k === 'native' || k === n(ETH_ADDRESS);
}

@Component({
  selector: 'app-deposit-withdraw-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ConfirmationModalComponent,
    ApproveModalComponent,
  ],
  templateUrl: './deposit-withdraw-modal.component.html',
})
export class DepositWithdrawModalComponent implements OnInit {
  @Input({ required: true }) data!: DepositWithdrawModalData;
  @Input() onClose?: (result?: any) => void;

  private readonly portfolio = inject(PortfolioService);
  private readonly settings = inject(TradeSettingsService);
  private readonly tokens = inject(TokenService);
  private readonly accounts = inject(AccountsChainService);
  private readonly accountContract = inject(AccountContractService);
  private readonly transactionAccess = inject(TransactionAccessService);
  private readonly wallet = inject(WalletConnectService);

  readonly writing = this.portfolio.writing;
  readonly explorerUrl = this.portfolio.lastExplorerUrl;

  // ===== UI =====
  readonly amount = signal('');
  readonly error = signal<string | null>(null);
  readonly walletBalance = signal<bigint | null>(null);
  readonly walletBalanceLoading = signal(false);

  readonly showConfirmModal = signal(false);
  readonly showApproveModal = signal(false);

  readonly confirmModalFields = signal<ConfirmationField[]>([]);
  readonly confirmData = signal<{
    kind: 'deposit' | 'withdraw';
    amount: string;
    tokenAddress: string;
    tokenSymbol: string;
    decimals: number;
    isETH: boolean;
    isNFT?: boolean;
    nftAddress?: string;
    tokenId?: string;
    accountAddress: string; // selected trading account
    spender: string; // account contract address (for approve)
  } | null>(null);

  // ===== token selection (TOKEN only) =====
  readonly tokenSelected = signal<string>(''); // dropdown
  readonly tokenInput = signal<string>(''); // paste input

  // ===== NFT selection (NFT only) =====
  readonly nftAddress = signal<string>('');
  readonly nftTokenId = signal<string>('');

  readonly tokenList = computed<TokenInfo[]>(() => this.tokens.list() ?? []);

  // selected trading account address (string | null)
  readonly selectedAccount = this.settings.selectedAccountId;

  // resolve token key -> address
  readonly tokenKey = computed(() =>
    n(
      this.tokenSelected() ||
        this.tokenInput() ||
        this.data.tokenAddress ||
        (this.data.asset === 'ETH' ? ETH_ADDRESS : ''),
    ),
  );

  readonly tokenAddress = computed(() => {
    const key = this.tokenKey();
    if (!key) return '';
    if (isNativeLike(key)) return ETH_ADDRESS; // allow typing ETH but treat as ETH
    return key;
  });

  readonly isValidTokenAddress = computed(() => {
    const addr = this.tokenAddress();
    if (!addr) return false;
    return isNativeLike(addr) || isAddress(addr);
  });

  readonly isValidNftAddress = computed(() => {
    const addr = this.nftAddress().trim();
    return !!addr && isAddress(addr);
  });

  readonly tokenInfo = computed(() => {
    const addr = this.tokenAddress();
    if (!addr) return undefined;
    const found = this.tokenList().find((t) => n(t.address) === n(addr));
    return found;
  });

  readonly tokenSymbol = computed(() => {
    // Native ETH mode
    if (this.data.asset === 'ETH') return 'ETH';

    // Token mode: prefer actual token symbol, otherwise show "Token"
    const sym = this.tokenInfo()?.symbol ?? this.data.tokenSymbol ?? null;

    // Guard: never show ETH in TOKEN mode
    if (!sym || sym === 'ETH') return 'Token';

    return sym;
  });

  readonly tokenDecimals = computed(() => {
    if (this.data.asset === 'ETH') return 18;
    return this.data.tokenDecimals ?? this.tokenInfo()?.decimals ?? 18;
  });

  titleText(): string {
    const verb = this.data.intent === 'deposit' ? 'Deposit' : 'Withdraw';

    const asset =
      this.data.asset === 'ETH'
        ? 'ETH'
        : this.data.asset === 'NFT'
          ? 'NFT'
          : (this.tokenSymbol() ?? 'Token');

    return `${verb} ${asset}`;
  }

  ngOnInit(): void {
    if (this.data.amount) this.amount.set(this.data.amount);

    // prefill token for TOKEN flow
    if (this.data.asset === 'TOKEN') {
      if (this.data.tokenAddress) this.tokenInput.set(this.data.tokenAddress);
      // or if you want to preselect from list, you can set tokenSelected instead if match exists
    }

    if (this.data.asset === 'NFT') {
      if (this.data.nftAddress) this.nftAddress.set(this.data.nftAddress);
      if (this.data.tokenId) this.nftTokenId.set(this.data.tokenId);
    }

    void this.refreshWalletBalance();
  }

  // dropdown handlers (like buy order)
  onTokenSelected(addr: string) {
    this.tokenSelected.set(addr);
    this.tokenInput.set('');
    this.nftAddress.set('');
    this.nftTokenId.set('');
    void this.refreshWalletBalance();
  }
  onTokenInput(addr: string) {
    this.tokenInput.set(addr);
    if (n(addr)) this.tokenSelected.set('');
    void this.refreshWalletBalance();
  }

  async refreshWalletBalance(): Promise<void> {
    if (this.data.asset === 'NFT') {
      this.walletBalance.set(null);
      return;
    }

    const owner = this.wallet.address();
    const tokenAddress = this.tokenAddress();

    if (!owner || !tokenAddress) {
      this.walletBalance.set(null);
      return;
    }

    this.walletBalanceLoading.set(true);
    try {
      if (this.data.asset === 'ETH' || isNativeLike(tokenAddress)) {
        const provider = await this.wallet.getEthersProvider();
        this.walletBalance.set(provider ? await provider.getBalance(owner) : null);
      } else {
        this.walletBalance.set(
          await this.accountContract.getTokenBalance(tokenAddress, owner),
        );
      }
    } catch {
      this.walletBalance.set(null);
    } finally {
      this.walletBalanceLoading.set(false);
    }
  }

  walletBalanceText(): string {
    if (this.data.asset === 'NFT') return 'Not applicable';
    if (this.walletBalanceLoading()) return 'Loading…';
    const value = this.walletBalance();
    if (value == null) return '—';
    const decimals = this.data.asset === 'ETH' ? 18 : this.tokenDecimals();
    const symbol = this.data.asset === 'ETH' ? 'ETH' : this.tokenSymbol();
    return `${formatUnitsHuman(value, decimals, { maxDecimals: 6, compactFrom: 1_000_000 })} ${symbol}`;
  }

  closeAll(result?: any) {
    this.amount.set('');
    this.tokenSelected.set('');
    this.tokenInput.set('');
    this.nftAddress.set('');
    this.nftTokenId.set('');
    this.error.set(null);

    this.showConfirmModal.set(false);
    this.showApproveModal.set(false);
    this.confirmData.set(null);

    this.onClose?.(result);
  }

  private buildConfirmFields(args: {
    kind: 'deposit' | 'withdraw';
    tokenSymbol: string;
    tokenAddress: string;
    amount: string;
    tokenId?: string;
    accountLabel: string;
  }): ConfirmationField[] {
    return [
      {
        label: 'Action',
        value: args.kind === 'deposit' ? 'Deposit' : 'Withdraw',
      },
      { label: 'Account', value: args.accountLabel },
      { label: 'Token', value: args.tokenSymbol },
      { label: 'Token Address', value: args.tokenAddress },
      ...(args.tokenId ? [{ label: 'Token ID', value: args.tokenId }] : []),
      ...(args.amount ? [{ label: 'Amount', value: args.amount }] : []),
    ];
  }

  private accountLabel(accountAddress: string): string {
    return this.accounts.accountLabel(accountAddress);
  }

  async openConfirmation(): Promise<void> {
    this.error.set(null);

    try {
      this.transactionAccess.assertWriteAllowed(`${this.data.intent} ${this.data.asset}`);
    } catch (e: any) {
      this.error.set(e?.message ?? 'This transaction is not available.');
      return;
    }

    const accountAddress = this.selectedAccount();
    if (!accountAddress) return;

    if (this.data.asset === 'NFT') {
      const nftAddress = this.nftAddress().trim();
      const tokenId = this.nftTokenId().trim();

      if (!isAddress(nftAddress)) {
        this.error.set('Enter a valid NFT contract address.');
        return;
      }

      if (!tokenId || !/^\d+$/.test(tokenId)) {
        this.error.set('Enter a valid numeric token ID.');
        return;
      }

      const label = this.accountLabel(accountAddress);
      this.confirmData.set({
        kind: this.data.intent,
        amount: '',
        tokenAddress: nftAddress,
        tokenSymbol: 'NFT',
        decimals: 0,
        isETH: false,
        isNFT: true,
        nftAddress,
        tokenId,
        accountAddress,
        spender: accountAddress,
      });
      this.confirmModalFields.set(
        this.buildConfirmFields({
          kind: this.data.intent,
          tokenSymbol: 'NFT',
          tokenAddress: nftAddress,
          amount: '',
          tokenId,
          accountLabel: label,
        }),
      );
      this.showConfirmModal.set(true);
      return;
    }

    const amount = this.amount().trim();
    if (!amount) return;

    // token address
    const tokenAddress = this.tokenAddress();
    if (!tokenAddress) return;

    const isETH =
      isNativeLike(tokenAddress) || n(tokenAddress) === n(ETH_ADDRESS);

    if (!isETH && !this.isValidTokenAddress()) {
      this.error.set('Invalid token address.');
      return;
    }

    const decimals = isETH ? 18 : this.tokenDecimals();
    const symbol = isETH ? 'ETH' : this.tokenSymbol();

    // ✅ approval only for DEPOSIT TOKEN
    if (!isETH && this.data.intent === 'deposit') {
      const amountBN = ethers.parseUnits(amount.replace(',', '.'), decimals);
      const allowance = await this.accountContract.getAllowance(
        tokenAddress,
        accountAddress,
      );
      if (allowance < amountBN) {
        this.confirmData.set({
          kind: this.data.intent,
          amount,
          tokenAddress,
          tokenSymbol: symbol,
          decimals,
          isETH,
          accountAddress,
          spender: accountAddress, // IMPORTANT: your ApproveModal expects `account` to be spender (Account contract address)
        });
        this.showApproveModal.set(true);
        return;
      }
    }

    const label = this.accountLabel(accountAddress);

    this.confirmData.set({
      kind: this.data.intent,
      amount,
      tokenAddress,
      tokenSymbol: symbol,
      decimals,
      isETH,
      accountAddress,
      spender: accountAddress,
    });

    this.confirmModalFields.set(
      this.buildConfirmFields({
        kind: this.data.intent,
        tokenSymbol: symbol,
        tokenAddress,
        amount,
        accountLabel: label,
      }),
    );

    this.showConfirmModal.set(true);
  }

  async submit(): Promise<void> {
    const d = this.confirmData();
    if (!d) return;

    try {
      if (d.isNFT) {
        if (!d.nftAddress || !d.tokenId) throw new Error('Missing NFT details.');
        if (d.kind === 'deposit') await this.portfolio.depositNFT(d.nftAddress, d.tokenId);
        else await this.portfolio.withdrawNFT(d.nftAddress, d.tokenId);
      } else if (d.kind === 'deposit') {
        if (d.isETH) await this.portfolio.depositETH(d.amount);
        else await this.portfolio.depositToken(d.tokenAddress, d.amount, d.decimals);
      } else {
        if (d.isETH) await this.portfolio.withdrawETH(d.amount);
        else await this.portfolio.withdrawToken(d.tokenAddress, d.amount, d.decimals);
      }

      await this.refreshWalletBalance();
      this.showConfirmModal.set(false);
      this.closeAll({ ok: true });
    } catch (e: any) {
      this.error.set(String(e?.reason ?? e?.message ?? 'Transaction failed'));
    }
  }

  // Approve modal callbacks
  handleApprovalCancel() {
    this.showApproveModal.set(false);
  }
  handleApprovalSuccess() {
    this.showApproveModal.set(false);
    // after approval, continue to confirm
    void this.openConfirmation();
  }
}
