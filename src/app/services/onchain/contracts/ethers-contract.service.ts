import {
  Contract,
  ContractTransactionReceipt,
  ContractTransactionResponse,
  ethers,
  JsonRpcProvider,
} from 'ethers';
import { CURRENT_NETWORK } from '../../../constants/network.config';
import { NETWORKS } from '../../../constants/networks';

export abstract class EthersContractService<T extends Contract = Contract> {
  protected abstract readonly abi: ethers.InterfaceAbi;
  protected abstract readonly defaultAddress?: string;

  constructor(
    protected readonly walletService: { getEthersProvider(): Promise<any> },
    protected readonly errorService: { show(msg: string): void },
  ) {}

  /** Generic provider/signer instance (read OR write) */
  async withProvider(address?: string): Promise<T> {
    try {
      let provider = await this.walletService.getEthersProvider();

      if (!provider || typeof provider.getSigner !== 'function') {
        const rpcUrl = NETWORKS[CURRENT_NETWORK].rpcUrls.default.http[0];
        provider = new JsonRpcProvider(rpcUrl);
      }

      await provider.getBlockNumber();

      const signer = await provider.getSigner?.().catch(() => null);
      const runner = signer ?? provider;

      return new Contract(
        address ?? this.assertDefaultAddress(),
        this.abi,
        runner,
      ) as T;
    } catch (err) {
      throw err;
    }
  }

  /** Typed read call */
  async read<M extends keyof T>(
    method: M,
    args: Parameters<T[M]>,
    address?: string,
  ): Promise<Awaited<ReturnType<T[M]>>> {
    const contract = await this.withProvider(address);
    const fn = contract[method];

    if (typeof fn !== 'function') {
      throw new Error(`Method ${String(method)} not found on contract`);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return (fn as (...a: any[]) => any)(...args);
  }

  /** Generic contract write with error capture */
  async call<M extends keyof T>(
    method: M,
    args: Parameters<T[M]>,
    errorMessage = 'Transaction failed',
    address?: string,
  ): Promise<string | null> {
    try {
      const contract = await this.withProvider(address);
      const fn = contract[method];

      if (typeof fn !== 'function') {
        throw new Error(`Method ${String(method)} not found on contract`);
      }

      const tx = await (
        fn as (...a: any[]) => Promise<ContractTransactionResponse>
      )(...args);

      const receipt = (await tx.wait()) as ContractTransactionReceipt | null;
      return receipt?.hash ?? tx.hash ?? null;
    } catch (err: any) {
      console.error('[Contract error]', {
        reason: err.reason,
        code: err.code,
        data: err.data,
        message: err.message,
        tx: err.transaction,
      });
      this.errorService.show(errorMessage);
      throw err;
    }
  }

  private assertDefaultAddress(): string {
    if (!this.defaultAddress) {
      throw new Error(`Contract address must be provided`);
    }
    return this.defaultAddress;
  }

  // ========================================================
  // ============ ERC20-SPECIFIC HELPERS =====================
  // ========================================================

  protected getERC20Contract(address: string, runner: any): Contract {
    return new Contract(
      address,
      [
        'function allowance(address owner, address spender) view returns (uint256)',
        'function approve(address spender, uint256 amount) returns (bool)',
        'function balanceOf(address account) view returns (uint256)',
      ],
      runner,
    );
  }

  async getAllowance(token: string, spender: string): Promise<bigint> {
    const provider = await this.walletService.getEthersProvider();
    if (!provider) throw new Error('No provider');

    const signer = await provider.getSigner?.();
    if (!signer) throw new Error('No signer available');

    const owner = await signer.getAddress();
    const erc20 = this.getERC20Contract(token, signer);
    return (await erc20['allowance'](owner, spender)) as bigint;
  }


  async getTokenBalance(token: string, account: string): Promise<bigint> {
    const provider = await this.walletService.getEthersProvider();
    if (!provider) throw new Error('No provider');

    const erc20 = this.getERC20Contract(token, provider);
    return (await erc20['balanceOf'](account)) as bigint;
  }

  async approve(
    token: string,
    spender: string,
    amount: string,
    decimals: number = 18,
  ): Promise<void> {
    const provider = await this.walletService.getEthersProvider();
    if (!provider) throw new Error('No provider');

    const signer = await provider.getSigner?.();
    if (!signer) throw new Error('No signer available');

    const erc20 = this.getERC20Contract(token, signer);
    const tx = await erc20['approve'](
      spender,
      ethers.parseUnits(amount, decimals),
    );
    await tx.wait();
  }

  async ensureAllowance(
    token: string,
    spender: string,
    amount: string,
    decimals: number = 18,
  ): Promise<void> {
    const allowance = await this.getAllowance(token, spender);
    const amountBN = ethers.parseUnits(amount, decimals);
    if (allowance < amountBN) {
      await this.approve(token, spender, amount, decimals);
    }
  }
}
