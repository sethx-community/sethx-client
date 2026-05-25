# Security Policy

Security reports are important to the SETHX ecosystem.

Please do not open a public GitHub issue for sensitive security reports.

## Reporting a vulnerability

Report security issues privately to:

`security@sethx.com`

Please include as much relevant detail as possible:

- affected repository or component;
- summary of the issue;
- steps to reproduce, if applicable;
- potential impact;
- affected contract, page, service, dependency, or function;
- suggested mitigation, if known;
- your contact information.

## Never share secrets

Do not submit:

- seed phrases;
- private keys;
- wallet recovery phrases;
- API keys;
- RPC secrets;
- screenshots containing sensitive wallet data.

The SETHX Client will never ask for a seed phrase or private key.

## Scope

Security reports can include:

- transaction preview issues;
- incorrect contract addresses;
- incorrect ABI usage;
- unsafe wallet flows;
- UI behavior that could mislead users before signing;
- dependency vulnerabilities;
- build or release integrity issues;
- local browser release packaging issues;
- checksum or release verification issues;
- third-party interface impersonation concerns.

## Public issues

Use public GitHub issues for normal bugs and improvements that do not create security risk.

Examples:

- typos;
- styling issues;
- documentation improvements;
- non-sensitive UI bugs;
- feature requests;
- local development setup problems.

## Responsible disclosure

Please give maintainers reasonable time to review and address a security report before public disclosure.

Do not exploit the issue, access data that is not yours, disrupt services, or perform actions that could harm users, contributors, or the protocol.

## Release security

Before publishing releases, maintainers should verify:

- builds pass;
- dependencies are reviewed;
- release artifacts are generated from the expected source;
- checksums are published;
- release notes describe known limitations;
- contract addresses and network configuration are correct for the release.
