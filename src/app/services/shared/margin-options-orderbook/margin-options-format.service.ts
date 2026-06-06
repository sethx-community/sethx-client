import { Injectable, inject } from '@angular/core';
import { ethers } from 'ethers';
import { formatUnitsHuman, formatTokenAmount, formatDecimal } from '../../../core/format/number-format';
import { TokenService } from '../token.service';
import { ETH_ADDRESS } from '../main.tokens';
import { norm } from '../../../core/tokens/token-normalize';
@Injectable({providedIn:'root'})
export class MarginOptionsFormatService{
 private readonly tokens=inject(TokenService);
 tokenLabel(a:string|null|undefined):string{const k=norm(a??''); if(!k||k===norm(ethers.ZeroAddress)||k===norm(ETH_ADDRESS))return'ETH'; return this.tokens.getToken(k)()?.symbol??`${k.slice(0,6)}…${k.slice(-4)}`}
 tokenDecimals(a:string|null|undefined):number{const k=norm(a??''); if(!k||k===norm(ethers.ZeroAddress)||k===norm(ETH_ADDRESS))return 18; return this.tokens.getToken(k)()?.decimals??18}
 formatAmount(v:bigint|null|undefined,t:string|null|undefined):string{return formatTokenAmount(v??0n,this.tokenDecimals(t),this.tokenLabel(t),{maxDecimals:6,compactFrom:1_000_000})}
 formatQuantity(v:bigint|null|undefined,decimals:number=18):string{return formatUnitsHuman(v??0n,decimals,{maxDecimals:6,compactFrom:1_000_000})}
 formatEth(v:bigint|null|undefined):string{return formatTokenAmount(v??0n,18,'ETH',{maxDecimals:6,compactFrom:1_000_000})}
 formatStrike(v:bigint|null|undefined):string{return formatUnitsHuman(v??0n,18,{maxDecimals:8,mode:'scaled-small',compactFrom:1_000_000})}
 formatOraclePrice(v:bigint|null|undefined,decimals:number|null|undefined):string{return formatUnitsHuman(v??0n,decimals??18,{maxDecimals:8,mode:'scaled-small',compactFrom:1_000_000})}
 formatBpsPercent(v:bigint|null|undefined):string{const n=Number(v??0n)/100; return `${formatDecimal(n,{maxDecimals:2})}%`}
 formatPrice(v:bigint|null|undefined,t?:string|null):string{return formatTokenAmount(v??0n,18,this.tokenLabel(t),{maxDecimals:8,mode:'scaled-small',compactFrom:1_000_000})}
 optionTypeLabel(t:number):string{return Number(t)===0?'CALL':'PUT'}
 intentLabel(i:number):string{return i===0?'Buy option':i===1?'Sell holder':i===2?'Write option':i===3?'Sell writer':'Unknown'}
 marketTitle(m:{optionType:number;ticker:string;baseToken:string;paymentToken:string;strikePrice:bigint}):string{return `${this.optionTypeLabel(m.optionType)} ${m.ticker||this.tokenLabel(m.baseToken)} / ${this.tokenLabel(m.paymentToken)} @ ${this.formatStrike(m.strikePrice)}`}
}
