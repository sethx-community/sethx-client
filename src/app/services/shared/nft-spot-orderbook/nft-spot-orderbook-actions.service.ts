import { Injectable, inject } from '@angular/core';
import { ethers } from 'ethers';

import { getContractAddress } from '../../../contracts/contract-registry';
import { TransactionReceiptService } from '../../../shared/transaction-receipt';
import { AccountContractService } from '../../onchain/contracts/account-contract.service';
import { TriggerService } from '../trigger.service';
import { NftSpotOrderbookStore, NftSpotOrder } from './nft-spot-orderbook.store';

@Injectable({ providedIn: 'root' })
export class NftSpotOrderbookActionsService {
  private readonly account = inject(AccountContractService);
  private readonly trigger = inject(TriggerService);
  private readonly txReceipt = inject(TransactionReceiptService);
  private readonly store = inject(NftSpotOrderbookStore);

  private readonly orderBookAddress = getContractAddress('NFTSpotOrderBook');

  async accept(order: NftSpotOrder): Promise<void> {
    const feeToken = ethers.ZeroAddress;
    if (order.acceptDisabledReason) {
      this.txReceipt.error('Action unavailable', null, order.acceptDisabledReason);
      return;
    }

    this.txReceipt.pending('Accept NFT spot order', 'Waiting for wallet signature...');

    try {
      const txHash = await this.account.acceptNFTSpotOrder({
        orderBook: this.orderBookAddress,
        makerOrderId: order.raw.orderId,
        feeToken,
      });
      this.txReceipt.success('Transaction confirmed', typeof txHash === 'string' ? txHash : undefined, 'NFT spot order accepted.');
      this.trigger.emitDomainEvent({ type: 'orderPlaced' });
      this.store.refresh();
    } catch (error) {
      this.txReceipt.error('Transaction failed', error, 'Accepting the NFT spot order failed.');
    }
  }

  async cancel(order: NftSpotOrder): Promise<void> {
    this.txReceipt.pending('Cancel NFT spot order', 'Waiting for wallet signature...');

    try {
      const txHash = await this.account.cancelNFTSpotOrder({
        orderBook: this.orderBookAddress,
        orderId: order.raw.orderId,
      });
      this.txReceipt.success('Transaction confirmed', typeof txHash === 'string' ? txHash : undefined, 'NFT spot order cancelled.');
      this.trigger.emitDomainEvent({ type: 'orderPlaced' });
      this.store.refresh();
    } catch (error) {
      this.txReceipt.error('Transaction failed', error, 'Cancelling the NFT spot order failed.');
    }
  }
}
