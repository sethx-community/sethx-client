import { Injectable } from '@angular/core';

export type AnalyticsEvent =
  | 'enter_app'
  | 'wallet_connect_started'
  | 'wallet_connected'
  | 'transaction_started'
  | 'transaction_blocked';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  track(_event: AnalyticsEvent, _payload: Record<string, unknown> = {}): void {
    // The downloadable client does not send analytics by default.
    // Keep this service as a no-op seam so wallet and transaction flows can
    // emit internal lifecycle events without external tracking.
  }

  trackEnterApp(_source: string = 'home_hero'): void {
    this.track('enter_app');
  }

  trackWalletConnectStarted(): void {
    this.track('wallet_connect_started');
  }

  trackWalletConnected(): void {
    this.track('wallet_connected');
  }

  trackTransactionStarted(payload: Record<string, unknown> = {}): void {
    this.track('transaction_started', payload);
  }

  trackTransactionBlocked(payload: Record<string, unknown> = {}): void {
    this.track('transaction_blocked', payload);
  }
}
