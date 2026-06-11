import { Injectable, computed, inject, resource } from '@angular/core';
import { stableResourceValue } from '../../core/signals/stable-resource';
import { WalletConnectService } from '../../wallet/wallet-connect.service';
import { TriggerService } from './trigger.service';

function toNumber(value: unknown): number {
  try {
    const n = Number(value ?? 0);
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

@Injectable({ providedIn: 'root' })
export class MarketTimeService {
  private readonly wallet = inject(WalletConnectService);
  private readonly trigger = inject(TriggerService);

  private readonly _chainTime = resource<number, { tick: number }>({
    params: () => ({
      tick:
        this.trigger.orderbookTick() +
        this.trigger.optionsOrderbookTick() +
        this.trigger.futuresOrderbookTick() +
        this.trigger.lendingOrderbookTick(),
    }),
    loader: async () => {
      const walletProvider = this.wallet.provider?.() ?? null;
      if (!walletProvider) return Math.floor(Date.now() / 1000);

      const block = await walletProvider.getBlock('latest');
      const timestamp = toNumber(block?.timestamp);
      return timestamp > 0 ? timestamp : Math.floor(Date.now() / 1000);
    },
  });

  private readonly _stableChainTimestamp = stableResourceValue(() => this._chainTime.value(), Math.floor(Date.now() / 1000));

  readonly chainTimestamp = computed(() => this._stableChainTimestamp());

  isFutureTimestamp(value: bigint | number | string | null | undefined, now = this.chainTimestamp()): boolean {
    const ts = toNumber(value);
    return ts > now;
  }

  hasOpenOptionWindow(market: { active?: boolean; settled?: boolean; expiry?: bigint | number | string } | null | undefined, now = this.chainTimestamp()): boolean {
    if (!market) return false;
    return !!market.active && !market.settled && this.isFutureTimestamp(market.expiry, now);
  }

  hasOpenDatedMarket(row: { active?: boolean; primarySettled?: boolean; expiry?: bigint | number | string } | null | undefined, now = this.chainTimestamp()): boolean {
    if (!row) return false;
    return !!row.active && !row.primarySettled && this.isFutureTimestamp(row.expiry, now);
  }
}
