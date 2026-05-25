# Contributing to SETHX Client

SETHX Client is a community-maintained open-source project. Contributions are welcome.

## Ways to contribute

- Improve documentation
- Report bugs with clear reproduction steps
- Improve UI and accessibility
- Add or improve tests
- Review contract integrations
- Improve transaction review flows
- Improve environment and release setup
- Help maintain release notes and setup guides
- Review security-sensitive wallet and transaction flows

## Development workflow

1. Fork the repository.
2. Create a feature branch.
3. Install dependencies with `npm ci`.
4. Make your changes.
5. Run the relevant builds before opening a pull request.
6. Open a pull request with a clear description.

Recommended local checks:

```bash
npm ci
npm run build:local
npm run build:testnet
npm run build:prod
```

For smaller changes, at minimum run:

```bash
npm run build:prod
```

## Pull request guidelines

- Keep changes focused.
- Explain why the change is needed.
- Include screenshots for UI changes where useful.
- Do not include private keys, seed phrases, RPC secrets, API keys, or personal wallet data.
- Do not change contract addresses, generated ABIs, or deployment configuration unless the change is tied to a documented deployment update.
- Do not mix unrelated dependency updates with feature changes.
- Consider whether the change affects transaction safety, wallet behavior, or contract interaction.

## Environment changes

Environment-specific configuration should stay explicit.

Use:

- local configuration for local development;
- testnet configuration for testnet deployments;
- production configuration only for finalized production deployment settings.

Do not silently reuse local Hardhat addresses in testnet or production builds.

## Security-sensitive changes

Changes involving the following areas require extra review:

- wallet connection;
- transaction construction;
- transaction preview;
- contract addresses;
- ABIs;
- network selection;
- signature requests;
- release packaging;
- dependency updates.

## Maintainers

Maintainers review pull requests, coordinate releases, and help keep the client aligned with the SETHX protocol.

Protocol-level governance decisions remain separate from client maintenance.
