import { Injectable, inject } from '@angular/core';
import { Contract, ethers } from 'ethers';

import { SethxTokenAbi } from '../../../contracts/generated';
import { getContractAddress } from '../../../contracts/contract-registry';
import { WalletConnectService } from '../../../wallet/wallet-connect.service';

const GOVERNOR_ABI = [
  'function votingDelay() view returns (uint256)',
  'function votingPeriod() view returns (uint256)',
  'function proposalThreshold() view returns (uint256)',
  'function state(uint256 proposalId) view returns (uint8)',
  'function proposalSnapshot(uint256 proposalId) view returns (uint256)',
  'function proposalDeadline(uint256 proposalId) view returns (uint256)',
  'function proposalVotes(uint256 proposalId) view returns (uint256 againstVotes,uint256 forVotes,uint256 abstainVotes)',
  'function hasVoted(uint256 proposalId,address account) view returns (bool)',
  'function propose(address[] targets,uint256[] values,bytes[] calldatas,string description) returns (uint256)',
  'function castVote(uint256 proposalId,uint8 support) returns (uint256)',
  'function castVoteWithReason(uint256 proposalId,uint8 support,string reason) returns (uint256)',
] as const satisfies ethers.InterfaceAbi;

function optionalContractAddress(name: Parameters<typeof getContractAddress>[0]): string {
  try {
    return getContractAddress(name);
  } catch {
    return '';
  }
}

export type VotingPowerOverview = { walletBalance: bigint; walletVotes: bigint; totalSupply: bigint; delegatedTo: string };
export type ProposalVoteCounts = { againstVotes: bigint; forVotes: bigint; abstainVotes: bigint };
export type ProposalStatus = {
  id: string;
  state: number;
  stateLabel: string;
  snapshot: bigint;
  deadline: bigint;
  votes: ProposalVoteCounts;
  hasVoted: boolean | null;
};

@Injectable({ providedIn: 'root' })
export class GovernanceContractService {
  private readonly wallet = inject(WalletConnectService);

  readonly governorAddress = optionalContractAddress('SethxGovernor');
  readonly sethxTokenAddress = optionalContractAddress('SethxToken');
  readonly vaultAddress = optionalContractAddress('SethxVault');
  readonly feeManagerAddress = optionalContractAddress('FeeManager');
  readonly priceManagerAddress = optionalContractAddress('PriceManager');
  readonly treasuryAddress = optionalContractAddress('ProtocolTreasury');
  readonly treasuryAuthorityAddress = optionalContractAddress('TreasuryAuthority');
  readonly treasuryPaymentsAddress = optionalContractAddress('TreasuryPaymentsModule');
  readonly treasuryTradeAddress = optionalContractAddress('TreasuryTradeModule');
  readonly futuresAddress = optionalContractAddress('FuturesContract');
  readonly lendingAddress = optionalContractAddress('LendingContract');
  readonly marginOptionsAddress = optionalContractAddress('MarginOptionContract');
  readonly binaryOptionsAddress = optionalContractAddress('BinaryMarginOptionContract');
  readonly riskModuleAddress = optionalContractAddress('RiskModule');
  readonly valuationModuleAddress = optionalContractAddress('ValuationModule');

  async governor(): Promise<Contract> { return new Contract(this.governorAddress, GOVERNOR_ABI, await this.runner()); }
  async token(): Promise<Contract> { return new Contract(this.sethxTokenAddress, SethxTokenAbi, await this.runner()); }

  async currentAddress(): Promise<string | null> {
    const provider = await this.wallet.getEthersProvider();
    const signer = await provider?.getSigner?.().catch(() => null);
    return (await signer?.getAddress?.()) ?? this.wallet.address();
  }

  async votingPower(address: string): Promise<VotingPowerOverview> {
    const token = await this.token();
    const [walletBalance, walletVotes, totalSupply, delegatedTo] = await Promise.all([
      token['balanceOf'](address), token['getVotes'](address), token['totalSupply'](), token['delegates'](address),
    ]);
    return { walletBalance: BigInt(walletBalance ?? 0), walletVotes: BigInt(walletVotes ?? 0), totalSupply: BigInt(totalSupply ?? 0), delegatedTo: String(delegatedTo) };
  }

  async tokenBalance(address: string): Promise<bigint> {
    const token = await this.token();
    const balance = await token['balanceOf'](address);
    return BigInt(balance ?? 0);
  }

  async settings(): Promise<{ votingDelay: bigint; votingPeriod: bigint; proposalThreshold: bigint }> {
    const governor = await this.governor();
    const [votingDelay, votingPeriod, proposalThreshold] = await Promise.all([governor['votingDelay'](), governor['votingPeriod'](), governor['proposalThreshold']()]);
    return { votingDelay: BigInt(votingDelay ?? 0), votingPeriod: BigInt(votingPeriod ?? 0), proposalThreshold: BigInt(proposalThreshold ?? 0) };
  }

  async proposalStatus(proposalId: string, voter?: string | null): Promise<ProposalStatus> {
    const id = BigInt(proposalId);
    const governor = await this.governor();
    const [state, snapshot, deadline, votes, hasVoted] = await Promise.all([
      governor['state'](id),
      governor['proposalSnapshot'](id),
      governor['proposalDeadline'](id),
      governor['proposalVotes'](id),
      voter ? governor['hasVoted'](id, voter) : Promise.resolve(null),
    ]);
    const stateNumber = Number(state ?? 0);
    return {
      id: proposalId,
      state: stateNumber,
      stateLabel: this.proposalStateLabel(stateNumber),
      snapshot: BigInt(snapshot ?? 0),
      deadline: BigInt(deadline ?? 0),
      votes: {
        againstVotes: BigInt(votes?.againstVotes ?? votes?.[0] ?? 0),
        forVotes: BigInt(votes?.forVotes ?? votes?.[1] ?? 0),
        abstainVotes: BigInt(votes?.abstainVotes ?? votes?.[2] ?? 0),
      },
      hasVoted: hasVoted === null ? null : Boolean(hasVoted),
    };
  }

  async propose(targets: string[], values: bigint[], calldatas: string[], description: string): Promise<string> {
    const governor = await this.governor();
    const tx = await governor['propose'](targets, values, calldatas, description);
    const receipt = await tx.wait();
    const proposalCreated = receipt?.logs
      ?.map((log: unknown) => {
        try { return governor.interface.parseLog(log as ethers.Log); } catch { return null; }
      })
      .find((log: ethers.LogDescription | null) => log?.name === 'ProposalCreated');
    return String(proposalCreated?.args?.['proposalId'] ?? proposalCreated?.args?.[0] ?? '');
  }

  async delegate(to: string): Promise<void> { const token = await this.token(); const tx = await token['delegate'](to); await tx.wait(); }

  async castVote(proposalId: string, support: number, reason?: string): Promise<void> {
    const governor = await this.governor();
    const tx = reason?.trim() ? await governor['castVoteWithReason'](BigInt(proposalId), support, reason.trim()) : await governor['castVote'](BigInt(proposalId), support);
    await tx.wait();
  }

  async runner() {
    const provider = await this.wallet.getEthersProvider();
    if (provider) {
      const signer = await provider.getSigner?.().catch(() => null);
      return signer ?? provider;
    }
    throw new Error('Wallet provider is not connected.');
  }

  formatToken(value: bigint): string { return ethers.formatUnits(value, 18); }

  proposalStateLabel(state: number): string {
    return ['Pending', 'Active', 'Canceled', 'Defeated', 'Succeeded', 'Queued', 'Expired', 'Executed'][state] ?? `Unknown (${state})`;
  }
}
