import { Injectable, signal } from '@angular/core';

export type LendingMarketSelection = {
  marketKey: string;
  label: string;
  riskLevel: number;
  expiry: number;
};

@Injectable({ providedIn: 'root' })
export class LendingMarketSelectionService {
  readonly selectedMarketKey = signal<string | null>(null);
  readonly selectedMarketLabel = signal<string>('No lending market selected');
  readonly selectedRiskLevel = signal<number | null>(null);
  readonly selectedExpiry = signal<number | null>(null);

  setMarket(market: LendingMarketSelection): void {
    this.selectedMarketKey.set(market.marketKey);
    this.selectedMarketLabel.set(market.label);
    this.selectedRiskLevel.set(market.riskLevel);
    this.selectedExpiry.set(market.expiry);
  }

  clear(): void {
    this.selectedMarketKey.set(null);
    this.selectedMarketLabel.set('No lending market selected');
    this.selectedRiskLevel.set(null);
    this.selectedExpiry.set(null);
  }
}
