import { Injectable, inject } from '@angular/core';
import { Contract as EthersContract, ethers } from 'ethers';
import { EthersContractService } from './ethers-contract.service';
import { ACCOUNT_ABI } from './sethx.abi';
import { WalletConnectService } from '../../../wallet/wallet-connect.service';
import { ErrorService } from '../../shared/error.service';
import { TradeSettingsService } from '../../shared/trade-settings.service'; // adjust path if needed
import { norm } from '../../../core/tokens/token-normalize';
import { getContractAddress } from '../../../contracts/contract-registry';

@Injectable({ providedIn: 'root' })
export class AccountContractService extends EthersContractService<EthersContract> {
  protected readonly abi = ACCOUNT_ABI;
  protected readonly defaultAddress = undefined; // always require account address

  private readonly settings = inject(TradeSettingsService);

  constructor(wallet: WalletConnectService, error: ErrorService) {
    super(wallet, error);
  }

  // -----------------------------
  // Account resolution
  // -----------------------------

  private getAccountOrThrow(): string {
    const acct = norm(this.settings.selectedAccountId() ?? '');
    if (!acct) throw new Error('No account selected');
    return acct;
  }

  private getVaultOrThrow(): string {
    return getContractAddress('SethxVault');
  }

  async getAccountName(account: string): Promise<string> {
    return this.read('accountName' as any, [] as any, account);
  }

  async setAccountName(account: string, name: string): Promise<void> {
    await this.call(
      'setAccountName' as any,
      [name] as any,
      'Setting account name failed',
      account,
    );
  }

  // -----------------------------
  // Spot orderbook actions
  // -----------------------------

  async cancelSpotTokenOrder(args: {
    orderBook: string; // TokenSpotOrderBook address
    orderId: bigint;
  }) {
    const account = this.getAccountOrThrow();

    return this.call(
      'cancelOrderTokenSpot',
      [args.orderBook, args.orderId] as any,
      'Cancelling spot order failed',
      account,
    );
  }

  async acceptSpotTokenOrder(args: {
    orderBook: string;
    makerOrderId: bigint;
    amount: bigint; // base amount raw
    feeToken: string; // address(0) or ERC20
  }) {
    const account = this.getAccountOrThrow();

    return this.call(
      'acceptOrderTokenSpot',
      [args.orderBook, args.makerOrderId, args.amount, args.feeToken] as any,
      'Accepting spot order failed',
      account,
    );
  }

  async placeOrderTokenSpot(params: {
    orderBook: string; // TokenSpotOrderBook address
    feeToken: string; // address(0) or ERC20
    baseToken: string; // address(0) or ERC20
    quoteToken: string; // address(0) or ERC20
    side: 0 | 1; // 0=Bid, 1=Ask
    price: bigint; // fixed price (per your contract)
    amount: bigint; // base amount raw
    expiry: bigint; // absolute Unix timestamp, or 0 for contract default
  }) {
    const account = this.getAccountOrThrow();

    return this.call(
      'placeOrderTokenSpot',
      [
        params.orderBook,
        params.feeToken,
        params.baseToken,
        params.quoteToken,
        params.side,
        params.price,
        params.amount,
        params.expiry,
      ] as any,
      'Order placement failed',
      account,
    );
  }

  // -----------------------------
  // Options orderbook actions
  // -----------------------------

  async placeOrderOption(params: {
    orderBook: string; // OptionsOrderBook address
    optionType: number; // enum OptionContract.OptionType
    assetToken: string;
    quoteToken: string;
    strikePrice: bigint;
    optionExpiry: bigint;
    orderExpiry: bigint;
    feeToken: string; // required for long-side maker orders; can be 0 for short-side
    intent: number; // enum OptionsOrderBook.OrderIntent
    size: bigint;
    askPrice: bigint;
  }) {
    const account = this.getAccountOrThrow();

    return this.call(
      'placeOrderOption',
      [
        params.orderBook,
        params.optionType,
        params.assetToken,
        params.quoteToken,
        params.strikePrice,
        params.optionExpiry,
        params.orderExpiry,
        params.feeToken,
        params.intent,
        params.size,
        params.askPrice,
      ] as any,
      'Order placement failed',
      account,
    );
  }

  async cancelOptionOrder(args: { orderBook: string; orderId: number }) {
    const account = this.getAccountOrThrow();
    return this.call(
      'cancelOrderOption',
      [args.orderBook, args.orderId] as any,
      'Cancelling option order failed',
      account,
    );
  }

  async acceptOptionOrder(args: {
    orderBook: string;
    makerOrderId: number;
    amount: bigint;
    feeToken: string;
  }) {
    const account = this.getAccountOrThrow();
    return this.call(
      'acceptOrderOption',
      [args.orderBook, args.makerOrderId, args.amount, args.feeToken] as any,
      'Accepting option order failed',
      account,
    );
  }

  async placeOrderFutures(params: {
    orderBook: string;
    marketKey: string;
    side: 0 | 1;
    price: bigint;
    amount: bigint;
    expiry: bigint;
    feeToken: string;
  }) {
    const account = this.getAccountOrThrow();
    return this.call(
      'placeOrderFutures',
      [
        params.orderBook,
        params.marketKey,
        params.side,
        params.price,
        params.amount,
        params.expiry,
        params.feeToken,
      ] as any,
      'Futures order placement failed',
      account,
    );
  }

  async cancelFuturesOrder(args: { orderBook: string; orderId: bigint }) {
    const account = this.getAccountOrThrow();
    return this.call(
      'cancelOrderFutures',
      [args.orderBook, args.orderId] as any,
      'Cancelling futures order failed',
      account,
    );
  }



  // -----------------------------
  // Margin options actions
  // -----------------------------

  async placeOrderMarginOption(params: { orderBook: string; marketKey: string; intent: number; size: bigint; askPrice: bigint; expiry: bigint; feeToken: string }) {
    const account = this.getAccountOrThrow();
    return this.call('placeOrderMarginOption' as any, [params.orderBook, params.marketKey, params.intent, params.size, params.askPrice, params.expiry, params.feeToken] as any, 'Margin option order placement failed', account);
  }
  async placeOrderMarginOptionForMarket(params: { orderBook: string; ticker: string; optionType: number; oracle: string; strikePrice: bigint; marketExpiry: bigint; collateralBps: bigint; intent: number; size: bigint; askPrice: bigint; expiry: bigint; feeToken: string }) {
    const account = this.getAccountOrThrow();
    return this.call('placeOrderMarginOptionForMarket' as any, [params.orderBook, params.ticker, params.optionType, params.oracle, params.strikePrice, params.marketExpiry, params.collateralBps, params.intent, params.size, params.askPrice, params.expiry, params.feeToken] as any, 'Margin option order placement failed', account);
  }

  async acceptMarginOptionOrder(args: { orderBook: string; makerOrderId: bigint; amount: bigint; feeToken: string }) {
    const account = this.getAccountOrThrow();
    return this.call('acceptOrderMarginOption' as any, [args.orderBook, args.makerOrderId, args.amount, args.feeToken] as any, 'Accepting margin option order failed', account);
  }
  async cancelMarginOptionOrder(args: { orderBook: string; orderId: bigint }) {
    const account = this.getAccountOrThrow();
    return this.call('cancelOrderMarginOption' as any, [args.orderBook, args.orderId] as any, 'Cancelling margin option order failed', account);
  }
  async claimMarginOption(args: { marginContract: string; marketKey: string; size: bigint }) {
    const account = this.getAccountOrThrow();
    return this.call('claimMarginOption' as any, [args.marginContract, args.marketKey, args.size] as any, 'Claiming margin option payout failed', account);
  }
  async reclaimWriterMarginOption(args: { marginContract: string; marketKey: string }) {
    const account = this.getAccountOrThrow();
    return this.call('reclaimWriterMarginOption' as any, [args.marginContract, args.marketKey] as any, 'Reclaiming margin option writer margin failed', account);
  }

  // -----------------------------
  // Binary margin options actions
  // -----------------------------

  async placeOrderBinaryMarginOption(params: {
    orderBook: string;
    marketKey: string;
    intent: number;
    payoutAmount: bigint;
    askPrice: bigint;
    expiry: bigint;
    feeToken: string;
  }) {
    const account = this.getAccountOrThrow();
    return this.call(
      'placeOrderBinaryMarginOption' as any,
      [
        params.orderBook,
        params.marketKey,
        params.intent,
        params.payoutAmount,
        params.askPrice,
        params.expiry,
        params.feeToken,
      ] as any,
      'Binary option order placement failed',
      account,
    );
  }

  async placeOrderBinaryMarginOptionForMarket(params: { orderBook: string; ticker: string; optionType: number; oracle: string; strikePrice: bigint; marketExpiry: bigint; intent: number; payoutAmount: bigint; askPrice: bigint; expiry: bigint; feeToken: string }) {
    const account = this.getAccountOrThrow();
    return this.call('placeOrderBinaryMarginOptionForMarket' as any, [params.orderBook, params.ticker, params.optionType, params.oracle, params.strikePrice, params.marketExpiry, params.intent, params.payoutAmount, params.askPrice, params.expiry, params.feeToken] as any, 'Binary option order placement failed', account);
  }

  async acceptBinaryMarginOptionOrder(args: {
    orderBook: string;
    makerOrderId: bigint;
    payoutAmount: bigint;
    feeToken: string;
  }) {
    const account = this.getAccountOrThrow();
    return this.call(
      'acceptOrderBinaryMarginOption' as any,
      [args.orderBook, args.makerOrderId, args.payoutAmount, args.feeToken] as any,
      'Accepting binary option order failed',
      account,
    );
  }

  async cancelBinaryMarginOptionOrder(args: { orderBook: string; orderId: bigint }) {
    const account = this.getAccountOrThrow();
    return this.call(
      'cancelOrderBinaryMarginOption' as any,
      [args.orderBook, args.orderId] as any,
      'Cancelling binary option order failed',
      account,
    );
  }

  async claimBinaryMarginOption(args: {
    binaryContract: string;
    marketKey: string;
    payoutAmount: bigint;
  }) {
    const account = this.getAccountOrThrow();
    return this.call(
      'claimBinaryMarginOption' as any,
      [args.binaryContract, args.marketKey, args.payoutAmount] as any,
      'Claiming binary option payout failed',
      account,
    );
  }

  async reclaimWriterBinaryMarginOption(args: {
    binaryContract: string;
    marketKey: string;
  }) {
    const account = this.getAccountOrThrow();
    return this.call(
      'reclaimWriterBinaryMarginOption' as any,
      [args.binaryContract, args.marketKey] as any,
      'Reclaiming binary writer margin failed',
      account,
    );
  }

  // -----------------------------
  // NFT Spot orderbook actions
  // -----------------------------

  async placeOrderNFTSpot(params: {
    orderBook: string;
    feeToken: string;
    nft: string;
    tokenId: bigint;
    quoteToken: string;
    side: 0 | 1;
    price: bigint;
    expiry: bigint;
  }) {
    const account = this.getAccountOrThrow();
    return this.call(
      'placeOrderNFTSpot' as any,
      [
        params.orderBook,
        params.feeToken,
        params.nft,
        params.tokenId,
        params.quoteToken,
        params.side,
        params.price,
        params.expiry,
      ] as any,
      'NFT spot order placement failed',
      account,
    );
  }

  async acceptNFTSpotOrder(args: {
    orderBook: string;
    makerOrderId: bigint;
    feeToken: string;
  }) {
    const account = this.getAccountOrThrow();
    return this.call(
      'acceptOrderNFTSpot' as any,
      [args.orderBook, args.makerOrderId, args.feeToken] as any,
      'Accepting NFT spot order failed',
      account,
    );
  }

  async cancelNFTSpotOrder(args: { orderBook: string; orderId: bigint }) {
    const account = this.getAccountOrThrow();
    return this.call(
      'cancelOrderNFTSpot' as any,
      [args.orderBook, args.orderId] as any,
      'Cancelling NFT spot order failed',
      account,
    );
  }


  private async ensureERC721Approval(nft: string, tokenId: bigint, spender: string): Promise<void> {
    const provider = await this.walletService.getEthersProvider();
    if (!provider) throw new Error('No provider');

    const signer = await provider.getSigner?.();
    if (!signer) throw new Error('No signer available');

    const owner = await signer.getAddress();
    const erc721 = new ethers.Contract(
      nft,
      [
        'function ownerOf(uint256 tokenId) view returns (address)',
        'function getApproved(uint256 tokenId) view returns (address)',
        'function isApprovedForAll(address owner,address operator) view returns (bool)',
        'function approve(address to,uint256 tokenId)',
      ],
      signer,
    );

    const currentOwner = String(await erc721['ownerOf'](tokenId));
    if (currentOwner.toLowerCase() !== owner.toLowerCase()) {
      throw new Error('Connected wallet does not own this NFT.');
    }

    const [approved, approvedForAll] = await Promise.all([
      erc721['getApproved'](tokenId).catch(() => ethers.ZeroAddress),
      erc721['isApprovedForAll'](owner, spender).catch(() => false),
    ]);

    if (String(approved).toLowerCase() === spender.toLowerCase() || approvedForAll) return;

    const tx = await erc721['approve'](spender, tokenId);
    await tx.wait();
  }

  // -----------------------------
  // Vault actions
  // -----------------------------

  async depositETH(amountHuman: string) {
    const account = this.getAccountOrThrow();
    const vault = this.getVaultOrThrow();
    return this.call(
      'depositETH',
      [account, vault, { value: ethers.parseEther(amountHuman) }] as any,
      'ETH deposit failed',
      account,
    );
  }

  async withdrawETH(amountHuman: string) {
    const account = this.getAccountOrThrow();
    return this.call(
      'withdrawETH',
      [ethers.parseEther(amountHuman)] as any,
      'ETH withdrawal failed',
      account,
    );
  }

  /**
   * Deposit ERC20 into the account contract.
   * - Infers owner (EOA) from connected signer.
   * - Ensures allowance(owner -> account) >= amount before depositing.
   */
  async depositToken(args: {
    token: string;
    amountHuman: string;
    decimals?: number;
  }) {
    const account = this.getAccountOrThrow();
    const vault = this.getVaultOrThrow();
    const decimals = args.decimals ?? 18;
    const normalizedAmount = args.amountHuman.replace(',', '.');

    await this.ensureAllowance(args.token, account, normalizedAmount, decimals);

    return this.call(
      'depositToken' as any,
      [
        args.token,
        ethers.parseUnits(normalizedAmount, decimals),
        account,
        vault,
      ] as any,
      'Token deposit failed',
      account,
    );
  }

  async withdrawToken(args: {
    token: string;
    amountHuman: string;
    decimals?: number;
  }) {
    const account = this.getAccountOrThrow();
    const decimals = args.decimals ?? 18;

    return this.call(
      'withdrawToken',
      [
        args.token,
        ethers.parseUnits(args.amountHuman.replace(',', '.'), decimals),
      ] as any,
      'Token withdrawal failed',
      account,
    );
  }

  async depositNFT(args: { nft: string; tokenId: string | bigint }) {
    const account = this.getAccountOrThrow();
    const vault = this.getVaultOrThrow();
    const tokenId = BigInt(args.tokenId);

    await this.ensureERC721Approval(args.nft, tokenId, account);

    return this.call(
      'depositNFT721' as any,
      [args.nft, tokenId, account, vault] as any,
      'NFT deposit failed',
      account,
    );
  }

  async withdrawNFT(args: { nft: string; tokenId: string | bigint }) {
    const account = this.getAccountOrThrow();
    const tokenId = BigInt(args.tokenId);

    return this.call(
      'withdrawNFT721' as any,
      [args.nft, tokenId] as any,
      'NFT withdrawal failed',
      account,
    );
  }
}
