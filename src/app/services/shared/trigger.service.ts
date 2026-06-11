import { Injectable, signal } from "@angular/core";

export type SettingsEvent =
  | { type: "accountChanged"; accountId: string | null }
  | { type: "preferredFeeTokenChanged"; feeToken: string };

export type DomainEvent =
  | { type: "accountCreated" }
  | { type: "walletConnected" }
  | { type: "walletDisconnected" }
  | { type: "walletAddressChanged"; address: string | null }
  | { type: "deposit" }
  | { type: "withdraw" }
  | { type: "orderPlaced" }
  | { type: "orderAccepted" }
  | { type: "erc20TokensChanged"; tokens: string[] }
  | { type: "accountsChanged"; accounts: string[] }
  | { type: "Option Reclaimed" }
  | { type: "Option Exercised" }
  | { type: "optionOrderPlaced" }
  | { type: "futuresOrderPlaced" }
  | { type: "lendingOrderbookChanged" };

export type RefreshDomain =
  | "wallet"
  | "accounts"
  | "portfolio"
  | "orderbook"
  | "options"
  | "futures"
  | "lending"
  | "fees"
  | "vault"
  | "prices"
  | "tokens"
  | "treasury"
  | "protocol"
  | "warnings";

@Injectable({ providedIn: "root" })
export class TriggerService {
  // ---- event streams (signals) ----
  private readonly _domainEvent = signal<DomainEvent | null>(null);
  readonly domainEvent = this._domainEvent.asReadonly();

  private readonly _settingsEvent = signal<SettingsEvent | null>(null);
  readonly settingsEvent = this._settingsEvent.asReadonly();

  // ---- refresh ticks (signals) ----
  private readonly _walletTick = signal(0);
  private readonly _accountsTick = signal(0);
  private readonly _portfolioTick = signal(0);
  private readonly _orderbookTick = signal(0);
  private readonly _optionsOrderbookTick = signal(0);
  private readonly _futuresOrderbookTick = signal(0);
  private readonly _lendingOrderbookTick = signal(0);
  private readonly _feesTick = signal(0);
  private readonly _vaultTick = signal(0);
  private readonly _pricesTick = signal(0);
  private readonly _tokensTick = signal(0);
  private readonly _treasuryTick = signal(0);
  private readonly _protocolTick = signal(0);
  private readonly _warningsTick = signal(0);

  private readonly _refreshing = signal(false);
  private readonly _lastRefreshAt = signal<number | null>(null);
  private backgroundRefreshTimer: ReturnType<typeof setTimeout> | null = null;

  readonly walletTick = this._walletTick.asReadonly();
  readonly accountsTick = this._accountsTick.asReadonly();
  readonly portfolioTick = this._portfolioTick.asReadonly();
  readonly orderbookTick = this._orderbookTick.asReadonly();
  readonly optionsOrderbookTick = this._optionsOrderbookTick.asReadonly();
  readonly futuresOrderbookTick = this._futuresOrderbookTick.asReadonly();
  readonly lendingOrderbookTick = this._lendingOrderbookTick.asReadonly();
  readonly feesTick = this._feesTick.asReadonly();
  readonly vaultTick = this._vaultTick.asReadonly();
  readonly pricesTick = this._pricesTick.asReadonly();
  readonly tokensTick = this._tokensTick.asReadonly();
  readonly treasuryTick = this._treasuryTick.asReadonly();
  readonly protocolTick = this._protocolTick.asReadonly();
  readonly warningsTick = this._warningsTick.asReadonly();
  readonly refreshing = this._refreshing.asReadonly();
  readonly lastRefreshAt = this._lastRefreshAt.asReadonly();

  private bump(sig: { update: (fn: (x: number) => number) => void }) {
    sig.update((x) => x + 1);
  }

  private markRefreshed(): void {
    this._lastRefreshAt.set(Date.now());
  }

  // ---- manual and route-driven refresh policy ----
  refreshDomains(domains: readonly RefreshDomain[]): void {
    const unique = new Set(domains);
    for (const domain of unique) {
      switch (domain) {
        case "wallet":
          this.bump(this._walletTick);
          break;
        case "accounts":
          this.bump(this._accountsTick);
          break;
        case "portfolio":
          this.bump(this._portfolioTick);
          break;
        case "orderbook":
          this.bump(this._orderbookTick);
          break;
        case "options":
          this.bump(this._optionsOrderbookTick);
          break;
        case "futures":
          this.bump(this._futuresOrderbookTick);
          break;
        case "lending":
          this.bump(this._lendingOrderbookTick);
          break;
        case "fees":
          this.bump(this._feesTick);
          break;
        case "vault":
          this.bump(this._vaultTick);
          break;
        case "prices":
          this.bump(this._pricesTick);
          break;
        case "tokens":
          this.bump(this._tokensTick);
          break;
        case "treasury":
          this.bump(this._treasuryTick);
          break;
        case "protocol":
          this.bump(this._protocolTick);
          break;
        case "warnings":
          this.bump(this._warningsTick);
          break;
      }
    }
    this.markRefreshed();
  }

  refreshActiveRoute(url: string, includeBackground = false): void {
    const active = this.domainsForUrl(url);
    this._refreshing.set(true);
    this.refreshDomains(active);
    queueMicrotask(() => this._refreshing.set(false));

    if (!includeBackground) return;
    if (this.backgroundRefreshTimer) clearTimeout(this.backgroundRefreshTimer);
    this.backgroundRefreshTimer = setTimeout(() => {
      const activeSet = new Set(active);
      const background = this.allBackgroundDomains().filter(
        (d) => !activeSet.has(d),
      );
      this.refreshDomains(background);
    }, 750);
  }

  refreshActiveRouteSilently(url: string): void {
    this.refreshDomains(this.domainsForUrl(url));
  }

  domainsForUrl(url: string): RefreshDomain[] {
    const path = this.normalizedPrimaryPath(url);

    if (path === "accounts") return ["wallet", "accounts"];
    if (path === "tokens") return ["tokens", "portfolio", "prices"];
    if (path === "assets") return ["portfolio", "vault", "prices"];
    if (path === "token-spot") return ["orderbook", "portfolio", "prices"];
    if (path === "nft-spot") return ["orderbook", "portfolio"];
    if (path === "futures") return ["futures", "portfolio", "prices", "warnings"];
    if (path === "options" || path === "binary-options" || path === "margin-options") {
      return ["options", "portfolio", "prices", "warnings"];
    }
    if (path === "lending") return ["lending", "portfolio", "vault", "prices", "warnings"];
    if (path === "treasury") return ["treasury", "accounts", "portfolio", "warnings"];
    if (path === "oracles") return ["protocol", "prices", "warnings"];
    if (path === "fees") return ["fees", "prices"];
    if (path === "warnings") {
      return ["warnings", "protocol", "options", "futures", "lending", "portfolio", "prices"];
    }
    if (path === "protocol") return ["protocol", "accounts", "warnings"];
    return ["wallet", "accounts", "portfolio"];
  }

  private normalizedPrimaryPath(url: string): string {
    const clean = String(url ?? "").toLowerCase().split("?")[0].split("#")[0];
    const primaryOutlet = clean.match(/primary:([^/)]+)/)?.[1];
    const segments = clean.replace(/^\/+/, "").split(/[(/]/).filter(Boolean);
    const firstPath = segments[0] === "app" ? (segments[1] ?? "") : (segments[0] ?? "");
    const path = primaryOutlet || firstPath;

    return path;
  }

  private allBackgroundDomains(): RefreshDomain[] {
    return [
      "accounts",
      "portfolio",
      "orderbook",
      "options",
      "futures",
      "lending",
      "fees",
      "vault",
      "prices",
      "tokens",
      "treasury",
      "protocol",
      "warnings",
    ];
  }

  // ---- emitters funnel into policy ----
  emitDomainEvent(ev: DomainEvent) {
    this._domainEvent.set(ev);
    this.handleDomainEvent(ev);
  }

  emitSettingsEvent(ev: SettingsEvent) {
    this._settingsEvent.set(ev);
    this.handleSettingsEvent(ev);
  }

  // ---- central policy ----
  private handleDomainEvent(ev: DomainEvent) {
    switch (ev.type) {
      case "walletConnected":
      case "walletDisconnected":
      case "walletAddressChanged": {
        this.refreshDomains([
          "wallet",
          "accounts",
          "tokens",
          "prices",
          "portfolio",
          "orderbook",
          "options",
          "futures",
          "lending",
          "warnings",
          "treasury",
        ]);
        return;
      }

      case "accountCreated": {
        this.refreshDomains(["accounts", "portfolio", "treasury", "warnings"]);
        return;
      }

      case "accountsChanged": {
        this.refreshDomains(["portfolio", "treasury", "warnings"]);
        return;
      }

      case "deposit":
      case "withdraw": {
        this.refreshDomains(["portfolio", "vault", "treasury", "warnings"]);
        return;
      }

      case "erc20TokensChanged": {
        this.refreshDomains(["tokens", "prices", "portfolio", "warnings"]);
        return;
      }

      case "orderPlaced": {
        this.refreshDomains(["orderbook", "portfolio", "warnings"]);
        return;
      }

      case "Option Reclaimed":
      case "Option Exercised":
      case "optionOrderPlaced": {
        this.refreshDomains(["options", "portfolio", "warnings"]);
        return;
      }

      case "futuresOrderPlaced": {
        this.refreshDomains(["futures", "portfolio", "warnings"]);
        return;
      }

      case "lendingOrderbookChanged": {
        this.refreshDomains(["lending", "portfolio", "vault", "warnings"]);
        return;
      }
    }
  }

  private handleSettingsEvent(ev: SettingsEvent) {
    switch (ev.type) {
      case "accountChanged": {
        this.refreshDomains([
          "portfolio",
          "orderbook",
          "options",
          "futures",
          "lending",
          "warnings",
          "treasury",
        ]);
        return;
      }

      case "preferredFeeTokenChanged": {
        this.refreshDomains(["fees"]);
        return;
      }
    }
  }
}
