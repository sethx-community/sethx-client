# Token icons

The client only displays bundled local icons for main protocol tokens and explicitly whitelisted token addresses. Unknown tokens intentionally use the neutral symbol fallback.

Bundled by this patch:

- `sethx.png` from the SETHX logo supplied by the project.

Download the common external icons with:

```bash
node src/scripts/download-token-icons.mjs
```

The script downloads:

- `eth.png` from Trust Wallet Ethereum chain info
- `usdc.png` from Trust Wallet Ethereum USDC asset folder
- `weth.png` from Trust Wallet Ethereum WETH asset folder

After downloading, commit the PNG files so the UI never hotlinks external assets at runtime.
