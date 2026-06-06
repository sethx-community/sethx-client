import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { ethers, isAddress } from 'ethers';

import { ETH_ADDRESS } from '../shared/main.tokens';
import { TradeSettingsService } from '../shared/trade-settings.service';
import { TokenService, TokenInfo } from '../shared/token.service';
import { PortfolioService } from './portfolio.service';
import { FeeService } from '../shared/fee.service';
import {
  FeeManagerContractService,
  FeeOutput,
} from './contracts/fee-manager-contract.service';
import { TriggerService } from '../shared/trigger.service';
import { OptionsOrderBookActionsService } from '../shared/options-orderbook/options-orderbook-actions.service';
import { OptionContractReadService } from './contracts/option-contract-read.service';
import { OptionsOrderBookReadService } from './contracts/options-orderbook-read.service';
import { WalletConnectService } from '../../wallet/wallet-connect.service';
import {
  displayUnixForExpiry,
  expiryPreviewLabel as sharedExpiryPreviewLabel,
  parseExpirySelection,
  resolveExpiryForContract,
  validateResolvedExpiry,
} from '../../shared/expiry/expiry-settings';

import { TransactionReceiptService } from '../../shared/transaction-receipt';
import type {
  ConfirmationField,
  RequirementRow,
} from '../../core/modals/confirmation/confirmation-modal.component';
import { formatTokenAmount, formatUnitsHuman } from '../../core/format/number-format';

type DraftMode = 'place' | 'accept' | 'cancel' | 'exercise' | 'reclaim';
type OptionExpirySelectionMode = 'quick' | 'custom';

const ZERO = ethers.ZeroAddress;
const ONE_E18 = 10n ** 18n;
const FEE_CONTEXT = 'Options Trade';

function n(v: unknown): string {
  return String(v ?? '')
    .trim()
    .toLowerCase();
}

function isNativeLike(input: unknown): boolean {
  const k = n(input);
  return k === 'eth' || k === 'native' || k === 'ether' || k === n(ETH_ADDRESS);
}

function normalizeKey(input: unknown): string {
  const k = n(input);
  if (!k) return '';
  return isNativeLike(k) ? n(ETH_ADDRESS) : k;
}

// UI key -> contract address (ETH_ADDRESS => 0x0)
function keyToContractAddress(key: string): string {
  return normalizeKey(key) === n(ETH_ADDRESS) ? ZERO : normalizeKey(key);
}

function shortAddr(a: string): string {
  const s = a ?? '';
  return s.length > 10 ? `${s.slice(0, 6)}…${s.slice(-4)}` : s;
}

function nowSec(): bigint {
  return BigInt(Math.floor(Date.now() / 1000));
}

function formatUtcDateLabel(unixSec: bigint): string {
  const ms = Number(unixSec) * 1000;
  const d = new Date(ms);
  // Always show UTC to match contract rule.
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} 12:00 UTC`;
}

function formatUtcDateTime(unixSec: bigint): string {
  if (unixSec === 0n) return 'Contract default';
  const ms = Number(unixSec) * 1000;
  const d = new Date(ms);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const mi = String(d.getUTCMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${mi} UTC`;
}


function monthNameUtc(monthOneBased: number): string {
  return new Date(Date.UTC(2026, monthOneBased - 1, 1, 12, 0, 0, 0)).toLocaleString(
    'en-US',
    { month: 'long', timeZone: 'UTC' },
  );
}

function fridayNoonUtcInMonth(year: number, monthOneBased: number): bigint[] {
  const out: bigint[] = [];
  const d = new Date(Date.UTC(year, monthOneBased - 1, 1, 12, 0, 0, 0));
  const firstDay = d.getUTCDay();
  const daysUntilFriday = (5 - firstDay + 7) % 7;
  d.setUTCDate(1 + daysUntilFriday);

  while (d.getUTCFullYear() === year && d.getUTCMonth() === monthOneBased - 1) {
    out.push(BigInt(Math.floor(d.getTime() / 1000)));
    d.setUTCDate(d.getUTCDate() + 7);
  }

  return out;
}

function lastFridayNoonUtc(year: number, monthOneBased: number): bigint {
  const expiries = fridayNoonUtcInMonth(year, monthOneBased);
  return expiries[expiries.length - 1] ?? 0n;
}

function selectedExpiryDateParts(unixInput: string): { year: string; month: string; unix: string } | null {
  const s = String(unixInput ?? '').trim();
  if (!/^\d+$/.test(s)) return null;
  try {
    const d = new Date(Number(BigInt(s)) * 1000);
    return {
      year: String(d.getUTCFullYear()),
      month: String(d.getUTCMonth() + 1),
      unix: s,
    };
  } catch {
    return null;
  }
}

function fixedPriceToHuman(
  priceFixed: bigint,
  assetDecimals: number,
  quoteDecimals: number,
): string {
  // Inverse of priceHumanToFixed
  try {
    const diff = quoteDecimals - assetDecimals;
    let p18 = priceFixed;
    if (diff > 0) p18 = priceFixed / 10n ** BigInt(diff);
    else if (diff < 0) p18 = priceFixed * 10n ** BigInt(-diff);
    return formatUnitsHuman(p18, 18, { maxDecimals: 8, mode: 'scaled-small', compactFrom: 1_000_000 });
  } catch {
    return '';
  }
}

/**
 * Convert a human price (quote per 1 asset) into the fixed 1e18-style price the
 * contracts expect, using the same convention as ERC20 spot:
 *   quoteRaw = (assetRaw * priceFixed) / 1e18
 */
function priceHumanToFixed(
  priceHuman: string,
  assetDecimals: number,
  quoteDecimals: number,
): bigint | null {
  const s = String(priceHuman ?? '').trim();
  if (!s) return null;
  try {
    const p18 = ethers.parseUnits(s.replace(',', '.'), 18);
    const diff = quoteDecimals - assetDecimals;
    if (diff === 0) return p18;
    if (diff > 0) return p18 * 10n ** BigInt(diff);
    return p18 / 10n ** BigInt(-diff);
  } catch {
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class OptionsOrderDraftService {
  private readonly settings = inject(TradeSettingsService);
  readonly txReceipt = inject(TransactionReceiptService);
  private readonly tokens = inject(TokenService);
  private readonly portfolio = inject(PortfolioService);
  private readonly feeSvc = inject(FeeService);
  private readonly feeManager = inject(FeeManagerContractService);
  private readonly trigger = inject(TriggerService);
  private readonly actions = inject(OptionsOrderBookActionsService);
  private readonly optionRead = inject(OptionContractReadService);
  private readonly orderbookRead = inject(OptionsOrderBookReadService);
  private readonly wallet = inject(WalletConnectService);

  // ---------------- form state ----------------
  readonly mode = signal<DraftMode>('place');
  readonly quoteOnly = signal(false);

  // accept/cancel
  readonly makerOrderIdHuman = signal<string>('');
  readonly acceptSizeHuman = signal<string>('');

  // exercise/reclaim
  readonly actionMarketKeyHuman = signal<string>('');
  readonly exerciseSizeHuman = signal<string>('');
  private readonly pendingAccept = signal<{
    makerOrderId: bigint;
    amount: bigint;
    feeToken: string;
  } | null>(null);
  private readonly pendingCancel = signal<bigint | null>(null);
  private readonly pendingExercise = signal<{
    marketKey: string;
    size: bigint;
  } | null>(null);
  private readonly pendingReclaim = signal<string | null>(null);

  // place
  // optionType: 0 = Call, 1 = Put (matches OptionContract.OptionType)
  readonly optionType = signal<0 | 1>(0);
  // intent: 0=BuyOption, 1=SellOption, 2=WriteOption, 3=SellWriter (matches OptionsOrderBook.OrderIntent)
  readonly intent = signal<0 | 1 | 2 | 3>(0);

  readonly assetSelected = signal<string>('');
  readonly assetInput = signal<string>('');
  readonly quoteSelected = signal<string>('');
  readonly quoteInput = signal<string>('');

  readonly strikeHuman = signal<string>('');
  readonly optionExpiryUnix = signal<string>('');
  // Order expiry is an absolute Unix timestamp. 0 lets the contract apply its default.
  readonly orderExpiryUnix = signal<string>('0');

  readonly sizeHuman = signal<string>('');
  readonly askHuman = signal<string>('');

  // ---------------- data sources ----------------
  readonly balances = this.portfolio.accountBalances;
  readonly tokenList = computed<TokenInfo[]>(() => this.tokens.list() ?? []);

  // ---------------- token keys ----------------
  readonly assetKey = computed(() =>
    normalizeKey(this.assetSelected() || this.assetInput()),
  );
  readonly quoteKey = computed(() =>
    normalizeKey(this.quoteSelected() || this.quoteInput()),
  );

  readonly assetInfo = computed(() =>
    this.assetKey() ? this.tokens.getToken(this.assetKey())() : undefined,
  );
  readonly quoteInfo = computed(() =>
    this.quoteKey() ? this.tokens.getToken(this.quoteKey())() : undefined,
  );

  readonly assetSymbol = computed(() =>
    this.assetKey() === n(ETH_ADDRESS)
      ? 'ETH'
      : (this.assetInfo()?.symbol ?? 'ASSET'),
  );
  readonly quoteSymbol = computed(() =>
    this.quoteKey() === n(ETH_ADDRESS)
      ? 'ETH'
      : (this.quoteInfo()?.symbol ?? 'QUOTE'),
  );

  readonly assetDecimals = computed(() => this.assetInfo()?.decimals ?? 18);
  readonly quoteDecimals = computed(() => this.quoteInfo()?.decimals ?? 18);

  readonly pairValid = computed(() => {
    const a = this.assetKey();
    const q = this.quoteKey();
    if (!a || !q) return false;
    if (a === q) return false;
    const assetOk = a === n(ETH_ADDRESS) || isAddress(a);
    const quoteOk = q === n(ETH_ADDRESS) || isAddress(q);
    return assetOk && quoteOk;
  });

  // ---------------- fee token (preferred) ----------------
  readonly preferredFeeTokenKey = computed(() =>
    normalizeKey(this.settings.preferredFeeToken?.() ?? ''),
  );

  readonly feeTokenAddress = computed(() => {
    const k = this.preferredFeeTokenKey();
    return k ? keyToContractAddress(k).toLowerCase() : ZERO.toLowerCase();
  });

  readonly feeTokenLabel = computed(() => {
    const k = this.preferredFeeTokenKey();
    if (!k || k === n(ETH_ADDRESS)) return 'ETH';
    const info = this.tokens.getToken(k)();
    return info?.symbol ?? shortAddr(k);
  });

  readonly feeTokenIsValid = computed(() => {
    const k = this.preferredFeeTokenKey();
    return !!k; // allow ETH_ADDRESS and any ERC20
  });

  // only premium payer pays fees: BuyOption (0) and SellWriter (3)
  readonly isPremiumPayer = computed(
    () => this.intent() === 0 || this.intent() === 3,
  );

  // ---------------- parsed values ----------------
  readonly sizeRaw = computed<bigint | null>(() => {
    const s = String(this.sizeHuman() ?? '').trim();
    if (!s) return null;
    try {
      const v = ethers.parseUnits(s.replace(',', '.'), this.assetDecimals());
      return v > 0n ? v : null;
    } catch {
      return null;
    }
  });

  readonly askFixed = computed<bigint | null>(() =>
    priceHumanToFixed(
      this.askHuman(),
      this.assetDecimals(),
      this.quoteDecimals(),
    ),
  );

  readonly strikeFixed = computed<bigint | null>(() =>
    priceHumanToFixed(
      this.strikeHuman(),
      this.assetDecimals(),
      this.quoteDecimals(),
    ),
  );

  readonly optionExpiry = computed<bigint | null>(() => {
    const s = String(this.optionExpiryUnix() ?? '').trim();
    if (!s) return null;
    try {
      const v = BigInt(s);
      return v > 0n ? v : null;
    } catch {
      return null;
    }
  });

  private readonly estSecondsPerBlock = computed<bigint>(() => {
    // Conservative defaults. You can tune per network if desired.
    // Hardhat/localhost: 2s, Mainnet: 12s, Arbitrum: 1s.
    // (Only used for UX; contract still stores unix seconds.)
    const chainId = this.walletChainId() ?? 0;
    if (chainId === 1) return 12n;
    if (chainId === 42161) return 1n;
    return 2n;
  });

  // chain id is optional; we keep it lazy to avoid hard dependency on wallet
  readonly walletChainId = signal<number | null>(null);

  readonly orderExpiry = computed<bigint | null>(() => {
    const parsed = parseExpirySelection(this.orderExpiryUnix());
    if (parsed.kind === 'invalid') return null;
    return displayUnixForExpiry(this.orderExpiryUnix());
  });

  readonly orderExpiryEtaLabel = computed(() =>
    sharedExpiryPreviewLabel(
      this.orderExpiryUnix(),
      'Contract default after placement (contract receives 0)',
    ),
  );

  // ---------------- option expiry selector (Fri 12:00 UTC) ----------------
  readonly optionExpiryYear = signal<string>('');
  readonly optionExpiryMonth = signal<string>('');
  readonly optionExpiryWeekUnix = signal<string>('');
  readonly optionExpirySelectionMode = signal<OptionExpirySelectionMode>('quick');

  readonly isCustomOptionExpiry = computed(() => this.optionExpirySelectionMode() === 'custom');

  readonly optionExpiryDropdownValue = computed(() =>
    this.isCustomOptionExpiry() ? 'custom' : this.optionExpiryUnix(),
  );

  readonly validExpiryOptions = computed(() => {
    const out: Array<{ unix: string; label: string }> = [];
    const now = BigInt(Math.floor(Date.now() / 1000));
    const d = new Date();
    let year = d.getUTCFullYear();
    let month = d.getUTCMonth() + 1;

    for (let i = 0; i < 36 && out.length < 12; i += 1) {
      for (const unix of fridayNoonUtcInMonth(year, month)) {
        if (unix > now) out.push({ unix: unix.toString(), label: formatUtcDateLabel(unix) });
        if (out.length >= 12) break;
      }
      month += 1;
      if (month > 12) { month = 1; year += 1; }
    }
    return out;
  });

  readonly optionExpiryYears = computed(() => {
    const now = new Date();
    const currentYear = now.getUTCFullYear();
    const years: string[] = [];
    for (let i = 0; i <= 8; i++) years.push(String(currentYear + i));

    const selected = selectedExpiryDateParts(this.optionExpiryUnix())?.year;
    if (selected && !years.includes(selected)) years.push(selected);
    return years.sort();
  });

  readonly optionExpiryMonths = computed(() => {
    const selectedYear = Number(this.optionExpiryYear() || new Date().getUTCFullYear());
    const cutoff = nowSec();

    const months: Array<{ value: string; label: string }> = [];
    for (let m = 1; m <= 12; m++) {
      if (fridayNoonUtcInMonth(selectedYear, m).some((expiry) => expiry > cutoff)) {
        months.push({ value: String(m), label: monthNameUtc(m) });
      }
    }
    return months;
  });

  readonly optionExpiryWeeks = computed(() => {
    const y = Number(this.optionExpiryYear());
    const m = Number(this.optionExpiryMonth());
    const cutoff = nowSec();
    if (!Number.isFinite(y) || !Number.isFinite(m) || y <= 0 || m <= 0) return [];
    return fridayNoonUtcInMonth(y, m)
      .filter((expiry) => expiry > cutoff)
      .map((expiry, index) => ({ value: expiry.toString(), label: `Friday ${index + 1} · ${formatUtcDateLabel(expiry)}` }));
  });

  readonly optionExpiryHumanLabel = computed(() => {
    const exp = this.optionExpiry();
    return exp ? formatUtcDateLabel(exp) : '—';
  });

  selectOptionExpiry(unix: string) {
    const value = String(unix ?? '').trim();
    this.optionExpiryUnix.set(value);
    this.syncOptionExpirySelectorsFromUnix(value);
  }

  selectOptionExpiryChoice(value: string) {
    const selected = String(value ?? '').trim();
    if (selected === 'custom') {
      this.optionExpirySelectionMode.set('custom');
      if (!this.optionExpiryYear() || !this.optionExpiryMonth()) {
        this.syncOptionExpirySelectorsFromUnix(this.optionExpiryUnix());
      }
      return;
    }

    this.optionExpirySelectionMode.set('quick');
    this.selectOptionExpiry(selected);
  }

  onOptionExpiryYearChange(year: string | number) {
    this.optionExpirySelectionMode.set('custom');
    this.optionExpiryYear.set(String(year ?? ''));
    const firstMonth = this.optionExpiryMonths()[0]?.value ?? '';
    if (!this.optionExpiryMonth() || !this.optionExpiryMonths().some((m) => m.value === this.optionExpiryMonth())) {
      this.optionExpiryMonth.set(firstMonth);
    }
    this.selectFirstFridayOptionExpiryForCurrentMonth();
  }

  onOptionExpiryMonthChange(month: string | number) {
    this.optionExpirySelectionMode.set('custom');
    this.optionExpiryMonth.set(String(month ?? ''));
    this.selectFirstFridayOptionExpiryForCurrentMonth();
  }

  onOptionExpiryWeekChange(unix: string | number) {
    this.optionExpirySelectionMode.set('custom');
    this.optionExpiryWeekUnix.set(String(unix ?? ''));
    this.selectOptionExpiry(String(unix ?? ''));
  }

  private selectFirstFridayOptionExpiryForCurrentMonth() {
    const first = this.optionExpiryWeeks()[0]?.value ?? '';
    if (first) this.selectOptionExpiry(first);
  }

  private syncOptionExpirySelectorsFromUnix(unixInput: string) {
    const parts = selectedExpiryDateParts(unixInput);
    if (!parts) return;
    this.optionExpiryYear.set(parts.year);
    this.optionExpiryMonth.set(parts.month);
    this.optionExpiryWeekUnix.set(String(unixInput));
  }

  // ---------------- strike normalization (contract-authoritative) ----------------
  readonly normalizedStrikeFixed = signal<bigint | null>(null);
  readonly tickFixed = signal<bigint | null>(null);

  readonly normalizedStrikeHuman = computed(() => {
    const v = this.normalizedStrikeFixed();
    if (v === null) return '';
    return fixedPriceToHuman(v, this.assetDecimals(), this.quoteDecimals());
  });

  readonly tickHuman = computed(() => {
    const v = this.tickFixed();
    if (v === null) return '';
    return fixedPriceToHuman(v, this.assetDecimals(), this.quoteDecimals());
  });

  readonly premiumBudgetRaw = computed<bigint | null>(() => {
    const size = this.sizeRaw();
    const ask = this.askFixed();
    if (!size || !ask) return null;
    return (size * ask) / ONE_E18;
  });

  // ---------------- market key (derived via OptionContract helper) ----------------
  readonly marketKey = signal<string>('');
  readonly marketKeyLoading = signal(false);
  readonly marketKeyError = signal<string | null>(null);

  // ---------------- current position (for sell-side UX) ----------------
  // This is best-effort and used for UI hints only.
  readonly marketPositionLoading = signal(false);
  readonly marketWriterRaw = signal<bigint>(0n);
  readonly marketHolderAvailRaw = signal<bigint>(0n);

  readonly marketWriterHuman = computed(() =>
    formatUnitsHuman(this.marketWriterRaw(), this.assetDecimals(), { maxDecimals: 6, compactFrom: 1_000_000 }),
  );

  readonly marketHolderAvailHuman = computed(() =>
    formatUnitsHuman(this.marketHolderAvailRaw(), this.assetDecimals(), { maxDecimals: 6, compactFrom: 1_000_000 }),
  );

  private async refreshMarketPosition() {
    const key = this.marketKey();
    const acct = (this.settings.selectedAccountId?.() ?? '') as string;
    if (!key || !acct) {
      this.marketWriterRaw.set(0n);
      this.marketHolderAvailRaw.set(0n);
      return;
    }

    this.marketPositionLoading.set(true);
    try {
      const pos = await this.optionRead.getUserPosition(key, acct);
      const holderAvail =
        pos.holderSize > pos.holderExercised
          ? pos.holderSize - pos.holderExercised
          : 0n;
      this.marketWriterRaw.set(pos.writerSize);
      this.marketHolderAvailRaw.set(holderAvail);
    } catch {
      // non-fatal: keep zeros
      this.marketWriterRaw.set(0n);
      this.marketHolderAvailRaw.set(0n);
    } finally {
      this.marketPositionLoading.set(false);
    }
  }

  private async refreshMarketKey() {
    this.marketKeyError.set(null);

    if (!this.pairValid()) {
      this.marketKey.set('');
      return;
    }

    const strikeInput = this.strikeFixed();
    const exp = this.optionExpiry();
    if (strikeInput === null || exp === null) {
      this.marketKey.set('');
      return;
    }

    this.marketKeyLoading.set(true);
    try {
      // Normalize strike on-chain so the marketKey matches contract behavior.
      const normalizedStrike =
        await this.optionRead.normalizeStrike(strikeInput);
      const tick = await this.optionRead.tickForStrike(strikeInput);
      this.normalizedStrikeFixed.set(normalizedStrike);
      this.tickFixed.set(tick);

      const key = await this.optionRead.computeMarketKey({
        optionType: this.optionType(),
        assetToken: keyToContractAddress(this.assetKey()),
        quoteToken: keyToContractAddress(this.quoteKey()),
        strikePrice: normalizedStrike,
        expiry: exp,
      });
      this.marketKey.set(key);
    } catch (e: any) {
      this.marketKeyError.set(
        String(
          e?.reason ?? e?.shortMessage ?? e?.message ?? 'Market key failed',
        ),
      );
      this.marketKey.set('');
    } finally {
      this.marketKeyLoading.set(false);
    }
  }

  // ---------------- confirmation modal VM ----------------
  readonly confirmOpen = signal(false);
  readonly confirmTitle = signal('');
  readonly confirmLabel = signal('');
  readonly confirmFields = signal<ConfirmationField[]>([]);
  readonly confirmRequirements = signal<RequirementRow[]>([]);
  readonly confirmError = signal<string | null>(null);

  readonly submitLoading = signal(false);
  readonly submitStage = signal<'idle' | 'submitting'>('idle');

  readonly status = computed(() => {
    if (this.submitLoading()) return 'pending';
    if (this.confirmError()) return 'error';
    return 'idle';
  });

  readonly confirmDisabled = computed(() => {
    if (this.submitLoading()) return true;
    if (this.mode() !== 'place') return false;
    // premium payer actions require a non-zero ERC20 fee token
    if (this.isPremiumPayer() && !this.feeTokenIsValid()) return true;
    if (!this.pairValid()) return true;
    if (!this.sizeRaw()) return true;
    if (!this.askFixed()) return true;
    if (!this.strikeFixed()) return true;
    if (!this.optionExpiry()) return true;
    if (this.orderExpiry() === null) return true;
    return false;
  });

  closeConfirm() {
    this.confirmOpen.set(false);
  }

  // =========================================================
  // Accept/Cancel by orderId (used from the modal action menu)
  // =========================================================
  async openAcceptCancelConfirmation(): Promise<void> {
    this.confirmError.set(null);
    this.pendingAccept.set(null);
    this.pendingCancel.set(null);

    const idStr = String(this.makerOrderIdHuman() ?? '').trim();
    if (!idStr) {
      this.confirmError.set('Enter an order id.');
      this.confirmOpen.set(true);
      return;
    }

    let orderId: bigint;
    try {
      orderId = BigInt(idStr);
    } catch {
      this.confirmError.set('Invalid order id.');
      this.confirmOpen.set(true);
      return;
    }

    // Load the order so we can:
    // - parse fill size with the correct token decimals
    // - show the market parameters + intent
    const o = await this.orderbookRead.getOrder(orderId);
    if (!o) {
      this.confirmError.set('Order not found.');
      this.confirmOpen.set(true);
      return;
    }

    const assetKey = normalizeKey(
      o.assetToken === ZERO ? ETH_ADDRESS : o.assetToken,
    );
    const quoteKey = normalizeKey(
      o.quoteToken === ZERO ? ETH_ADDRESS : o.quoteToken,
    );
    const assetInfo = this.tokens.getToken(assetKey)();
    const quoteInfo = this.tokens.getToken(quoteKey)();
    const assetDec = assetInfo?.decimals ?? 18;
    const quoteDec = quoteInfo?.decimals ?? 18;

    const intentLabel = (() => {
      switch (o.intent) {
        case 0:
          return 'BuyOption (Bid)';
        case 3:
          return 'SellWriter (Bid)';
        case 2:
          return 'WriteOption (Ask)';
        case 1:
          return 'SellOption (Ask)';
        default:
          return 'Order';
      }
    })();

    if (this.mode() === 'cancel') {
      this.confirmTitle.set('Cancel option order');
      this.confirmLabel.set('Cancel order');
      this.confirmFields.set([
        { label: 'Action', value: 'Cancel order' },
        { label: 'Order ID', value: orderId.toString() },
        { label: 'Intent', value: intentLabel },
        { label: 'Market', value: o.marketKey },
      ]);
      this.confirmRequirements.set([]);
      this.pendingCancel.set(orderId);
      this.confirmOpen.set(true);
      return;
    }

    // accept
    const sizeStr = String(this.acceptSizeHuman() ?? '').trim();
    if (!sizeStr) {
      this.confirmError.set('Enter a fill size.');
      this.confirmOpen.set(true);
      return;
    }

    let amount: bigint;
    try {
      amount = ethers.parseUnits(sizeStr.replace(',', '.'), assetDec);
    } catch {
      this.confirmError.set('Invalid fill size.');
      this.confirmOpen.set(true);
      return;
    }
    if (amount <= 0n) {
      this.confirmError.set('Fill size must be > 0.');
      this.confirmOpen.set(true);
      return;
    }

    // Fee token: only required when the taker is premium payer (maker is short-side).
    // Passing the preferred fee token always is safe; it is ignored when not needed.
    const makerIsShort = o.intent === 1 || o.intent === 2; // SellOption/WriteOption
    if (makerIsShort && !this.feeTokenIsValid()) {
      this.confirmError.set(
        'Select a preferred fee token to accept this order (can be ETH or ERC20).',
      );
      this.confirmOpen.set(true);
      return;
    }
    const feeToken = this.feeTokenAddress();

    this.confirmTitle.set('Accept option order');
    this.confirmLabel.set('Confirm & Sign');
    this.confirmFields.set([
      { label: 'Action', value: 'Accept order' },
      { label: 'Order ID', value: orderId.toString() },
      { label: 'Intent', value: intentLabel },
      { label: 'MarketKey', value: o.marketKey },
      { label: 'Strike', value: `${fixedPriceToHuman(o.strikePrice, assetDec, quoteDec)} ${quoteInfo?.symbol ?? shortAddr(quoteKey)}` },
      { label: 'Option Expiry', value: formatUtcDateLabel(o.optionExpiry) },
      { label: 'Order Expiry', value: formatUtcDateLabel(o.expiry) },
      { label: 'Asset', value: assetInfo?.symbol ?? shortAddr(assetKey) },
      { label: 'Payment token', value: 'ETH' },
      { label: 'Fill size', value: `${sizeStr}` },
      { label: 'Fee token', value: feeToken === ZERO ? 'ETH' : feeToken },
      {
        label: 'Ask/Premium',
        value: fixedPriceToHuman(o.askPrice, assetDec, quoteDec),
      },
      { label: 'Market', value: o.marketKey },
    ]);
    // Build best-effort requirement rows for accept:
    // - If maker is short-side (SellOption/WriteOption), taker is premium payer and must lock premium + fees.
    // - If maker is BuyOption and taker cannot cover with holder contracts, taker may need to lock collateral
    //   (writing a new option for the remainder). We show the worst-case for the requested fill amount.
    const reqs: Array<{ tokenKey: string; label: string; raw: bigint }> = [];

    // grossPremium in quote raw (quoteRaw = assetRaw * priceFixed / 1e18)
    const grossPremium = (amount * o.askPrice) / ONE_E18;

    if (makerIsShort) {
      // premium lock in quote
      reqs.push({
        tokenKey: quoteKey,
        label: 'Premium lock',
        raw: grossPremium,
      });

      // fee lock (best-effort): fetch a quote synchronously for the confirmation snapshot
      let fee: FeeOutput | null = null;
      try {
        fee = await this.feeManager.getFeeForAccount(
          feeToken,
          o.quoteToken,
          grossPremium,
          FEE_CONTEXT,
          ((this.settings.selectedAccountId?.() ?? ethers.ZeroAddress) as string),
          false,
        );
      } catch {
        fee = null;
      }
      if (fee?.fixedAmount && fee.fixedAmount > 0n) {
        reqs.push({
          tokenKey: normalizeKey(
            fee.fixedToken === ZERO ? ETH_ADDRESS : fee.fixedToken,
          ),
          label: 'Fixed fee lock',
          raw: fee.fixedAmount,
        });
      }
      if (fee?.percentageAmount && fee.percentageAmount > 0n) {
        reqs.push({
          tokenKey: normalizeKey(
            fee.percentageToken === ZERO ? ETH_ADDRESS : fee.percentageToken,
          ),
          label: 'Percentage fee lock',
          raw: fee.percentageAmount,
        });
      }
    }

    // Worst-case collateral for accepting a BuyOption if you don't have holder contracts to sell.
    if (o.intent === 0) {
      try {
        const acct = (this.settings.selectedAccountId?.() ?? '') as string;
        if (acct) {
          const pos = await this.optionRead.getUserPosition(o.marketKey, acct);
          const holderAvail =
            pos.holderSize > pos.holderExercised
              ? pos.holderSize - pos.holderExercised
              : 0n;
          if (holderAvail < amount) {
            if (o.optionType === 0) {
              // CALL writer collateral: asset
              reqs.push({
                tokenKey: assetKey,
                label: 'Call collateral lock',
                raw: amount,
              });
            } else {
              const quoteCollat = (amount * o.strikePrice) / ONE_E18;
              if (quoteCollat > 0n) {
                reqs.push({
                  tokenKey: quoteKey,
                  label: 'Put collateral lock',
                  raw: quoteCollat,
                });
              }
            }
          }
        }
      } catch {
        // ignore
      }
    }

    this.confirmRequirements.set(this.toRequirementRows(reqs));
    this.pendingAccept.set({ makerOrderId: orderId, amount, feeToken });
    this.confirmOpen.set(true);
  }

  // ---------------- handlers (dropdown + inputs) ----------------
  onAssetSelected(v: string) {
    this.assetSelected.set(v);
    this.assetInput.set('');
  }
  onAssetInput(v: string) {
    this.assetInput.set(v);
    this.assetSelected.set('');
  }
  onQuoteSelected(v: string) {
    this.quoteSelected.set(v);
    this.quoteInput.set('');
  }
  onQuoteInput(v: string) {
    this.quoteInput.set(v);
    this.quoteSelected.set('');
  }

  // ---------------- balances / requirements ----------------
  private getAvailableRaw(tokenKey: string): bigint {
    const b = this.balances();
    const row = b[tokenKey] ?? { balance: 0n, locked: 0n };
    const bal = row.balance ?? 0n;
    const locked = row.locked ?? 0n;
    return bal > locked ? bal - locked : 0n;
  }

  private toRequirementRows(
    entries: Array<{ tokenKey: string; label: string; raw: bigint }>,
  ): RequirementRow[] {
    const byKey = new Map<
      string,
      { total: bigint; comps: Array<{ label: string; raw: bigint }> }
    >();
    for (const e of entries) {
      const key = normalizeKey(e.tokenKey);
      const prev = byKey.get(key) ?? { total: 0n, comps: [] };
      prev.total += e.raw;
      prev.comps.push({ label: e.label, raw: e.raw });
      byKey.set(key, prev);
    }

    return Array.from(byKey.entries()).map(([key, v]) => {
      const info = this.tokens.getToken(key)();
      const decimals = info?.decimals ?? 18;
      const symbol =
        info?.symbol ?? (key === n(ETH_ADDRESS) ? 'ETH' : shortAddr(key));

      const availableRaw = this.getAvailableRaw(key);
      const ok = availableRaw >= v.total;
      const fmt = (raw: bigint) =>
        formatTokenAmount(raw, decimals, symbol, { maxDecimals: 6, compactFrom: 1_000_000 });

      return {
        tokenSymbol: symbol,
        tokenAddress: key === n(ETH_ADDRESS) ? 'address(0)' : key,
        available: fmt(availableRaw),
        ok,
        totalRequired: fmt(v.total),
        components: v.comps.map((c) => ({
          label: c.label,
          amount: fmt(c.raw),
          raw: c.raw.toString(),
        })),
        requiredRaw: v.total.toString(),
        availableRaw: availableRaw.toString(),
        decimals,
      } as RequirementRow;
    });
  }

  async openConfirmation() {
    this.confirmError.set(null);
    this.confirmFields.set([]);
    this.confirmRequirements.set([]);

    if (this.mode() !== 'place') return;
    if (this.confirmDisabled()) return;

    if (this.isPremiumPayer() && !this.feeTokenIsValid()) {
      this.confirmError.set(
        'Select a preferred fee token for this action (can be ETH or ERC20).',
      );
      return;
    }

    const assetKey = this.assetKey();
    const quoteKey = this.quoteKey();
    const size = this.sizeRaw()!;
    const ask = this.askFixed()!;
    const strikeInput = this.strikeFixed()!;
    const optExp = this.optionExpiry()!;
    const ordExpPreview = this.orderExpiry()!;
    const ordExp = ordExpPreview;

    // enforce standardized expiry shape early (best-effort; contract enforces too)
    try {
      const ok = await this.optionRead.isValidExpiry(optExp);
      if (!ok) {
        this.confirmError.set(
          'Invalid option expiry. Expiry must be Friday 12:00 UTC.',
        );
        return;
      }
    } catch {
      // ignore (read may fail on some networks), contract will still revert if invalid
    }

    // update market key (best-effort)
    await this.refreshMarketKey();

    const strikeNorm = this.normalizedStrikeFixed();
    const strikeUsed = strikeNorm ?? strikeInput;

    // fee quote: only meaningful for premium payer orders
    const premiumBudget = this.premiumBudgetRaw();
    if (this.isPremiumPayer() && premiumBudget) {
      this.feeSvc.setQuoteParams({
        assetToken: keyToContractAddress(quoteKey),
        assetValue: premiumBudget,
        context: FEE_CONTEXT,
      });
      this.feeSvc.refreshFeeQuote();
    } else {
      this.feeSvc.setQuoteParams(null);
    }

    const intentLabel = (() => {
      switch (this.intent()) {
        case 0:
          return 'BuyOption (Bid)';
        case 3:
          return 'SellWriter (Bid)';
        case 2:
          return 'WriteOption (Ask)';
        case 1:
          return 'SellOption (Ask)';
        default:
          return 'Order';
      }
    })();

    this.confirmTitle.set(this.quoteOnly() ? 'Options fee & margin preview' : 'Options order preview');
    this.confirmLabel.set(this.quoteOnly() ? 'Close' : 'Place order');

    const baseFields: ConfirmationField[] = [
      { label: 'Intent', value: intentLabel },
      { label: 'Option type', value: this.optionType() === 0 ? 'CALL' : 'PUT' },
      { label: 'Asset', value: this.assetSymbol() },
      { label: 'Payment token', value: this.quoteSymbol() },
      { label: 'Size', value: `${this.sizeHuman()} ${this.assetSymbol()}` },
      {
        label: 'Premium value / fee base',
        value: premiumBudget ? formatTokenAmount(premiumBudget, this.quoteDecimals(), this.quoteSymbol(), { maxDecimals: 6, compactFrom: 1_000_000 }) : '—',
      },
      {
        label: 'Premium (quote/asset)',
        value: `${fixedPriceToHuman(ask, this.assetDecimals(), this.quoteDecimals()) || this.askHuman()} ${this.quoteSymbol()} per 1 ${this.assetSymbol()}`,
      },
      {
        label: 'Strike',
        value: `${fixedPriceToHuman(strikeUsed, this.assetDecimals(), this.quoteDecimals())} ${this.quoteSymbol()} per 1 ${this.assetSymbol()}`,
      },
    ];

    if (!this.quoteOnly()) {
      baseFields.push(
        { label: 'MarketKey (input)', value: this.marketKey() || '—' },
        { label: 'Option Expiry', value: formatUtcDateLabel(optExp) },
        { label: 'Order Expiry', value: formatUtcDateTime(ordExp) },
        { label: 'Option expiry (unix)', value: optExp.toString(), tone: 'muted' },
        { label: 'Order expiry (human)', value: this.orderExpiryEtaLabel(), tone: 'muted' },
        { label: 'Order expiry (unix)', value: ordExp.toString(), tone: 'muted' },
        { label: 'Market key', value: this.marketKey() || '—', tone: 'muted' },
      );
    }

    baseFields.push(
      { label: 'Normalized strike (used)', value: `${this.normalizedStrikeHuman() || '—'} ${this.quoteSymbol()}`, tone: 'muted' },
      { label: 'Strike tick (info)', value: `${this.tickHuman() || '—'} ${this.quoteSymbol()}`, tone: 'muted' },
      { label: 'Fee context', value: FEE_CONTEXT, tone: 'muted' },
    );

    this.confirmFields.set(baseFields);

    // For sell-side flows, show current position in this market (helpful esp. Sell Writer).
    try {
      const acct = (this.settings.selectedAccountId?.() ?? '') as string;
      if (acct && this.marketKey()) {
        const pos = await this.optionRead.getUserPosition(
          this.marketKey(),
          acct,
        );
        const holderAvail =
          pos.holderSize > pos.holderExercised
            ? pos.holderSize - pos.holderExercised
            : 0n;
        this.confirmFields.set([
          ...this.confirmFields(),
          {
            label: 'Your writer contracts',
            value: formatUnitsHuman(pos.writerSize, this.assetDecimals(), { maxDecimals: 6, compactFrom: 1_000_000 }),
          },
          {
            label: 'Your holder contracts (avail)',
            value: formatUnitsHuman(holderAvail, this.assetDecimals(), { maxDecimals: 6, compactFrom: 1_000_000 }),
          },
        ]);
      }
    } catch {
      // non-fatal
    }

    const reqs: Array<{ tokenKey: string; label: string; raw: bigint }> = [];
    // premium payer locks premium budget in quote
    if (this.isPremiumPayer() && premiumBudget) {
      reqs.push({
        tokenKey: quoteKey,
        label: 'Premium budget lock',
        raw: premiumBudget,
      });

      // Fetch a fee quote synchronously for this confirmation snapshot
      let fee: FeeOutput | null = null;
      try {
        fee = await this.feeManager.getFeeForAccount(
          this.feeTokenAddress(),
          keyToContractAddress(quoteKey),
          premiumBudget,
          FEE_CONTEXT,
          ((this.settings.selectedAccountId?.() ?? ethers.ZeroAddress) as string),
          true,
        );
      } catch {
        fee = null;
      }
      if (fee?.fixedAmount && fee.fixedAmount > 0n) {
        reqs.push({
          tokenKey: normalizeKey(
            fee.fixedToken === ZERO ? ETH_ADDRESS : fee.fixedToken,
          ),
          label: 'Fixed fee lock',
          raw: fee.fixedAmount,
        });
      }
      if (fee?.percentageAmount && fee.percentageAmount > 0n) {
        reqs.push({
          tokenKey: normalizeKey(
            fee.percentageToken === ZERO ? ETH_ADDRESS : fee.percentageToken,
          ),
          label: 'Percentage fee lock',
          raw: fee.percentageAmount,
        });
      }
    }

    // Writer collateral (no fees): show what will be locked.
    if (this.intent() === 2) {
      if (this.optionType() === 0) {
        // CALL writer collateral: asset size
        reqs.push({
          tokenKey: assetKey,
          label: 'Call collateral lock',
          raw: size,
        });
      } else {
        // PUT writer collateral: quote = floor(size*strike/1e18)
        const quoteCollat = (size * strikeUsed) / ONE_E18;
        if (quoteCollat > 0n) {
          reqs.push({
            tokenKey: quoteKey,
            label: 'Put collateral lock',
            raw: quoteCollat,
          });
        }
      }
    }

    this.confirmRequirements.set(this.toRequirementRows(reqs));
    this.confirmOpen.set(true);
  }

  // =========================================================
  // Exercise/Reclaim by marketKey (used from action menu / positions)
  // =========================================================
  async openExerciseReclaimConfirmation(): Promise<void> {
    this.confirmError.set(null);

    const mk = String(this.actionMarketKeyHuman() || this.marketKey() || '')
      .trim()
      .toLowerCase();
    if (!mk || !mk.startsWith('0x') || mk.length !== 66) {
      this.confirmError.set('Enter a valid marketKey (bytes32).');
      return;
    }

    if (this.mode() === 'exercise') {
      // exercise size in asset units (raw)
      const assetKey = normalizeKey(this.assetSelected() || this.assetInput());
      const assetInfo = this.tokens.getToken(assetKey)();
      const dec = assetInfo?.decimals ?? 18;

      let size: bigint;
      try {
        size = ethers.parseUnits(
          String(this.exerciseSizeHuman() || this.sizeHuman() || '0').replace(
            ',',
            '.',
          ),
          dec,
        );
      } catch {
        this.confirmError.set('Invalid size.');
        return;
      }
      if (size <= 0n) {
        this.confirmError.set('Enter a size.');
        return;
      }

      this.pendingExercise.set({ marketKey: mk, size });
      this.confirmFields.set([
        { label: 'Action', value: 'Exercise' },
        { label: 'MarketKey', value: mk },
        {
          label: 'Size',
          value: String(this.exerciseSizeHuman() || this.sizeHuman() || ''),
        },
      ]);
      this.confirmLabel.set('Confirm & Sign');
      this.confirmTitle.set('Exercise');
      this.confirmOpen.set(true);
      return;
    }

    if (this.mode() === 'reclaim') {
      this.pendingReclaim.set(mk);
      this.confirmFields.set([
        { label: 'Action', value: 'Reclaim Expired' },
        { label: 'MarketKey', value: mk },
      ]);
      this.confirmLabel.set('Confirm & Sign');
      this.confirmTitle.set('Reclaim Expired');
      this.confirmOpen.set(true);
      return;
    }
  }
  async submit(): Promise<void> {
    // Accept/Cancel are driven by openAcceptCancelConfirmation() which prepares pending params.
    if (this.mode() === 'accept') {
      const p = this.pendingAccept();
      if (!p) {
        this.confirmError.set('No accept parameters.');
        return;
      }
      this.submitLoading.set(true);
      this.submitStage.set('submitting');
      this.txReceipt.pending(this.confirmTitle(), 'Waiting for wallet signature and on-chain confirmation...');
      try {
        const txHash = await this.actions.acceptById({
          makerOrderId: p.makerOrderId,
          amount: p.amount,
          feeToken: p.feeToken,
        });
        this.txReceipt.success('Transaction confirmed', typeof txHash === 'string' ? txHash : null);
      } catch (e: any) {
        const message = String(e?.reason ?? e?.shortMessage ?? e?.message ?? 'Accept failed');
        this.confirmError.set(message);
        this.txReceipt.error('Transaction failed', e, message);
      } finally {
        this.submitLoading.set(false);
        this.submitStage.set('idle');
      }
      return;
    }

    if (this.mode() === 'cancel') {
      const id = this.pendingCancel();
      if (!id) {
        this.confirmError.set('No cancel parameters.');
        return;
      }
      this.submitLoading.set(true);
      this.submitStage.set('submitting');
      this.txReceipt.pending(this.confirmTitle(), 'Waiting for wallet signature and on-chain confirmation...');
      try {
        const txHash = await this.actions.cancelById(id);
        this.txReceipt.success('Transaction confirmed', typeof txHash === 'string' ? txHash : null);
      } catch (e: any) {
        const message = String(e?.reason ?? e?.shortMessage ?? e?.message ?? 'Cancel failed');
        this.confirmError.set(message);
        this.txReceipt.error('Transaction failed', e, message);
      } finally {
        this.submitLoading.set(false);
        this.submitStage.set('idle');
      }
      return;
    }

    // place
    if (this.confirmDisabled()) return;

    const size = this.sizeRaw();
    const ask = this.askFixed();
    const strike = this.strikeFixed();
    const optExp = this.optionExpiry();
    const ordExpPreview = this.orderExpiry();
    if (!size || ask === null || strike === null || !optExp || ordExpPreview === null) {
      this.confirmError.set('Invalid inputs.');
      return;
    }

    const chainNow = await this.latestChainTimestamp();
    const ordExp = resolveExpiryForContract(this.orderExpiryUnix(), chainNow);
    const expiryError = validateResolvedExpiry(ordExp, chainNow);
    if (expiryError) {
      this.confirmError.set(expiryError);
      return;
    }

    this.submitLoading.set(true);
    this.submitStage.set('submitting');
    this.txReceipt.pending(this.confirmTitle(), 'Waiting for wallet signature and on-chain confirmation...');

    try {
      // fee token only for premium payer stored orders; otherwise pass 0x0
      const feeToken = this.isPremiumPayer() ? this.feeTokenAddress() : ZERO;

      const txHash = await this.actions.placeOrder({
        optionType: this.optionType(),
        assetToken: keyToContractAddress(this.assetKey()),
        quoteToken: keyToContractAddress(this.quoteKey()),
        strikePrice: strike,
        optionExpiry: optExp,
        orderExpiry: ordExp,
        feeToken,
        intent: this.intent(),
        size,
        askPrice: ask,
      });

      this.trigger.emitDomainEvent({ type: 'orderPlaced' });
      this.txReceipt.success('Transaction confirmed', typeof txHash === 'string' ? txHash : null);
    } catch (e: any) {
      const message = String(e?.reason ?? e?.shortMessage ?? e?.message ?? 'Order failed');
      this.confirmError.set(message);
      this.txReceipt.error('Transaction failed', e, message);
    } finally {
      this.submitLoading.set(false);
      this.submitStage.set('idle');
    }
  }

  constructor() {
    // Best-effort chain id retained for network-aware UX defaults.
    (async () => {
      try {
        const provider = await this.wallet.getEthersProvider();
        if (!provider) return;
        const net = await provider.getNetwork();
        this.walletChainId.set(Number(net.chainId));
      } catch {
        // ignore
      }
    })();

    // Default expiry to the next valid slot if empty and keep the custom
    // year/month/Friday selector aligned with whichever expiry is selected.
    effect(() => {
      const opts = this.validExpiryOptions();
      if (!this.optionExpiryUnix() && opts.length > 0) {
        this.selectOptionExpiry(opts[0].unix);
        return;
      }

      const selected = this.optionExpiryUnix();
      if (selected && selected !== this.optionExpiryWeekUnix()) {
        this.syncOptionExpirySelectorsFromUnix(selected);
      }
    });

    // Keep marketKey up to date when key inputs change.
    effect(() => {
      // touch dependencies
      this.optionType();
      this.assetKey();
      this.quoteKey();
      this.strikeFixed();
      this.optionExpiry();
      // fire
      void this.refreshMarketKey();
    });

    // Keep market position hint up to date when marketKey/account changes.
    effect(() => {
      this.marketKey();
      this.settings.selectedAccountId?.();
      void this.refreshMarketPosition();
    });
  }
  private async latestChainTimestamp(): Promise<bigint | null> {
    try {
      const provider: any = await this.wallet.getEthersProvider();
      if (!provider) return null;
      const block = await provider.getBlock('latest');
      const ts = block?.timestamp;
      return typeof ts === 'number' && Number.isFinite(ts) && ts > 0
        ? BigInt(ts)
        : null;
    } catch {
      return null;
    }
  }


}
