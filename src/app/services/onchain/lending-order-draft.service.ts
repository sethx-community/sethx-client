import { Injectable, computed, inject, signal } from '@angular/core';
import { ethers, JsonRpcProvider } from 'ethers';

import type {
  ConfirmationField,
  RequirementRow,
} from '../../core/modals/confirmation/confirmation-modal.component';
import { ETH_ADDRESS } from '../shared/main.tokens';
import { TriggerService } from '../shared/trigger.service';
import { WalletConnectService } from '../../wallet/wallet-connect.service';
import { CURRENT_NETWORK } from '../../constants/network.config';
import { NETWORKS } from '../../constants/networks';
import { parseExpirySelection, resolveExpiryForContract } from '../../shared/expiry/expiry-settings';
import { TradeSettingsService } from '../shared/trade-settings.service';
import { TransactionReceiptService } from '../../shared/transaction-receipt';
import { AccountsChainService } from './accounts.service';
import { PortfolioService } from './portfolio.service';
import {
  LendingBondClaimAction,
  LendingMarketWriteService,
  LendingOrderSide,
} from './contracts/lending-market-write.service';
import {
  BorrowValuationPreview,
  ValuationModuleReadService,
} from './contracts/valuation-module-read.service';
import { LendingOrderModalData } from '../../../types/order_flow/order-flow.types';
import { formatTokenAmount, formatUnitsHuman } from '../../core/format/number-format';

export type LendingDraftMode = 'place' | 'cancel' | 'repay' | 'claim';

const ETH_BORROW_TOKEN = ethers.ZeroAddress;

function n(v: unknown): string {
  return String(v ?? '').trim().toLowerCase();
}

function shortAddr(a: string): string {
  const s = String(a ?? '');
  return s.length > 10 ? `${s.slice(0, 6)}...${s.slice(-4)}` : s;
}

function parsePositiveInteger(value: string, label: string): bigint {
  const v = String(value ?? '').trim();
  if (!/^\d+$/.test(v)) throw new Error(`${label} must be a positive whole number.`);
  const out = BigInt(v);
  if (out <= 0n) throw new Error(`${label} must be greater than zero.`);
  return out;
}

function parsePositiveEth(value: string, label: string): bigint {
  const v = String(value ?? '').trim().replace(',', '.');
  if (!/^\d+(\.\d{0,18})?$/.test(v)) throw new Error(`${label} must be a valid ETH amount.`);
  const out = ethers.parseEther(v);
  if (out <= 0n) throw new Error(`${label} must be greater than zero.`);
  return out;
}

function parseAprBps(value: string): bigint {
  const v = String(value ?? '').trim().replace(',', '.');
  if (!/^\d+(\.\d{0,2})?$/.test(v)) {
    throw new Error('APR must be a percent value with at most two decimals, for example 7.25.');
  }

  const [whole, fraction = ''] = v.split('.');
  const bps = BigInt(whole) * 100n + BigInt((fraction + '00').slice(0, 2));
  if (bps <= 0n) throw new Error('APR must be greater than zero.');
  return bps;
}

function formatAprFromBps(bps: bigint): string {
  const whole = bps / 100n;
  const fraction = (bps % 100n).toString().padStart(2, '0');
  return `${whole}.${fraction}%`;
}

function unixToUtcDate(seconds: bigint | number): string {
  const s = Number(seconds ?? 0);
  if (!s) return '-';
  const d = new Date(s * 1000);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')} ${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')} UTC`;
}

@Injectable({ providedIn: 'root' })
export class LendingOrderDraftService {
  private readonly writer = inject(LendingMarketWriteService);
  private readonly settings = inject(TradeSettingsService);
  private readonly accounts = inject(AccountsChainService);
  private readonly portfolio = inject(PortfolioService);
  private readonly valuation = inject(ValuationModuleReadService);
  private readonly trigger = inject(TriggerService);
  private readonly wallet = inject(WalletConnectService);
  readonly txReceipt = inject(TransactionReceiptService);

  readonly mode = signal<LendingDraftMode>('place');
  readonly side = signal<LendingOrderSide>(0);

  readonly marketKey = signal('');
  readonly marketLabel = signal('');
  readonly borrowToken = signal(ETH_BORROW_TOKEN);
  readonly marketExpirySec = signal('');
  readonly riskLevel = signal('1');
  readonly principalHuman = signal('');
  readonly aprPercent = signal('');
  readonly orderExpirySec = signal('');
  readonly orderId = signal('');
  readonly repayAmountHuman = signal('');
  readonly bondIndex = signal('');
  readonly claimAction = signal<LendingBondClaimAction>('initial');

  readonly confirmOpen = signal(false);
  readonly confirmTitle = signal('Confirm lending action');
  readonly confirmLabel = signal('Confirm & Sign');
  readonly confirmFields = signal<ConfirmationField[]>([]);
  readonly confirmRequirements = signal<RequirementRow[]>([]);
  readonly confirmDisabled = signal(false);
  readonly confirmError = signal<string | null>(null);
  readonly pending = signal(false);

  private pendingConfirmAction: null | (() => Promise<string | null | void>) = null;

  readonly selectedAccount = this.settings.selectedAccountId;
  readonly selectedAccountType = computed(() => {
    const account = n(this.selectedAccount());
    return account ? this.accounts.accountType(account) : null;
  });
  readonly selectedAccountLabel = computed(() => {
    const account = n(this.selectedAccount());
    return account ? this.accounts.accountLabel(account) : 'No account selected';
  });
  readonly isLendingAccount = computed(() => this.selectedAccountType() === 'lending');

  prefill(data: LendingOrderModalData): void {
    const intent = data.intent;
    this.mode.set(intent === 'cancel' ? 'cancel' : intent === 'repay' ? 'repay' : (intent === 'claim' || intent === 'redeem') ? 'claim' : 'place');
    this.side.set(intent === 'borrow' ? 1 : data.defaultSide ?? 0);

    this.marketKey.set(data.defaultMarketKey ?? data.marketKey ?? '');
    this.marketLabel.set(data.defaultMarketLabel ?? data.marketLabel ?? '');
    this.borrowToken.set(data.defaultBorrowToken ?? ETH_BORROW_TOKEN);
    this.marketExpirySec.set(data.defaultMarketExpiry ? String(data.defaultMarketExpiry) : data.marketExpiry ? String(data.marketExpiry) : '');
    this.riskLevel.set(data.defaultRiskLevel ? String(data.defaultRiskLevel) : data.riskLevel ? String(data.riskLevel) : '1');
    this.orderId.set(data.defaultOrderId ?? '');
    this.bondIndex.set(data.defaultBondIndex ?? '');
    this.principalHuman.set(data.defaultAmountHuman ?? data.defaultPrincipalHuman ?? '');
    this.repayAmountHuman.set(data.defaultAmountHuman ?? '');
    this.aprPercent.set(data.defaultRatePercent ?? data.defaultAprHuman ?? '');
    this.claimAction.set(data.defaultClaimAction ?? 'initial');

    if (data.defaultOrderExpiry) {
      this.orderExpirySec.set(String(data.defaultOrderExpiry));
    } else {
      this.orderExpirySec.set('rel:604800');
    }

    this.txReceipt.clear();
    this.confirmError.set(null);
    this.confirmDisabled.set(false);
    this.pendingConfirmAction = null;
  }

  closeConfirm(): void {
    this.confirmOpen.set(false);
    this.pending.set(false);
    this.confirmError.set(null);
    this.confirmDisabled.set(false);
    this.pendingConfirmAction = null;
  }

  setSide(side: LendingOrderSide): void {
    this.side.set(side);
  }

  setClaimAction(action: LendingBondClaimAction): void {
    this.claimAction.set(action);
  }

  async openConfirmation(): Promise<void> {
    try {
      this.txReceipt.clear();
      this.confirmError.set(null);
      this.confirmDisabled.set(false);

      const mode = this.mode();
      if (mode === 'place') await this.preparePlaceConfirmation();
      else if (mode === 'cancel') this.prepareCancelConfirmation();
      else if (mode === 'repay') this.prepareRepayConfirmation();
      else this.prepareClaimConfirmation();

      this.confirmOpen.set(true);
    } catch (err: any) {
      this.confirmError.set(err?.message ?? 'Could not build lending preview.');
    }
  }

  async submit(): Promise<void> {
    if (!this.pendingConfirmAction || this.pending()) return;

    this.pending.set(true);
    this.confirmError.set(null);
    this.txReceipt.pending('Lending transaction pending');

    try {
      const txHash = await this.pendingConfirmAction();
      this.txReceipt.success('Lending transaction confirmed', txHash ?? null);
      this.trigger.emitDomainEvent({ type: 'lendingOrderbookChanged' });
    } catch (err: any) {
      const message = this.friendlyError(err);
      this.confirmError.set(message);
      this.txReceipt.error('Lending transaction failed', err, message);
    } finally {
      this.pending.set(false);
    }
  }


  private friendlyError(err: any): string {
    const message = String(err?.reason ?? err?.shortMessage ?? err?.message ?? 'Lending transaction failed.');
    if (message.toLowerCase().includes('borrow disallowed')) {
      return 'Borrow disallowed by ValuationModule. Add recognized collateral to the selected lending account or reduce the borrow principal, then review the valuation preview again.';
    }
    return message;
  }

  private async preparePlaceConfirmation(): Promise<void> {
    const principal = parsePositiveEth(this.principalHuman(), 'Principal');
    const rateBps = parseAprBps(this.aprPercent());
    const marketExpiry = parsePositiveInteger(this.marketExpirySec(), 'Market maturity');
    const riskLevel = Number(parsePositiveInteger(this.riskLevel(), 'Risk level'));
    const side = this.side();
    const chainNow = await this.latestChainTimestamp();
    const orderExpiry = this.resolveOrderExpiry(chainNow);

    if (chainNow === null) throw new Error('Could not read connected chain time. Try refreshing and reconnecting your wallet.');
    if (marketExpiry <= chainNow) throw new Error('Market maturity must be in the future for the connected chain.');
    if (orderExpiry <= 0n) throw new Error('Order expiry is required.');
    if (orderExpiry <= chainNow) throw new Error(`Order expiry must be in the future for the connected chain. Chain time: ${unixToUtcDate(chainNow)}.`);
    if (orderExpiry > marketExpiry) throw new Error('Order expiry cannot be later than market maturity.');
    if (side === 1 && !this.isLendingAccount()) {
      throw new Error('Borrow orders require a lending account. Select a lending account before borrowing.');
    }

    let borrowPreview: BorrowValuationPreview | null = null;
    let borrowDisabled = false;
    if (side === 1) {
      const account = n(this.selectedAccount());
      if (!account) {
        borrowDisabled = true;
        this.confirmError.set('Borrow disallowed: select a lending account first.');
      } else {
        try {
          borrowPreview = await this.valuation.previewBorrowOrder(account, riskLevel, principal);
          borrowDisabled = !borrowPreview.canBorrow;
          this.confirmError.set(borrowPreview.reason);
        } catch (err: any) {
          borrowDisabled = true;
          this.confirmError.set(String(err?.shortMessage ?? err?.reason ?? err?.message ?? 'Could not read ValuationModule borrow limits.'));
        }
      }
    }

    this.confirmTitle.set(side === 0 ? 'Confirm lend offer' : 'Confirm borrow bid');
    this.confirmLabel.set(side === 0 ? 'Place Lend Offer' : 'Place Borrow Bid');
    this.confirmFields.set([
      { label: 'Action', value: side === 0 ? 'Place lend offer' : 'Place borrow bid' },
      { label: 'Account', value: `${this.selectedAccountLabel()} (${this.selectedAccountType() ?? 'none'})` },
      { label: 'Borrow asset', value: 'ETH' },
      { label: 'Maturity', value: unixToUtcDate(marketExpiry) },
      { label: 'Risk tier', value: `R${riskLevel}` },
      ...this.riskTierFields(borrowPreview),
      { label: 'Principal', value: `${this.principalHuman()} ETH` },
      { label: 'APR', value: formatAprFromBps(rateBps) },
      { label: 'Order expiry', value: unixToUtcDate(orderExpiry) },
      {
        label: 'Market open rule',
        value: 'If this market does not exist yet, the orderbook opens it when this order is placed.',
        tone: 'muted',
      },
      ...this.borrowValuationFields(borrowPreview),
    ]);

    const requirements = side === 0
      ? [this.ethRequirement('Principal locked by lend order', principal)]
      : [];
    this.confirmRequirements.set(requirements);
    this.confirmDisabled.set(borrowDisabled || requirements.some((row) => !row.ok));
    this.pendingConfirmAction = () => this.writer.placeOrder({
      borrowToken: ETH_BORROW_TOKEN,
      marketExpiry,
      riskLevel,
      side,
      rateBps,
      principal,
      orderExpiry,
    });
  }



  private resolveOrderExpiry(chainNow: bigint | null): bigint {
    return resolveExpiryForContract(this.orderExpirySec(), chainNow);
  }

  private async latestChainTimestamp(): Promise<bigint | null> {
    try {
      let provider: any = this.wallet.provider?.() ?? null;
      if (!provider) {
        const rpcUrl = NETWORKS[CURRENT_NETWORK].rpcUrls.default.http[0];
        provider = new JsonRpcProvider(rpcUrl);
      }
      const block = await provider.getBlock('latest');
      const ts = block?.timestamp;
      return typeof ts === 'number' && Number.isFinite(ts) && ts > 0 ? BigInt(ts) : null;
    } catch {
      return null;
    }
  }

  private riskTierFields(preview: BorrowValuationPreview | null): ConfirmationField[] {
    const tier = preview?.riskTier ?? null;
    if (!tier) return [];
    return [
      { label: 'Max LTV', value: this.formatBps(tier.maxLtvBps), tone: 'muted' },
      { label: 'Liquidation LTV', value: this.formatBps(tier.liquidationLtvBps), tone: 'muted' },
    ];
  }

  private borrowValuationFields(preview: BorrowValuationPreview | null): ConfirmationField[] {
    if (!preview) return [];
    return [
      {
        label: 'Valuation check',
        value: preview.canBorrow ? 'Borrow allowed by ValuationModule' : 'Borrow disallowed by ValuationModule',
        tone: preview.canBorrow ? 'good' : 'warn',
      },
      {
        label: 'Current recognized collateral',
        value: `${this.formatEth(preview.values.collateralValueEth)} ETH`,
        tone: preview.values.collateralValueEth > 0n ? 'default' : 'warn',
      },
      {
        label: 'Minimum collateral required',
        value: `${this.formatEth(preview.minimumCollateralRequiredEth)} ETH`,
        tone: preview.canBorrow ? 'default' : 'warn',
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
        label: 'Projected LTV',
        value: `${this.formatNullableBps(preview.projectedLtvBps)} / max ${this.formatBps(preview.riskTier.maxLtvBps)}`,
        tone: preview.canBorrow ? 'default' : 'warn',
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

  private formatEth(raw: bigint): string {
    const value = Number(ethers.formatEther(raw));
    if (!Number.isFinite(value)) return formatUnitsHuman(raw, 18, { maxDecimals: 6, compactFrom: 1_000_000 });
    if (value === 0) return '0';
    if (value < 0.000001) return formatUnitsHuman(raw, 18, { maxDecimals: 6, compactFrom: 1_000_000 });
    return formatUnitsHuman(raw, 18, { maxDecimals: 6, compactFrom: 1_000_000 });
  }

  private formatBps(bps: bigint | number): string {
    return `${(Number(bps) / 100).toFixed(2)}%`;
  }

  private formatNullableBps(bps: bigint | null): string {
    return bps === null ? '∞' : this.formatBps(bps);
  }

  private prepareCancelConfirmation(): void {
    const orderId = parsePositiveInteger(this.orderId(), 'Order ID');
    this.confirmTitle.set('Confirm lending order cancellation');
    this.confirmLabel.set('Cancel Order');
    this.confirmFields.set([
      { label: 'Action', value: 'Cancel lending order' },
      { label: 'Account', value: `${this.selectedAccountLabel()} (${this.selectedAccountType() ?? 'none'})` },
      { label: 'Order ID', value: `#${orderId}` },
      { label: 'Effect', value: 'Lend orders unlock remaining principal. Borrow orders release pending borrow principal.', tone: 'muted' },
    ]);
    this.confirmRequirements.set([]);
    this.confirmDisabled.set(false);
    this.pendingConfirmAction = () => this.writer.cancelOrder(orderId);
  }

  private prepareRepayConfirmation(): void {
    const marketKey = this.marketKey().trim().toLowerCase();
    if (!ethers.isHexString(marketKey, 32)) throw new Error('Select a valid lending market first.');
    if (!this.isLendingAccount()) throw new Error('Debt repayment requires a lending account.');

    const amount = parsePositiveEth(this.repayAmountHuman(), 'Repayment amount');
    const req = this.ethRequirement('Debt repayment from vault', amount);

    this.confirmTitle.set('Confirm lending debt repayment');
    this.confirmLabel.set('Repay Debt');
    this.confirmFields.set([
      { label: 'Action', value: 'Repay lending debt' },
      { label: 'Account', value: `${this.selectedAccountLabel()} (lending)` },
      { label: 'Market', value: this.marketLabel() || shortAddr(marketKey) },
      { label: 'Market key', value: marketKey, tone: 'muted' },
      { label: 'Amount', value: `${this.repayAmountHuman()} ETH` },
      { label: 'Effect', value: 'Repayment reduces borrower face value and funds market settlement liquidity.', tone: 'muted' },
    ]);
    this.confirmRequirements.set([req]);
    this.confirmDisabled.set(!req.ok);
    this.pendingConfirmAction = () => this.writer.repayDebt({ marketKey, amount });
  }

  private prepareClaimConfirmation(): void {
    const bondIndex = parsePositiveInteger(this.bondIndex(), 'Bond index');
    const action = this.claimAction();
    this.confirmTitle.set(action === 'initial' ? 'Confirm initial bond redemption' : 'Confirm supplemental bond claim');
    this.confirmLabel.set(action === 'initial' ? 'Redeem Initial' : 'Claim Supplemental');
    this.confirmFields.set([
      { label: 'Action', value: action === 'initial' ? 'Redeem initial bond proceeds' : 'Claim supplemental bond proceeds' },
      { label: 'Account', value: `${this.selectedAccountLabel()} (${this.selectedAccountType() ?? 'none'})` },
      { label: 'Bond index', value: `#${bondIndex}` },
      { label: 'Settlement rule', value: 'Bond proceeds are claimable only after market settlement and available recovery liquidity.', tone: 'muted' },
    ]);
    this.confirmRequirements.set([]);
    this.confirmDisabled.set(false);
    this.pendingConfirmAction = () => this.writer.claimBond({ action, bondIndex });
  }

  private defaultOrderExpiry(marketExpiry: number): number {
    const now = Math.floor(Date.now() / 1000);
    const oneDay = 24 * 60 * 60;
    const oneHour = 60 * 60;
    const desired = now + 7 * oneDay;
    const latest = marketExpiry - oneHour;
    return Math.max(now + oneHour, Math.min(desired, latest));
  }

  private ethRequirement(label: string, raw: bigint): RequirementRow {
    const availableRaw = this.availableEthRaw();
    return {
      tokenSymbol: 'ETH',
      tokenAddress: 'address(0)',
      available: formatTokenAmount(availableRaw, 18, 'ETH', { maxDecimals: 6, compactFrom: 1_000_000 }),
      ok: availableRaw >= raw,
      totalRequired: formatTokenAmount(raw, 18, 'ETH', { maxDecimals: 6, compactFrom: 1_000_000 }),
      components: [{ label, amount: formatTokenAmount(raw, 18, 'ETH', { maxDecimals: 6, compactFrom: 1_000_000 }), raw: raw.toString() }],
      requiredRaw: raw.toString(),
      availableRaw: availableRaw.toString(),
      decimals: 18,
    };
  }

  private availableEthRaw(): bigint {
    const balances = this.portfolio.accountBalances?.() ?? {};
    const eth =
      balances[n(ETH_ADDRESS)] ??
      balances[n(ETH_BORROW_TOKEN)] ??
      balances['eth'] ??
      balances['native'];
    if (!eth) return 0n;
    const balance = BigInt(eth.balance ?? 0n);
    const locked = BigInt(eth.locked ?? 0n);
    return balance > locked ? balance - locked : 0n;
  }
}
