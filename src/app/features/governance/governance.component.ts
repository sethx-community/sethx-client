import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { GovernanceContractService, ProposalStatus } from '../../services/onchain/contracts/governance-contract.service';
import { GovernanceDataService, VotingPowerView } from '../../services/shared/data/governance-data.service';
import { TradeSettingsService } from '../../services/shared/trade-settings.service';
import { WalletConnectService } from '../../wallet/wallet-connect.service';

type GovernanceTemplate = {
  title: string;
  group: string;
  targetLabel: string;
  targetAddress: string;
  purpose: string;
  examples: string[];
  risk: 'Low' | 'Medium' | 'High';
};

type BoardKind = 'idea' | 'issue';
type BoardStatus = 'open' | 'review' | 'proposal-ready' | 'resolved' | 'archived';

type BoardPost = {
  id: string;
  kind: BoardKind;
  title: string;
  category: string;
  body: string;
  requestedEth?: string;
  accountAddress: string;
  ownerAddress: string;
  votes: number;
  votedBy: string[];
  status: BoardStatus;
  createdAt: string;
};

const BOARD_STORAGE_KEY = 'sethx-governance-board-v1';

@Component({ selector: 'app-governance', standalone: true, imports: [CommonModule, FormsModule], templateUrl: './governance.component.html' })
export class GovernanceComponent implements OnInit {
  private readonly governanceContracts = inject(GovernanceContractService);
  private readonly governanceData = inject(GovernanceDataService);
  private readonly tradeSettings = inject(TradeSettingsService);
  readonly wallet = inject(WalletConnectService);

  readonly loading = this.governanceData.loading;
  readonly readError = this.governanceData.error;
  readonly busy = signal(false);
  readonly localError = signal<string | null>(null);
  readonly success = signal<string | null>(null);
  readonly address = signal<string | null>(null);
  readonly voting = signal<VotingPowerView | null>(null);
  readonly settings = this.governanceData.settings;
  readonly proposalView = signal<ProposalStatus | null>(null);
  readonly selectedAccountId = this.tradeSettings.selectedAccountId;
  readonly selectedAccountSethx = signal<bigint>(0n);
  readonly boardPosts = signal<BoardPost[]>([]);
  readonly ideaPosts = computed(() => this.boardPosts().filter((post) => post.kind === 'idea').sort((a, b) => b.votes - a.votes));
  readonly issuePosts = computed(() => this.boardPosts().filter((post) => post.kind === 'issue').sort((a, b) => b.votes - a.votes));

  delegateTo = '';
  proposalId = '';
  voteSupport = 1;
  voteReason = '';
  lookupProposalId = '';
  proposalTarget = '';
  proposalValue = '0';
  proposalCalldata = '0x';
  proposalDescription = '';
  selectedTemplateTitle = '';

  ideaTitle = '';
  ideaCategory = 'interface';
  ideaRequestedEth = '';
  ideaBody = '';
  issueTitle = '';
  issueCategory = 'layout';
  issueBody = '';

  readonly proposalTemplates: GovernanceTemplate[] = [
    {
      title: 'Set protocol fees',
      group: 'Fees',
      targetLabel: 'FeeManager',
      targetAddress: this.governanceContracts.feeManagerAddress,
      purpose: 'Queue, execute, or cancel fixed and percentage fees by context; approve fee tokens; set the SETHX fee discount.',
      examples: ['queueFeeUpdate(context, fixedFee, percentageFee)', 'executeFeeUpdate(context)', 'setAcceptedFeeToken(token, accepted)', 'setSethxDiscount(discountBps)'],
      risk: 'High',
    },
    {
      title: 'Approve or configure oracles',
      group: 'Oracles',
      targetLabel: 'PriceManager',
      targetAddress: this.governanceContracts.priceManagerAddress,
      purpose: 'Approve oracle feeds, register them for specific use contexts, update metadata, set status, and tune stale-price controls.',
      examples: ['approveOracle(oracle)', 'approveOracleForContext(oracle, context)', 'registerTokenContextOracle(token, context, oracle)', 'setStaleTimeout(newTimeout)'],
      risk: 'High',
    },
    {
      title: 'Approve futures markets',
      group: 'Markets',
      targetLabel: 'FuturesContract',
      targetAddress: this.governanceContracts.futuresAddress,
      purpose: 'Create futures markets from approved oracles and update margin or risk parameters after review.',
      examples: ['createMarket(ticker, oracle, initialMarginBps, maintenanceMarginBps, multiplier, initialPriceRaw)', 'setMarketRiskParams(marketKey, ...)'],
      risk: 'High',
    },
    {
      title: 'Approve option markets',
      group: 'Markets',
      targetLabel: 'MarginOptionContract / BinaryMarginOptionContract',
      targetAddress: this.governanceContracts.marginOptionsAddress,
      purpose: 'Create margin option or binary option markets, open or close market availability, and keep option listings aligned with oracle and risk policy.',
      examples: ['createMarket(...)', 'setMarketActive(marketKey, active)'],
      risk: 'High',
    },
    {
      title: 'Configure lending markets',
      group: 'Lending',
      targetLabel: 'LendingContract',
      targetAddress: this.governanceContracts.lendingAddress,
      purpose: 'Set lending risk levels, activate or pause lending markets, update risk hooks, and settle lending markets when required.',
      examples: ['setRiskLevel(riskLevel, enabled, maxLtvBps, liquidationLtvBps)', 'setMarketActive(marketKey, active)', 'settleMarket(marketKey)'],
      risk: 'High',
    },
    {
      title: 'Treasury roles and permissions',
      group: 'Treasury',
      targetLabel: 'TreasuryAuthority',
      targetAddress: this.governanceContracts.treasuryAuthorityAddress,
      purpose: 'Appoint treasury operators, update permissions, freeze or revoke roles, and configure guardian or emergency module access.',
      examples: ['appointTreasurer(account, label, permissions)', 'setTreasurerPermissions(account, permissions)', 'setGuardian(account, allowed)', 'revokeTreasurer(account)'],
      risk: 'High',
    },
    {
      title: 'Approve grants and payments',
      group: 'Grants',
      targetLabel: 'ProtocolTreasury / TreasuryPaymentsModule',
      targetAddress: this.governanceContracts.treasuryAddress,
      purpose: 'Approve recipients, approved treasury tokens, payment modules, and grants such as protocol-funded website or interface work.',
      examples: ['setApprovedExternalRecipient(recipient, allowed)', 'setApprovedToken(token, allowed)', 'setApprovedTreasuryModule(module, allowed)', 'payETH(recipient, amount, memo) via approved payments module'],
      risk: 'High',
    },
    {
      title: 'Risk and valuation approvals',
      group: 'Risk',
      targetLabel: 'RiskModule / ValuationModule',
      targetAddress: this.governanceContracts.riskModuleAddress,
      purpose: 'Approve product contracts and order books in the account risk module and tune valuation haircuts or LTV tiers.',
      examples: ['setApprovedFuturesContract(target, allowed)', 'setApprovedMarginOptionContract(target, allowed)', 'setRiskTier(...)'],
      risk: 'Medium',
    },
    {
      title: 'Emergency token action',
      group: 'Safety',
      targetLabel: 'SethxToken',
      targetAddress: this.governanceContracts.sethxTokenAddress,
      purpose: 'Pause or unpause SETHX token transfers through governance if emergency conditions require it.',
      examples: ['pause()', 'unpause()'],
      risk: 'High',
    },
  ];

  async ngOnInit() {
    this.loadBoard();
    await this.refresh();
  }

  async refresh() {
    this.localError.set(null);
    try {
      const address = await this.governanceContracts.currentAddress();
      this.address.set(address);
      await this.governanceData.loadSettings(true);
      if (address) {
        const voting = await this.governanceData.loadVotingPower(address, true);
        this.voting.set(voting);
        this.delegateTo = voting.delegatedTo && !/^0x0{40}$/i.test(voting.delegatedTo) ? voting.delegatedTo : address;
      } else {
        this.voting.set(null);
      }
      await this.refreshSelectedAccountSethx();
      if (this.lookupProposalId.trim()) await this.lookupProposal(false);
    } catch (err) {
      this.localError.set(err instanceof Error ? err.message : 'Unable to load governance data.');
    }
  }

  async refreshSelectedAccountSethx() {
    const account = this.selectedAccountId();
    if (!account) {
      this.selectedAccountSethx.set(0n);
      return;
    }
    try {
      this.selectedAccountSethx.set(await this.governanceContracts.tokenBalance(account));
    } catch {
      this.selectedAccountSethx.set(0n);
    }
  }

  async delegate() {
    if (!this.delegateTo.trim()) return;
    this.busy.set(true); this.localError.set(null); this.success.set(null);
    try { await this.governanceContracts.delegate(this.delegateTo.trim()); this.success.set('Delegation transaction confirmed.'); await this.refresh(); }
    catch (err) { this.localError.set(err instanceof Error ? err.message : 'Delegation failed.'); }
    finally { this.busy.set(false); }
  }

  async lookupProposal(showBusy = true) {
    if (!this.lookupProposalId.trim()) return;
    if (showBusy) this.busy.set(true);
    this.localError.set(null); this.success.set(null);
    try {
      const status = await this.governanceContracts.proposalStatus(this.lookupProposalId.trim(), this.address());
      this.proposalView.set(status);
      this.proposalId = status.id;
    } catch (err) {
      this.localError.set(err instanceof Error ? err.message : 'Proposal lookup failed.');
    } finally {
      if (showBusy) this.busy.set(false);
    }
  }

  async createProposal() {
    if (!this.proposalTarget.trim() || !this.proposalDescription.trim()) return;
    this.busy.set(true); this.localError.set(null); this.success.set(null);
    try {
      const value = BigInt(this.proposalValue || '0');
      const calldata = this.proposalCalldata.trim() || '0x';
      const id = await this.governanceContracts.propose([this.proposalTarget.trim()], [value], [calldata], this.proposalDescription.trim());
      this.success.set(id ? `Proposal created: ${id}` : 'Proposal transaction confirmed.');
      if (id) {
        this.lookupProposalId = id;
        await this.lookupProposal(false);
      }
    } catch (err) {
      this.localError.set(err instanceof Error ? err.message : 'Proposal creation failed.');
    } finally {
      this.busy.set(false);
    }
  }

  async castVote() {
    if (!this.proposalId.trim()) return;
    this.busy.set(true); this.localError.set(null); this.success.set(null);
    try { await this.governanceContracts.castVote(this.proposalId.trim(), Number(this.voteSupport), this.voteReason); this.success.set('Vote transaction confirmed.'); await this.refresh(); }
    catch (err) { this.localError.set(err instanceof Error ? err.message : 'Vote failed.'); }
    finally { this.busy.set(false); }
  }

  useTemplate(template: GovernanceTemplate) {
    this.selectedTemplateTitle = template.title;
    this.proposalTarget = template.targetAddress || '';
    this.proposalValue = '0';
    this.proposalCalldata = '0x';
    this.proposalDescription = `${template.title}\n\nPurpose: ${template.purpose}\n\nTarget: ${template.targetLabel} (${template.targetAddress || 'address not configured'})\n\nAction to encode: ${template.examples[0]}\n\nReview checklist:\n- Confirm the target contract address.\n- Encode calldata from the verified ABI.\n- Explain expected impact, risks, rollback plan, and whether treasury ETH or protocol parameters are affected.`;
  }

  submitIdea() {
    this.createBoardPost('idea', this.ideaTitle, this.ideaCategory, this.ideaBody, this.ideaRequestedEth);
    if (!this.localError()) {
      this.ideaTitle = '';
      this.ideaCategory = 'interface';
      this.ideaRequestedEth = '';
      this.ideaBody = '';
    }
  }

  submitIssue() {
    this.createBoardPost('issue', this.issueTitle, this.issueCategory, this.issueBody);
    if (!this.localError()) {
      this.issueTitle = '';
      this.issueCategory = 'layout';
      this.issueBody = '';
    }
  }

  createBoardPost(kind: BoardKind, title: string, category: string, body: string, requestedEth = '') {
    this.localError.set(null);
    this.success.set(null);
    const eligibility = this.boardEligibilityMessage();
    if (eligibility) {
      this.localError.set(eligibility);
      return;
    }
    if (!title.trim() || !body.trim()) {
      this.localError.set(kind === 'idea' ? 'Add an idea title and description.' : 'Add an issue title and description.');
      return;
    }
    const owner = this.address();
    const account = this.selectedAccountId();
    if (!owner || !account) return;
    const post: BoardPost = {
      id: `${kind}-${Date.now()}`,
      kind,
      title: title.trim(),
      category,
      body: body.trim(),
      requestedEth: requestedEth.trim() || undefined,
      accountAddress: account,
      ownerAddress: owner,
      votes: 1,
      votedBy: [owner.toLowerCase()],
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    this.boardPosts.update((posts) => [post, ...posts]);
    this.saveBoard();
    this.success.set(kind === 'idea' ? 'Idea added to the mock board.' : 'Issue added to the mock priority list.');
  }

  voteBoardPost(post: BoardPost) {
    this.localError.set(null);
    this.success.set(null);
    const eligibility = this.boardEligibilityMessage();
    if (eligibility) {
      this.localError.set(eligibility);
      return;
    }
    const owner = this.address()?.toLowerCase();
    if (!owner) return;
    if (post.votedBy.includes(owner)) {
      this.localError.set('This owner has already voted on that item.');
      return;
    }
    this.boardPosts.update((posts) => posts.map((candidate) => candidate.id === post.id ? { ...candidate, votes: candidate.votes + 1, votedBy: [...candidate.votedBy, owner] } : candidate));
    this.saveBoard();
  }

  boardEligibilityMessage(): string | null {
    if (!this.address()) return 'Connect a wallet first.';
    if (!this.selectedAccountId()) return 'Select a protocol account first.';
    if (!this.accountHasSethx()) return 'The selected account must own SETHX to post or vote in the idea and issue boards.';
    return null;
  }

  loadBoard() {
    try {
      const raw = localStorage.getItem(BOARD_STORAGE_KEY);
      if (raw) {
        this.boardPosts.set(JSON.parse(raw) as BoardPost[]);
        return;
      }
    } catch {}
    this.boardPosts.set([
      {
        id: 'idea-demo-1',
        kind: 'idea',
        title: 'Add a contributor grant template for interface improvements',
        category: 'grants',
        body: 'A small form could help contributors explain scope, requested ETH, deliverables, and review criteria before a formal treasury proposal is created.',
        requestedEth: '0.25',
        accountAddress: 'mock-account',
        ownerAddress: 'mock-owner',
        votes: 4,
        votedBy: [],
        status: 'review',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'issue-demo-1',
        kind: 'issue',
        title: 'Review mobile spacing in right panels',
        category: 'layout',
        body: 'Some dense trade panels may need tighter copy and clearer action priority on narrow screens.',
        accountAddress: 'mock-account',
        ownerAddress: 'mock-owner',
        votes: 3,
        votedBy: [],
        status: 'open',
        createdAt: new Date().toISOString(),
      },
    ]);
  }

  saveBoard() {
    try { localStorage.setItem(BOARD_STORAGE_KEY, JSON.stringify(this.boardPosts())); } catch {}
  }

  canVote(): boolean { return (this.voting()?.effectiveVotingPower ?? 0n) > 0n; }
  canPropose(): boolean { return (this.voting()?.effectiveVotingPower ?? 0n) >= this.proposalThreshold(); }
  accountHasSethx(): boolean { return this.selectedAccountSethx() > 0n; }
  formatToken(value: bigint | null | undefined): string { return this.governanceData.formatToken(value ?? 0n); }
  votingDelay(): string { return this.settings()?.votingDelay?.toString() ?? '—'; }
  votingPeriod(): string { return this.settings()?.votingPeriod?.toString() ?? '—'; }
  proposalThreshold(): bigint { return this.settings()?.proposalThreshold ?? 0n; }
  error(): string | null { return this.localError() ?? this.readError(); }
  short(value: string | null | undefined): string { if (!value) return '—'; return value.length > 14 ? `${value.slice(0, 6)}…${value.slice(-4)}` : value; }
  yesNo(value: boolean | null): string { if (value === null) return '—'; return value ? 'Yes' : 'No'; }
  postOwner(post: BoardPost): string { return `${this.short(post.ownerAddress)} via ${this.short(post.accountAddress)}`; }
  hasBoardVote(post: BoardPost): boolean { const owner = this.address()?.toLowerCase(); return !!owner && post.votedBy.includes(owner); }
  trackPost(_: number, post: BoardPost): string { return post.id; }
  trackTemplate(_: number, template: GovernanceTemplate): string { return template.title; }
}
