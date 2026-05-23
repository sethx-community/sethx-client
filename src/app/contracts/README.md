# Frontend contract wiring

This folder centralizes contract names, ABIs, and deployment addresses used by the Angular app.

## Manual update flow

After a Hardhat Ignition deployment, update the generated files in `generated/` from:

- `ignition/deployments/chain-31337/deployed_addresses.json`
- `ignition/deployments/chain-31337/artifacts/*.json`

The frontend-facing names live in `contract-names.ts`; Ignition `Module#Contract` names live in `ignition-artifact-map.ts`. Keep that mapping stable so feature/services do not need to know about Ignition internals.
