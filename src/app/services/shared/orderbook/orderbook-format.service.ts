import { Injectable, inject } from '@angular/core';
import { ethers } from 'ethers';
import { ETH_ADDRESS } from '../main.tokens';
import { normAddr, shortAddr } from '../../../core/tokens/token-normalize';
import { SpotOrder } from '../../onchain/contracts/token-spot-orderbook-read.service';
import { TokenService } from '../token.service'; // adjust path to your TokenService

@Injectable({ providedIn: 'root' })
export class OrderBookFormatService {
  private readonly tokens = inject(TokenService);

  // -------- address / token helpers --------

  shortAddr(addr: string): string {
    return shortAddr(normAddr(addr));
  }

  tokenLabel(addr: string): string {
    const a = normAddr(addr);
    if (!a) return '—';

    // treat ETH consistently
    if (a === ethers.ZeroAddress.toLowerCase() || a === normAddr(ETH_ADDRESS))
      return 'ETH';

    const info = this.tokens.getToken(a)(); // Signal<TokenInfo | undefined>
    return info?.symbol ?? this.shortAddr(a);
  }

  tokenDecimals(addr: string): number {
    const info = this.tokens.getToken(normAddr(addr))();
    return info?.decimals ?? 18;
  }

  // -------- amount / price --------

  formatAmount(o: SpotOrder): string {
    const dec = this.tokenDecimals(o.baseToken);
    return ethers.formatUnits(o.amount, dec);
  }

  /**
   * Normalize to p18 human quote/base and format at 18.
   * p18 = priceFixed * 10^(dq - db)
   */
  formatPrice(o: SpotOrder): string {
    const db = this.tokenDecimals(o.baseToken);
    const dq = this.tokenDecimals(o.quoteToken);

    let p18 = o.price;
    const diff = dq - db;

    if (diff > 0) p18 = p18 * 10n ** BigInt(diff);
    if (diff < 0) p18 = p18 / 10n ** BigInt(-diff);

    return ethers.formatUnits(p18, 18);
  }

  formatPriceP18(p18: bigint | null | undefined): string {
    if (p18 === null || p18 === undefined) return '—';
    return ethers.formatUnits(p18, 18);
  }

  // -------- time / expiry --------

  formatExpiry(expiry: bigint): string {
    if (expiry === 0n) return 'No expiry';

    const secs = Number(expiry);
    if (!Number.isFinite(secs) || secs <= 0) return expiry.toString();

    const d = new Date(secs * 1000);
    return isNaN(d.getTime()) ? expiry.toString() : d.toLocaleString();
  }
}
