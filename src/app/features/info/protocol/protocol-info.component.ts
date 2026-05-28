import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { ethers } from 'ethers';

import { ProtocolConfigService } from '../../../services/shared/config/protocol-config.service';
import { ProtocolDataService } from '../../../services/shared/data/protocol-data.service';

@Component({
  selector: 'app-protocol-info',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './protocol-info.component.html',
})
export class ProtocolInfoComponent {
  readonly protocolConfig = inject(ProtocolConfigService);
  readonly protocolData = inject(ProtocolDataService);

  readonly network = this.protocolConfig.network;
  readonly products = this.protocolConfig.products;
  readonly assets = this.protocolConfig.assets;
  readonly live = this.protocolData.liveOverview;
  readonly contracts = computed(() => this.buildContractRows());
  readonly keyContracts = computed(() => this.contracts().filter((row) => row.priority));

  constructor() {
    this.protocolData.warmLiveReads();
  }

  refresh(): void {
    this.protocolData.warmLiveReads();
  }

  short(value: string | null | undefined): string {
    if (!value) return '—';
    return value.length > 14 ? `${value.slice(0, 6)}…${value.slice(-4)}` : value;
  }

  formatToken(value: bigint | null, decimals = 18): string {
    if (value == null) return '—';
    try {
      const formatted = ethers.formatUnits(value, decimals);
      const [whole, fraction = ''] = formatted.split('.');
      const trimmed = fraction.slice(0, 6).replace(/0+$/, '');
      return trimmed ? `${whole}.${trimmed}` : whole;
    } catch {
      return value.toString();
    }
  }

  trackByName(_: number, row: { name: string }): string {
    return row.name;
  }

  private buildContractRows(): { name: string; address: string; description: string; priority: boolean }[] {
    const descriptions: Record<string, string> = {
      SethxToken: 'Protocol token used for voting power, delegation, and ecosystem alignment.',
      SethxTimelock: 'Timelock layer for delayed execution of approved governance actions.',
      SethxGovernor: 'Governance contract for proposals, voting, queueing, and execution.',
      ProtocolTreasury: 'Protocol treasury balances, permissions, and treasury-controlled operations.',
      TreasuryAuthority: 'Treasury permission and policy authority.',
      SethxVault: 'Vault for deposits, locked balances, settlement transfers, and withdrawals.',
      AccountRegistry: 'Registry that verifies SETHX trading and lending accounts.',
      AccountFactory: 'Factory for SETHX trading accounts.',
      LendingAccountFactory: 'Factory for lending-oriented borrowing accounts.',
      FeeManager: 'Contract that exposes fixed and percentage fee settings for trade contexts.',
      PriceManager: 'Oracle registry and price-read layer for supported markets.',
      TokenSpotOrderBook: 'ERC20 token spot orderbook.',
      NFTSpotOrderBook: 'NFT spot orderbook.',
      FuturesContract: 'Futures position, margin, settlement, and liquidation logic.',
      FuturesOrderBook: 'Futures order placement, matching, cancellation, and fee flow.',
      OptionContract: 'Vanilla option market, position, exercise, and reclaim logic.',
      OptionsOrderBook: 'Vanilla option order placement, matching, cancellation, and fee flow.',
      BinaryMarginOptionContract: 'Binary option position, settlement, claim, and reclaim logic.',
      BinaryMarginOptionsOrderBook: 'Binary option order placement, matching, cancellation, and fee flow.',
      MarginOptionContract: 'Margin option position, settlement, claim, and margin logic.',
      MarginOptionsOrderBook: 'Margin option order placement, matching, cancellation, and fee flow.',
      LendingContract: 'Loan state, collateral, repayment, and liquidation logic.',
      LendingOrderbook: 'Lending orderbook for ETH loan offers and borrow flow.',
      SettlementManager: 'Settlement collections, payouts, and settlement accounting.',
      RiskModule: 'Risk tier, LTV, collateral and liquidation-related rules.',
      ValuationModule: 'Valuation reads used for collateral and risk calculations.',
      LiquidationEngine: 'Liquidation execution for undercollateralized borrowing accounts.',
    };

    const priority = new Set([
      'SethxToken',
      'SethxGovernor',
      'SethxTimelock',
      'TreasuryAuthority',
      'ProtocolTreasury',
      'SethxVault',
      'AccountRegistry',
      'FeeManager',
      'PriceManager',
    ]);

    return Object.entries(this.protocolConfig.contracts())
      .filter(([name, address]) => Boolean(address) && !name.toLowerCase().includes('mock'))
      .map(([name, address]) => ({
        name,
        address,
        description: descriptions[name] ?? 'Configured deployed SETHX protocol contract.',
        priority: priority.has(name),
      }));
  }
}
