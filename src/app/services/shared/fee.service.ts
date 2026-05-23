import {
  Injectable,
  computed,
  inject,
  resource,
  signal,
  effect,
} from '@angular/core';
import {
  FeeManagerContractService,
  FeeOutput,
} from '../onchain/contracts/fee-manager-contract.service';
import { TriggerService } from '../shared/trigger.service';
import { TradeSettingsService } from '../shared/trade-settings.service';

import { isAddress } from 'ethers'; // v6: ethers.isAddress also exists
import { ETH_ADDRESS } from './main.tokens';

function n(v: unknown): string {
  return String(v ?? '')
    .trim()
    .toLowerCase();
}

function isNativeLike(input: unknown): boolean {
  const k = n(input);
  return k === 'eth' || k === 'native' || k === 'ether' || k === n(ETH_ADDRESS);
}

function normalizePaymentToken(input: unknown): string {
  const s = String(input ?? '').trim();
  if (!s) return '';
  // FeeManager uses address(0) for native/ETH
  if (isNativeLike(s)) return '0x0000000000000000000000000000000000000000';
  return s;
}

function normAddrOrEmpty(x: unknown): string {
  const s = String(x ?? '').trim();
  if (!s) return '';
  return s;
}

function isHexAddress(x: string): boolean {
  // Use ethers.isAddress in your environment
  try {
    return isAddress(x);
  } catch {
    return false;
  }
}

type FeeQuoteParams = {
  assetToken: string;
  assetValue: bigint;
  context: string;
  account?: string;
  isMaker?: boolean;
};

@Injectable({ providedIn: 'root' })
export class FeeService {
  private readonly fees = inject(FeeManagerContractService);
  private readonly trigger = inject(TriggerService);
  private readonly settings = inject(TradeSettingsService);

  // UI-driven inputs (keep as-is)
  private readonly _quoteParams = signal<FeeQuoteParams | null>(null);
  readonly quoteParams = this._quoteParams.asReadonly();

  setQuoteParams(p: FeeQuoteParams | null) {
    this._quoteParams.set(p);
  }

  // ✅ accepted payment tokens (no tick in params)
  private readonly _acceptedTokensRes = resource<string[], {}>({
    params: () => ({}),
    loader: async () => (await this.fees.getAcceptedPaymentTokens()) ?? [],
  });

  readonly acceptedPaymentTokens = computed(
    () => this._acceptedTokensRes.value() ?? [],
  );
  readonly acceptedPaymentTokensStatus = computed(() =>
    this._acceptedTokensRes.status(),
  );
  readonly acceptedPaymentTokensError = computed(
    () => this._acceptedTokensRes.error() ?? null,
  );

  // ✅ sethx token (no tick in params)
  private readonly _sethxTokenRes = resource<string | null, {}>({
    params: () => ({}),
    loader: async () => (await this.fees.getSethxToken()) ?? null,
  });

  readonly sethxToken = computed(() => this._sethxTokenRes.value() ?? null);
  readonly sethxTokenStatus = computed(() => this._sethxTokenRes.status());
  readonly sethxTokenError = computed(
    () => this._sethxTokenRes.error() ?? null,
  );

  // ✅ fee quote (params only reflect REAL inputs: payment token + quote params)
  private readonly _feeQuoteRes = resource<
    FeeOutput | null,
    { paymentToken: string; p: FeeQuoteParams | null }
  >({
    params: () => ({
      paymentToken: this.settings.preferredFeeToken(),
      p: this._quoteParams(),
    }),
    loader: async ({ params }) => {
      if (!params.p) return null;

      const paymentToken = normAddrOrEmpty(
        normalizePaymentToken(params.paymentToken),
      );
      const assetToken = normAddrOrEmpty(params.p.assetToken);
      const account = normAddrOrEmpty(params.p.account ?? '0x0000000000000000000000000000000000000000');

      // ✅ HARD GUARD: do not call ethers with non-addresses (prevents ENS resolution)
      if (!isHexAddress(paymentToken) || !isHexAddress(assetToken) || !isHexAddress(account)) return null;

      return await this.fees.getFeeForAccount(
        paymentToken,
        assetToken,
        params.p.assetValue,
        params.p.context,
        account,
        params.p.isMaker ?? true,
      );
    },
  });

  readonly feeQuote = computed(() => this._feeQuoteRes.value() ?? null);
  readonly feeQuoteStatus = computed(() => this._feeQuoteRes.status());
  readonly feeQuoteError = computed(() => this._feeQuoteRes.error() ?? null);

  // ✅ explicit refresh helpers (optional)
  refreshAcceptedPaymentTokens() {
    this._acceptedTokensRes.reload();
  }
  refreshSethxToken() {
    this._sethxTokenRes.reload();
  }
  refreshFeeQuote() {
    this._feeQuoteRes.reload();
  }

  constructor() {
    // ✅ tick drives reload, not params
    effect(() => {
      this.trigger.feesTick();

      this.refreshAcceptedPaymentTokens();
      this.refreshSethxToken();

      // Only reload quote if there *is* a quote request active
      if (this._quoteParams()) this.refreshFeeQuote();
    });
  }
}
