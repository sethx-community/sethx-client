import { Injectable, inject } from '@angular/core';
import { ethers } from 'ethers';
import { OptionsOrderBookFormatService } from '../options-orderbook/options-orderbook-format.service';
@Injectable({providedIn:'root'})
export class BinaryOptionsFormatService{
 private readonly optionFmt=inject(OptionsOrderBookFormatService);
 tokenLabel(a:string):string{return this.optionFmt.tokenLabel(a)}
 formatEth(v:bigint):string{return `${ethers.formatEther(v)} ETH`}
 formatStrikeValue(v:bigint):string{return ethers.formatEther(v)}
 formatStrike(v:bigint):string{return `${this.formatStrikeValue(v)} ETH`}
 formatProbability(v:bigint):string{return `${ethers.formatEther(v)} ETH per 1 ETH payout (${ethers.formatUnits(v*100n,18)}%)`}
 formatPricePerEth(v:bigint):string{return `${ethers.formatEther(v)} ETH`}
 condition(t:number,base:string,strike:bigint):string{const op=t===0?'Above':'Below'; const sign=t===0?'>':'<'; return `${op}: ${base} ${sign} ${this.formatStrikeValue(strike)}`}
}
