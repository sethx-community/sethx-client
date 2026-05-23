# SETHX Client

SETHX Client is the open-source app for interacting with the SETHX protocol on Ethereum.

The client helps users connect a wallet, view protocol accounts and assets, inspect markets, review transaction details, and prepare transactions for signing in their own wallet.

## What is included

- Wallet connection through Reown AppKit
- Protocol accounts and asset views
- Token spot, NFT spot, futures, options, binary options, margin options, and lending modules
- Protocol and fee reference pages
- Transaction review and order flow components
- Contract addresses and ABIs for supported deployments

## Development

Install dependencies:

```bash
npm install
```

Start the local dev server:

```bash
npm start
```

Build the client:

```bash
npm run build
```

## Open-source model

SETHX Client is built and maintained by community contributors. Contributions can include bug fixes, design improvements, documentation, translations, testing, security review, and new protocol integrations.

Protocol governance is separate from this client. The client can display protocol data and help users interact with contracts, while protocol-level roles, parameters, deployments, and upgrades are controlled by the SETHX governance process.

## Security

Never enter a seed phrase or private key into this app. The client connects to external wallets and asks the wallet to review and sign transactions.

Report security issues through the process described in [SECURITY.md](./SECURITY.md).

## License

This project is released under the MIT License. See [LICENSE](./LICENSE).
