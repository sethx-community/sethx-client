export type SafetySeverity = 'info' | 'warning' | 'error';

export interface SafetyIssue {
  code: string;
  message: string;
  severity: SafetySeverity;
}

export interface ActionSafetyState {
  disabled: boolean;
  reason: string | null;
  issues: SafetyIssue[];
}

function issue(code: string, message: string, severity: SafetySeverity = 'error'): SafetyIssue {
  return { code, message, severity };
}

function result(issues: SafetyIssue[]): ActionSafetyState {
  const blocking = issues.find((i) => i.severity === 'error');
  return {
    disabled: !!blocking,
    reason: blocking?.message ?? null,
    issues,
  };
}

export function hasActiveAccount(accountId: string | null | undefined): ActionSafetyState {
  return result(accountId ? [] : [issue('missing-active-account', 'Select an active account first.')]);
}

export function selectedOrderFillSafety(options: {
  selectedOrder: unknown | null | undefined;
  isMine: boolean;
  fillAmount?: string | null;
  activeAccountId?: string | null;
  marketExpired?: boolean;
  orderExpired?: boolean;
}): ActionSafetyState {
  const issues: SafetyIssue[] = [];
  if (!options.activeAccountId) issues.push(issue('missing-active-account', 'Select an active account first.'));
  if (!options.selectedOrder) issues.push(issue('missing-selected-order', 'Select an order from the orderbook first.'));
  if (options.isMine) issues.push(issue('own-order-fill', 'This is your order. Cancel it instead of filling it.'));
  if (!String(options.fillAmount ?? '').trim()) issues.push(issue('missing-fill-amount', 'Enter the amount to fill.'));
  if (options.marketExpired) issues.push(issue('expired-market', 'This market is expired.'));
  if (options.orderExpired) issues.push(issue('expired-order', 'This order is expired.'));
  return result(issues);
}

export function selectedOrderCancelSafety(options: {
  selectedOrder: unknown | null | undefined;
  isMine: boolean;
  activeAccountId?: string | null;
  orderExpired?: boolean;
}): ActionSafetyState {
  const issues: SafetyIssue[] = [];
  if (!options.activeAccountId) issues.push(issue('missing-active-account', 'Select an active account first.'));
  if (!options.selectedOrder) issues.push(issue('missing-selected-order', 'Select an order from the orderbook first.'));
  if (options.selectedOrder && !options.isMine) issues.push(issue('not-own-order', 'Only your own active orders can be cancelled.'));
  if (options.orderExpired) issues.push(issue('expired-order', 'This order is expired.'));
  return result(issues);
}

export function expirySafety(options: {
  expiresAtUnixSec?: bigint | number | string | null;
  maxUnixSec?: bigint | number | string | null;
  nowMs?: number;
}): ActionSafetyState {
  const issues: SafetyIssue[] = [];
  const nowSec = Math.floor((options.nowMs ?? Date.now()) / 1000);
  const expiry = toNumber(options.expiresAtUnixSec);
  const max = toNumber(options.maxUnixSec);

  if (!expiry) issues.push(issue('missing-expiry', 'Choose an expiration date.'));
  if (expiry && expiry <= nowSec) issues.push(issue('past-expiry', 'Expiration must be in the future.'));
  if (expiry && max && expiry > max) issues.push(issue('beyond-market-expiry', 'Order expiration cannot be after the product expiration.'));
  return result(issues);
}

export function toNumber(value: bigint | number | string | null | undefined): number | null {
  try {
    if (value === null || value === undefined || value === '') return null;
    const n = typeof value === 'bigint' ? Number(value) : Number(value);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}
