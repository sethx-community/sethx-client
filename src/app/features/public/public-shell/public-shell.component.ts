import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { WalletConnectComponent } from '../../../wallet/wallet-connect/wallet-connect.component';
import { LanguageService, SupportedLanguage } from '../../../services/shared/i18n/language.service';
import { TranslationPipe } from '../../../services/shared/i18n/t.pipe';
import { AnalyticsService } from '../../../services/shared/compliance/analytics.service';
import { ThemeService } from '../../../services/shared/theme/theme.service';
import { TranslationKey } from '../../../services/shared/i18n/translations';

interface PublicNavItem {
  labelKey: TranslationKey;
  link: string;
  exact: boolean;
  fragment?: string;
}

interface PublicFooterLink {
  labelKey: TranslationKey;
  link: string;
}

@Component({
  selector: 'app-public-shell',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, WalletConnectComponent, TranslationPipe],
  templateUrl: './public-shell.component.html',
})
export class PublicShellComponent {
  readonly language = inject(LanguageService);
  private readonly analytics = inject(AnalyticsService);
  readonly theme = inject(ThemeService);

  readonly primaryNav: readonly PublicNavItem[] = [
    { labelKey: 'nav.home', link: '/', exact: true },
    { labelKey: 'nav.docs', link: '/docs', exact: false },
    { labelKey: 'nav.fees', link: '/fees', exact: false },
    { labelKey: 'nav.risk', link: '/risk', exact: false },
    { labelKey: 'nav.governance', link: '/governance', exact: false },
    { labelKey: 'nav.protocol', link: '/protocol', exact: false },
    { labelKey: 'nav.community', link: '/community', exact: false },
  ];

  readonly footerLinks: readonly PublicFooterLink[] = [
    { labelKey: 'footer.risk', link: '/risk' },
    { labelKey: 'footer.privacy', link: '/privacy' },
    { labelKey: 'footer.cookies', link: '/cookies' },
    { labelKey: 'footer.protocol', link: '/protocol' },
    { labelKey: 'footer.governance', link: '/governance' },
  ];

  onThemeToggle(): void {
    this.theme.toggleTheme();
  }

  trackEnterApp(): void {
    this.analytics.trackEnterApp('public_nav');
  }

  setLanguage(value: string): void {
    this.language.setLanguage(value as SupportedLanguage);
  }
}
