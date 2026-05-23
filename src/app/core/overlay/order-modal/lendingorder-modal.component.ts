import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ethers } from 'ethers';

import { ExpiryPickerComponent } from '../../../shared/expiry-picker/expiry-picker.component';
import { resolveExpiryForContract } from '../../../shared/expiry/expiry-settings';
import { OrderReviewFlowComponent } from '../../../shared/order-flow';
import { TransactionReceiptService } from '../../../shared/transaction-receipt';
import type {
  ConfirmationField,
  RequirementRow,
} from '../../modals/confirmation/confirmation-modal.component';
import { AccountsChainService } from '../../../services/onchain/accounts.service';
import { LendingBondClaimAction, LendingMarketWriteService } from '../../../services/onchain/contracts/lending-market-write.service';
import {
  BorrowValuationPreview,
  ValuationModuleReadService,
} from '../../../services/onchain/contracts/valuation-module-read.service';
import { TradeSettingsService } from '../../../services/shared/trade-settings.service';
import { TriggerService } from '../../../services/shared/trigger.service';
import { norm } from '../../../core/tokens/token-normalize';
import { LendingOrderModalData } from '../../../../types/order_flow/order-flow.types';

const ETH_BORROW_TOKEN = ethers.ZeroAddress;

type LendingPlaceSide = 0 | 1;

type PendingAction = (() => Promise<string | null>) | null;

@Component({
  selector: 'app-lending-order-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ExpiryPickerComponent, OrderReviewFlowComponent],
  templateUrl: './lendingorder-modal.component.html',
  styleUrl: './lendingorder-modal.component.scss',
})
export class LendingOrderModalComponent implements OnInit {
  private readonly writes = inject(LendingMarketWriteService);
  private readonly accounts = inject(AccountsChainService);
  private readonly settings = inject(TradeSettingsService);
  private readonly trigger = inject(TriggerService);
  private readonly valuation = inject(ValuationModuleReadService);
  readonly txReceipt = inject(TransactionReceiptService);

  @Input({ required: true }) data!: LendingOrderModalData;
  @Input() onClose?: (result?: any) => void;

  readonly side = signal<LendingPlaceSide>(0);
  readonly principalHuman = signal('');
  readonly aprHuman = signal('');
  readonly orderExpiry = signal<string>('0');
  readonly marketExpiry = signal<bigint>(0n);
  readonly riskLevel = signal<number>(1);
  readonly cancelOrderId = signal('');
  readonly repayAmountHuman = signal('');
  readonly repayMarketKey = signal('');
  readonly repayMarketLabel = signal('');
  readonly bondIndex = signal('');
  readonly bondAction = signal<LendingBondClaimAction>('initial');

  readonly confirmOpen = signal(false);
  readonly confirmTitle = signal('Confirm lending action');
  readonly confirmLabel = signal('Confirm & Sign');
  readonly confirmFields = signal<ConfirmationField[]>([]);
  readonly confirmRequirements = signal<RequirementRow[] | null>(null);
  readonly confirmError = signal<string | null>(null);
  readonly confirmDisabled = signal(false);
  readonly pending = signal(false);

  private pendingAction: PendingAction = null;

  readonly selectedAccount = computed(() => norm(this.settings.selectedAccountId() ?? ''));
  readonly selectedAccountRecord = computed(() => {
    const account = this.selectedAccount();
    return this.accounts.accountRecords().find((row) => row.address === account) ?? null;
  });
  readonly selectedAccountType = computed(() => this.selectedAccountRecord()?.type ?? 'normal');
  readonly isLendingAccount = computed(() => this.selectedAccountType() === 'lending');
  readonly marketKey = computed(() => {
    const fromData = String(this.data?.marketKey ?? this.data?.defaultMarketKey ?? '').trim();
    if (ethers.isHexString(fromData, 32)) return fromData.toLowerCase();

    const expiry = this.marketExpiry();
    const risk = this.riskLevel();
    if (expiry > 0n && risk > 0) {
      return this.writes.marketKeyFor({ borrowToken: ETH_BORROW_TOKEN, marketExpiry: expiry, riskLevel: risk });
    }

    return '';
  });

  readonly canPlace = computed(() => {
    if (!this.selectedAccount()) return false;
    if (!this.marketKey()) return false;
    if (this.marketExpiry() <= 0n || this.riskLevel() <= 0) return false;
    if (!this.principalHuman().trim() || !this.aprHuman().trim()) return false;
    if (this.side() === 1 && !this.isLendingAccount()) return false;
    return this.resolvedOrderExpiry() > 0n;
  });

  readonly title = computed(() => {
    switch (this.data?.intent) {
      case 'cancel': return 'Cancel Lending Order';
      case 'repay': return 'Repay Lending Debt';
      case 'rollover': return 'Place Rollover Borrow Bid';
      case 'redeem':
      case 'claim': return 'Redeem / Claim Lending Bond';
      default: return this.data?.intent === 'borrow' ? 'Place Borrow Bid' : 'Place Lend Offer';
    }
  });

  ngOnInit(): void {
    const explicitSide = this.data?.defaultSide;
    this.side.set(explicitSide ?? (this.data?.intent === 'borrow' ? 1 : 0));
    this.riskLevel.set(Number(this.data?.riskLevel ?? this.data?.defaultRiskLevel ?? 1));
    this.marketExpiry.set(BigInt(this.data?.marketExpiry ?? this.data?.defaultMarketExpiry ?? 0));
    const explicitOrderExpiry = BigInt(this.data?.defaultOrderExpiry ?? 0);
    this.orderExpiry.set((explicitOrderExpiry || this.defaultOrderExpiry()).toString());
    this.principalHuman.set(this.data?.defaultPrincipalHuman ?? this.data?.defaultAmountHuman ?? '');
    this.aprHuman.set(this.data?.defaultAprHuman ?? this.data?.defaultRatePercent ?? '');
    this.cancelOrderId.set(this.data?.defaultOrderId ?? '');
    this.repayAmountHuman.set(this.data?.defaultAmountHuman ?? '');
    this.repayMarketKey.set(this.data?.repayMarketKey ?? '');
    this.repayMarketLabel.set(this.data?.repayMarketLabel ?? '');
    this.bondIndex.set(this.data?.defaultBondIndex ?? '');
    this.bondAction.set(this.data?.defaultClaimAction ?? 'initial');
  }

  close(result?: any): void {
    this.closeConfirm();
    this.onClose?.(result);
  }

  setSide(next: LendingPlaceSide): void {
    this.side.set(next);
  }

  setBondAction(next: LendingBondClaimAction): void {
    this.bondAction.set(next);
  }

  async openConfirmation(): Promise<void> {
    this.confirmError.set(null);
    this.txReceipt.clear();

    try {
      switch (this.data.intent) {
        case 'cancel':
          this.prepareCancel();
          break;
        case 'repay':
          this.prepareRepay();
          break;
        case 'rollover':
          await this.prepareRolloverOrder();
          break;
        case 'redeem':
        case 'claim':
          this.prepareBondClaim();
          break;
        default:
          await this.preparePlaceOrder();
      }
      this.confirmOpen.set(true);
    } catch (err: any) {
      this.confirmError.set(String(err?.shortMessage ?? err?.reason ?? err?.message ?? 'Invalid lending action.'));
    }
  }

  closeConfirm(): void {
    this.confirmOpen.set(false);
    this.confirmError.set(null);
    this.confirmDisabled.set(false);
    this.pending.set(false);
    this.pendingAction = null;
    this.txReceipt.clear();
  }

  async confirm(): Promise<void> {
    if (!this.pendingAction || this.pending() || this.confirmDisabled()) return;

    this.pending.set(true);
    this.confirmError.set(null);
    this.txReceipt.pending(this.confirmTitle(), 'Waiting for wallet signature and on-chain confirmation...');

    try {
      const txHash = await this.pendingAction();
      this.txReceipt.success('Transaction confirmed', txHash ?? null);
      this.confirmDisabled.set(true);
      this.pendingAction = null;
      this.trigger.emitDomainEvent({ type: 'lendingOrderbookChanged' });
      this.pending.set(false);
    } catch (err: any) {
      const message = this.friendlyError(err);
      this.confirmError.set(message);
      this.txReceipt.error('Transaction failed', err, message);
      this.pending.set(false);
    }
  }


  private friendlyError(err: any): string {
    const message = String(err?.shortMessage ?? err?.reason ?? err?.message ?? 'Transaction failed');
    const lower = message.toLowerCase();
    if (lower.includes('risk module not set')) {
      return 'LendingContract risk module is not configured. Run the lending risk-module wiring/governance setup so LendingContract.setRiskModule(RiskModule) is executed, then retry the borrow order.';
    }
    if (lower.includes('borrow disallowed')) {
      return 'Borrow disallowed by ValuationModule. Add recognized collateral to the selected lending account or reduce the borrow principal, then review the valuation preview again.';
    }
    return message;
  }

  submitLabel(): string {
    switch (this.data?.intent) {
      case 'cancel': return 'Review Cancel';
      case 'repay': return 'Review Repayment';
      case 'redeem':
      case 'claim': return 'Review Claim';
      case 'rollover': return 'Review Rollover';
      default: return 'Review Order';
    }
  }

  submitDisabled(): boolean {
    switch (this.data?.intent) {
      case 'cancel': return !this.cancelOrderId().trim();
      case 'repay': return !this.repayAmountHuman().trim() || !this.marketKey() || !this.isLendingAccount();
      case 'rollover': return !this.canPlace() || !this.repayMarketKey() || !this.isLendingAccount();
      case 'redeem':
      case 'claim': return !this.bondIndex().trim();
      default: return !this.canPlace();
    }
  }

  accountContextFields(extra: ConfirmationField[] = []): ConfirmationField[] {
    const account = this.selectedAccount();
    return [
      {
        label: 'Selected account',
        value: account ? `${this.accountLabel(account)} (${this.selectedAccountType()})` : 'No account selected',
        tone: account ? 'default' : 'warn',
      },
      ...extra,
    ];
  }

  accountLabel(account: string): string {
    return this.accounts.accountLabel(account);
  }

  formatExpiry(value: bigint | number | null | undefined): string {
    const seconds = Number(value ?? 0);
    if (!seconds) return '—';
    const d = new Date(seconds * 1000);
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')} 12:00 UTC`;
  }

  formatMarketKey(): string {
    const key = this.marketKey();
    if (!key) return '—';
    return `${key.slice(0, 10)}...${key.slice(-8)}`;
  }

  private async preparePlaceOrder(): Promise<void> {
    const marketExpiry = this.marketExpiry();
    const riskLevel = Number(this.riskLevel());
    const orderExpiry = this.resolvedOrderExpiry();
    const side = this.side();
    const principal = this.parseEth(this.principalHuman(), 'Principal');
    const rateBps = this.parseAprBps(this.aprHuman());

    if (marketExpiry <= 0n) throw new Error('Select a lending market first.');
    if (riskLevel <= 0) throw new Error('Risk level is required.');
    if (orderExpiry <= 0n) throw new Error('Order expiry is required.');
    if (orderExpiry > marketExpiry) throw new Error('Order expiry cannot be later than market maturity.');

    const requiresLending = side === 1;
    const accountFields = this.accountContextFields([
      {
        label: 'Borrowing account type',
        value: requiresLending
          ? 'Borrow orders can only be placed from a lending account.'
          : 'Lend orders can be placed from a normal or lending account.',
        tone: !requiresLending || this.isLendingAccount() ? 'default' : 'warn',
      },
      {
        label: 'Principal source',
        value: side === 0
          ? 'Lend principal must already be free ETH in the selected account vault.'
          : 'Borrow principal is received in the lending account vault when matched.',
        tone: 'muted',
      },
    ]);

    let borrowPreview: BorrowValuationPreview | null = null;
    let disabled = requiresLending && !this.isLendingAccount();

    if (side === 1 && this.selectedAccount()) {
      try {
        const preview = await this.valuation.previewBorrowOrder(
          this.selectedAccount(),
          riskLevel,
          principal,
        );
        borrowPreview = preview;
        disabled = disabled || !preview.canBorrow;
        this.confirmError.set(preview.reason);
      } catch (err: any) {
        disabled = true;
        this.confirmError.set(String(err?.shortMessage ?? err?.reason ?? err?.message ?? 'Could not read ValuationModule borrow limits.'));
      }
    } else if (side === 1) {
      disabled = true;
      this.confirmError.set('Borrow disallowed: select a lending account first.');
    }

    this.confirmTitle.set(side === 0 ? 'Place lend offer' : 'Place borrow bid');
    this.confirmLabel.set(side === 0 ? 'Place lend order' : 'Place borrow order');
    this.confirmFields.set([
      { label: 'Action', value: side === 0 ? 'Lend offer' : 'Borrow bid' },
      { label: 'Market', value: this.data.marketLabel ?? this.data.defaultMarketLabel ?? `${this.formatExpiry(marketExpiry)} • R${riskLevel}` },
      { label: 'Market key', value: this.marketKey(), tone: 'muted' },
      { label: 'Borrow asset', value: 'ETH' },
      { label: 'Maturity', value: this.formatExpiry(marketExpiry) },
      { label: 'Risk tier', value: `R${riskLevel}` },
      { label: 'Principal', value: `${this.principalHuman().trim()} ETH` },
      { label: 'APR / rate', value: `${this.aprHuman().trim()}%` },
      { label: 'Order expiry', value: this.formatTimestamp(orderExpiry) },
      { label: 'Market creation', value: 'First valid order lazily creates the market if it does not exist yet.', tone: 'muted' },
      ...accountFields,
      ...this.borrowValuationFields(borrowPreview),
    ]);
    this.confirmRequirements.set(null);
    this.confirmDisabled.set(disabled);
    this.pendingAction = async () => this.writes.placeOrder({
      borrowToken: ETH_BORROW_TOKEN,
      marketExpiry,
      riskLevel,
      side,
      rateBps,
      principal,
      orderExpiry,
    });
  }



  private async prepareRolloverOrder(): Promise<void> {
    const marketExpiry = this.marketExpiry();
    const riskLevel = Number(this.riskLevel());
    const orderExpiry = this.resolvedOrderExpiry();
    const principal = this.parseEth(this.principalHuman(), 'Rollover principal');
    const rateBps = this.parseAprBps(this.aprHuman());
    const repayMarketKey = this.repayMarketKey();

    if (!this.isLendingAccount()) throw new Error('Rollover orders require a lending account.');
    if (!ethers.isHexString(repayMarketKey, 32)) throw new Error('Select an existing debt market to roll over.');
    if (marketExpiry <= 0n) throw new Error('Select the new rollover market first.');
    if (riskLevel <= 0) throw new Error('Risk level is required.');
    if (orderExpiry <= 0n) throw new Error('Order expiry is required.');
    if (orderExpiry > marketExpiry) throw new Error('Order expiry cannot be later than new market maturity.');
    if (this.marketKey().toLowerCase() === repayMarketKey.toLowerCase()) throw new Error('Rollover target must be a different lending market.');

    let borrowPreview: BorrowValuationPreview | null = null;
    let disabled = false;
    try {
      const preview = await this.valuation.previewBorrowOrder(this.selectedAccount(), riskLevel, principal);
      borrowPreview = preview;
      disabled = !preview.canBorrow;
      this.confirmError.set(preview.reason);
    } catch (err: any) {
      disabled = true;
      this.confirmError.set(String(err?.shortMessage ?? err?.reason ?? err?.message ?? 'Could not read rollover valuation preview.'));
    }

    this.confirmTitle.set('Place rollover borrow bid');
    this.confirmLabel.set('Place rollover order');
    this.confirmFields.set([
      { label: 'Action', value: 'Rollover borrow bid' },
      { label: 'Repays debt market', value: this.repayMarketLabel() || repayMarketKey },
      { label: 'Repay market key', value: repayMarketKey, tone: 'muted' },
      { label: 'New market', value: this.data.marketLabel ?? this.data.defaultMarketLabel ?? `${this.formatExpiry(marketExpiry)} • R${riskLevel}` },
      { label: 'New market key', value: this.marketKey(), tone: 'muted' },
      { label: 'Borrow asset', value: 'ETH' },
      { label: 'Risk tier', value: `R${riskLevel}` },
      { label: 'Rollover principal', value: `${this.principalHuman().trim()} ETH` },
      { label: 'APR / rate', value: `${this.aprHuman().trim()}%` },
      { label: 'Order expiry', value: this.formatTimestamp(orderExpiry) },
      { label: 'Rollover rule', value: 'Matched proceeds immediately repay the selected old debt. Amount cannot exceed outstanding old debt.', tone: 'system' },
      ...this.accountContextFields(),
      ...this.borrowValuationFields(borrowPreview),
    ]);
    this.confirmRequirements.set(null);
    this.confirmDisabled.set(disabled);
    this.pendingAction = async () => this.writes.placeRolloverBorrowOrder({
      repayMarketKey,
      borrowToken: ETH_BORROW_TOKEN,
      marketExpiry,
      riskLevel,
      rateBps,
      principal,
      orderExpiry,
    });
  }

  private borrowValuationFields(preview: BorrowValuationPreview | null): ConfirmationField[] {
    if (!preview) return [];

    return [
      {
        label: 'Protocol risk module',
        value: preview.riskModule.configured
          ? `Configured at ${this.shortAddress(preview.riskModule.address)}`
          : 'Not configured on LendingContract',
        tone: preview.riskModule.configured ? 'good' : 'warn',
      },
      {
        label: 'Valuation check',
        value: preview.valuationCanBorrow
          ? 'Borrow allowed by ValuationModule'
          : 'Borrow disallowed by ValuationModule',
        tone: preview.valuationCanBorrow ? 'good' : 'warn',
      },
      {
        label: 'Current recognized collateral',
        value: `${this.formatEth(preview.values.collateralValueEth)} ETH`,
        tone: preview.values.collateralValueEth > 0n ? 'default' : 'warn',
      },
      {
        label: 'Borrow proceeds if matched',
        value: `+${this.formatEth(preview.requestedPrincipalEth)} ETH`,
        tone: 'muted',
      },
      {
        label: 'Projected collateral after borrow',
        value: `${this.formatEth(preview.projectedCollateralAfterBorrowEth)} ETH`,
        tone: preview.canBorrow ? 'default' : 'warn',
      },
      {
        label: 'Minimum current collateral required',
        value: `${this.formatEth(preview.minimumCollateralRequiredEth)} ETH`,
        tone: preview.valuationCanBorrow ? 'default' : 'warn',
      },
      {
        label: 'Minimum starting collateral if borrow counts',
        value: `${this.formatEth(preview.minimumStartingCollateralIfBorrowCountsEth)} ETH`,
        tone: 'muted',
      },
      {
        label: 'Collateral shortfall',
        value: `${this.formatEth(preview.collateralShortfallEth)} ETH`,
        tone: preview.collateralShortfallEth > 0n ? 'warn' : 'good',
      },
      {
        label: 'Current effective debt',
        value: `${this.formatEth(preview.values.effectiveDebtEth)} ETH`,
        tone: 'muted',
      },
      {
        label: 'Projected effective debt',
        value: `${this.formatEth(preview.projectedEffectiveDebtEth)} ETH`,
        tone: preview.canBorrow ? 'default' : 'warn',
      },
      {
        label: 'Borrow capacity remaining',
        value: `${this.formatEth(preview.remainingBorrowCapacityEth)} ETH`,
        tone: preview.remainingBorrowCapacityEth >= preview.requestedPrincipalEth ? 'default' : 'warn',
      },
      {
        label: 'Valuation-module LTV check',
        value: `${this.formatNullableBps(preview.valuationCheckLtvBps)} / max ${this.formatBps(preview.riskTier.maxLtvBps)}`,
        tone: preview.valuationCanBorrow ? 'default' : 'warn',
      },
      {
        label: 'Projected LTV after borrow proceeds',
        value: `${this.formatNullableBps(preview.projectedLtvBps)} / max ${this.formatBps(preview.riskTier.maxLtvBps)}`,
        tone: preview.canBorrow ? 'good' : 'warn',
      },
      {
        label: 'Collateral sources',
        value: this.formatCollateralSources(preview),
        tone: 'muted',
      },
    ];
  }

  private formatCollateralSources(preview: BorrowValuationPreview): string {
    const b = preview.breakdown;
    const parts = [
      ['free ETH', b.freeEth],
      ['ERC20', b.freeErc20Eth],
      ['long options', b.longOptionsEth],
      ['covered shorts', b.shortOptionsEth],
      ['futures', b.futuresEth],
      ['bonds', b.bondClaimsEth],
    ]
      .filter(([, amount]) => (amount as bigint) > 0n)
      .map(([label, amount]) => `${label}: ${this.formatEth(amount as bigint)} ETH`);

    return parts.length ? parts.join(' • ') : 'No recognized collateral sources';
  }


  private shortAddress(address: string | null): string {
    if (!address) return '—';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  private formatEth(raw: bigint): string {
    const value = Number(ethers.formatEther(raw));
    if (!Number.isFinite(value)) return ethers.formatEther(raw);
    if (value === 0) return '0';
    if (value < 0.000001) return ethers.formatEther(raw);
    return value.toLocaleString(undefined, { maximumFractionDigits: 6 });
  }

  private formatBps(bps: bigint | number): string {
    return `${(Number(bps) / 100).toFixed(2)}%`;
  }

  private formatNullableBps(bps: bigint | null): string {
    return bps === null ? '∞' : this.formatBps(bps);
  }

  private prepareCancel(): void {
    const orderId = this.parseWhole(this.cancelOrderId(), 'Order ID');
    this.confirmTitle.set('Cancel lending order');
    this.confirmLabel.set('Cancel order');
    this.confirmFields.set([
      { label: 'Action', value: 'Cancel open lending order' },
      { label: 'Order ID', value: orderId.toString() },
      { label: 'Route', value: 'Via selected account contract', tone: 'muted' },
      ...this.accountContextFields(),
    ]);
    this.confirmRequirements.set(null);
    this.confirmDisabled.set(false);
    this.pendingAction = async () => this.writes.cancelOrder(orderId);
  }

  private prepareRepay(): void {
    const marketKey = this.marketKey();
    if (!ethers.isHexString(marketKey, 32)) throw new Error('Select a lending market first.');
    const amount = this.parseEth(this.repayAmountHuman(), 'Repayment amount');

    this.confirmTitle.set('Repay lending debt');
    this.confirmLabel.set('Repay debt');
    this.confirmFields.set([
      { label: 'Action', value: 'Repay borrower debt' },
      { label: 'Market', value: this.data.marketLabel ?? this.data.defaultMarketLabel ?? this.formatMarketKey() },
      { label: 'Market key', value: marketKey, tone: 'muted' },
      { label: 'Amount', value: `${this.repayAmountHuman().trim()} ETH` },
      { label: 'Source', value: 'Selected lending account vault free ETH', tone: 'muted' },
      ...this.accountContextFields([
        {
          label: 'Lending account required',
          value: 'Only lending accounts can carry and repay lending debt.',
          tone: this.isLendingAccount() ? 'default' : 'warn',
        },
      ]),
    ]);
    this.confirmRequirements.set(null);
    this.confirmDisabled.set(!this.isLendingAccount());
    this.pendingAction = async () => this.writes.repayDebt({ marketKey, amount });
  }

  private prepareBondClaim(): void {
    const bondIndex = this.parseWhole(this.bondIndex(), 'Bond index');
    const action = this.bondAction();

    this.confirmTitle.set(action === 'initial' ? 'Redeem initial bond claim' : 'Claim supplemental recovery');
    this.confirmLabel.set(action === 'initial' ? 'Redeem initial' : 'Claim supplemental');
    this.confirmFields.set([
      { label: 'Action', value: action === 'initial' ? 'Redeem initial bond proceeds' : 'Claim supplemental recovery' },
      { label: 'Bond index', value: bondIndex.toString() },
      { label: 'Route', value: 'Via selected account contract', tone: 'muted' },
      ...this.accountContextFields(),
    ]);
    this.confirmRequirements.set(null);
    this.confirmDisabled.set(false);
    this.pendingAction = async () => this.writes.claimBond({ action, bondIndex });
  }

  private resolvedOrderExpiry(): bigint {
    return resolveExpiryForContract(this.orderExpiry(), null);
  }

  private defaultOrderExpiry(): bigint {
    const marketExpiry = BigInt(this.data?.marketExpiry ?? this.data?.defaultMarketExpiry ?? 0);
    const now = BigInt(Math.floor(Date.now() / 1000));
    if (marketExpiry > now + 86400n) return marketExpiry - 3600n;
    return now + 86400n;
  }

  private parseEth(value: string, label: string): bigint {
    const v = String(value ?? '').trim().replace(',', '.');
    if (!v || !/^\d+(\.\d+)?$/.test(v)) throw new Error(`${label} must be a positive ETH amount.`);
    const parsed = ethers.parseEther(v);
    if (parsed <= 0n) throw new Error(`${label} must be greater than zero.`);
    return parsed;
  }

  private parseAprBps(value: string): bigint {
    const v = String(value ?? '').trim().replace(',', '.');
    if (!v || !/^\d+(\.\d+)?$/.test(v)) throw new Error('APR must be a positive percentage.');
    const parts = v.split('.');
    const whole = BigInt(parts[0] || '0') * 100n;
    const fraction = BigInt((parts[1] ?? '').padEnd(2, '0').slice(0, 2) || '0');
    const bps = whole + fraction;
    if (bps <= 0n) throw new Error('APR must be greater than zero.');
    return bps;
  }

  private parseWhole(value: string, label: string): bigint {
    const v = String(value ?? '').trim();
    if (!/^\d+$/.test(v)) throw new Error(`${label} must be a whole number.`);
    const parsed = BigInt(v);
    if (parsed <= 0n) throw new Error(`${label} must be greater than zero.`);
    return parsed;
  }

  private formatTimestamp(seconds: bigint): string {
    if (!seconds) return '—';
    const d = new Date(Number(seconds) * 1000);
    return `${d.toISOString().replace('T', ' ').slice(0, 16)} UTC`;
  }
}
