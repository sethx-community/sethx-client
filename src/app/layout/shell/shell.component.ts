import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NavigationEnd, Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { WalletConnectComponent } from '../../wallet/wallet-connect/wallet-connect.component';
import { WalletStateComponent } from '../../wallet/wallet-state/wallet-state.component';
import { WalletConnectService } from '../../wallet/wallet-connect.service';
import { NetworkStatusService } from '../../services/shared/network-status.service';
import { AccessLayerService } from '../../services/shared/access/access-layer.service';
import { TreasuryModeService } from '../../services/shared/treasury-mode.service';
import { ThemeService } from '../../services/shared/theme/theme.service';
import { ClientLandingComponent } from '../../features/landing/client-landing.component';

@Component({
  selector: 'app-shell',
  imports: [
    CommonModule,
    WalletConnectComponent,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    WalletStateComponent,
    ClientLandingComponent,
  ],
  templateUrl: './shell.component.html',
})
export class ShellComponent {
  wallet = inject(WalletConnectService);
  readonly network = inject(NetworkStatusService);
  readonly access = inject(AccessLayerService);
  readonly treasuryMode = inject(TreasuryModeService);
  private readonly router = inject(Router);
  readonly theme = inject(ThemeService);

  walletAddress = this.wallet.address;
  readonly hasTreasuryAccess = this.access.hasTreasuryAccess;
  readonly currentUrl = signal(this.router.url);

  constructor() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) this.currentUrl.set(event.urlAfterRedirects);
    });

    effect(() => {
      const address = this.walletAddress();
      if (!address) {
        this.treasuryMode.reset();
        return;
      }
      if (this.hasTreasuryAccess()) void this.treasuryMode.refresh(true);
      else this.treasuryMode.reset();
    });
  }

  onThemeToggle(): void {
    this.theme.toggleTheme();
  }

  onTreasuryModeChange(event: Event): void {
    const enabled = (event.target as HTMLInputElement | null)?.checked === true;
    this.treasuryMode.setActingAsTreasurer(enabled);
  }

  onTreasuryAccountChange(event: Event): void {
    const account = (event.target as HTMLSelectElement | null)?.value ?? '';
    this.treasuryMode.selectTreasuryAccount(account);
  }

  readonly unsupportedTreasuryOrderbookSegments = [
    'optionstrade',
    'futurestrade',
    'nftspottrade',
    'binaryoptionstrade',
    'marginoptionstrade',
  ];

  treasuryNavDisabled(segment: string): boolean {
    return this.treasuryMode.actingAsTreasurer() && this.unsupportedTreasuryOrderbookSegments.includes(segment);
  }

  treasuryDisabledTitle(segment: string): string | null {
    return this.treasuryNavDisabled(segment) ? 'not activated for treasury' : null;
  }

  onUnsupportedTreasuryNav(event: MouseEvent, segment: string): void {
    if (!this.treasuryNavDisabled(segment)) return;
    event.preventDefault();
    event.stopPropagation();
  }

  unsupportedTreasuryRoute(): boolean {
    if (!this.treasuryMode.actingAsTreasurer()) return false;
    const url = this.currentUrl();
    return this.unsupportedTreasuryOrderbookSegments.some((segment) => url.includes(segment));
  }
}

