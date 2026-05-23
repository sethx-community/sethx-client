export type ExpirySelection =
  | { kind: 'default' }
  | { kind: 'relative'; seconds: bigint }
  | { kind: 'absolute'; unix: bigint }
  | { kind: 'invalid' };

export const EXPIRY_RELATIVE_PREFIX = 'rel:';

export const EXPIRY_PRESET_SECONDS = {
  '1h': 60n * 60n,
  '1d': 24n * 60n * 60n,
  '7d': 7n * 24n * 60n * 60n,
  '30d': 30n * 24n * 60n * 60n,
} as const;

export type ExpiryPresetKey = keyof typeof EXPIRY_PRESET_SECONDS;

export function browserNowSec(): bigint {
  return BigInt(Math.floor(Date.now() / 1000));
}

export function encodeRelativeExpiry(seconds: bigint): string {
  return `${EXPIRY_RELATIVE_PREFIX}${seconds.toString()}`;
}

export function parseExpirySelection(value: unknown): ExpirySelection {
  const raw = String(value ?? '').trim();
  if (!raw || raw === '0') return { kind: 'default' };

  if (raw.startsWith(EXPIRY_RELATIVE_PREFIX)) {
    try {
      const seconds = BigInt(raw.slice(EXPIRY_RELATIVE_PREFIX.length));
      return seconds > 0n ? { kind: 'relative', seconds } : { kind: 'invalid' };
    } catch {
      return { kind: 'invalid' };
    }
  }

  try {
    const unix = BigInt(raw);
    if (unix === 0n) return { kind: 'default' };
    return unix > 0n ? { kind: 'absolute', unix } : { kind: 'invalid' };
  } catch {
    return { kind: 'invalid' };
  }
}

export function displayUnixForExpiry(value: unknown, nowSec = browserNowSec()): bigint | null {
  const parsed = parseExpirySelection(value);
  if (parsed.kind === 'default') return 0n;
  if (parsed.kind === 'relative') return nowSec + parsed.seconds;
  if (parsed.kind === 'absolute') return parsed.unix;
  return null;
}

export function expiryHumanLabel(value: unknown): string {
  const displayUnix = displayUnixForExpiry(value);
  if (displayUnix === null) return 'Invalid timestamp';
  if (displayUnix === 0n) return 'Contract default';

  const d = new Date(Number(displayUnix) * 1000);
  return Number.isFinite(d.getTime())
    ? d.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    : `unix ${displayUnix.toString()}`;
}

export function expiryPreviewLabel(value: unknown, defaultLabel: string): string {
  const parsed = parseExpirySelection(value);
  if (parsed.kind === 'default') return defaultLabel;
  if (parsed.kind === 'invalid') return 'Invalid timestamp';

  const displayUnix = displayUnixForExpiry(value);
  if (displayUnix === null || displayUnix === 0n) return defaultLabel;

  const d = new Date(Number(displayUnix) * 1000);
  const dateLabel = Number.isFinite(d.getTime())
    ? d.toLocaleString()
    : `unix ${displayUnix.toString()}`;

  if (parsed.kind === 'relative') {
    return `${dateLabel} (estimated local display; contract sends chain time + ${formatDuration(parsed.seconds)})`;
  }

  return `${dateLabel} (unix ${parsed.unix.toString()})`;
}

export function formatDuration(seconds: bigint): string {
  const day = 24n * 60n * 60n;
  const hour = 60n * 60n;
  const minute = 60n;

  if (seconds % day === 0n) {
    const days = seconds / day;
    return `${days.toString()} day${days === 1n ? '' : 's'}`;
  }
  if (seconds % hour === 0n) {
    const hours = seconds / hour;
    return `${hours.toString()} hour${hours === 1n ? '' : 's'}`;
  }
  if (seconds % minute === 0n) {
    const minutes = seconds / minute;
    return `${minutes.toString()} minute${minutes === 1n ? '' : 's'}`;
  }
  return `${seconds.toString()} seconds`;
}

export function resolveExpiryForContract(value: unknown, chainNow: bigint | null): bigint {
  const parsed = parseExpirySelection(value);
  if (parsed.kind === 'default' || parsed.kind === 'invalid') return 0n;
  if (parsed.kind === 'absolute') return parsed.unix;
  if (chainNow !== null) return chainNow + parsed.seconds;
  return browserNowSec() + parsed.seconds;
}

export function validateResolvedExpiry(expiry: bigint, chainNow: bigint | null): string | null {
  if (expiry === 0n || chainNow === null || expiry > chainNow) return null;
  return `Expiry is in the past for the connected chain. Pick a future expiry. Chain time: ${new Date(Number(chainNow) * 1000).toLocaleString()} (unix ${chainNow.toString()}).`;
}
