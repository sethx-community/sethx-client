import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { stableComputed } from '../../core/signals/stable-resource';

import { CURRENT_NETWORK_CONFIG } from '../../constants/network.config';
import { SethxGraphService, RecentGraphActivity } from '../../services/graph';
import { TriggerService } from '../../services/shared/trigger.service';
import { WalletConnectService } from '../../wallet/wallet-connect.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  readonly wallet = inject(WalletConnectService);
  private readonly graph = inject(SethxGraphService);
  private readonly triggers = inject(TriggerService);

  readonly networkName = CURRENT_NETWORK_CONFIG.name;
  readonly chainId = CURRENT_NETWORK_CONFIG.id;
  readonly copiedWallet = signal(false);

  readonly activityLoading = signal(false);
  readonly activityError = signal<string | null>(null);
  readonly graphConfigured = signal(Boolean(this.graph.endpoint));
  readonly recentActivities = signal<RecentGraphActivity[]>([]);
  readonly activityPage = signal(0);
  readonly activityPageSize = 4;
  readonly activityScannedRange = signal<string | null>(null);
  readonly activityScanWindow = signal<string | null>(null);
  readonly activityScannedWindows = signal(0);
  private activityRefreshRunning = false;
  private pendingActivityUpdate = false;
  private initialActivityLoaded = false;
  readonly activityRequested = signal(false);

  readonly activityPageCount = computed(() => Math.max(1, Math.ceil(this.recentActivities().length / this.activityPageSize)));
  readonly visibleActivities = stableComputed(() => {
    const pageCount = this.activityPageCount();
    const page = Math.min(Math.max(0, this.activityPage()), pageCount - 1);
    const start = page * this.activityPageSize;
    return this.recentActivities().slice(start, start + this.activityPageSize);
  });
  readonly activityPageLabel = computed(() => `${Math.min(this.activityPage() + 1, this.activityPageCount())} / ${this.activityPageCount()}`);
  readonly canPageActivityBack = computed(() => this.activityPage() > 0);
  readonly canPageActivityForward = computed(() => this.activityPage() + 1 < this.activityPageCount());

  constructor() {
    effect(() => {
      const refreshedAt = this.triggers.lastRefreshAt();
      if (!refreshedAt || !this.initialActivityLoaded) return;
      queueMicrotask(() => void this.refreshRecentActivity({ incremental: true, showLoading: false }));
    });

    // Home is only shown after a wallet is connected. Load the last-day feed
    // automatically here, while keeping graph requests constrained to
    // 10-block windows for the free-tier proxy.
    queueMicrotask(() => void this.refreshRecentActivity());
  }

  short(value: string | null | undefined): string {
    if (!value) return '—';
    return value.length > 14 ? `${value.slice(0, 6)}…${value.slice(-4)}` : value;
  }

  async copyWalletAddress(): Promise<void> {
    const address = this.wallet.address();
    if (!address) return;

    try {
      await navigator.clipboard.writeText(address);
      this.copiedWallet.set(true);
      setTimeout(() => this.copiedWallet.set(false), 1400);
    } catch {
      this.copiedWallet.set(false);
    }
  }

  async refreshRecentActivity(options: { incremental?: boolean; showLoading?: boolean } = {}): Promise<void> {
    this.activityRequested.set(true);
    const incremental = options.incremental === true;
    const showLoading = options.showLoading ?? !incremental;

    if (this.activityRefreshRunning) {
      if (incremental) this.pendingActivityUpdate = true;
      return;
    }

    if (!this.graph.endpoint) {
      this.graphConfigured.set(false);
      this.recentActivities.set([]);
      this.activityPage.set(0);
      this.activityScannedRange.set(null);
      this.activityScanWindow.set(null);
      this.activityScannedWindows.set(0);
      this.initialActivityLoaded = true;
      return;
    }

    this.activityRefreshRunning = true;
    if (showLoading) this.activityLoading.set(true);
    this.activityError.set(null);

    if (!incremental) {
      this.recentActivities.set([]);
      this.activityPage.set(0);
      this.activityScannedRange.set(null);
      this.activityScanWindow.set(null);
      this.activityScannedWindows.set(0);
    }

    try {
      const request = {
        lookbackSeconds: 24 * 60 * 60,
        onProgress: (progress: { currentWindow?: { fromBlock: number; toBlock: number }; scannedRange?: { fromBlock: number; toBlock: number }; scannedWindows: number; activities: RecentGraphActivity[] }) => {
          this.activityScannedRange.set(this.formatScannedRange(progress.scannedRange));
          this.activityScanWindow.set(this.formatScannedRange(progress.currentWindow));
          this.activityScannedWindows.set(progress.scannedWindows);
          this.recentActivities.set(progress.activities);
        },
      };

      const result = incremental
        ? await this.graph.updateRecentActivity(request)
        : await this.graph.recentActivity(request);

      this.graphConfigured.set(result.status !== 'not-configured');
      this.recentActivities.set(result.activities);
      if (!incremental) this.activityPage.set(0);
      this.activityError.set(result.status === 'error' ? result.error ?? 'Unable to load recent protocol activity.' : null);
      this.activityScannedRange.set(this.formatScannedRange(result.scannedRange));
      this.activityScanWindow.set(null);
      this.activityScannedWindows.set(result.scannedWindows ?? this.activityScannedWindows());
      this.initialActivityLoaded = true;
    } finally {
      this.activityRefreshRunning = false;
      if (showLoading) this.activityLoading.set(false);

      if (this.pendingActivityUpdate) {
        this.pendingActivityUpdate = false;
        void this.refreshRecentActivity({ incremental: true, showLoading: false });
      }
    }
  }

  previousActivityPage(): void {
    this.activityPage.update((page) => Math.max(0, page - 1));
  }

  nextActivityPage(): void {
    if (!this.canPageActivityForward()) return;
    this.activityPage.update((page) => Math.min(this.activityPageCount() - 1, page + 1));
  }

  private formatScannedRange(range: { fromBlock: number; toBlock: number } | undefined): string | null {
    return range ? `${range.fromBlock.toLocaleString()} – ${range.toBlock.toLocaleString()}` : null;
  }

  trackActivity(_: number, activity: RecentGraphActivity): string {
    return activity.id;
  }
}
