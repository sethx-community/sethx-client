import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ZeroAddress, formatUnits } from 'ethers';

import { FeeManagerContractService } from '../../../services/onchain/contracts/fee-manager-contract.service';
import { ProtocolConfigService } from '../../../services/shared/config/protocol-config.service';

type PaymentToken = 'ETH' | 'SETHX';

type FeeRateRow = {
  product: string;
  context: string;
  paymentToken: PaymentToken;
  makerFee: string;
  takerFee: string;
  fixedFee: string;
  source: 'contract' | 'pending';
};

type FeeRateGroup = {
  product: string;
  context: string;
  rows: FeeRateRow[];
};

const FEE_CONTEXTS: Array<{ product: string; context: string }> = [
  { product: 'Token spot', context: 'ERC20 Spot Trade' },
  { product: 'NFT spot', context: 'ERC721 Spot Trade' },
  { product: 'Futures', context: 'Futures Trade' },
  { product: 'Options', context: 'Options Trade' },
  { product: 'Binary options', context: 'Binary Option Trade' },
  { product: 'Margin options', context: 'Margin Option Trade' },
];

@Component({
  selector: 'app-fee-rates',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fee-rates.component.html',
})
export class FeeRatesComponent {
  private readonly feeManager = inject(FeeManagerContractService);
  private readonly config = inject(ProtocolConfigService);

  readonly rows = signal<FeeRateRow[]>(this.pendingRows());
  readonly groups = computed<FeeRateGroup[]>(() => this.groupRows(this.rows()));
  readonly acceptedTokens = signal<string[]>([]);
  readonly sethxToken = signal<string | null>(null);
  readonly discount = signal<string>('—');
  readonly status = signal<'loading' | 'loaded' | 'error'>('loading');
  readonly network = this.config.network;

  constructor() {
    void this.load();
  }

  async load(): Promise<void> {
    this.status.set('loading');
    try {
      const [sethxToken, acceptedTokens, discountBps] = await Promise.all([
        this.feeManager.getSethxToken(),
        this.feeManager.getAcceptedPaymentTokens().catch(() => [] as string[]),
        this.feeManager.getSethxDiscountBps().catch(() => null),
      ]);

      const rows = await Promise.all(FEE_CONTEXTS.map((item) => this.readRoleRate(item)));

      this.rows.set(rows);
      this.acceptedTokens.set(acceptedTokens.map((token) => this.formatToken(token)));
      this.sethxToken.set(sethxToken);
      this.discount.set(discountBps === null ? '—' : this.formatBps(discountBps));
      this.status.set('loaded');
    } catch {
      this.rows.set(this.pendingRows());
      this.acceptedTokens.set([]);
      this.sethxToken.set(null);
      this.discount.set('—');
      this.status.set('error');
    }
  }

  sourceLabel(row: FeeRateRow): string {
    return row.source === 'contract' ? 'FeeManager' : 'Pending read';
  }

  statusLabel(): string {
    if (this.status() === 'loaded') return 'Live fee data loaded from FeeManager.';
    if (this.status() === 'error') return 'FeeManager data is not available from the current provider.';
    return 'Loading FeeManager data…';
  }

  trackByGroup(_: number, group: FeeRateGroup): string {
    return `${group.product}-${group.context}`;
  }

  trackByRow(_: number, row: FeeRateRow): string {
    return `${row.context}-${row.paymentToken}`;
  }

  private groupRows(rows: FeeRateRow[]): FeeRateGroup[] {
    const groups = new Map<string, FeeRateGroup>();
    for (const row of rows) {
      const key = `${row.product}::${row.context}`;
      const existing = groups.get(key);
      if (existing) existing.rows.push(row);
      else groups.set(key, { product: row.product, context: row.context, rows: [row] });
    }
    return Array.from(groups.values()).map((group) => ({
      ...group,
      rows: group.rows.sort((a, b) => (a.paymentToken === 'ETH' ? -1 : 1) - (b.paymentToken === 'ETH' ? -1 : 1)),
    }));
  }

  private async readRoleRate(item: { product: string; context: string }): Promise<FeeRateRow> {
    const cfg = await this.feeManager.getRoleFeeConfig(item.context);
    return {
      product: item.product,
      context: item.context,
      paymentToken: 'ETH',
      fixedFee: this.formatFixedFee(cfg.makerFixedFee || cfg.takerFixedFee),
      makerFee: this.formatBps(cfg.makerPercentageFee),
      takerFee: this.formatBps(cfg.takerPercentageFee),
      source: 'contract',
    };
  }

  private pendingRows(): FeeRateRow[] {
    return FEE_CONTEXTS.map((item) => ({
      product: item.product,
      context: item.context,
      paymentToken: 'ETH' as const,
      fixedFee: '—',
      makerFee: '—',
      takerFee: '—',
      source: 'pending' as const,
    }));
  }

  private formatFixedFee(value: bigint): string {
    if (value === 0n) return '0';
    const formatted = formatUnits(value, 18);
    return `${this.trimDecimals(formatted)} token units`;
  }

  private formatBps(value: bigint): string {
    const bps = Number(value);
    return `${bps} bps (${(bps / 100).toFixed(2)}%)`;
  }

  private formatToken(address: string): string {
    if (!address || address.toLowerCase() === ZeroAddress.toLowerCase()) return this.config.network().nativeSymbol;
    const known = this.config.assets().find((asset) => asset.address.toLowerCase() === address.toLowerCase());
    if (known) return known.symbol;
    return `${address.slice(0, 6)}…${address.slice(-4)}`;
  }

  private trimDecimals(value: string): string {
    return value.replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
  }
}
