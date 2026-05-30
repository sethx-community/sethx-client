#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const CODE_ONLY_CONTRACTS = new Set([
  'SethxToken',
  'FounderTokenTimelock',
  'SethxGovernor',
  'SethxTimelock',
]);

const addressKeyToContractName = {
  sethxToken: 'SethxToken',
  founderTokenTimelock: 'FounderTokenTimelock',
  treasuryAuthority: 'TreasuryAuthority',
  protocolTreasury: 'ProtocolTreasury',
  sethxTimelock: 'SethxTimelock',
  sethxGovernor: 'SethxGovernor',
  accountRegistry: 'AccountRegistry',
  sethxVault: 'SethxVault',
  priceManager: 'PriceManager',
  feeManager: 'FeeManager',
  tokenSpotOrderBook: 'TokenSpotOrderBook',
  nftSpotOrderBook: 'NFTSpotOrderBook',
  optionContract: 'OptionContract',
  optionsOrderBook: 'OptionsOrderBook',
  binaryMarginOptionContract: 'BinaryMarginOptionContract',
  binaryMarginOptionsOrderBook: 'BinaryMarginOptionsOrderBook',
  marginOptionContract: 'MarginOptionContract',
  marginOptionsOrderBook: 'MarginOptionsOrderBook',
  futuresContract: 'FuturesContract',
  futuresOrderBook: 'FuturesOrderBook',
  settlementManager: 'SettlementManager',
  lendingContract: 'LendingContract',
  lendingOrderBook: 'LendingOrderBook',
  optionsValuationAdapter: 'OptionsValuationAdapter',
  futuresValuationAdapter: 'FuturesValuationAdapter',
  valuationModule: 'ValuationModule',
  riskModule: 'RiskModule',
  liquidationEngine: 'LiquidationEngine',
  accountFactory: 'AccountFactory',
  lendingAccountFactory: 'LendingAccountFactory',
  treasuryPaymentsModule: 'TreasuryPaymentsModule',
  treasuryVaultModule: 'TreasuryVaultModule',
  treasuryTradeModule: 'TreasuryTradeModule',
  sethxFeeConversionOracle: 'SethxFeeConversionOracle',
  passiveFuturesSnapshotPublisher: 'PassiveFuturesSnapshotPublisher',
  passiveFuturesPoolFactory: 'PassiveFuturesPoolFactory',
};

const args = new Map();
for (let i = 2; i < process.argv.length; i += 1) {
  const arg = process.argv[i];
  if (arg.startsWith('--')) args.set(arg.slice(2), process.argv[++i]);
}

const deploymentPath = args.get('deployment');
const artifactsRoot = args.get('artifacts');
const outRoot = args.get('out') ?? 'src/app/contracts';
const buildArg = args.get('build') ?? args.get('network');

if (!deploymentPath || !artifactsRoot) {
  console.error([
    'Usage:',
    '  node scripts/sync-contracts.mjs --build local --deployment ../sethx-protocol/deployments/local/latest.json --artifacts ../sethx-protocol/artifacts/contracts',
    '',
    'Optional:',
    '  --build production|testnet|local',
    '  --out src/app/contracts',
    '',
    'The script reads deployments/<env>/latest.json and writes one strict address set for that build.',
  ].join('\n'));
  process.exit(1);
}

const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
if (!deployment.addresses || typeof deployment.addresses !== 'object') {
  throw new Error('Deployment file must contain an addresses object.');
}

function normalizeBuildName(value) {
  const raw = String(value ?? '').trim().toLowerCase();
  if (!raw) return undefined;
  if (['localhost', 'local', 'dev', 'development'].includes(raw)) return 'local';
  if (['prod', 'production', 'mainnet'].includes(raw)) return 'production';
  if (['test', 'testnet', 'sepolia'].includes(raw)) return 'testnet';
  return raw;
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const p = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(p) : [p];
  });
}

const deploymentEnvironment = normalizeBuildName(deployment.environment);
const build = normalizeBuildName(buildArg) ?? deploymentEnvironment ?? 'production';
const expectedChainByBuild = { local: '31337', testnet: '11155111', production: '1' };

if (buildArg && deploymentEnvironment && normalizeBuildName(buildArg) !== deploymentEnvironment) {
  console.warn(`[contracts] build '${normalizeBuildName(buildArg)}' differs from deployment environment '${deploymentEnvironment}'. Using build '${normalizeBuildName(buildArg)}'.`);
}

const expectedChainId = expectedChainByBuild[build];
if (expectedChainId && String(deployment.chainId) !== expectedChainId) {
  console.warn(`[contracts] ${build} build usually uses chainId ${expectedChainId}, but deployment file has chainId ${deployment.chainId}.`);
}

const artifactFiles = walk(artifactsRoot).filter((p) => p.endsWith('.json') && !p.endsWith('.dbg.json'));
const artifactByContractName = new Map();
for (const file of artifactFiles) {
  try {
    const artifact = JSON.parse(fs.readFileSync(file, 'utf8'));
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
  .filter((x) => x.contractName && typeof x.address === 'string' && /^0x[0-9a-fA-F]{40}$/.test(x.address));

const usable = [];
for (const entry of entries) {
  const artifact = artifactByContractName.get(entry.contractName);
  if (!artifact) {
    console.warn(`[contracts] Skipping ${entry.contractName}: no artifact found under ${artifactsRoot}`);
    continue;
  }
  usable.push({ ...entry, artifact });
}

if (usable.length === 0) {
  throw new Error('No usable contracts found. Check deployment.addresses and artifacts path.');
}

const contractsDir = path.resolve(outRoot);
const generatedDir = path.join(contractsDir, 'generated');
fs.mkdirSync(generatedDir, { recursive: true });

function writeFile(relativePath, content) {
  fs.writeFileSync(path.join(contractsDir, relativePath), content.replace(/\n+$/u, '') + '\n');
}

writeFile('generated/deployed-addresses.ts', [
  `export const CONTRACT_BUILD = ${JSON.stringify(build)} as const;`,
  `export const DEPLOYMENT_ENVIRONMENT = ${JSON.stringify(deployment.environment ?? null)} as const;`,
  `export const DEPLOYMENT_CHAIN_ID = ${JSON.stringify(String(deployment.chainId ?? ''))} as const;`,
  `export const DEPLOYMENT_UPDATED_AT = ${JSON.stringify(deployment.updatedAt ?? deployment.deployedAt ?? null)} as const;`,
  '',
  `export const DEPLOYED_ADDRESSES = ${JSON.stringify(deployment.addresses, null, 2)} as const;`,
  '',
].join('\n'));

writeFile('generated/addresses.ts', [
  "import { DEPLOYED_ADDRESSES } from './deployed-addresses';",
  '',
  'export const CONTRACT_ADDRESSES = {',
  ...usable.map((x) => `  ${x.contractName}: DEPLOYED_ADDRESSES.${x.addressKey},`),
  '} as const;',
  '',
].join('\n'));

writeFile('contract-names.ts', [
  'export type ContractName =',
  ...usable.map((x, index) => `  ${index === 0 ? '' : '| '}'${x.contractName}'`),
  ';',
  '',
  'export const CONTRACT_NAMES = [',
  ...usable.map((x) => `  '${x.contractName}',`),
  '] as const satisfies readonly ContractName[];',
  '',
].join('\n'));

writeFile('contract-identities.ts', [
  "import { ethers } from 'ethers';",
  "import { ContractName } from './contract-names';",
  "import { CONTRACT_ABIS } from './generated/abis';",
  "import { CONTRACT_ADDRESSES } from './generated/addresses';",
  '',
  "export const EXPECTED_CONTRACT_VERSION = '1.0.0';",
  '',
  'export const EXPECTED_CONTRACT_IDS = {',
  ...usable.map((x) => {
    const expectedId = CODE_ONLY_CONTRACTS.has(x.contractName) ? 'null' : `'${x.contractName}@1.0.0'`;
    return `  ${x.contractName}: ${expectedId},`;
  }),
  '} as const satisfies Partial<Record<ContractName, string | null>>;',
  '',
  'const validationCache = new Map<string, Promise<boolean>>();',
  '',
  'export function clearContractIdentityValidationCache(): void {',
  '  validationCache.clear();',
  '}',
  '',
  'export function contractIdentityErrorMessage(label: string, address?: string | null): string {',
  '  return `${label} is not available or does not match the expected contract id${address ? ` at ${address}` : ""}.`;',
  '}',
  '',
  'export async function validateContractIdentity(',
  '  provider: ethers.Provider,',
  '  address: string | null | undefined,',
  '  expectedId: string | null | undefined,',
  "  label = 'contract',",
  '): Promise<boolean> {',
  '  if (!address || address === ethers.ZeroAddress) {',
  '    console.warn(`[contracts] ${label} has no configured address.`);',
  '    return false;',
  '  }',
  '',
  '  const key = `${address.toLowerCase()}::${expectedId ?? "code-only"}`;',
  '  let cached = validationCache.get(key);',
  '  if (!cached) {',
  '    cached = performContractIdentityValidation(provider, address, expectedId, label);',
  '    validationCache.set(key, cached);',
  '  }',
  '  return cached;',
  '}',
  '',
  'export async function validatedContractOrNull(',
  '  provider: ethers.Provider | null | undefined,',
  '  address: string | null | undefined,',
  '  abi: ethers.InterfaceAbi,',
  '  expectedId: string | null | undefined,',
  "  label = 'contract',",
  '): Promise<ethers.Contract | null> {',
  '  if (!provider || !(await validateContractIdentity(provider, address, expectedId, label))) {',
  '    return null;',
  '  }',
  '  return new ethers.Contract(address!, abi, provider);',
  '}',
  '',
  'export async function validatedConfiguredContractOrNull(',
  '  provider: ethers.Provider | null | undefined,',
  '  name: ContractName,',
  '): Promise<ethers.Contract | null> {',
  '  const address = CONTRACT_ADDRESSES[name];',
  '  const abi = CONTRACT_ABIS[name];',
  '  const expectedId = EXPECTED_CONTRACT_IDS[name];',
  '  return validatedContractOrNull(provider, address, abi, expectedId, name);',
  '}',
  '',
  'async function performContractIdentityValidation(',
  '  provider: ethers.Provider,',
  '  address: string,',
  '  expectedId: string | null | undefined,',
  '  label: string,',
  '): Promise<boolean> {',
  '  try {',
  "    if ((await provider.getCode(address)) === '0x') {",
  '      console.warn(`[contracts] ${label} is not deployed at ${address}`);',
  '      return false;',
  '    }',
  '',
  '    if (expectedId === null) {',
  '      return true;',
  '    }',
  '',
  '    if (!expectedId) {',
  '      console.warn(`[contracts] ${label} has no expected contract id.`);',
  '      return false;',
  '    }',
  '',
  "    const contract = new ethers.Contract(address, ['function contractId() view returns (string)'], provider);",
  "    const actualId = String(await contract['contractId']());",
  '    if (actualId !== expectedId) {',
  '      console.warn(`[contracts] ${label} identity mismatch at ${address}: expected ${expectedId}, got ${actualId}`);',
  '      return false;',
  '    }',
  '    return true;',
  '  } catch (error) {',
  '    console.warn(`[contracts] ${label} identity check failed at ${address}`, error);',
  '    return false;',
  '  }',
  '}',
  '',
].join('\n'));

writeFile('ignition-artifact-map.ts', [
  '// Deprecated: deployments/<env>/latest.json is the source of truth.',
  'export const DEPLOYMENT_ADDRESS_KEYS = {',
  ...usable.map((x) => `  ${x.contractName}: '${x.addressKey}',`),
  '} as const;',
  '',
].join('\n'));

const abiParts = ["import { ethers } from 'ethers';", ''];
for (const x of usable) {
  abiParts.push(`export const ${x.contractName}Abi = ${JSON.stringify(x.artifact.abi, null, 2)} as const satisfies ethers.InterfaceAbi;`, '');
}
abiParts.push('export const CONTRACT_ABIS = {');
for (const x of usable) abiParts.push(`  ${x.contractName}: ${x.contractName}Abi,`);
abiParts.push('} as const;', '');
writeFile('generated/abis.ts', abiParts.join('\n'));

console.log(`Wrote ${usable.length} contract entries for ${build} from ${deploymentPath}`);
