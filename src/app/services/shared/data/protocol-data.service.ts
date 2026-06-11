import { Injectable, computed, inject, signal } from '@angular/core';
import { Contract, ethers } from 'ethers';

import { FeeService } from '../fee.service';
import { ProtocolConfigService } from '../config/protocol-config.service';
import { ProtocolAssetConfig, ProtocolProductConfig } from '../config/protocol-config';
import { VaultChainService } from '../../onchain/vault.service';
import { VaultContractService } from '../../onchain/contracts/vault-contract.service';
import { FeeManagerContractService } from '../../onchain/contracts/fee-manager-contract.service';
import { PriceManagerContractService } from '../../onchain/contracts/pricemanager-contract.service';
import { GovernanceContractService } from '../../onchain/contracts/governance-contract.service';
import { GovernanceDataService } from './governance-data.service';
import { TreasuryDataService } from './treasury-data.service';
import { SethxTokenAbi } from '../../../contracts/generated';
import { structuralEqual } from '../../../core/signals/stable-resource';
import { ETH_ADDRESS } from '../../../constants/main.tokens';

export type ProtocolKnowledge = {
  networkName: string;
  chainId: number;
  addresses: Record<string, string>;
  assets: ProtocolAssetConfig[];
  products: ProtocolProductConfig[];
  feeNote: string;
  rampNote: string;
};

export type ProtocolVaultQuantity = {
  symbol: string;
  name: string;
  address: string;
  balance: bigint | null;
  decimals: number;
  status: string;
};

export type ProtocolFeeTokenInfo = {
  symbol: string;
  address: string;
  kind: 'native' | 'protocol' | 'other';
};

export type ProtocolTokenStats = {
  address: string | null;
  totalMined: bigint | null;
  miningClosed: boolean | null;
  protocolOwned: bigint | null;
  founderLocked: bigint | null;
  userOwned: bigint | null;
  status: string;
};

export type ProtocolOracleInfo = {
  oracle: string;
  token: string;
  label: string;
  description: string;
  status: number | null;
  statusLabel: string;
  contexts: string[];
  pair: string;
  source: string;
  notes: string;
  price: bigint | null;
  priceTimestamp: bigint | null;
  lastFetchTimestamp: bigint | null;
  decimals: number | null;
  feed: string;
  feedDecimals: number | null;
  maxStaleness: bigint | null;
  fetchFormula: string;
  clientCheckedAt: number | null;
};

export type ProtocolLiveOverview = {
  networkName: string;
  chainId: number;
  configuredContractCount: number;
  enabledAssetCount: number;
  enabledProductCount: number;
  acceptedPaymentTokens: string[];
  acceptedPaymentTokenInfo: ProtocolFeeTokenInfo[];
  sethxFeeToken: string | null;
  protocolTokenStats: ProtocolTokenStats;
  feeReadStatus: string;
  vaultErc20Tokens: string[];
  vaultErc721Tokens: string[];
  vaultErc1155Tokens: string[];
  vaultQuantities: ProtocolVaultQuantity[];
  vaultErc20Status: string;
  vaultErc721Status: string;
  vaultErc1155Status: string;
  oracleInfo: ProtocolOracleInfo[];
  oracleReadStatus: string;
  governanceSettingsLoaded: boolean;
  treasuryOverviewLoaded: boolean;
  treasuryEthBalance: bigint | null;
  treasuryTrackedTokenCount: number;
};

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const ERC20_MIN_ABI = [
  'function balanceOf(address account) view returns (uint256)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
] as const satisfies ethers.InterfaceAbi;

const PRICE_ORACLE_DETAIL_ABI = [
  'function getLastPrice() view returns (uint256 price, uint256 timestamp, uint256 lastFetchTimestamp, string status)',
  'function decimals() view returns (uint8)',
  'function metadata() view returns (string pair, string source, string notes)',
  'function fetchFormula() view returns (string)',
  'function feed() view returns (address)',
  'function feedDecimals() view returns (uint8)',
  'function maxStaleness() view returns (uint256)',
  'function fetchPrice()',
] as const satisfies ethers.InterfaceAbi;

@Injectable({ providedIn: 'root' })
export class ProtocolDataService {
  private readonly fees = inject(FeeService);
  private readonly feeManager = inject(FeeManagerContractService);
  private readonly protocolConfig = inject(ProtocolConfigService);
  private readonly vault = inject(VaultChainService);
  private readonly vaultContract = inject(VaultContractService);
  private readonly priceManager = inject(PriceManagerContractService);
  private readonly governanceContracts = inject(GovernanceContractService);
  private readonly governance = inject(GovernanceDataService);
  private readonly treasury = inject(TreasuryDataService);

  private readonly _vaultQuantities = signal<ProtocolVaultQuantity[]>([]);
  private readonly _acceptedPaymentTokenInfo = signal<ProtocolFeeTokenInfo[]>([]);
  private readonly _protocolTokenStats = signal<ProtocolTokenStats>({
    address: null,
    totalMined: null,
    miningClosed: null,
    protocolOwned: null,
    founderLocked: null,
    userOwned: null,
    status: 'pending',
  });
  private readonly _oracleInfo = signal<ProtocolOracleInfo[]>([]);
  private readonly _oracleReadStatus = signal<'pending' | 'refreshing' | 'loaded'>('pending');
  private oracleRefreshPromise: Promise<ProtocolOracleInfo[] | null> | null = null;

  readonly knowledge = computed<ProtocolKnowledge>(() => {
    const config = this.protocolConfig.config();

    return {
      networkName: config.currentNetwork.name,
      chainId: config.currentNetwork.chainId,
      addresses: config.contracts,
      assets: config.assets,
      products: config.products,
      feeNote: config.fees.note,
      rampNote: config.compliance.noRampReason,
    };
  });

  readonly liveOverview = computed<ProtocolLiveOverview>(() => {
    const config = this.protocolConfig.config();
    const treasuryOverview = this.treasury.dashboard().overview;

    return {
      networkName: config.currentNetwork.name,
      chainId: config.currentNetwork.chainId,
      configuredContractCount: Object.values(config.contracts).filter(Boolean).length,
      enabledAssetCount: config.assets.filter((asset) => asset.enabled).length,
      enabledProductCount: config.products.filter((product) => product.enabled).length,
      acceptedPaymentTokens: this.fees.acceptedPaymentTokens(),
      acceptedPaymentTokenInfo: this._acceptedPaymentTokenInfo(),
      sethxFeeToken: this.fees.sethxToken(),
      protocolTokenStats: this._protocolTokenStats(),
      feeReadStatus: String(this.fees.acceptedPaymentTokensStatus()),
      vaultErc20Tokens: this.vault.erc20Tokens(),
      vaultErc721Tokens: this.vault.erc721Tokens(),
      vaultErc1155Tokens: this.vault.erc1155Tokens(),
      vaultQuantities: this._vaultQuantities(),
      vaultErc20Status: String(this.vault.erc20Status()),
      vaultErc721Status: String(this.vault.erc721Status()),
      vaultErc1155Status: String(this.vault.erc1155Status()),
      oracleInfo: this._oracleInfo(),
      oracleReadStatus: this._oracleReadStatus(),
      governanceSettingsLoaded: Boolean(this.governance.settings()),
      treasuryOverviewLoaded: Boolean(treasuryOverview),
      treasuryEthBalance: treasuryOverview?.ethBal ?? null,
      treasuryTrackedTokenCount: treasuryOverview?.tokens.length ?? 0,
    };
  });


  warmLiveReads(): void {
    this.fees.refreshAcceptedPaymentTokens();
    this.fees.refreshSethxToken();
    this.vault.refreshVault();
    void this.governance.loadSettings();
    void this.treasury.loadDashboard();
    void this.loadProtocolPageReads();
  }

  async refreshOracleInfo(): Promise<ProtocolOracleInfo[] | null> {
    if (this.oracleRefreshPromise) return this.oracleRefreshPromise;

    this._oracleReadStatus.set(this._oracleInfo().length ? 'refreshing' : 'pending');

    const task = this.readOracleInfoSnapshot()
      .then((rows) => {
        if (!this.oracleInfoEqualIgnoringClientCheck(this._oracleInfo(), rows)) this._oracleInfo.set(rows);
        this._oracleReadStatus.set('loaded');
        return rows;
      })
      .catch(() => {
        this._oracleReadStatus.set(this._oracleInfo().length ? 'loaded' : 'pending');
        return null;
      })
      .finally(() => {
        this.oracleRefreshPromise = null;
      });

    this.oracleRefreshPromise = task;
    return task;
  }

  private oracleInfoEqualIgnoringClientCheck(previous: ProtocolOracleInfo[], next: ProtocolOracleInfo[]): boolean {
    const strip = (rows: ProtocolOracleInfo[]) => rows.map((row) => {
      const comparable = { ...row } as Partial<ProtocolOracleInfo>;
      delete comparable.clientCheckedAt;
      return comparable;
    });
    return structuralEqual(strip(previous), strip(next));
  }

  private async loadProtocolPageReads(): Promise<void> {
    await Promise.allSettled([
      this.loadVaultQuantities(),
      this.loadAcceptedFeeTokenInfo(),
      this.loadProtocolTokenStats(),
      this.refreshOracleInfo(),
    ]);
  }

  private async loadVaultQuantities(): Promise<void> {
    const assets = this.protocolConfig.assets().filter((asset) => asset.enabled);
    const rows = await Promise.all(assets.map(async (asset) => {
      try {
        const balance = this.isNativeAsset(asset.address)
          ? await this.vaultContract.getVaultETHBalance()
          : await this.vaultContract.getVaultERC20Balance(asset.address);
        return { symbol: asset.symbol, name: asset.name, address: asset.address, balance, decimals: asset.decimals, status: 'loaded' };
      } catch {
        return { symbol: asset.symbol, name: asset.name, address: asset.address, balance: null, decimals: asset.decimals, status: 'pending' };
      }
    }));
    this._vaultQuantities.set(rows);
  }

  private async loadAcceptedFeeTokenInfo(): Promise<void> {
    const accepted = await this.feeManager.getAcceptedPaymentTokens().catch(() => this.fees.acceptedPaymentTokens());
    const sethxToken = await this.feeManager.getSethxToken().catch(() => this.fees.sethxToken());
    const runner = await this.governanceContracts.runner();
    const rows = await Promise.all((accepted ?? []).map(async (token) => {
      const address = String(token ?? '');
      const isEth = this.isZeroAddress(address) || this.isNativeAsset(address);
      const isSethx = Boolean(sethxToken && address.toLowerCase() === sethxToken.toLowerCase());
      let symbol = isEth ? 'ETH' : isSethx ? 'SETHX' : this.shortAddress(address);
      if (!isEth && !isSethx) {
        try { symbol = String(await new Contract(address, ERC20_MIN_ABI, runner)['symbol']()); } catch {}
      }
      return { symbol, address, kind: isEth ? 'native' : isSethx ? 'protocol' : 'other' } as ProtocolFeeTokenInfo;
    }));
    this._acceptedPaymentTokenInfo.set(rows);
  }

  private async loadProtocolTokenStats(): Promise<void> {
    const cfg = this.protocolConfig.config();
    const address = cfg.contracts['SethxToken'] || this.fees.sethxToken();
    if (!address) return;
    try {
      const runner = await this.governanceContracts.runner();
      const token = new Contract(address, SethxTokenAbi, runner);
      const treasuryAddress = cfg.contracts['ProtocolTreasury'];
      const [totalSupply, mintingFinished, protocolOwned] = await Promise.all([
        token['totalSupply']().catch(() => null),
        token['mintingFinished']().catch(() => null),
        treasuryAddress ? token['balanceOf'](treasuryAddress).catch(() => null) : Promise.resolve(null),
      ]);
      const total = totalSupply == null ? null : BigInt(totalSupply);
      const owned = protocolOwned == null ? null : BigInt(protocolOwned);
      const founderLocked: bigint | null = null;
      const userOwned = total == null ? null : total - (owned ?? 0n) - (founderLocked ?? 0n);
      this._protocolTokenStats.set({
        address,
        totalMined: total,
        miningClosed: mintingFinished == null ? null : Boolean(mintingFinished),
        protocolOwned: owned,
        founderLocked,
        userOwned,
        status: 'loaded',
      });
    } catch {
      this._protocolTokenStats.set({ address, totalMined: null, miningClosed: null, protocolOwned: null, founderLocked: null, userOwned: null, status: 'pending' });
    }
  }

  private async readOracleInfoSnapshot(): Promise<ProtocolOracleInfo[]> {
    const clientCheckedAt = Date.now();
    const oracles = await this.priceManager.getApprovedOracles();
    const contextNames = ['General', 'Trade value', 'Futures settlement', 'Collateral evaluation', 'Options settlement', 'Fee conversion'];
    const runner = await this.governanceContracts.runner();
    const contextEntries = await Promise.all(contextNames.map(async (label, context) => {
      const list = await this.priceManager.getApprovedOraclesForContext(context).catch(() => [] as string[]);
      const approved = new Set(list.map((x) => String(x ?? '').toLowerCase()));
      return { label, approved };
    }));

    return Promise.all(oracles.map(async (oracle) => {
      const lowerOracle = oracle.toLowerCase();
      const detail = new Contract(oracle, PRICE_ORACLE_DETAIL_ABI, runner);
      const [metadata, status, oracleMetadata, lastPrice, decimals, fetchFormula, feed, feedDecimals, maxStaleness] = await Promise.all([
        this.priceManager.getOracleMetadata(oracle),
        this.priceManager.getOracleStatus(oracle),
        detail['metadata']().catch(() => null),
        detail['getLastPrice']().catch(() => null),
        detail['decimals']().catch(() => null),
        detail['fetchFormula']().catch(() => ''),
        detail['feed']().catch(() => ''),
        detail['feedDecimals']().catch(() => null),
        detail['maxStaleness']().catch(() => null),
      ]);

      return {
        oracle,
        token: metadata.token,
        label: metadata.label || this.shortAddress(oracle),
        description: metadata.description || 'Approved oracle',
        status,
        statusLabel: this.oracleStatusLabel(status),
        contexts: contextEntries.filter((entry) => entry.approved.has(lowerOracle)).map((entry) => entry.label),
        pair: String(oracleMetadata?.pair ?? oracleMetadata?.[0] ?? ''),
        source: String(oracleMetadata?.source ?? oracleMetadata?.[1] ?? ''),
        notes: String(oracleMetadata?.notes ?? oracleMetadata?.[2] ?? ''),
        price: lastPrice == null ? null : BigInt(lastPrice?.price ?? lastPrice?.[0] ?? 0),
        priceTimestamp: lastPrice == null ? null : BigInt(lastPrice?.timestamp ?? lastPrice?.[1] ?? 0),
        lastFetchTimestamp: lastPrice == null ? null : BigInt(lastPrice?.lastFetchTimestamp ?? lastPrice?.[2] ?? 0),
        decimals: decimals == null ? null : Number(decimals),
        feed: String(feed || ''),
        feedDecimals: feedDecimals == null ? null : Number(feedDecimals),
        maxStaleness: maxStaleness == null ? null : BigInt(maxStaleness),
        fetchFormula: String(fetchFormula || ''),
        clientCheckedAt,
      } as ProtocolOracleInfo;
    }));
  }

  private isNativeAsset(address: string): boolean {
    return address.toLowerCase() === ETH_ADDRESS.toLowerCase();
  }

  private isZeroAddress(address: string): boolean {
    return address.toLowerCase() === ZERO_ADDRESS.toLowerCase();
  }

  private shortAddress(address: string): string {
    return address && address.length > 14 ? `${address.slice(0, 6)}…${address.slice(-4)}` : address || '—';
  }

  private oracleStatusLabel(status: number | null): string {
    if (status == null) return 'Pending';
    return ['OK', 'DEGRADED', 'FROZEN', 'PENDING', 'STALE'][status] ?? `Status ${status}`;
  }
}
