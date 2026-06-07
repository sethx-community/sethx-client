# SETHX Client

Welcome to the **SETHX Client** repository. This codebase represents the official frontend workspace interface for the SETHX decentralized trading ecosystem.

## 🚀 Accessing the Platform

The SETHX Client is built to be resilient, sovereign, and entirely decentralized. Depending on your needs, you can access or run the client through two distinct paths:

### 1. The Community Version (Production)

For standard use, security, and immediate network access, the global community maintains a live, permanent deployment hosted on **IPFS** .

You can access the production-grade decentralized build securely using any ENS-compatible browser or gateway at:
👉 **`sethx.eth`**

### 2. Local Tooling & Development (This Repository)

This repository contains the raw source code frameworks designed to be run as a **local tool** on your machine.

Developers, node runners, and advanced users are encouraged to compile and run the client locally for:

- **Custom Development:** Inspecting components, testing layout themes, or prototyping new derivative views.
- **Maximum Privacy:** Direct local connection hooks bypassing public web trackers.
- **Security Auditing:** Verifying contract interaction footprints before mainnet execution loops.

---

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
