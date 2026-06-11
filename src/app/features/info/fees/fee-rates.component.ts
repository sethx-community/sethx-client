import { CommonModule } from '@angular/common';
import { Component, computed, inject, resource } from '@angular/core';
import { stableComputed, stableResourceValue } from '../../../core/signals/stable-resource';
import { formatEther } from 'ethers';

import { FeeService } from '../../../services/shared/fee.service';
import { ProtocolConfigService } from '../../../services/shared/config/protocol-config.service';
import { FeeManagerContractService } from '../../../services/onchain/contracts/fee-manager-contract.service';

type FeeContextRead = {
  contract: string;
  label: string;
  context: string;
  configured: boolean;
  makerFixedFee: bigint;
  makerPercentageFee: bigint;
  takerFixedFee: bigint;
  takerPercentageFee: bigint;
  status: 'Configured' | 'Pending or zero' | 'Read error';
  error?: string;
};

const FEE_CONTEXTS = [
  { label: 'ERC20 Spot fee table', context: 'ERC20 Spot Trade' },
  { label: 'NFT Spot fee table', context: 'ERC721 Spot Trade' },
  { label: 'Options fee table', context: 'Options Trade' },
  { label: 'Margin Options fee table', context: 'Margin Option Trade' },
  { label: 'Binary Options fee table', context: 'Binary Option Trade' },
  { label: 'Futures fee table', context: 'Futures Trade' },
] as const;

@Component({
  selector: 'app-fee-rates',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fee-rates.component.html',
})
export class FeeRatesComponent {
  private readonly feeService = inject(FeeService);
  private readonly feeManager = inject(FeeManagerContractService);
  private readonly protocolConfig = inject(ProtocolConfigService);

  readonly feeNote = computed(() => this.protocolConfig.config().fees.note);
  readonly acceptedTokens = this.feeService.acceptedPaymentTokens;
  readonly sethxToken = this.feeService.sethxToken;
  readonly acceptedTokenStatus = this.feeService.acceptedPaymentTokensStatus;
  readonly sethxTokenStatus = this.feeService.sethxTokenStatus;

  private readonly _feeContextsRes = resource<FeeContextRead[], {}>({
    params: () => ({}),
    loader: async () => {
      return await Promise.all(
        FEE_CONTEXTS.map(async ({ label, context }) => {
          try {
            const config = await this.feeManager.getRoleFeeConfig(context);
            return {
              contract: 'FeeManager',
              label,
              context,
              configured: config.configured,
              makerFixedFee: config.makerFixedFee,
              makerPercentageFee: config.makerPercentageFee,
              takerFixedFee: config.takerFixedFee,
              takerPercentageFee: config.takerPercentageFee,
              status: config.configured ? 'Configured' : 'Pending or zero',
            } satisfies FeeContextRead;
          } catch (error) {
            return {
              contract: 'FeeManager',
              label,
              context,
              configured: false,
              makerFixedFee: 0n,
              makerPercentageFee: 0n,
              takerFixedFee: 0n,
              takerPercentageFee: 0n,
              status: 'Read error',
              error: this.errorMessage(error),
            } satisfies FeeContextRead;
          }
        }),
      );
    },
  });

  private readonly _stableFeeContexts = stableResourceValue(() => this._feeContextsRes.value(), [] as FeeContextRead[], {
    keepPreviousWhen: (previous, next) => previous.length > 0 && next.length === 0,
  });
  readonly feeContexts = stableComputed(() => this._stableFeeContexts());
  readonly feeContextStatus = computed(() => this._feeContextsRes.status());
  readonly configuredCount = computed(
    () => this.feeContexts().filter((row) => row.configured).length,
  );
  readonly readErrorCount = computed(
    () => this.feeContexts().filter((row) => row.status === 'Read error').length,
  );

  constructor() {
    this.refresh();
  }


  trackFeeContext(_: number, row: FeeContextRead): string {
    return row.context;
  }

  trackToken(_: number, token: string): string {
    return token;
  }

  refresh(): void {
    this.feeService.refreshAcceptedPaymentTokens();
    this.feeService.refreshSethxToken();
    this._feeContextsRes.reload();
  }

  short(value: string | null | undefined): string {
    if (!value) return '—';
    return value.length > 14 ? `${value.slice(0, 6)}…${value.slice(-4)}` : value;
  }

  statusTone(status: FeeContextRead['status']): string {
    if (status === 'Configured') return 'is-ok';
    if (status === 'Read error') return 'is-critical';
    return 'is-attention';
  }

  formatFeeConfig(row: FeeContextRead): string {
    if (row.status === 'Read error') return row.error ?? 'Read failed';

    return [
      `Maker ${this.formatEth(row.makerFixedFee)} ETH + ${this.formatBps(row.makerPercentageFee)}`,
      `Taker ${this.formatEth(row.takerFixedFee)} ETH + ${this.formatBps(row.takerPercentageFee)}`,
    ].join(' / ');
  }

  executionText(row: FeeContextRead): string {
    return row.configured ? 'Active now' : '—';
  }

  private formatBps(value: bigint): string {
    if (value === 0n) return '0 bps';
    return `${value.toString()} bps`;
  }

  private formatEth(value: bigint): string {
    if (value === 0n) return '0';

    const formatted = formatEther(value);
    return formatted.replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
  }

  private errorMessage(error: unknown): string {
    if (error instanceof Error && error.message) return error.message;
    return String(error ?? 'Unknown read error');
  }
}
