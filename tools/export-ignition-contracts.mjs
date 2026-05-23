#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const chainId = process.argv[2] ?? '31337';
const projectRoot = repoRoot;
const appRoot = path.join(projectRoot, 'src', 'app');
const ignitionRoot = path.join(repoRoot, 'ignition', 'deployments', `chain-${chainId}`);
const generatedOut = path.join(appRoot, 'contracts', 'generated');
const artifactMapPath = path.join(appRoot, 'contracts', 'ignition-artifact-map.ts');

function readArtifactMap(source) {
  return [...source.matchAll(/\s([A-Za-z0-9_]+): '([^']+)'/g)].map((m) => [m[1], m[2]]);
}

const entries = readArtifactMap(fs.readFileSync(artifactMapPath, 'utf8'));
const addresses = JSON.parse(fs.readFileSync(path.join(ignitionRoot, 'deployed_addresses.json'), 'utf8'));
fs.mkdirSync(generatedOut, { recursive: true });

const localAddresses = Object.fromEntries(entries.map(([name, artifactName]) => [name, addresses[artifactName] ?? '']));

fs.writeFileSync(
  path.join(generatedOut, 'addresses.ts'),
  `import { NetworkName } from '../../constants/networks';\nimport { ContractName } from '../contract-names';\n\nexport type ContractAddressBook = Record<NetworkName, Partial<Record<ContractName, string>>>;\n\nexport const LOCALHOST_CONTRACT_ADDRESSES = ${JSON.stringify(localAddresses, null, 2)} as const satisfies Partial<Record<ContractName, string>>;\n\nexport const CONTRACT_ADDRESSES = {\n  localhost: LOCALHOST_CONTRACT_ADDRESSES,\n  mainnet: {},\n  arbitrum: {},\n} as const satisfies ContractAddressBook;\n`,
);

fs.writeFileSync(
  path.join(generatedOut, 'deployed-addresses.ts'),
  `export const IGNITION_DEPLOYED_ADDRESSES = ${JSON.stringify(addresses, null, 2)} as const;\n`,
);

let abiSource = `import { ethers } from 'ethers';\n\n`;
let abiMapSource = '';
for (const [name, artifactName] of entries) {
  const artifactPath = path.join(ignitionRoot, 'artifacts', `${artifactName}.json`);
  if (!fs.existsSync(artifactPath)) {
    console.warn(`Skipping ${name}: artifact not found at ${artifactPath}`);
    continue;
  }

  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
  const constName = `${name}Abi`;
  abiSource += `export const ${constName} = ${JSON.stringify(artifact.abi)} as const satisfies ethers.InterfaceAbi;\n\n`;
  abiMapSource += `  ${name}: ${constName},\n`;
}

abiSource += `export const CONTRACT_ABIS = {\n${abiMapSource}} as const;\n`;
fs.writeFileSync(path.join(generatedOut, 'abis.ts'), abiSource);
fs.writeFileSync(path.join(generatedOut, 'index.ts'), `export * from './addresses';\nexport * from './abis';\nexport * from './deployed-addresses';\n`);

console.log(`Exported contract addresses and ABIs for chain ${chainId} to ${generatedOut}`);
