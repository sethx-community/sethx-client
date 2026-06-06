import { Injectable, inject } from '@angular/core';
import { ethers } from 'ethers';
import { formatUnitsHuman, formatTokenAmount, formatDecimal } from '../../../core/format/number-format';
import { ETH_ADDRESS } from '../main.tokens';
import { normAddr, shortAddr } from '../../../core/tokens/token-normalize';
import { TokenService } from '../token.service';

@Injectable({ providedIn: 'root' })
export class OptionsOrderBookFormatService {
  private readonly tokens = inject(TokenService);

  shortAddr(addr: string): string {
    return shortAddr(normAddr(addr));
  }

  tokenLabel(addr: string): string {
    const a = normAddr(addr);
    if (!a) return '—';
    if (a === ethers.ZeroAddress.toLowerCase() || a === normAddr(ETH_ADDRESS))
      return 'ETH';
    const info = this.tokens.getToken(a)();
    return info?.symbol ?? this.shortAddr(a);
  }

  tokenDecimals(addr: string): number {
    const info = this.tokens.getToken(normAddr(addr))();
    return info?.decimals ?? 18;
  }

  formatSize(sizeRaw: bigint, assetToken: string): string {
    const dec = this.tokenDecimals(assetToken);
    return formatUnitsHuman(sizeRaw, dec, { maxDecimals: 6, compactFrom: 1_000_000 });
  }

  /**
   * Formats a price stored as "fixed" such that quoteRaw = (assetRaw * priceFixed) / 1e18.
   * Returns a human quote-per-asset string.
   */
  formatPriceFixed(
    priceFixed: bigint,
    assetToken: string,
    quoteToken: string,
  ): string {
    const db = this.tokenDecimals(assetToken);
    const dq = this.tokenDecimals(quoteToken);

    // Convert fixed-price into p18 human quote/base
    let p18 = priceFixed;
    const diff = dq - db;
    if (diff > 0) p18 = p18 * 10n ** BigInt(diff);
    if (diff < 0) p18 = p18 / 10n ** BigInt(-diff);

    return formatUnitsHuman(p18, 18, { maxDecimals: 8, mode: 'scaled-small', compactFrom: 1_000_000 });
  }
}
