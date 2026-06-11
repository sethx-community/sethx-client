import { Injectable, computed, inject, signal } from '@angular/core';
import { ethers } from 'ethers';

import type {
  ConfirmationField,
  RequirementRow,
} from '../../core/modals/confirmation/confirmation-modal.component';
import { ETH_ADDRESS } from '../shared/main.tokens';
import { TradeSettingsService } from '../shared/trade-settings.service';
import { TokenService } from '../shared/token.service';
import { PortfolioService } from './portfolio.service';
import { FeeService } from '../shared/fee.service';
import { FuturesOrderBookActionsService } from '../shared/futures-orderbook/futures-orderbook-actions.service';
import { FuturesContractReadService } from './contracts/futures-contract-read.service';
import { WalletConnectService } from '../../wallet/wallet-connect.service';
import { TransactionReceiptService } from '../../shared/transaction-receipt';
import {
  expiryPreviewLabel as sharedExpiryPreviewLabel,
  formatDuration as sharedFormatDuration,
  resolveExpiryForContract,
  validateResolvedExpiry,
} from '../../shared/expiry/expiry-settings';
import { formatTokenAmount, formatUnitsHuman } from '../../core/format/number-format';

type DraftMode = 'place' | 'cancel';
type FuturesIntent = 'buy' | 'sell' | 'quote' | 'cancel';

const ZERO = ethers.ZeroAddress;
const FEE_CONTEXT = 'Futures Trade';
const FUTURES_DEFAULT_EXPIRY_SECONDS = 30n * 24n * 60n * 60n;

function n(v: unknown): string {
  return String(v ?? '')
    .trim()
    .toLowerCase();
}

function shortAddr(a: string): string {
  const s = a ?? '';
  return s.length > 10 ? `${s.slice(0, 6)}…${s.slice(-4)}` : s;
}

function keyToContractAddress(key: string): string {
  return n(key) === n(ETH_ADDRESS) ? ZERO : n(key);
}

function canonicalTokenKey(token: string): string {
  const t = n(token);
  return t === n(ZERO) ? n(ETH_ADDRESS) : t;
}

function parseFuturesSize(value: string): bigint {
  const v = String(value ?? '').trim().replace(',', '.');
  if (!/^(?:\d+|\d*\.\d+)$/.test(v)) {
    throw new Error('Futures amount must be a valid contract amount.');
  }
  const parsed = ethers.parseUnits(v, 18);
  if (parsed <= 0n) {
    throw new Error('Futures amount must be greater than zero.');
  }
  return parsed;
}

@Injectable({ providedIn: 'root' })
export class FuturesOrderDraftService {
  private readonly settings = inject(TradeSettingsService);
  readonly txReceipt = inject(TransactionReceiptService);
  private readonly tokens = inject(TokenService);
  private readonly portfolio = inject(PortfolioService);
  private readonly feeSvc = inject(FeeService);
  private readonly actions = inject(FuturesOrderBookActionsService);
  private readonly futuresRead = inject(FuturesContractReadService);
  private readonly wallet = inject(WalletConnectService);

  readonly mode = signal<DraftMode>('place');
  readonly intent = signal<FuturesIntent>('buy');
  readonly side = signal<'buy' | 'sell'>('buy');

  readonly marketKey = signal('');
  readonly priceHuman = signal('');
  readonly amountHuman = signal('');
  readonly expirySec = signal(''); // absolute Unix timestamp, 0 = contract default
  readonly cancelOrderId = signal('');

  readonly confirmOpen = signal(false);
  readonly confirmTitle = signal('Confirm futures action');
  readonly confirmLabel = signal('Confirm & Sign');
  readonly confirmFields = signal<ConfirmationField[]>([]);
  readonly confirmRequirements = signal<RequirementRow[]>([]);
  readonly confirmDisabled = signal(false);
  readonly confirmError = signal<string | null>(null);
  readonly pending = signal(false);

  private pendingConfirmAction: null | (() => Promise<string | null | void>) = null;

  readonly feeTokenKey = computed(
    () =>
      n(this.settings.preferredFeeToken?.() ?? ETH_ADDRESS) || n(ETH_ADDRESS),
  );

  readonly feeTokenAddress = computed(() =>
    keyToContractAddress(this.feeTokenKey()),
  );

  readonly feeTokenLabel = computed(() => {
    const key = this.feeTokenKey();
    const info = this.tokens.getToken(key)();
    return info?.symbol ?? (key === n(ETH_ADDRESS) ? 'ETH' : shortAddr(key));
  });

  prefill(data: {
    intent: FuturesIntent;
    defaultMarketKey?: string;
    defaultPriceHuman?: string;
    defaultAmountHuman?: string;
  }) {
    this.intent.set(data.intent);
    this.side.set(data.intent === 'sell' ? 'sell' : 'buy');
    this.mode.set(data.intent === 'cancel' ? 'cancel' : 'place');

    if (data.defaultMarketKey) {
      this.marketKey.set(String(data.defaultMarketKey).toLowerCase());
    }
    if (data.defaultPriceHuman) {
      this.priceHuman.set(String(data.defaultPriceHuman));
    }
    if (data.defaultAmountHuman) {
      this.amountHuman.set(String(data.defaultAmountHuman));
    }

    this.confirmError.set(null);
    this.confirmDisabled.set(false);
  }

  closeConfirm() {
    this.confirmOpen.set(false);
    this.pending.set(false);
    this.confirmError.set(null);
    this.confirmDisabled.set(false);
    this.pendingConfirmAction = null;
  }

  private getAvailableRaw(tokenKey: string): bigint {
    const key = canonicalTokenKey(tokenKey);
    const balances = this.portfolio.accountBalances?.() ?? {};
    const b = balances[key];
    if (!b) return 0n;

    const bal = b.balance ?? 0n;
    const locked = b.locked ?? 0n;
    return bal > locked ? bal - locked : 0n;
  }

  private fmtToken(raw: bigint, decimals: number, symbol: string): string {
    return formatTokenAmount(raw, decimals, symbol, { maxDecimals: 6, compactFrom: 1_000_000 });
  }

  private toRequirementRows(
    entries: Array<{ tokenKey: string; label: string; raw: bigint }>,
  ): RequirementRow[] {
    const byKey = new Map<
      string,
      { total: bigint; comps: Array<{ label: string; raw: bigint }> }
    >();

    for (const e of entries) {
      if (e.raw <= 0n) continue;

      const key = canonicalTokenKey(e.tokenKey);
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

      return {
        tokenSymbol: symbol,
        tokenAddress: key === n(ETH_ADDRESS) ? 'address(0)' : key,
        available: this.fmtToken(availableRaw, decimals, symbol),
        ok,
        totalRequired: this.fmtToken(v.total, decimals, symbol),
        components: v.comps.map((c) => ({
          label: c.label,
          amount: this.fmtToken(c.raw, decimals, symbol),
          raw: c.raw.toString(),
        })),
        requiredRaw: v.total.toString(),
        availableRaw: availableRaw.toString(),
        decimals,
      } as RequirementRow;
    });
  }

  private waitForFeeQuote(): Promise<void> {
    return new Promise((resolve, reject) => {
      const check = () => {
        const st = this.feeSvc.feeQuoteStatus();
        if (st === 'error') return reject(this.feeSvc.feeQuoteError());
        if (st !== 'loading' && st !== 'reloading') return resolve();
        setTimeout(check, 0);
      };
      check();
    });
  }

  private expiryPreviewLabel(): string {
    return sharedExpiryPreviewLabel(
      this.expirySec(),
      `Contract default: ${this.formatDuration(FUTURES_DEFAULT_EXPIRY_SECONDS)} after placement`,
    );
  }

  private formatDuration(seconds: bigint): string {
    return sharedFormatDuration(seconds);
  }

  private readonly wad = 10n ** 18n;

  private normalizePriceTo18(
    rawPrice: bigint,
    oraclePriceDecimals: number,
  ): bigint {
    const oracleDecimals = Math.max(0, Number(oraclePriceDecimals ?? 18));
    if (oracleDecimals === 18) return rawPrice;
    if (oracleDecimals > 18) return rawPrice / 10n ** BigInt(oracleDecimals - 18);
    return rawPrice * 10n ** BigInt(18 - oracleDecimals);
  }

  private normalizedMultiplier(multiplier: bigint): bigint {
    const raw = BigInt(multiplier ?? 0n);
    if (raw <= 0n) return 0n;
    return raw >= 10n ** 12n ? raw : raw * this.wad;
  }

  private futuresNotionalRaw(
    amountRaw: bigint,
    priceRaw: bigint,
    market: { multiplier: bigint; oraclePriceDecimals: number },
  ): bigint {
    const price18 = this.normalizePriceTo18(
      priceRaw,
      market.oraclePriceDecimals,
    );
    const multiplier18 = this.normalizedMultiplier(market.multiplier);
    return (amountRaw * multiplier18 * price18) / (this.wad * this.wad);
  }

  private pnlBufferWorstCaseRaw(
    side: 0 | 1,
    amountRaw: bigint,
    limitPriceRaw: bigint,
    market: {
      multiplier: bigint;
      oraclePriceDecimals: number;
      quoteTokenDecimals: number;
      lastSettlementPrice: bigint;
    },
  ): bigint {
    const limitNorm = this.normalizePriceTo18(
      limitPriceRaw,
      market.oraclePriceDecimals,
    );
    const settleNorm = this.normalizePriceTo18(
      market.lastSettlementPrice,
      market.oraclePriceDecimals,
    );

    let diff = 0n;
    if (side === 0) {
      if (limitNorm > settleNorm) diff = limitNorm - settleNorm;
    } else if (settleNorm > limitNorm) {
      diff = settleNorm - limitNorm;
    }

    if (diff === 0n) return 0n;
    const multiplier18 = this.normalizedMultiplier(market.multiplier);
    return (diff * amountRaw * multiplier18) / (this.wad * this.wad);
  }

  private initialMarginRequiredRaw(
    sizeRaw: bigint,
    settlementPriceRaw: bigint,
    market: {
      multiplier: bigint;
      oraclePriceDecimals: number;
      quoteTokenDecimals: number;
      initialMarginBps: bigint;
    },
  ): bigint {
    if (sizeRaw <= 0n) return 0n;
    const price18 = this.normalizePriceTo18(
      settlementPriceRaw,
      market.oraclePriceDecimals,
    );
    const multiplier18 = this.normalizedMultiplier(market.multiplier);
    return (sizeRaw * multiplier18 * price18 * market.initialMarginBps) / (10_000n * this.wad * this.wad);
  }

  async openConfirmation() {
    this.confirmError.set(null);
    this.confirmFields.set([]);
    this.confirmRequirements.set([]);
    this.confirmDisabled.set(false);

    if (this.mode() === 'cancel') {
      const orderId = this.cancelOrderId().trim();
      if (!orderId) {
        this.confirmError.set('Order ID is required.');
        return;
      }

      this.confirmTitle.set('Cancel futures order');
      this.confirmLabel.set('Cancel order');
      this.confirmFields.set([
        { label: 'Action', value: 'Cancel order' },
        { label: 'Order ID', value: orderId },
        {
          label: 'Routing',
          value: 'Via selected account contract',
          tone: 'muted',
        },
      ]);

      this.pendingConfirmAction = async () => {
        await this.actions.cancelOrder(BigInt(orderId));
      };

      this.confirmOpen.set(true);
      return;
    }

    const mk = this.marketKey().trim().toLowerCase();
    if (!mk) {
      this.confirmError.set('Select a market first.');
      return;
    }

    const side: 0 | 1 = this.side() === 'sell' ? 1 : 0;

    const priceStr = String(this.priceHuman() ?? '').trim();
    const amountStr = String(this.amountHuman() ?? '').trim();

    if (!priceStr || !amountStr) {
      this.confirmError.set('Price and amount are required.');
      return;
    }

    const market = await this.futuresRead.getMarket(mk);
    if (!market) {
      this.confirmError.set('Unable to load futures market.');
      return;
    }

    const quoteKey = canonicalTokenKey(market.quoteToken || ETH_ADDRESS);
    const quoteInfo = this.tokens.getToken(quoteKey)();
    const quoteDecimals =
      market.quoteTokenDecimals ?? quoteInfo?.decimals ?? 18;
    const oracleDecimals = Math.max(0, Number(market.oraclePriceDecimals ?? quoteDecimals ?? 18));
    const paymentSymbol =
      quoteInfo?.symbol ??
      (quoteKey === n(ETH_ADDRESS) ? 'ETH' : shortAddr(quoteKey));

    let priceRaw: bigint;
    let amountRaw: bigint;

    try {
      priceRaw = ethers.parseUnits(priceStr.replace(',', '.'), oracleDecimals);
      amountRaw = parseFuturesSize(amountStr);
    } catch {
      this.confirmError.set('Invalid price or amount. Futures amount supports decimal contract units.');
      return;
    }

    if (priceRaw <= 0n || amountRaw <= 0n) {
      this.confirmError.set('Price and amount must be greater than zero.');
      return;
    }

    const chainNow = await this.latestChainTimestamp();
    const expiry = resolveExpiryForContract(this.expirySec(), chainNow);
    const expiryError = validateResolvedExpiry(expiry, chainNow);
    if (expiryError) {
      this.confirmError.set(expiryError);
      return;
    }

    const selectedAccount = n(this.settings.selectedAccountId?.() ?? '');
    const isLongPositionToClose = side === 1;
    const closingPosition = selectedAccount
      ? await this.futuresRead.getPosition(
          selectedAccount,
          mk,
          isLongPositionToClose,
        )
      : null;
    const existingCloseSize = closingPosition?.isActive
      ? (closingPosition.size ?? 0n)
      : 0n;
    const expectedCloseAmount =
      existingCloseSize < amountRaw ? existingCloseSize : amountRaw;
    const expectedOpenAmount = amountRaw - expectedCloseAmount;

    const requiredMarginRaw = this.initialMarginRequiredRaw(
      expectedOpenAmount,
      market.lastSettlementPrice,
      market,
    );
    const pnlBufferRaw = this.pnlBufferWorstCaseRaw(
      side,
      amountRaw,
      priceRaw,
      market,
    );
    const collateralLockRaw = requiredMarginRaw + pnlBufferRaw;

    const notionalRaw = this.futuresNotionalRaw(amountRaw, priceRaw, market);

    let fixedFeeRaw = 0n;
    let percentageFeeRaw = 0n;
    let fixedFeeTokenKey = '';
    let percentageFeeTokenKey = '';

    this.feeSvc.setQuoteParams({
      assetToken: ZERO,
      assetValue: notionalRaw,
      context: FEE_CONTEXT,
    });
    this.feeSvc.refreshFeeQuote();

    try {
      await this.waitForFeeQuote();
      const fee = this.feeSvc.feeQuote();

      if (fee?.fixedAmount && fee.fixedAmount > 0n) {
        fixedFeeRaw = fee.fixedAmount;
        fixedFeeTokenKey = canonicalTokenKey(fee.fixedToken);
      }

      if (fee?.percentageAmount && fee.percentageAmount > 0n) {
        percentageFeeRaw = fee.percentageAmount;
        percentageFeeTokenKey = canonicalTokenKey(fee.percentageToken);
      }
    } catch (e: any) {
      this.confirmError.set(e?.message ?? 'Fee quote failed');
    }

    const reqs: Array<{ tokenKey: string; label: string; raw: bigint }> = [
      {
        tokenKey: ETH_ADDRESS,
        label: 'Initial margin lock',
        raw: requiredMarginRaw,
      },
      {
        tokenKey: ETH_ADDRESS,
        label: 'P&L buffer lock',
        raw: pnlBufferRaw,
      },
    ];

    if (fixedFeeRaw > 0n && fixedFeeTokenKey) {
      reqs.push({
        tokenKey: fixedFeeTokenKey,
        label: 'Fixed Fee',
        raw: fixedFeeRaw,
      });
    }

    if (percentageFeeRaw > 0n && percentageFeeTokenKey) {
      reqs.push({
        tokenKey: percentageFeeTokenKey,
        label: 'Percentage Fee',
        raw: percentageFeeRaw,
      });
    }

    const rows = this.toRequirementRows(reqs);
    this.confirmRequirements.set(rows);
    this.confirmDisabled.set(rows.some((r) => !r.ok));

    const ethFeeTotalRaw =
      (fixedFeeTokenKey === n(ETH_ADDRESS) ? fixedFeeRaw : 0n) +
      (percentageFeeTokenKey === n(ETH_ADDRESS) ? percentageFeeRaw : 0n);

    const totalEthLockRaw = collateralLockRaw + ethFeeTotalRaw;

    const marginRatioBps =
      notionalRaw > 0n ? Number((requiredMarginRaw * 10000n) / notionalRaw) : 0;

    const leverageTimes =
      requiredMarginRaw > 0n
        ? Number(notionalRaw) / Number(requiredMarginRaw)
        : 0;

    this.confirmTitle.set(
      this.intent() === 'quote'
        ? 'Futures margin & fee preview'
        : 'Confirm futures order',
    );

    this.confirmLabel.set(this.intent() === 'quote' ? 'Close' : 'Place order');

    this.confirmFields.set([
      {
        label: 'Action',
        value: side === 0 ? 'Buy / Open Long' : 'Sell / Open Short',
      },
      {
        label: 'Market',
        value: market.ticker || mk,
      },
      {
        label: 'Market key',
        value: mk,
        tone: 'muted',
      },
      {
        label: 'Price',
        value: formatTokenAmount(priceRaw, oracleDecimals, paymentSymbol, { maxDecimals: 8, mode: 'scaled-small', compactFrom: 1_000_000 }),
      },
      {
        label: 'Amount',
        value: formatUnitsHuman(amountRaw, 18, { maxDecimals: 6, compactFrom: 1_000_000 }),
      },
      {
        label: 'Payment notional / fee base',
        value: formatTokenAmount(notionalRaw, 18, paymentSymbol, { maxDecimals: 6, compactFrom: 1_000_000 }),
      },
      {
        label: 'Expected close amount',
        value: formatUnitsHuman(expectedCloseAmount, 18, { maxDecimals: 6, compactFrom: 1_000_000 }),
        tone: expectedCloseAmount > 0n ? 'good' : 'muted',
      },
      {
        label: 'Expected open amount',
        value: formatUnitsHuman(expectedOpenAmount, 18, { maxDecimals: 6, compactFrom: 1_000_000 }),
      },
      {
        label: 'Initial margin lock',
        value: formatTokenAmount(requiredMarginRaw, 18, 'ETH', { maxDecimals: 6, compactFrom: 1_000_000 }),
        tone: 'good',
      },
      {
        label: 'P&L buffer lock',
        value: formatTokenAmount(pnlBufferRaw, 18, 'ETH', { maxDecimals: 6, compactFrom: 1_000_000 }),
        tone: pnlBufferRaw > 0n ? 'good' : 'muted',
      },
      {
        label: 'Total collateral lock',
        value: formatTokenAmount(collateralLockRaw, 18, 'ETH', { maxDecimals: 6, compactFrom: 1_000_000 }),
        tone: 'good',
      },
      {
        label: 'Payment token lock incl. ETH fees',
        value: formatTokenAmount(totalEthLockRaw, 18, 'ETH', { maxDecimals: 6, compactFrom: 1_000_000 }),
        tone: 'good',
      },
      {
        label: 'Fee context',
        value: FEE_CONTEXT,
        tone: 'muted',
      },
      {
        label: 'Margin Ratio',
        value: `${(marginRatioBps / 100).toFixed(2)}%`,
      },
      {
        label: 'Estimated Leverage',
        value: leverageTimes > 0 ? `${leverageTimes.toFixed(2)}x` : '—',
      },
      {
        label: 'Expiry timestamp sent',
        value: (() => {
          const selection = String(this.expirySec() ?? '').trim();
          return selection.startsWith('rel:') ? selection.replace('rel:', 'chain time + ') + 's' : resolveExpiryForContract(selection, null).toString();
        })(),
        tone: 'muted',
      },
      {
        label: 'Expiry confirmation',
        value: this.expiryPreviewLabel(),
        tone: 'muted',
      },
      {
        label: 'Routing',
        value: 'Via selected account contract',
        tone: 'muted',
      },
    ]);

    if (this.intent() === 'quote') {
      this.confirmFields.set(
        this.confirmFields().filter((field) => !field.label.toLowerCase().startsWith('expiry')),
      );
      this.pendingConfirmAction = null;
      this.confirmOpen.set(true);
      return;
    }

    this.pendingConfirmAction = async () => {
      return await this.actions.placeOrder({
        marketKey: mk,
        side,
        priceHuman: priceStr,
        amountHuman: amountStr,
        expiry,
      });
    };

    this.confirmOpen.set(true);
  }

  async submit(): Promise<boolean> {
    if (!this.pendingConfirmAction) return false;
    if (this.pending()) return false;

    this.pending.set(true);
    this.confirmError.set(null);
    this.txReceipt.pending(this.confirmTitle(), 'Waiting for wallet signature and on-chain confirmation...');

    try {
      const txHash = await this.pendingConfirmAction();
      this.pending.set(false);
      this.confirmDisabled.set(true);
      this.pendingConfirmAction = null;
      this.txReceipt.success('Transaction confirmed', typeof txHash === 'string' ? txHash : null);

      this.priceHuman.set('');
      this.amountHuman.set('');
      this.expirySec.set('');
      this.cancelOrderId.set('');
      return true;
    } catch (e: any) {
      this.pending.set(false);
      const message = e?.reason ?? e?.shortMessage ?? e?.message ?? 'Transaction failed';
      this.confirmError.set(message);
      this.txReceipt.error('Transaction failed', e, message);
      return false;
    }
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
