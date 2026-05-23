import { Component, Input, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TradeSettingsService } from '../../services/shared/trade-settings.service';
import { FeeService } from '../../services/shared/fee.service';
import { FormsModule } from '@angular/forms';

import { AccountsChainService } from '../../services/onchain/accounts.service';
import { isEthLike, norm, toAddr } from '../../core/tokens/token-normalize';
import { TokenService } from '../../services/shared/token.service';

@Component({
  selector: 'app-trade-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './trade-settings.component.html',
})
export class TradeSettingsComponent {
  @Input() boxed = true;
  @Input() showContext = true;
  readonly settings = inject(TradeSettingsService);
  readonly accountsService = inject(AccountsChainService);
  private readonly feeService = inject(FeeService);
  private readonly tokenService = inject(TokenService);

  readonly feeTokenOptions = computed(() => {
    const out: string[] = [];
    const seen = new Set<string>();

    for (const raw of this.feeService.acceptedPaymentTokens() ?? []) {
      const value = isEthLike(raw)
        ? '0x0000000000000000000000000000000000000000'
        : norm(raw);

      if (!value || seen.has(value)) continue;

      seen.add(value);
      out.push(value);
    }

    // Always offer ETH once when native fees are accepted or while reads are booting.
    if (!seen.size || seen.has('0x0000000000000000000000000000000000000000')) {
      return ['0x0000000000000000000000000000000000000000', ...out.filter((v) => !isEthLike(v))];
    }

    return out;
  });

  readonly feeToken = this.settings.preferredFeeToken;
  readonly accounts = computed(() =>
    this.accountsService.accountRecords().filter((account) => account.active),
  );
  readonly selectedAccountId = this.settings.selectedAccountId;

  setFeeToken(v: string): void {
    this.settings.setPreferredFeeToken(v);
  }

  setAccountId(v: string): void {
    const key = norm((v ?? '').trim());
    this.settings.selectAccount(key || null);
  }

  accountLabel(account: string): string {
    return this.accountsService.accountLabel(account);
  }

  selectedAccountLabel(): string {
    const account = this.selectedAccountId();
    return account ? this.accountLabel(account) : 'No account selected';
  }

  tokenLabel(token: string): string {
    if (isEthLike(token)) return 'ETH';

    const normalized = norm(toAddr(token));
    const sethx = norm(this.feeService.sethxToken() ?? '');
    if (sethx && normalized === sethx) return 'SETHX';

    const info = this.tokenService.getToken(normalized)();

    if (info?.symbol) return info.symbol;
    if (normalized.length < 10) return normalized || 'ETH';

    return `${normalized.slice(0, 6)}...${normalized.slice(-4)}`;
  }
}
