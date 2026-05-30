#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const syncContracts = path.join(__dirname, 'sync-contracts.mjs');
const result = spawnSync(process.execPath, [syncContracts, ...process.argv.slice(2)], {
  stdio: 'inherit',
  shell: false,
});
process.exit(result.status ?? 1);
