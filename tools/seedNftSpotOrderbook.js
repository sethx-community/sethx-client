import hre from 'hardhat';
import fs from 'node:fs';
import path from 'node:path';
import { ethers as ethersLib } from 'ethers';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const MOCK_ERC721_FALLBACK = '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707';

const NFT_KEY = 'MockERC721Module#MockERC721';
const QUOTE_TOKEN_KEY = 'MockERC20AModule#MockERC20A';
const NFT_ORDERBOOK_KEY = 'NFTSpotCoreModule#NFTSpotOrderBook';
const VAULT_KEY = 'VaultModule#SethxVault';
const ACCOUNT_FACTORY_KEY = 'AccountFactoryModule#AccountFactory';
const ACCOUNT_REGISTRY_KEY = 'RegistryModule#AccountRegistry';
const TIMELOCK_KEY = 'TimelockModule#TimelockControllerWrapper';

const QUOTE_DEPOSIT = ethersLib.parseUnits('25000', 18);
const ACCOUNT_ETH_FEE_BUFFER = ethersLib.parseEther('2');
const ORDER_EXPIRY_SECONDS = 14n * 24n * 60n * 60n;

function readDeployments() {
  const candidates = [
    path.join(process.cwd(), 'ignition', 'deployments', 'chain-31337', 'deployed_addresses.json'),
    path.join(process.cwd(), 'ignition', 'ignition', 'deployments', 'chain-31337', 'deployed_addresses.json'),
    path.join(process.cwd(), 'deployments', 'chain-31337', 'deployed_addresses.json'),
  ];

  const file = candidates.find((candidate) => fs.existsSync(candidate));
  if (!file) {
    throw new Error(`Could not find deployed_addresses.json. Tried:\n${candidates.join('\n')}`);
  }

  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function requireAddress(deployed, key, fallback = undefined) {
  const value = deployed[key] ?? fallback;
  if (!value) throw new Error(`Missing deployment address for ${key}`);
  return value;
}

async function impersonateTimelock(ethers, timelockAddress) {
  await ethers.provider.send('hardhat_setBalance', [timelockAddress, '0x3635C9ADC5DEA00000']);
  return ethers.getImpersonatedSigner(timelockAddress);
}

async function getOrCreateAccount(ethers, owner, accountFactory, accountRegistry) {
  const existing = await accountRegistry.latestNormalAccount(owner.address);
  if (existing && existing !== ZERO_ADDRESS) return existing;

  console.log(`Creating protocol account for ${owner.address}...`);
  await (await accountFactory.connect(owner).createAccount()).wait();

  const account = await accountRegistry.latestNormalAccount(owner.address);
  if (!account || account === ZERO_ADDRESS) throw new Error('Account creation failed');
  return account;
}

async function mintNftTo(nft, ownerAddress) {
  const nextTokenId = (await nft.totalSupply()) + 1n;
  await (await nft.mint(ownerAddress)).wait();
  return nextTokenId;
}

async function ensureQuoteDeposited({ ethers, quoteToken, owner, accountAddress, amount }) {
  const account = await ethers.getContractAt('Account', accountAddress);

  await (await quoteToken.mint(owner.address, amount)).wait();
  await (await quoteToken.connect(owner).approve(accountAddress, amount)).wait();
  await (await account.connect(owner).depositToken(await quoteToken.getAddress(), amount)).wait();
}

async function ensureEthDeposited({ ethers, owner, accountAddress, amount }) {
  const account = await ethers.getContractAt('Account', accountAddress);
  await (await account.connect(owner).depositETH({ value: amount })).wait();
}

async function depositNft({ ethers, nft, owner, accountAddress, tokenId }) {
  const account = await ethers.getContractAt('Account', accountAddress);
  await (await nft.connect(owner).approve(accountAddress, tokenId)).wait();
  await (await account.connect(owner).depositNFT721(await nft.getAddress(), tokenId)).wait();
}

async function placeNftOrder({ ethers, owner, accountAddress, orderBookAddress, feeToken, nft, tokenId, quoteToken, side, price, expiry }) {
  const account = await ethers.getContractAt('Account', accountAddress);
  await (
    await account.connect(owner).placeOrderNFTSpot(
      orderBookAddress,
      feeToken,
      nft,
      tokenId,
      quoteToken,
      side,
      price,
      expiry,
    )
  ).wait();
}

async function main() {
  const { network } = hre;
  const { ethers } = await network.connect();
  const deployed = readDeployments();

  const timelockAddress = requireAddress(deployed, TIMELOCK_KEY);
  const vaultAddress = requireAddress(deployed, VAULT_KEY);
  const nftOrderBookAddress = requireAddress(deployed, NFT_ORDERBOOK_KEY);
  const accountFactoryAddress = requireAddress(deployed, ACCOUNT_FACTORY_KEY);
  const accountRegistryAddress = requireAddress(deployed, ACCOUNT_REGISTRY_KEY);
  const nftAddress = requireAddress(deployed, NFT_KEY, MOCK_ERC721_FALLBACK);
  const quoteTokenAddress = requireAddress(deployed, QUOTE_TOKEN_KEY);

  const [deployer, buyer, extraBuyer] = await ethers.getSigners();
  const admin = await impersonateTimelock(ethers, timelockAddress);

  const vault = await ethers.getContractAt('SethxVault', vaultAddress);
  const nftOrderBook = await ethers.getContractAt('NFTSpotOrderBook', nftOrderBookAddress);
  const accountFactory = await ethers.getContractAt('AccountFactory', accountFactoryAddress);
  const accountRegistry = await ethers.getContractAt('AccountRegistry', accountRegistryAddress);
  const nft = await ethers.getContractAt('MockERC721', nftAddress);
  const quoteTokenContract = await ethers.getContractAt('MockERC20A', quoteTokenAddress);

  console.log('Seller/deployer:   ', deployer.address);
  console.log('Buyer:             ', buyer.address);
  console.log('Extra buyer:       ', extraBuyer.address);
  console.log('NFTSpotOrderBook:  ', nftOrderBookAddress);
  console.log('Mock ERC721:       ', nftAddress);
  console.log('Quote token:       ', quoteTokenAddress);
  console.log('Fee token:         ', ZERO_ADDRESS, '(ETH)');

  const vaultOrderBookRole = await vault.ORDERBOOK_ROLE();
  if (!(await vault.hasRole(vaultOrderBookRole, nftOrderBookAddress))) {
    console.log('Allowing NFTSpotOrderBook in vault...');
    await (await vault.connect(admin).setOrderbook(nftOrderBookAddress, true)).wait();
  }

  const sellerAccount = await getOrCreateAccount(ethers, deployer, accountFactory, accountRegistry);
  const buyerAccount = await getOrCreateAccount(ethers, buyer, accountFactory, accountRegistry);
  const extraBuyerAccount = await getOrCreateAccount(ethers, extraBuyer, accountFactory, accountRegistry);

  console.log('Seller account:    ', sellerAccount);
  console.log('Buyer account:     ', buyerAccount);
  console.log('Extra buyer acct:  ', extraBuyerAccount);

  const latestBlock = await ethers.provider.getBlock('latest');
  const expiry = BigInt(latestBlock.timestamp) + ORDER_EXPIRY_SECONDS;

  const tokenIdAsk = await mintNftTo(nft, deployer.address);
  const tokenIdAskOnly = await mintNftTo(nft, deployer.address);
  const tokenIdBidOnly = await mintNftTo(nft, deployer.address);

  await depositNft({ ethers, nft, owner: deployer, accountAddress: sellerAccount, tokenId: tokenIdAsk });
  await depositNft({ ethers, nft, owner: deployer, accountAddress: sellerAccount, tokenId: tokenIdAskOnly });
  await depositNft({ ethers, nft, owner: deployer, accountAddress: sellerAccount, tokenId: tokenIdBidOnly });

  await ensureQuoteDeposited({ ethers, quoteToken: quoteTokenContract, owner: buyer, accountAddress: buyerAccount, amount: QUOTE_DEPOSIT });
  await ensureQuoteDeposited({ ethers, quoteToken: quoteTokenContract, owner: extraBuyer, accountAddress: extraBuyerAccount, amount: QUOTE_DEPOSIT });

  await ensureEthDeposited({ ethers, owner: deployer, accountAddress: sellerAccount, amount: ACCOUNT_ETH_FEE_BUFFER });
  await ensureEthDeposited({ ethers, owner: buyer, accountAddress: buyerAccount, amount: ACCOUNT_ETH_FEE_BUFFER });
  await ensureEthDeposited({ ethers, owner: extraBuyer, accountAddress: extraBuyerAccount, amount: ACCOUNT_ETH_FEE_BUFFER });

  const quoteToken = quoteTokenAddress;
  const feeToken = ZERO_ADDRESS;
  const nftToken = nftAddress;

  console.log('Placing NFT spot seed orders...');

  await placeNftOrder({
    ethers,
    owner: deployer,
    accountAddress: sellerAccount,
    orderBookAddress: nftOrderBookAddress,
    feeToken,
    nft: nftToken,
    tokenId: tokenIdAsk,
    quoteToken,
    side: 1,
    price: ethersLib.parseUnits('3.00', 18),
    expiry,
  });

  await placeNftOrder({
    ethers,
    owner: buyer,
    accountAddress: buyerAccount,
    orderBookAddress: nftOrderBookAddress,
    feeToken,
    nft: nftToken,
    tokenId: tokenIdAsk,
    quoteToken,
    side: 0,
    price: ethersLib.parseUnits('2.50', 18),
    expiry,
  });

  await placeNftOrder({
    ethers,
    owner: deployer,
    accountAddress: sellerAccount,
    orderBookAddress: nftOrderBookAddress,
    feeToken,
    nft: nftToken,
    tokenId: tokenIdAskOnly,
    quoteToken,
    side: 1,
    price: ethersLib.parseUnits('4.25', 18),
    expiry,
  });

  await placeNftOrder({
    ethers,
    owner: extraBuyer,
    accountAddress: extraBuyerAccount,
    orderBookAddress: nftOrderBookAddress,
    feeToken,
    nft: nftToken,
    tokenId: tokenIdBidOnly,
    quoteToken,
    side: 0,
    price: ethersLib.parseUnits('1.75', 18),
    expiry,
  });

  const marketCount = await nftOrderBook.getActiveMarketCount();

  console.log('---- Result ----');
  console.log('NFT markets visible: ', marketCount.toString());
  console.log('Token with bid+ask:  ', tokenIdAsk.toString());
  console.log('Token with ask only: ', tokenIdAskOnly.toString());
  console.log('Token with bid only: ', tokenIdBidOnly.toString());
  console.log('Expiry:              ', expiry.toString(), new Date(Number(expiry) * 1000).toISOString());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
