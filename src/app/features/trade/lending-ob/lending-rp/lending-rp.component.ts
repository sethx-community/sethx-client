import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';

import { TradeSettingsComponent } from '../../../../components/trade-settings/trade-settings.component';
import { OrderFlowLauncherComponent } from '../../../../core/overlay/order-flow-launcher/order-flow-launcher.component';
import {
  lendingOrderbookPageActions,
  LendingOrderbookPageCtx,
} from '../../../../core/overlay/order-flow-launcher/order-flow-actions/lending-orderbook-flow-actions';
import { LendingMarketSelectionService } from '../../../../services/shared/lending-market/lending-market-selection.service';
import { AccountsChainService } from '../../../../services/onchain/accounts.service';
import { TradeSettingsService } from '../../../../services/shared/trade-settings.service';
import { TreasuryModeService } from '../../../../services/shared/treasury-mode.service';

@Component({
  selector: 'app-right-panel-lending-orderbook',
  standalone: true,
  imports: [CommonModule, TradeSettingsComponent, OrderFlowLauncherComponent],
  templateUrl: './lending-rp.component.html',
  styleUrl: './lending-rp.component.scss',
})
export class LendingRpComponent {
  private readonly selection = inject(LendingMarketSelectionService);
  private readonly accounts = inject(AccountsChainService);
  private readonly settings = inject(TradeSettingsService);
  private readonly treasuryMode = inject(TreasuryModeService);

  readonly actions = lendingOrderbookPageActions;
  readonly ctx = computed<LendingOrderbookPageCtx>(() => ({
    selectedMarketKey: this.selection.selectedMarketKey(),
    selectedMarketLabel: this.selection.selectedMarketLabel(),
    selectedRiskLevel: this.selection.selectedRiskLevel(),
    selectedExpiry: this.selection.selectedExpiry(),
    selectedMaxLtvBps: this.selection.selectedMaxLtvBps(),
    selectedLiquidationLtvBps: this.selection.selectedLiquidationLtvBps(),
    selectedAccountType: this.selectedAccountType(),
    selectedAccountLabel: this.selectedAccountLabel(),
  }));

  readonly selectedAccountType = computed<'normal' | 'lending' | null>(() => {
    if (this.treasuryMode.canUse('lend')) return 'normal';

    const account = this.settings.selectedAccountId();
    if (!account) return null;

    const type = this.accounts.accountType(account);
    return type === 'normal' || type === 'lending' ? type : null;
  });

  readonly selectedAccountLabel = computed(() => {
    if (this.treasuryMode.canUse('lend')) {
      const account = this.treasuryMode.selectedTreasuryAccount();
      return account ? `Treasury ${this.treasuryMode.short(account)}` : null;
    }
    const account = this.settings.selectedAccountId();
    return account ? this.accounts.accountLabel(account) : null;
  });

  readonly selectedMarketKey = this.selection.selectedMarketKey;
  readonly selectedMarketLabel = this.selection.selectedMarketLabel;
  readonly selectedRiskLevel = this.selection.selectedRiskLevel;
  readonly selectedExpiry = this.selection.selectedExpiry;
  readonly copiedValue = signal<string | null>(null);

  selectedExpiryLabel(): string {
    const seconds = Number(this.selectedExpiry() ?? 0);
    if (!seconds) return '—';
    const d = new Date(seconds * 1000);
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
  }

  async copyValue(value: string | null | undefined, ev?: Event): Promise<void> {
    ev?.stopPropagation?.();
    const text = String(value ?? '');
    if (!text) return;
    try {
      await navigator.clipboard?.writeText(text);
      this.copiedValue.set(text);
      setTimeout(() => {
        if (this.copiedValue() === text) this.copiedValue.set(null);
      }, 1200);
    } catch {
      this.copiedValue.set(text);
    }
  }

  clearMarket(): void {
    this.selection.clear();
  }
}
