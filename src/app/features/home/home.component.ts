import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';

import { CURRENT_NETWORK_CONFIG } from '../../constants/network.config';
import { SethxGraphService, RecentGraphActivity } from '../../services/graph';
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

  readonly networkName = CURRENT_NETWORK_CONFIG.name;
  readonly chainId = CURRENT_NETWORK_CONFIG.id;
  readonly copiedWallet = signal(false);

  readonly activityLoading = signal(false);
  readonly activityError = signal<string | null>(null);
  readonly graphConfigured = signal(Boolean(this.graph.endpoint));
  readonly recentActivities = signal<RecentGraphActivity[]>([]);
  readonly activityPage = signal(0);
  readonly activityPageSize = 4;

  readonly activityPageCount = computed(() => Math.max(1, Math.ceil(this.recentActivities().length / this.activityPageSize)));
  readonly visibleActivities = computed(() => {
    const pageCount = this.activityPageCount();
    const page = Math.min(Math.max(0, this.activityPage()), pageCount - 1);
    const start = page * this.activityPageSize;
    return this.recentActivities().slice(start, start + this.activityPageSize);
  });
  readonly activityPageLabel = computed(() => `${Math.min(this.activityPage() + 1, this.activityPageCount())} / ${this.activityPageCount()}`);
  readonly canPageActivityBack = computed(() => this.activityPage() > 0);
  readonly canPageActivityForward = computed(() => this.activityPage() + 1 < this.activityPageCount());

  constructor() {
    void this.refreshRecentActivity();
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

  async refreshRecentActivity(): Promise<void> {
    if (!this.graph.endpoint) {
      this.graphConfigured.set(false);
      this.recentActivities.set([]);
      this.activityPage.set(0);
      return;
    }

    this.activityLoading.set(true);
    this.activityError.set(null);

    const result = await this.graph.recentActivity(24);
    this.graphConfigured.set(result.status !== 'not-configured');
    this.recentActivities.set(result.activities);
    this.activityError.set(result.status === 'error' ? result.error ?? 'Unable to load recent indexed activity.' : null);
    this.activityPage.update((page) => Math.min(page, Math.max(0, Math.ceil(result.activities.length / this.activityPageSize) - 1)));
    this.activityLoading.set(false);
  }

  previousActivityPage(): void {
    this.activityPage.update((page) => Math.max(0, page - 1));
  }

  nextActivityPage(): void {
    this.activityPage.update((page) => Math.min(this.activityPageCount() - 1, page + 1));
  }

  trackActivity(_: number, activity: RecentGraphActivity): string {
    return activity.id;
  }
}
