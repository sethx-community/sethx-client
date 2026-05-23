import { Injectable, inject } from '@angular/core';
import { ethers } from 'ethers';

import { CONTRACT_ABIS } from '../../../contracts/generated';
import { getContractAddress } from '../../../contracts/contract-registry';
import { WalletConnectService } from '../../../wallet/wallet-connect.service';

export type NftSpotOrderSide = 0 | 1; // 0 Bid, 1 Ask

export type NftSpotChainMarket = {
  nft: string;
  tokenId: bigint;
  quoteToken: string;
};

export type NftSpotVaultNft = {
  nft: string;
  tokenId: bigint;
  locked: boolean;
};

export type NftTokenMetadata = {
  tokenUri: string | null;
  metadataUri: string | null;
  name: string | null;
  description: string | null;
  image: string | null;
  externalUrl: string | null;
  attributes: Array<{ trait_type?: string; value?: unknown }> | null;
};

export type NftSpotChainOrder = {
  orderId: bigint;
  user: string;
  nft: string;
  tokenId: bigint;
  quoteToken: string;
  side: NftSpotOrderSide;
  price: bigint;
  expiry: bigint;
  fixedFeeAmount: bigint;
  fixedFeeToken: string;
  percentageFeeAmount: bigint;
  percentageFeeToken: string;
  fixedFeeCharged: boolean;
  percentageFeeCharged: bigint;
};

function normAddr(value: unknown): string {
  return String(value ?? '').trim().toLowerCase();
}

function bi(value: unknown): bigint {
  try {
    if (typeof value === 'bigint') return value;
    return BigInt((value as { toString?: () => string })?.toString?.() ?? '0');
  } catch {
    return 0n;
  }
}

@Injectable({ providedIn: 'root' })
export class NftSpotOrderBookReadService {
  private readonly wallet = inject(WalletConnectService);

  readonly orderBookAddress = getContractAddress('NFTSpotOrderBook');
  readonly vaultAddress = getContractAddress('SethxVault');

  private readonly metadataCache = new Map<string, Promise<NftTokenMetadata>>();

  private async providerOrNull(): Promise<any | null> {
    return await this.wallet.getEthersProvider();
  }

  private async vaultContractOrNull(): Promise<ethers.Contract | null> {
    const provider = await this.providerOrNull();
    if (!provider) return null;

    return new ethers.Contract(
      this.vaultAddress,
      [
        'event ERC721Deposited(address indexed account,address token,uint256 tokenId)',
        'event ERC721Withdrawn(address indexed account,address token,uint256 tokenId)',
        'event ERC721Transferred(address indexed from,address indexed to,address indexed nft,uint256 tokenId,string reason)',
        'function getERC721Tokens() view returns (address[])',
        'function erc721Owned(address account,address nft,uint256 tokenId) view returns (bool)',
        'function erc721Locked(address account,address nft,uint256 tokenId) view returns (bool)',
        'function erc20Balances(address account,address token) view returns (uint256)',
        'function erc20Locked(address account,address token) view returns (uint256)',
      ],
      provider,
    );
  }

  private async contractOrNull(): Promise<ethers.Contract | null> {
    const provider = await this.providerOrNull();
    if (!provider) return null;

    return new ethers.Contract(
      this.orderBookAddress,
      CONTRACT_ABIS.NFTSpotOrderBook,
      provider,
    );
  }

  private mapOrder(order: any): NftSpotChainOrder | null {
    const user = normAddr(order?.user);
    if (!user || user === normAddr(ethers.ZeroAddress)) return null;

    return {
      orderId: bi(order.orderId),
      user,
      nft: normAddr(order.nft),
      tokenId: bi(order.tokenId),
      quoteToken: normAddr(order.quoteToken),
      side: Number(order.side) === 0 ? 0 : 1,
      price: bi(order.price),
      expiry: bi(order.expiry),
      fixedFeeAmount: bi(order.fixedFeeAmount),
      fixedFeeToken: normAddr(order.fixedFeeToken),
      percentageFeeAmount: bi(order.percentageFeeAmount),
      percentageFeeToken: normAddr(order.percentageFeeToken),
      fixedFeeCharged: Boolean(order.fixedFeeCharged),
      percentageFeeCharged: bi(order.percentageFeeCharged),
    };
  }

  async getActiveMarketCount(): Promise<bigint> {
    const contract = await this.contractOrNull();
    if (!contract) return 0n;
    return bi(await contract['getActiveMarketCount']());
  }

  async getActiveMarketAt(index: number): Promise<NftSpotChainMarket | null> {
    const contract = await this.contractOrNull();
    if (!contract) return null;

    const [nft, tokenId, quoteToken] = await contract['getActiveMarketAt'](index);
    return {
      nft: normAddr(nft),
      tokenId: bi(tokenId),
      quoteToken: normAddr(quoteToken),
    };
  }

  async getActiveMarkets(limit = 100): Promise<NftSpotChainMarket[]> {
    const count = Number(await this.getActiveMarketCount());
    const bounded = Math.max(0, Math.min(count, limit));
    const markets = await Promise.all(
      Array.from({ length: bounded }, (_, index) => this.getActiveMarketAt(index)),
    );
    return markets.filter(Boolean) as NftSpotChainMarket[];
  }

  async getOrder(orderId: bigint): Promise<NftSpotChainOrder | null> {
    const contract = await this.contractOrNull();
    if (!contract || orderId <= 0n) return null;

    const order = await contract['getOrder'](orderId);
    return this.mapOrder(order);
  }

  async getOrderBookIds(
    nft: string,
    tokenId: bigint,
    quoteToken: string,
  ): Promise<{ bids: bigint[]; asks: bigint[] }> {
    const contract = await this.contractOrNull();
    if (!contract) return { bids: [], asks: [] };

    const result = await contract['getOrderBook'](nft, tokenId, quoteToken);
    return {
      bids: (result?.bids ?? result?.[0] ?? []).map((id: unknown) => bi(id)).filter((id: bigint) => id > 0n),
      asks: (result?.asks ?? result?.[1] ?? []).map((id: unknown) => bi(id)).filter((id: bigint) => id > 0n),
    };
  }

  async getOrdersForMarket(
    market: NftSpotChainMarket,
  ): Promise<{ bids: NftSpotChainOrder[]; asks: NftSpotChainOrder[] }> {
    const ids = await this.getOrderBookIds(market.nft, market.tokenId, market.quoteToken);
    const [bidsRaw, asksRaw] = await Promise.all([
      Promise.all(ids.bids.map((id) => this.getOrder(id))),
      Promise.all(ids.asks.map((id) => this.getOrder(id))),
    ]);

    const now = BigInt(Math.floor(Date.now() / 1000));
    const isLive = (order: NftSpotChainOrder | null): order is NftSpotChainOrder =>
      !!order && (order.expiry === 0n || order.expiry > now);

    return {
      bids: bidsRaw.filter(isLive),
      asks: asksRaw.filter(isLive),
    };
  }

  async getErc721Symbol(nft: string): Promise<string | null> {
    const provider = await this.providerOrNull();
    if (!provider || !nft) return null;

    try {
      const contract = new ethers.Contract(nft, ['function symbol() view returns (string)'], provider);
      return String(await contract['symbol']());
    } catch {
      return null;
    }
  }



  async getTokenMetadata(nft: string, tokenId: bigint): Promise<NftTokenMetadata> {
    const key = `${normAddr(nft)}_${tokenId.toString()}`;
    const existing = this.metadataCache.get(key);
    if (existing) return existing;

    const promise = this.loadTokenMetadata(nft, tokenId);
    this.metadataCache.set(key, promise);
    return promise;
  }

  private async loadTokenMetadata(nft: string, tokenId: bigint): Promise<NftTokenMetadata> {
    const fallback: NftTokenMetadata = {
      tokenUri: null,
      metadataUri: null,
      name: null,
      description: null,
      image: null,
      externalUrl: null,
      attributes: null,
    };

    const provider = await this.providerOrNull();
    if (!provider || !nft) return fallback;

    let tokenUri: string | null = null;
    try {
      const contract = new ethers.Contract(nft, ['function tokenURI(uint256 tokenId) view returns (string)'], provider);
      tokenUri = String(await contract['tokenURI'](tokenId));
    } catch {
      return fallback;
    }

    const metadataUri = this.toFetchableMetadataUri(tokenUri);
    if (!metadataUri) return { ...fallback, tokenUri };

    try {
      const json = await this.fetchJsonMetadata(metadataUri);
      const imageUri = typeof json?.image === 'string' ? json.image : null;
      return {
        tokenUri,
        metadataUri,
        name: typeof json?.name === 'string' ? json.name : null,
        description: typeof json?.description === 'string' ? json.description : null,
        image: imageUri ? this.toDisplayUri(imageUri) : null,
        externalUrl: typeof json?.external_url === 'string'
          ? this.toDisplayUri(json.external_url)
          : typeof json?.externalUrl === 'string'
            ? this.toDisplayUri(json.externalUrl)
            : null,
        attributes: Array.isArray(json?.attributes) ? json.attributes : null,
      };
    } catch {
      return { ...fallback, tokenUri, metadataUri };
    }
  }

  private async fetchJsonMetadata(uri: string): Promise<any> {
    if (uri.startsWith('data:application/json;base64,')) {
      const encoded = uri.slice('data:application/json;base64,'.length);
      return JSON.parse(globalThis.atob(encoded));
    }

    if (uri.startsWith('data:application/json,')) {
      return JSON.parse(decodeURIComponent(uri.slice('data:application/json,'.length)));
    }

    const response = await fetch(uri);
    if (!response.ok) throw new Error(`Metadata fetch failed: ${response.status}`);
    return response.json();
  }

  private toFetchableMetadataUri(uri: string | null): string | null {
    if (!uri) return null;
    if (uri.startsWith('ipfs://')) return this.toDisplayUri(uri);
    if (uri.startsWith('http://') || uri.startsWith('https://')) return uri;
    if (uri.startsWith('data:application/json')) return uri;
    return null;
  }

  private toDisplayUri(uri: string): string {
    if (uri.startsWith('ipfs://ipfs/')) return `https://ipfs.io/ipfs/${uri.slice('ipfs://ipfs/'.length)}`;
    if (uri.startsWith('ipfs://')) return `https://ipfs.io/ipfs/${uri.slice('ipfs://'.length)}`;
    return uri;
  }

  async hasAvailableVaultNft(account: string, nft: string, tokenId: bigint): Promise<boolean> {
    const vault = await this.vaultContractOrNull();
    if (!vault || !account || !nft) return false;

    try {
      const [owned, locked] = await Promise.all([
        vault['erc721Owned'](account, nft, tokenId),
        vault['erc721Locked'](account, nft, tokenId),
      ]);
      return Boolean(owned) && !Boolean(locked);
    } catch {
      return false;
    }
  }

  async availableVaultErc20(account: string, token: string): Promise<bigint> {
    const vault = await this.vaultContractOrNull();
    if (!vault || !account || !token) return 0n;

    try {
      const [balance, locked] = await Promise.all([
        vault['erc20Balances'](account, token),
        vault['erc20Locked'](account, token),
      ]);
      const available = bi(balance) - bi(locked);
      return available > 0n ? available : 0n;
    } catch {
      return 0n;
    }
  }


  async getVaultNfts(account: string): Promise<NftSpotVaultNft[]> {
    const vault = await this.vaultContractOrNull();
    if (!vault || !account) return [];

    try {
      const normalizedAccount = normAddr(account);
      const currentBlock = await vault.runner?.provider?.getBlockNumber?.();
      const fromBlock = 0;
      const toBlock = typeof currentBlock === 'number' ? currentBlock : 'latest';
      const [deposited, withdrawn, transferredIn, transferredOut] = await Promise.all([
        vault.queryFilter(vault.filters['ERC721Deposited'](account, null, null), fromBlock, toBlock),
        vault.queryFilter(vault.filters['ERC721Withdrawn'](account, null, null), fromBlock, toBlock),
        vault.queryFilter(vault.filters['ERC721Transferred'](null, account, null, null, null), fromBlock, toBlock),
        vault.queryFilter(vault.filters['ERC721Transferred'](account, null, null, null, null), fromBlock, toBlock),
      ]);

      const candidates = new Map<string, { nft: string; tokenId: bigint }>();
      const removed = new Set<string>();
      const keyFor = (nft: unknown, tokenId: unknown) => `${normAddr(nft)}_${bi(tokenId).toString()}`;
      const addCandidate = (nft: unknown, tokenId: unknown) => {
        const nftAddress = normAddr(nft);
        const id = bi(tokenId);
        if (!nftAddress || id < 0n) return;
        const key = keyFor(nftAddress, id);
        candidates.set(key, { nft: nftAddress, tokenId: id });
        removed.delete(key);
      };
      const removeCandidate = (nft: unknown, tokenId: unknown) => removed.add(keyFor(nft, tokenId));

      for (const event of deposited) addCandidate((event as any).args?.token, (event as any).args?.tokenId);
      for (const event of transferredIn) addCandidate((event as any).args?.nft, (event as any).args?.tokenId);
      for (const event of withdrawn) removeCandidate((event as any).args?.token, (event as any).args?.tokenId);
      for (const event of transferredOut) removeCandidate((event as any).args?.nft, (event as any).args?.tokenId);

      const current = await Promise.all(
        Array.from(candidates.values()).map(async (item) => {
          if (removed.has(keyFor(item.nft, item.tokenId))) return null;
          const [owned, locked] = await Promise.all([
            vault['erc721Owned'](normalizedAccount, item.nft, item.tokenId),
            vault['erc721Locked'](normalizedAccount, item.nft, item.tokenId),
          ]);
          return Boolean(owned) ? { ...item, locked: Boolean(locked) } : null;
        }),
      );

      return current.filter(Boolean) as NftSpotVaultNft[];
    } catch {
      return [];
    }
  }

  async getUserOrderIds(account: string): Promise<bigint[]> {
    const contract = await this.contractOrNull();
    if (!contract || !account) return [];

    const ids = await contract['getUserOrders'](account);
    return (ids ?? []).map((id: unknown) => bi(id)).filter((id: bigint) => id > 0n);
  }
}
