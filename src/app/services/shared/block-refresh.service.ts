import { Injectable, OnDestroy, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { WebSocketProvider } from 'ethers';

import { environment } from '../../../environments/environment';
import { REFRESH_INTERVAL_MS } from '../../constants/refresh.constants';
import { TriggerService } from './trigger.service';

@Injectable({ providedIn: 'root' })
export class BlockRefreshService implements OnDestroy {
  private readonly router = inject(Router);
  private readonly triggers = inject(TriggerService);

  private provider: WebSocketProvider | null = null;
  private fallbackTimer: ReturnType<typeof setTimeout> | null = null;
  private currentUrl = this.router.url;
  private refreshRunning = false;
  private pendingRefresh = false;
  private started = false;

  constructor() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) this.currentUrl = event.urlAfterRedirects;
    });
  }

  start(): void {
    if (this.started) return;
    this.started = true;

    const wsUrl = this.websocketRpcUrl();
    if (wsUrl) {
      this.connectWebsocket(wsUrl);
      return;
    }

    this.scheduleFallbackRefresh();
  }

  ngOnDestroy(): void {
    this.clearFallbackRefresh();
    if (this.provider) {
      void this.provider.destroy().catch(() => undefined);
      this.provider = null;
    }
  }

  private websocketRpcUrl(): string {
    const explicit = (environment as { websocketRpcUrl?: string }).websocketRpcUrl?.trim();
    if (explicit) return explicit;

    const rpcUrl = environment.rpcUrl?.trim();
    if (!rpcUrl) return '';
    if (rpcUrl.startsWith('ws://') || rpcUrl.startsWith('wss://')) return rpcUrl;
    if (rpcUrl.startsWith('http://')) return `ws://${rpcUrl.slice('http://'.length)}`;
    if (rpcUrl.startsWith('https://')) return `wss://${rpcUrl.slice('https://'.length)}`;
    return '';
  }

  private connectWebsocket(wsUrl: string): void {
    try {
      this.provider = new WebSocketProvider(wsUrl);
      this.provider.on('block', () => this.requestRefresh());
      const socket = (this.provider as unknown as { websocket?: { addEventListener?: (event: string, handler: () => void) => void; on?: (event: string, handler: () => void) => void } }).websocket;
      socket?.addEventListener?.('close', () => this.startFallbackAfterDisconnect());
      socket?.addEventListener?.('error', () => this.startFallbackAfterDisconnect());
      socket?.on?.('close', () => this.startFallbackAfterDisconnect());
      socket?.on?.('error', () => this.startFallbackAfterDisconnect());
    } catch {
      this.startFallbackAfterDisconnect();
    }
  }

  private startFallbackAfterDisconnect(): void {
    if (this.provider) {
      void this.provider.destroy().catch(() => undefined);
      this.provider = null;
    }
    this.scheduleFallbackRefresh();
  }

  private requestRefresh(): void {
    if (this.refreshRunning) {
      this.pendingRefresh = true;
      return;
    }

    this.refreshRunning = true;
    this.triggers.refreshActiveRoute(this.currentUrl, true);

    window.setTimeout(() => {
      this.refreshRunning = false;
      if (this.pendingRefresh) {
        this.pendingRefresh = false;
        this.requestRefresh();
      }
    }, 1_000);
  }

  private scheduleFallbackRefresh(): void {
    this.clearFallbackRefresh();
    this.fallbackTimer = setTimeout(() => {
      this.fallbackTimer = null;
      this.requestRefresh();
      this.scheduleFallbackRefresh();
    }, REFRESH_INTERVAL_MS);
  }

  private clearFallbackRefresh(): void {
    if (this.fallbackTimer !== null) {
      clearTimeout(this.fallbackTimer);
      this.fallbackTimer = null;
    }
  }
}
