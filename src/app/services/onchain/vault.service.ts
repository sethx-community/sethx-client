import { Injectable, inject, resource, computed, effect } from '@angular/core';
import { stableResourceValue } from '../../core/signals/stable-resource';
import { VaultContractService } from './contracts/vault-contract.service';
import { TriggerService } from '../shared/trigger.service';
import { toStatus, type Status } from '../../core/tokens/resource-status';

@Injectable({ providedIn: 'root' })
export class VaultChainService {
  private readonly vaultContract = inject(VaultContractService);
  private readonly trigger = inject(TriggerService);

  private _erc20Fp = '';

  private readonly _erc20TokensRes = resource<string[], {}>({
    params: () => ({}),
    loader: async () => {
      const tokens = (await this.vaultContract.getERC20Tokens()) ?? [];

      const fp = [...tokens].sort().join('|');
      if (fp !== this._erc20Fp) {
        this._erc20Fp = fp;
        this.trigger.emitDomainEvent({ type: 'erc20TokensChanged', tokens });
      }

      return tokens;
    },
  });

  private readonly _erc721TokensRes = resource<string[] | null, {}>({
    params: () => ({}),
    loader: async () => this.vaultContract.getERC721Tokens(),
  });

  private readonly _erc1155TokensRes = resource<string[] | null, {}>({
    params: () => ({}),
    loader: async () => this.vaultContract.getERC1155Tokens(),
  });

  // PUBLIC computeds
  private readonly _stableErc20Tokens = stableResourceValue(() => this._erc20TokensRes.value(), [] as string[]);
  private readonly _stableErc721Tokens = stableResourceValue(() => { const value = this._erc721TokensRes.value(); return value === undefined ? undefined : (value ?? []); }, [] as string[]);
  private readonly _stableErc1155Tokens = stableResourceValue(() => { const value = this._erc1155TokensRes.value(); return value === undefined ? undefined : (value ?? []); }, [] as string[]);

  readonly erc20Tokens = computed(() => this._stableErc20Tokens());
  readonly erc20Status = computed<Status>(() =>
    toStatus(this._erc20TokensRes.status()),
  );
  readonly erc20Error = computed(() => this._erc20TokensRes.error() ?? null);

  readonly erc721Tokens = computed(() => this._stableErc721Tokens());
  readonly erc721Status = computed<Status>(() =>
    toStatus(this._erc721TokensRes.status()),
  );
  readonly erc721Error = computed(() => this._erc721TokensRes.error() ?? null);

  readonly erc1155Tokens = computed(() => this._stableErc1155Tokens());
  readonly erc1155Status = computed<Status>(() =>
    toStatus(this._erc1155TokensRes.status()),
  );
  readonly erc1155Error = computed(
    () => this._erc1155TokensRes.error() ?? null,
  );

  /** Refresh everything vault-related (use this on deposit/withdraw). */
  refreshVault() {
    this._erc20TokensRes.reload();
    this._erc721TokensRes.reload();
    this._erc1155TokensRes.reload();
  }

  constructor() {
    // ✅ tick lives in effect; effect triggers reload
    effect(() => {
      this.trigger.vaultTick();
      this.refreshVault();
    });
  }
}
