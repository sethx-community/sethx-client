# Token icons

The client only displays bundled local icons for main protocol tokens and explicitly whitelisted token addresses. Unknown tokens intentionally use the neutral symbol fallback.

Bundled by the client:

- `sethx.png` from the SETHX logo supplied by the project.
- Core manually reviewed icons such as `eth.png`, `usdc.png`, `weth.png`, `wbtc.png`, `link.png`, `uni.png`, `aave.png`, `ldo.png`, and `dai.png`.

Download the common manually reviewed external icons with:

```bash
node src/scripts/download-token-icons.mjs
```

Import a larger reviewed JSON whitelist export, download icons, and generate the client mapping with:

```bash
node src/scripts/import-token-whitelist.mjs ./tokens.json --limit 100
```

The importer accepts a Dune-style JSON export with rows at `result.rows`, for example rows containing:

- `contract_address`
- `token_symbol`
- `qualification_category`
- `total_trades_30d`
- `volume_30d_usd`

Generated icon filenames include the token symbol and address prefix, for example `weth-c02aaa.png`, so duplicate symbols cannot overwrite each other. After importing, review and commit:

- `src/app/constants/generated-token-whitelist.ts`
- `src/assets/tokens/generated-token-whitelist.report.json`
- `src/assets/tokens/*.png`

The UI never hotlinks external token icons at runtime.
