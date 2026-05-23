import { Injectable, signal } from '@angular/core';

export type SettingsEvent =
  | { type: 'accountChanged'; accountId: string | null }
  | { type: 'preferredFeeTokenChanged'; feeToken: string };

export type DomainEvent =
  | { type: 'accountCreated' }
  | { type: 'walletConnected' }
  | { type: 'walletDisconnected' }
  | { type: 'walletAddressChanged'; address: string | null }
  | { type: 'deposit' }
  | { type: 'withdraw' }
  | { type: 'orderPlaced' }
  | { type: 'orderAccepted' }
  | { type: 'erc20TokensChanged'; tokens: string[] }
  | { type: 'accountsChanged'; accounts: string[] }
  | { type: 'Option Reclaimed' }
  | { type: 'Option Exercised' }
  | { type: 'optionOrderPlaced' }
  | { type: 'futuresOrderPlaced' }
  | { type: 'lendingOrderbookChanged' };

@Injectable({ providedIn: 'root' })
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

  private bump(sig: { update: (fn: (x: number) => number) => void }) {
    sig.update((x) => x + 1);
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
      case 'walletConnected':
      case 'walletDisconnected':
      case 'walletAddressChanged': {
        this.bump(this._walletTick);
        this.bump(this._accountsTick);
        this.bump(this._tokensTick);
        this.bump(this._pricesTick);
        this.bump(this._portfolioTick);
        this.bump(this._orderbookTick);
        this.bump(this._optionsOrderbookTick);
        this.bump(this._futuresOrderbookTick);
        this.bump(this._lendingOrderbookTick);
        return;
      }

      case 'accountCreated': {
        this.bump(this._accountsTick);
        this.bump(this._portfolioTick);
        return;
      }

      case 'accountsChanged': {
        // accounts list actually changed -> portfolio depends on it
        this.bump(this._portfolioTick);
        return;
      }

      case 'deposit':
      case 'withdraw': {
        this.bump(this._portfolioTick);
        this.bump(this._vaultTick);
        return;
      }

      case 'erc20TokensChanged': {
        // token universe actually changed
        this.bump(this._tokensTick);
        this.bump(this._pricesTick);
        this.bump(this._portfolioTick);
        // don't bump vaultTick here (loop risk)
        return;
      }

      case 'orderPlaced': {
        this.bump(this._orderbookTick);
        this.bump(this._portfolioTick);
        return;
      }

      case 'Option Reclaimed':
      case 'Option Exercised':
      case 'optionOrderPlaced': {
        this.bump(this._optionsOrderbookTick);
        this.bump(this._portfolioTick);
        return;
      }

      case 'futuresOrderPlaced': {
        this.bump(this._futuresOrderbookTick);
        this.bump(this._portfolioTick);
        return;
      }

      case 'lendingOrderbookChanged': {
        this.bump(this._lendingOrderbookTick);
        this.bump(this._portfolioTick);
        this.bump(this._vaultTick);
        return;
      }
    }
  }

  private handleSettingsEvent(ev: SettingsEvent) {
    switch (ev.type) {
      case 'accountChanged': {
        this.bump(this._portfolioTick);
        this.bump(this._orderbookTick);
        this.bump(this._optionsOrderbookTick);
        this.bump(this._futuresOrderbookTick);
        this.bump(this._lendingOrderbookTick);
        return;
      }

      case 'preferredFeeTokenChanged': {
        this.bump(this._feesTick);
        return;
      }
    }
  }
}
