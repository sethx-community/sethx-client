import { Injectable, signal, computed, resource, inject } from '@angular/core';
import { createAppKit } from '@reown/appkit';
import { EthersAdapter } from '@reown/appkit-adapter-ethers';
import { mainnet, arbitrum, hardhat, sepolia } from '@reown/appkit/networks';
import { ethers } from 'ethers';
import { environment } from '../../environments/environment';
import { CURRENT_NETWORK_CONFIG } from '../constants/network.config';
import { ErrorService } from '../services/shared/error.service';
import { TriggerService } from '../services/shared/trigger.service';
import { NetworkStatusService } from '../services/shared/network-status.service';
import { AnalyticsService } from '../services/shared/compliance/analytics.service';


const appKitNetworks =
  environment.name === 'local'
    ? [hardhat]
    : environment.name === 'testnet'
      ? [sepolia]
      : [mainnet, arbitrum];

export function markNetworkError(err: unknown, ns: NetworkStatusService) {
  const msg = err instanceof Error ? err.message : String(err ?? '');
  if (/ECONNREFUSED|network|fetch|connection|failed to fetch/i.test(msg)) {
    ns.setUnavailable(err);
  }
}

@Injectable({ providedIn: 'root' })
export class WalletConnectService {
  private readonly trigger = inject(TriggerService);
  private readonly error = inject(ErrorService);
  private readonly networkStatus = inject(NetworkStatusService);
  private readonly analytics = inject(AnalyticsService);

  private readonly _status = signal<'idle' | 'pending' | 'success' | 'error'>(
    'idle',
  );
  readonly status = this._status.asReadonly();

  private readonly _lastError = signal<string | null>(null);
  readonly lastError = this._lastError.asReadonly();

  private readonly _walletTick = signal(0);

  private client = createAppKit({
    projectId: environment.reownProjectId,
    adapters: [new EthersAdapter()],
    networks: appKitNetworks as any,
    metadata: {
      name: 'SETHX Client',
      description: 'Local client for the SETHX protocol',
      url: 'https://sethx.com',
      icons: ['https://sethx.com/logo.png'],
    },
    themeMode: 'dark',
    features: {
      swaps: false,
      onramp: false,
      email: false,
      socials: [],
      history: true,
      analytics: false,
      allWallets: true,
    },
  });

  private cachedProvider: ethers.BrowserProvider | null = null;

  readonly accountResource = resource({
    params: () => this._walletTick(),
    loader: async () => {
      try {
        const account = await this.client.getAccount('eip155');
        if (!account) return null;

        const provider = await this.getEthersProvider();
        if (!provider) return null;

        const network = await provider.getNetwork();
        if (network.chainId !== BigInt(CURRENT_NETWORK_CONFIG.id)) return null;

        return account;
      } catch (e) {
        // keep loader "pure": don't disconnect / toast
        markNetworkError(e, this.networkStatus);
        return null;
      }
    },
  });

  readonly providerResource = resource({
    params: () => this._walletTick(),
    loader: async () => {
      try {
        return (await this.getEthersProvider()) ?? null;
      } catch (e) {
        markNetworkError(e, this.networkStatus);
        return null;
      }
    },
  });

  readonly account = computed(() => this.accountResource.value() ?? null);
  readonly address = computed(() => this.account()?.address ?? null);
  readonly provider = computed(() => this.providerResource.value() ?? null);

  constructor() {
    this.client.subscribeState(() => {
      this.clearCachedProvider();
      this._walletTick.update((v) => v + 1);
    });
  }

  async getEthersProvider(): Promise<ethers.BrowserProvider | null> {
    if (this.cachedProvider) return this.cachedProvider;

    const rawProvider = await this.client.getProvider('eip155');
    if (!rawProvider) return null;

    this.cachedProvider = new ethers.BrowserProvider(rawProvider as any);
    return this.cachedProvider;
  }

  private clearCachedProvider() {
    this.cachedProvider = null;
  }

  private async waitForProvider(opts?: {
    timeoutMs?: number;
    pollMs?: number;
  }): Promise<ethers.BrowserProvider | null> {
    const timeoutMs = opts?.timeoutMs ?? 15000;
    const pollMs = opts?.pollMs ?? 250;

    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const p = await this.getEthersProvider();
      if (p) return p;
      await new Promise((r) => setTimeout(r, pollMs));
    }
    return null;
  }

  async connect(): Promise<void> {
    this._status.set('pending');
    this._lastError.set(null);
    this.analytics.trackWalletConnectStarted();

    try {
      await this.client.open({ view: 'Connect', namespace: 'eip155' });

      this.clearCachedProvider();
      const provider = await this.waitForProvider({
        timeoutMs: 20000,
        pollMs: 250,
      });

      if (!provider) {
        const message = 'No provider after connect. The wallet did not finish the handshake.';
        this._status.set('error');
        this._lastError.set(message);
        this.error.show(message);
        return;
      }

      // ✅ PROBE: this is what catches "Hardhat not running" nicely
      try {
        await provider.getBlockNumber(); // or: await provider.getNetwork()
        this.networkStatus.setAvailable();
      } catch (e) {
        markNetworkError(e, this.networkStatus);
        const message = 'Network is not reachable. Start your local node or switch RPC and try again.';
        this._status.set('error');
        this._lastError.set(message);
        this.error.show(message);
        return;
      }

      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      const network = await provider.getNetwork();
      if (network.chainId !== BigInt(CURRENT_NETWORK_CONFIG.id)) {
        const message = `Wrong network. Please switch to ${CURRENT_NETWORK_CONFIG.name}.`;
        this.disconnect();
        this._status.set('error');
        this._lastError.set(message);
        this.error.show(message);
        return;
      }

      this._walletTick.update((v) => v + 1);

      this.analytics.trackWalletConnected();
      this.trigger.emitDomainEvent({ type: 'walletConnected' });
      this.trigger.emitDomainEvent({ type: 'walletAddressChanged', address });

      this._lastError.set(null);
      this._status.set('success');
    } catch (e) {
      const message = 'Wallet connection was not completed.';
      this._status.set('error');
      this._lastError.set(message);
      this.error.show(message);
    }
  }

  disconnect(): void {
    this.client.disconnect();

    this.trigger.emitDomainEvent({ type: 'walletDisconnected' });
    this.trigger.emitDomainEvent({
      type: 'walletAddressChanged',
      address: null,
    });

    // optional: mark unknown/unavailable on disconnect, up to you
    // this.networkStatus.setUnavailable('Disconnected');

    this.clearCachedProvider();
    this._walletTick.update((v) => v + 1);
    this._lastError.set(null);
    this._status.set('idle');
  }
}
