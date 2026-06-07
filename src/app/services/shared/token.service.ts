import { Injectable, inject, computed, resource, effect } from '@angular/core';
import { stableComputed, stableResourceValue } from '../../core/signals/stable-resource';
import { isAddress } from 'ethers';
import { PriceManagerContractService } from '../onchain/contracts/pricemanager-contract.service';
import { VaultContractService } from '../onchain/contracts/vault-contract.service';
import { ERC20ContractService } from '../onchain/contracts/erc20-contract.service';
import { ETH_ADDRESS, TokenRegistryService } from './main.tokens';
import { WHITELISTED_TOKENS } from '../../constants/token-whitelist';
import { ProtocolConfigService } from './config/protocol-config.service';
import { TriggerService } from '../shared/trigger.service';
import { toStatus, type Status } from '../../core/tokens/resource-status';

export type TokenInfo = {
  address: string;
  symbol: string;
  name: string;
  icon?: string;
  decimals: number;
  category?: 'main' | 'whitelist' | 'other';
};

type TokenIndex = {
  main: string[];
  whitelist: string[];
  other: string[];
};

type Meta = { symbol: string; name: string; decimals: number };

const ORACLE_CONTEXT = {
  TRADE_VALUE: 1,
} as const;


const LOCAL_TOKEN_ICON_BY_ADDRESS: Record<string, string> = {
  [n(ETH_ADDRESS)]: 'assets/tokens/eth.png',
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': 'assets/tokens/usdc.png',
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': 'assets/tokens/weth.png',
  '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': 'assets/tokens/wbtc.png',
  '0x514910771af9ca656af840dff83e8264ecf986ca': 'assets/tokens/link.png',
  '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984': 'assets/tokens/uni.png',
  '0x7fc66500c84a76ad7e9c93437bfc5ac33e2dde9': 'assets/tokens/aave.png',
  '0x5a98fcbea516cf06857215779fd812ca3bef1b32': 'assets/tokens/ldo.png',
  '0x6b175474e89094c44da98b954eedeac495271d0f': 'assets/tokens/dai.png',
};

const LOCAL_MAIN_TOKEN_ICON_BY_SYMBOL: Record<string, string> = {
  SETHX: 'assets/tokens/sethx.png',
};

function sameStringArray(a: readonly string[], b: readonly string[]): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function sameTokenIndex(a: TokenIndex, b: TokenIndex): boolean {
  return sameStringArray(a.main, b.main)
    && sameStringArray(a.whitelist, b.whitelist)
    && sameStringArray(a.other, b.other);
}

function sameMetaMap(a: Record<string, Meta>, b: Record<string, Meta>): boolean {
  if (a === b) return true;
  const aKeys = Object.keys(a).sort();
  const bKeys = Object.keys(b).sort();
  if (!sameStringArray(aKeys, bKeys)) return false;
  for (const key of aKeys) {
    const av = a[key];
    const bv = b[key];
    if (!bv) return false;
    if (av.symbol !== bv.symbol || av.name !== bv.name || av.decimals !== bv.decimals) return false;
  }
  return true;
}

function n(v: unknown): string {
  return String(v ?? '')
    .trim()
    .toLowerCase();
}

function isNativeEth(input: string | undefined | null): boolean {
  if (!input) return false;

  const s = n(input);

  return (
    s === 'eth' ||
    s === 'native' ||
    s === 'ether' ||
    s === n(ETH_ADDRESS) ||
    s === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
  );
}

function normalizeAddressOrNative(input: string): string {
  const raw = String(input ?? '').trim();
  if (!raw) return '';
  if (isNativeEth(raw)) return n(ETH_ADDRESS);
  return raw.toLowerCase();
}

function shortAddr(addr: string): string {
  const a = n(addr);
  if (a.length < 10) return a;
  return `${a.slice(0, 6)}...${a.slice(-4)}`;
}

@Injectable({ providedIn: 'root' })
export class TokenService {
  private readonly priceManager = inject(PriceManagerContractService);
  private readonly vaultContract = inject(VaultContractService);
  private readonly erc20 = inject(ERC20ContractService);
  private readonly trigger = inject(TriggerService);
  private readonly tokenRegistry = inject(TokenRegistryService);
  private readonly protocolConfig = inject(ProtocolConfigService);

  private readonly _indexRes = resource<TokenIndex, {}>({
    params: () => ({}),
    loader: async () => this._loadTokenIndex(),
  });

  private readonly _stableIndex = stableResourceValue(
    () => this._indexRes.value(),
    { main: [] as string[], whitelist: [] as string[], other: [] as string[] },
    { equal: sameTokenIndex },
  );
  private readonly _index = computed(() => this._stableIndex());

  private readonly _metaRes = resource<
    Record<string, Meta>,
    { addrsKey: string }
  >({
    params: () => {
      const addrs = this._allAddresses();
      const addrsKey = [...addrs].map(n).sort().join('|');

      return { addrsKey };
    },
    loader: async () => {
      const addrs = this._allAddresses();
      const out: Record<string, Meta> = {};

      await Promise.all(
        addrs.map(async (addr) => {
          if (addr === n(ETH_ADDRESS)) {
            out[addr] = { symbol: 'ETH', name: 'Ether', decimals: 18 };
            return;
          }

          try {
            const [symbol, name, decimals] = await Promise.all([
              this.erc20.getSymbol(addr),
              this.erc20.getName(addr),
              this.erc20.getDecimals(addr),
            ]);

            out[addr] = { symbol, name, decimals };
          } catch {
            out[addr] = {
              symbol: shortAddr(addr),
              name: 'Unknown token',
              decimals: 18,
            };
          }
        }),
      );

      return out;
    },
  });

  private readonly _stableMeta = stableResourceValue(
    () => this._metaRes.value(),
    {} as Record<string, Meta>,
    { equal: sameMetaMap },
  );
  private readonly _meta = computed(() => this._stableMeta());

  constructor() {
    effect(() => {
      // Token discovery is intentionally domain-scoped. Block, vault, and price
      // refreshes must not rebuild token arrays every block; they make the
      // token lists flicker even when the set of tokens is unchanged.
      // Token discovery refreshes on wallet changes, explicit token-domain
      // events, and manual refresh paths that call refreshTokens().
      this.trigger.tokensTick();
      this.refreshTokens();
    });
  }

  refreshTokens(): void {
    this._indexRes.reload();
    this._metaRes.reload();
  }

  readonly status = computed<Status>(() => {
    const sIndex = toStatus(this._indexRes.status());
    const sMeta = toStatus(this._metaRes.status());

    if (sIndex === 'pending' || sMeta === 'pending') return 'pending';
    if (sIndex === 'error' || sMeta === 'error') return 'error';
    if (sIndex === 'success' && sMeta === 'success') return 'success';

    return 'idle';
  });

  readonly error = computed(
    () => this._indexRes.error() ?? this._metaRes.error() ?? null,
  );

  readonly list = stableComputed<TokenInfo[]>(() => {
    const idx = this._index();
    const meta = this._meta();

    const ordered = [...idx.main, ...idx.whitelist, ...idx.other];

    return ordered.map((addr) => this._toTokenInfo(addr, idx, meta));
  });

  readonly main = stableComputed(() =>
    this.list().filter((t) => t.category === 'main'),
  );

  readonly whitelist = stableComputed(() =>
    this.list().filter((t) => t.category === 'whitelist'),
  );

  readonly other = stableComputed(() =>
    this.list().filter((t) => t.category === 'other'),
  );

  getToken(address: string) {
    const key = normalizeAddressOrNative(address);

    return computed(() => this.list().find((t) => t.address === key));
  }

  private _mainTokens() {
    return this.tokenRegistry.mainTokens();
  }

  private _allAddresses(): string[] {
    const idx = this._index();
    const all = new Set<string>();

    for (const a of idx.main) all.add(a);
    for (const a of idx.whitelist) all.add(a);
    for (const a of idx.other) all.add(a);

    all.add(n(ETH_ADDRESS));

    for (const t of this._mainTokens()) {
      all.add(normalizeAddressOrNative(t.address));
    }

    for (const t of this._configuredTokens()) {
      all.add(normalizeAddressOrNative(t.address));
    }

    for (const t of this._configuredWhitelistTokens()) {
      all.add(normalizeAddressOrNative(t.address));
    }

    return Array.from(all);
  }

  private _toTokenInfo(
    addr: string,
    idx: TokenIndex,
    meta: Record<string, Meta>,
  ): TokenInfo {
    const key = n(addr);

    const m = meta[key] ?? {
      symbol: shortAddr(key),
      name: 'Unknown token',
      decimals: 18,
    };

    const category: TokenInfo['category'] = idx.main.includes(key)
      ? 'main'
      : idx.whitelist.includes(key)
        ? 'whitelist'
        : 'other';

    return {
      address: key,
      symbol: m.symbol,
      name: m.name,
      decimals: m.decimals,
      icon: this._getIcon(m.symbol, key, category),
      category,
    };
  }

  private uniq(addrs: string[]): string[] {
    const out: string[] = [];
    const seen = new Set<string>();

    for (const a of addrs.map(n).filter(Boolean)) {
      if (seen.has(a)) continue;

      seen.add(a);
      out.push(a);
    }

    return out;
  }

  private async _loadTokenIndex(): Promise<TokenIndex> {
    const mainRaw = [
      ...this._mainTokens().map((t) => normalizeAddressOrNative(t.address)),
      n(ETH_ADDRESS),
    ].filter(Boolean);

    let vaultTokensRaw: string[] = [];
    let trustedRaw: string[] = [];

    try {
      vaultTokensRaw = (await this.vaultContract.getERC20Tokens()).map(
        normalizeAddressOrNative,
      );
    } catch {
      vaultTokensRaw = [];
    }

    const configuredRaw = this._configuredTokens()
      .map((t) => normalizeAddressOrNative(t.address))
      .filter(Boolean);

    const configuredWhitelistRaw = this._configuredWhitelistTokens()
      .map((t) => normalizeAddressOrNative(t.address))
      .filter(Boolean);

    const valid = (a: string) => a === n(ETH_ADDRESS) || isAddress(a);

    const main = this.uniq(mainRaw).filter(valid);
    const candidates = this.uniq([
      ...configuredRaw,
      ...vaultTokensRaw,
      ...main,
    ]).filter(valid);

    try {
      trustedRaw = this.uniq([
        ...configuredWhitelistRaw,
        ...(await this._loadTrustedTokens(candidates)),
      ]);
    } catch {
      trustedRaw = [];
    }

    const whitelist = this.uniq(trustedRaw).filter(valid);
    const other = this.uniq([...configuredRaw, ...vaultTokensRaw]).filter(valid);

    const mainSet = new Set(main);
    const whitelistNoMain = whitelist.filter((a) => !mainSet.has(a));
    const whitelistSet = new Set(whitelistNoMain);
    const otherNoOverlap = other.filter(
      (a) => !mainSet.has(a) && !whitelistSet.has(a),
    );

    return {
      main,
      whitelist: whitelistNoMain,
      other: otherNoOverlap,
    };
  }

  private _configuredTokens() {
    return this.protocolConfig.assets().filter((asset) => asset.enabled);
  }

  private _configuredWhitelistTokens() {
    return WHITELISTED_TOKENS;
  }

  private async _loadTrustedTokens(candidates: string[]): Promise<string[]> {
    const trusted: string[] = [];

    await Promise.all(
      candidates.map(async (addr) => {
        const key = normalizeAddressOrNative(addr);
        if (!key || key === n(ETH_ADDRESS)) return;

        try {
          const allowed = await this.priceManager.isTokenAllowedForContext(
            key,
            ORACLE_CONTEXT.TRADE_VALUE,
          );

          if (allowed) {
            trusted.push(key);
            return;
          }

          const usable = await this.priceManager.getUsableOracleForTokenContext(
            key,
            ORACLE_CONTEXT.TRADE_VALUE,
          );

          if (usable.ok) trusted.push(key);
        } catch {
          // Leave the token in Other if PriceManager cannot classify it yet.
        }
      }),
    );

    return trusted;
  }

  private _getIcon(
    symbol: string,
    address: string,
    category: TokenInfo['category'],
  ): string | undefined {
    // Only trusted protocol/main tokens and explicit whitelisted token addresses
    // get bundled icons. Unknown/other tokens intentionally show the neutral
    // symbol fallback so spoofed symbols cannot inherit trusted icons.
    if (category === 'other') return undefined;

    const key = normalizeAddressOrNative(address);
    const knownMainToken = this._mainTokens().find(
      (t) => normalizeAddressOrNative(t.address) === key,
    );

    if (knownMainToken?.icon) return knownMainToken.icon;

    const addressIcon = LOCAL_TOKEN_ICON_BY_ADDRESS[key];
    if (addressIcon) return addressIcon;

    if (category === 'main') {
      const symbolIcon = LOCAL_MAIN_TOKEN_ICON_BY_SYMBOL[String(symbol ?? '').toUpperCase()];
      if (symbolIcon) return symbolIcon;
    }

    return undefined;
  }
}
