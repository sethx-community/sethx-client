import { ethers } from 'ethers';

export type HumanNumberMode = 'full' | 'compact' | 'reciprocal-small' | 'scaled-small';

export type HumanNumberOptions = {
  maxDecimals?: number;
  minDecimals?: number;
  mode?: HumanNumberMode;
  compactFrom?: number;
  reciprocalBelow?: number;
  scaledSmallBelow?: number;
  zero?: string;
};

const GROUP_FORMATTER = new Intl.NumberFormat('en-US', {
  useGrouping: true,
  maximumFractionDigits: 0,
});

function sanitizeDecimal(value: string | number | bigint | null | undefined): string {
  if (value === null || value === undefined) return '0';
  if (typeof value === 'bigint') return value.toString();
  const raw = String(value).trim();
  if (!raw || raw === 'NaN' || raw === 'Infinity' || raw === '-Infinity') return '0';
  return raw;
}

function splitDecimal(value: string): { sign: string; whole: string; fraction: string } {
  let raw = sanitizeDecimal(value);
  let sign = '';
  if (raw.startsWith('-')) {
    sign = '-';
    raw = raw.slice(1);
  }
  const [wholeRaw = '0', fractionRaw = ''] = raw.split('.');
  const whole = wholeRaw.replace(/^0+(?=\d)/, '') || '0';
  const fraction = fractionRaw.replace(/[^0-9]/g, '');
  return { sign, whole, fraction };
}

function trimFraction(fraction: string, maxDecimals: number, minDecimals: number): string {
  const safeMax = Math.max(0, maxDecimals);
  const safeMin = Math.max(0, Math.min(minDecimals, safeMax));
  let next = fraction.slice(0, safeMax);
  next = next.replace(/0+$/, '');
  while (next.length < safeMin) next += '0';
  return next;
}

export function groupInteger(value: string | number | bigint | null | undefined): string {
  const raw = sanitizeDecimal(value);
  try {
    return GROUP_FORMATTER.format(BigInt(raw));
  } catch {
    const { sign, whole } = splitDecimal(raw);
    return `${sign}${whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  }
}

export function formatDecimal(
  value: string | number | bigint | null | undefined,
  options: HumanNumberOptions = {},
): string {
  const zero = options.zero ?? '0';
  const raw = sanitizeDecimal(value);
  const numeric = Number(raw);
  const absNumeric = Math.abs(numeric);
  const mode = options.mode ?? 'full';

  if (!Number.isFinite(numeric)) return raw;
  if (numeric === 0) return zero;

  if (mode === 'reciprocal-small' && absNumeric > 0 && absNumeric < (options.reciprocalBelow ?? 0.001)) {
    const reciprocal = 1 / absNumeric;
    return `${numeric < 0 ? '-' : ''}1 / ${formatCompactNumber(reciprocal, { maxDecimals: 2 })}`;
  }

  if (mode === 'scaled-small' && absNumeric > 0 && absNumeric < (options.scaledSmallBelow ?? 0.001)) {
    const scale = absNumeric < 0.000001 ? 1_000_000 : 1_000;
    const suffix = scale === 1_000_000 ? '/ M' : '/ K';
    const scaled = numeric * scale;
    return `${formatDecimal(String(scaled), {
      maxDecimals: options.maxDecimals ?? 6,
      minDecimals: options.minDecimals ?? 0,
    })} ${suffix}`;
  }

  if (mode === 'compact' || absNumeric >= (options.compactFrom ?? Number.POSITIVE_INFINITY)) {
    return formatCompactNumber(numeric, options);
  }

  const { sign, whole, fraction } = splitDecimal(raw);
  const maxDecimals = options.maxDecimals ?? (absNumeric >= 1 ? 4 : 8);
  const minDecimals = options.minDecimals ?? 0;
  const groupedWhole = groupInteger(`${sign}${whole}`).replace('-', '');
  const trimmedFraction = trimFraction(fraction, maxDecimals, minDecimals);

  return `${sign}${groupedWhole}${trimmedFraction ? `.${trimmedFraction}` : ''}`;
}

export function formatCompactNumber(
  value: string | number | bigint | null | undefined,
  options: HumanNumberOptions = {},
): string {
  const raw = sanitizeDecimal(value);
  const numeric = Number(raw);
  if (!Number.isFinite(numeric)) return raw;
  if (numeric === 0) return options.zero ?? '0';

  const abs = Math.abs(numeric);
  const sign = numeric < 0 ? '-' : '';
  const units: Array<[number, string]> = [
    [1_000_000_000_000, 'T'],
    [1_000_000_000, 'B'],
    [1_000_000, 'M'],
    [1_000, 'K'],
  ];

  for (const [divisor, suffix] of units) {
    if (abs >= divisor) {
      const scaled = abs / divisor;
      return `${sign}${formatDecimal(String(scaled), {
        maxDecimals: options.maxDecimals ?? (scaled >= 100 ? 0 : scaled >= 10 ? 1 : 2),
        minDecimals: 0,
      })}${suffix}`;
    }
  }

  return formatDecimal(numeric, { maxDecimals: options.maxDecimals ?? 4, minDecimals: options.minDecimals ?? 0 });
}

export function formatUnitsHuman(
  raw: bigint | string | number | null | undefined,
  decimals = 18,
  options: HumanNumberOptions = {},
): string {
  try {
    const bigintValue = typeof raw === 'bigint' ? raw : BigInt(raw ?? 0);
    return formatDecimal(ethers.formatUnits(bigintValue, decimals), options);
  } catch {
    return formatDecimal(String(raw ?? '0'), options);
  }
}

export function formatTokenAmount(
  raw: bigint | string | number | null | undefined,
  decimals: number,
  symbol?: string | null,
  options: HumanNumberOptions = {},
): string {
  const amount = formatUnitsHuman(raw, decimals, options);
  return symbol ? `${amount} ${symbol}` : amount;
}
