# SETHX Client

The SETHX Client is a local browser client for interacting with the SETHX protocol.

It is intended to help users inspect protocol data, connect a wallet, review contract state, and interact with deployed protocol contracts from their own environment.

This is not a public hosted trading website. It is local client software that can be reviewed, built, and run by the user.

## Community discussions

The main public discussion space for SETHX Community is here:

https://github.com/sethx-community/sethx-site/discussions

Use Discussions for:

- questions
- introductions
- ideas
- proposal drafts
- contributor onboarding
- documentation feedback
- protocol and tooling discussion

Use this repository’s Issues only for confirmed bugs or specific development tasks related to the client.

## Why the client is local

SETHX Community is first building transparent protocol tooling, documentation, and governance infrastructure.

Public protocol interfaces can have different legal and licensing requirements depending on the country. For that reason, the community starts with open local tooling and can later support country-specific interfaces where legally allowed or properly licensed.

## Development

Install dependencies:

```bash
npm install
```

Start the local development server:

```bash
npm start
```

or:

```bash
ng serve
```

Then open:

```text
http://localhost:4200/
```

## Build

Create a production build:

```bash
npm run build
```

or:

```bash
ng build
```

The build output is written to the `dist/` directory.

## Browser release package

If the repository includes the browser release packaging script, create a downloadable local browser version with:

```bash
npm run release:browser
```

This creates a zip package in:

```text
release/
```

The package includes a local server startup script and checksum file.

## Security

Never enter seed phrases or private keys into the client.

Always verify:

- the connected wallet
- the selected network
- contract addresses
- transaction details shown by your wallet
- whether you are using a testnet or production deployment

Please do not report security vulnerabilities publicly. Use the responsible disclosure process in the organization security policy:

https://github.com/sethx-community/.github/blob/main/SECURITY.md

## Governance

Protocol-level ideas, parameter changes, treasury permissions, and other governance topics should first be discussed in the main community Discussions board:

https://github.com/sethx-community/sethx-site/discussions

When needed, ideas can become signal proposals or executable proposals in the SETHX Governance Portal.

## Contributing

Contributors are welcome.

Good contribution areas include:

- frontend development
- wallet and network UX
- protocol data display
- documentation
- testing
- translations
- accessibility
- security review
- issue triage

For broader questions or contribution ideas, start in Discussions:

https://github.com/sethx-community/sethx-site/discussions

Use pull requests for concrete changes to this repository.

All contributors are expected to follow the SETHX Community Code of Conduct:

https://github.com/sethx-community/.github/blob/main/CODE_OF_CONDUCT.md
