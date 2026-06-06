import { Injectable, inject } from '@angular/core';
import { ethers } from 'ethers';
import { formatUnitsHuman, formatTokenAmount, formatDecimal } from '../../../core/format/number-format';
import { OptionsOrderBookFormatService } from '../options-orderbook/options-orderbook-format.service';
@Injectable({providedIn:'root'})
export class BinaryOptionsFormatService{
 private readonly optionFmt=inject(OptionsOrderBookFormatService);
 tokenLabel(a:string):string{return this.optionFmt.tokenLabel(a)}
 formatEth(v:bigint):string{return formatTokenAmount(v,18,'ETH',{maxDecimals:6,compactFrom:1_000_000})}
 formatStrikeValue(v:bigint):string{return formatUnitsHuman(v,18,{maxDecimals:8,mode:'scaled-small',compactFrom:1_000_000})}
 formatStrike(v:bigint):string{return `${this.formatStrikeValue(v)} ETH`}
 formatProbability(v:bigint):string{return `${formatUnitsHuman(v,18,{maxDecimals:6,mode:'scaled-small'})} ETH per 1 ETH payout (${formatUnitsHuman(v*100n,18,{maxDecimals:2})}%)`}
 formatPricePerEth(v:bigint):string{return formatTokenAmount(v,18,'ETH',{maxDecimals:6,mode:'scaled-small',compactFrom:1_000_000})}
 condition(t:number,base:string,strike:bigint):string{const op=t===0?'Above':'Below'; const sign=t===0?'>':'<'; return `${op}: ${base} ${sign} ${this.formatStrikeValue(strike)}`}
}
