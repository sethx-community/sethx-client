import { Injectable, signal, computed, resource, inject } from '@angular/core';
import { createAppKit } from '@reown/appkit';
import { EthersAdapter } from '@reown/appkit-adapter-ethers';
import { mainnet, hardhat, sepolia } from '@reown/appkit/networks';
import { ethers } from 'ethers';
import { environment } from '../../environments/environment';
import { CURRENT_NETWORK_CONFIG } from '../constants/network.config';
import { ErrorService } from '../services/shared/error.service';
import { TriggerService } from '../services/shared/trigger.service';
import { NetworkStatusService } from '../services/shared/network-status.service';
import { AnalyticsService } from '../services/shared/compliance/analytics.service';

export interface EthereumWalletProvider {
  request(args: { method: string; params?: unknown[] | Record<string, unknown> }): Promise<unknown>;
  disconnect?: () => Promise<void> | void;
  on?: (event: string, handler: (...args: any[]) => void) => void;
  removeListener?: (event: string, handler: (...args: any[]) => void) => void;
  selectedAddress?: string;
  [key: string]: unknown;
}

const appKitNetworks =
  environment.name === 'local'
    ? [hardhat]
    : environment.name === 'testnet'
      ? [sepolia]
      : [mainnet];

const expectedChainIdHex = `0x${Number(environment.chainId).toString(16)}`;

const runtimeOrigin =
  typeof window !== 'undefined' && window.location?.origin
    ? window.location.origin
    : environment.siteUrl || 'https://sethx.eth.limo';

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
  private readonly _injectedProvider = signal<EthereumWalletProvider | null>(null);
  private readonly _injectedAddress = signal<string | null>(null);
  private readonly _injectedProviderName = signal<string | null>(null);
  readonly connectedProviderName = this._injectedProviderName.asReadonly();

  private client: ReturnType<typeof createAppKit> | null = null;
  private clientSubscribed = false;
  private readonly _appKitActive = signal(false);

  private cachedProvider: ethers.BrowserProvider | null = null;
  private injectedProviderCleanups: Array<() => void> = [];

  readonly accountResource = resource({
    params: () => this._walletTick(),
    loader: async () => {
      try {
        if (this._injectedProvider()) {
          const provider = await this.getEthersProvider();
          if (!provider) return null;

          const network = await provider.getNetwork();
          if (!this.isExpectedNetwork(network)) return null;

          const signer = await provider.getSigner().catch(() => null);
          const address = this._injectedAddress() ?? (await signer?.getAddress().catch(() => null)) ?? null;
          return address ? ({ address } as any) : null;
        }

        if (!this._appKitActive()) return null;

        const account = await this.appKitClient().getAccount('eip155');
        if (!account) return null;

        const provider = await this.getEthersProvider();
        if (!provider) return null;

        const network = await provider.getNetwork();
        if (!this.isExpectedNetwork(network)) return null;

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
        if (!this._injectedProvider() && !this._appKitActive()) return null;
        return (await this.getEthersProvider()) ?? null;
      } catch (e) {
        markNetworkError(e, this.networkStatus);
        return null;
      }
    },
  });

  readonly account = computed(() => this.accountResource.value() ?? null);
  readonly address = computed(() => this.account()?.address ?? this._injectedAddress() ?? null);
  readonly provider = computed(() => this.providerResource.value() ?? null);

  readonly isConnected = computed(() => !!this.address() && !!this.provider());

  async getProvider(): Promise<ethers.BrowserProvider | null> {
    return this.getEthersProvider();
  }

  async getSigner(): Promise<ethers.JsonRpcSigner | null> {
    const provider = await this.getEthersProvider();
    if (!provider) return null;
    return provider.getSigner().catch(() => null);
  }


  constructor() {
    void this.restoreInjectedProviderConnection();
  }

  private appKitClient(): ReturnType<typeof createAppKit> {
    if (!this.client) {
      this.client = createAppKit({
        projectId: environment.reownProjectId,
        adapters: [new EthersAdapter()],
        networks: appKitNetworks as any,
        metadata: {
          name: 'SETHX Client',
          description: 'Local client for the SETHX protocol',
          url: runtimeOrigin,
          icons: [`${runtimeOrigin}/assets/sethx-logo-clean.png`],
        },
        themeMode: 'dark',
        features: {
          swaps: false,
          onramp: false,
          email: false,
          socials: [],
          history: false,
          analytics: false,
          allWallets: true,
        },
      });
    }

    if (!this.clientSubscribed) {
      this.clientSubscribed = true;
      this.client.subscribeState(() => {
        if (this._injectedProvider()) return;
        if (!this._appKitActive()) return;
        this.clearCachedProvider();
        this._walletTick.update((v) => v + 1);
      });
    }

    return this.client;
  }

  async getEthersProvider(): Promise<ethers.BrowserProvider | null> {
    if (this.cachedProvider) return this.cachedProvider;

    const injectedProvider = this._injectedProvider();
    if (injectedProvider) {
      this.cachedProvider = new ethers.BrowserProvider(injectedProvider as any);
      return this.cachedProvider;
    }

    if (!this._appKitActive()) return null;

    const rawProvider = await this.appKitClient().getProvider('eip155');
    if (!rawProvider) return null;

    this.cachedProvider = new ethers.BrowserProvider(rawProvider as any);
    return this.cachedProvider;
  }

  private clearCachedProvider() {
    this.cachedProvider = null;
  }

  private expectedChainId(): bigint {
    return BigInt(CURRENT_NETWORK_CONFIG.id);
  }

  private async getRawChainId(rawProvider: EthereumWalletProvider): Promise<bigint | null> {
    try {
      const chainId = await rawProvider.request({ method: 'eth_chainId' });
      if (typeof chainId === 'string') return BigInt(chainId);
      if (typeof chainId === 'number') return BigInt(chainId);
      return null;
    } catch {
      return null;
    }
  }

  private async switchInjectedProviderToExpectedNetwork(rawProvider: EthereumWalletProvider): Promise<boolean> {
    const currentChainId = await this.getRawChainId(rawProvider);
    if (currentChainId === this.expectedChainId()) return true;

    try {
      await rawProvider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: expectedChainIdHex }],
      });
      this.clearCachedProvider();
      const switchedChainId = await this.getRawChainId(rawProvider);
      return switchedChainId === this.expectedChainId();
    } catch (switchError: any) {
      const errorCode = Number(switchError?.code ?? switchError?.data?.originalError?.code ?? 0);
      if (errorCode !== 4902) return false;

      try {
        await rawProvider.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: expectedChainIdHex,
              chainName: CURRENT_NETWORK_CONFIG.name,
              nativeCurrency: CURRENT_NETWORK_CONFIG.nativeCurrency,
              rpcUrls: CURRENT_NETWORK_CONFIG.rpcUrls.default.http,
              blockExplorerUrls: CURRENT_NETWORK_CONFIG.blockExplorers.default.url
                ? [CURRENT_NETWORK_CONFIG.blockExplorers.default.url]
                : [],
            },
          ],
        });
        await rawProvider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: expectedChainIdHex }],
        });
        this.clearCachedProvider();
        const addedChainId = await this.getRawChainId(rawProvider);
        return addedChainId === this.expectedChainId();
      } catch {
        return false;
      }
    }
  }

  private isExpectedNetwork(network: ethers.Network): boolean {
    return network.chainId === this.expectedChainId();
  }


  private disconnectAppKitClient(): void {
    if (!this.client) return;
    try {
      const maybeDisconnect = this.client.disconnect();
      if (maybeDisconnect && typeof (maybeDisconnect as Promise<void>).catch === 'function') {
        void (maybeDisconnect as Promise<void>).catch(() => undefined);
      }
    } catch {
      // Ignore AppKit cleanup failures. Browser-wallet state is authoritative here.
    }
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

  private async restoreInjectedProviderConnection(): Promise<void> {
    if (typeof window === 'undefined') return;
    if (this._injectedProvider() || this._appKitActive()) return;

    try {
      const providers = await this.discoverInjectedProvidersForRestore();
      for (const candidate of providers) {
        const accounts = await candidate.provider.request({ method: 'eth_accounts' }).catch(() => []) as unknown;
        const address = Array.isArray(accounts) && typeof accounts[0] === 'string' ? accounts[0] : '';
        if (!address) continue;

        const chainId = await this.getRawChainId(candidate.provider);
        if (chainId !== this.expectedChainId()) continue;

        this.clearInjectedProviderListeners();
        this._appKitActive.set(false);
        this._injectedProvider.set(candidate.provider);
        this._injectedAddress.set(address);
        this._injectedProviderName.set(candidate.name);
        this.clearCachedProvider();
        this.bindInjectedProviderListeners(candidate.provider);
        this._lastError.set(null);
        this._status.set('success');
        this._walletTick.update((v) => v + 1);
        this.trigger.emitDomainEvent({ type: 'walletConnected' });
        this.trigger.emitDomainEvent({ type: 'walletAddressChanged', address });
        return;
      }
    } catch {
      // Silent restore must never block app startup or open a wallet prompt.
    }
  }

  private async discoverInjectedProvidersForRestore(): Promise<Array<{ provider: EthereumWalletProvider; name: string }>> {
    if (typeof window === 'undefined') return [];

    const found: Array<{ provider: EthereumWalletProvider; name: string; key: string }> = [];
    const add = (provider: EthereumWalletProvider | null | undefined, name?: string, rdns?: string) => {
      if (!provider) return;
      const detectedName = name || this.detectInjectedProviderName(provider);
      const key = this.injectedProviderRestoreKey(provider, detectedName, rdns ?? '');
      if (found.some((entry) => entry.key === key || entry.provider === provider)) return;
      found.push({ provider, name: detectedName, key });
    };

    const onAnnounce = (event: Event) => {
      const detail = (event as CustomEvent<{ info?: { name?: string; rdns?: string }; provider?: EthereumWalletProvider }>).detail;
      add(detail?.provider, detail?.info?.name, detail?.info?.rdns);
    };

    window.addEventListener('eip6963:announceProvider', onAnnounce as EventListener);
    window.dispatchEvent(new Event('eip6963:requestProvider'));

    const injected = this.getInjectedEthereumProviderForRestore();
    if (injected) {
      const providersValue = injected['providers'];
      const injectedProviders: EthereumWalletProvider[] =
        Array.isArray(providersValue) && providersValue.length > 0 ? (providersValue as EthereumWalletProvider[]) : [injected];
      for (const provider of injectedProviders) add(provider);
    }

    await new Promise((resolve) => setTimeout(resolve, 180));
    window.removeEventListener('eip6963:announceProvider', onAnnounce as EventListener);

    return found.map(({ provider, name }) => ({ provider, name }));
  }

  private getInjectedEthereumProviderForRestore(): EthereumWalletProvider | null {
    if (typeof window === 'undefined') return null;
    const maybeEthereum = (window as unknown as { ethereum?: Record<string, unknown> }).ethereum;
    return maybeEthereum ? (maybeEthereum as EthereumWalletProvider) : null;
  }

  private injectedProviderRestoreKey(provider: EthereumWalletProvider, name: string, rdns = ''): string {
    const anyProvider = provider as Record<string, unknown>;
    const selectedAddress = typeof provider.selectedAddress === 'string' ? provider.selectedAddress : '';
    const flags = ['isMetaMask', 'isRabby', 'isCoinbaseWallet', 'isTrust', 'isTrustWallet', 'isBraveWallet']
      .filter((flag) => Boolean(anyProvider[flag]))
      .join('-');
    return `${this.normalizeInjectedProviderLabel(rdns)}:${this.normalizeInjectedProviderLabel(name)}:${this.normalizeInjectedProviderLabel(flags)}:${selectedAddress.toLowerCase()}`;
  }

  private detectInjectedProviderName(provider: EthereumWalletProvider): string {
    const anyProvider = provider as Record<string, unknown>;
    if (anyProvider['isRabby']) return 'Rabby';
    if (anyProvider['isCoinbaseWallet']) return 'Coinbase Wallet';
    if (anyProvider['isTrust'] || anyProvider['isTrustWallet']) return 'Trust Wallet';
    if (anyProvider['isBraveWallet']) return 'Brave Wallet';
    if (anyProvider['isMetaMask']) return 'MetaMask';
    return 'Browser wallet';
  }

  private normalizeInjectedProviderLabel(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  async connectInjectedProvider(rawProvider: EthereumWalletProvider, providerName = 'Browser wallet'): Promise<void> {
    this._status.set('pending');
    this._lastError.set(null);
    this.analytics.trackWalletConnectStarted();

    try {
      const accounts = (await rawProvider.request({ method: 'eth_requestAccounts' })) as unknown;
      const address = Array.isArray(accounts) && typeof accounts[0] === 'string' ? accounts[0] : '';

      if (!address) {
        const message = 'No wallet address was returned by the selected provider.';
        this._status.set('error');
        this._lastError.set(message);
        this.error.show(message);
        return;
      }

      const onExpectedNetwork = await this.switchInjectedProviderToExpectedNetwork(rawProvider);
      if (!onExpectedNetwork) {
        const message = `Wrong network. Please switch to ${CURRENT_NETWORK_CONFIG.name}.`;
        this._status.set('error');
        this._lastError.set(message);
        this.error.show(message);
        return;
      }

      this.clearInjectedProviderListeners();
      this._appKitActive.set(false);
      this.disconnectAppKitClient();
      this._injectedProvider.set(rawProvider);
      this._injectedAddress.set(address);
      this._injectedProviderName.set(providerName);
      this.clearCachedProvider();
      this.bindInjectedProviderListeners(rawProvider);

      const provider = await this.getEthersProvider();
      if (!provider) {
        const message = 'No provider after connect. The wallet did not finish the handshake.';
        this.clearInjectedProviderState();
        this._status.set('error');
        this._lastError.set(message);
        this.error.show(message);
        return;
      }

      let network: ethers.Network;
      try {
        // Use chain metadata as the connection check. A block-number probe is unnecessary here
        // and can trigger extra RPC traffic/rate limits right when the rest of the app refreshes.
        network = await provider.getNetwork();
        this.networkStatus.setAvailable();
      } catch (e) {
        markNetworkError(e, this.networkStatus);
        const message = 'Network is not reachable. Check the selected wallet RPC and try again.';
        this.clearInjectedProviderState();
        this._status.set('error');
        this._lastError.set(message);
        this.error.show(message);
        return;
      }

      if (!this.isExpectedNetwork(network)) {
        const message = `Wrong network. Please switch to ${CURRENT_NETWORK_CONFIG.name}.`;
        this.clearInjectedProviderState();
        this._status.set('error');
        this._lastError.set(message);
        this.error.show(message);
        this._walletTick.update((v) => v + 1);
        return;
      }

      this._walletTick.update((v) => v + 1);

      this.analytics.trackWalletConnected();
      this.trigger.emitDomainEvent({ type: 'walletConnected' });
      this.trigger.emitDomainEvent({ type: 'walletAddressChanged', address });

      this._lastError.set(null);
      this._status.set('success');
    } catch (e) {
      const message = this.formatWalletError(e, 'Wallet connection was not completed.');
      this.clearInjectedProviderState();
      this._status.set('error');
      this._lastError.set(message);
      this.error.show(message);
      this._walletTick.update((v) => v + 1);
    }
  }

  async connect(): Promise<void> {
    this._status.set('pending');
    this._lastError.set(null);
    this.analytics.trackWalletConnectStarted();

    try {
      this._appKitActive.set(true);
      await this.appKitClient().open({ view: 'Connect', namespace: 'eip155' });

      this.clearInjectedProviderState();
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

      let network: ethers.Network;
      try {
        // Use chain metadata as the connection check. Avoid a separate block-number probe,
        // because rate-limited RPCs can reject that extra call during connect.
        network = await provider.getNetwork();
        this.networkStatus.setAvailable();
      } catch (e) {
        markNetworkError(e, this.networkStatus);
        const message = 'Network is not reachable. Check the selected wallet RPC and try again.';
        this._status.set('error');
        this._lastError.set(message);
        this.error.show(message);
        return;
      }

      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      if (!this.isExpectedNetwork(network)) {
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
    const injectedProvider = this._injectedProvider();
    try {
      const maybeDisconnect = injectedProvider?.disconnect?.();
      if (maybeDisconnect && typeof (maybeDisconnect as Promise<void>).catch === 'function') {
        void (maybeDisconnect as Promise<void>).catch(() => undefined);
      }
    } catch {
      // Browser wallets usually do not support forced disconnect. Clearing app state is enough.
    }

    this.clearInjectedProviderState();
    this._appKitActive.set(false);
    this.disconnectAppKitClient();

    this.trigger.emitDomainEvent({ type: 'walletDisconnected' });
    this.trigger.emitDomainEvent({
      type: 'walletAddressChanged',
      address: null,
    });

    this.clearCachedProvider();
    this._walletTick.update((v) => v + 1);
    this._lastError.set(null);
    this._status.set('idle');
  }

  private bindInjectedProviderListeners(provider: EthereumWalletProvider): void {
    const on = provider.on?.bind(provider);
    const removeListener = provider.removeListener?.bind(provider);
    if (!on || !removeListener) return;

    const handleAccountsChanged = (...args: any[]) => {
      const accounts = Array.isArray(args[0]) ? args[0] : [];
      const nextAddress = typeof accounts[0] === 'string' ? accounts[0] : null;
      if (!nextAddress) {
        this.disconnect();
        return;
      }
      this._injectedAddress.set(nextAddress);
      this._walletTick.update((v) => v + 1);
      this.trigger.emitDomainEvent({ type: 'walletAddressChanged', address: nextAddress });
    };

    const handleChainChanged = () => {
      this.clearCachedProvider();
      this._walletTick.update((v) => v + 1);
    };

    on('accountsChanged', handleAccountsChanged);
    on('chainChanged', handleChainChanged);

    this.injectedProviderCleanups = [
      () => removeListener('accountsChanged', handleAccountsChanged),
      () => removeListener('chainChanged', handleChainChanged),
    ];
  }

  private clearInjectedProviderListeners(): void {
    for (const cleanup of this.injectedProviderCleanups) {
      try {
        cleanup();
      } catch {
        // Ignore provider listener cleanup failures.
      }
    }
    this.injectedProviderCleanups = [];
  }

  private clearInjectedProviderState(): void {
    this.clearInjectedProviderListeners();
    this._injectedProvider.set(null);
    this._injectedAddress.set(null);
    this._injectedProviderName.set(null);
    this.clearCachedProvider();
  }

  private formatWalletError(error: unknown, fallback: string): string {
    if (error instanceof Error && error.message) return error.message;
    return fallback;
  }
}
