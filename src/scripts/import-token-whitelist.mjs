#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const TRUSTWALLET_ETHEREUM_ASSETS = 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum';
const GENERATED_TS = 'src/app/constants/generated-token-whitelist.ts';
const TOKEN_ASSET_DIR = 'src/assets/tokens';
const REPORT_JSON = 'src/assets/tokens/generated-token-whitelist.report.json';

let getAddress = (address) => String(address ?? '').trim();
let isAddress = (address) => /^0x[a-fA-F0-9]{40}$/.test(String(address ?? '').trim());

async function loadAddressHelpers() {
  try {
    const ethers = await import('ethers');
    getAddress = ethers.getAddress;
    isAddress = ethers.isAddress;
  } catch {
    console.warn('[import-token-whitelist] ethers package was not found; using lowercase addresses for icon URLs. Run this from the client project root for checksum Trust Wallet paths.');
    const fallbackGetAddress = getAddress;
    getAddress = (address) => fallbackGetAddress(address).toLowerCase();
  }
}

function parseArgs(argv) {
  const args = new Map();
  const positionals = [];

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith('--')) {
      positionals.push(arg);
      continue;
    }

    const key = arg.slice(2);
    const next = argv[i + 1];
    const value = next === undefined || next.startsWith('--') ? 'true' : argv[++i];
    const values = args.get(key) ?? [];
    values.push(value);
    args.set(key, values);
  }

  return {
    input: args.get('input')?.at(-1) ?? positionals[0],
    chain: args.get('chain')?.at(-1) ?? 'ethereum',
    limit: numberArg(args.get('limit')?.at(-1)),
    minVolumeUsd: numberArg(args.get('min-volume-usd')?.at(-1)),
    minTrades30d: numberArg(args.get('min-trades-30d')?.at(-1)),
    noDownload: args.has('no-download'),
    dryRun: args.has('dry-run'),
    overwrite: args.has('overwrite'),
  };
}

function numberArg(value) {
  if (value === undefined) return undefined;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) throw new Error(`Invalid numeric argument: ${value}`);
  return n;
}

function usage() {
  return [
    'Usage:',
    '  node src/scripts/import-token-whitelist.mjs <dune-result.json> [options]',
    '',
    'Options:',
    '  --input <file>             JSON file. Defaults to first positional argument.',
    '  --limit <n>                Import at most n rows after filtering.',
    '  --min-volume-usd <n>       Skip rows below this 30d USD volume.',
    '  --min-trades-30d <n>       Skip rows below this 30d trade count.',
    '  --no-download              Generate whitelist/icon mapping without downloading icons.',
    '  --dry-run                  Print what would change, but do not write files.',
    '  --overwrite                Re-download existing icon files.',
    '',
    'Input format:',
    '  Dune-style JSON with rows at result.rows, or a direct array of rows.',
  ].join('\n');
}

function readRows(json) {
  const rows = Array.isArray(json)
    ? json
    : Array.isArray(json?.result?.rows)
      ? json.result.rows
      : Array.isArray(json?.rows)
        ? json.rows
        : undefined;

  if (!rows) {
    throw new Error('Could not find rows. Expected an array, rows[], or result.rows[].');
  }

  return rows;
}

function cleanSymbol(value) {
  const raw = String(value ?? '').trim();
  const cleaned = raw.replace(/[^a-zA-Z0-9._+-]/g, '').slice(0, 24);
  return cleaned || 'TOKEN';
}

function iconFileName(symbol, checksumAddress) {
  const slug = cleanSymbol(symbol).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'token';
  return `${slug}-${checksumAddress.slice(2, 8).toLowerCase()}.png`;
}

function formatUsd(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return undefined;
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(2)}K`;
  return `$${n.toFixed(2)}`;
}

function formatInteger(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return undefined;
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n);
}

function rowToToken(row) {
  const rawAddress = row.contract_address ?? row.address ?? row.token_address ?? row.token;
  if (!rawAddress || !isAddress(rawAddress)) return undefined;

  const checksum = getAddress(rawAddress);
  const symbol = cleanSymbol(row.token_symbol ?? row.symbol ?? row.ticker ?? 'TOKEN').toUpperCase();
  const category = String(row.qualification_category ?? row.category ?? 'Imported').trim() || 'Imported';
  const volume = Number(row.volume_30d_usd ?? row.volume_usd ?? row.volume ?? 0);
  const trades = Number(row.total_trades_30d ?? row.trades_30d ?? row.trades ?? 0);

  return {
    symbol,
    address: checksum,
    key: checksum.toLowerCase(),
    category,
    volume30dUsd: Number.isFinite(volume) ? volume : 0,
    trades30d: Number.isFinite(trades) ? trades : 0,
    iconFile: iconFileName(symbol, checksum),
  };
}

function buildNote(token) {
  const parts = [token.category];
  const volume = formatUsd(token.volume30dUsd);
  const trades = formatInteger(token.trades30d);
  if (volume) parts.push(`30d volume ${volume}`);
  if (trades) parts.push(`30d trades ${trades}`);
  return parts.join(' · ');
}

function tsString(value) {
  return JSON.stringify(value);
}

function renderGeneratedTs(tokens, icons) {
  const tokenRows = tokens
    .map((token) => [
      '  {',
      `    symbol: ${tsString(token.symbol)},`,
      `    address: ${tsString(token.address)},`,
      `    note: ${tsString(buildNote(token))},`,
      '  },',
    ].join('\n'))
    .join('\n');

  const iconRows = [...icons.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([address, icon]) => `  ${tsString(address)}: ${tsString(icon)},`)
    .join('\n');

  return `import type { WhitelistedTokenConfig } from './token-whitelist';\n\n// This file is generated by src/scripts/import-token-whitelist.mjs.\n// It is safe to commit. Do not hand-edit imported token rows here; regenerate\n// from the reviewed JSON export instead.\nexport const GENERATED_WHITELISTED_TOKENS = [\n${tokenRows}\n] as const satisfies readonly WhitelistedTokenConfig[];\n\nexport const GENERATED_TOKEN_ICON_BY_ADDRESS = {\n${iconRows}\n} as const satisfies Record<string, string>;\n`;
}

async function downloadIcon(token, destination, overwrite) {
  if (!overwrite && existsSync(destination)) {
    return { status: 'exists', url: undefined };
  }

  const url = `${TRUSTWALLET_ETHEREUM_ASSETS}/assets/${token.address}/logo.png`;
  const response = await fetch(url);
  if (!response.ok) {
    return { status: 'missing', url, error: `${response.status} ${response.statusText}` };
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length === 0) return { status: 'missing', url, error: 'empty response' };
  await writeFile(destination, bytes);
  return { status: 'downloaded', url, bytes: bytes.length };
}

async function main() {
  await loadAddressHelpers();

  const args = parseArgs(process.argv);
  if (!args.input) {
    console.error(usage());
    process.exitCode = 1;
    return;
  }

  if (args.chain !== 'ethereum') {
    throw new Error(`Only --chain ethereum is currently supported by the Trust Wallet icon downloader. Received: ${args.chain}`);
  }

  const json = JSON.parse(await readFile(args.input, 'utf8'));
  const rows = readRows(json);
  const seen = new Set();
  const tokens = [];

  for (const row of rows) {
    const token = rowToToken(row);
    if (!token) continue;
    if (args.minVolumeUsd !== undefined && token.volume30dUsd < args.minVolumeUsd) continue;
    if (args.minTrades30d !== undefined && token.trades30d < args.minTrades30d) continue;
    if (seen.has(token.key)) continue;

    seen.add(token.key);
    tokens.push(token);
    if (args.limit !== undefined && tokens.length >= args.limit) break;
  }

  if (tokens.length === 0) {
    throw new Error('No valid token rows found after filtering.');
  }

  const icons = new Map();
  const report = [];

  console.log(`Importing ${tokens.length} token(s) from ${args.input}`);
  console.log(`Writing generated whitelist: ${GENERATED_TS}`);
  console.log(`Token icon directory: ${TOKEN_ASSET_DIR}`);

  if (!args.dryRun) await mkdir(TOKEN_ASSET_DIR, { recursive: true });

  for (const token of tokens) {
    const relativeIcon = `assets/tokens/${token.iconFile}`;
    const destination = path.join(TOKEN_ASSET_DIR, token.iconFile);
    let iconStatus = { status: args.noDownload ? 'not-downloaded' : 'pending' };

    if (!args.noDownload && !args.dryRun) {
      try {
        iconStatus = await downloadIcon(token, destination, args.overwrite);
      } catch (error) {
        iconStatus = { status: 'error', error: error instanceof Error ? error.message : String(error) };
      }
    }

    // Keep an icon mapping even if the download fails; that makes missing icons easy
    // to see in review and lets you add a local PNG manually with the same filename.
    icons.set(token.key, relativeIcon);

    report.push({
      symbol: token.symbol,
      address: token.address,
      note: buildNote(token),
      icon: relativeIcon,
      iconStatus,
    });

    const status = iconStatus.status ?? 'prepared';
    console.log(`${token.symbol.padEnd(12)} ${token.address} ${status} ${relativeIcon}`);
  }

  const generatedTs = renderGeneratedTs(tokens, icons);

  if (args.dryRun) {
    console.log('\n--- generated TypeScript preview ---');
    console.log(generatedTs);
    return;
  }

  await writeFile(GENERATED_TS, generatedTs);
  await writeFile(REPORT_JSON, `${JSON.stringify({ generatedAt: new Date().toISOString(), source: args.input, tokens: report }, null, 2)}\n`);

  console.log(`\nDone. Review and commit:`);
  console.log(`  ${GENERATED_TS}`);
  console.log(`  ${REPORT_JSON}`);
  console.log(`  ${TOKEN_ASSET_DIR}/*.png`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
