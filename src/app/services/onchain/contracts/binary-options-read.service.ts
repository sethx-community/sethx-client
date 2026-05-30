import { Injectable, inject } from '@angular/core';
import { ethers } from 'ethers';
import { WalletConnectService } from '../../../wallet/wallet-connect.service';
import { getContractAddress } from '../../../contracts/contract-registry';
import { CONTRACT_ABIS } from '../../../contracts/generated';

export type BinaryMarket = { initialized:boolean; active:boolean; settled:boolean; optionType:number; ticker:string; oracle:string; baseToken:string; paymentToken:string; oraclePriceDecimals:number; paymentTokenDecimals:number; strikePrice:bigint; strikeIncrement:bigint; expiry:bigint; settlementPrice:bigint; totalPayout:bigint; totalClaimed:bigint; totalWriterMargin:bigint; totalPaidOut:bigint; openInterest?:bigint; latestOraclePrice?:bigint; latestOraclePriceDecimals?:number; latestOracleTimestamp?:bigint; latestOracleStatus?:number; };
export type BinaryOrder = { orderId:bigint; user:string; marketKey:string; intent:number; payoutAmount:bigint; askPrice:bigint; expiry:bigint; active:boolean; };
function bi(x:any):bigint{try{return typeof x==='bigint'?x:BigInt(x?.toString?.()??'0')}catch{return 0n}}
function addr(x:any):string{return String(x??'').toLowerCase()}
@Injectable({providedIn:'root'})
export class BinaryOptionsReadService{
 private readonly wallet=inject(WalletConnectService);
 readonly binaryContractAddress=getContractAddress('BinaryMarginOptionContract');
 readonly orderBookAddress=getContractAddress('BinaryMarginOptionsOrderBook');
 private async binaryContractOrNull():Promise<any|null>{const p=await this.wallet.getEthersProvider(); return p?new ethers.Contract(this.binaryContractAddress,CONTRACT_ABIS.BinaryMarginOptionContract,p) as any:null}
 private async orderBookContractOrNull():Promise<any|null>{const p=await this.wallet.getEthersProvider(); return p?new ethers.Contract(this.orderBookAddress,CONTRACT_ABIS.BinaryMarginOptionsOrderBook,p) as any:null}
 private async priceManagerContractOrNull():Promise<any|null>{const p=await this.wallet.getEthersProvider(); return p?new ethers.Contract(getContractAddress('PriceManager'),CONTRACT_ABIS.PriceManager,p) as any:null}
 private mapMarket(m:any):BinaryMarket|null{if(!m)return null; const initialized=Boolean(m.initialized??m[0]); if(!initialized)return null; return {initialized,active:Boolean(m.active??m[1]),settled:Boolean(m.settled??m[2]),optionType:Number(m.optionType??m[3]??0),ticker:String(m.ticker??m[4]??''),oracle:addr(m.oracle??m[5]),baseToken:addr(m.baseToken??m[6]),paymentToken:addr(m.paymentToken??m[7]),oraclePriceDecimals:Number(m.oraclePriceDecimals??m[8]??18),paymentTokenDecimals:Number(m.paymentTokenDecimals??m[9]??18),strikePrice:bi(m.strikePrice??m[10]),strikeIncrement:bi(m.strikeIncrement??m[11]),expiry:bi(m.expiry??m[12]),settlementPrice:bi(m.settlementPrice??m[13]),totalPayout:bi(m.totalPayout??m[14]),totalClaimed:bi(m.totalClaimed??m[15]),totalWriterMargin:bi(m.totalWriterMargin??m[16]),totalPaidOut:bi(m.totalPaidOut??m[17])}}
 private mapOrder(o:any, mk?:string):BinaryOrder|null{if(!o)return null; const user=addr(o.user??o[1]); if(!user||user===ethers.ZeroAddress.toLowerCase())return null; return {orderId:bi(o.orderId??o[0]),user,marketKey:String(o.marketKey??o[2]??mk??'').toLowerCase(),intent:Number(o.intent??o[3]??0),payoutAmount:bi(o.payoutAmount??o[4]),askPrice:bi(o.askPrice??o[5]),expiry:bi(o.expiry??o[6]),active:Boolean(o.active??o[7])}}
 async latestTimestamp(): Promise<bigint>{const p=await this.wallet.getEthersProvider(); if(!p)return BigInt(Math.floor(Date.now()/1000)); const b=await p.getBlock('latest'); return BigInt(b?.timestamp ?? Math.floor(Date.now()/1000));}
 async getMarketCount():Promise<bigint>{const c=await this.binaryContractOrNull(); return c?bi(await c['marketCount']()):0n}
 async getMarketKeyAt(i:number):Promise<string|null>{const c=await this.binaryContractOrNull(); if(!c)return null; try{return String(await c['marketKeyAt'](i)).toLowerCase()}catch{return null}}
 async getMarket(mk:string):Promise<BinaryMarket|null>{const c=await this.binaryContractOrNull(); if(!c)return null; try{const market=this.mapMarket(await c['getMarket'](mk)); if(market){try{market.openInterest=bi(await c['marketOpenInterest'](mk))}catch{market.openInterest=0n} try{const pm=await this.priceManagerContractOrNull(); if(pm&&market.oracle){const p=await pm['getOraclePrice'](market.oracle,4); market.latestOraclePrice=bi(p.price??p[0]); market.latestOraclePriceDecimals=Number(p.priceDecimals??p[1]??market.oraclePriceDecimals??18); market.latestOracleTimestamp=bi(p.timestamp??p[2]); market.latestOracleStatus=Number(p.status??p[3]??0)}}catch{}} return market}catch{return null}}
 async getOpenOrders(mk:string,bid:boolean):Promise<BinaryOrder[]>{const c=await this.orderBookContractOrNull(); if(!c)return []; try{return ((await c['getOpenOrders'](mk,bid))??[]).map((x:any)=>this.mapOrder(x,mk)).filter((x:BinaryOrder|null):x is BinaryOrder=>!!x&&x.active&&x.payoutAmount>0n)}catch{return []}}
 async getHolderClaimablePayout(mk:string,acct:string):Promise<bigint>{const c=await this.binaryContractOrNull(); if(!c||!acct)return 0n; try{return bi(await c['getHolderClaimablePayout'](mk,acct))}catch{return 0n}}
 async getWriterAvailableMargin(mk:string,acct:string):Promise<bigint>{const c=await this.binaryContractOrNull(); if(!c||!acct)return 0n; try{return bi(await c['getWriterAvailableMargin'](mk,acct))}catch{return 0n}}
 async getMarketOpenInterest(mk:string):Promise<bigint>{const c=await this.binaryContractOrNull(); if(!c)return 0n; try{return bi(await c['marketOpenInterest'](mk))}catch{return 0n}}
}
