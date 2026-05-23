import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { LanguageService } from '../../services/shared/i18n/language.service';
import { PUBLIC_CONTENT } from '../../services/shared/i18n/public-content';
import { WalletConnectService } from '../../wallet/wallet-connect.service';
import { AnalyticsService } from '../../services/shared/compliance/analytics.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit, OnDestroy {
  readonly wallet = inject(WalletConnectService);
  readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly document = inject(DOCUMENT);
  private readonly language = inject(LanguageService);
  private readonly analytics = inject(AnalyticsService);

  readonly content = computed(() => PUBLIC_CONTENT[this.language.language()].home);
  readonly accessNotice = computed(() => this.accessNoticeFromReason(this.route.snapshot.queryParamMap.get('reason')));

  ngOnInit(): void {
    this.document.documentElement.classList.add('home-scroll-snap');
    this.document.body.classList.add('home-scroll-snap');
  }

  ngOnDestroy(): void {
    this.document.documentElement.classList.remove('home-scroll-snap');
    this.document.body.classList.remove('home-scroll-snap');
  }

  private accessNoticeFromReason(reason: string | null): string | null {
    if (!reason) return null;
    const access = this.content().access;
    if (reason === 'requires-wallet') return access['requires-wallet'];
    if (reason === 'country-restricted') return access['country-restricted'];
    if (reason.startsWith('requires-')) return access['default'];
    return null;
  }

  openExchange(): void {
    if (!this.wallet.address()) return;
    this.analytics.trackEnterApp('home_hero');
    void this.router.navigate([
      '/app',
      { outlets: { primary: ['accounts'], 'right-panel': ['accountsRightPanel'] } },
    ]);
  }
}
