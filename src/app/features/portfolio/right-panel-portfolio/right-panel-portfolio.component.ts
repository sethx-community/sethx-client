import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TradeSettingsComponent } from '../../../components/trade-settings/trade-settings.component';
import { WalletActionsComponent } from '../../../components/wallet-actions/wallet-actions.component';

@Component({
  selector: 'app-right-panel-portfolio',
  standalone: true,
  imports: [CommonModule, TradeSettingsComponent, WalletActionsComponent],
  templateUrl: './right-panel-portfolio.component.html',
})
export class RightPanelPortfolioComponent {}
