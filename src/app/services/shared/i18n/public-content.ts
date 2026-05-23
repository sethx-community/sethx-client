import { SupportedLanguage } from './language.service';

export type HomeContent = {
  access: Record<string, string>;
  eyebrow: string;
  heroLine1: string;
  heroLine2: string;
  heroSmart: string;
  heroEthereum: string;
  heroExchangePrefix: string;
  heroDescription: string;
  enterApp: string;
  openLibrary: string;
  governance: string;
  connectWallet: string;
  walletConnected: string;
  getStartedTitle: string;
  stepLabel: string;
  steps: string[];
  participation: { title: string; description: string }[];
  ownLine1: string;
  ownLine2: string;
  ownLine3: string;
  marketsKicker: string;
  marketsTitle: string;
  marketsIntro: string;
  markets: { kicker: string; title: string; description: string }[];
  readMore: string;
  libraryKicker: string;
  libraryTitle: string;
  libraryButton: string;
  library: { title: string; description: string; link: string }[];
  open: string;
};

export type LibraryContent = {
  kicker: string;
  title: string;
  intro: string;
  navTitle: string;
  close: string;
  nav: { label: string; title: string; description: string; target: string }[];
  accounts: {
    kicker: string;
    title: string;
    description: string;
    detailsTitle: string;
    details: string[];
    technicalTitle: string;
    functions: { name: string; description: string }[];
  };
  vault: {
    kicker: string;
    title: string;
    description: string;
    detailsTitle: string;
    details: string[];
    technicalTitle: string;
    functions: { name: string; description: string }[];
  };
  fees: {
    kicker: string;
    title: string;
    description: string;
    detailsTitle: string;
    details: string[];
    technicalTitle: string;
    functions: { name: string; description: string }[];
    ratesTitle: string;
    ratesIntro: string;
    refreshRates: string;
    ratesLoading: string;
    ratesLoaded: string;
    ratesError: string;
    ratesColumns: { trade: string; context: string; payment: string; fixed: string; percentage: string; source: string };
    ratesSourceContract: string;
    ratesSourcePending: string;
    feePageCta: string;
  };
  tokenSpot: {
    kicker: string;
    title: string;
    description: string;
    detailsTitle: string;
    details: string[];
    technicalTitle: string;
    functions: { name: string; description: string }[];
  };
  nftSpot: {
    kicker: string;
    title: string;
    description: string;
    detailsTitle: string;
    details: string[];
    technicalTitle: string;
    functions: { name: string; description: string }[];
  };
  futures: {
    kicker: string;
    title: string;
    description: string;
    detailsTitle: string;
    details: string[];
    technicalTitle: string;
    functions: { name: string; description: string }[];
    mechanicsTitle: string;
    mechanics: { title: string; description: string }[];
  };
  options: {
    kicker: string;
    title: string;
    description: string;
    detailsTitle: string;
    details: string[];
    technicalTitle: string;
    functions: { name: string; description: string }[];
    mechanicsTitle: string;
    mechanics: { title: string; description: string }[];
  };
  binaryOptions: {
    kicker: string;
    title: string;
    description: string;
    detailsTitle: string;
    details: string[];
    technicalTitle: string;
    functions: { name: string; description: string }[];
    mechanicsTitle: string;
    mechanics: { title: string; description: string }[];
  };
  marginOptions: {
    kicker: string;
    title: string;
    description: string;
    detailsTitle: string;
    details: string[];
    technicalTitle: string;
    functions: { name: string; description: string }[];
    mechanicsTitle: string;
    mechanics: { title: string; description: string }[];
  };
  lending: {
    kicker: string;
    title: string;
    description: string;
    detailsTitle: string;
    details: string[];
    technicalTitle: string;
    functions: { name: string; description: string }[];
    mechanicsTitle: string;
    mechanics: { title: string; description: string }[];
  };
  borrowing: {
    kicker: string;
    title: string;
    description: string;
    detailsTitle: string;
    details: string[];
    technicalTitle: string;
    functions: { name: string; description: string }[];
    mechanicsTitle: string;
    mechanics: { title: string; description: string }[];
  };
  miscellaneous: {
    kicker: string;
    title: string;
    description: string;
    detailsTitle: string;
    details: string[];
    technicalTitle: string;
    functions: { name: string; description: string }[];
    mechanicsTitle: string;
    mechanics: { title: string; description: string }[];
  };
};

export type FeeRatesContent = {
  kicker: string;
  title: string;
  intro: string;
  activeTitle: string;
  activeIntro: string;
  acceptedTokens: string;
  sethxDiscount: string;
  statusLoading: string;
  statusLoaded: string;
  statusError: string;
  refresh: string;
  backToLibrary: string;
  product: string;
  context: string;
  fixedFee: string;
  percentageFee: string;
  source: string;
  paymentToken: string;
  completeFeesCta: string;
  pending: string;
  contractRead: string;
  notWired: string;
  notesTitle: string;
  notes: string[];
};

export type GovernanceContent = {
  kicker: string;
  title: string;
  intro: string;
  lifecycle: { title: string; description: string }[];
  scopeTitle: string;
  scopeText: string;
  enterApp: string;
  votingModel: { title: string; description: string }[];
};

export type CommunityContent = {
  kicker: string;
  title: string;
  intro: string;
  contributorPaths: [string, string][];
  sectionIntroTitle: string;
  sectionIntroText: string;
  ideasTitle: string;
  initiatives: string[];
  fundingTitle: string;
  fundingText: string;
  fundingCards: { title: string; description: string }[];
  contributionTitle: string;
  contributionSteps: { title: string; description: string }[];
  principlesTitle: string;
  principles: { title: string; description: string }[];
  votingTitle: string;
  ideaFlow: string[];
  votingText: string;
  ctaTitle: string;
  ctaText: string;
  primaryCta: string;
  secondaryCta: string;
};

export type RiskContent = {
  kicker: string;
  title: string;
  intro: string;
  risks: [string, string][];
  adviceTitle: string;
  adviceText: string;
};

export type CookiesContent = {
  kicker: string;
  title: string;
  intro: string;
  cards: { title: string; description: string }[];
  currentChoice: string;
  consentState: string;
  accept: string;
  decline: string;
  reset: string;
};

export type PrivacyContent = {
  kicker: string;
  title: string;
  intro: string;
  cards: { title: string; description: string }[];
};

export type ProtocolContent = {
  kicker: string;
  title: string;
  intro: string;
  configuredNetwork: string;
  contracts: string;
  configuredRecords: string;
  status: string;
  statusText: string;
  liveKicker: string;
  liveTitle: string;
  refreshReads: string;
  acceptedPaymentTokens: string;
  trackedErc20Tokens: string;
  directEthBalance: string;
  governorSettings: string;
  loaded: string;
  pending: string;
  acceptedFeeTokens: string;
  noLiveFeeTokenList: string;
  vaultTokenRegistry: string;
  sethxFeeToken: string;
  enabledAssets: string;
  enabledProducts: string;
  contract: string;
  address: string;
  configuredData: string;
  liveData: string;
  contractDirectory: string;
  vaultReadNote: string;
};

export type PublicContent = {
  home: HomeContent;
  library: LibraryContent;
  feeRates: FeeRatesContent;
  governance: GovernanceContent;
  community: CommunityContent;
  risk: RiskContent;
  cookies: CookiesContent;
  privacy: PrivacyContent;
  protocol: ProtocolContent;
  notFound: { title: string; body: string; action: string };
};

export const PUBLIC_CONTENT: Record<SupportedLanguage, PublicContent> = {
  en: {
    home: {
      access: {
        'requires-wallet': 'Connect a wallet before opening the trading app.',
        'country-restricted': 'The app is restricted in the detected region.',
        default: 'Your wallet does not have the required access level for that page.',
      },
      eyebrow: 'SETHX.COM',
      heroLine1: 'Welcome to',
      heroLine2: 'your hub to the',
      heroSmart: 'Smart',
      heroEthereum: 'ETHereum',
      heroExchangePrefix: 'eXchange',
      heroDescription: 'SETHX.COM is a wallet-connected app for interacting with supported smart contracts of the SETHX protocol. It helps users discover markets, manage SETHX accounts, review transaction details and trade, understand risk, and participate in the governance and community. Sethx.com is not a custodian, broker, or centralized exchange.',
      enterApp: 'Enter app',
      openLibrary: 'Open library',
      governance: 'Governance',
      connectWallet: 'Connect a wallet to enter the app. Public documentation stays available without connecting.',
      walletConnected: 'Wallet connected. App access enabled.',
      getStartedTitle: 'Get started',
      stepLabel: 'Step',
      steps: [
        'Connect a wallet and confirm the network before opening the app.',
        'Create or select a protocol account for the market you want to use.',
        'Deposit supported assets when you want to trade, lend, borrow, or provide collateral.',
        'Choose a market, review balances, fees, risk notes, and transaction details.',
        'Approve only the transactions you understand and want to sign in your wallet.',
      ],
      participation: [
        { title: 'Buy SETHX', description: 'Hold SETHX to build voting power and participate in protocol governance.' },
        { title: 'Vote and share ideas', description: 'Use governance to support proposals, suggest improvements, and help decide protocol priorities.' },
        { title: 'Contribute to the ecosystem', description: 'Builders, writers, analysts, designers, and community members can contribute and may be paid by the protocol for accepted work.' },
        { title: 'Help the community grow', description: 'Bring useful feedback, education, partnerships, and new contributors into the SETHX community. Contact SETHX.COM if you want to contribute.' },
      ],
      ownLine1: 'Own SETHX',
      ownLine2: 'Vote and Contribute',
      ownLine3: 'Grow the Community',
      marketsKicker: 'SETHX markets',
      marketsTitle: 'On-chain exchange with trad-fi structures',
      marketsIntro: 'SETHX.COM groups the protocol into three clear market areas: spot exchange activity, derivatives trading, and credit markets for lending and borrowing.',
      markets: [
        { kicker: 'Spot', title: 'Spot markets', description: 'Trade supported tokens and NFT assets through orderbook-style markets, comparable to the spot desks of traditional exchanges where buyers and sellers meet at visible prices.' },
        { kicker: 'Derivatives', title: 'Derivatives markets', description: 'Access futures, vanilla options, binary options, and margin options with structured review flows, similar to derivatives venues where traders manage exposure, expiry, settlement, and collateral.' },
        { kicker: 'Credit', title: 'Credit markets', description: 'Use lending and borrowing markets designed around SETHX accounts, collateral, loans, and bonds, comparable to credit desks where capital is supplied, priced, and repaid over time.' },
      ],
      readMore: 'Read more →',
      libraryKicker: 'Library and governance',
      libraryTitle: 'Learn first. Vote when ready.',
      libraryButton: 'Open library',
      library: [
        { title: 'Library', description: 'Plain-language documentation for users, builders, traders, lenders, and governors.', link: '/docs' },
        { title: 'Governance', description: 'Proposal lifecycle, delegation, voting power, treasury decisions, and protocol parameter changes.', link: '/governance' },
        { title: 'Protocol', description: 'Network, configured contracts, supported assets, live read status, and transparency references.', link: '/protocol' },
      ],
      open: 'Open →',
    },
library: {
      kicker: 'Library',
      title: 'A practical library for SETHX accounts, the vault, fees, markets, lending, borrowing, and risk.',
      intro: 'Use this library as a guided map for sethx.com. Start with accounts, the vault, and fees, then continue into spot markets, derivatives, lending, borrowing, and general items such as approvals, market status, oracle data, and transaction review. Each topic combines a plain-language explanation with optional technical references.',
      navTitle: 'Start here',
      close: 'Close',
      nav: [
        { label: 'Accounts', title: 'SETHX accounts', description: 'Normal trading accounts, margin-oriented accounts, active/deactivated state, naming, and why actions flow through an account.', target: 'accounts' },
        { label: 'Vault', title: 'Deposits and locking', description: 'How deposits, withdrawals, available balances, locked balances, orders, margin, collateral, and fees relate to the vault.', target: 'vault' },
        { label: 'Fees', title: 'Fee rates and charging', description: 'Fixed fees, percentage fees, fee tokens, product contexts, and the live fee-rates page.', target: 'fees' },
        { label: 'Spot', title: 'Token Spot', description: 'How token spot markets use orders, fills, cancellations, balances, fees, and account routing.', target: 'token-spot' },
        { label: 'NFTs', title: 'NFT Spot', description: 'How NFT spot markets use NFT collections, token IDs, bids, asks, fills, cancellations, fees, and vault locking.', target: 'nft-spot' },
        { label: 'Futures', title: 'Futures', description: 'How futures markets use long and short exposure, margin, order matching, fees, settlement, and margin release.', target: 'futures' },
        { label: 'Options', title: 'Options', description: 'How options use calls, puts, strike prices, expiry, premiums, writer collateral, exercise, reclaim, and fees.', target: 'options' },
        { label: 'Binary', title: 'Binary Options', description: 'How binary option markets use yes/no outcomes, ETH payment, payout amounts, writer margin, settlement, claims, and reclaim.', target: 'binary-options' },
        { label: 'Margin', title: 'Margin Options', description: 'How margin option markets use long and short option exposure, ETH premium, partial writer margin, settlement, claims, and reclaim.', target: 'margin-options' },
        { label: 'Lending', title: 'Lending', description: 'How users supply ETH into the lending order book, create loan offers, manage available liquidity, and receive repayment.', target: 'lending' },
        { label: 'Borrowing', title: 'Borrowing', description: 'How users borrow through lending accounts, collateral, LTV, risk tiers, repayment, and liquidation rules.', target: 'borrowing' },
        { label: 'Misc', title: 'Miscellaneous', description: 'Wallet approvals, market status, oracle data, governance settings, live reads, and general safety reminders.', target: 'miscellaneous' },
      ],
      accounts: {
        kicker: 'SETHX accounts',
        title: 'Accounts are the user layer between a wallet and SETHX investments.',
        description: 'A wallet connects to sethx.com, but trading and lending actions are performed through SETHX accounts. This keeps product actions, balances, deposits, withdrawals, orders, margin, and collateral organized around an account instead of directly around the wallet. View-only pages can read public SETHX data without creating or selecting an account.',
        detailsTitle: 'What users should know',
        details: [
          'A normal trading account is used for spot and derivatives activity such as token spot, NFT spot, futures, options, binary options, and margin options.',
          'Margin or lending-oriented accounts support borrowing via the lending order book. This type of account is restricted in actions based on the LTV and risk tier of the loan. In case of under collateralization the account can be liquidated.',
          'Accounts can be active or deactivated. Deactivation should hide or limit use in the app without deleting historical on-chain state.',
          'Users can rename accounts so sethx.com can show human-friendly labels while the on-chain system still identifies the account by address.',
          'With the exception of view functions, product actions are routed through the selected account. Sethx.com handles that routing so the user reviews one clear transaction flow.',
        ],
        technicalTitle: 'Relevant functions',
        functions: [
          { name: 'createAccount()', description: 'Creates a normal SETHX account for the connected wallet through AccountFactory.' },
          { name: 'getAccounts(user), getNormalAccounts(user), getLendingAccounts(user)', description: 'Read account lists from AccountRegistry so sethx.com can show the accounts owned by a wallet.' },
          { name: 'isAccount(account), isLendingAccount(account), setAccountActive(account, active)', description: 'Check and update whether an account is active or deactivated.' },
          { name: 'accountName(), setAccountName(name)', description: 'Read and update the label shown for an account.' },
          { name: 'place / accept / cancel product order functions', description: 'Account-level functions submit market actions to the relevant orderbook contract after the user reviews the transaction. See relevant product sections for more details.' },
        ],
      },
      vault: {
        kicker: 'Vault',
        title: 'The vault tracks deposited assets and separates available from locked balances.',
        description: 'Users deposit ETH or supported tokens when they want to trade, lend, borrow, provide collateral, pay fees, or support margin. When an order, loan, or margin position requires assets to be reserved, SETHX can lock those assets so they cannot be withdrawn or reused until the order is cancelled, filled, settled, reclaimed, or otherwise released.',
        detailsTitle: 'Balance model',
        details: [
          'Deposited assets remain on-chain and are associated with the SETHX account that performed the deposit.',
          'Available balances can be used for new actions or withdrawn when SETHX rules allow it.',
          'Locked balances represent assets reserved for open orders, collateral, margin, fees, or settlement obligations.',
          'When an order is cancelled or a position is settled, any unused locked amount is released.',
          'Sethx.com always shows what is available and what will be locked before a user signs a transaction.',
        ],
        technicalTitle: 'Relevant functions',
        functions: [
          { name: 'depositETH(amount), withdrawETH(amount)', description: 'Account-level ETH deposit and withdrawal actions.' },
          { name: 'depositToken(token, amount), withdrawToken(token, amount)', description: 'Account-level ERC20 deposit and withdrawal actions after allowance handling where needed.' },
          { name: 'getETHBalance(user), getLockedETHBalance(user)', description: 'Vault reads for free and locked ETH balances.' },
          { name: 'getERC20Balance(user, token), getLockedERC20(user, token)', description: 'Vault reads for free and locked token balances.' },
          { name: 'lock / unlock / charge fee operations', description: 'Product contracts use vault operations to reserve assets, release unused amounts, and charge fees during order and settlement flows.' },
        ],
      },
      fees: {
        kicker: 'Fees',
        title: 'Fees combine a fixed component with a percentage component.',
        description: 'Fees can be paid in SETHX and ETH. Payment in SETHX provides approximately a 50% discount on the fee value in ETH. For every trade context, FeeManager returns a fixed fee and a percentage fee. Sethx.com show the actual fees before the user confirms a trade.',
        detailsTitle: 'How users should read fees',
        details: [
          'Fees can be paid in SETHX and ETH. Payment in SETHX provides approximately a 50% discount on the fee value in ETH.',
          'The fixed fee is a base amount charged for the trade context, usually denominated in the selected accepted fee token.',
          'The percentage fee is expressed in basis points and calculated from the relevant asset or trade value.',
          'Account-based fee discounts are not confirmed as wired in this app version yet. Keep this as a placeholder until the contract and transaction review logic are implemented.',
          'Transaction review always shows the fee context, fixed fee, percentage fee, fee token, and any important assumptions before the user signs.',
        ],
        technicalTitle: 'Relevant functions',
        functions: [
          { name: 'getRoleFeeConfig(context)', description: 'Reads active maker/taker fixed and percentage fees for a trade context.' },
          { name: 'getRoleFeeConfig(context)', description: 'Use getFeeForAccount to preview token and account discounts for a specific order.' },
          { name: 'getFeeForAccount(paymentToken, assetToken, assetValue, context, account, isMaker)', description: 'Returns maker/taker fixed and percentage fee amounts used in transaction review.' },
          { name: 'getAcceptedPaymentTokens()', description: 'Reads which fee tokens are currently accepted.' },
          { name: 'sethxDiscountBps()', description: 'Reads the active SETHX fee discount in basis points.' },
        ],
        ratesTitle: 'Actual trade fee rates',
        ratesIntro: 'This popup reads the active FeeManager configuration for all current trade fee contexts.',
        refreshRates: 'Refresh rates',
        ratesLoading: 'Loading active fee rates...',
        ratesLoaded: 'Active fee rates loaded.',
        ratesError: 'Could not load active fee rates. Check the connected network or provider.',
        ratesColumns: { trade: 'Trade', context: 'Fee context', payment: 'Payment token', fixed: 'Fixed fee', percentage: 'Percentage fee', source: 'Source' },
        ratesSourceContract: 'FeeManager read',
        ratesSourcePending: 'Pending',
        feePageCta: 'Open active fee rates',
      },
      tokenSpot: {
        kicker: 'Token Spot',
        title: 'Token spot markets let users trade ERC20 tokens through an orderbook.',
        description: 'Token Spot is the ERC20 orderbook market on sethx.com. Users can place orders, fill existing orders, cancel open orders, and review balances, fees, and vault effects before confirming a trade.',
        detailsTitle: 'How token spot works',
        details: [
          'A token spot market has a base token and a quote token. Users can place orders to exchange one ERC20 token for another through the token spot orderbook.',
          'The selected SETHX account is used for the action. Sethx.com shows the selected account balances, available amounts, locked balances, order details, fees, and transaction review before the user confirms.',
          'Placing an order locks the offered amount and any required fee amount. Filling an order transfers the agreed tokens between users and deducts the fees.',
          'Cancelling an open order releases any unused locked amount back to the selected SETHX account.',
          'In "My Tokens" the user can see the balances per token and their USD value if available. The tokens are classified as main, whitelisted and other. The whitelisted tokens are the trusted main tokens with confirmed addresses.',
        ],
        technicalTitle: 'Relevant functions',
        functions: [
          { name: 'getMarkets(), market reads', description: 'Read configured token spot markets, base/quote tokens, market status, orderbook state, and display data.' },
          { name: 'placeOrder(...)', description: 'Creates a token spot order for the selected SETHX account and locks the offered amount according to the order terms.' },
          { name: 'acceptOrder(...)', description: 'Accepts or fills an existing token spot order after sethx.com prepares the transaction review and fee preview.' },
          { name: 'cancelOrder(...)', description: 'Cancels an open token spot order and releases unused locked balances according to orderbook rules.' },
          { name: 'FeeManager + Vault reads', description: 'Read fee settings, selected fee token effects, available balances, and locked balances before the user confirms the transaction.' },
        ],
      },
      nftSpot: {
        kicker: 'NFT Spot',
        title: 'NFT spot markets let users trade NFTs through an orderbook.',
        description: 'NFT Spot is the NFT orderbook market on sethx.com. Users can create asks for NFTs they own, place bids with a quote token, fill existing orders, cancel open orders, and review ownership, balances, fees, and vault effects before confirming a trade.',
        detailsTitle: 'How NFT spot works',
        details: [
          'An NFT spot market connects an NFT collection with a quote token. Orders can target a specific token ID or market terms defined by the NFT spot orderbook.',
          'The selected SETHX account is used for the action. Sethx.com shows NFT ownership, quote-token balances, available amounts, locked balances, order details, fees, and transaction review before the user confirms.',
          'Creating an ask locks or reserves the NFT according to the order terms. Creating a bid locks the offered quote-token amount and any required fee amount.',
          'Filling an NFT spot order transfers the NFT and quote tokens between users and deducts the fees. In the current contract flow, both sides lock fee budgets and fees are charged according to their order side and fill.',
          'Cancelling an open NFT spot order releases any unused locked NFT or quote-token amount back to the selected SETHX account.',
          'In the NFT workspace, users can review available collections, selected-market bids and asks, owned NFTs, and their own open NFT spot orders.',
        ],
        technicalTitle: 'Relevant functions',
        functions: [
          { name: 'getMarkets(), market reads', description: 'Read configured NFT spot markets, NFT collection address, quote token, market status, orderbook state, and display data.' },
          { name: 'placeOrder(...)', description: 'Creates an NFT spot bid or ask for the selected SETHX account and locks the offered NFT or quote-token amount according to the order terms.' },
          { name: 'acceptOrder(...)', description: 'Accepts or fills an existing NFT spot order after sethx.com prepares the ownership checks, transaction review, and fee preview.' },
          { name: 'cancelOrder(...)', description: 'Cancels an open NFT spot order and releases unused locked assets according to orderbook rules.' },
          { name: 'FeeManager + Vault reads', description: 'Read fee settings, selected fee token effects, NFT ownership, available balances, and locked balances before the user confirms the transaction.' },
        ],
      },
      futures: {
        kicker: 'Futures',
        title: 'Futures markets let users create long or short exposure with margin.',
        description: 'Futures on sethx.com are orderbook markets for directional exposure. Users can place buy or sell orders, match with existing liquidity, manage margin, review fees, and settle exposure through the selected SETHX account.',
        detailsTitle: 'How futures work',
        details: [
          'A futures market is identified by a market key and uses a settlement price source. Users express intent with buy or sell orders that can open, reduce, or close long and short exposure.',
          'The payment and margin token for futures is always ETH. The selected SETHX account must have enough available ETH to cover margin, buffers, and fees before a trade is confirmed.',
          'Placing a futures order can lock margin, a price-movement buffer, and fee amounts. Matching an order creates or changes futures exposure and charges fees according to the filled amount.',
          'Cancelling an open futures order releases unused locked amounts for that order. Margin already supporting an active position remains managed by the futures contract and settlement rules.',
          'Users can add margin to support an open futures position or release excess margin when the contract allows it.',
          'Initial margin is the collateral required to open or increase futures exposure. Minimum or maintenance margin is the lower safety threshold used to determine whether a position has enough collateral to remain active.',
        ],
        technicalTitle: 'Relevant functions',
        functions: [
          { name: 'placeOrderFutures(orderBook, marketKey, side, price, amount, expiry, feeToken)', description: 'Account-level function that submits a futures order through the selected SETHX account.' },
          { name: 'cancelOrderFutures(orderBook, orderId)', description: 'Cancels an open futures order and releases unused order-level locked balances.' },
          { name: 'addFuturesMargin(futuresContract, marketKey, isLong, amount)', description: 'Adds margin to an existing long or short futures position.' },
          { name: 'releaseFuturesMargin(futuresContract, marketKey, isLong)', description: 'Requests release of excess margin when the futures contract calculates that margin can be released.' },
          { name: 'FeeManager + Vault reads', description: 'Read fee settings, ETH fee payment, available balances, locked collateral, and margin impact before the user confirms.' },
        ],
        mechanicsTitle: 'Detailed mechanics',
        mechanics: [
          { title: 'How futures are traded', description: 'A user trades futures by choosing a market, side, price, amount, and expiry through a selected SETHX account. Futures payment and margin are always in ETH. Opening or increasing exposure requires margin: collateral is locked to support the long or short position, while the order can also lock fee amounts and a price-movement buffer before matching.' },
          { title: 'Oracle dependency', description: 'Each futures market depends on an approved settlement-price oracle. PriceManager must consider the oracle approved, context-approved for futures settlement, active, and not stale before it is usable.' },
          { title: 'Stale oracle handling', description: 'If the oracle becomes stale or unusable, futures market operations that require an active oracle can be blocked, and settlement logic can close the market for new exposure until the oracle is usable again.' },
          { title: 'Settlement model', description: 'Futures positions reference the market last settlement price. Settlement updates the market index price and applies PnL through settlement rounds; trades can still change exposure without immediately realizing all PnL.' },
          { title: 'Margin and liquidation', description: 'The contract tracks position margin and margin per unit. Live margin is evaluated against mark-price movement and maintenance requirements. Positions that are undercollateralized after settlement are liquidated automatically; remaining margin is lost and added to the liquidation buffer.' },
          { title: 'Long and short imbalance', description: 'When long and short open interest is not balanced, the system tracks the difference as market imbalance. Settlement can use the imbalance buffer to cover profit that is owed but not matched by losing-side losses, and the orderbook can expose synthetic imbalance liquidity so users can trade against the excess long or short side.' },
        ],
      },
      options: {
        kicker: 'Options',
        title: 'Options markets let users trade calls and puts with expiry, strike, premium, and collateral rules.',
        description: 'Options on sethx.com are orderbook markets for defined-risk exposure. Users can buy options, sell held options, write new option exposure, fill existing orders, cancel open orders, exercise in-the-money positions, and reclaim expired writer collateral through the selected SETHX account.',
        detailsTitle: 'How options work',
        details: [
          'An options market is defined by option type, asset token, quote token, strike price, and option expiry. Calls give exposure to upside in the asset; puts give exposure to downside relative to the strike.',
          'The payment token for options is always ETH for premiums and fees. The exception is call option collateral, where the writer delivers or locks the underlying token when the call structure requires underlying delivery.',
          'Buyers pay a premium for the option. Writers provide collateral so the option can be honored if it is exercised according to the option rules.',
          'Placing an order can lock premium, writer collateral, and fee budgets depending on the order intent. Filling an order transfers the premium, updates option exposure, and deducts fees where applicable.',
          'Cancelling an open options order releases unused locked premium, collateral, or fee budgets for that order.',
          'Holders can exercise eligible options only during the exercise window. After expiry, writers can reclaim unused collateral according to the contract rules.',
        ],
        technicalTitle: 'Relevant functions',
        functions: [
          { name: 'placeOrderOption(orderBook, optionType, assetToken, quoteToken, strikePrice, optionExpiry, orderExpiry, feeToken, intent, size, askPrice)', description: 'Account-level function that submits an options order through the selected SETHX account.' },
          { name: 'acceptOrderOption(orderBook, makerOrderId, amount, feeToken)', description: 'Accepts or fills an existing options order after sethx.com prepares the transaction review and fee preview.' },
          { name: 'cancelOrderOption(orderBook, orderId)', description: 'Cancels an open options order and releases unused locked balances for that order.' },
          { name: 'exercise(marketKey, size)', description: 'Exercises eligible option exposure when the option contract rules allow the holder to exercise.' },
          { name: 'reclaimExpired(marketKey)', description: 'Reclaims available writer collateral after expiry when the option contract allows it.' },
          { name: 'FeeManager + Vault reads', description: 'Read fee settings, ETH fee payment, available balances, locked balances, premium impact, and collateral requirements before the user confirms.' },
        ],
        mechanicsTitle: 'Detailed mechanics',
        mechanics: [
          { title: 'Calls and puts', description: 'A call option gives the holder exposure to buy or receive value based on the asset being above the strike. A put option gives the holder exposure based on the asset being below the strike. The exact transfer and payout logic follows the option contract.' },
          { title: 'Premium and writer collateral', description: 'The premium is the price paid by the option buyer to enter the position. A writer locks collateral to back the obligation: call writers can require asset collateral, while put writers can require quote-token collateral based on size and strike.' },
          { title: 'Order intents', description: 'The orderbook supports different intents such as buying options, selling held options, writing options, and selling writer exposure. Sethx.com prepares the selected intent so the user can see what is paid, locked, received, or released before signing.' },
          { title: 'Expiry, exercise, and reclaim', description: 'Options use an option expiry. Holders can exercise eligible exposure only during the relevant exercise window. After expiry, unused writer collateral can be reclaimed according to the option contract rules.' },
          { title: 'Fees and vault effects', description: 'Options trades can lock premium, collateral, and fee amounts before signing. Transaction review shows the fee context, ETH fee payment, fixed and percentage fee, and the balances that will be used or locked.' },
        ],
      },

      binaryOptions: {
        kicker: 'Binary Options',
        title: 'Binary options markets let users trade fixed-outcome exposure with ETH payment and margin.',
        description: 'Binary options on sethx.com are ETH-settled orderbook markets around a defined condition, strike, and expiry. Users can buy payout exposure, write payout exposure with margin, fill existing orders, cancel open orders, claim winning payout, and reclaim unused writer margin through the selected SETHX account.',
        detailsTitle: 'How binary options work',
        details: [
          'A binary options market defines a condition such as above or below a strike at expiry. The market pays eligible holders when the condition is true according to the settlement rule.',
          'The payment token is always ETH. Buyers lock the premium they pay for payout exposure, while writers lock ETH margin to support the payout obligation.',
          'Placing an order can lock premium, writer margin, and fee amounts depending on the order intent. Filling an order transfers the premium, updates payout exposure, and deducts fees where applicable.',
          'Cancelling an open binary option order releases unused locked premium, writer margin, or fee budgets for that order.',
          'After settlement, winning holders can claim payout and writers can reclaim unused margin according to the binary option contract rules.',
        ],
        technicalTitle: 'Relevant functions',
        functions: [
          { name: 'placeOrderBinaryMarginOption(orderBook, marketKey, intent, payoutAmount, askPrice, expiry, feeToken)', description: 'Account-level function that submits a binary option order through the selected SETHX account.' },
          { name: 'acceptOrderBinaryMarginOption(orderBook, makerOrderId, payoutAmount, feeToken)', description: 'Accepts or fills an existing binary option order after sethx.com prepares the transaction review and fee preview.' },
          { name: 'cancelOrderBinaryMarginOption(orderBook, orderId)', description: 'Cancels an open binary option order and releases unused locked balances for that order.' },
          { name: 'claimBinaryMarginOption(binaryContract, marketKey, payoutAmount)', description: 'Claims eligible binary option payout after the market has settled.' },
          { name: 'reclaimWriterBinaryMarginOption(binaryContract, marketKey)', description: 'Reclaims available writer margin after settlement when the contract allows it.' },
          { name: 'FeeManager + Vault reads', description: 'Read fee settings, ETH balances, locked ETH, payout exposure, premium impact, and writer margin requirements before the user confirms.' },
        ],
        mechanicsTitle: 'Detailed mechanics',
        mechanics: [
          { title: 'Binary outcome', description: 'Binary options do not pay a variable amount based on how far price moves. They resolve to a defined outcome: the condition is true or false at settlement.' },
          { title: 'Premium and writer margin', description: 'The buyer pays a premium in ETH for potential payout. The writer locks ETH margin to back the payout if the buyer-side exposure wins.' },
          { title: 'Order intents', description: 'The orderbook supports intents such as buying payout exposure, selling holder payout, and writing payout exposure. Sethx.com prepares the selected intent so users see what is paid, locked, received, or released before signing.' },
          { title: 'Oracle, expiry, and settlement', description: 'Settlement depends on the configured market condition, strike, expiry, and settlement price source. If the required oracle data is unavailable or stale, settlement or market actions can be delayed or blocked until the data is usable.' },
          { title: 'Claims and reclaim', description: 'After settlement, eligible holders claim payout. Writers reclaim remaining margin only when the contract rules allow it after payout obligations are resolved.' },
        ],
      },
      marginOptions: {
        kicker: 'Margin Options',
        title: 'Margin options markets let users trade option exposure with partial writer collateral.',
        description: 'Margin Options on sethx.com are ETH-settled orderbook markets for call or put exposure where writers can lock margin instead of full notional collateral. Users can create orders, fill existing orders, cancel open orders, claim eligible payout after settlement, and reclaim remaining writer margin through the selected SETHX account.',
        detailsTitle: 'How margin options work',
        details: [
          'A margin option market is defined by option type, oracle, base token, payment token, strike price, expiry, and collateral ratio. The payment token is ETH for premiums, fees, margin, claims, and reclaim.',
          'Buyers pay an ETH premium for option exposure. Writers lock ETH margin based on the market collateral ratio, so the writer collateral can be lower than the full possible payout.',
          'Creating an order can lock ETH premium, writer margin, and fee budgets depending on the selected intent. Filling an order transfers premium, updates holder or writer exposure, and deducts fees when applicable.',
          'After settlement, eligible holders can claim payout according to settlement price and payout per unit. Writers can reclaim remaining margin after obligations are resolved.',
          'The payout never exceeds the collateral locked for the margin option position.',
          'Because writer collateral is margin-based, payout can depend on available writer margin and settlement results. Sethx.com shows premium, margin, fees, expiry, and claim or reclaim effects before the user confirms.',
        ],
        technicalTitle: 'Relevant functions',
        functions: [
          { name: 'placeOrderMarginOption(orderBook, marketKey, intent, size, askPrice, expiry, feeToken)', description: 'Account-level function that submits a margin option order through the selected SETHX account.' },
          { name: 'acceptOrderMarginOption(orderBook, makerOrderId, amount, feeToken)', description: 'Accepts or fills an existing margin option order after sethx.com prepares the transaction review and fee preview.' },
          { name: 'cancelOrderMarginOption(orderBook, orderId)', description: 'Cancels an open margin option order and releases unused locked balances for that order.' },
          { name: 'claimMarginOption(marginContract, marketKey, size)', description: 'Claims eligible margin option payout after the market has settled.' },
          { name: 'reclaimWriterMarginOption(marginContract, marketKey)', description: 'Reclaims remaining writer margin after settlement when the contract permits.' },
          { name: 'getRequiredMargin(marketKey, size), getPayoutPerUnit(marketKey)', description: 'Reads margin requirements and settlement payout values used for transaction review and position display.' },
        ],
        mechanicsTitle: 'Detailed mechanics',
        mechanics: [
          { title: 'Margin option exposure', description: 'Margin options resemble ordinary option exposure but the writer margin is calculated from the market collateral ratio instead of always locking full notional value. This makes margin efficiency higher but also makes settlement and reclaim rules more important.' },
          { title: 'ETH payment and margin', description: 'Premium, fees, writer margin, holder payout, and writer reclaim are handled in ETH. The selected SETHX account must have enough available ETH for the chosen action before signing.' },
          { title: 'Oracle and settlement', description: 'The market uses an approved oracle and configured expiry. After settlement, the settlement price determines whether holder exposure has value and what payout per unit can be claimed.' },
          { title: 'Writer reclaim', description: 'Writers can reclaim remaining margin only after settlement and after payout obligations are resolved under the contract rules.' },
          { title: 'Risk note', description: 'Because writer collateral is partial, users should review the collateral ratio, strike, expiry, settlement status, payout assumptions, and locked ETH before signing any margin option transaction.' },
        ],
      },
      lending: {
        kicker: 'Lending',
        title: 'Lending markets let users supply ETH to borrowers through an on-chain order book.',
        description: 'Lending on sethx.com is built around ETH loan offers, lending accounts, collateral rules, and repayment. Lenders supply capital through the lending order book and borrowers accept available offers through restricted lending-oriented accounts.',
        detailsTitle: 'How lending works',
        details: [
          'A lender creates or funds a lending offer by choosing loan size, duration, interest terms, risk tier, and collateral requirements. The available ETH can be accepted by borrowers through the lending order book.',
          'Accepted lending offers become active loans. The borrower receives usable ETH while collateral and loan state remain connected to the selected SETHX account.',
          'Lenders do not pay trading fees for supplying liquidity. The design avoids charging LPs because borrowers use the borrowed ETH for SETHX investments where trading fees can apply.',
          'When a loan is repaid, the lender receives principal and agreed interest according to the loan terms. If repayment or collateral rules fail, the loan can move into liquidation handling.',
          'Sethx.com shows the order terms, duration, accepted amount, collateral expectations, repayment state, and account effects before a user confirms lending actions.',
        ],
        technicalTitle: 'Relevant functions',
        functions: [
          { name: 'createLendingOffer(orderBook, amount, duration, rate, riskTier)', description: 'Creates a lending offer that borrowers can review and accept through the lending order book.' },
          { name: 'cancelLendingOffer(orderBook, offerId)', description: 'Cancels an open lending offer and releases unused available liquidity when the contract permits it.' },
          { name: 'fundLendingOffer(orderBook, offerId, amount)', description: 'Adds or supplies ETH liquidity to a lending offer when supported by the lending flow.' },
          { name: 'claimLendingRepayment(lendingContract, loanId)', description: 'Claims principal, interest, or repayment amounts that are available to the lender after repayment or settlement.' },
          { name: 'getLendingOffer(offerId), getLoan(loanId)', description: 'View functions used by sethx.com to display offer terms, active loan state, repayment progress, and risk information.' },
        ],
        mechanicsTitle: 'Detailed mechanics',
        mechanics: [
          { title: 'Orderbook lending', description: 'Lending uses an orderbook-style flow: lenders publish capital and terms, and borrowers accept the offers that fit their account, collateral, and risk requirements.' },
          { title: 'Lender position', description: 'The lender position is mainly an ETH receivable: after a borrower accepts the offer, the lender waits for repayment, interest, settlement, or liquidation handling according to the loan terms.' },
          { title: 'No LP fee charge', description: 'The lending side is designed so liquidity providers are not charged trading fees for making capital available. Borrowers may later pay trading fees when they invest borrowed funds in SETHX markets.' },
          { title: 'Risk visibility', description: 'Lenders should review duration, risk tier, collateral rules, active/deactivated account state, liquidation assumptions, and repayment status before supplying or leaving capital in a lending market.' },
        ],
      },
      borrowing: {
        kicker: 'Borrowing',
        title: 'Borrowing lets users access ETH through lending accounts that are restricted by collateral and risk rules.',
        description: 'Borrowing on sethx.com happens through lending-oriented SETHX accounts. A borrower accepts a loan offer from the lending order book and the account is restricted by LTV, risk tier, collateral state, repayment status, and liquidation rules.',
        detailsTitle: 'How borrowing works',
        details: [
          'A borrower uses a lending-oriented SETHX account to accept an available lending offer. The loan terms define how much ETH is borrowed, repayment expectations, duration, and risk tier.',
          'Borrowed ETH can be used for SETHX investments, but the lending account is restricted based on LTV, collateral, risk tier, and active loan state.',
          'Collateral must remain sufficient while the loan is active. If collateralization falls below required levels, the account can be liquidated.',
          'Borrowers repay principal and agreed interest according to the loan terms. Repayment releases loan restrictions when the contract rules are satisfied.',
          'Sethx.com shows borrowed amount, collateral state, LTV, risk tier, repayment obligations, liquidation risk, and transaction effects before the user signs.',
        ],
        technicalTitle: 'Relevant functions',
        functions: [
          { name: 'acceptLendingOffer(orderBook, offerId, amount)', description: 'Accepts an available lending offer and creates or updates the borrower loan state through the selected SETHX account.' },
          { name: 'repayLoan(lendingContract, loanId, amount)', description: 'Repays principal and interest according to the loan terms and releases restrictions when the loan is fully resolved.' },
          { name: 'addCollateral(lendingContract, loanId, token, amount)', description: 'Adds collateral to improve the account LTV and reduce liquidation risk when the lending flow supports it.' },
          { name: 'liquidateLoan(lendingContract, loanId)', description: 'Liquidates an undercollateralized loan when the contract rules permit liquidation.' },
          { name: 'getLoanHealth(loanId), getLtv(loanId), getRiskTier(loanId)', description: 'View functions used by sethx.com to display account restrictions, LTV, risk tier, collateralization, and liquidation status.' },
        ],
        mechanicsTitle: 'Detailed mechanics',
        mechanics: [
          { title: 'Restricted account actions', description: 'Borrowing is account-based. A lending-oriented account can be restricted while debt is active, so sethx.com should prevent or warn about actions that conflict with LTV, collateral, risk tier, or loan rules.' },
          { title: 'LTV and risk tier', description: 'Loan-to-value compares borrowed value with collateral value. The risk tier defines stricter or looser limits, accepted actions, and liquidation thresholds for that borrowing account.' },
          { title: 'Repayment', description: 'Repayment returns borrowed ETH plus agreed interest. Once the loan is fully repaid and contract checks pass, collateral and account restrictions can be released according to the rules.' },
          { title: 'Liquidation', description: 'If the account becomes undercollateralized, liquidation can seize collateral or resolve the loan under contract rules. Users should monitor LTV and collateral state before investing borrowed funds.' },
        ],
      },

      miscellaneous: {
        kicker: 'Miscellaneous',
        title: 'Other items users should understand before signing transactions.',
        description: 'Some important parts of sethx.com are not one market by themselves, but affect many actions: wallet approvals, live reads, market status, oracle data, governance settings, and transaction review. This section collects those cross-cutting items so they are not missed.',
        detailsTitle: 'Items to keep in mind',
        details: [
          'Wallet approvals are separate from trade confirmation. For ERC20 tokens and NFTs, a user may need to approve spending or transfer permissions before sethx.com can prepare the market action.',
          'Markets can have enabled, disabled, paused, expired, settled, or stale-data states. Sethx.com should show those states before allowing a user to prepare an action.',
          'Oracle and pricing data are used for USD values, settlement, risk checks, LTV, margin calculations, and some fee assumptions. If the relevant data is stale or unavailable, actions may be blocked or shown with warnings.',
          'Governance can change market settings, fee configuration, risk tiers, allowed assets, oracle settings, and other parameters. Users should rely on current contract reads before signing.',
          'Transaction review is the final user checkpoint. It should show the selected account, action, market, amounts, fees, locks, releases, assumptions, and any known risk warning before the wallet signs.',
        ],
        technicalTitle: 'Relevant references',
        functions: [
          { name: 'ERC20 approve(token, spender, amount)', description: 'User wallet approval that can be required before tokens can be deposited, locked, or moved by the selected flow.' },
          { name: 'ERC721/ERC1155 approvals', description: 'NFT approvals or operator approvals that can be required before NFT spot actions can lock or transfer an NFT.' },
          { name: 'market status reads', description: 'View functions used by sethx.com to decide whether a market is open, paused, settled, expired, or otherwise unavailable.' },
          { name: 'PriceManager / oracle reads', description: 'Reads used for settlement prices, USD display values, risk checks, margin, LTV, and stale-data warnings.' },
          { name: 'governance parameter reads', description: 'Reads used to display current configured fees, risk settings, allowed assets, accepted fee tokens, and market-level parameters.' },
        ],
        mechanicsTitle: 'Detailed notes',
        mechanics: [
          { title: 'Approvals and signatures', description: 'An approval gives a contract permission to use a token or NFT; a trade confirmation signs the actual market action. Sethx.com should separate those steps clearly so users understand what they are authorizing.' },
          { title: 'Live reads and cached views', description: 'The public pages can explain concepts, but balances, fee rates, market state, oracle values, and risk checks must come from live reads where possible. Users should refresh data when a transaction depends on current values.' },
          { title: 'Market and parameter changes', description: 'SETHX markets are configurable. A market, fee, risk tier, or oracle rule can change through the configured control process, so library text is guidance and the transaction review should rely on the active setting.' },
          { title: 'User responsibility', description: 'Sethx.com prepares clear transaction information, but users remain responsible for reviewing wallet prompts, understanding risk, and deciding whether to sign.' },
        ],
      },


    },
    feeRates: {
      kicker: 'Fees',
      title: 'Active fee rates from FeeManager.',
      intro: 'SETHX is designed for very low on-chain trading fees. This page reads the active fee configuration used by sethx.com when it prepares transaction reviews. Fees can change through governance, so users should rely on the latest contract reads before signing.',
      activeTitle: 'Current contract reads',
      activeIntro: 'Fixed fees are raw 18-decimal token amounts. Percentage fees are basis points: 10 bps equals 0.10%.',
      acceptedTokens: 'Accepted fee tokens',
      sethxDiscount: 'SETHX discount',
      statusLoading: 'Loading active fee rates...',
      statusLoaded: 'Active fee rates loaded.',
      statusError: 'Fee rates could not be loaded. Check the configured network or provider.',
      refresh: 'Refresh rates',
      backToLibrary: 'Back to library',
      product: 'Product',
      context: 'Fee context',
      fixedFee: 'Fixed fee',
      percentageFee: 'Percentage fee',
      source: 'Source',
      paymentToken: 'Payment token',
      completeFeesCta: 'Trade fee set',
      pending: 'Pending product wiring',
      contractRead: 'FeeManager read',
      notWired: 'No shared FeeManager context wired yet',
      notesTitle: 'How to interpret this table',
      notes: [
        'The table shows active FeeManager configuration by product context. It is not a quote for a specific order.',
        'A final transaction review may include oracle conversion, selected fee token, asset value, available balance, locked balance, and product settlement rules.',
      ],
    },
    governance: {
      kicker: 'Governance',
      title: 'Governance is the decision layer for protocol changes and treasury actions.',
      intro: 'SETHX governance lets eligible voters delegate voting power, review proposals, vote, and approve protocol or treasury actions through transparent smart contract workflows. The public page explains the process; the connected app provides the transaction app.',
      lifecycle: [
        { title: 'Discuss', description: 'Community review, requirements, risk analysis, cost estimates, and non-binding signaling before formal submission.' },
        { title: 'Propose', description: 'Eligible wallets create a proposal with targets, values, calldata, and a clear description of the intended action.' },
        { title: 'Vote', description: 'Voters review the proposal state and cast Against, For, or Abstain during the active voting window.' },
        { title: 'Execute', description: 'Approved proposals can move to execution through the governor or timelock model used by the deployed contracts.' },
      ],
      scopeTitle: 'Voting page scope',
      scopeText: 'The app governance page supports delegation, proposal lookup, voting, and proposal creation for eligible wallets. It also shows governor settings, contract addresses, proposal state, vote counts, and whether the connected wallet has already voted.',
      enterApp: 'Enter app',
      votingModel: [
        { title: 'Wallet SETHX', description: 'Liquid SETHX can be read directly from the token contract and delegated through the app.' },
        { title: 'Protocol-held SETHX', description: 'Users may hold assets inside SETHX accounts or vaults, so the final model should avoid ignoring deposited SETHX.' },
        { title: 'Effective voting power', description: 'The app should display the voting power recognized by the governance contracts and clearly explain what is included.' },
      ],
    },
    community: {
      kicker: 'Community',
      title: 'Build the SETHX ecosystem together.',
      intro: 'SETHX is more than an interface. It is a protocol ecosystem that can grow through traders, builders, analysts, holders, educators, designers, support contributors, market makers, and governance participants. This page explains where people can help, how ideas can become funded work, and why community participation matters.',
      contributorPaths: [
        ['Trade & Report', 'Use the interface, report issues, suggest market improvements, and help make the app safer and clearer.'],
        ['Build & integrate', 'Create dashboards, monitors, bots, analytics, alternate interfaces, automation, integrations, and product-specific tools around supported contracts.'],
        ['Research & educate', 'Publish risk reviews, market explainers, tutorials, translations, fee analysis, governance summaries, and performance research.'],
        ['Govern & grow', 'Hold SETHX, review proposals, signal priorities, vote when eligible, introduce contributors, and help the community make better decisions.'],
      ],
      sectionIntroTitle: 'Four practical ways to contribute',
      sectionIntroText: 'The first goal is to make contribution paths obvious. Some people will test the product, some will build around it, some will explain it, and some will help govern it. All four paths can create value for the protocol when they are coordinated transparently.',
      ideasTitle: 'Contribution opportunities',
      initiatives: [
        'Orderbook, fee, treasury, contract, and protocol-health monitoring',
        'Risk dashboards for collateral, liquidation exposure, oracle status, expiry windows, vault balances, and account health',
        'Product-focused tools for token spot, NFT spot, futures, vanilla options, binary options, margin options, lending, and borrowing',
        'Governance tooling for proposal review, delegated voting, vote explanations, quorum tracking, and treasury payment visibility',
        'Educational content, onboarding flows, translations, tutorials, explainer videos, FAQs, market guides, and support material',
        'Public data exports, analytics APIs, market-maker resources, research datasets, alerting, and independent dashboards',
      ],
      fundingTitle: 'Protocol-funded contributions',
      fundingText: 'SETHX can grant ETH for useful contributions when the work is reviewed and approved through the protocol treasury process. The sethx.com website itself is an example of protocol-funded work: the interface is funded by the protocol so users have a clear wallet-connected place to discover markets, manage protocol accounts, review transactions, understand risk, and participate in governance.',
      fundingCards: [
        { title: 'ETH grants', description: 'Contributors can request ETH for scoped work, services, maintenance, research, content, support, or integrations that benefit SETHX.' },
        { title: 'Governance approval', description: 'Paid work should move through community review and formal governance so voters can evaluate scope, budget, delivery risk, and treasury impact.' },
        { title: 'Public accountability', description: 'Milestones, deliverables, payment terms, and follow-up reporting should be easy for the community to inspect.' },
      ],
      contributionTitle: 'From idea to funded work',
      contributionSteps: [
        { title: 'Share the idea', description: 'Describe the problem, the target users, the expected benefit, and why the work helps the SETHX protocol or community.' },
        { title: 'Define the scope', description: 'Turn the idea into deliverables, milestones, timeline, maintenance expectations, risks, and a requested ETH budget.' },
        { title: 'Invite review', description: 'Let traders, builders, holders, and risk-minded community members challenge assumptions before anything becomes a formal proposal.' },
        { title: 'Move through governance', description: 'When the scope is mature, governance can decide whether treasury ETH should be granted and under what conditions.' },
      ],
      principlesTitle: 'Community principles',
      principles: [
        { title: 'Useful before loud', description: 'Prioritize work that makes the interface, protocol data, governance, risk review, or user education materially better.' },
        { title: 'Transparent by default', description: 'Keep proposals, budgets, deliverables, risk notes, and payment status understandable for SETHX holders.' },
        { title: 'Interface, not custodian', description: 'SETHX.COM helps users interact with supported smart contracts; users remain responsible for the transactions they sign.' },
      ],
      votingTitle: 'Community idea voting',
      ideaFlow: [
        'Anyone can suggest an idea publicly.',
        'Connected wallets can discuss, refine, and signal support.',
        'SETHX-holder signaling can help prioritize work before a formal proposal.',
        'Funded work requires governance review and treasury approval before ETH is granted.',
      ],
      votingText: 'Idea signaling is useful for prioritization, but it should not replace governance. Treasury-funded work should move through the proposal and voting process so contributors and voters can review scope, budget, risk, accountability, and expected protocol benefit.',
      ctaTitle: 'Become part of SETHX success',
      ctaText: 'SETHX needs people who are willing to test, build, explain, govern, and invite others. Start with a useful idea, make the scope concrete, and help the community turn high-value contributions into protocol-approved work.',
      primaryCta: 'Open governance',
      secondaryCta: 'Read the library',
    },
    risk: {
      kicker: 'Risk',
      title: 'Understand the risks before using SETHX.',
      intro: 'SETHX is a wallet-connected app for interacting with deployed on-chain contracts. The deployed contracts define the exchange and are the only source of truth for what can happen. Users who accept and sign a contract interaction are responsible for understanding the contract action, the active settings, and the possible consequences.',
      risks: [['Smart contract source of truth', 'The deployed contracts, not the website text, define the exchange. Contract addresses, permissions, parameters, oracle inputs, settlement logic, and liquidation rules are the authoritative rules used when a user signs. Bugs or unexpected behavior can cause loss.'], ['Market risk', 'Crypto assets, derivatives, lending markets, and collateral values can move quickly. Liquidation, expiry, and settlement outcomes may differ from expectations.'], ['Operational risk', 'Some positions require action at or before expiration. Option holders may lose rights if they do not act during the exercise window. Borrowers and futures users must monitor collateral, because liquidation can be triggered and can lead to loss.'], ['Oracle and pricing risk', 'Products that depend on external prices can be affected by stale, delayed, manipulated, or unavailable price feeds.'], ['Liquidity risk', 'Order books may be thin or inactive. Users may not be able to enter, exit, borrow, lend, or close positions at expected prices.'], ['Governance and treasury risk', 'SETHX settings, treasury payments, assets, parameters, and permissions may change after governance approval.'], ['Jurisdiction and access risk', 'Some regions may be restricted. Availability of features can change based on legal, compliance, or operational requirements.']],
      adviceTitle: 'No financial advice',
      adviceText: 'The app, docs, and assistant can provide platform explanations and general education, but they are not personalized financial, legal, tax, or investment advice. Users remain responsible for their own decisions and transactions.',
    },
    cookies: {
      kicker: 'Cookies',
      title: 'Functional storage first. Optional analytics only with approval.',
      intro: 'SETHX uses functional browser storage for preferences and consent choices. Optional analytics remains disabled unless the user accepts it. If accepted, analytics is limited to page views, Enter App, and wallet-connection conversion. The app does not use advertising or commercial tracking cookies.',
      cards: [{ title: 'Functional', description: 'Language choice, consent version, and app preferences needed to operate the site cleanly.' }, { title: 'Analytics', description: 'Analytics can be enabled only after approval and is limited to page views, Enter App, and wallet-connection conversion. It may show approximate region/country in aggregate reports, but SETHX does not send wallet addresses, selected accounts, balances, orders, transactions, idea text, or issue text.' }, { title: 'Commercial', description: 'No commercial, advertising, or third-party marketing cookies are used by the app.' }],
      currentChoice: 'Your current choice', consentState: 'Consent state:', accept: 'Accept analytics', decline: 'Decline analytics', reset: 'Reset choice',
    },
    privacy: {
      kicker: 'Privacy',
      title: 'Wallet-first public app with minimal functional storage.',
      intro: 'SETHX should collect only what is needed to operate the public website, remember functional preferences, protect access restrictions, and support optional conversion analytics when approved.',
      cards: [{ title: 'Wallet data', description: 'A connected wallet address may be used by the app to read public on-chain data and prepare transactions.' }, { title: 'Local storage', description: 'Language preference, cookie consent, and app settings may be stored in the browser.' }, { title: 'Analytics', description: 'Product analytics should only load after approval and should be limited to page views, Enter App, wallet connection conversion, and aggregate approximate region/country reports. It should not include wallet addresses, selected accounts, balances, orders, transactions, idea text, issue text, advertising identifiers, or commercial tracking.' }],
    },
    protocol: {
      kicker: 'Protocol', title: 'Protocol transparency and deployed contract information.', intro: 'This page reads from the central protocol configuration and live read layer where available. Use it to verify network, contract, asset, fee, treasury, and governance information before interacting with the app.', configuredNetwork: 'Configured network', contracts: 'Contracts', configuredRecords: 'configured records', status: 'Status', statusText: 'Read from configured SETHX data. Verify addresses and parameters before signing transactions.', liveKicker: 'Live read layer', liveTitle: 'Read-only protocol status', refreshReads: 'Refresh reads', acceptedPaymentTokens: 'Accepted payment tokens', trackedErc20Tokens: 'Tracked ERC20 tokens', directEthBalance: 'Direct ETH balance', governorSettings: 'Governor settings', loaded: 'Loaded', pending: 'Pending', acceptedFeeTokens: 'Accepted fee tokens', noLiveFeeTokenList: 'No live fee token list loaded yet.', vaultTokenRegistry: 'Vault token registry', sethxFeeToken: 'SETHX fee token', enabledAssets: 'Enabled assets', enabledProducts: 'Enabled products', contract: 'Contract', address: 'Address', configuredData: 'Configured data', liveData: 'Live data', contractDirectory: 'Contract directory', vaultReadNote: 'Vault registry reads ERC20 and ERC721 token lists from the deployed vault contract. ERC1155 is shown as zero when the deployed vault ABI does not expose an ERC1155 token-list read.',
    },
    notFound: { title: 'Page not found', body: 'The page you requested does not exist or has moved.', action: 'Go home' },
  },
  es: {
    home: {
      access: { 'requires-wallet': 'Conecta una wallet antes de abrir la app de trading.', 'country-restricted': 'La app está restringida en la región detectada.', default: 'Tu wallet no tiene el nivel de acceso necesario para esa página.' }, eyebrow: 'SETHX.COM', heroLine1: 'Bienvenido a', heroLine2: 'tu centro para el', heroSmart: 'Smart', heroEthereum: 'ETHereum', heroExchangePrefix: 'eXchange', heroDescription: 'SETHX.COM es una app conectada a wallet para interactuar con smart contracts compatibles del protocolo SETHX. Ayuda a los usuarios a descubrir mercados, gestionar cuentas SETHX, revisar detalles de transacciones y operar, entender el riesgo y participar en la gobernanza y la comunidad. Sethx.com no es custodio, broker ni exchange centralizado.', enterApp: 'Entrar app', openLibrary: 'Abrir biblioteca', governance: 'Gobernanza', connectWallet: 'Conecta una wallet para entrar en la app. La documentación pública sigue disponible sin conectar.', walletConnected: 'Wallet conectada. Acceso a la app habilitado.', getStartedTitle: 'Comenzar', stepLabel: 'Paso', steps: ['Conecta una wallet y confirma la red antes de abrir la app.', 'Crea o selecciona una cuenta del protocolo para el mercado que quieres usar.', 'Deposita activos compatibles cuando quieras operar, prestar, pedir prestado o aportar colateral.', 'Elige un mercado, revisa saldos, comisiones, notas de riesgo y detalles de la transacción.', 'Aprueba solo las transacciones que entiendes y quieres firmar en tu wallet.'], participation: [{ title: 'Compra SETHX', description: 'Mantén SETHX para construir poder de voto y participar en la gobernanza del protocolo.' }, { title: 'Vota y comparte ideas', description: 'Usa la gobernanza para apoyar propuestas, sugerir mejoras y ayudar a decidir prioridades del protocolo.' }, { title: 'Contribuye al ecosistema', description: 'Builders, escritores, analistas, diseñadores y miembros de la comunidad pueden contribuir y recibir pagos del protocolo por trabajo aceptado.' }, { title: 'Ayuda a crecer la comunidad', description: 'Aporta feedback útil, educación, alianzas y nuevos colaboradores a la comunidad SETHX. Contacta con SETHX.COM si quieres contribuir.' }], ownLine1: 'Posee SETHX', ownLine2: 'Vota y Contribuye', ownLine3: 'Haz Crecer la Comunidad', marketsKicker: 'Mercados SETHX', marketsTitle: 'Exchange on-chain con estructuras trad-fi', marketsIntro: 'SETHX.COM agrupa el protocolo en tres áreas claras de mercado: actividad spot, trading de derivados y mercados de crédito para prestar y pedir prestado.', markets: [{ kicker: 'Spot', title: 'Mercados spot', description: 'Opera tokens y activos NFT compatibles mediante mercados estilo orderbook, comparables a las mesas spot de exchanges tradicionales donde compradores y vendedores se encuentran a precios visibles.' }, { kicker: 'Derivados', title: 'Mercados de derivados', description: 'Accede a futures, opciones vanilla, opciones binarias y margin options con flujos de revisión estructurados, similares a venues de derivados donde los traders gestionan exposición, vencimiento, liquidación y colateral.' }, { kicker: 'Crédito', title: 'Mercados de crédito', description: 'Usa mercados de préstamo diseñados alrededor de cuentas SETHX, colateral, préstamos y bonos, comparables a mesas de crédito donde el capital se suministra, se valora y se devuelve con el tiempo.' }], readMore: 'Leer más →', libraryKicker: 'Biblioteca y gobernanza', libraryTitle: 'Aprende primero. Vota cuando estés listo.', libraryButton: 'Abrir biblioteca', library: [{ title: 'Biblioteca', description: 'Documentación clara para usuarios, builders, traders, prestamistas y gobernadores.', link: '/docs' }, { title: 'Gobernanza', description: 'Ciclo de propuestas, delegación, poder de voto, decisiones de tesorería y cambios de parámetros del protocolo.', link: '/governance' }, { title: 'Protocolo', description: 'Red, contratos configurados, activos compatibles, estado de lecturas en vivo y referencias de transparencia.', link: '/protocol' }], open: 'Abrir →',
    },
library: {
      kicker: 'Biblioteca',
      title: 'Biblioteca práctica para cuentas SETHX, vault, comisiones, mercados, lending, borrowing y riesgo.',
      intro: 'Usa esta biblioteca como mapa guiado de sethx.com. Empieza con cuentas, vault y comisiones; luego continúa con mercados spot, derivados, lending, borrowing y elementos generales como aprobaciones, estado de mercado, datos de oráculo y revisión de transacciones. Cada tema combina una explicación sencilla con referencias técnicas opcionales.',
      navTitle: 'Empieza aquí',
      close: 'Cerrar',
      nav: [
        { label: 'Cuentas', title: 'Cuentas SETHX', description: 'Cuentas normales de trading, cuentas orientadas a margen, estado activo/desactivado, nombres y por qué las acciones pasan por una cuenta.', target: 'accounts' },
        { label: 'Vault', title: 'Depósitos y bloqueo', description: 'Cómo se relacionan depósitos, retiros, saldos disponibles, saldos bloqueados, órdenes, margen, colateral y comisiones.', target: 'vault' },
        { label: 'Comisiones', title: 'Tasas y cobro', description: 'Comisiones fijas, porcentuales, tokens de comisión, contextos de producto y la página de tasas activas.', target: 'fees' },
        { label: 'Spot', title: 'Token Spot', description: 'Cómo los mercados token spot usan órdenes, fills, cancelaciones, saldos, comisiones y routing de cuenta.', target: 'token-spot' },
        { label: 'NFTs', title: 'NFT Spot', description: 'Cómo los mercados NFT spot usan colecciones NFT, token IDs, bids, asks, fills, cancelaciones, comisiones y bloqueo en el vault.', target: 'nft-spot' },
        { label: 'Futuros', title: 'Futuros', description: 'Cómo los mercados de futuros usan exposición long y short, margen, matching de órdenes, comisiones, liquidación y liberación de margen.', target: 'futures' },
        { label: 'Opciones', title: 'Opciones', description: 'Cómo las opciones usan calls, puts, strikes, vencimiento, primas, colateral del writer, ejercicio, reclaim y comisiones.', target: 'options' },
        { label: 'Binarias', title: 'Opciones binarias', description: 'Cómo las opciones binarias usan resultados sí/no, pago en ETH, importes de payout, margen del writer, settlement, claims y reclaim.', target: 'binary-options' },
        { label: 'Margen', title: 'Opciones con margen', description: 'Cómo los mercados de opciones con margen usan exposición long y short, prima en ETH, margen parcial del writer, settlement, claims y reclaim.', target: 'margin-options' },
        { label: 'Lending', title: 'Préstamo', description: 'Cómo los usuarios suministran ETH al orderbook de lending, crean ofertas de préstamo, gestionan liquidez disponible y reciben repayment.', target: 'lending' },
        { label: 'Borrowing', title: 'Borrowing', description: 'Cómo los usuarios piden prestado con cuentas de lending, colateral, LTV, niveles de riesgo, repayment y reglas de liquidación.', target: 'borrowing' },
        { label: 'Misc', title: 'Misceláneo', description: 'Aprobaciones de wallet, estado de mercado, datos de oráculo, ajustes de gobernanza, lecturas live y recordatorios de seguridad.', target: 'miscellaneous' },
      ],
      accounts: {
        kicker: 'Cuentas SETHX',
        title: 'Las cuentas son la capa de usuario entre una wallet y SETHX investments.',
        description: 'Una wallet se conecta a sethx.com, pero las acciones de trading y lending se ejecutan mediante cuentas SETHX. Esto mantiene acciones, saldos, depósitos, retiros, órdenes, margen y colateral organizados por cuenta en lugar de directamente por wallet. Las vistas públicas pueden leer SETHX data sin crear ni seleccionar una cuenta.',
        detailsTitle: 'Lo que debe saber el usuario',
        details: [
          'Una cuenta normal de trading se usa para spot y derivados como token spot, NFT spot, futures, opciones, opciones binarias y margin options.',
          'Las cuentas orientadas a margen o lending permiten tomar préstamos mediante el lending order book. Este tipo de cuenta tiene acciones restringidas según el LTV y el nivel de riesgo del préstamo. En caso de infracolateralización, la cuenta puede ser liquidada.',
          'Las cuentas pueden estar activas o desactivadas. La desactivación debe ocultar o limitar su uso en la app sin borrar el historial on-chain.',
          'Los usuarios pueden renombrar cuentas para que sethx.com muestre etiquetas legibles mientras el sistema on-chain identifica la cuenta por dirección.',
          'Excepto las funciones de vista, las acciones de producto se enrutan por la cuenta seleccionada. Sethx.com gestiona ese enrutamiento para que el usuario revise un flujo claro.',
        ],
        technicalTitle: 'Funciones relevantes',
        functions: [
          { name: 'createAccount()', description: 'Crea una cuenta SETHX normal para la wallet conectada mediante AccountFactory.' },
          { name: 'getAccounts(user), getNormalAccounts(user), getLendingAccounts(user)', description: 'Lee listas de cuentas desde AccountRegistry para mostrar las cuentas de una wallet.' },
          { name: 'isAccount(account), isLendingAccount(account), setAccountActive(account, active)', description: 'Comprueba y actualiza si una cuenta está activa o desactivada.' },
          { name: 'accountName(), setAccountName(name)', description: 'Lee y actualiza la etiqueta visible de una cuenta.' },
          { name: 'place / accept / cancel product order functions', description: 'Funciones de cuenta que envían acciones de mercado al orderbook correspondiente tras la revisión del usuario. Consulta las secciones de producto relevantes para más detalles.' },
        ],
      },
      vault: {
        kicker: 'Vault',
        title: 'El vault registra activos depositados y separa saldos disponibles de saldos bloqueados.',
        description: 'Los usuarios depositan ETH o tokens compatibles cuando quieren operar, prestar, pedir prestado, aportar colateral, pagar comisiones o soportar margen. Cuando una orden, préstamo o posición de margen requiere reservar activos, SETHX puede bloquearlos hasta que la orden se cancele, complete, liquide, reclame o libere.',
        detailsTitle: 'Modelo de saldos',
        details: [
          'Los activos depositados permanecen on-chain y se asocian con la cuenta SETHX que hizo el depósito.',
          'Los saldos disponibles pueden usarse para nuevas acciones o retirarse cuando las reglas de SETHX lo permitan.',
          'Los saldos bloqueados representan activos reservados para órdenes abiertas, colateral, margen, comisiones u obligaciones de liquidación.',
          'Cuando una orden se cancela o una posición se liquida, cualquier importe bloqueado no usado se libera.',
          'Sethx.com siempre muestra qué está disponible y qué se bloqueará antes de que el usuario firme una transacción.',
        ],
        technicalTitle: 'Funciones relevantes',
        functions: [
          { name: 'depositETH(amount), withdrawETH(amount)', description: 'Depósitos y retiros de ETH a nivel de cuenta.' },
          { name: 'depositToken(token, amount), withdrawToken(token, amount)', description: 'Depósitos y retiros ERC20 con gestión de allowance cuando sea necesario.' },
          { name: 'getETHBalance(user), getLockedETHBalance(user)', description: 'Lecturas del vault para saldos ETH libres y bloqueados.' },
          { name: 'getERC20Balance(user, token), getLockedERC20(user, token)', description: 'Lecturas del vault para saldos de tokens libres y bloqueados.' },
          { name: 'lock / unlock / charge fee operations', description: 'Los contratos de producto reservan activos, liberan saldos no usados y cobran comisiones mediante el vault.' },
        ],
      },
      fees: {
        kicker: 'Comisiones',
        title: 'Las comisiones combinan una parte fija y una parte porcentual.',
        description: 'Las comisiones pueden pagarse en SETHX y ETH. El pago en SETHX ofrece aproximadamente un 50% de descuento sobre el valor de la comisión en ETH. Para cada contexto de trade, FeeManager devuelve una comisión fija y una comisión porcentual. Sethx.com muestra las comisiones reales antes de que el usuario confirme un trade.',
        detailsTitle: 'Cómo leer comisiones',
        details: [
          'Las comisiones pueden pagarse en SETHX y ETH. El pago en SETHX ofrece aproximadamente un 50% de descuento sobre el valor de la comisión en ETH.',
          'La comisión fija es un importe base para el contexto de trade, normalmente en el token de comisión seleccionado.',
          'La comisión porcentual se expresa en basis points y se calcula sobre el activo o valor relevante.',
          'Los descuentos de comisión basados en cuenta no están confirmados como conectados en esta versión. Mantener como placeholder hasta implementar contrato y revisión de transacción.',
          'La revisión de transacción siempre muestra contexto, comisión fija, comisión porcentual, token de comisión y supuestos antes de firmar.',
        ],
        technicalTitle: 'Funciones relevantes',
        functions: [
          { name: 'getRoleFeeConfig(context)', description: 'Lee las comisiones maker/taker fijas y porcentuales activas para un contexto de trade.' },
          { name: 'getRoleFeeConfig(context)', description: 'Use getFeeForAccount para previsualizar descuentos de token y cuenta para una orden específica.' },
          { name: 'getFeeForAccount(paymentToken, assetToken, assetValue, context, account, isMaker)', description: 'Devuelve importes de comisión maker/taker para revisión de transacción.' },
          { name: 'getAcceptedPaymentTokens()', description: 'Lee los tokens de comisión aceptados actualmente.' },
          { name: 'sethxDiscountBps()', description: 'Lee el descuento SETHX activo en basis points.' },
        ],
        ratesTitle: 'Tasas reales de trading',
        ratesIntro: 'Este popup lee la configuración activa de FeeManager para todos los contextos actuales de comisiones de trading.',
        refreshRates: 'Actualizar tasas',
        ratesLoading: 'Cargando tasas activas...',
        ratesLoaded: 'Tasas activas cargadas.',
        ratesError: 'No se pudieron cargar las tasas. Revisa la red o el provider configurado.',
        ratesColumns: { trade: 'Trade', context: 'Contexto de comisión', payment: 'Token de pago', fixed: 'Comisión fija', percentage: 'Comisión porcentual', source: 'Fuente' },
        ratesSourceContract: 'Lectura FeeManager',
        ratesSourcePending: 'Pendiente',
        feePageCta: 'Ver tasas activas',
      },
      tokenSpot: {
        kicker: 'Token Spot',
        title: 'Los mercados token spot permiten negociar tokens ERC20 mediante un orderbook.',
        description: 'Token Spot es el mercado de orderbook ERC20 en sethx.com. Los usuarios pueden crear órdenes, completar órdenes existentes, cancelar órdenes abiertas y revisar saldos, comisiones y efectos en el vault antes de confirmar un trade.',
        detailsTitle: 'Cómo funciona token spot',
        details: [
          'Un mercado token spot tiene un token base y un token de cotización. Los usuarios pueden crear órdenes para intercambiar un token ERC20 por otro mediante el token spot orderbook.',
          'La cuenta SETHX seleccionada se usa para la acción. Sethx.com muestra saldos de la cuenta, importes disponibles, saldos bloqueados, detalles de la orden, comisiones y revisión de transacción antes de confirmar.',
          'Crear una orden bloquea el importe ofrecido y cualquier comisión requerida. Completar una orden transfiere los tokens acordados entre usuarios y deduce las comisiones.',
          'Cancelar una orden abierta libera cualquier importe bloqueado no usado hacia la cuenta SETHX seleccionada.',
          'En "My Tokens", el usuario puede ver los saldos por token y su valor en USD si está disponible. Los tokens se clasifican como main, whitelisted y other. Los tokens whitelisted son los tokens principales de confianza con direcciones confirmadas.',
        ],
        technicalTitle: 'Funciones relevantes',
        functions: [
          { name: 'getMarkets(), market reads', description: 'Lee mercados token spot configurados, tokens base/cotización, estado del mercado, estado del orderbook y datos de visualización.' },
          { name: 'placeOrder(...)', description: 'Crea una orden token spot para la cuenta SETHX seleccionada y bloquea el importe ofrecido según los términos de la orden.' },
          { name: 'acceptOrder(...)', description: 'Acepta o completa una orden token spot existente después de que sethx.com prepare la revisión de transacción y la vista previa de comisiones.' },
          { name: 'cancelOrder(...)', description: 'Cancela una orden token spot abierta y libera saldos bloqueados no usados según las reglas del orderbook.' },
          { name: 'FeeManager + Vault reads', description: 'Lee configuración de comisiones, efectos del token de comisión elegido, saldos disponibles y saldos bloqueados antes de confirmar.' },
        ],
      },
      nftSpot: {
        kicker: 'NFT Spot',
        title: 'Los mercados NFT spot permiten negociar NFTs mediante un orderbook.',
        description: 'NFT Spot es el mercado de orderbook NFT en sethx.com. Los usuarios pueden crear asks para NFTs que poseen, crear bids con un token de cotización, completar órdenes existentes, cancelar órdenes abiertas y revisar propiedad, saldos, comisiones y efectos en el vault antes de confirmar un trade.',
        detailsTitle: 'Cómo funciona NFT spot',
        details: [
          'Un mercado NFT spot conecta una colección NFT con un token de cotización. Las órdenes pueden apuntar a un token ID específico o a términos de mercado definidos por el NFT spot orderbook.',
          'La cuenta SETHX seleccionada se usa para la acción. Sethx.com muestra propiedad del NFT, saldos del token de cotización, importes disponibles, saldos bloqueados, detalles de la orden, comisiones y revisión de transacción antes de confirmar.',
          'Crear un ask bloquea o reserva el NFT según los términos de la orden. Crear un bid bloquea el importe ofrecido en el token de cotización y cualquier comisión requerida.',
          'Completar una orden NFT spot transfiere el NFT y los tokens de cotización entre usuarios y deduce las comisiones. En el flujo actual del contrato, ambas partes bloquean presupuestos de comisión y las comisiones se cobran según su lado de la orden y el fill.',
          'Cancelar una orden NFT spot abierta libera cualquier NFT o importe de token de cotización bloqueado no usado hacia la cuenta SETHX seleccionada.',
          'En el espacio NFT, los usuarios pueden revisar colecciones disponibles, bids y asks del mercado seleccionado, NFTs propios y sus propias órdenes NFT spot abiertas.',
        ],
        technicalTitle: 'Funciones relevantes',
        functions: [
          { name: 'getMarkets(), market reads', description: 'Lee mercados NFT spot configurados, dirección de la colección NFT, token de cotización, estado del mercado, estado del orderbook y datos de visualización.' },
          { name: 'placeOrder(...)', description: 'Crea un bid o ask NFT spot para la cuenta SETHX seleccionada y bloquea el NFT o importe de token de cotización ofrecido según los términos de la orden.' },
          { name: 'acceptOrder(...)', description: 'Acepta o completa una orden NFT spot existente después de que sethx.com prepare verificaciones de propiedad, revisión de transacción y vista previa de comisiones.' },
          { name: 'cancelOrder(...)', description: 'Cancela una orden NFT spot abierta y libera activos bloqueados no usados según las reglas del orderbook.' },
          { name: 'FeeManager + Vault reads', description: 'Lee configuración de comisiones, efectos del token de comisión elegido, propiedad NFT, saldos disponibles y saldos bloqueados antes de confirmar.' },
        ],
      },
      futures: {
        kicker: 'Futuros',
        title: 'Los mercados de futuros permiten crear exposición long o short con margen.',
        description: 'Los futuros en sethx.com son mercados de orderbook para exposición direccional. Los usuarios pueden crear órdenes buy o sell, hacer match con liquidez existente, gestionar margen, revisar comisiones y liquidar exposición mediante la cuenta SETHX seleccionada.',
        detailsTitle: 'Cómo funcionan los futuros',
        details: [
          'Un mercado de futuros se identifica por un market key y usa una fuente de precio de liquidación. Los usuarios expresan intención con órdenes buy o sell que pueden abrir, reducir o cerrar exposición long y short.',
          'El token de pago y margen para futuros siempre es ETH. La cuenta SETHX seleccionada debe tener suficiente ETH disponible para cubrir margen, buffers y comisiones antes de confirmar una operación.',
          'Crear una orden de futuros puede bloquear margen, un buffer de movimiento de precio y comisiones. El matching crea o cambia exposición de futuros y cobra comisiones según el importe completado.',
          'Cancelar una orden abierta libera los importes bloqueados no usados de esa orden. El margen que ya soporta una posición activa sigue gestionado por el contrato de futuros y las reglas de liquidación.',
          'Los usuarios pueden añadir margen para sostener una posición de futuros abierta o liberar margen excedente cuando el contrato lo permite.',
          'El margen inicial es el colateral necesario para abrir o aumentar exposición de futuros. El margen mínimo o de mantenimiento es el umbral de seguridad inferior usado para determinar si una posición tiene suficiente colateral para seguir activa.',
        ],
        technicalTitle: 'Funciones relevantes',
        functions: [
          { name: 'placeOrderFutures(orderBook, marketKey, side, price, amount, expiry, feeToken)', description: 'Función a nivel de cuenta que envía una orden de futuros mediante la cuenta SETHX seleccionada.' },
          { name: 'cancelOrderFutures(orderBook, orderId)', description: 'Cancela una orden de futuros abierta y libera saldos bloqueados no usados a nivel de orden.' },
          { name: 'addFuturesMargin(futuresContract, marketKey, isLong, amount)', description: 'Añade margen a una posición de futuros long o short existente.' },
          { name: 'releaseFuturesMargin(futuresContract, marketKey, isLong)', description: 'Solicita liberar margen excedente cuando el contrato de futuros calcula que se puede liberar.' },
          { name: 'FeeManager + Vault reads', description: 'Lee configuración de comisiones, pago de comisión en ETH, saldos disponibles, colateral bloqueado e impacto de margen antes de confirmar.' },
        ],
        mechanicsTitle: 'Mecánica detallada',
        mechanics: [
          { title: 'Cómo se negocian los futuros', description: 'Un usuario negocia futuros eligiendo mercado, lado, precio, cantidad y vencimiento mediante una cuenta SETHX seleccionada. El pago y el margen de futuros siempre son en ETH. Abrir o aumentar exposición requiere margen: se bloquea colateral para soportar la posición long o short, y la orden también puede bloquear comisiones y un buffer de movimiento de precio antes del matching.' },
          { title: 'Dependencia del oráculo', description: 'Cada mercado de futuros depende de un oráculo de precio de liquidación aprobado. PriceManager debe considerar el oráculo aprobado, habilitado para liquidación de futuros, activo y no stale antes de que sea usable.' },
          { title: 'Oráculo stale', description: 'Si el oráculo queda stale o no usable, las operaciones de futuros que requieren un oráculo activo pueden bloquearse, y la lógica de liquidación puede cerrar el mercado a nueva exposición hasta que el oráculo vuelva a ser usable.' },
          { title: 'Modelo de liquidación', description: 'Las posiciones de futuros se referencian al último precio de liquidación del mercado. La liquidación actualiza el precio índice del mercado y aplica PnL por rondas; los trades pueden cambiar exposición sin realizar inmediatamente todo el PnL.' },
          { title: 'Margen y liquidación forzosa', description: 'El contrato registra margen de posición y margen por unidad. El margen vivo se evalúa frente al movimiento del mark price y requisitos de mantenimiento. Las posiciones que quedan infracolateralizadas después de la liquidación se liquidan automáticamente; el margen restante se pierde y se añade al buffer de liquidación.' },
          { title: 'Desequilibrio long y short', description: 'Cuando el open interest long y short no está equilibrado, el sistema registra la diferencia como desequilibrio de mercado. La liquidación puede usar el buffer de desequilibrio para cubrir ganancias debidas que no están cubiertas por pérdidas del lado perdedor, y el orderbook puede exponer liquidez sintética para que los usuarios operen contra el exceso long o short.' },
        ],
      },
      options: {
        kicker: 'Opciones',
        title: 'Los mercados de opciones permiten operar calls y puts con vencimiento, strike, prima y reglas de colateral.',
        description: 'Las opciones en sethx.com son mercados de orderbook para exposición de riesgo definido. Los usuarios pueden comprar opciones, vender opciones mantenidas, escribir nueva exposición de opciones, completar órdenes existentes, cancelar órdenes abiertas, ejercer posiciones in-the-money y reclamar colateral vencido del writer mediante la cuenta SETHX seleccionada.',
        detailsTitle: 'Cómo funcionan las opciones',
        details: [
          'Un mercado de opciones se define por tipo de opción, token de activo, token de cotización, precio strike y vencimiento de la opción. Las calls dan exposición al alza del activo; las puts dan exposición a la baja relativa al strike.',
          'El token de pago para opciones siempre es ETH para primas y comisiones. La excepción es el colateral de una call, donde el writer entrega o bloquea el token subyacente cuando la estructura de la call requiere entrega del subyacente.',
          'Los compradores pagan una prima por la opción. Los writers aportan colateral para que la opción pueda cumplirse si se ejerce según las reglas de la opción.',
          'Crear una orden puede bloquear prima, colateral del writer y presupuestos de comisión según la intención de la orden. Completar una orden transfiere la prima, actualiza la exposición de opciones y deduce comisiones cuando aplica.',
          'Cancelar una orden abierta libera prima, colateral o presupuestos de comisión bloqueados no usados para esa orden.',
          'Los holders solo pueden ejercer opciones elegibles durante la ventana de ejercicio. Después del vencimiento, los writers pueden reclamar colateral no usado según las reglas del contrato.',
        ],
        technicalTitle: 'Funciones relevantes',
        functions: [
          { name: 'placeOrderOption(orderBook, optionType, assetToken, quoteToken, strikePrice, optionExpiry, orderExpiry, feeToken, intent, size, askPrice)', description: 'Función a nivel de cuenta que envía una orden de opciones mediante la cuenta SETHX seleccionada.' },
          { name: 'acceptOrderOption(orderBook, makerOrderId, amount, feeToken)', description: 'Acepta o completa una orden de opciones existente después de que sethx.com prepara la revisión de transacción y la vista previa de comisiones.' },
          { name: 'cancelOrderOption(orderBook, orderId)', description: 'Cancela una orden de opciones abierta y libera saldos bloqueados no usados para esa orden.' },
          { name: 'exercise(marketKey, size)', description: 'Ejercita exposición de opciones elegible cuando las reglas del contrato de opciones lo permiten.' },
          { name: 'reclaimExpired(marketKey)', description: 'Reclama colateral disponible del writer después del vencimiento cuando el contrato lo permite.' },
          { name: 'FeeManager + Vault reads', description: 'Lee configuración de comisiones, pago de comisión en ETH, saldos disponibles, saldos bloqueados, impacto de prima y requisitos de colateral antes de confirmar.' },
        ],
        mechanicsTitle: 'Mecánica detallada',
        mechanics: [
          { title: 'Calls y puts', description: 'Una call da al holder exposición a comprar o recibir valor cuando el activo está por encima del strike. Una put da exposición cuando el activo está por debajo del strike. La lógica exacta de transferencia y payout sigue el contrato de opciones.' },
          { title: 'Prima y colateral del writer', description: 'La prima es el precio pagado por el comprador de la opción para entrar en la posición. Un writer bloquea colateral para respaldar la obligación: los writers de calls pueden requerir colateral en el activo, mientras que los writers de puts pueden requerir colateral en token de cotización según tamaño y strike.' },
          { title: 'Intenciones de orden', description: 'El orderbook soporta distintas intenciones como comprar opciones, vender opciones mantenidas, escribir opciones y vender exposición de writer. Sethx.com prepara la intención elegida para que el usuario vea qué se paga, bloquea, recibe o libera antes de firmar.' },
          { title: 'Vencimiento, ejercicio y reclaim', description: 'Las opciones usan un vencimiento. Los holders solo pueden ejercer exposición elegible durante la ventana de ejercicio correspondiente. Después del vencimiento, el colateral de writer no usado puede reclamarse según las reglas del contrato.' },
          { title: 'Comisiones y efectos en el vault', description: 'Las operaciones de opciones pueden bloquear prima, colateral e importes de comisión antes de firmar. La revisión de transacción muestra el contexto de comisión, pago de comisión en ETH, comisión fija y porcentual, y los saldos que se usarán o bloquearán.' },
        ],
      },
      binaryOptions: {
        kicker: 'Opciones binarias',
        title: 'Los mercados de opciones binarias permiten operar exposición de resultado fijo con pago y margen en ETH.',
        description: 'Las opciones binarias en sethx.com son mercados de orderbook liquidados en ETH alrededor de una condición, strike y vencimiento definidos. Los usuarios pueden comprar exposición de payout, escribir exposición con margen, completar órdenes existentes, cancelar órdenes abiertas, reclamar payout ganador y reclamar margen de writer no usado mediante la cuenta SETHX seleccionada.',
        detailsTitle: 'Cómo funcionan las opciones binarias',
        details: [
          'Un mercado de opciones binarias define una condición como por encima o por debajo de un strike al vencimiento. El mercado paga a holders elegibles cuando la condición es verdadera según la regla de settlement.',
          'El token de pago siempre es ETH. Los compradores bloquean la prima que pagan por exposición de payout, mientras los writers bloquean margen en ETH para respaldar la obligación de payout.',
          'Crear una orden puede bloquear prima, margen del writer e importes de comisión según la intención. Completar una orden transfiere la prima, actualiza la exposición de payout y deduce comisiones cuando aplica.',
          'Cancelar una orden de opción binaria abierta libera prima, margen del writer o presupuestos de comisión no usados para esa orden.',
          'Después del settlement, los holders ganadores pueden reclamar payout y los writers pueden reclamar margen no usado según las reglas del contrato de opciones binarias.',
        ],
        technicalTitle: 'Funciones relevantes',
        functions: [
          { name: 'placeOrderBinaryMarginOption(orderBook, marketKey, intent, payoutAmount, askPrice, expiry, feeToken)', description: 'Función a nivel de cuenta que envía una orden de opción binaria mediante la cuenta SETHX seleccionada.' },
          { name: 'acceptOrderBinaryMarginOption(orderBook, makerOrderId, payoutAmount, feeToken)', description: 'Acepta o completa una orden de opción binaria existente después de que sethx.com prepara la revisión de transacción y vista previa de comisiones.' },
          { name: 'cancelOrderBinaryMarginOption(orderBook, orderId)', description: 'Cancela una orden de opción binaria abierta y libera saldos bloqueados no usados para esa orden.' },
          { name: 'claimBinaryMarginOption(binaryContract, marketKey, payoutAmount)', description: 'Reclama payout elegible de opción binaria después de que el mercado se haya liquidado.' },
          { name: 'reclaimWriterBinaryMarginOption(binaryContract, marketKey)', description: 'Reclama margen disponible del writer después del settlement cuando el contrato lo permite.' },
          { name: 'FeeManager + Vault reads', description: 'Lee configuración de comisiones, saldos ETH, ETH bloqueado, exposición de payout, impacto de prima y requisitos de margen del writer antes de confirmar.' },
        ],
        mechanicsTitle: 'Mecánica detallada',
        mechanics: [
          { title: 'Resultado binario', description: 'Las opciones binarias no pagan un importe variable según cuánto se mueve el precio. Se resuelven a un resultado definido: la condición es verdadera o falsa en settlement.' },
          { title: 'Prima y margen del writer', description: 'El comprador paga una prima en ETH por posible payout. El writer bloquea margen en ETH para respaldar el payout si gana la exposición compradora.' },
          { title: 'Intenciones de orden', description: 'El orderbook soporta intenciones como comprar exposición de payout, vender payout mantenido y escribir exposición de payout. Sethx.com prepara la intención elegida para que el usuario vea qué se paga, bloquea, recibe o libera antes de firmar.' },
          { title: 'Oráculo, vencimiento y settlement', description: 'El settlement depende de la condición del mercado, strike, vencimiento y fuente de precio configurada. Si los datos requeridos del oráculo no están disponibles o están stale, settlement o acciones de mercado pueden retrasarse o bloquearse hasta que los datos sean utilizables.' },
          { title: 'Claims y reclaim', description: 'Después del settlement, los holders elegibles reclaman payout. Los writers reclaman margen restante solo cuando las reglas del contrato lo permiten después de resolver las obligaciones de payout.' },
        ],
      },
      marginOptions: {
        kicker: 'Opciones con margen',
        title: 'Los mercados de opciones con margen permiten negociar exposición de opciones con colateral parcial del writer.',
        description: 'Las opciones con margen en sethx.com son mercados de orderbook liquidados en ETH para exposición de call o put donde los writers pueden bloquear margen en lugar de colateral nocional completo. Los usuarios pueden crear órdenes, llenar órdenes existentes, cancelar órdenes abiertas, reclamar payout elegible después del settlement y recuperar margen restante del writer mediante la cuenta SETHX seleccionada.',
        detailsTitle: 'Cómo funcionan las opciones con margen',
        details: [
          'Un mercado de opciones con margen se define por tipo de opción, oracle, token base, token de pago, strike, vencimiento y ratio de colateral. El token de pago es ETH para primas, tasas, margen, claims y reclaim.',
          'Los compradores pagan una prima en ETH por exposición de opción. Los writers bloquean margen en ETH según el ratio de colateral del mercado, por lo que el colateral del writer puede ser menor que el payout máximo posible.',
          'Crear una orden puede bloquear prima en ETH, margen del writer y presupuestos de tasa según la intención seleccionada. Llenar una orden transfiere la prima, actualiza la exposición de holder o writer y deduce tasas cuando aplique.',
          'Después del settlement, los holders elegibles pueden reclamar payout según el precio de settlement y el payout por unidad. Los writers pueden recuperar margen restante después de resolver obligaciones.',
          'El payout nunca supera el colateral bloqueado para la posición de opción con margen.',
          'Como el colateral del writer se basa en margen, el payout puede depender del margen disponible y del resultado del settlement. Sethx.com muestra prima, margen, tasas, vencimiento y efectos de claim o reclaim antes de confirmar.',
        ],
        technicalTitle: 'Funciones relevantes',
        functions: [
          { name: 'placeOrderMarginOption(orderBook, marketKey, intent, size, askPrice, expiry, feeToken)', description: 'Función a nivel de cuenta que envía una orden de opción con margen mediante la cuenta SETHX seleccionada.' },
          { name: 'acceptOrderMarginOption(orderBook, makerOrderId, amount, feeToken)', description: 'Acepta o llena una orden existente después de que sethx.com prepara la revisión de transacción y vista previa de tasas.' },
          { name: 'cancelOrderMarginOption(orderBook, orderId)', description: 'Cancela una orden abierta y libera saldos bloqueados no usados para esa orden.' },
          { name: 'claimMarginOption(marginContract, marketKey, size)', description: 'Reclama payout elegible después de que el mercado ha sido liquidado.' },
          { name: 'reclaimWriterMarginOption(marginContract, marketKey)', description: 'Recupera margen restante del writer después del settlement cuando el contrato lo permite.' },
          { name: 'getRequiredMargin(marketKey, size), getPayoutPerUnit(marketKey)', description: 'Lee requisitos de margen y valores de payout de settlement usados para la revisión de transacción y visualización de posiciones.' },
        ],
        mechanicsTitle: 'Mecánica detallada',
        mechanics: [
          { title: 'Exposición de opción con margen', description: 'Las opciones con margen se parecen a la exposición de opciones normal, pero el margen del writer se calcula desde el ratio de colateral del mercado en lugar de bloquear siempre el valor nocional completo.' },
          { title: 'Pago y margen en ETH', description: 'Prima, tasas, margen del writer, payout del holder y reclaim del writer se manejan en ETH. La cuenta SETHX seleccionada debe tener suficiente ETH disponible antes de firmar.' },
          { title: 'Oracle y settlement', description: 'El mercado usa un oracle aprobado y un vencimiento configurado. Después del settlement, el precio de settlement determina si la exposición del holder tiene valor y qué payout por unidad puede reclamarse.' },
          { title: 'Reclaim del writer', description: 'Los writers solo pueden recuperar margen restante después del settlement y después de resolver las obligaciones de payout según las reglas del contrato.' },
          { title: 'Nota de riesgo', description: 'Como el colateral del writer es parcial, los usuarios deben revisar ratio de colateral, strike, vencimiento, estado de settlement, supuestos de payout y ETH bloqueado antes de firmar.' },
        ],
      },
      lending: {
        kicker: 'Préstamo',
        title: 'Los mercados de lending permiten suministrar ETH a borrowers mediante un orderbook on-chain.',
        description: 'El lending en sethx.com se organiza alrededor de ofertas de préstamo en ETH, cuentas de lending, reglas de colateral y repayment. Los lenders suministran capital mediante el orderbook de lending y los borrowers aceptan ofertas disponibles mediante cuentas orientadas a lending.',
        detailsTitle: 'Cómo funciona el lending',
        details: [
          'Un lender crea o fondea una oferta eligiendo tamaño, duración, términos de interés, risk tier y requisitos de colateral. El ETH disponible puede ser aceptado por borrowers mediante el orderbook.',
          'Las ofertas aceptadas se convierten en préstamos activos. El borrower recibe ETH utilizable mientras el colateral y el estado del préstamo permanecen conectados a la cuenta SETHX seleccionada.',
          'Los lenders no pagan comisiones de trading por suministrar liquidez. El diseño evita cobrar a los LPs porque los borrowers usan el ETH prestado para inversiones SETHX donde sí pueden aplicar comisiones de trading.',
          'Cuando un préstamo se repaga, el lender recibe principal e interés acordado según los términos. Si fallan las reglas de repayment o colateral, el préstamo puede pasar a liquidación.',
          'Sethx.com muestra términos de la orden, duración, importe aceptado, expectativas de colateral, estado de repayment y efectos en cuenta antes de confirmar acciones de lending.',
        ],
        technicalTitle: 'Funciones relevantes',
        functions: [
          { name: 'createLendingOffer(orderBook, amount, duration, rate, riskTier)', description: 'Crea una oferta de lending que borrowers pueden revisar y aceptar mediante el orderbook.' },
          { name: 'cancelLendingOffer(orderBook, offerId)', description: 'Cancela una oferta abierta y libera liquidez disponible no usada cuando el contrato lo permite.' },
          { name: 'fundLendingOffer(orderBook, offerId, amount)', description: 'Añade o suministra liquidez ETH a una oferta cuando el flujo de lending lo soporta.' },
          { name: 'claimLendingRepayment(lendingContract, loanId)', description: 'Reclama principal, interés o importes de repayment disponibles para el lender.' },
          { name: 'getLendingOffer(offerId), getLoan(loanId)', description: 'View functions usadas por sethx.com para mostrar términos de oferta, estado del préstamo, repayment y riesgo.' },
        ],
        mechanicsTitle: 'Mecánica detallada',
        mechanics: [
          { title: 'Lending por orderbook', description: 'El lending usa un flujo estilo orderbook: lenders publican capital y términos, y borrowers aceptan las ofertas que encajan con su cuenta, colateral y riesgo.' },
          { title: 'Posición del lender', description: 'La posición del lender es principalmente un derecho a recibir ETH: tras la aceptación, espera repayment, interés, settlement o liquidación según los términos.' },
          { title: 'Sin comisión para LPs', description: 'El lado lender está diseñado para que proveedores de liquidez no paguen comisiones de trading por poner capital disponible. El borrower puede pagar comisiones cuando invierte fondos prestados en mercados SETHX.' },
          { title: 'Visibilidad de riesgo', description: 'Los lenders deben revisar duración, risk tier, reglas de colateral, estado activo/desactivado, supuestos de liquidación y repayment antes de suministrar capital.' },
        ],
      },
      borrowing: {
        kicker: 'Borrowing',
        title: 'Borrowing permite acceder a ETH mediante cuentas de lending restringidas por colateral y reglas de riesgo.',
        description: 'El borrowing en sethx.com ocurre mediante cuentas SETHX orientadas a lending. El borrower acepta una oferta del orderbook y la cuenta queda restringida por LTV, risk tier, colateral, repayment y reglas de liquidación.',
        detailsTitle: 'Cómo funciona el borrowing',
        details: [
          'Un borrower usa una cuenta SETHX de lending para aceptar una oferta disponible. Los términos definen cuánto ETH se pide prestado, expectativas de repayment, duración y risk tier.',
          'El ETH prestado puede usarse para inversiones SETHX, pero la cuenta está restringida según LTV, colateral, risk tier y estado activo del préstamo.',
          'El colateral debe permanecer suficiente mientras el préstamo esté activo. Si la colateralización cae por debajo de los niveles requeridos, la cuenta puede ser liquidada.',
          'Los borrowers repagan principal e interés acordado según los términos. El repayment libera restricciones cuando se cumplen las reglas del contrato.',
          'Sethx.com muestra importe prestado, colateral, LTV, risk tier, obligaciones de repayment, riesgo de liquidación y efectos de transacción antes de firmar.',
        ],
        technicalTitle: 'Funciones relevantes',
        functions: [
          { name: 'acceptLendingOffer(orderBook, offerId, amount)', description: 'Acepta una oferta disponible y crea o actualiza el estado del préstamo borrower mediante la cuenta SETHX seleccionada.' },
          { name: 'repayLoan(lendingContract, loanId, amount)', description: 'Repaga principal e interés según los términos y libera restricciones cuando el préstamo se resuelve completamente.' },
          { name: 'addCollateral(lendingContract, loanId, token, amount)', description: 'Añade colateral para mejorar el LTV y reducir riesgo de liquidación cuando el flujo lo soporta.' },
          { name: 'liquidateLoan(lendingContract, loanId)', description: 'Liquida un préstamo undercollateralized cuando las reglas del contrato permiten liquidación.' },
          { name: 'getLoanHealth(loanId), getLtv(loanId), getRiskTier(loanId)', description: 'View functions usadas para mostrar restricciones, LTV, risk tier, colateralización y estado de liquidación.' },
        ],
        mechanicsTitle: 'Mecánica detallada',
        mechanics: [
          { title: 'Acciones restringidas', description: 'Borrowing es account-based. Una cuenta orientada a lending puede quedar restringida mientras la deuda está activa, por lo que sethx.com previene o advierte sobre acciones que chocan con LTV, colateral, risk tier o reglas del préstamo.' },
          { title: 'LTV y risk tier', description: 'Loan-to-value compara valor prestado con valor del colateral. El risk tier define límites, acciones aceptadas y umbrales de liquidación.' },
          { title: 'Repayment', description: 'El repayment devuelve ETH prestado más interés acordado. Cuando el préstamo está totalmente repagado y las validaciones pasan, colateral y restricciones pueden liberarse según las reglas.' },
          { title: 'Liquidación', description: 'Si la cuenta queda undercollateralized, la liquidación puede tomar colateral o resolver el préstamo según las reglas del contrato. Los usuarios deben monitorizar LTV y colateral antes de invertir fondos prestados.' },
        ],
      },

      miscellaneous: {
        kicker: 'Misceláneo',
        title: 'Otros elementos que conviene entender antes de firmar transacciones.',
        description: 'Algunas partes importantes de sethx.com no son un mercado por sí mismas, pero afectan muchas acciones: aprobaciones de wallet, lecturas live, estado de mercado, datos de oráculo, ajustes de gobernanza y revisión de transacción. Esta sección reúne esos puntos transversales.',
        detailsTitle: 'Puntos a tener en cuenta',
        details: [
          'Las aprobaciones de wallet son distintas de confirmar una operación. Para ERC20 y NFTs, el usuario puede necesitar aprobar permisos antes de que sethx.com prepare la acción de mercado.',
          'Los mercados pueden estar habilitados, deshabilitados, pausados, vencidos, liquidados o con datos stale. Sethx.com debe mostrar esos estados antes de preparar una acción.',
          'Los datos de oráculo y precios se usan para valores en USD, settlement, controles de riesgo, LTV, cálculos de margen y algunas suposiciones de comisión. Si los datos relevantes están stale o no disponibles, las acciones pueden bloquearse o mostrar advertencias.',
          'La gobernanza puede cambiar mercados, comisiones, risk tiers, activos permitidos, oráculos y otros parámetros. Los usuarios deben confiar en lecturas actuales antes de firmar.',
          'La revisión de transacción es el último punto de control del usuario. Debe mostrar cuenta, acción, mercado, importes, comisiones, bloqueos, liberaciones, supuestos y advertencias de riesgo conocidas antes de firmar.',
        ],
        technicalTitle: 'Referencias relevantes',
        functions: [
          { name: 'ERC20 approve(token, spender, amount)', description: 'Aprobación desde la wallet que puede requerirse antes de que tokens puedan depositarse, bloquearse o moverse por el flujo seleccionado.' },
          { name: 'ERC721/ERC1155 approvals', description: 'Aprobaciones NFT u operator approvals que pueden requerirse antes de que NFT Spot pueda bloquear o transferir un NFT.' },
          { name: 'market status reads', description: 'View functions usadas por sethx.com para decidir si un mercado está abierto, pausado, settled, vencido o no disponible.' },
          { name: 'PriceManager / oracle reads', description: 'Lecturas usadas para precios de settlement, valores en USD, controles de riesgo, margen, LTV y advertencias de datos stale.' },
          { name: 'governance parameter reads', description: 'Lecturas usadas para mostrar comisiones actuales, ajustes de riesgo, activos permitidos, tokens de comisión aceptados y parámetros de mercado.' },
        ],
        mechanicsTitle: 'Notas detalladas',
        mechanics: [
          { title: 'Aprobaciones y firmas', description: 'Una aprobación da permiso a un contrato para usar un token o NFT; confirmar una operación firma la acción de mercado. Sethx.com debe separar esos pasos claramente.' },
          { title: 'Lecturas live y vistas en caché', description: 'Las páginas públicas explican conceptos, pero saldos, comisiones, estado de mercado, oráculos y controles de riesgo deben venir de lecturas live cuando sea posible.' },
          { title: 'Cambios de mercado y parámetros', description: 'Los mercados SETHX son configurables. Un mercado, comisión, risk tier o regla de oráculo puede cambiar, por lo que la revisión de transacción debe usar el ajuste activo.' },
          { title: 'Responsabilidad del usuario', description: 'Sethx.com prepara información clara de transacción, pero los usuarios siguen siendo responsables de revisar la wallet, entender el riesgo y decidir si firman.' },
        ],
      },



    },
    feeRates: {
      kicker: 'Comisiones',
      title: 'Tasas activas desde FeeManager.',
      intro: 'SETHX está diseñado para comisiones de trading on-chain muy bajas. Esta página lee la configuración activa que usa sethx.com al preparar revisiones de transacciones. Las comisiones pueden cambiar por gobernanza, así que conviene usar las lecturas más recientes antes de firmar.',
      activeTitle: 'Lecturas actuales del contrato',
      activeIntro: 'Las comisiones fijas son importes brutos con 18 decimales. Las comisiones porcentuales son basis points: 10 bps equivale a 0,10%.',
      acceptedTokens: 'Tokens de comisión aceptados',
      sethxDiscount: 'Descuento SETHX',
      statusLoading: 'Cargando tasas activas...',
      statusLoaded: 'Tasas activas cargadas.',
      statusError: 'No se pudieron cargar las tasas. Revisa la red o el provider configurado.',
      refresh: 'Actualizar tasas',
      backToLibrary: 'Volver a la biblioteca',
      product: 'Producto',
      context: 'Contexto de comisión',
      fixedFee: 'Comisión fija',
      percentageFee: 'Comisión porcentual',
      source: 'Fuente',
      paymentToken: 'Token de pago',
      completeFeesCta: 'Conjunto de tarifas',
      pending: 'Conexión de producto pendiente',
      contractRead: 'Lectura FeeManager',
      notWired: 'Aún no hay contexto compartido de FeeManager',
      notesTitle: 'Cómo interpretar esta tabla',
      notes: [
        'La tabla muestra la configuración activa de FeeManager por contexto de producto. No es una cotización para una orden específica.',
        'La revisión final puede incluir conversión por oráculo, token de comisión seleccionado, valor del activo, saldo disponible, saldo bloqueado y reglas de liquidación.',
      ],
    },
    governance: { kicker: 'Gobernanza', title: 'La gobernanza es la capa de decisión para cambios del protocolo y acciones de tesorería.', intro: 'La gobernanza SETHX permite a votantes elegibles delegar poder de voto, revisar propuestas, votar y aprobar acciones del protocolo o tesorería mediante smart contracts transparentes. La página pública explica el proceso; la app conectada ofrece la app de transacción.', lifecycle: [{ title: 'Discutir', description: 'Revisión comunitaria, requisitos, análisis de riesgo, estimaciones de coste y señalización no vinculante antes de la presentación formal.' }, { title: 'Proponer', description: 'Wallets elegibles crean una propuesta con targets, values, calldata y una descripción clara de la acción prevista.' }, { title: 'Votar', description: 'Los votantes revisan el estado de la propuesta y emiten Against, For o Abstain durante la ventana activa.' }, { title: 'Ejecutar', description: 'Las propuestas aprobadas pueden pasar a ejecución mediante el governor o modelo timelock usado por los contratos desplegados.' }], scopeTitle: 'Alcance de la página de votación', scopeText: 'La página de gobernanza de la app soporta delegación, búsqueda de propuestas, votación y creación de propuestas para wallets elegibles. También muestra configuración del governor, direcciones de contratos, estado de propuesta, recuentos de votos y si la wallet conectada ya votó.', enterApp: 'Entrar app', votingModel: [{ title: 'SETHX en wallet', description: 'El SETHX líquido puede leerse directamente desde el contrato del token y delegarse mediante la app.' }, { title: 'SETHX dentro del protocolo', description: 'Los usuarios pueden mantener activos dentro de cuentas SETHX o vaults, por lo que el modelo final no debe ignorar SETHX depositado.' }, { title: 'Poder de voto efectivo', description: 'La app debe mostrar el poder de voto reconocido por los contratos de gobernanza y explicar claramente qué incluye.' }] },
    community: {
      kicker: 'Comunidad',
      title: 'Construyamos juntos el ecosistema SETHX.',
      intro: 'SETHX es más que una interfaz. Es un ecosistema de protocolo que puede crecer con traders, builders, analistas, holders, educadores, diseñadores, soporte, market makers y participantes de gobernanza. Esta página explica dónde puede ayudar la comunidad, cómo las ideas pueden convertirse en trabajo financiado y por qué la participación importa.',
      contributorPaths: [
        ['Trade & Report', 'Usa la interfaz, reporta problemas, sugiere mejoras de mercado y ayuda a que la app sea más segura y clara.'],
        ['Build & integrate', 'Crea dashboards, monitores, bots, analítica, interfaces alternativas, automatización, integraciones y herramientas por producto.'],
        ['Research & educate', 'Publica revisiones de riesgo, explicaciones de mercado, tutoriales, traducciones, análisis de comisiones, resúmenes de gobernanza e investigación.'],
        ['Govern & grow', 'Mantén SETHX, revisa propuestas, señala prioridades, vota cuando seas elegible, presenta contribuidores y ayuda a tomar mejores decisiones.'],
      ],
      sectionIntroTitle: 'Cuatro formas prácticas de contribuir',
      sectionIntroText: 'El primer objetivo es que las rutas de contribución sean claras. Algunas personas probarán el producto, otras construirán alrededor de él, otras lo explicarán y otras ayudarán a gobernarlo. Las cuatro rutas pueden crear valor para el protocolo cuando se coordinan con transparencia.',
      ideasTitle: 'Oportunidades de contribución',
      initiatives: [
        'Monitoreo de orderbooks, comisiones, tesorería, contratos y salud del protocolo',
        'Dashboards de riesgo para colateral, exposición de liquidación, estado de oráculos, vencimientos, saldos de vault y salud de cuentas',
        'Herramientas por producto para token spot, NFT spot, futures, opciones vanilla, opciones binarias, margin options, lending y borrowing',
        'Herramientas de gobernanza para revisión de propuestas, voto delegado, explicaciones de voto, quórum y visibilidad de pagos de tesorería',
        'Contenido educativo, onboarding, traducciones, tutoriales, videos explicativos, FAQs, guías de mercado y soporte',
        'Exportaciones públicas de datos, APIs de analítica, recursos para market makers, datasets de investigación, alertas y dashboards independientes',
      ],
      fundingTitle: 'Contribuciones financiadas por el protocolo',
      fundingText: 'SETHX puede otorgar ETH por contribuciones útiles cuando el trabajo es revisado y aprobado mediante el proceso de tesorería del protocolo. El sitio sethx.com es un ejemplo de trabajo financiado por el protocolo: la interfaz es financiada por el protocolo para que los usuarios tengan un lugar claro conectado a wallet para descubrir mercados, gestionar cuentas, revisar transacciones, entender riesgo y participar en gobernanza.',
      fundingCards: [
        { title: 'Grants en ETH', description: 'Los contribuidores pueden solicitar ETH por trabajo, servicios, mantenimiento, investigación, contenido, soporte o integraciones que beneficien a SETHX.' },
        { title: 'Aprobación de gobernanza', description: 'El trabajo remunerado debe pasar por revisión comunitaria y gobernanza formal para evaluar alcance, presupuesto, riesgo de entrega e impacto en tesorería.' },
        { title: 'Responsabilidad pública', description: 'Hitos, entregables, condiciones de pago y seguimiento deben ser fáciles de inspeccionar por la comunidad.' },
      ],
      contributionTitle: 'De idea a trabajo financiado',
      contributionSteps: [
        { title: 'Comparte la idea', description: 'Describe el problema, los usuarios objetivo, el beneficio esperado y por qué el trabajo ayuda al protocolo o a la comunidad SETHX.' },
        { title: 'Define el alcance', description: 'Convierte la idea en entregables, hitos, calendario, mantenimiento, riesgos y un presupuesto solicitado en ETH.' },
        { title: 'Invita revisión', description: 'Permite que traders, builders, holders y miembros atentos al riesgo cuestionen supuestos antes de una propuesta formal.' },
        { title: 'Pasa por gobernanza', description: 'Cuando el alcance está maduro, la gobernanza puede decidir si la tesorería debe otorgar ETH y bajo qué condiciones.' },
      ],
      principlesTitle: 'Principios de comunidad',
      principles: [
        { title: 'Útil antes que ruidoso', description: 'Prioriza trabajo que mejore materialmente la interfaz, datos del protocolo, gobernanza, revisión de riesgo o educación.' },
        { title: 'Transparente por defecto', description: 'Mantén propuestas, presupuestos, entregables, notas de riesgo y pagos comprensibles para holders de SETHX.' },
        { title: 'Interfaz, no custodio', description: 'SETHX.COM ayuda a interactuar con smart contracts compatibles; los usuarios siguen siendo responsables de las transacciones que firman.' },
      ],
      votingTitle: 'Votación de ideas comunitarias',
      ideaFlow: [
        'Cualquiera puede sugerir una idea públicamente.',
        'Wallets conectadas pueden discutir, refinar y señalar apoyo.',
        'La señalización de holders de SETHX puede ayudar a priorizar antes de una propuesta formal.',
        'El trabajo financiado requiere revisión de gobernanza y aprobación de tesorería antes de otorgar ETH.',
      ],
      votingText: 'La señalización de ideas ayuda a priorizar, pero no reemplaza la gobernanza. El trabajo financiado por tesorería debe pasar por propuesta y votación para revisar alcance, presupuesto, riesgo, responsabilidad y beneficio esperado para el protocolo.',
      ctaTitle: 'Sé parte del éxito de SETHX',
      ctaText: 'SETHX necesita personas dispuestas a probar, construir, explicar, gobernar e invitar a otros. Empieza con una idea útil, concreta el alcance y ayuda a convertir contribuciones valiosas en trabajo aprobado por el protocolo.',
      primaryCta: 'Abrir gobernanza',
      secondaryCta: 'Leer biblioteca',
    },
    risk: { kicker: 'Riesgo', title: 'Entiende los riesgos antes de usar SETHX.', intro: 'SETHX es una app conectada a wallet para interactuar con contratos on-chain desplegados. Los contratos desplegados definen el exchange y son la única fuente de verdad sobre lo que puede ocurrir. El usuario que acepta y firma una interacción contractual es responsable de entender la acción, la configuración activa y sus posibles consecuencias.', risks: [['Contratos como fuente de verdad', 'Los contratos desplegados, no el texto del sitio web, definen el exchange. Direcciones, permisos, parámetros, oráculos, reglas de settlement y reglas de liquidación son las reglas autoritativas cuando el usuario firma. Bugs o comportamiento inesperado pueden causar pérdidas.'], ['Riesgo de mercado', 'Criptoactivos, derivados, mercados de préstamo y valores de colateral pueden moverse rápido. Liquidaciones, vencimientos y resultados de settlement pueden diferir de lo esperado.'], ['Riesgo operativo', 'Algunas posiciones requieren acción en o antes del vencimiento. Los holders de opciones pueden perder derechos si no actúan durante la ventana de ejercicio. Quienes piden prestado o usan futuros deben monitorear el colateral, porque se puede activar una liquidación y causar pérdidas.'], ['Riesgo de oráculos y precios', 'Los productos que dependen de precios externos pueden verse afectados por feeds atrasados, manipulados o no disponibles.'], ['Riesgo de liquidez', 'Los orderbooks pueden tener poca actividad. Los usuarios podrían no entrar, salir, pedir prestado o cerrar posiciones al precio esperado.'], ['Riesgo de gobernanza y tesorería', 'Ajustes de SETHX, pagos de tesorería, activos, parámetros y permisos pueden cambiar tras aprobación de gobernanza.'], ['Riesgo jurisdiccional y de acceso', 'Algunas regiones pueden estar restringidas. La disponibilidad puede cambiar según requisitos legales, de compliance u operativos.']], adviceTitle: 'Sin asesoramiento financiero', adviceText: 'La app, los docs y el asistente pueden dar explicaciones de plataforma y educación general, pero no son asesoramiento financiero, legal, fiscal o de inversión personalizado. Los usuarios son responsables de sus decisiones y transacciones.' },
    cookies: { kicker: 'Cookies', title: 'Almacenamiento funcional primero. Analítica opcional solo con aprobación.', intro: 'SETHX usa almacenamiento funcional del navegador para preferencias y consentimiento. La analítica opcional permanece desactivada salvo que el usuario la acepte. Si se acepta, se limita a páginas vistas, Entrar app y conversión de conexión de wallet. La app no usa cookies publicitarias ni de seguimiento comercial.', cards: [{ title: 'Funcional', description: 'Idioma, versión de consentimiento y preferencias necesarias para operar el sitio correctamente.' }, { title: 'Analítica', description: 'La analítica solo puede habilitarse después de la aprobación y se limita a páginas vistas, Entrar app y conversión de conexión de wallet. Puede mostrar región/país aproximado en reportes agregados, pero SETHX no envía direcciones de wallet, cuentas seleccionadas, saldos, órdenes, transacciones, textos de ideas ni issues.' }, { title: 'Comercial', description: 'La app no usa cookies comerciales, publicitarias ni de marketing de terceros.' }], currentChoice: 'Tu elección actual', consentState: 'Estado de consentimiento:', accept: 'Aceptar analítica', decline: 'Rechazar analítica', reset: 'Restablecer elección' },
    privacy: { kicker: 'Privacidad', title: 'App pública centrada en wallet con almacenamiento funcional mínimo.', intro: 'SETHX debe recopilar solo lo necesario para operar el sitio público, recordar preferencias funcionales, proteger restricciones de acceso y soportar analítica de conversión opcional cuando se apruebe.', cards: [{ title: 'Datos de wallet', description: 'Una dirección de wallet conectada puede usarse para leer datos públicos on-chain y preparar transacciones.' }, { title: 'Almacenamiento local', description: 'Preferencia de idioma, consentimiento de cookies y ajustes de la app pueden almacenarse en el navegador.' }, { title: 'Analítica', description: 'La analítica de producto solo debe cargarse después de aprobación y limitarse a páginas vistas, Entrar app, conversión de conexión de wallet y reportes agregados de región/país aproximado. No debe incluir direcciones de wallet, cuentas seleccionadas, saldos, órdenes, transacciones, textos de ideas o issues, identificadores publicitarios ni tracking comercial.' }] },
    protocol: { kicker: 'Protocolo', title: 'Transparencia del protocolo e información de contratos desplegados.', intro: 'Esta página lee desde la configuración central del protocolo y la capa de lectura en vivo cuando está disponible. Úsala para verificar red, contratos, activos, comisiones, tesorería y gobernanza antes de interactuar con la app.', configuredNetwork: 'Red configurada', contracts: 'Contratos', configuredRecords: 'registros configurados', status: 'Estado', statusText: 'Leído desde SETHX data configurada. Verifica direcciones y parámetros antes de firmar transacciones.', liveKicker: 'Capa de lectura en vivo', liveTitle: 'Estado de protocolo solo lectura', refreshReads: 'Actualizar lecturas', acceptedPaymentTokens: 'Tokens de pago aceptados', trackedErc20Tokens: 'Tokens ERC20 registrados', directEthBalance: 'Balance ETH directo', governorSettings: 'Configuración del governor', loaded: 'Cargado', pending: 'Pendiente', acceptedFeeTokens: 'Tokens de comisión aceptados', noLiveFeeTokenList: 'Aún no se cargó una lista en vivo de tokens de comisión.', vaultTokenRegistry: 'Registro de tokens del vault', sethxFeeToken: 'Token de comisión SETHX', enabledAssets: 'Activos habilitados', enabledProducts: 'Productos habilitados', contract: 'Contrato', address: 'Dirección', configuredData: 'Datos configurados', liveData: 'Datos en vivo', contractDirectory: 'Directorio de contratos', vaultReadNote: 'El registro del vault lee listas ERC20 y ERC721 desde el contrato vault desplegado. ERC1155 se muestra como cero cuando el ABI del vault desplegado no expone una lectura de lista ERC1155.' },
    notFound: { title: 'Página no encontrada', body: 'La página solicitada no existe o se ha movido.', action: 'Ir al inicio' },
  },
  pt: {
    home: {
      access: { 'requires-wallet': 'Conecte uma wallet antes de abrir o app de trading.', 'country-restricted': 'O app está restrito na região detectada.', default: 'Sua wallet não tem o nível de acesso necessário para essa página.' }, eyebrow: 'SETHX.COM', heroLine1: 'Bem-vindo ao', heroLine2: 'seu hub para o', heroSmart: 'Smart', heroEthereum: 'ETHereum', heroExchangePrefix: 'eXchange', heroDescription: 'SETHX.COM é um app conectado a wallet para interagir com smart contracts compatíveis do protocolo SETHX. Ajuda os usuários a descobrir mercados, gerenciar contas SETHX, revisar detalhes de transações e negociar, entender riscos e participar da governança e da comunidade. Sethx.com não é custodiante, corretora nem exchange centralizada.', enterApp: 'Entrar no app', openLibrary: 'Abrir biblioteca', governance: 'Governança', connectWallet: 'Conecte uma wallet para entrar no app. A documentação pública continua disponível sem conexão.', walletConnected: 'Wallet conectada. Acesso ao app habilitado.', getStartedTitle: 'Começar', stepLabel: 'Passo', steps: ['Conecte uma wallet e confirme a rede antes de abrir o app.', 'Crie ou selecione uma conta do protocolo para o mercado que deseja usar.', 'Deposite ativos compatíveis quando quiser negociar, emprestar, tomar emprestado ou fornecer colateral.', 'Escolha um mercado, revise saldos, taxas, notas de risco e detalhes da transação.', 'Aprove apenas as transações que você entende e deseja assinar na sua wallet.'], participation: [{ title: 'Compre SETHX', description: 'Mantenha SETHX para construir poder de voto e participar da governança do protocolo.' }, { title: 'Vote e compartilhe ideias', description: 'Use a governança para apoiar propostas, sugerir melhorias e ajudar a definir prioridades do protocolo.' }, { title: 'Contribua para o ecossistema', description: 'Builders, escritores, analistas, designers e membros da comunidade podem contribuir e receber pagamentos do protocolo por trabalho aceito.' }, { title: 'Ajude a comunidade a crescer', description: 'Traga feedback útil, educação, parcerias e novos contribuidores para a comunidade SETHX. Entre em contato com SETHX.COM se quiser contribuir.' }], ownLine1: 'Tenha SETHX', ownLine2: 'Vote e Contribua', ownLine3: 'Faça a Comunidade Crescer', marketsKicker: 'Mercados SETHX', marketsTitle: 'Exchange on-chain com estruturas trad-fi', marketsIntro: 'SETHX.COM organiza o protocolo em três áreas claras de mercado: atividade spot, trading de derivativos e mercados de crédito para empréstimos.', markets: [{ kicker: 'Spot', title: 'Mercados spot', description: 'Negocie tokens e ativos NFT compatíveis por mercados em estilo orderbook, comparáveis às mesas spot de exchanges tradicionais onde compradores e vendedores se encontram a preços visíveis.' }, { kicker: 'Derivativos', title: 'Mercados de derivativos', description: 'Acesse futures, opções vanilla, opções binárias e margin options com fluxos de revisão estruturados, similares a venues de derivativos onde traders gerenciam exposição, vencimento, liquidação e colateral.' }, { kicker: 'Crédito', title: 'Mercados de crédito', description: 'Use mercados de lending e borrowing desenhados em torno de contas SETHX, colateral, empréstimos e bonds, comparáveis a mesas de crédito onde capital é fornecido, precificado e repago ao longo do tempo.' }], readMore: 'Ler mais →', libraryKicker: 'Biblioteca e governança', libraryTitle: 'Aprenda primeiro. Vote quando estiver pronto.', libraryButton: 'Abrir biblioteca', library: [{ title: 'Biblioteca', description: 'Documentação em linguagem simples para usuários, builders, traders, lenders e governadores.', link: '/docs' }, { title: 'Governança', description: 'Ciclo de propostas, delegação, poder de voto, decisões de tesouraria e mudanças de parâmetros do protocolo.', link: '/governance' }, { title: 'Protocolo', description: 'Rede, contratos configurados, ativos compatíveis, estado de leituras ao vivo e referências de transparência.', link: '/protocol' }], open: 'Abrir →',
    },
library: {
      kicker: 'Biblioteca',
      title: 'Biblioteca prática para contas SETHX, vault, taxas, mercados, lending, borrowing e risco.',
      intro: 'Use esta biblioteca como mapa guiado do sethx.com. Comece com contas, vault e taxas; depois siga para mercados spot, derivativos, lending, borrowing e itens gerais como aprovações, status de mercado, dados de oráculo e revisão de transações. Cada tópico combina explicação simples com referências técnicas opcionais.',
      navTitle: 'Comece aqui',
      close: 'Fechar',
      nav: [
        { label: 'Contas', title: 'Contas SETHX', description: 'Contas normais de trading, contas orientadas a margem, estado ativo/desativado, nomes e por que ações passam por uma conta.', target: 'accounts' },
        { label: 'Vault', title: 'Depósitos e bloqueio', description: 'Como depósitos, saques, saldos disponíveis, saldos bloqueados, ordens, margem, colateral e taxas se relacionam.', target: 'vault' },
        { label: 'Taxas', title: 'Taxas e cobrança', description: 'Taxas fixas, percentuais, tokens de taxa, contextos de produto e a página de taxas ativas.', target: 'fees' },
        { label: 'Spot', title: 'Token Spot', description: 'Como mercados token spot usam ordens, fills, cancelamentos, saldos, taxas e roteamento de conta.', target: 'token-spot' },
        { label: 'NFTs', title: 'NFT Spot', description: 'Como mercados NFT spot usam coleções NFT, token IDs, bids, asks, fills, cancelamentos, taxas e bloqueio no vault.', target: 'nft-spot' },
        { label: 'Futuros', title: 'Futuros', description: 'Como mercados de futuros usam exposição long e short, margem, matching de ordens, taxas, liquidação e liberação de margem.', target: 'futures' },
        { label: 'Opções', title: 'Opções', description: 'Como opções usam calls, puts, strikes, vencimento, prêmios, colateral do writer, exercício, reclaim e taxas.', target: 'options' },
        { label: 'Binárias', title: 'Opções binárias', description: 'Como opções binárias usam resultados sim/não, pagamento em ETH, valores de payout, margem do writer, settlement, claims e reclaim.', target: 'binary-options' },
        { label: 'Margem', title: 'Opções com margem', description: 'Como mercados de opções com margem usam exposição long e short, prêmio em ETH, margem parcial do writer, settlement, claims e reclaim.', target: 'margin-options' },
        { label: 'Lending', title: 'Lending', description: 'Como usuários fornecem ETH ao orderbook de lending, criam ofertas de empréstimo, gerenciam liquidez disponível e recebem repayment.', target: 'lending' },
        { label: 'Borrowing', title: 'Borrowing', description: 'Como usuários tomam empréstimos por contas de lending, colateral, LTV, níveis de risco, repayment e regras de liquidação.', target: 'borrowing' },
        { label: 'Misc', title: 'Miscelânea', description: 'Aprovações de wallet, status de mercado, dados de oracle, configurações de governança, leituras live e lembretes de segurança.', target: 'miscellaneous' },
      ],
      accounts: {
        kicker: 'Contas SETHX',
        title: 'As contas são a camada de usuário entre uma wallet e SETHX investments.',
        description: 'Uma wallet se conecta a sethx.com, mas ações de trading e lending são executadas por contas SETHX. Isso mantém ações, saldos, depósitos, saques, ordens, margem e colateral organizados por conta, não diretamente pela wallet. Páginas somente leitura podem consultar SETHX data pública sem criar ou selecionar uma conta.',
        detailsTitle: 'O que usuários devem saber',
        details: [
          'Uma conta normal de trading é usada para spot e derivativos como token spot, NFT spot, futures, options, binary options e margin options.',
          'Contas orientadas a margem ou lending permitem empréstimos pelo lending order book. Esse tipo de conta tem ações restritas com base no LTV e no nível de risco do empréstimo. Em caso de subcolateralização, a conta pode ser liquidada.',
          'Contas podem estar ativas ou desativadas. A desativação deve ocultar ou limitar o uso no app sem apagar histórico on-chain.',
          'Usuários podem renomear contas para que sethx.com mostre etiquetas amigáveis enquanto o sistema on-chain identifica a conta pelo endereço.',
          'Com exceção de funções de visualização, ações de produto são roteadas pela conta selecionada. Sethx.com gerencia isso para o usuário revisar um fluxo claro.',
        ],
        technicalTitle: 'Funções relevantes',
        functions: [
          { name: 'createAccount()', description: 'Cria uma conta SETHX normal para a wallet conectada via AccountFactory.' },
          { name: 'getAccounts(user), getNormalAccounts(user), getLendingAccounts(user)', description: 'Lê listas de contas no AccountRegistry para mostrar contas de uma wallet.' },
          { name: 'isAccount(account), isLendingAccount(account), setAccountActive(account, active)', description: 'Verifica e atualiza se uma conta está ativa ou desativada.' },
          { name: 'accountName(), setAccountName(name)', description: 'Lê e atualiza a etiqueta exibida para uma conta.' },
          { name: 'place / accept / cancel product order functions', description: 'Funções da conta enviam ações de mercado ao orderbook relevante após a revisão do usuário. Veja as seções de produto relevantes para mais detalhes.' },
        ],
      },
      vault: {
        kicker: 'Vault',
        title: 'O vault registra ativos depositados e separa saldos disponíveis dos saldos bloqueados.',
        description: 'Usuários depositam ETH ou tokens compatíveis quando querem negociar, emprestar, tomar emprestado, fornecer colateral, pagar taxas ou usar margem. Quando uma ordem, empréstimo ou posição de margem exige reserva de ativos, a SETHX pode bloquear esses ativos até cancelamento, preenchimento, liquidação, reclaim ou liberação.',
        detailsTitle: 'Modelo de saldos',
        details: [
          'Ativos depositados permanecem on-chain e associados à conta SETHX que fez o depósito.',
          'Saldos disponíveis podem ser usados em novas ações ou sacados quando as regras da SETHX permitirem.',
          'Saldos bloqueados representam ativos reservados para ordens abertas, colateral, margem, taxas ou liquidação.',
          'Quando uma ordem é cancelada ou uma posição é liquidada, qualquer valor bloqueado não usado é liberado.',
          'Sethx.com sempre mostra o que está disponível e o que será bloqueado antes de o usuário assinar uma transação.',
        ],
        technicalTitle: 'Funções relevantes',
        functions: [
          { name: 'depositETH(amount), withdrawETH(amount)', description: 'Ações de depósito e saque de ETH no nível da conta.' },
          { name: 'depositToken(token, amount), withdrawToken(token, amount)', description: 'Depósitos e saques ERC20 com gestão de allowance quando necessário.' },
          { name: 'getETHBalance(user), getLockedETHBalance(user)', description: 'Leituras do vault para saldos ETH livres e bloqueados.' },
          { name: 'getERC20Balance(user, token), getLockedERC20(user, token)', description: 'Leituras do vault para saldos de tokens livres e bloqueados.' },
          { name: 'lock / unlock / charge fee operations', description: 'Contratos de produto reservam ativos, liberam valores não usados e cobram taxas via vault.' },
        ],
      },
      fees: {
        kicker: 'Taxas',
        title: 'As taxas combinam uma parte fixa com uma parte percentual.',
        description: 'As taxas podem ser pagas em SETHX e ETH. O pagamento em SETHX oferece aproximadamente 50% de desconto sobre o valor da taxa em ETH. Para cada contexto de trade, o FeeManager retorna uma taxa fixa e uma taxa percentual. Sethx.com mostra as taxas reais antes de o usuário confirmar um trade.',
        detailsTitle: 'Como ler taxas',
        details: [
          'As taxas podem ser pagas em SETHX e ETH. O pagamento em SETHX oferece aproximadamente 50% de desconto sobre o valor da taxa em ETH.',
          'A taxa fixa é um valor base para o contexto de trade, normalmente no token de taxa selecionado.',
          'A taxa percentual é expressa em basis points e calculada sobre o ativo ou valor relevante.',
          'Descontos de taxa baseados em conta ainda não estão confirmados como conectados nesta versão. Manter como placeholder até implementar contrato e revisão de transação.',
          'A revisão de transação sempre mostra contexto, taxa fixa, taxa percentual, token de taxa e pressupostos antes de assinar.',
        ],
        technicalTitle: 'Funções relevantes',
        functions: [
          { name: 'getRoleFeeConfig(context)', description: 'Lê as taxas maker/taker fixas e percentuais ativas para um contexto de trade.' },
          { name: 'getRoleFeeConfig(context)', description: 'Use getFeeForAccount para pré-visualizar descontos de token e conta para uma ordem específica.' },
          { name: 'getFeeForAccount(paymentToken, assetToken, assetValue, context, account, isMaker)', description: 'Retorna valores de taxa maker/taker para revisão de transação.' },
          { name: 'getAcceptedPaymentTokens()', description: 'Lê os tokens de taxa aceitos atualmente.' },
          { name: 'sethxDiscountBps()', description: 'Lê o desconto SETHX ativo em basis points.' },
        ],
        ratesTitle: 'Taxas reais de trading',
        ratesIntro: 'Este popup lê a configuração ativa do FeeManager para todos os contextos atuais de taxas de trading.',
        refreshRates: 'Atualizar taxas',
        ratesLoading: 'Carregando taxas ativas...',
        ratesLoaded: 'Taxas ativas carregadas.',
        ratesError: 'Não foi possível carregar as taxas. Verifique a rede ou o provider configurado.',
        ratesColumns: { trade: 'Trade', context: 'Contexto de taxa', payment: 'Token de pagamento', fixed: 'Taxa fixa', percentage: 'Taxa percentual', source: 'Fonte' },
        ratesSourceContract: 'Leitura FeeManager',
        ratesSourcePending: 'Pendente',
        feePageCta: 'Ver taxas ativas',
      },
      tokenSpot: {
        kicker: 'Token Spot',
        title: 'Mercados token spot permitem negociar tokens ERC20 por meio de um orderbook.',
        description: 'Token Spot é o mercado de orderbook ERC20 na sethx.com. Usuários podem criar ordens, preencher ordens existentes, cancelar ordens abertas e revisar saldos, taxas e efeitos no vault antes de confirmar um trade.',
        detailsTitle: 'Como token spot funciona',
        details: [
          'Um mercado token spot tem um token base e um token de cotação. Usuários podem criar ordens para trocar um token ERC20 por outro por meio do token spot orderbook.',
          'A conta SETHX selecionada é usada para a ação. Sethx.com mostra saldos da conta, valores disponíveis, saldos bloqueados, detalhes da ordem, taxas e revisão da transação antes de confirmar.',
          'Criar uma ordem bloqueia o valor oferecido e qualquer taxa necessária. Preencher uma ordem transfere os tokens acordados entre usuários e deduz as taxas.',
          'Cancelar uma ordem aberta libera qualquer valor bloqueado não usado para a conta SETHX selecionada.',
          'Em "My Tokens", o usuário pode ver os saldos por token e o valor em USD quando disponível. Os tokens são classificados como main, whitelisted e other. Os tokens whitelisted são os principais tokens confiáveis com endereços confirmados.',
        ],
        technicalTitle: 'Funções relevantes',
        functions: [
          { name: 'getMarkets(), market reads', description: 'Lê mercados token spot configurados, tokens base/cotação, status do mercado, estado do orderbook e dados de exibição.' },
          { name: 'placeOrder(...)', description: 'Cria uma ordem token spot para a conta SETHX selecionada e bloqueia o valor oferecido conforme os termos da ordem.' },
          { name: 'acceptOrder(...)', description: 'Aceita ou preenche uma ordem token spot existente depois que sethx.com prepara a revisão da transação e a prévia das taxas.' },
          { name: 'cancelOrder(...)', description: 'Cancela uma ordem token spot aberta e libera saldos bloqueados não usados conforme as regras do orderbook.' },
          { name: 'FeeManager + Vault reads', description: 'Lê configurações de taxa, efeitos do token de taxa selecionado, saldos disponíveis e saldos bloqueados antes de confirmar.' },
        ],
      },
      nftSpot: {
        kicker: 'NFT Spot',
        title: 'Mercados NFT spot permitem negociar NFTs por meio de um orderbook.',
        description: 'NFT Spot é o mercado de orderbook NFT na sethx.com. Usuários podem criar asks para NFTs que possuem, criar bids com um token de cotação, preencher ordens existentes, cancelar ordens abertas e revisar propriedade, saldos, taxas e efeitos no vault antes de confirmar um trade.',
        detailsTitle: 'Como NFT spot funciona',
        details: [
          'Um mercado NFT spot conecta uma coleção NFT com um token de cotação. Ordens podem apontar para um token ID específico ou para termos de mercado definidos pelo NFT spot orderbook.',
          'A conta SETHX selecionada é usada para a ação. Sethx.com mostra propriedade do NFT, saldos do token de cotação, valores disponíveis, saldos bloqueados, detalhes da ordem, taxas e revisão da transação antes de confirmar.',
          'Criar uma ask bloqueia ou reserva o NFT conforme os termos da ordem. Criar uma bid bloqueia o valor oferecido no token de cotação e qualquer taxa necessária.',
          'Preencher uma ordem NFT spot transfere o NFT e os tokens de cotação entre usuários e deduz as taxas. No fluxo atual do contrato, os dois lados bloqueiam orçamentos de taxa e as taxas são cobradas conforme o lado da ordem e o fill.',
          'Cancelar uma ordem NFT spot aberta libera qualquer NFT ou valor de token de cotação bloqueado não usado para a conta SETHX selecionada.',
          'No espaço NFT, usuários podem revisar coleções disponíveis, bids e asks do mercado selecionado, NFTs próprios e suas próprias ordens NFT spot abertas.',
        ],
        technicalTitle: 'Funções relevantes',
        functions: [
          { name: 'getMarkets(), market reads', description: 'Lê mercados NFT spot configurados, endereço da coleção NFT, token de cotação, status do mercado, estado do orderbook e dados de exibição.' },
          { name: 'placeOrder(...)', description: 'Cria uma bid ou ask NFT spot para a conta SETHX selecionada e bloqueia o NFT ou valor de token de cotação oferecido conforme os termos da ordem.' },
          { name: 'acceptOrder(...)', description: 'Aceita ou preenche uma ordem NFT spot existente depois que sethx.com prepara verificações de propriedade, revisão da transação e prévia das taxas.' },
          { name: 'cancelOrder(...)', description: 'Cancela uma ordem NFT spot aberta e libera ativos bloqueados não usados conforme as regras do orderbook.' },
          { name: 'FeeManager + Vault reads', description: 'Lê configurações de taxa, efeitos do token de taxa selecionado, propriedade NFT, saldos disponíveis e saldos bloqueados antes de confirmar.' },
        ],
      },
      futures: {
        kicker: 'Futuros',
        title: 'Mercados de futuros permitem criar exposição long ou short com margem.',
        description: 'Futuros na sethx.com são mercados de orderbook para exposição direcional. Usuários podem criar ordens buy ou sell, fazer match com liquidez existente, gerenciar margem, revisar taxas e liquidar exposição pela conta SETHX selecionada.',
        detailsTitle: 'Como futuros funcionam',
        details: [
          'Um mercado de futuros é identificado por um market key e usa uma fonte de preço de liquidação. Usuários expressam intenção com ordens buy ou sell que podem abrir, reduzir ou fechar exposição long e short.',
          'O token de pagamento e margem para futuros é sempre ETH. A conta SETHX selecionada deve ter ETH disponível suficiente para cobrir margem, buffers e taxas antes de confirmar uma operação.',
          'Criar uma ordem de futuros pode bloquear margem, um buffer de movimento de preço e taxas. O matching cria ou altera exposição de futuros e cobra taxas conforme o valor preenchido.',
          'Cancelar uma ordem aberta libera os valores bloqueados não usados dessa ordem. A margem que já suporta uma posição ativa continua gerenciada pelo contrato de futuros e pelas regras de liquidação.',
          'Usuários podem adicionar margem para sustentar uma posição de futuros aberta ou liberar margem excedente quando o contrato permite.',
          'A margem inicial é o colateral necessário para abrir ou aumentar exposição de futuros. A margem mínima ou de manutenção é o limite de segurança inferior usado para determinar se uma posição tem colateral suficiente para continuar ativa.',
        ],
        technicalTitle: 'Funções relevantes',
        functions: [
          { name: 'placeOrderFutures(orderBook, marketKey, side, price, amount, expiry, feeToken)', description: 'Função no nível da conta que envia uma ordem de futuros pela conta SETHX selecionada.' },
          { name: 'cancelOrderFutures(orderBook, orderId)', description: 'Cancela uma ordem de futuros aberta e libera saldos bloqueados não usados no nível da ordem.' },
          { name: 'addFuturesMargin(futuresContract, marketKey, isLong, amount)', description: 'Adiciona margem a uma posição de futuros long ou short existente.' },
          { name: 'releaseFuturesMargin(futuresContract, marketKey, isLong)', description: 'Solicita liberar margem excedente quando o contrato de futuros calcula que pode ser liberada.' },
          { name: 'FeeManager + Vault reads', description: 'Lê configurações de taxa, pagamento de taxa em ETH, saldos disponíveis, colateral bloqueado e impacto de margem antes de confirmar.' },
        ],
        mechanicsTitle: 'Mecânica detalhada',
        mechanics: [
          { title: 'Como futuros são negociados', description: 'Um usuário negocia futuros escolhendo mercado, lado, preço, quantidade e vencimento pela conta SETHX selecionada. O pagamento e a margem de futuros são sempre em ETH. Abrir ou aumentar exposição exige margem: colateral é bloqueado para sustentar a posição long ou short, e a ordem também pode bloquear taxas e um buffer de movimento de preço antes do matching.' },
          { title: 'Dependência do oráculo', description: 'Cada mercado de futuros depende de um oráculo aprovado de preço de liquidação. O PriceManager deve considerar o oráculo aprovado, habilitado para liquidação de futuros, ativo e não stale antes de ele ser utilizável.' },
          { title: 'Oráculo stale', description: 'Se o oráculo ficar stale ou inutilizável, operações de futuros que exigem um oráculo ativo podem ser bloqueadas, e a lógica de settlement pode fechar o mercado para nova exposição até que o oráculo volte a ser utilizável.' },
          { title: 'Modelo de settlement', description: 'Posições de futuros usam como referência o último preço de settlement do mercado. O settlement atualiza o preço índice do mercado e aplica PnL em rodadas; trades ainda podem alterar exposição sem realizar imediatamente todo o PnL.' },
          { title: 'Margem e liquidação', description: 'O contrato acompanha margem da posição e margem por unidade. A margem viva é avaliada contra o movimento do mark price e requisitos de manutenção. Posições que ficam subcolateralizadas após o settlement são liquidadas automaticamente; a margem restante é perdida e adicionada ao buffer de liquidação.' },
          { title: 'Desequilíbrio long e short', description: 'Quando o open interest long e short não está equilibrado, o sistema registra a diferença como desequilíbrio de mercado. O settlement pode usar o buffer de desequilíbrio para cobrir lucro devido que não está coberto pelas perdas do lado perdedor, e o orderbook pode expor liquidez sintética para que usuários negociem contra o excesso long ou short.' },
        ],
      },
      options: {
        kicker: 'Opções',
        title: 'Mercados de opções permitem negociar calls e puts com vencimento, strike, prêmio e regras de colateral.',
        description: 'Opções na sethx.com são mercados de orderbook para exposição de risco definido. Usuários podem comprar opções, vender opções mantidas, escrever nova exposição de opções, preencher ordens existentes, cancelar ordens abertas, exercer posições in-the-money e recuperar colateral vencido do writer pela conta SETHX selecionada.',
        detailsTitle: 'Como opções funcionam',
        details: [
          'Um mercado de opções é definido por tipo de opção, token de ativo, token de cotação, preço strike e vencimento da opção. Calls dão exposição à alta do ativo; puts dão exposição à queda em relação ao strike.',
          'O token de pagamento para opções é sempre ETH para prêmios e taxas. A exceção é o colateral de call, em que o writer entrega ou bloqueia o token subjacente quando a estrutura da call exige entrega do subjacente.',
          'Compradores pagam um prêmio pela opção. Writers fornecem colateral para que a opção possa ser honrada se for exercida conforme as regras da opção.',
          'Criar uma ordem pode bloquear prêmio, colateral do writer e orçamentos de taxa dependendo da intenção da ordem. Preencher uma ordem transfere o prêmio, atualiza a exposição de opções e deduz taxas quando aplicável.',
          'Cancelar uma ordem aberta libera prêmio, colateral ou orçamentos de taxa bloqueados não usados para essa ordem.',
          'Holders só podem exercer opções elegíveis durante a janela de exercício. Depois do vencimento, writers podem recuperar colateral não usado conforme as regras do contrato.',
        ],
        technicalTitle: 'Funções relevantes',
        functions: [
          { name: 'placeOrderOption(orderBook, optionType, assetToken, quoteToken, strikePrice, optionExpiry, orderExpiry, feeToken, intent, size, askPrice)', description: 'Função no nível da conta que envia uma ordem de opções pela conta SETHX selecionada.' },
          { name: 'acceptOrderOption(orderBook, makerOrderId, amount, feeToken)', description: 'Aceita ou preenche uma ordem de opções existente depois que sethx.com prepara a revisão da transação e a prévia das taxas.' },
          { name: 'cancelOrderOption(orderBook, orderId)', description: 'Cancela uma ordem de opções aberta e libera saldos bloqueados não usados para essa ordem.' },
          { name: 'exercise(marketKey, size)', description: 'Exerce exposição de opções elegível quando as regras do contrato de opções permitem.' },
          { name: 'reclaimExpired(marketKey)', description: 'Recupera colateral disponível do writer após o vencimento quando o contrato permite.' },
          { name: 'FeeManager + Vault reads', description: 'Lê configurações de taxa, pagamento de taxa em ETH, saldos disponíveis, saldos bloqueados, impacto do prêmio e requisitos de colateral antes de confirmar.' },
        ],
        mechanicsTitle: 'Mecânica detalhada',
        mechanics: [
          { title: 'Calls e puts', description: 'Uma call dá ao holder exposição para comprar ou receber valor quando o ativo está acima do strike. Uma put dá exposição quando o ativo está abaixo do strike. A lógica exata de transferência e payout segue o contrato de opções.' },
          { title: 'Prêmio e colateral do writer', description: 'O prêmio é o preço pago pelo comprador da opção para entrar na posição. Um writer bloqueia colateral para respaldar a obrigação: writers de calls podem exigir colateral no ativo, enquanto writers de puts podem exigir colateral no token de cotação conforme tamanho e strike.' },
          { title: 'Intenções de ordem', description: 'O orderbook suporta intenções diferentes como comprar opções, vender opções mantidas, escrever opções e vender exposição de writer. Sethx.com prepara a intenção escolhida para o usuário ver o que será pago, bloqueado, recebido ou liberado antes de assinar.' },
          { title: 'Vencimento, exercício e reclaim', description: 'Opções usam um vencimento. Holders só podem exercer exposição elegível durante a janela de exercício aplicável. Depois do vencimento, colateral de writer não usado pode ser recuperado conforme as regras do contrato.' },
          { title: 'Taxas e efeitos no vault', description: 'Trades de opções podem bloquear prêmio, colateral e valores de taxa antes da assinatura. A revisão da transação mostra o contexto da taxa, pagamento de taxa em ETH, taxa fixa e percentual, e os saldos que serão usados ou bloqueados.' },
        ],
      },
      binaryOptions: {
        kicker: 'Opções binárias',
        title: 'Mercados de opções binárias permitem negociar exposição de resultado fixo com pagamento e margem em ETH.',
        description: 'Opções binárias na sethx.com são mercados de orderbook liquidados em ETH em torno de uma condição, strike e vencimento definidos. Usuários podem comprar exposição de payout, escrever exposição com margem, preencher ordens existentes, cancelar ordens abertas, reivindicar payout vencedor e recuperar margem de writer não usada pela conta SETHX selecionada.',
        detailsTitle: 'Como opções binárias funcionam',
        details: [
          'Um mercado de opções binárias define uma condição como acima ou abaixo de um strike no vencimento. O mercado paga holders elegíveis quando a condição é verdadeira conforme a regra de settlement.',
          'O token de pagamento é sempre ETH. Compradores bloqueiam o prêmio pago por exposição de payout, enquanto writers bloqueiam margem em ETH para respaldar a obrigação de payout.',
          'Criar uma ordem pode bloquear prêmio, margem do writer e valores de taxa dependendo da intenção. Preencher uma ordem transfere o prêmio, atualiza a exposição de payout e deduz taxas quando aplicável.',
          'Cancelar uma ordem de opção binária aberta libera prêmio, margem do writer ou orçamentos de taxa não usados para essa ordem.',
          'Depois do settlement, holders vencedores podem reivindicar payout e writers podem recuperar margem não usada conforme as regras do contrato de opções binárias.',
        ],
        technicalTitle: 'Funções relevantes',
        functions: [
          { name: 'placeOrderBinaryMarginOption(orderBook, marketKey, intent, payoutAmount, askPrice, expiry, feeToken)', description: 'Função no nível da conta que envia uma ordem de opção binária pela conta SETHX selecionada.' },
          { name: 'acceptOrderBinaryMarginOption(orderBook, makerOrderId, payoutAmount, feeToken)', description: 'Aceita ou preenche uma ordem de opção binária existente depois que sethx.com prepara a revisão da transação e a prévia das taxas.' },
          { name: 'cancelOrderBinaryMarginOption(orderBook, orderId)', description: 'Cancela uma ordem de opção binária aberta e libera saldos bloqueados não usados para essa ordem.' },
          { name: 'claimBinaryMarginOption(binaryContract, marketKey, payoutAmount)', description: 'Reivindica payout elegível de opção binária depois que o mercado foi liquidado.' },
          { name: 'reclaimWriterBinaryMarginOption(binaryContract, marketKey)', description: 'Recupera margem disponível do writer depois do settlement quando o contrato permite.' },
          { name: 'FeeManager + Vault reads', description: 'Lê configurações de taxa, saldos ETH, ETH bloqueado, exposição de payout, impacto do prêmio e requisitos de margem do writer antes de confirmar.' },
        ],
        mechanicsTitle: 'Mecânica detalhada',
        mechanics: [
          { title: 'Resultado binário', description: 'Opções binárias não pagam um valor variável conforme a distância do movimento do preço. Elas resolvem para um resultado definido: a condição é verdadeira ou falsa no settlement.' },
          { title: 'Prêmio e margem do writer', description: 'O comprador paga um prêmio em ETH pelo payout potencial. O writer bloqueia margem em ETH para respaldar o payout se a exposição compradora vencer.' },
          { title: 'Intenções de ordem', description: 'O orderbook suporta intenções como comprar exposição de payout, vender payout mantido e escrever exposição de payout. Sethx.com prepara a intenção escolhida para o usuário ver o que será pago, bloqueado, recebido ou liberado antes de assinar.' },
          { title: 'Oráculo, vencimento e settlement', description: 'O settlement depende da condição do mercado, strike, vencimento e fonte de preço configurada. Se os dados necessários do oráculo estiverem indisponíveis ou stale, settlement ou ações de mercado podem ser atrasados ou bloqueados até que os dados sejam utilizáveis.' },
          { title: 'Claims e reclaim', description: 'Depois do settlement, holders elegíveis reivindicam payout. Writers recuperam margem restante apenas quando as regras do contrato permitem, depois que as obrigações de payout são resolvidas.' },
        ],
      },
      marginOptions: {
        kicker: 'Opções com margem',
        title: 'Mercados de opções com margem permitem negociar exposição de opções com colateral parcial do writer.',
        description: 'Opções com margem na sethx.com são mercados de orderbook liquidados em ETH para exposição de call ou put em que writers podem bloquear margem em vez de colateral nocional completo. Usuários podem criar ordens, preencher ordens existentes, cancelar ordens abertas, reivindicar payout elegível depois do settlement e recuperar margem restante do writer pela conta SETHX selecionada.',
        detailsTitle: 'Como opções com margem funcionam',
        details: [
          'Um mercado de opções com margem é definido por tipo de opção, oracle, token base, token de pagamento, strike, vencimento e ratio de colateral. O token de pagamento é ETH para prêmios, taxas, margem, claims e reclaim.',
          'Compradores pagam prêmio em ETH pela exposição da opção. Writers bloqueiam margem em ETH com base no ratio de colateral do mercado, então o colateral do writer pode ser menor que o payout máximo possível.',
          'Criar uma ordem pode bloquear prêmio em ETH, margem do writer e orçamentos de taxa dependendo da intenção selecionada. Preencher uma ordem transfere o prêmio, atualiza exposição de holder ou writer e deduz taxas quando aplicável.',
          'Depois do settlement, holders elegíveis podem reivindicar payout conforme o preço de settlement e o payout por unidade. Writers podem recuperar margem restante depois que as obrigações forem resolvidas.',
          'O payout nunca excede o colateral bloqueado para a posição de opção com margem.',
          'Como o colateral do writer é baseado em margem, o payout pode depender da margem disponível e dos resultados de settlement. Sethx.com mostra prêmio, margem, taxas, vencimento e efeitos de claim ou reclaim antes de confirmar.',
        ],
        technicalTitle: 'Funções relevantes',
        functions: [
          { name: 'placeOrderMarginOption(orderBook, marketKey, intent, size, askPrice, expiry, feeToken)', description: 'Função no nível da conta que envia uma ordem de opção com margem pela conta SETHX selecionada.' },
          { name: 'acceptOrderMarginOption(orderBook, makerOrderId, amount, feeToken)', description: 'Aceita ou preenche uma ordem existente depois que sethx.com prepara a revisão da transação e a prévia das taxas.' },
          { name: 'cancelOrderMarginOption(orderBook, orderId)', description: 'Cancela uma ordem aberta e libera saldos bloqueados não usados para essa ordem.' },
          { name: 'claimMarginOption(marginContract, marketKey, size)', description: 'Reivindica payout elegível depois que o mercado foi liquidado.' },
          { name: 'reclaimWriterMarginOption(marginContract, marketKey)', description: 'Recupera margem restante do writer depois do settlement quando o contrato permite.' },
          { name: 'getRequiredMargin(marketKey, size), getPayoutPerUnit(marketKey)', description: 'Lê requisitos de margem e valores de payout de settlement usados para revisão de transação e exibição de posições.' },
        ],
        mechanicsTitle: 'Mecânica detalhada',
        mechanics: [
          { title: 'Exposição de opção com margem', description: 'Opções com margem se parecem com exposição comum de opções, mas a margem do writer é calculada pelo ratio de colateral do mercado em vez de sempre bloquear o valor nocional completo.' },
          { title: 'Pagamento e margem em ETH', description: 'Prêmio, taxas, margem do writer, payout do holder e reclaim do writer são tratados em ETH. A conta SETHX selecionada precisa ter ETH disponível suficiente antes de assinar.' },
          { title: 'Oracle e settlement', description: 'O mercado usa um oracle aprovado e um vencimento configurado. Depois do settlement, o preço de settlement determina se a exposição do holder tem valor e qual payout por unidade pode ser reivindicado.' },
          { title: 'Reclaim do writer', description: 'Writers só podem recuperar margem restante depois do settlement e depois que obrigações de payout forem resolvidas pelas regras do contrato.' },
          { title: 'Nota de risco', description: 'Como o colateral do writer é parcial, usuários devem revisar ratio de colateral, strike, vencimento, status de settlement, pressupostos de payout e ETH bloqueado antes de assinar.' },
        ],
      },
      lending: {
        kicker: 'Lending',
        title: 'Mercados de lending permitem fornecer ETH a borrowers por um orderbook on-chain.',
        description: 'O lending em sethx.com é organizado em ofertas de empréstimo em ETH, contas de lending, regras de colateral e repayment. Lenders fornecem capital pelo orderbook de lending e borrowers aceitam ofertas disponíveis por contas orientadas a lending.',
        detailsTitle: 'Como o lending funciona',
        details: [
          'Um lender cria ou financia uma oferta escolhendo tamanho, duração, termos de juros, risk tier e requisitos de colateral. O ETH disponível pode ser aceito por borrowers pelo orderbook.',
          'Ofertas aceitas viram empréstimos ativos. O borrower recebe ETH utilizável enquanto colateral e estado do empréstimo permanecem conectados à conta SETHX selecionada.',
          'Lenders não pagam taxas de trading por fornecer liquidez. O desenho evita cobrar LPs porque borrowers usam ETH emprestado para investimentos SETHX onde taxas de trading podem se aplicar.',
          'Quando um empréstimo é repago, o lender recebe principal e juros acordados conforme os termos. Se regras de repayment ou colateral falham, o empréstimo pode ir para liquidação.',
          'Sethx.com mostra termos da ordem, duração, valor aceito, expectativas de colateral, estado de repayment e efeitos na conta antes de confirmar ações de lending.',
        ],
        technicalTitle: 'Funções relevantes',
        functions: [
          { name: 'createLendingOffer(orderBook, amount, duration, rate, riskTier)', description: 'Cria uma oferta de lending que borrowers podem revisar e aceitar pelo orderbook.' },
          { name: 'cancelLendingOffer(orderBook, offerId)', description: 'Cancela uma oferta aberta e libera liquidez disponível não usada quando o contrato permite.' },
          { name: 'fundLendingOffer(orderBook, offerId, amount)', description: 'Adiciona ou fornece liquidez em ETH a uma oferta quando o fluxo de lending suporta.' },
          { name: 'claimLendingRepayment(lendingContract, loanId)', description: 'Reivindica principal, juros ou valores de repayment disponíveis para o lender.' },
          { name: 'getLendingOffer(offerId), getLoan(loanId)', description: 'View functions usadas por sethx.com para mostrar termos da oferta, estado do empréstimo, repayment e risco.' },
        ],
        mechanicsTitle: 'Mecânica detalhada',
        mechanics: [
          { title: 'Lending por orderbook', description: 'O lending usa um fluxo estilo orderbook: lenders publicam capital e termos, e borrowers aceitam ofertas que cabem em sua conta, colateral e risco.' },
          { title: 'Posição do lender', description: 'A posição do lender é principalmente um recebível em ETH: após a aceitação, o lender aguarda repayment, juros, settlement ou liquidação conforme os termos.' },
          { title: 'Sem taxa para LPs', description: 'O lado lender é desenhado para que provedores de liquidez não paguem taxas de trading por disponibilizar capital. O borrower pode pagar taxas quando investe fundos emprestados em mercados SETHX.' },
          { title: 'Visibilidade de risco', description: 'Lenders devem revisar duração, risk tier, regras de colateral, estado ativo/desativado, suposições de liquidação e repayment antes de fornecer capital.' },
        ],
      },
      borrowing: {
        kicker: 'Borrowing',
        title: 'Borrowing permite acessar ETH por contas de lending restringidas por colateral e regras de risco.',
        description: 'O borrowing em sethx.com acontece por contas SETHX orientadas a lending. Um borrower aceita uma oferta do orderbook e a conta fica restringida por LTV, risk tier, colateral, repayment e regras de liquidação.',
        detailsTitle: 'Como o borrowing funciona',
        details: [
          'Um borrower usa uma conta SETHX de lending para aceitar uma oferta disponível. Os termos definem quanto ETH é tomado, expectativas de repayment, duração e risk tier.',
          'O ETH emprestado pode ser usado para investimentos SETHX, mas a conta fica restringida por LTV, colateral, risk tier e estado ativo do empréstimo.',
          'O colateral deve permanecer suficiente enquanto o empréstimo estiver ativo. Se a colateralização cair abaixo dos níveis exigidos, a conta pode ser liquidada.',
          'Borrowers repagam principal e juros acordados conforme os termos. O repayment libera restrições quando as regras do contrato são satisfeitas.',
          'Sethx.com mostra valor emprestado, colateral, LTV, risk tier, obrigações de repayment, risco de liquidação e efeitos da transação antes de assinar.',
        ],
        technicalTitle: 'Funções relevantes',
        functions: [
          { name: 'acceptLendingOffer(orderBook, offerId, amount)', description: 'Aceita uma oferta disponível e cria ou atualiza o estado do empréstimo borrower pela conta SETHX selecionada.' },
          { name: 'repayLoan(lendingContract, loanId, amount)', description: 'Repaga principal e juros conforme os termos e libera restrições quando o empréstimo é totalmente resolvido.' },
          { name: 'addCollateral(lendingContract, loanId, token, amount)', description: 'Adiciona colateral para melhorar LTV e reduzir risco de liquidação quando o fluxo suporta.' },
          { name: 'liquidateLoan(lendingContract, loanId)', description: 'Liquida um empréstimo undercollateralized quando as regras do contrato permitem.' },
          { name: 'getLoanHealth(loanId), getLtv(loanId), getRiskTier(loanId)', description: 'View functions usadas para mostrar restrições, LTV, risk tier, colateralização e estado de liquidação.' },
        ],
        mechanicsTitle: 'Mecânica detalhada',
        mechanics: [
          { title: 'Ações restringidas', description: 'Borrowing é account-based. Uma conta orientada a lending pode ficar restringida enquanto a dívida está ativa, então sethx.com previne ou alerta sobre ações que conflitam com LTV, colateral, risk tier ou regras do empréstimo.' },
          { title: 'LTV e risk tier', description: 'Loan-to-value compara valor emprestado com valor do colateral. O risk tier define limites, ações aceitas e limiares de liquidação.' },
          { title: 'Repayment', description: 'Repayment devolve ETH emprestado mais juros acordados. Quando o empréstimo é totalmente repago e as verificações passam, colateral e restrições podem ser liberados pelas regras.' },
          { title: 'Liquidação', description: 'Se a conta ficar undercollateralized, a liquidação pode tomar colateral ou resolver o empréstimo pelas regras do contrato. Usuários devem monitorar LTV e colateral antes de investir fundos emprestados.' },
        ],
      },

      miscellaneous: {
        kicker: 'Miscelânea',
        title: 'Outros itens que usuários devem entender antes de assinar transações.',
        description: 'Algumas partes importantes de sethx.com não são um mercado por si só, mas afetam muitas ações: aprovações de wallet, leituras live, status de mercado, dados de oracle, configurações de governança e revisão de transação. Esta seção reúne esses itens transversais.',
        detailsTitle: 'Itens para lembrar',
        details: [
          'Aprovações de wallet são separadas da confirmação da trade. Para ERC20 e NFTs, o usuário pode precisar aprovar permissões antes de sethx.com preparar a ação de mercado.',
          'Mercados podem estar enabled, disabled, paused, expired, settled ou com dados stale. Sethx.com deve mostrar esses estados antes de preparar uma ação.',
          'Dados de oracle e preço são usados para valores em USD, settlement, verificações de risco, LTV, cálculos de margem e algumas suposições de taxa. Se os dados estiverem stale ou indisponíveis, ações podem ser bloqueadas ou exibidas com alertas.',
          'Governança pode alterar mercados, taxas, risk tiers, ativos permitidos, configurações de oracle e outros parâmetros. Usuários devem usar leituras atuais antes de assinar.',
          'A revisão de transação é o checkpoint final do usuário. Ela deve mostrar conta, ação, mercado, valores, taxas, bloqueios, liberações, pressupostos e alertas de risco conhecidos antes da wallet assinar.',
        ],
        technicalTitle: 'Referências relevantes',
        functions: [
          { name: 'ERC20 approve(token, spender, amount)', description: 'Aprovação da wallet que pode ser necessária antes de tokens serem depositados, bloqueados ou movidos pelo fluxo selecionado.' },
          { name: 'ERC721/ERC1155 approvals', description: 'Aprovações NFT ou operator approvals que podem ser necessárias antes de NFT Spot bloquear ou transferir um NFT.' },
          { name: 'market status reads', description: 'View functions usadas por sethx.com para decidir se um mercado está aberto, pausado, settled, expirado ou indisponível.' },
          { name: 'PriceManager / oracle reads', description: 'Leituras usadas para preços de settlement, valores em USD, verificações de risco, margem, LTV e alertas de dados stale.' },
          { name: 'governance parameter reads', description: 'Leituras usadas para mostrar taxas atuais, configurações de risco, ativos permitidos, tokens de taxa aceitos e parâmetros de mercado.' },
        ],
        mechanicsTitle: 'Notas detalhadas',
        mechanics: [
          { title: 'Aprovações e assinaturas', description: 'Uma aprovação dá permissão a um contrato para usar um token ou NFT; confirmar uma trade assina a ação de mercado. Sethx.com deve separar esses passos claramente.' },
          { title: 'Leituras live e vistas em cache', description: 'As páginas públicas explicam conceitos, mas saldos, taxas, status de mercado, oracles e verificações de risco devem vir de leituras live quando possível.' },
          { title: 'Mudanças de mercado e parâmetros', description: 'Mercados SETHX são configuráveis. Um mercado, taxa, risk tier ou regra de oracle pode mudar, então a revisão de transação deve usar o ajuste ativo.' },
          { title: 'Responsabilidade do usuário', description: 'Sethx.com prepara informações claras de transação, mas usuários continuam responsáveis por revisar a wallet, entender o risco e decidir se assinam.' },
        ],
      },

    },
    feeRates: {
      kicker: 'Taxas',
      title: 'Taxas ativas do FeeManager.',
      intro: 'SETHX foi projetado para taxas de trading on-chain muito baixas. Esta página lê a configuração ativa usada por sethx.com ao preparar revisões de transações. As taxas podem mudar por governança, então usuários devem usar as leituras mais recentes antes de assinar.',
      activeTitle: 'Leituras atuais do contrato',
      activeIntro: 'Taxas fixas são valores brutos com 18 decimais. Taxas percentuais são basis points: 10 bps equivale a 0,10%.',
      acceptedTokens: 'Tokens de taxa aceitos',
      sethxDiscount: 'Desconto SETHX',
      statusLoading: 'Carregando taxas ativas...',
      statusLoaded: 'Taxas ativas carregadas.',
      statusError: 'Não foi possível carregar as taxas. Verifique a rede ou o provider configurado.',
      refresh: 'Atualizar taxas',
      backToLibrary: 'Voltar à biblioteca',
      product: 'Produto',
      context: 'Contexto de taxa',
      fixedFee: 'Taxa fixa',
      percentageFee: 'Taxa percentual',
      source: 'Fonte',
      paymentToken: 'Token de pagamento',
      completeFeesCta: 'Conjunto de taxas',
      pending: 'Conexão de produto pendente',
      contractRead: 'Leitura FeeManager',
      notWired: 'Ainda não há contexto FeeManager compartilhado',
      notesTitle: 'Como interpretar esta tabela',
      notes: [
        'A tabela mostra a configuração ativa do FeeManager por contexto de produto. Não é uma cotação para uma ordem específica.',
        'A revisão final pode incluir conversão por oráculo, token de taxa selecionado, valor do ativo, saldo disponível, saldo bloqueado e regras de liquidação.',
      ],
    },
    governance: { kicker: 'Governança', title: 'A governança é a camada de decisão para mudanças do protocolo e ações de tesouraria.', intro: 'A governança SETHX permite que votantes elegíveis deleguem poder de voto, revisem propostas, votem e aprovem ações de protocolo ou tesouraria por meio de smart contracts transparentes. A página pública explica o processo; o app conectado fornece o app de transação.', lifecycle: [{ title: 'Discutir', description: 'Revisão da comunidade, requisitos, análise de risco, estimativas de custo e sinalização não vinculante antes da submissão formal.' }, { title: 'Propor', description: 'Wallets elegíveis criam uma proposta com targets, values, calldata e uma descrição clara da ação pretendida.' }, { title: 'Votar', description: 'Votantes revisam o estado da proposta e votam Against, For ou Abstain durante a janela ativa.' }, { title: 'Executar', description: 'Propostas aprovadas podem seguir para execução por meio do governor ou do modelo timelock usado pelos contratos implantados.' }], scopeTitle: 'Escopo da página de votação', scopeText: 'A página de governança do app suporta delegação, busca de propostas, votação e criação de propostas para wallets elegíveis. Também mostra configurações do governor, endereços de contratos, estado da proposta, contagem de votos e se a wallet conectada já votou.', enterApp: 'Entrar no app', votingModel: [{ title: 'SETHX na wallet', description: 'SETHX líquido pode ser lido diretamente do contrato do token e delegado pelo app.' }, { title: 'SETHX mantido no protocolo', description: 'Usuários podem manter ativos dentro de contas SETHX ou vaults, então o modelo final deve evitar ignorar SETHX depositado.' }, { title: 'Poder de voto efetivo', description: 'O app deve mostrar o poder de voto reconhecido pelos contratos de governança e explicar claramente o que está incluído.' }] },
    community: {
      kicker: 'Comunidade',
      title: 'Vamos construir o ecossistema SETHX juntos.',
      intro: 'A SETHX é mais do que uma interface. É um ecossistema de protocolo que pode crescer com traders, builders, analistas, holders, educadores, designers, suporte, market makers e participantes de governança. Esta página explica onde a comunidade pode ajudar, como ideias podem virar trabalho financiado e por que a participação importa.',
      contributorPaths: [
        ['Trade & Report', 'Use a interface, reporte problemas, sugira melhorias de mercado e ajude a tornar o app mais seguro e claro.'],
        ['Build & integrate', 'Crie dashboards, monitores, bots, analytics, interfaces alternativas, automação, integrações e ferramentas por produto.'],
        ['Research & educate', 'Publique revisões de risco, explicações de mercado, tutoriais, traduções, análise de taxas, resumos de governança e pesquisa.'],
        ['Govern & grow', 'Mantenha SETHX, revise propostas, sinalize prioridades, vote quando elegível, apresente contribuidores e ajude a comunidade a decidir melhor.'],
      ],
      sectionIntroTitle: 'Quatro formas práticas de contribuir',
      sectionIntroText: 'O primeiro objetivo é deixar os caminhos de contribuição claros. Algumas pessoas vão testar o produto, outras vão construir ao redor dele, outras vão explicá-lo e outras vão ajudar a governá-lo. Os quatro caminhos podem criar valor para o protocolo quando coordenados com transparência.',
      ideasTitle: 'Oportunidades de contribuição',
      initiatives: [
        'Monitoramento de orderbooks, taxas, tesouraria, contratos e saúde do protocolo',
        'Dashboards de risco para colateral, exposição de liquidação, status de oráculos, janelas de vencimento, saldos de vault e saúde de contas',
        'Ferramentas por produto para token spot, NFT spot, futures, opções vanilla, opções binárias, margin options, lending e borrowing',
        'Ferramentas de governança para revisão de propostas, voto delegado, explicações de voto, quórum e visibilidade de pagamentos da tesouraria',
        'Conteúdo educativo, onboarding, traduções, tutoriais, vídeos explicativos, FAQs, guias de mercado e suporte',
        'Exportações públicas de dados, APIs de analytics, recursos para market makers, datasets de pesquisa, alertas e dashboards independentes',
      ],
      fundingTitle: 'Contribuições financiadas pelo protocolo',
      fundingText: 'A SETHX pode conceder ETH por contribuições úteis quando o trabalho é revisado e aprovado pelo processo de tesouraria do protocolo. O site sethx.com é um exemplo de trabalho financiado pelo protocolo: a interface é financiada pelo protocolo para que usuários tenham um local claro conectado à wallet para descobrir mercados, gerenciar contas, revisar transações, entender risco e participar da governança.',
      fundingCards: [
        { title: 'Grants em ETH', description: 'Contribuidores podem solicitar ETH por trabalho, serviços, manutenção, pesquisa, conteúdo, suporte ou integrações que beneficiem a SETHX.' },
        { title: 'Aprovação de governança', description: 'Trabalho pago deve passar por revisão comunitária e governança formal para avaliar escopo, orçamento, risco de entrega e impacto na tesouraria.' },
        { title: 'Responsabilidade pública', description: 'Marcos, entregáveis, termos de pagamento e acompanhamento devem ser fáceis para a comunidade inspecionar.' },
      ],
      contributionTitle: 'Da ideia ao trabalho financiado',
      contributionSteps: [
        { title: 'Compartilhe a ideia', description: 'Descreva o problema, os usuários-alvo, o benefício esperado e por que o trabalho ajuda o protocolo ou a comunidade SETHX.' },
        { title: 'Defina o escopo', description: 'Transforme a ideia em entregáveis, marcos, cronograma, manutenção, riscos e um orçamento solicitado em ETH.' },
        { title: 'Convide revisão', description: 'Permita que traders, builders, holders e membros atentos a risco desafiem suposições antes de uma proposta formal.' },
        { title: 'Passe pela governança', description: 'Quando o escopo estiver maduro, a governança pode decidir se a tesouraria deve conceder ETH e sob quais condições.' },
      ],
      principlesTitle: 'Princípios da comunidade',
      principles: [
        { title: 'Útil antes de barulhento', description: 'Priorize trabalho que melhore materialmente a interface, dados do protocolo, governança, revisão de risco ou educação.' },
        { title: 'Transparente por padrão', description: 'Mantenha propostas, orçamentos, entregáveis, notas de risco e status de pagamento compreensíveis para holders de SETHX.' },
        { title: 'Interface, não custodiante', description: 'SETHX.COM ajuda usuários a interagir com smart contracts compatíveis; usuários seguem responsáveis pelas transações que assinam.' },
      ],
      votingTitle: 'Votação de ideias da comunidade',
      ideaFlow: [
        'Qualquer pessoa pode sugerir uma ideia publicamente.',
        'Wallets conectadas podem discutir, refinar e sinalizar apoio.',
        'A sinalização de holders de SETHX pode ajudar a priorizar antes de uma proposta formal.',
        'Trabalho financiado exige revisão de governança e aprovação da tesouraria antes de conceder ETH.',
      ],
      votingText: 'A sinalização de ideias ajuda na priorização, mas não substitui governança. Trabalho financiado pela tesouraria deve passar por proposta e votação para revisar escopo, orçamento, risco, responsabilidade e benefício esperado para o protocolo.',
      ctaTitle: 'Faça parte do sucesso da SETHX',
      ctaText: 'A SETHX precisa de pessoas dispostas a testar, construir, explicar, governar e convidar outras. Comece com uma ideia útil, torne o escopo concreto e ajude a transformar contribuições valiosas em trabalho aprovado pelo protocolo.',
      primaryCta: 'Abrir governança',
      secondaryCta: 'Ler biblioteca',
    },
    risk: { kicker: 'Risco', title: 'Entenda os riscos antes de usar SETHX.', intro: 'SETHX é um app conectado a wallet para interagir com contratos on-chain implantados. Os contratos implantados definem a exchange e são a única fonte de verdade sobre o que pode acontecer. O usuário que aceita e assina uma interação contratual é responsável por entender a ação, as configurações ativas e as possíveis consequências.', risks: [['Contratos como fonte de verdade', 'Os contratos implantados, e não o texto do site, definem a exchange. Endereços, permissões, parâmetros, oráculos, regras de settlement e regras de liquidação são as regras autoritativas quando o usuário assina. Bugs ou comportamento inesperado podem causar perdas.'], ['Risco de mercado', 'Criptoativos, derivativos, mercados de lending e valores de colateral podem se mover rapidamente. Liquidações, vencimentos e resultados de settlement podem diferir do esperado.'], ['Risco operacional', 'Algumas posições exigem ação no vencimento ou antes dele. Holders de opções podem perder direitos se não agirem durante a janela de exercício. Usuários que tomam empréstimo ou usam futuros devem monitorar o colateral, porque a liquidação pode ser acionada e causar perda.'], ['Risco de oráculos e preços', 'Produtos que dependem de preços externos podem ser afetados por feeds atrasados, manipulados ou indisponíveis.'], ['Risco de liquidez', 'Orderbooks podem ter pouca atividade. Usuários podem não conseguir entrar, sair, tomar emprestado, emprestar ou fechar posições aos preços esperados.'], ['Risco de governança e tesouraria', 'Configurações da SETHX, pagamentos da tesouraria, ativos, parâmetros e permissões podem mudar após aprovação de governança.'], ['Risco jurisdicional e de acesso', 'Algumas regiões podem ser restritas. A disponibilidade de recursos pode mudar por requisitos legais, de compliance ou operacionais.']], adviceTitle: 'Sem aconselhamento financeiro', adviceText: 'A app, docs e assistente podem fornecer explicações da plataforma e educação geral, mas não são aconselhamento financeiro, jurídico, fiscal ou de investimento personalizado. Os usuários são responsáveis por suas decisões e transações.' },
    cookies: { kicker: 'Cookies', title: 'Armazenamento funcional primeiro. Analytics opcional apenas com aprovação.', intro: 'A SETHX usa armazenamento funcional do navegador para preferências e consentimento. Analytics opcional permanece desativado a menos que o usuário aceite. Se aceito, limita-se a visualizações de página, Entrar app e conversão de conexão de wallet. O app não usa cookies de publicidade ou rastreamento comercial.', cards: [{ title: 'Funcional', description: 'Escolha de idioma, versão de consentimento e preferências necessárias para operar o site corretamente.' }, { title: 'Analytics', description: 'Analytics só pode ser habilitado após aprovação e limita-se a visualizações de página, Entrar app e conversão de conexão de wallet. Pode mostrar região/país aproximado em relatórios agregados, mas a SETHX não envia endereços de wallet, contas selecionadas, saldos, ordens, transações, textos de ideias nem issues.' }, { title: 'Comercial', description: 'Nenhum cookie comercial, de publicidade ou marketing de terceiros é usado pela app.' }], currentChoice: 'Sua escolha atual', consentState: 'Estado do consentimento:', accept: 'Aceitar analytics', decline: 'Recusar analytics', reset: 'Redefinir escolha' },
    privacy: { kicker: 'Privacidade', title: 'Interface pública baseada em wallet com armazenamento funcional mínimo.', intro: 'A SETHX deve coletar apenas o necessário para operar o site público, lembrar preferências funcionais, proteger restrições de acesso e oferecer analytics opcional de conversão quando aprovado.', cards: [{ title: 'Dados de wallet', description: 'Um endereço de wallet conectado pode ser usado pelo app para ler dados públicos on-chain e preparar transações.' }, { title: 'Armazenamento local', description: 'Preferência de idioma, consentimento de cookies e configurações do app podem ser armazenados no navegador.' }, { title: 'Analytics', description: 'Analytics de produto deve carregar apenas após aprovação e limitar-se a visualizações de página, Entrar app, conversão de conexão de wallet e relatórios agregados de região/país aproximado. Não deve incluir endereços de wallet, contas selecionadas, saldos, ordens, transações, textos de ideias ou issues, identificadores de publicidade nem rastreamento comercial.' }] },
    protocol: { kicker: 'Protocolo', title: 'Transparência do protocolo e informações de contratos implantados.', intro: 'Esta página lê da configuração central do protocolo e da camada de leituras ao vivo quando disponível. Use-a para verificar rede, contratos, ativos, taxas, tesouraria e governança antes de interagir com o app.', configuredNetwork: 'Rede configurada', contracts: 'Contratos', configuredRecords: 'registros configurados', status: 'Status', statusText: 'Lido a partir de SETHX data configurada. Verifique endereços e parâmetros antes de assinar transações.', liveKicker: 'Camada de leitura ao vivo', liveTitle: 'Status do protocolo somente leitura', refreshReads: 'Atualizar leituras', acceptedPaymentTokens: 'Tokens de pagamento aceitos', trackedErc20Tokens: 'Tokens ERC20 rastreados', directEthBalance: 'Saldo ETH direto', governorSettings: 'Configurações do governor', loaded: 'Carregado', pending: 'Pendente', acceptedFeeTokens: 'Tokens de taxa aceitos', noLiveFeeTokenList: 'Nenhuma lista ao vivo de tokens de taxa carregada ainda.', vaultTokenRegistry: 'Registro de tokens do vault', sethxFeeToken: 'Token de taxa SETHX', enabledAssets: 'Ativos habilitados', enabledProducts: 'Produtos habilitados', contract: 'Contrato', address: 'Endereço', configuredData: 'Dados configurados', liveData: 'Dados ao vivo', contractDirectory: 'Diretório de contratos', vaultReadNote: 'O registro do vault lê listas ERC20 e ERC721 do contrato vault implantado. ERC1155 é exibido como zero quando o ABI do vault implantado não expõe uma leitura de lista ERC1155.' },
    notFound: { title: 'Página não encontrada', body: 'A página solicitada não existe ou foi movida.', action: 'Voltar ao início' },
  },
};
