import { Injectable, inject, computed, resource, effect } from '@angular/core';
import { isAddress } from 'ethers';
import { PriceManagerContractService } from '../onchain/contracts/pricemanager-contract.service';
import { VaultContractService } from '../onchain/contracts/vault-contract.service';
import { ERC20ContractService } from '../onchain/contracts/erc20-contract.service';
import { ETH_ADDRESS, TokenRegistryService } from './main.tokens';
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

  private readonly _index = computed(
    () => this._indexRes.value() ?? { main: [], whitelist: [], other: [] },
  );

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

  private readonly _meta = computed(() => this._metaRes.value() ?? {});

  constructor() {
    effect(() => {
      this.trigger.vaultTick();
      this.trigger.tokensTick();
      this.trigger.pricesTick();

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

  readonly list = computed<TokenInfo[]>(() => {
    const idx = this._index();
    const meta = this._meta();

    const ordered = [...idx.main, ...idx.whitelist, ...idx.other];

    return ordered.map((addr) => this._toTokenInfo(addr, idx, meta));
  });

  readonly main = computed(() =>
    this.list().filter((t) => t.category === 'main'),
  );

  readonly whitelist = computed(() =>
    this.list().filter((t) => t.category === 'whitelist'),
  );

  readonly other = computed(() =>
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
      icon: this._getIcon(m.symbol, key),
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

    const valid = (a: string) => a === n(ETH_ADDRESS) || isAddress(a);

    const main = this.uniq(mainRaw).filter(valid);
    const candidates = this.uniq([
      ...configuredRaw,
      ...vaultTokensRaw,
      ...main,
    ]).filter(valid);

    try {
      trustedRaw = await this._loadTrustedTokens(candidates);
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

  private _getEthIcon(): string {
    return 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png';
  }

  private _getIcon(symbol: string, address: string): string | undefined {
    const known = this._mainTokens().find(
      (t) => n(t.symbol) === n(symbol) || n(t.address) === n(address),
    );

    if (known?.icon) return known.icon;

    if (address === n(ETH_ADDRESS)) return this._getEthIcon();

    return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${address}/logo.png`;
  }
}
