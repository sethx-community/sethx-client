import { ethers } from 'ethers';

import { RequirementRow } from '../../core/modals/confirmation/confirmation-modal.component';

export interface OrderFlowRequirementInput {
  tokenKey: string;
  label: string;
  raw: bigint;
}

export interface OrderFlowRequirementFormatters {
  normalizeTokenKey: (token: string) => string;
  displayTokenAddress: (normalizedTokenKey: string) => string;
  tokenSymbol: (normalizedTokenKey: string) => string;
  tokenDecimals: (normalizedTokenKey: string) => number;
  availableRaw: (normalizedTokenKey: string) => bigint;
}

export function buildOrderFlowRequirementRows(
  inputs: OrderFlowRequirementInput[],
  formatters: OrderFlowRequirementFormatters,
): RequirementRow[] {
  const byKey = new Map<string, { total: bigint; components: OrderFlowRequirementInput[] }>();

  for (const input of inputs) {
    if (input.raw <= 0n) continue;
    const key = formatters.normalizeTokenKey(input.tokenKey);
    if (!key) continue;
    const existing = byKey.get(key);
    if (existing) {
      existing.total += input.raw;
      existing.components.push({ ...input, tokenKey: key });
    } else {
      byKey.set(key, { total: input.raw, components: [{ ...input, tokenKey: key }] });
    }
  }

  return Array.from(byKey.entries()).map(([key, grouped]) => {
    const symbol = formatters.tokenSymbol(key);
    const decimals = formatters.tokenDecimals(key);
    const available = formatters.availableRaw(key);
    const fmt = (raw: bigint) => `${ethers.formatUnits(raw, decimals)} ${symbol}`;

    return {
      tokenSymbol: symbol,
      tokenAddress: formatters.displayTokenAddress(key),
      available: fmt(available),
      ok: available >= grouped.total,
      totalRequired: fmt(grouped.total),
      components: grouped.components.map((component) => ({
        label: component.label,
        amount: fmt(component.raw),
        raw: component.raw.toString(),
      })),
      requiredRaw: grouped.total.toString(),
      availableRaw: available.toString(),
      decimals,
    };
  });
}
