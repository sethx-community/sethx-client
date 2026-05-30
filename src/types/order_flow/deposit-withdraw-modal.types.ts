// deposit-withdraw-modal.types.ts
export type WalletAction = 'deposit' | 'withdraw';
export type WalletAsset = 'ETH' | 'TOKEN' | 'NFT';

export interface DepositWithdrawModalData {
  intent: WalletAction; // deposit | withdraw
  asset: WalletAsset; // ETH | TOKEN

  // optional prefill (for token)
  tokenAddress?: string;
  tokenSymbol?: string;
  tokenDecimals?: number;

  // optional prefill (for ERC721 NFT)
  nftAddress?: string;
  tokenId?: string;

  // optional prefill amount
  amount?: string;
}
