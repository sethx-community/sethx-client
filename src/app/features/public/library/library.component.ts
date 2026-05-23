import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { formatUnits } from 'ethers';
import { FeeManagerContractService } from '../../../services/onchain/contracts/fee-manager-contract.service';
import { LanguageService } from '../../../services/shared/i18n/language.service';
import { PUBLIC_CONTENT } from '../../../services/shared/i18n/public-content';

type LibraryFeeRateRow = {
  product: string;
  context: string;
  paymentToken: 'ETH';
  fixedFee: string;
  makerFee: string;
  takerFee: string;
  source: 'contract' | 'pending';
};

type LibraryFeeRateGroup = {
  product: string;
  context: string;
  rows: LibraryFeeRateRow[];
};

const TRADE_FEE_CONTEXTS: Array<{ product: string; context: string }> = [
  { product: 'Token spot trade', context: 'ERC20 Spot Trade' },
  { product: 'NFT spot trade', context: 'ERC721 Spot Trade' },
  { product: 'Futures trade', context: 'Futures Trade' },
  { product: 'Options trade', context: 'Options Trade' },
  { product: 'Binary option trade', context: 'Binary Option Trade' },
  { product: 'Margin option trade', context: 'Margin Option Trade' },
];

@Component({
  selector: 'app-library',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './library.component.html',
})
export class LibraryComponent implements OnInit, OnDestroy {
  private readonly language = inject(LanguageService);
  private readonly document = inject(DOCUMENT);
  private readonly feeManager = inject(FeeManagerContractService);
  private readonly route = inject(ActivatedRoute);

  readonly content = computed(() => PUBLIC_CONTENT[this.language.language()].library);
  readonly feeRates = signal<LibraryFeeRateRow[]>(this.pendingFeeRows());
  readonly feeRateGroups = computed<LibraryFeeRateGroup[]>(() => this.groupFeeRates(this.feeRates()));
  readonly feeRateStatus = signal<'loading' | 'loaded' | 'error'>('loading');

  ngOnInit(): void {
    this.document.documentElement.classList.add('home-scroll-snap');
    this.document.body.classList.add('home-scroll-snap');
    const fragment = this.route.snapshot.fragment;
    if (fragment) {
      this.document.defaultView?.requestAnimationFrame(() => {
        this.document.getElementById(fragment)?.scrollIntoView({ behavior: 'auto', block: 'start' });
      });
    }
    void this.loadFeeRates();
  }

  ngOnDestroy(): void {
    this.document.documentElement.classList.remove('home-scroll-snap');
    this.document.body.classList.remove('home-scroll-snap');
  }

  feeSourceLabel(row: LibraryFeeRateRow): string {
    return row.source === 'contract' ? this.content().fees.ratesSourceContract : this.content().fees.ratesSourcePending;
  }

  async loadFeeRates(): Promise<void> {
    this.feeRateStatus.set('loading');
    try {
      await this.feeManager.getSethxToken().catch(() => null);
      const rows = await Promise.all(TRADE_FEE_CONTEXTS.map((item) => this.readRoleRate(item)));
      this.feeRates.set(rows);
      this.feeRateStatus.set('loaded');
    } catch {
      this.feeRates.set(this.pendingFeeRows());
      this.feeRateStatus.set('error');
    }
  }


  scrollToSection(event: Event, target: string): void {
    event.preventDefault();
    this.document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  closePopup(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    const target = event.target as HTMLElement | null;
    target?.closest('details')?.removeAttribute('open');
  }

  private groupFeeRates(rows: LibraryFeeRateRow[]): LibraryFeeRateGroup[] {
    const groups = new Map<string, LibraryFeeRateGroup>();
    for (const row of rows) {
      const key = `${row.product}::${row.context}`;
      const existing = groups.get(key);
      if (existing) {
        existing.rows.push(row);
      } else {
        groups.set(key, { product: row.product, context: row.context, rows: [row] });
      }
    }
    return Array.from(groups.values()).map((group) => ({
      ...group,
      rows: group.rows.sort((a, b) => (a.paymentToken === 'ETH' ? -1 : 1) - (b.paymentToken === 'ETH' ? -1 : 1)),
    }));
  }

  private async readRoleRate(item: { product: string; context: string }): Promise<LibraryFeeRateRow> {
    const cfg = await this.feeManager.getRoleFeeConfig(item.context);
    return {
      product: item.product,
      context: item.context,
      paymentToken: 'ETH',
      fixedFee: this.formatFixedFee(cfg.makerFixedFee || cfg.takerFixedFee),
      makerFee: this.formatBps(cfg.makerPercentageFee),
      takerFee: this.formatBps(cfg.takerPercentageFee),
      source: 'contract' as const,
    };
  }

  private pendingFeeRows(): LibraryFeeRateRow[] {
    return TRADE_FEE_CONTEXTS.flatMap((item) => [
      {
        product: item.product,
        context: item.context,
        paymentToken: 'ETH' as const,
        fixedFee: '—',
        makerFee: '—',
        takerFee: '—',
        source: 'pending' as const,
      },
    ]);
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

  private trimDecimals(value: string): string {
    return value.replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
  }

}
