# SETHX Client Releases

SETHX Client is local client software for interacting with SETHX-compatible smart contracts.

The initial release model is intentionally focused on local use, developer review, and community testing. The client is not currently released as a public hosted trading website.

## Release formats

SETHX Client has two initial release formats:

1. Developer source release
2. Local browser release

Packaged desktop apps, installers, and public hosted web versions may be considered later, but they are not part of the initial release model.

## 1. Developer source release

The developer source release is intended for:

- developers;
- reviewers;
- auditors;
- advanced users;
- contributors;
- community maintainers.

A developer can clone the repository, install dependencies, and run the client locally.

Typical commands:

```bash
npm ci
npm run start:local
npm run start:testnet
npm run build:local
npm run build:testnet
npm run build:prod
```

The source release supports transparency, review, community contribution, and reproducible development.

## 2. Local browser release

The local browser release is intended for users and testers who do not want to use VS Code or Angular CLI directly.

The release package should include a prebuilt browser version of the client and simple start scripts.

Expected package structure:

```txt
sethx-client-browser/
  app/
    index.html
    assets/
    ...
  README.txt
  start-windows.bat
  start-mac-linux.sh
  package.json
```

The local browser release should run from the user's own computer, usually through a local server such as:

```txt
http://localhost:4173
```

This allows the user to interact with the client in a browser while keeping the software local.

## Why there is no public hosted client website yet

SETHX Community is not currently operating a public hosted trading website for the client.

This is intentional.

A public hosted trading interface may create additional legal, regulatory, compliance, security, operational, and jurisdiction-specific responsibilities. Until those issues are fully reviewed and the community is ready, the client is distributed as local software and source code.

The public website at `sethx.com` is intended for information, documentation, community updates, and contributor onboarding. It is not intended to be treated as the hosted trading client.

For more detail, see [`THIRD_PARTY_INTERFACES.md`](./THIRD_PARTY_INTERFACES.md).

## Relationship with third-party interfaces

SETHX Client is open-source software. Others may fork, modify, deploy, or host interfaces according to the applicable license.

However, third-party websites, forks, hosted interfaces, modified clients, and unofficial deployments are not automatically official, reviewed, safe, endorsed, or maintained by SETHX Community.

For more detail, see [`THIRD_PARTY_INTERFACES.md`](./THIRD_PARTY_INTERFACES.md).

## Security expectations

Every release should make the following clear:

- never enter seed phrases or private keys into the client;
- use a wallet extension, wallet app, or hardware wallet;
- verify the source repository and release checksums;
- verify the network and contract addresses before signing transactions;
- testnet releases are for testing only;
- production releases should be used only with verified deployment information.

## Checksums

Release artifacts should include checksums so users can verify downloaded files.

At minimum, each release should include:

```txt
SHA256SUMS.txt
```

Example release artifacts:

```txt
sethx-client-source-v0.1.0-alpha.1.zip
sethx-client-browser-v0.1.0-alpha.1.zip
SHA256SUMS.txt
```

## Versioning

Initial releases should use alpha versioning:

```txt
v0.1.0-alpha.1
v0.1.0-alpha.2
v0.1.0-alpha.3
```

Alpha releases are for testing, review, and community feedback.

A release should not be described as production-ready until:

- contracts are finalized and deployed;
- deployment addresses are verified;
- client configuration is reviewed;
- security review is complete;
- documentation is complete;
- legal and regional launch decisions are finalized.

## Initial release checklist

Before creating an alpha release:

- [ ] `npm ci` works from a clean checkout.
- [ ] `npm run build:local` passes.
- [ ] `npm run build:testnet` passes.
- [ ] `npm run build:prod` passes.
- [ ] GitHub Actions build passes.
- [ ] `npm audit` reports no unresolved vulnerabilities.
- [ ] README explains local client usage.
- [ ] Environment files are reviewed.
- [ ] Contract addresses are correct for the selected environment.
- [ ] Release artifacts are generated.
- [ ] SHA256 checksums are generated.
- [ ] Release notes are written.
- [ ] Known limitations are documented.
- [ ] Third-party interface disclaimer is included or linked.

## Future release options

Later, the community may consider:

- packaged Windows or macOS applications;
- signed desktop builds;
- automated release workflows;
- hosted web interfaces;
- additional network-specific builds;
- governance-approved public deployments.

Those options should be considered only after the client, contracts, governance process, and legal/regional requirements are sufficiently mature.
