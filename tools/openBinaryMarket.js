import hre from "hardhat";
import fs from "node:fs";
import path from "node:path";
import { ethers as ethersLib } from "ethers";

const ORACLE_CONTEXT = {
  GENERAL: 0,
  TRADE_VALUE: 1,
  FUTURE_SETTLEMENT: 2,
  COLLATERAL_EVAL: 3,
  OPTION_SETTLEMENT: 4,
};

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

// OptionType: 0 = Above/Call, 1 = Below/Put
const OPTION_TYPE = 0;
const TICKER = "TTA-ETH-ABOVE-1000";

const BASE_TOKEN_KEY = "MockERC20AModule#MockERC20A";
const MOCK_ORACLE_KEYS = [
  "ValuationMockOraclesModule#DerivativeSettlementOracle",
  "MockOracleModule#MockOracle",
];

const INITIAL_ORACLE_PRICE = 1_000n * 10n ** 18n;
const STRIKE_PRICE = 1_000n * 10n ** 18n;
const STRIKE_INCREMENT = 1n * 10n ** 18n;
const SEED_ORDER = true;
const SEED_PAYOUT_AMOUNT = ethersLib.parseEther("1");
const SEED_ASK_PRICE = ethersLib.parseEther("0.5");
const ACCOUNT_ETH_DEPOSIT = ethersLib.parseEther("5");

function readDeployments() {
  const candidates = [
    path.join(process.cwd(), "ignition", "deployments", "chain-31337", "deployed_addresses.json"),
    path.join(process.cwd(), "ignition", "ignition", "deployments", "chain-31337", "deployed_addresses.json"),
    path.join(process.cwd(), "deployments", "chain-31337", "deployed_addresses.json"),
  ];

  const file = candidates.find((candidate) => fs.existsSync(candidate));
  if (!file) {
    throw new Error(`Could not find deployed_addresses.json. Tried:\n${candidates.join("\n")}`);
  }

  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function requireAddress(deployed, key) {
  const value = deployed[key];
  if (!value) throw new Error(`Missing deployment address for ${key}`);
  return value;
}

function optionalAddress(deployed, keys) {
  for (const key of keys) {
    if (deployed[key]) return deployed[key];
  }
  throw new Error(`Missing deployment address for one of:\n${keys.join("\n")}`);
}

async function impersonateTimelock(ethers, timelockAddress) {
  await ethers.provider.send("hardhat_setBalance", [
    timelockAddress,
    "0x3635C9ADC5DEA00000", // 1000 ETH
  ]);

  return ethers.getImpersonatedSigner(timelockAddress);
}

function nextFridayNoonUtcAfter(timestampSeconds, minimumDelaySeconds = 7 * 24 * 60 * 60) {
  const start = Number(timestampSeconds + BigInt(minimumDelaySeconds));
  const date = new Date(start * 1000);

  let candidate = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    12,
    0,
    0,
    0,
  );

  while (
    new Date(candidate).getUTCDay() !== 5 ||
    BigInt(Math.floor(candidate / 1000)) <= timestampSeconds
  ) {
    candidate += 24 * 60 * 60 * 1000;
  }

  return BigInt(Math.floor(candidate / 1000));
}

async function getOrCreateAccount(ethers, deployer, accountFactory, accountRegistry) {
  const existing = await accountRegistry.latestNormalAccount(deployer.address);
  if (existing && existing !== ZERO_ADDRESS) return existing;

  console.log("Creating protocol account for deployer...");
  await (await accountFactory.connect(deployer).createAccount()).wait();

  const account = await accountRegistry.latestNormalAccount(deployer.address);
  if (!account || account === ZERO_ADDRESS) throw new Error("Account creation failed");
  return account;
}

async function main() {
  const { network } = hre;
  const { ethers } = await network.connect();

  const deployed = readDeployments();

  const timelockAddress = requireAddress(deployed, "TimelockModule#TimelockControllerWrapper");
  const priceManagerAddress = requireAddress(deployed, "PriceManagerModule#PriceManager");
  const binaryContractAddress = requireAddress(
    deployed,
    "BinaryMarginOptionContractModule#BinaryMarginOptionContract",
  );
  const binaryOrderBookAddress = requireAddress(
    deployed,
    "BinaryMarginOptionsOrderBookModule#BinaryMarginOptionsOrderBook",
  );
  const vaultAddress = requireAddress(deployed, "VaultModule#SethxVault");
  const accountFactoryAddress = requireAddress(deployed, "AccountFactoryModule#AccountFactory");
  const accountRegistryAddress = requireAddress(deployed, "RegistryModule#AccountRegistry");
  const baseToken = requireAddress(deployed, BASE_TOKEN_KEY);
  const oracleAddress = optionalAddress(deployed, MOCK_ORACLE_KEYS);

  const [deployer] = await ethers.getSigners();
  const admin = await impersonateTimelock(ethers, timelockAddress);

  const priceManager = await ethers.getContractAt("PriceManager", priceManagerAddress);
  const binaryContract = await ethers.getContractAt("BinaryMarginOptionContract", binaryContractAddress);
  const binaryOrderBook = await ethers.getContractAt("BinaryMarginOptionsOrderBook", binaryOrderBookAddress);
  const vault = await ethers.getContractAt("SethxVault", vaultAddress);
  const oracle = await ethers.getContractAt("MockOracle", oracleAddress);
  const accountFactory = await ethers.getContractAt("AccountFactory", accountFactoryAddress);
  const accountRegistry = await ethers.getContractAt("AccountRegistry", accountRegistryAddress);

  console.log("Deployer:          ", deployer.address);
  console.log("Timelock/admin:    ", timelockAddress);
  console.log("PriceManager:      ", priceManagerAddress);
  console.log("BinaryContract:    ", binaryContractAddress);
  console.log("BinaryOrderBook:   ", binaryOrderBookAddress);
  console.log("Vault:             ", vaultAddress);
  console.log("Oracle:            ", oracleAddress);
  console.log("Base token:        ", baseToken);
  console.log("Payment token:     ", ZERO_ADDRESS, "(ETH)");

  const currentPriceManager = await binaryContract.priceManager();
  if (currentPriceManager.toLowerCase() !== priceManagerAddress.toLowerCase()) {
    console.log("Setting BinaryMarginOptionContract PriceManager...");
    await (await binaryContract.connect(admin).setPriceManager(priceManagerAddress)).wait();
  }

  const orderBookRole = await binaryContract.ORDERBOOK_ROLE();
  if (!(await binaryContract.hasRole(orderBookRole, binaryOrderBookAddress))) {
    console.log("Granting BinaryMarginOptionContract ORDERBOOK_ROLE to BinaryMarginOptionsOrderBook...");
    await (await binaryContract.connect(admin).grantRole(orderBookRole, binaryOrderBookAddress)).wait();
  }

  const vaultOrderBookRole = await vault.ORDERBOOK_ROLE();
  if (!(await vault.hasRole(vaultOrderBookRole, binaryOrderBookAddress))) {
    console.log("Allowing BinaryMarginOptionsOrderBook in vault...");
    await (await vault.connect(admin).setOrderbook(binaryOrderBookAddress, true)).wait();
  }

  console.log("Setting oracle pair and price...");
  await (await oracle.setTokens(baseToken, ZERO_ADDRESS)).wait();

  const latestBlock = await ethers.provider.getBlock("latest");
  await (await oracle.setPrice(INITIAL_ORACLE_PRICE, BigInt(latestBlock.timestamp), "OK")).wait();

  console.log("Approving and syncing option-settlement oracle in PriceManager...");
  if (!(await priceManager.isApprovedOracle(oracleAddress))) {
    await (await priceManager.connect(admin).approveOracle(oracleAddress)).wait();
  }

  if (!(await priceManager.isOracleApprovedFor(oracleAddress, ORACLE_CONTEXT.OPTION_SETTLEMENT))) {
    await (
      await priceManager
        .connect(admin)
        .approveOracleForContext(oracleAddress, ORACLE_CONTEXT.OPTION_SETTLEMENT)
    ).wait();
  }

  await (
    await priceManager
      .connect(admin)
      .setTokenAllowedForContext(baseToken, ORACLE_CONTEXT.OPTION_SETTLEMENT, true)
  ).wait();

  await (
    await priceManager
      .connect(admin)
      .registerOracleForTokenContext(baseToken, ORACLE_CONTEXT.OPTION_SETTLEMENT, oracleAddress)
  ).wait();

  await (await priceManager.syncOracleData(oracleAddress)).wait();

  const oracleUsable = await priceManager.isOracleUsableForContext(
    oracleAddress,
    ORACLE_CONTEXT.OPTION_SETTLEMENT,
  );
  if (!oracleUsable) {
    throw new Error("Oracle is not usable for option settlement after approval + sync");
  }

  const marketManagerRole = await binaryContract.MARKET_MANAGER_ROLE();
  if (!(await binaryContract.hasRole(marketManagerRole, admin.address))) {
    console.log("Granting MARKET_MANAGER_ROLE to timelock/admin...");
    await (await binaryContract.connect(admin).grantRole(marketManagerRole, admin.address)).wait();
  }

  const optionExpiry = nextFridayNoonUtcAfter(BigInt(latestBlock.timestamp));
  const normalizedStrike = await binaryContract.normalizeStrike(STRIKE_PRICE, STRIKE_INCREMENT);
  const marketKey = await binaryContract.computeMarketKey(
    OPTION_TYPE,
    oracleAddress,
    ZERO_ADDRESS,
    normalizedStrike,
    optionExpiry,
  );

  const existing = await binaryContract.getMarket(marketKey);
  const initialized = Boolean(existing.initialized ?? existing[0]);

  if (initialized) {
    console.log("Binary market already exists:", marketKey);
  } else {
    console.log("Creating binary market...");
    await (
      await binaryContract
        .connect(admin)
        .createMarket(
          TICKER,
          OPTION_TYPE,
          oracleAddress,
          STRIKE_PRICE,
          STRIKE_INCREMENT,
          optionExpiry,
        )
    ).wait();
    console.log("Binary market created:", marketKey);
  }

  if (SEED_ORDER) {
    const accountAddress = await getOrCreateAccount(ethers, deployer, accountFactory, accountRegistry);
    const account = await ethers.getContractAt("Account", accountAddress);

    console.log("Protocol account:  ", accountAddress);
    console.log("Depositing ETH for binary order testing...");
    await (await account.connect(deployer).depositETH({ value: ACCOUNT_ETH_DEPOSIT })).wait();

    const openAsks = await binaryOrderBook.getOpenOrders(marketKey, false);
    if (openAsks.length === 0) {
      console.log("Placing seed WRITE_OPTION ask...");
      await (
        await account
          .connect(deployer)
          .placeOrderBinaryMarginOption(
            binaryOrderBookAddress,
            marketKey,
            2, // WRITE_OPTION ask
            SEED_PAYOUT_AMOUNT,
            SEED_ASK_PRICE,
            0,
          )
      ).wait();
      console.log("Seed ask placed.");
    } else {
      console.log("Seed/open ask already exists.");
    }
  }

  const market = await binaryContract.getMarket(marketKey);
  const bidOrders = await binaryOrderBook.getOpenOrders(marketKey, true);
  const askOrders = await binaryOrderBook.getOpenOrders(marketKey, false);

  console.log("---- Binary market ----");
  console.log("marketKey:        ", marketKey);
  console.log("ticker:           ", market.ticker ?? market[4]);
  console.log("type:             ", OPTION_TYPE === 0 ? "Above" : "Below");
  console.log("oracle:           ", market.oracle ?? market[5]);
  console.log("baseToken:        ", market.baseToken ?? market[6]);
  console.log("paymentToken:     ", market.paymentToken ?? market[7], "(ETH)");
  console.log("strikePrice:      ", (market.strikePrice ?? market[10]).toString());
  console.log("strikeIncrement:  ", (market.strikeIncrement ?? market[11]).toString());
  console.log("expiry:           ", optionExpiry.toString(), new Date(Number(optionExpiry) * 1000).toISOString());
  console.log("active:           ", market.active ?? market[1]);
  console.log("settled:          ", market.settled ?? market[2]);
  console.log("open bids:        ", bidOrders.length);
  console.log("open asks:        ", askOrders.length);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
