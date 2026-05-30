import { Component, signal, inject, computed, resource } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ethers } from 'ethers';

import { TradeSettingsService } from '../../services/shared/trade-settings.service';
import { PortfolioService } from '../../services/onchain/portfolio.service';
import { TokenPriceService } from '../../services/shared/token-price.service';
import { TokenService } from '../../services/shared/token.service';
import { AccountsChainService } from '../../services/onchain/accounts.service';
import { FuturesOrderBookStore } from '../../services/shared/futures-orderbook/futures-orderbook.store';
import { OptionsOrderBookStore } from '../../services/shared/options-orderbook/options-orderbook.store';
import { MarginOptionsOrderBookStore } from '../../services/shared/margin-options-orderbook/margin-options-orderbook.store';
import { BinaryOptionsOrderBookStore } from '../../services/shared/binary-options-orderbook/binary-options-orderbook.store';
import { NftSpotOrderbookStore } from '../../services/shared/nft-spot-orderbook/nft-spot-orderbook.store';
import { TriggerService } from '../../services/shared/trigger.service';
import { LendingMarketReadService } from '../../services/onchain/contracts/lending-market-read.service';
import { norm } from '../../core/tokens/token-normalize';

import { ETH_ADDRESS } from '../../services/shared/main.tokens';
import type { TokenInfo } from '../../services/shared/token.service';

const NATIVE_SENTINEL = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './portfolio.component.html',
  styleUrl: './portfolio.component.css',
})
export class PortfolioComponent {
  readonly settings = inject(TradeSettingsService);

  private readonly portfolio = inject(PortfolioService);
  private readonly prices = inject(TokenPriceService);
  private readonly tokens = inject(TokenService);
  private readonly accounts = inject(AccountsChainService);
  private readonly futuresStore = inject(FuturesOrderBookStore);
  private readonly optionsStore = inject(OptionsOrderBookStore);
  private readonly marginOptionsStore = inject(MarginOptionsOrderBookStore);
  private readonly binaryOptionsStore = inject(BinaryOptionsOrderBookStore);
  private readonly nftSpotStore = inject(NftSpotOrderbookStore);
  private readonly trigger = inject(TriggerService);
  private readonly lendingReads = inject(LendingMarketReadService);

  private normKey(addr: string): string {
    const a = (addr ?? '').trim().toLowerCase();
    if (a === 'eth' || a === NATIVE_SENTINEL) return ETH_ADDRESS.toLowerCase();
    return a;
  }

  readonly selectedAccountKey = computed(() => norm(this.settings.selectedAccountId() ?? ''));

  private readonly lendingSnapshotResource = resource({
    params: () => ({
      account: this.selectedAccountKey(),
      tick: this.trigger.lendingOrderbookTick(),
    }),
    loader: async ({ params }) => this.lendingReads.loadAccountSnapshot(params.account),
  });

  readonly accountBalances = this.portfolio.accountBalances;
  readonly allBalances = this.portfolio.allBalances;

  readonly portfolioStatus = this.portfolio.readStatus;
  readonly portfolioError = this.portfolio.readError;
  readonly lastRefreshedAt = this.portfolio.lastRefreshedAt;

  readonly isLoading = computed(() => this.portfolioStatus() === 'pending');

  readonly selectedAccountLabel = computed(() => {
    const account = this.settings.selectedAccountId();
    return account ? this.accounts.accountLabel(account) : 'No account selected';
  });

  readonly main = this.tokens.main;
  readonly whitelist = this.tokens.whitelist;
  readonly other = this.tokens.other;

  readonly tokenMetaByAddress = computed(() => {
    const map = new Map<string, TokenInfo>();
    for (const token of [...this.main(), ...this.whitelist(), ...this.other()]) {
      map.set(this.normKey(token.address), token);
    }
    return map;
  });

  readonly allAccountTokenValue = computed(() => {
    const all = this.allBalances() ?? {};
    let total = 0;

    for (const balances of Object.values(all)) {
      for (const [address, entry] of Object.entries(balances ?? {})) {
        const meta = this.tokenMetaByAddress().get(this.normKey(address));
        const decimals = meta?.decimals ?? 18;
        const price = this.getOraclePrice(address);
        if (!Number.isFinite(price) || price <= 0) continue;

        const amount = Number(ethers.formatUnits(entry?.balance ?? 0n, decimals));
        if (Number.isFinite(amount)) total += amount * price;
      }
    }

    return total;
  });

  readonly unvaluedTokenCount = computed(() => {
    const all = this.allBalances() ?? {};
    const tokens = new Set<string>();

    for (const balances of Object.values(all)) {
      for (const [address, entry] of Object.entries(balances ?? {})) {
        const balance = entry?.balance ?? 0n;
        const locked = entry?.locked ?? 0n;
        if (balance <= 0n && locked <= 0n) continue;

        const price = this.getOraclePrice(address);
        if (!Number.isFinite(price) || price <= 0) tokens.add(this.normKey(address));
      }
    }

    return tokens.size;
  });

  readonly allAccountTokenValueText = computed(() =>
    `$${this.allAccountTokenValue().toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
  );

  readonly selectedTokenStats = computed(() => {
    const balances = this.accountBalances() ?? {};
    let tokenCount = 0;
    let valuedTokenCount = 0;
    let unvaluedTokenCount = 0;
    let ethValue = 0;

    for (const [address, entry] of Object.entries(balances)) {
      const balance = entry?.balance ?? 0n;
      const locked = entry?.locked ?? 0n;
      if (balance <= 0n && locked <= 0n) continue;

      tokenCount += 1;
      const meta = this.tokenMetaByAddress().get(this.normKey(address));
      const decimals = meta?.decimals ?? 18;
      const price = this.getOraclePrice(address);

      if (Number.isFinite(price) && price > 0) {
        const amount = Number(ethers.formatUnits(balance + locked, decimals));
        if (Number.isFinite(amount)) {
          ethValue += amount * price;
          valuedTokenCount += 1;
          continue;
        }
      }

      unvaluedTokenCount += 1;
    }

    return { tokenCount, valuedTokenCount, unvaluedTokenCount, ethValue };
  });

  readonly selectedTokenEthValueText = computed(() =>
    `${this.selectedTokenStats().ethValue.toLocaleString(undefined, { maximumFractionDigits: 4 })} ETH`,
  );

  readonly balanceEntryCount = computed(
    () => Object.keys(this.accountBalances() ?? {}).length,
  );

  readonly futuresPositionCount = computed(() => this.futuresStore.myPositions().length);
  readonly optionsPositionCount = computed(() => this.optionsStore.myPositions().length);
  readonly marginOptionsPositionCount = computed(() => this.marginOptionsStore.myPositions().length);
  readonly binaryOptionsPositionCount = computed(() => this.binaryOptionsStore.myPositions().length);
  readonly nftHoldingCount = computed(() => this.nftSpotStore.myNfts().length);

  readonly lendingSnapshot = computed(() => this.lendingSnapshotResource.value() ?? { debts: [], pendingDebts: [], bonds: [], orders: [] });
  readonly lendingBorrowedAmount = computed(() => {
    const snapshot = this.lendingSnapshot();
    return snapshot.debts.reduce((sum, row) => sum + row.principal, 0n)
      + snapshot.pendingDebts.reduce((sum, row) => sum + row.pendingPrincipal, 0n);
  });
  readonly lendingLentAmount = computed(() =>
    this.lendingSnapshot().bonds.reduce((sum, row) => sum + row.faceValue, 0n),
  );

  readonly totalPositionCount = computed(
    () =>
      this.futuresPositionCount() +
      this.optionsPositionCount() +
      this.marginOptionsPositionCount() +
      this.binaryOptionsPositionCount(),
  );

  readonly derivativeHoldingPositionCount = computed(() => {
    const futures = this.futuresStore.myPositions().filter(
      (row) => row.longSize > 0n || row.shortSize > 0n,
    ).length;
    const options = this.optionsStore.myPositions().length;
    const marginHolders = this.marginOptionsStore.myPositions().filter(
      (row) => row.holderAvailable > 0n,
    ).length;
    const binaryHolders = this.binaryOptionsStore.myPositions().filter(
      (row) => row.holderClaimable > 0n,
    ).length;

    return futures + options + marginHolders + binaryHolders;
  });

  readonly derivativeMarginPositionCount = computed(() => {
    const futures = this.futuresStore.myPositions().filter((row) => row.margin > 0n).length;
    const marginWriters = this.marginOptionsStore.myPositions().filter(
      (row) => row.writer.lockedMargin > row.writer.paidOut,
    ).length;
    const binaryWriters = this.binaryOptionsStore.myPositions().filter(
      (row) => row.writerMargin > 0n,
    ).length;

    return futures + marginWriters + binaryWriters;
  });

  readonly derivativeTotalMargin = computed(() => {
    const futures = this.futuresStore.myPositions().reduce((sum, row) => sum + row.margin, 0n);
    const marginOptions = this.marginOptionsStore.myPositions().reduce((sum, row) => {
      const reclaimable = row.writer.lockedMargin > row.writer.paidOut
        ? row.writer.lockedMargin - row.writer.paidOut
        : 0n;
      return sum + reclaimable;
    }, 0n);
    const binary = this.binaryOptionsStore.myPositions().reduce(
      (sum, row) => sum + row.writerMargin,
      0n,
    );

    return futures + marginOptions + binary;
  });

  readonly lendingBorrowPositionCount = computed(() => {
    const snapshot = this.lendingSnapshot();
    return snapshot.debts.length + snapshot.pendingDebts.length;
  });

  readonly lendingLendPositionCount = computed(() => this.lendingSnapshot().bonds.length);

  readonly assetOverviewRows = computed(() => [
    {
      id: 'tokens',
      kind: 'Balance',
      label: 'Tokens',
      description: 'Token balances in the selected account, grouped by valuation availability.',
      primaryLabel: 'Tokens with ETH value',
      primaryValue: `${this.selectedTokenStats().valuedTokenCount} · ${this.selectedTokenEthValueText()}`,
      secondaryLabel: 'Tokens without value',
      secondaryValue: `${this.selectedTokenStats().unvaluedTokenCount}`,
    },
    {
      id: 'nfts',
      kind: 'Collectibles',
      label: 'NFTs',
      description: 'NFT holdings visible to the selected account, separate from fungible balances.',
      primaryLabel: 'NFTs',
      primaryValue: `${this.nftHoldingCount()}`,
      secondaryLabel: '',
      secondaryValue: '',
    },
    {
      id: 'holding-derivatives',
      kind: 'Derivative',
      label: 'Derivative holdings',
      description: 'Open holder-side derivative exposure for the selected account.',
      primaryLabel: 'Holding positions',
      primaryValue: `${this.derivativeHoldingPositionCount()}`,
      secondaryLabel: '',
      secondaryValue: '',
    },
    {
      id: 'margin-derivatives',
      kind: 'Margin',
      label: 'Derivative margin',
      description: 'Open margin-side derivative exposure for the selected account.',
      primaryLabel: 'Margin positions',
      primaryValue: `${this.derivativeMarginPositionCount()}`,
      secondaryLabel: 'Total margin',
      secondaryValue: this.formatEthAmount(this.derivativeTotalMargin()),
    },
    {
      id: 'lending-borrow',
      kind: 'Credit',
      label: 'Borrowing',
      description: 'Debt exposure for the selected account.',
      primaryLabel: 'Borrow positions',
      primaryValue: `${this.lendingBorrowPositionCount()}`,
      secondaryLabel: 'Borrowed amount',
      secondaryValue: this.formatEthAmount(this.lendingBorrowedAmount()),
    },
    {
      id: 'lending-lend',
      kind: 'Credit',
      label: 'Lending',
      description: 'Bond/lender exposure for the selected account.',
      primaryLabel: 'Lend positions',
      primaryValue: `${this.lendingLendPositionCount()}`,
      secondaryLabel: 'Lent amount',
      secondaryValue: this.formatEthAmount(this.lendingLentAmount()),
    },
  ]);

  refreshBalances(): void {
    this.portfolio.refreshPortfolio();
  }

  lastRefreshedText(): string {
    const at = this.lastRefreshedAt();
    return at ? at.toLocaleTimeString() : 'Not refreshed yet';
  }

  private getOraclePrice(tokenAddress: string): number {
    const info = this.prices.tokenPrices(tokenAddress)();
    const p = info?.prices?.oracle?.price || 0;

    return Number.isFinite(p) ? p : 0;
  }

  formatEthAmount(value: bigint): string {
    try {
      const amount = Number(ethers.formatEther(value ?? 0n));
      if (!Number.isFinite(amount)) return '0 ETH';
      return `${amount.toLocaleString(undefined, { maximumFractionDigits: 4 })} ETH`;
    } catch {
      return '0 ETH';
    }
  }
}
