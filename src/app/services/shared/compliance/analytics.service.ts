import { Injectable, effect, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

import { CookieConsentService } from './cookie-consent.service';
import { ProtocolConfigService } from '../config/protocol-config.service';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly consent = inject(CookieConsentService);
  private readonly router = inject(Router);
  private readonly protocolConfig = inject(ProtocolConfigService);
  private initialized = false;

  constructor() {
    effect(() => {
      if (this.consent.state() === 'accepted') this.initializeGoogleAnalytics();
    });

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => this.trackPageView(event.urlAfterRedirects));
  }

  trackEnterApp(source: 'public_nav' | 'home_hero' = 'public_nav'): void {
    this.trackEvent('enter_app', { source });
  }

  trackWalletConnectStarted(): void {
    this.trackEvent('wallet_connect_started');
  }

  trackWalletConnected(): void {
    this.trackEvent('wallet_connected');
  }

  trackEvent(name: string, params: Record<string, unknown> = {}): void {
    if (!this.initialized || this.consent.state() !== 'accepted' || !window.gtag) return;

    window.gtag('event', name, {
      ...params,
      app_area: 'sethx',
      non_interaction: false,
    });
  }

  private initializeGoogleAnalytics(): void {
    const measurementId = this.protocolConfig.compliance().analyticsMeasurementId;
    if (this.initialized || typeof document === 'undefined' || measurementId.includes('REPLACE')) return;

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer ?? [];
    window.gtag = window.gtag ?? function gtag(...args: unknown[]) {
      window.dataLayer?.push(args);
    };

    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
      anonymize_ip: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      send_page_view: false,
    });

    this.initialized = true;
    this.trackPageView(this.router.url);
  }

  private trackPageView(path: string): void {
    if (!this.initialized || this.consent.state() !== 'accepted' || !window.gtag) return;

    window.gtag('event', 'page_view', {
      page_path: path,
      page_location: `${window.location.origin}${path}`,
      page_title: document.title,
    });
  }
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}
