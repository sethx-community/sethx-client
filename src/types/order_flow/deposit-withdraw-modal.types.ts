// deposit-withdraw-modal.types.ts
export type WalletAction = 'deposit' | 'withdraw';
export type WalletAsset = 'ETH' | 'TOKEN';

export interface DepositWithdrawModalData {
  intent: WalletAction; // deposit | withdraw
  asset: WalletAsset; // ETH | TOKEN

  // optional prefill (for token)
  tokenAddress?: string;
  tokenSymbol?: string;
  tokenDecimals?: number;

  // optional prefill amount
  amount?: string;
}
