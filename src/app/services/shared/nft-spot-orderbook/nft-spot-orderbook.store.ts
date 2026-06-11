import { Injectable, computed, inject, resource, signal } from '@angular/core';
import { ethers } from 'ethers';
import { formatUnitsHuman, formatTokenAmount, formatDecimal } from '../../../core/format/number-format';
import { stableComputed, stableResourceValue, structuralEqual } from '../../../core/signals/stable-resource';

import { norm } from '../../../core/tokens/token-normalize';
import { MarketDetailItem } from '../../../shared/orderbook';
import { NftSpotChainMarket, NftSpotChainOrder, NftSpotOrderBookReadService, NftSpotVaultNft, NftTokenMetadata } from '../../onchain/contracts/nft-spot-orderbook-read.service';
import { TokenService } from '../token.service';
import { TradeSettingsService } from '../trade-settings.service';
import { TriggerService } from '../trigger.service';

export type NftSpotSide = 'bid' | 'ask';

export interface NftSpotMarket {
  key: string;
  collection: string;
  collectionAddress: string;
  tokenId: string;
  quoteToken: string;
  quoteSymbol: string;
  quoteVolume: string;
  metadataName: string;
  metadataDescription: string;
  imageUrl: string | null;
  tokenUri: string | null;
  metadataUri: string | null;
  externalUrl: string | null;
  attributesSummary: string;
  floorHint: string;
  bestBid: string;
  bestAsk: string;
  totalOrders: number;
  myOrders: number;
  status: 'Active' | 'Paused';
  expiresAt: string;
  chain: NftSpotChainMarket;
}

export interface NftSpotOwnedNft {
  key: string;
  collection: string;
  collectionAddress: string;
  tokenId: string;
  status: 'Available' | 'Locked';
  locked: boolean;
  metadataName: string;
  metadataDescription: string;
  imageUrl: string | null;
  tokenUri: string | null;
  metadataUri: string | null;
  externalUrl: string | null;
  attributesSummary: string;
  openAsk: NftSpotOrder | null;
  chain: NftSpotVaultNft;
}

export interface NftSpotOrder {
  id: string;
  side: NftSpotSide;
  price: string;
  maker: string;
  isMine: boolean;
  expiresAt: string;
  marketKey: string;
  nftLabel: string;
  acceptDisabledReason: string | null;
  raw: NftSpotChainOrder;
}

type LoadedMarket = NftSpotMarket & { bids: NftSpotOrder[]; asks: NftSpotOrder[] };

function shortAddress(address: string): string {
  if (!address) return '—';
  return address.length <= 12 ? address : `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function marketKey(market: NftSpotChainMarket): string {
  return `${norm(market.nft)}_${market.tokenId.toString()}_${norm(market.quoteToken)}`;
}

function formatDuration(expiry: bigint): string {
  if (expiry === 0n) return 'Contract default';

  const now = BigInt(Math.floor(Date.now() / 1000));
  if (expiry <= now) return 'Expired';

  let seconds = Number(expiry - now);
  const days = Math.floor(seconds / 86400);
  seconds -= days * 86400;
  const hours = Math.floor(seconds / 3600);
  seconds -= hours * 3600;
  const minutes = Math.floor(seconds / 60);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

@Injectable({ providedIn: 'root' })
export class NftSpotOrderbookStore {
  private readonly reads = inject(NftSpotOrderBookReadService);
  private readonly tokens = inject(TokenService);
  private readonly settings = inject(TradeSettingsService);
  private readonly trigger = inject(TriggerService);

  readonly search = signal('');
  readonly myMarketsOnly = signal(false);
  readonly marketOffset = signal(0);
  readonly marketLimit = signal(25);
  readonly myOrdersOnly = signal(false);
  readonly myNftsOnlyAvailable = signal(false);
  readonly showAllRows = signal(false);
  readonly ladderFocus = signal(5);
  readonly pinnedMarketKey = signal<string | null>(null);
  readonly selectedMarketKey = signal<string | null>(null);

  readonly activeAccount = computed(() => norm(this.settings.selectedAccountId() ?? ''));

  private readonly _myNftsRes = resource<NftSpotOwnedNft[], { tick: number; account: string }>({
    params: () => ({ tick: this.trigger.orderbookTick(), account: this.activeAccount() }),
    loader: async ({ params }) => {
      if (!params.account) return [];
      const nfts = await this.reads.getVaultNfts(params.account);
      return Promise.all(nfts.map((nft) => this.mapOwnedNft(nft)));
    },
  });

  private readonly _stableMyNfts = stableResourceValue(() => this._myNftsRes.value(), [] as NftSpotOwnedNft[], { resetKey: () => this.activeAccount(), equal: structuralEqual });

  readonly myNfts = stableComputed(() => {
    const onlyAvailable = this.myNftsOnlyAvailable();
    return this._stableMyNfts().filter((nft) => !onlyAvailable || !nft.locked);
  });
  readonly myNftsStatus = computed(() => this._myNftsRes.status());
  readonly myNftsError = computed(() => this._myNftsRes.error() ?? null);

  private readonly _marketsRes = resource<LoadedMarket[], { tick: number; account: string }>({
    params: () => ({ tick: this.trigger.orderbookTick(), account: this.activeAccount() }),
    loader: async ({ params }) => {
      const chainMarkets = await this.reads.getActiveMarkets(100);
      const loaded = await Promise.all(
        chainMarkets.map(async (chainMarket) => this.loadMarket(chainMarket, params.account)),
      );
      return loaded.filter(Boolean) as LoadedMarket[];
    },
  });

  private readonly _stableLoadedMarkets = stableResourceValue(() => this._marketsRes.value(), [] as LoadedMarket[], { resetKey: () => this.activeAccount(), equal: structuralEqual });

  readonly loadedMarkets = stableComputed(() => this._stableLoadedMarkets());
  readonly status = computed(() => this._marketsRes.status());
  readonly error = computed(() => this._marketsRes.error() ?? null);

  readonly markets = stableComputed(() => {
    const term = this.search().trim().toLowerCase();
    return this.loadedMarkets().filter((market) => {
      if (this.myMarketsOnly() && market.myOrders <= 0) return false;
      if (!term) return true;
      return [
        market.collection,
        market.collectionAddress,
        market.tokenId,
        market.quoteSymbol,
        market.quoteToken,
      ].some((value) => value.toLowerCase().includes(term));
    });
  });

  readonly visibleMarkets = stableComputed(() => {
    const start = Math.max(0, Number(this.marketOffset() || 0));
    const limit = Math.max(1, Number(this.marketLimit() || 25));
    return this.markets().slice(start, start + limit);
  });

  readonly selectedMarket = computed(() => {
    const key = this.selectedMarketKey();
    return this.loadedMarkets().find((market) => market.key === key) ?? null;
  });

  readonly pinnedMarket = computed(() => {
    const key = this.pinnedMarketKey();
    return this.loadedMarkets().find((market) => market.key === key) ?? null;
  });

  readonly visibleOrders = stableComputed(() => {
    const market = this.selectedMarket();
    if (!market) return [];
    const orders = [...market.bids, ...market.asks];
    return this.myOrdersOnly() ? orders.filter((order) => order.isMine) : orders;
  });

  readonly myOrders = stableComputed(() =>
    this.loadedMarkets()
      .flatMap((market) => [...market.bids, ...market.asks])
      .filter((order) => order.isMine),
  );

  readonly bidOrders = stableComputed(() => this.visibleOrders().filter((order) => order.side === 'bid'));
  readonly askOrders = stableComputed(() => this.visibleOrders().filter((order) => order.side === 'ask'));

  readonly pairedRows = stableComputed(() => {
    const bids = this.bidOrders();
    const asks = this.askOrders();
    const size = Math.max(bids.length, asks.length);
    return Array.from({ length: size }, (_, index) => ({ bid: bids[index] ?? null, ask: asks[index] ?? null }));
  });

  readonly focusRows = stableComputed(() => this.pairedRows().slice(0, this.ladderFocus()));
  readonly restRows = stableComputed(() => this.showAllRows() ? this.pairedRows().slice(this.ladderFocus()) : []);

  readonly marketDetailItems = stableComputed<MarketDetailItem[]>(() => {
    const market = this.pinnedMarket() ?? this.selectedMarket();
    return market ? this.marketDetailItemsFor(market) : [];
  });

  marketDetailItemsFor(market: NftSpotMarket): MarketDetailItem[] {
    return [
      { label: 'NFT', value: `${market.collection} #${market.tokenId}` },
      ...(market.metadataName ? [{ label: 'Name', value: market.metadataName }] : []),
      ...(market.metadataDescription ? [{ label: 'Description', value: market.metadataDescription }] : []),
      ...(market.externalUrl ? [{ label: 'External link', value: market.externalUrl, mono: true, fullWidth: true }] : []),
      ...(market.metadataUri ? [{ label: 'Metadata URI', value: market.metadataUri, mono: true, fullWidth: true }] : []),
      ...(market.attributesSummary ? [{ label: 'Attributes', value: market.attributesSummary }] : []),
      { label: 'Quote', value: market.quoteSymbol },
      { label: 'Open quote volume', value: market.quoteVolume },
      { label: 'Best bid', value: market.bestBid },
      { label: 'Best ask', value: market.bestAsk },
      { label: 'Orders', value: market.totalOrders },
      { label: 'My orders', value: market.myOrders },
      { label: 'Collection', value: market.collectionAddress, mono: true, copyable: true, fullWidth: true },
      { label: 'Quote token', value: market.quoteToken, mono: true, copyable: true, fullWidth: true },
      ...(market.tokenUri ? [{ label: 'Token URI', value: market.tokenUri, mono: true, fullWidth: true }] : []),
      { label: 'Expiry', value: market.expiresAt },
    ];
  }

  readonly selectedOrderDetailItems = (order: NftSpotOrder | null): MarketDetailItem[] => {
    if (!order) return [];
    return [
      { label: 'Order ID', value: order.id, mono: true },
      { label: 'Side', value: order.side },
      { label: 'NFT', value: order.nftLabel },
      { label: 'Price', value: order.price },
      { label: 'Owner', value: order.isMine ? 'Active account' : 'Other account' },
      ...(order.acceptDisabledReason ? [{ label: 'Accept requirement', value: order.acceptDisabledReason }] : []),
      { label: 'Maker', value: order.raw.user, mono: true },
      { label: 'Expires in', value: order.expiresAt },
    ];
  };

  refresh(): void {
    this._marketsRes.reload();
    this._myNftsRes.reload();
  }

  selectMarket(key: string): void {
    this.selectedMarketKey.set(key);
    this.pinnedMarketKey.set(key);
  }

  clearMarket(): void {
    this.selectedMarketKey.set(null);
    this.pinnedMarketKey.set(null);
  }

  toggleMarketInfo(market: NftSpotMarket): void {
    this.pinnedMarketKey.set(this.pinnedMarketKey() === market.key ? null : market.key);
  }

  shortAddress = shortAddress;


  private async mapOwnedNft(nft: NftSpotVaultNft): Promise<NftSpotOwnedNft> {
    const collection = await this.collectionLabel(nft.nft);
    const metadata = await this.reads.getTokenMetadata(nft.nft, nft.tokenId);
    const key = `${norm(nft.nft)}_${nft.tokenId.toString()}`;
    const openAsk = this.loadedMarkets()
      .flatMap((market) => market.asks)
      .find((order) =>
        order.isMine &&
        norm(order.raw.nft) === norm(nft.nft) &&
        order.raw.tokenId === nft.tokenId,
      ) ?? null;

    return {
      key,
      collection,
      collectionAddress: norm(nft.nft),
      tokenId: nft.tokenId.toString(),
      status: nft.locked ? 'Locked' : 'Available',
      locked: nft.locked,
      ...this.metadataFields(metadata),
      openAsk,
      chain: nft,
    };
  }

  private async loadMarket(chainMarket: NftSpotChainMarket, activeAccount: string): Promise<LoadedMarket | null> {
    const key = marketKey(chainMarket);
    const quoteInfo = this.tokens.getToken(chainMarket.quoteToken)();
    const quoteSymbol = quoteInfo?.symbol ?? shortAddress(chainMarket.quoteToken);
    const quoteDecimals = quoteInfo?.decimals ?? 18;
    const collection = await this.collectionLabel(chainMarket.nft);
    const metadata = await this.reads.getTokenMetadata(chainMarket.nft, chainMarket.tokenId);
    const orders = await this.reads.getOrdersForMarket(chainMarket);
    const [bids, asks] = await Promise.all([
      Promise.all(orders.bids.map((order) => this.mapOrder(order, key, collection, quoteSymbol, quoteDecimals, activeAccount))),
      Promise.all(orders.asks.map((order) => this.mapOrder(order, key, collection, quoteSymbol, quoteDecimals, activeAccount))),
    ]);

    bids.sort((a, b) => (b.raw.price > a.raw.price ? 1 : b.raw.price < a.raw.price ? -1 : 0));
    asks.sort((a, b) => (a.raw.price > b.raw.price ? 1 : a.raw.price < b.raw.price ? -1 : 0));

    const myOrders = [...bids, ...asks].filter((order) => order.isMine).length;
    const quoteVolume = orders.bids
      .concat(orders.asks)
      .reduce((total, order) => total + order.price, 0n);
    const quoteVolumeLabel = formatTokenAmount(quoteVolume, quoteDecimals, quoteSymbol, { maxDecimals: 6, compactFrom: 1_000_000 });

    return {
      key,
      collection,
      collectionAddress: norm(chainMarket.nft),
      tokenId: chainMarket.tokenId.toString(),
      quoteToken: norm(chainMarket.quoteToken),
      quoteSymbol,
      quoteVolume: quoteVolumeLabel,
      ...this.metadataFields(metadata),
      floorHint: '—',
      bestBid: bids[0]?.price ?? '—',
      bestAsk: asks[0]?.price ?? '—',
      totalOrders: bids.length + asks.length,
      myOrders,
      status: 'Active',
      expiresAt: 'Per order',
      chain: chainMarket,
      bids,
      asks,
    };
  }

  private async mapOrder(
    order: NftSpotChainOrder,
    marketKeyValue: string,
    collection: string,
    quoteSymbol: string,
    quoteDecimals: number,
    activeAccount: string,
  ): Promise<NftSpotOrder> {
    const price = formatTokenAmount(order.price, quoteDecimals, quoteSymbol, { maxDecimals: 6, compactFrom: 1_000_000 });
    const side: NftSpotSide = order.side === 0 ? 'bid' : 'ask';
    const isMine = !!activeAccount && norm(order.user) === activeAccount;
    const acceptDisabledReason = await this.acceptDisabledReason(order, side, isMine, activeAccount, quoteSymbol, quoteDecimals);

    return {
      id: order.orderId.toString(),
      side,
      price,
      maker: shortAddress(order.user),
      isMine,
      acceptDisabledReason,
      expiresAt: formatDuration(order.expiry),
      marketKey: marketKeyValue,
      nftLabel: `${collection} #${order.tokenId.toString()}`,
      raw: order,
    };
  }

  private async acceptDisabledReason(
    order: NftSpotChainOrder,
    side: NftSpotSide,
    isMine: boolean,
    activeAccount: string,
    quoteSymbol: string,
    quoteDecimals: number,
  ): Promise<string | null> {
    if (isMine) return null;
    if (!activeAccount) return 'Select an active protocol account before accepting an NFT order.';

    if (side === 'bid') {
      const ownsNft = await this.reads.hasAvailableVaultNft(activeAccount, order.nft, order.tokenId);
      return ownsNft ? null : 'To accept this bid, deposit this NFT into the active protocol account first.';
    }

    const availableQuote = await this.reads.availableVaultErc20(activeAccount, order.quoteToken);
    if (availableQuote >= order.price) return null;

    const required = formatTokenAmount(order.price, quoteDecimals, quoteSymbol, { maxDecimals: 6, compactFrom: 1_000_000 });
    return `To accept this ask, deposit at least ${required} into the active protocol account first.`;
  }


  private metadataFields(metadata: NftTokenMetadata): {
    metadataName: string;
    metadataDescription: string;
    imageUrl: string | null;
    tokenUri: string | null;
    metadataUri: string | null;
    externalUrl: string | null;
    attributesSummary: string;
  } {
    return {
      metadataName: metadata.name ?? '',
      metadataDescription: metadata.description ?? '',
      imageUrl: metadata.image,
      tokenUri: metadata.tokenUri,
      metadataUri: metadata.metadataUri,
      externalUrl: metadata.externalUrl,
      attributesSummary: this.formatAttributes(metadata.attributes),
    };
  }

  private formatAttributes(attributes: Array<{ trait_type?: string; value?: unknown }> | null): string {
    if (!attributes?.length) return '';
    return attributes
      .slice(0, 4)
      .map((attr) => {
        const trait = attr.trait_type ? `${attr.trait_type}: ` : '';
        return `${trait}${String(attr.value ?? '—')}`;
      })
      .join(' · ');
  }

  private async collectionLabel(address: string): Promise<string> {
    return (await this.reads.getErc721Symbol(address)) ?? shortAddress(address);
  }
}
