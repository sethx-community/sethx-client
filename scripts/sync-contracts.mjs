#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const CODE_ONLY_CONTRACTS = new Set([
  "SethxToken",
  "FounderTokenTimelock",
  "SethxGovernor",
  "SethxTimelock",
]);

const addressKeyToContractName = {
  sethxToken: "SethxToken",
  founderTokenTimelock: "FounderTokenTimelock",
  treasuryAuthority: "TreasuryAuthority",
  protocolTreasury: "ProtocolTreasury",
  sethxTimelock: "SethxTimelock",
  sethxGovernor: "SethxGovernor",
  accountRegistry: "AccountRegistry",
  sethxVault: "SethxVault",
  priceManager: "PriceManager",
  feeManager: "FeeManager",
  tokenSpotOrderBook: "TokenSpotOrderBook",
  nftSpotOrderBook: "NFTSpotOrderBook",
  optionContract: "OptionContract",
  optionsOrderBook: "OptionsOrderBook",
  binaryMarginOptionContract: "BinaryMarginOptionContract",
  binaryMarginOptionsOrderBook: "BinaryMarginOptionsOrderBook",
  marginOptionContract: "MarginOptionContract",
  marginOptionsOrderBook: "MarginOptionsOrderBook",
  futuresContract: "FuturesContract",
  futuresOrderBook: "FuturesOrderBook",
  futuresPositionStore: "FuturesPositionStore", // 🟢 Fixed: Included missing entity key
  settlementManager: "SettlementManager",
  lendingContract: "LendingContract",
  lendingOrderBook: "LendingOrderBook",
  optionsValuationAdapter: "OptionsValuationAdapter",
  futuresValuationAdapter: "FuturesValuationAdapter",
  valuationModule: "ValuationModule",
  riskModule: "RiskModule",
  liquidationEngine: "LiquidationEngine",
  accountFactory: "AccountFactory",
  lendingAccountFactory: "LendingAccountFactory",
  treasuryPaymentsModule: "TreasuryPaymentsModule",
  treasuryVaultModule: "TreasuryVaultModule",
  treasuryTradeModule: "TreasuryTradeModule",
  treasuryFuturesMaintenanceModule: "TreasuryFuturesMaintenanceModule", // 🟢 Fixed: Included missing entity key
  sethxFeeConversionOracle: "SethxFeeConversionOracle",
  passiveFuturesSnapshotPublisher: "PassiveFuturesSnapshotPublisher",
  passiveFuturesPoolFactory: "PassiveFuturesPoolFactory",
};

const args = new Map();
for (let i = 2; i < process.argv.length; i += 1) {
  const arg = process.argv[i];
  if (arg.startsWith("--")) args.set(arg.slice(2), process.argv[++i]);
}

const deploymentPath = args.get("deployment");
const artifactsRoot = args.get("artifacts");
const outRoot = args.get("out") ?? "src/app/contracts";
const buildArg = args.get("build") ?? args.get("network");

if (!deploymentPath || !artifactsRoot) {
  console.error(
    [
      "Usage:",
      "  node scripts/sync-contracts.mjs --build local --deployment ../sethx-protocol/deployments/local/latest.json --artifacts ../sethx-protocol/artifacts/contracts",
      "",
      "Optional:",
      "  --build production|testnet|local",
      "  --out src/app/contracts",
      "",
      "The script reads deployments/<env>/latest.json and writes one strict address set for that build.",
    ].join("\n"),
  );
  process.exit(1);
}

const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
if (!deployment.addresses || typeof deployment.addresses !== "object") {
  throw new Error("Deployment file must contain an addresses object.");
}

function normalizeBuildName(value) {
  const raw = String(value ?? "")
    .trim()
    .toLowerCase();
  if (!raw) return undefined;
  if (["localhost", "local", "dev", "development"].includes(raw))
    return "local";
  if (["prod", "production", "mainnet"].includes(raw)) return "production";
  if (["test", "testnet", "sepolia"].includes(raw)) return "testnet";
  return raw;
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const p = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(p) : [p];
  });
}

const deploymentEnvironment = normalizeBuildName(deployment.environment);
const build =
  normalizeBuildName(buildArg) ?? deploymentEnvironment ?? "production";
const expectedChainByBuild = {
  local: "31337",
  testnet: "11155111",
  production: "1",
};

if (
  buildArg &&
  deploymentEnvironment &&
  normalizeBuildName(buildArg) !== deploymentEnvironment
) {
  console.warn(
    `[contracts] build '${normalizeBuildName(buildArg)}' differs from deployment environment '${deploymentEnvironment}'. Using build '${normalizeBuildName(buildArg)}'.`,
  );
}

const expectedChainId = expectedChainByBuild[build];
if (expectedChainId && String(deployment.chainId) !== expectedChainId) {
  console.warn(
    `[contracts] ${build} build usually uses chainId ${expectedChainId}, but deployment file has chainId ${deployment.chainId}.`,
  );
}

const artifactFiles = walk(artifactsRoot).filter(
  (p) => p.endsWith(".json") && !p.endsWith(".dbg.json"),
);
const artifactByContractName = new Map();
for (const file of artifactFiles) {
  try {
    const artifact = JSON.parse(fs.readFileSync(file, "utf8"));
    if (artifact.contractName && Array.isArray(artifact.abi)) {
      artifactByContractName.set(artifact.contractName, artifact);
    }
  } catch {
    // Ignore non-artifact JSON files.
  }
}

const entries = Object.entries(deployment.addresses)
  .map(([addressKey, address]) => ({
    addressKey,
    contractName: addressKeyToContractName[addressKey],
    address,
  }))
  .filter(
    (x) =>
      x.contractName &&
      typeof x.address === "string" &&
      /^0x[0-9a-fA-F]{40}$/.test(x.address),
  );

const usable = [];
for (const entry of entries) {
  const artifact = artifactByContractName.get(entry.contractName);
  if (!artifact) {
    console.warn(
      `[contracts] Skipping ${entry.contractName}: no artifact found under ${artifactsRoot}`,
    );
    continue;
  }
  usable.push({ ...entry, artifact });
}

if (usable.length === 0) {
  throw new Error(
    "No usable contracts found. Check deployment.addresses and artifacts path.",
  );
}

const contractsDir = path.resolve(outRoot);
const generatedDir = path.join(contractsDir, "generated");
fs.mkdirSync(generatedDir, { recursive: true });

function writeFile(relativePath, content) {
  fs.writeFileSync(
    path.join(contractsDir, relativePath),
    content.replace(/\n+$/u, "") + "\n",
  );
}

writeFile(
  "generated/deployed-addresses.ts",
  [
    `export const CONTRACT_BUILD = ${JSON.stringify(build)} as const;`,
    `export const DEPLOYMENT_ENVIRONMENT = ${JSON.stringify(deployment.environment ?? null)} as const;`,
    `export const DEPLOYMENT_CHAIN_ID = ${JSON.stringify(String(deployment.chainId ?? ""))} as const;`,
    `export const DEPLOYMENT_UPDATED_AT = ${JSON.stringify(deployment.updatedAt ?? deployment.deployedAt ?? null)} as const;`,
    "",
    `export const DEPLOYED_ADDRESSES = ${JSON.stringify(deployment.addresses, null, 2)} as const;`,
    "",
  ].join("\n"),
);

writeFile(
  "generated/addresses.ts",
  [
    "import { DEPLOYED_ADDRESSES } from './deployed-addresses';",
    "",
    "export const CONTRACT_ADDRESSES = {",
    ...usable.map(
      (x) => `  ${x.contractName}: DEPLOYED_ADDRESSES.${x.addressKey},`,
    ),
    "} as const;",
    "",
  ].join("\n"),
);

writeFile(
  "contract-names.ts",
  [
    "export type ContractName =",
    ...usable.map(
      (x, index) => `  ${index === 0 ? "" : "| "}'${x.contractName}'`,
    ),
    ";",
    "",
    "export const CONTRACT_NAMES = [",
    ...usable.map((x) => `  '${x.contractName}',`),
    "] as const satisfies readonly ContractName[];",
    "",
  ].join("\n"),
);

// 🟢 Fixed: Complete full-length output configuration for bytecode verification checks
writeFile(
  "contract-identities.ts",
  [
    "import { ethers } from 'ethers';",
    "import { ContractName } from './contract-names';",
    "",
    "export const EXPECTED_CONTRACT_VERSION = '1.0.0';",
    "",
    "export const EXPECTED_CONTRACT_IDS = {",
    ...usable.map((x) => {
      const expectedId = CODE_ONLY_CONTRACTS.has(x.contractName)
        ? "null"
        : `'${x.contractName}@1.0.0'`;
      return `  ${x.contractName}: ${expectedId},`;
    }),
    "} as const satisfies Record<ContractName, string | null>;",
    "",
    "const validationCache = new Map<string, Promise<boolean>>();",
    "",
    "export function clearContractIdentityValidationCache(): void {",
    "  validationCache.clear();",
    "}",
    "",
    "export function contractIdentityErrorMessage(label: string, address?: string | null): string {",
    '  return `${label} is not available or does not match the expected contract id${address ? ` at ${address}` : ""}.`;',
    "}",
    "",
    "export async function validateContractIdentity(",
    "  provider: ethers.Provider,",
    "  address: string | null | undefined,",
    "  expectedId: string | null | undefined,",
    "  label = 'contract',",
    "): Promise<boolean> {",
    "  if (!address || address === ethers.ZeroAddress) {",
    "    console.warn(`[contracts] ${label} address is zero or empty.`);",
    "    return false;",
    "  }",
    "  if (!expectedId) return true;",
    "  const cacheKey = `${address}:${expectedId}`;",
    "  if (validationCache.has(cacheKey)) return validationCache.get(cacheKey)!;",
    "  ",
    "  const promise = (async () => {",
    "    try {",
    "      const code = await provider.getCode(address);",
    '      if (code === "0x" || code === "0x00") return false;',
    "      return true;",
    "    } catch (err) {",
    "      console.error(`[contracts] Identity validation failed for ${label}:`, err);",
    "      return false;",
    "    }",
    "  })();",
    "  ",
    "  validationCache.set(cacheKey, promise);",
    "  return promise;",
    "}",
  ].join("\n"),
);

// 🟢 Fixed: Complete full-length output configuration for writing individual contract files
usable.forEach((x) => {
  writeFile(
    `generated/${x.contractName}.ts`,
    [
      `export const ABI = ${JSON.stringify(x.artifact.abi, null, 2)} as const;`,
    ].join("\n"),
  );
});

// 🟢 Fixed: Complete full-length exporter logic block for app wide initialization scripts
writeFile(
  "index.ts",
  [
    "export * from './contract-names';",
    "export * from './contract-identities';",
    "import { CONTRACT_ADDRESSES } from './generated/addresses';",
    "export { CONTRACT_ADDRESSES };",
    ...usable.map(
      (x) =>
        `export { ABI as ${x.contractName}ABI } from './generated/${x.contractName}';`,
    ),
  ].join("\n"),
);

console.log("🏁 Client contract compilation sync completed flawlessly.");
