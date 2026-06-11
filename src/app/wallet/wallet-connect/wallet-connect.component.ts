import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { EthereumWalletProvider, WalletConnectService } from '../wallet-connect.service';

interface Eip6963ProviderDetail {
  info: {
    uuid: string;
    name: string;
    icon?: string;
    rdns?: string;
  };
  provider: EthereumWalletProvider;
}

interface DetectedWalletProvider {
  id: string;
  name: string;
  icon?: string;
  rdns?: string;
  provider: EthereumWalletProvider;
  source: 'eip6963' | 'injected';
}

@Component({
  selector: 'app-wallet-connect',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './wallet-connect.component.html',
  styleUrl: './wallet-connect.component.css',
})
export class WalletConnectComponent implements OnInit, OnDestroy {
  readonly wallet = inject(WalletConnectService);

  @Input() buttonClass = 'bg-frame text-black px-4 py-1 rounded hover:bg-gold-shiny transition';
  @Input() connectLabel = 'Connect Wallet';
  @Input() disconnectLabel = 'Disconnect';

  readonly address = this.wallet.address;

  providerModalOpen = false;
  isDetectingProviders = false;
  isConnectingProvider = false;
  providers: DetectedWalletProvider[] = [];
  selectedProviderId = '';
  providerMessage = '';

  private readonly announceProvider = (event: Event) => {
    const detail = (event as CustomEvent<Eip6963ProviderDetail>).detail;
    if (!detail?.provider || !detail.info?.name) return;

    this.mergeProvider({
      id: detail.info.uuid || this.providerKey(detail.provider, detail.info.name, detail.info.rdns),
      name: detail.info.name,
      icon: detail.info.icon,
      rdns: detail.info.rdns,
      provider: detail.provider,
      source: 'eip6963',
    });
  };

  ngOnInit(): void {
    void this.detectProviders();
  }

  ngOnDestroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('eip6963:announceProvider', this.announceProvider as EventListener);
    }
  }

  get buttonLabel(): string {
    if (this.address()) return this.disconnectLabel;
    if (this.wallet.status() === 'pending' || this.isConnectingProvider) return 'Connecting...';
    if (this.isDetectingProviders) return 'Detecting wallets...';
    return this.connectLabel;
  }

  get hasProviders(): boolean {
    return this.providers.length > 0;
  }

  async onPrimaryAction(): Promise<void> {
    if (this.address()) {
      this.disconnect();
      return;
    }

    await this.openConnectFlow();
  }

  async openConnectFlow(): Promise<void> {
    if (this.isDetectingProviders || this.isConnectingProvider || this.wallet.status() === 'pending') return;
    this.providerMessage = '';
    await this.detectProviders(true);

    if (this.providers.length === 1) {
      await this.connectProvider(this.providers[0]);
      return;
    }

    this.providerModalOpen = true;
  }

  closeProviderModal(): void {
    if (this.isConnectingProvider) return;
    this.providerModalOpen = false;
  }

  async refreshProviders(): Promise<void> {
    await this.detectProviders(true);
  }

  selectProvider(id: string): void {
    this.selectedProviderId = id;
  }

  async connectSelectedProvider(): Promise<void> {
    const selected = this.providers.find((provider) => provider.id === this.selectedProviderId) ?? this.providers[0];
    if (!selected) {
      this.providerMessage = 'No browser wallet detected. Install or open an Ethereum browser wallet, then refresh providers.';
      return;
    }

    await this.connectProvider(selected);
  }

  disconnect(): void {
    this.wallet.disconnect();
    this.providerModalOpen = false;
    this.providerMessage = '';
  }

  trackProvider(_: number, provider: DetectedWalletProvider): string {
    return provider.id;
  }

  private async connectProvider(provider: DetectedWalletProvider): Promise<void> {
    if (this.isConnectingProvider) return;
    this.isConnectingProvider = true;
    this.providerMessage = '';

    try {
      await this.wallet.connectInjectedProvider(provider.provider, provider.name);
      if (this.wallet.address()) this.providerModalOpen = false;
    } finally {
      this.isConnectingProvider = false;
    }
  }

  private async detectProviders(reset = false): Promise<void> {
    if (typeof window === 'undefined') return;
    this.isDetectingProviders = true;
    if (reset) {
      this.providers = [];
      this.selectedProviderId = '';
    }

    window.removeEventListener('eip6963:announceProvider', this.announceProvider as EventListener);
    window.addEventListener('eip6963:announceProvider', this.announceProvider as EventListener);
    window.dispatchEvent(new Event('eip6963:requestProvider'));

    this.addInjectedProviders();

    await new Promise((resolve) => setTimeout(resolve, 120));
    this.providers = [...this.providers].sort((a, b) => Number(a.source === 'injected') - Number(b.source === 'injected'));
    this.selectedProviderId ||= this.providers[0]?.id ?? '';
    this.isDetectingProviders = false;
  }

  private getInjectedEthereumProvider(): EthereumWalletProvider | null {
    if (typeof window === 'undefined') return null;
    const maybeEthereum = (window as unknown as { ethereum?: Record<string, unknown> }).ethereum;
    return maybeEthereum ? (maybeEthereum as EthereumWalletProvider) : null;
  }

  private addInjectedProviders(): void {
    const injected = this.getInjectedEthereumProvider();
    if (!injected) return;

    const providersValue = injected['providers'];
    const injectedProviders: EthereumWalletProvider[] =
      Array.isArray(providersValue) && providersValue.length > 0 ? (providersValue as EthereumWalletProvider[]) : [injected];

    for (const provider of injectedProviders) {
      const name = this.detectProviderName(provider);
      this.mergeProvider({
        id: this.providerKey(provider, name),
        name,
        provider,
        source: 'injected',
      });
    }
  }

  private mergeProvider(candidate: DetectedWalletProvider): void {
    const candidateKeys = this.matchKeys(candidate);
    const existingIndex = this.providers.findIndex((provider) => this.matchKeys(provider).some((key) => candidateKeys.includes(key)));

    if (existingIndex === -1) {
      this.providers = [...this.providers, candidate];
      return;
    }

    const existing = this.providers[existingIndex];
    if (existing.source === 'injected' && candidate.source === 'eip6963') {
      this.providers = this.providers.map((provider, index) => (index === existingIndex ? candidate : provider));
    }
  }

  private matchKeys(entry: DetectedWalletProvider): string[] {
    const keys = new Set<string>();
    const normalizedName = this.normalize(entry.name);
    const normalizedRdns = this.normalize(entry.rdns ?? '');

    if (entry.provider) keys.add(`object:${this.providerKey(entry.provider, entry.name, entry.rdns)}`);
    if (normalizedName) keys.add(`name:${normalizedName}`);
    if (normalizedRdns) keys.add(`rdns:${normalizedRdns}`);

    for (const family of ['metamask', 'rabby', 'coinbase', 'brave', 'trust']) {
      if (normalizedName.includes(family) || normalizedRdns.includes(family) || this.providerLooksLike(entry.provider, family)) {
        keys.add(`family:${family}`);
      }
    }

    return [...keys];
  }

  private providerKey(provider: EthereumWalletProvider, name: string, rdns = ''): string {
    const anyProvider = provider as Record<string, unknown>;
    const selectedAddress = typeof provider.selectedAddress === 'string' ? provider.selectedAddress : '';
    const flags = ['isMetaMask', 'isRabby', 'isCoinbaseWallet', 'isTrust', 'isTrustWallet', 'isBraveWallet']
      .filter((flag) => Boolean(anyProvider[flag]))
      .join('-');
    return `${this.normalize(rdns)}:${this.normalize(name)}:${this.normalize(flags)}:${selectedAddress.toLowerCase()}`;
  }

  private detectProviderName(provider: EthereumWalletProvider): string {
    const anyProvider = provider as Record<string, unknown>;
    if (anyProvider['isRabby']) return 'Rabby';
    if (anyProvider['isCoinbaseWallet']) return 'Coinbase Wallet';
    if (anyProvider['isTrust'] || anyProvider['isTrustWallet']) return 'Trust Wallet';
    if (anyProvider['isBraveWallet']) return 'Brave Wallet';
    if (anyProvider['isMetaMask']) return 'MetaMask';
    return 'Browser wallet';
  }

  private providerLooksLike(provider: EthereumWalletProvider, family: string): boolean {
    const anyProvider = provider as Record<string, unknown>;
    if (family === 'metamask') return Boolean(anyProvider['isMetaMask']);
    if (family === 'rabby') return Boolean(anyProvider['isRabby']);
    if (family === 'coinbase') return Boolean(anyProvider['isCoinbaseWallet']);
    if (family === 'brave') return Boolean(anyProvider['isBraveWallet']);
    if (family === 'trust') return Boolean(anyProvider['isTrust'] || anyProvider['isTrustWallet']);
    return false;
  }

  private normalize(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9]/g, '');
  }
}
