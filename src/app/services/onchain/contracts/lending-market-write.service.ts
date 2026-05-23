import { Injectable, inject } from '@angular/core';
import { Contract, ContractTransactionReceipt, ContractTransactionResponse, ethers } from 'ethers';

import { getContractAddress } from '../../../contracts/contract-registry';
import { ErrorService } from '../../shared/error.service';
import { TransactionAccessService } from '../../shared/compliance/transaction-access.service';
import { AccountsChainService } from '../accounts.service';
import { TradeSettingsService } from '../../shared/trade-settings.service';
import { WalletConnectService } from '../../../wallet/wallet-connect.service';
import { TriggerService } from '../../shared/trigger.service';
import { norm } from '../../../core/tokens/token-normalize';

const NORMAL_ACCOUNT_LENDING_ABI = [
  'function placeLendOrder(address lendingOrderBook, address borrowToken, uint64 marketExpiry, uint16 riskLevel, uint256 rateBps, uint256 principal, uint64 orderExpiry)',
  'function cancelLendOrder(address lendingOrderBook, uint256 orderId)',
  'function redeemInitialLendingBond(address lendingContract, uint256 bondIndex)',
  'function claimSupplementalLendingBond(address lendingContract, uint256 bondIndex)',
] as const;

const LENDING_ACCOUNT_ABI = [
  'function placeBorrowOrder(address lendingOrderBook, address borrowToken, uint64 marketExpiry, uint16 riskLevel, uint256 principal, uint256 rateBps, uint64 orderExpiry)',
  'function placeRolloverBorrowOrder(address lendingOrderBook, bytes32 repayMarketKey, address borrowToken, uint64 marketExpiry, uint16 riskLevel, uint256 principal, uint256 rateBps, uint64 orderExpiry)',
  'function cancelBorrowOrder(address lendingOrderBook, uint256 orderId)',
  'function placeLendOrder(address lendingOrderBook, address borrowToken, uint64 marketExpiry, uint16 riskLevel, uint256 rateBps, uint256 principal, uint64 orderExpiry)',
  'function cancelLendOrder(address lendingOrderBook, uint256 orderId)',
  'function repayDebt(bytes32 marketKey, uint256 amount) returns (uint256 applied)',
  'function repayDebtForMarket(address borrowToken, uint64 marketExpiry, uint16 riskLevel, uint256 amount) returns (uint256 applied)',
  'function redeemInitialLendingBond(uint256 bondIndex)',
  'function claimSupplementalLendingBond(uint256 bondIndex)',
] as const;

export type LendingOrderSide = 0 | 1; // 0=Lend, 1=Borrow
export type LendingBondClaimAction = 'initial' | 'supplemental';

@Injectable({ providedIn: 'root' })
export class LendingMarketWriteService {
  private readonly wallet = inject(WalletConnectService);
  private readonly error = inject(ErrorService);
  private readonly accounts = inject(AccountsChainService);
  private readonly settings = inject(TradeSettingsService);
  private readonly transactionAccess = inject(TransactionAccessService);
  private readonly trigger = inject(TriggerService);

  private readonly lendingContractAddress = getContractAddress('LendingContract');
  private readonly orderBookAddress = getContractAddress('LendingOrderBook');

  marketKeyFor(args: { borrowToken: string; marketExpiry: bigint | number; riskLevel: number }): string {
    const encoded = ethers.AbiCoder.defaultAbiCoder().encode(
      ['address', 'uint64', 'uint16'],
      [args.borrowToken, BigInt(args.marketExpiry), args.riskLevel],
    );
    return ethers.keccak256(encoded).toLowerCase();
  }

  async placeOrder(args: {
    borrowToken: string;
    marketExpiry: bigint;
    riskLevel: number;
    side: LendingOrderSide;
    rateBps: bigint;
    principal: bigint;
    orderExpiry: bigint;
  }): Promise<string | null> {
    this.transactionAccess.assertWriteAllowed('lending order placement');

    if (args.principal <= 0n) throw new Error('Principal must be greater than zero.');
    if (args.rateBps <= 0n) throw new Error('APR must be greater than zero.');
    if (args.marketExpiry <= BigInt(Math.floor(Date.now() / 1000))) {
      throw new Error('Market maturity must be in the future.');
    }
    if (args.orderExpiry <= BigInt(Math.floor(Date.now() / 1000))) {
      throw new Error('Order expiry must be in the future.');
    }
    if (args.orderExpiry > args.marketExpiry) {
      throw new Error('Order expiry cannot be later than market maturity.');
    }

    const account = this.selectedAccountOrThrow();
    const type = this.accounts.accountType(account);

    if (args.side === 1 && type !== 'lending') {
      throw new Error('Borrow orders require a lending account. Select or create a lending account first.');
    }

    const contract = await this.accountContract(account, type);

    if (args.side === 0) {
      const hash = await this.waitForTx(
        await contract['placeLendOrder'](
          this.orderBookAddress,
          args.borrowToken,
          args.marketExpiry,
          args.riskLevel,
          args.rateBps,
          args.principal,
          args.orderExpiry,
        ),
        'Placing lend order failed',
      );
      this.trigger.emitDomainEvent({ type: 'lendingOrderbookChanged' });
      return hash;
    }

    const hash = await this.waitForTx(
      await contract['placeBorrowOrder'](
        this.orderBookAddress,
        args.borrowToken,
        args.marketExpiry,
        args.riskLevel,
        args.principal,
        args.rateBps,
        args.orderExpiry,
      ),
      'Placing borrow order failed',
    );
    this.trigger.emitDomainEvent({ type: 'lendingOrderbookChanged' });
    return hash;
  }


  async placeRolloverBorrowOrder(args: {
    repayMarketKey: string;
    borrowToken: string;
    marketExpiry: bigint;
    riskLevel: number;
    rateBps: bigint;
    principal: bigint;
    orderExpiry: bigint;
  }): Promise<string | null> {
    this.transactionAccess.assertWriteAllowed('lending rollover order placement');

    if (!ethers.isHexString(args.repayMarketKey, 32)) throw new Error('Select the existing debt market to roll over.');
    if (args.principal <= 0n) throw new Error('Rollover principal must be greater than zero.');
    if (args.rateBps <= 0n) throw new Error('APR must be greater than zero.');
    if (args.orderExpiry <= BigInt(Math.floor(Date.now() / 1000))) throw new Error('Order expiry must be in the future.');
    if (args.orderExpiry > args.marketExpiry) throw new Error('Order expiry cannot be later than the new market maturity.');

    const account = this.selectedAccountOrThrow();
    const type = this.accounts.accountType(account);
    if (type !== 'lending') throw new Error('Rollover orders require a lending account with active debt.');

    const newMarketKey = this.marketKeyFor({ borrowToken: args.borrowToken, marketExpiry: args.marketExpiry, riskLevel: args.riskLevel });
    if (newMarketKey === args.repayMarketKey.toLowerCase()) throw new Error('Rollover must target a different maturity market.');

    const contract = await this.accountContract(account, type);
    const hash = await this.waitForTx(
      await contract['placeRolloverBorrowOrder'](
        this.orderBookAddress,
        args.repayMarketKey,
        args.borrowToken,
        args.marketExpiry,
        args.riskLevel,
        args.principal,
        args.rateBps,
        args.orderExpiry,
      ),
      'Placing rollover borrow order failed',
    );
    this.trigger.emitDomainEvent({ type: 'lendingOrderbookChanged' });
    return hash;
  }

  async cancelOrder(orderId: bigint): Promise<string | null> {
    this.transactionAccess.assertWriteAllowed('lending order cancellation');

    if (orderId <= 0n) throw new Error('Order ID must be greater than zero.');

    const account = this.selectedAccountOrThrow();
    const type = this.accounts.accountType(account);
    const contract = await this.accountContract(account, type);

    // Both Account and LendingAccount expose cancelLendOrder, and the underlying
    // order book only checks that msg.sender owns the order. For lending accounts
    // this can cancel either lend or borrow orders safely.
    const hash = await this.waitForTx(
      await contract['cancelLendOrder'](this.orderBookAddress, orderId),
      'Cancelling lending order failed',
    );
    this.trigger.emitDomainEvent({ type: 'lendingOrderbookChanged' });
    return hash;
  }

  async repayDebt(args: { marketKey: string; amount: bigint }): Promise<string | null> {
    this.transactionAccess.assertWriteAllowed('lending debt repayment');

    if (!ethers.isHexString(args.marketKey, 32)) throw new Error('Invalid market key.');
    if (args.amount <= 0n) throw new Error('Repayment amount must be greater than zero.');

    const account = this.selectedAccountOrThrow();
    const type = this.accounts.accountType(account);
    if (type !== 'lending') {
      throw new Error('Debt repayment requires the selected account to be a lending account.');
    }

    const contract = await this.accountContract(account, type);
    const hash = await this.waitForTx(
      await contract['repayDebt'](args.marketKey, args.amount),
      'Repaying lending debt failed',
    );
    this.trigger.emitDomainEvent({ type: 'lendingOrderbookChanged' });
    return hash;
  }

  async claimBond(args: { action: LendingBondClaimAction; bondIndex: bigint }): Promise<string | null> {
    this.transactionAccess.assertWriteAllowed('lending bond claim');

    if (args.bondIndex <= 0n) throw new Error('Bond index must be greater than zero.');

    const account = this.selectedAccountOrThrow();
    const type = this.accounts.accountType(account);
    const contract = await this.accountContract(account, type);

    if (type === 'lending') {
      const method = args.action === 'initial'
        ? 'redeemInitialLendingBond'
        : 'claimSupplementalLendingBond';
      const hash = await this.waitForTx(
        await contract[method](args.bondIndex),
        'Claiming lending bond failed',
      );
      this.trigger.emitDomainEvent({ type: 'lendingOrderbookChanged' });
      return hash;
    }

    const method = args.action === 'initial'
      ? 'redeemInitialLendingBond'
      : 'claimSupplementalLendingBond';
    const hash = await this.waitForTx(
      await contract[method](this.lendingContractAddress, args.bondIndex),
      'Claiming lending bond failed',
    );
    this.trigger.emitDomainEvent({ type: 'lendingOrderbookChanged' });
    return hash;
  }

  private selectedAccountOrThrow(): string {
    const account = norm(this.settings.selectedAccountId() ?? '');
    if (!account) throw new Error('No account selected.');
    return account;
  }

  private async accountContract(account: string, type: 'normal' | 'lending'): Promise<Contract> {
    const provider = await this.wallet.getEthersProvider();
    if (!provider) throw new Error('Connect a wallet first.');

    const signer = await provider.getSigner().catch(() => null);
    if (!signer) throw new Error('No wallet signer available.');

    const abi = type === 'lending' ? LENDING_ACCOUNT_ABI : NORMAL_ACCOUNT_LENDING_ABI;
    return new Contract(account, abi, signer);
  }

  private async waitForTx(tx: ContractTransactionResponse, errorMessage: string): Promise<string | null> {
    try {
      const receipt = (await tx.wait()) as ContractTransactionReceipt | null;
      return receipt?.hash ?? tx.hash ?? null;
    } catch (err) {
      this.error.show(errorMessage);
      throw err;
    }
  }
}
