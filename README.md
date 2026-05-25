# SETHX Client

SETHX Client is the open-source local client app for interacting with SETHX-compatible smart contracts through a user-controlled wallet.

The client helps users connect a wallet, view protocol accounts and assets, inspect markets, review transaction details, and prepare transactions for signing in their own wallet.

SETHX Community is not currently operating this client as a public hosted trading website. The initial model is local/source software, developer review, and local browser releases.

## What is included

- Wallet connection through Reown AppKit
- Protocol accounts and asset views
- Token spot, NFT spot, futures, options, binary options, margin options, and lending modules
- Protocol and fee reference pages
- Transaction review and order flow components
- Contract addresses and ABIs for supported deployments
- Environment-specific configuration for local, testnet, and production builds

## Release and interface model

SETHX Client is released first as local/source software and as a local browser package.

For release formats, checksums, and versioning, see [`RELEASES.md`](./RELEASES.md).

For third-party websites, forks, hosted interfaces, and unofficial deployments, see [`THIRD_PARTY_INTERFACES.md`](./THIRD_PARTY_INTERFACES.md).

For general user responsibility and risk wording, see [`DISCLAIMER.md`](./DISCLAIMER.md).

## Development

Install dependencies from the lockfile:

```bash
npm ci
```

Start the local development server:

```bash
npm start
```

This uses the local configuration.

You can also run specific environments:

```bash
npm run start:local
npm run start:testnet
```

Build the client:

```bash
npm run build:local
npm run build:testnet
npm run build:prod
```

## Environments

The client uses separate environment files for local, testnet, and production builds.

- `local` is intended for local development, including local Hardhat-style deployments.
- `testnet` is intended for public testnet deployments and testing.
- `production` is intended for finalized production deployment configuration.

Always verify the selected network and contract addresses before signing transactions.

More detailed environment setup instructions will be added as the testnet and production deployment process matures.

## Open-source model

SETHX Client is built and maintained by community contributors. Contributions can include bug fixes, design improvements, documentation, testing, security review, accessibility improvements, and protocol integrations.

Protocol governance is separate from this client. The client can display protocol data and help users interact with contracts, while protocol-level roles, parameters, deployments, and upgrades are controlled by the SETHX governance process.

## Security

Never enter a seed phrase or private key into this app. The client connects to external wallets and asks the wallet to review and sign transactions.

Report security issues through the process described in [`SECURITY.md`](./SECURITY.md).

## License

This project is released under the MIT License. See [`LICENSE`](./LICENSE).
