import { Component, signal, inject, computed, OnInit, resource } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
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
import { OrderBookStore } from '../../services/shared/orderbook/orderbook.store';
import { AssetWarningService, type AssetWarningStatus } from '../../services/shared/asset-warning.service';
import { TriggerService } from '../../services/shared/trigger.service';
import { FuturesOrderBookReadService } from '../../services/onchain/contracts/futures-orderbook-read.service';
import { OptionsOrderBookReadService } from '../../services/onchain/contracts/options-orderbook-read.service';
import { MarginOptionsReadService } from '../../services/onchain/contracts/margin-options-read.service';
import { BinaryOptionsReadService } from '../../services/onchain/contracts/binary-options-read.service';
import { LendingMarketReadService } from '../../services/onchain/contracts/lending-market-read.service';
import { norm } from '../../core/tokens/token-normalize';

import { ETH_ADDRESS } from '../../services/shared/main.tokens';
import { OrderFlowService } from '../../core/overlay/order-flow.service';
import { DepositWithdrawModalComponent } from '../../core/overlay/deposit-withdraw/deposit-withdraw-modal.component';
import type { TokenInfo } from '../../services/shared/token.service';

const NATIVE_SENTINEL = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './portfolio.component.html',
})
export class PortfolioComponent implements OnInit {
  showUSD = signal(true);

  readonly settings = inject(TradeSettingsService);

  private readonly portfolio = inject(PortfolioService);
  private readonly prices = inject(TokenPriceService);
  private readonly tokens = inject(TokenService);
  private readonly accounts = inject(AccountsChainService);
  private readonly router = inject(Router);
  private readonly flow = inject(OrderFlowService);
  private readonly futuresStore = inject(FuturesOrderBookStore);
  private readonly optionsStore = inject(OptionsOrderBookStore);
  private readonly marginOptionsStore = inject(MarginOptionsOrderBookStore);
  private readonly binaryOptionsStore = inject(BinaryOptionsOrderBookStore);
  private readonly nftSpotStore = inject(NftSpotOrderbookStore);
  private readonly tokenSpotStore = inject(OrderBookStore);
  private readonly warnings = inject(AssetWarningService);
  private readonly trigger = inject(TriggerService);
  private readonly futuresReads = inject(FuturesOrderBookReadService);
  private readonly optionsReads = inject(OptionsOrderBookReadService);
  private readonly marginOptionsReads = inject(MarginOptionsReadService);
  private readonly binaryOptionsReads = inject(BinaryOptionsReadService);
  private readonly lendingReads = inject(LendingMarketReadService);

  ngOnInit(): void {
    if (this.router.url.includes('assetsRightPanel')) {
      return;
    }

    void this.router.navigate(
      [
        '/app',
        {
          outlets: {
            primary: ['assets'],
            'right-panel': ['assetsRightPanel'],
          },
        },
      ],
      { replaceUrl: true },
    );
  }

  private normKey(addr: string): string {
    const a = (addr ?? '').trim().toLowerCase();
    if (a === 'eth' || a === NATIVE_SENTINEL) return ETH_ADDRESS.toLowerCase();
    return a;
  }



  readonly selectedAccountKey = computed(() => norm(this.settings.selectedAccountId() ?? ''));

  private readonly selectedFuturesOrdersResource = resource<number, { account: string; tick: number }>({
    params: () => ({
      account: this.selectedAccountKey(),
      tick: this.trigger.futuresOrderbookTick(),
    }),
    loader: async ({ params }) => {
      if (!params.account) return 0;
      const ids = await this.futuresReads.getUserOrderIds(params.account);
      const orders = await Promise.all(ids.map((id) => this.futuresReads.getOrder(id)));
      return orders.filter((order) => !!order && order.amount > 0n).length;
    },
  });

  private readonly selectedOptionsOrdersResource = resource<number, { account: string; tick: number }>({
    params: () => ({
      account: this.selectedAccountKey(),
      tick: this.trigger.optionsOrderbookTick(),
    }),
    loader: async ({ params }) => {
      if (!params.account) return 0;
      const ids = await this.optionsReads.getUserOrderIds(params.account);
      const orders = await Promise.all(ids.map((id) => this.optionsReads.getOrder(id)));
      return orders.filter((order) => !!order && order.size > order.filled).length;
    },
  });

  private readonly selectedMarginOptionsOrdersResource = resource<number, { account: string; marketHash: string; tick: number }>({
    params: () => ({
      account: this.selectedAccountKey(),
      marketHash: this.marginOptionsStore.activeMarkets().map((market) => market.marketKey).join('|'),
      tick: this.trigger.optionsOrderbookTick(),
    }),
    loader: async ({ params }) => {
      if (!params.account || !params.marketHash) return 0;
      let count = 0;
      for (const marketKey of params.marketHash.split('|').filter(Boolean)) {
        const [bids, asks] = await Promise.all([
          this.marginOptionsReads.getOpenOrders(marketKey, true),
          this.marginOptionsReads.getOpenOrders(marketKey, false),
        ]);
        count += [...bids, ...asks].filter((order) => norm(order.user) === params.account).length;
      }
      return count;
    },
  });

  private readonly selectedBinaryOptionsOrdersResource = resource<number, { account: string; marketHash: string; tick: number }>({
    params: () => ({
      account: this.selectedAccountKey(),
      marketHash: this.binaryOptionsStore.activeMarkets().map((market) => market.marketKey).join('|'),
      tick: this.trigger.optionsOrderbookTick(),
    }),
    loader: async ({ params }) => {
      if (!params.account || !params.marketHash) return 0;
      let count = 0;
      for (const marketKey of params.marketHash.split('|').filter(Boolean)) {
        const [bids, asks] = await Promise.all([
          this.binaryOptionsReads.getOpenOrders(marketKey, true),
          this.binaryOptionsReads.getOpenOrders(marketKey, false),
        ]);
        count += [...bids, ...asks].filter((order) => norm(order.user) === params.account).length;
      }
      return count;
    },
  });

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

  readonly trackedTokenCount = computed(
    () => this.main().length + this.whitelist().length + this.other().length,
  );

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

  readonly balanceEntryCount = computed(
    () => Object.keys(this.accountBalances() ?? {}).length,
  );


  readonly futuresPositionCount = computed(() => this.futuresStore.myPositions().length);
  readonly optionsPositionCount = computed(() => this.optionsStore.myPositions().length);
  readonly marginOptionsPositionCount = computed(() => this.marginOptionsStore.myPositions().length);
  readonly binaryOptionsPositionCount = computed(() => this.binaryOptionsStore.myPositions().length);
  readonly nftHoldingCount = computed(() => this.nftSpotStore.myNfts().length);

  readonly tokenSpotOrderCount = computed(() =>
    this.tokenSpotStore.books().reduce((sum, book) => sum + Number(book.myTotal ?? 0n), 0),
  );
  readonly nftSpotOrderCount = computed(() =>
    this.nftSpotStore.loadedMarkets().reduce((sum, market) => sum + Number(market.myOrders ?? 0), 0),
  );
  readonly futuresOrderCount = computed(() => this.selectedFuturesOrdersResource.value() ?? 0);
  readonly optionsOrderCount = computed(() => this.selectedOptionsOrdersResource.value() ?? 0);
  readonly marginOptionsOrderCount = computed(() => this.selectedMarginOptionsOrdersResource.value() ?? 0);
  readonly binaryOptionsOrderCount = computed(() => this.selectedBinaryOptionsOrdersResource.value() ?? 0);

  readonly lendingSnapshot = computed(() => this.lendingSnapshotResource.value() ?? { debts: [], pendingDebts: [], bonds: [], orders: [] });
  readonly lendingBorrowedAmount = computed(() => {
    const snapshot = this.lendingSnapshot();
    return snapshot.debts.reduce((sum, row) => sum + row.principal, 0n)
      + snapshot.pendingDebts.reduce((sum, row) => sum + row.pendingPrincipal, 0n);
  });
  readonly lendingLentAmount = computed(() =>
    this.lendingSnapshot().bonds.reduce((sum, row) => sum + row.faceValue, 0n),
  );
  readonly lendingOrderCount = computed(() => this.lendingSnapshot().orders.length);

  readonly totalPositionCount = computed(
    () =>
      this.futuresPositionCount() +
      this.optionsPositionCount() +
      this.marginOptionsPositionCount() +
      this.binaryOptionsPositionCount(),
  );

  private expirySecondsFromPosition(position: any): number | null {
    const raw =
      position?.market?.expiry ??
      position?.market?.optionExpiry ??
      position?.derived?.optionExpiry ??
      position?.expiry ??
      position?.maturity ??
      null;

    if (raw == null) return null;
    const value = typeof raw === 'bigint' ? Number(raw) : Number(raw);
    return Number.isFinite(value) && value > 0 ? value : null;
  }

  private expiringSoon(positions: any[]): number {
    const now = Date.now() / 1000;
    const week = 7 * 24 * 60 * 60;
    return positions.filter((position) => {
      const expiry = this.expirySecondsFromPosition(position);
      return expiry != null && expiry >= now && expiry <= now + week;
    }).length;
  }

  readonly futuresExpiringSoon = computed(() => this.expiringSoon(this.futuresStore.myPositions()));
  readonly optionsExpiringSoon = computed(() => this.expiringSoon(this.optionsStore.myPositions()));
  readonly marginOptionsExpiringSoon = computed(() => this.expiringSoon(this.marginOptionsStore.myPositions()));
  readonly binaryOptionsExpiringSoon = computed(() => this.expiringSoon(this.binaryOptionsStore.myPositions()));

  readonly expiringSoonCount = computed(
    () =>
      this.futuresExpiringSoon() +
      this.optionsExpiringSoon() +
      this.marginOptionsExpiringSoon() +
      this.binaryOptionsExpiringSoon(),
  );

  private expiredCount(positions: any[]): number {
    const now = Date.now() / 1000;
    return positions.filter((position) => {
      const expiry = this.expirySecondsFromPosition(position);
      return expiry != null && expiry < now;
    }).length;
  }

  private reclaimableCount(positions: any[]): number {
    return positions.filter((position) => Boolean(position?.canReclaim)).length;
  }

  readonly futuresExpired = computed(() => this.expiredCount(this.futuresStore.myPositions()));
  readonly optionsExpired = computed(() => this.expiredCount(this.optionsStore.myPositions()));
  readonly marginOptionsExpired = computed(() => this.expiredCount(this.marginOptionsStore.myPositions()));
  readonly binaryOptionsExpired = computed(() => this.expiredCount(this.binaryOptionsStore.myPositions()));

  readonly optionsReclaimable = computed(() => this.reclaimableCount(this.optionsStore.myPositions()));
  readonly marginOptionsReclaimable = computed(() => this.reclaimableCount(this.marginOptionsStore.myPositions()));
  readonly binaryOptionsReclaimable = computed(() => this.reclaimableCount(this.binaryOptionsStore.myPositions()));

  warningClass(status: AssetWarningStatus): string {
    return `is-${status.severity === 'attention' ? 'attention' : status.severity}`;
  }

  readonly assetOverviewRows = computed(() => [
    {
      id: 'tokens',
      label: 'Tokens',
      description: 'Vault balances and available token collateral.',
      exposure: `${this.balanceEntryCount()} balances`,
      orders: this.tokenSpotOrderCount(),
      warning: this.warnings.status(),
      primaryLabel: 'Tokens',
      primaryRoute: ['/app', { outlets: { primary: ['erc20trade'], 'right-panel': ['erc20tradeRightPanel'] } }],
      primaryQueryParams: { tokenSpotView: 'tokens' },
      ordersLabel: 'Orders',
      ordersRoute: ['/app', { outlets: { primary: ['erc20trade'], 'right-panel': ['erc20tradeRightPanel'] } }],
      ordersQueryParams: { tokenSpotView: 'orders' },
    },
    {
      id: 'nfts',
      label: 'NFTs',
      description: 'Owned NFTs visible to the NFT spot workspace.',
      exposure: `${this.nftHoldingCount()} NFTs`,
      orders: this.nftSpotOrderCount(),
      warning: this.warnings.status(),
      primaryLabel: 'NFTs',
      primaryRoute: ['/app', { outlets: { primary: ['nftspottrade'], 'right-panel': ['nftspottradeRightPanel'] } }],
      primaryQueryParams: { nftSpotView: 'nfts' },
      ordersLabel: 'Orders',
      ordersRoute: ['/app', { outlets: { primary: ['nftspottrade'], 'right-panel': ['nftspottradeRightPanel'] } }],
      ordersQueryParams: { nftSpotView: 'orders' },
    },
    {
      id: 'futures',
      label: 'Futures',
      description: 'Long and short futures exposure by market.',
      exposure: `${this.futuresPositionCount()} positions`,
      orders: this.futuresOrderCount(),
      warning: this.warnings.status({
        expiringSoon: this.futuresExpiringSoon(),
        expired: this.futuresExpired(),
      }),
      primaryLabel: 'Positions',
      primaryRoute: ['/app', { outlets: { primary: ['futurestrade'], 'right-panel': ['futurestradeRightPanel'] } }],
      primaryQueryParams: { futuresView: 'positions' },
      ordersLabel: 'Orders',
      ordersRoute: ['/app', { outlets: { primary: ['futurestrade'], 'right-panel': ['futurestradeRightPanel'] } }],
      ordersQueryParams: { futuresView: 'orders' },
    },
    {
      id: 'options',
      label: 'Options',
      description: 'Holder and writer option exposure.',
      exposure: `${this.optionsPositionCount()} positions`,
      orders: this.optionsOrderCount(),
      warning: this.warnings.status({
        expiringSoon: this.optionsExpiringSoon(),
        expired: this.optionsExpired(),
        reclaimable: this.optionsReclaimable(),
      }),
      primaryLabel: 'Positions',
      primaryRoute: ['/app', { outlets: { primary: ['optionstrade'], 'right-panel': ['optionstradeRightPanel'] } }],
      primaryQueryParams: { optionsView: 'positions' },
      ordersLabel: 'Orders',
      ordersRoute: ['/app', { outlets: { primary: ['optionstrade'], 'right-panel': ['optionstradeRightPanel'] } }],
      ordersQueryParams: { optionsView: 'orders' },
    },
    {
      id: 'margin-options',
      label: 'Margin Options',
      description: 'Margin option holder and writer exposure.',
      exposure: `${this.marginOptionsPositionCount()} positions`,
      orders: this.marginOptionsOrderCount(),
      warning: this.warnings.status({
        expiringSoon: this.marginOptionsExpiringSoon(),
        expired: this.marginOptionsExpired(),
        reclaimable: this.marginOptionsReclaimable(),
      }),
      primaryLabel: 'Positions',
      primaryRoute: ['/app', { outlets: { primary: ['marginoptionstrade'], 'right-panel': ['marginoptionstradeRightPanel'] } }],
      primaryQueryParams: { marginOptionsView: 'positions' },
      ordersLabel: 'Orders',
      ordersRoute: ['/app', { outlets: { primary: ['marginoptionstrade'], 'right-panel': ['marginoptionstradeRightPanel'] } }],
      ordersQueryParams: { marginOptionsView: 'orders' },
    },
    {
      id: 'binary-options',
      label: 'Binary Options',
      description: 'Holder payout and writer margin exposure.',
      exposure: `${this.binaryOptionsPositionCount()} positions`,
      orders: this.binaryOptionsOrderCount(),
      warning: this.warnings.status({
        expiringSoon: this.binaryOptionsExpiringSoon(),
        expired: this.binaryOptionsExpired(),
        reclaimable: this.binaryOptionsReclaimable(),
      }),
      primaryLabel: 'Positions',
      primaryRoute: ['/app', { outlets: { primary: ['binaryoptionstrade'], 'right-panel': ['binaryoptionstradeRightPanel'] } }],
      primaryQueryParams: { binaryOptionsView: 'positions' },
      ordersLabel: 'Orders',
      ordersRoute: ['/app', { outlets: { primary: ['binaryoptionstrade'], 'right-panel': ['binaryoptionstradeRightPanel'] } }],
      ordersQueryParams: { binaryOptionsView: 'orders' },
    },
    {
      id: 'lending',
      label: 'Lending',
      description: 'Loans, bonds, and ETH lending market exposure.',
      exposure: `${this.formatEthAmount(this.lendingBorrowedAmount())} borrowed · ${this.formatEthAmount(this.lendingLentAmount())} lent`,
      orders: this.lendingOrderCount(),
      warning: this.warnings.status(),
      primaryLabel: 'Loans',
      primaryRoute: ['/app', { outlets: { primary: ['lending-ob'], 'right-panel': ['lendingObRightPanel'] } }],
      primaryQueryParams: { lendingView: 'loans' },
      ordersLabel: 'Orders',
      ordersRoute: ['/app', { outlets: { primary: ['lending-ob'], 'right-panel': ['lendingObRightPanel'] } }],
      ordersQueryParams: { lendingView: 'orders' },
    },
  ]);

  readonly tokenPrices = (addr: string) => this.prices.tokenPrices(addr);


  openTokenAction(token: TokenInfo, intent: 'deposit' | 'withdraw'): void {
    this.flow.open(DepositWithdrawModalComponent, {
      intent,
      asset: token.address === ETH_ADDRESS.toLowerCase() ? 'ETH' : 'TOKEN',
      tokenAddress: token.address,
      tokenSymbol: token.symbol,
      tokenDecimals: token.decimals,
    });
  }

  actionLabel(intent: 'deposit' | 'withdraw', token: TokenInfo): string {
    return `${intent === 'deposit' ? 'Deposit' : 'Withdraw'} ${token.symbol}`;
  }

  toggleView() {
    this.showUSD.update((v) => !v);
  }

  refreshBalances(): void {
    this.portfolio.refreshPortfolio();
  }

  lastRefreshedText(): string {
    const at = this.lastRefreshedAt();
    return at ? at.toLocaleTimeString() : 'Not refreshed yet';
  }

  private getOraclePrice(tokenAddress: string): number {
    const info = this.tokenPrices(tokenAddress)();
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

  formatValue(amount: string, price?: number | null): string {
    const amt = Number(amount);
    if (!Number.isFinite(amt)) return '—';

    if (this.showUSD() && price != null) return '$' + (amt * price).toFixed(2);
    return amt.toFixed(4);
  }

  getFormattedTokenValue(tokenAddress: string, decimals = 18): string {
    const balances = this.accountBalances();
    const key = this.normKey(tokenAddress);

    const entry = balances?.[key];
    const raw = entry?.balance ?? 0n;

    const price = this.getOraclePrice(tokenAddress);
    const human = ethers.formatUnits(raw, decimals);
    return this.formatValue(human, price);
  }

  getFormattedLockedValue(tokenAddress: string, decimals = 18): string {
    const balances = this.accountBalances();
    const key = this.normKey(tokenAddress);

    const entry = balances?.[key];
    const raw = entry?.locked ?? 0n;

    const price = this.getOraclePrice(tokenAddress);
    const human = ethers.formatUnits(raw, decimals);
    return this.formatValue(human, price);
  }

  getFormattedAvailableValue(tokenAddress: string, decimals = 18): string {
    const balances = this.accountBalances();
    const key = this.normKey(tokenAddress);

    const entry = balances?.[key];
    const balance = entry?.balance ?? 0n;
    const locked = entry?.locked ?? 0n;
    const available = balance - locked;

    const price = this.getOraclePrice(tokenAddress);
    const human = ethers.formatUnits(available, decimals);
    return this.formatValue(human, price);
  }

  readonly displayTokens = computed(() => {
    const balances = this.accountBalances() ?? {};
    return Object.keys(balances).filter((k) => k !== ETH_ADDRESS.toLowerCase());
  });

  getOraclePriceText(address: string): string {
    const info = this.tokenPrices(address)();
    const p = info?.prices?.oracle?.price ?? 0;

    if (p == null || !Number.isFinite(p)) return '—';
    return `$${p}`;
  }

  getOracleChangePercent(address: string): string {
    const info = this.tokenPrices(address)();
    if (!info) return '—';

    const diff = info.lastChange.oracle ?? 0;
    const current = info.prices.oracle?.price ?? 0;

    if (current === 0 || diff === 0 || isNaN(current) || isNaN(diff))
      return '—';

    const previous = current - diff;
    if (previous === 0) return '—';

    const percent = (diff / previous) * 100;
    const formatted = percent.toFixed(2);
    const prefix = diff > 0 ? '+' : '';
    return `${prefix}${formatted}%`;
  }

  getOracleChangeClass(address: string): string {
    const info = this.tokenPrices(address)();
    const diff = info?.lastChange?.oracle ?? 0;
    if (!Number.isFinite(diff) || diff === 0) return '';
    return diff > 0 ? 'text-up' : 'text-down';
  }
}
