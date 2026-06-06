import {
  Injectable,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { TriggerService } from './trigger.service';
import { AccountsChainService } from '../onchain/accounts.service';
import { TreasuryModeService } from './treasury-mode.service';
import { norm } from '../../core/tokens/token-normalize';

@Injectable({ providedIn: 'root' })
export class TradeSettingsService {
  private readonly trigger = inject(TriggerService);
  private readonly accountsSvc = inject(AccountsChainService);
  private readonly treasuryMode = inject(TreasuryModeService);

  // user intent
  private readonly _requestedAccountId = signal<string | null>(null);

  // effective selection (requested if valid, else first, else null)
  readonly selectedPersonalAccountId = computed<string | null>(() => {
    const list = (this.accountsSvc.accounts() ?? []).map(norm);
    if (list.length === 0) return null;

    const req = this._requestedAccountId();
    const r = req ? norm(req) : null;

    return r && list.includes(r) ? r : list[0];
  });

  readonly selectedAccountId = computed<string | null>(() => {
    const treasuryAccount = this.treasuryMode.selectedTreasuryAccount();
    if (this.treasuryMode.actingAsTreasurer() && treasuryAccount && this.treasuryMode.selectedAccountAccess()) {
      return norm(treasuryAccount);
    }

    return this.selectedPersonalAccountId();
  });

  constructor() {
    // ✅ emit whenever the *effective* selection changes (including default/restore)
    let lastEmitted: string | null = null;

    effect(() => {
      const active = this.selectedAccountId();
      if (active === lastEmitted) return;

      lastEmitted = active;

      // choose whether you want to emit null or not:
      // if (!active) return;

      untracked(() => {
        this.trigger.emitSettingsEvent({
          type: 'accountChanged',
          accountId: active,
        });
      });
    });
  }

  selectAccount(accountId: string | null) {
    this._requestedAccountId.set(accountId ? norm(accountId) : null);
    // no direct emit needed; the effect will emit the new effective selection
  }

  // ---- preferred fee token ----
  private readonly _preferredFeeToken = signal<string>(
    '0x0000000000000000000000000000000000000000',
  );
  readonly preferredFeeToken = this._preferredFeeToken.asReadonly();

  setPreferredFeeToken(feeToken: string) {
    if (this._preferredFeeToken() === feeToken) return;

    this._preferredFeeToken.set(feeToken);
    this.trigger.emitSettingsEvent({
      type: 'preferredFeeTokenChanged',
      feeToken,
    });
  }
}
