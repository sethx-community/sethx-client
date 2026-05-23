import { isHexString } from 'ethers';

export function isEthersCallException(e: any): boolean {
  return !!e && (e.code === 'CALL_EXCEPTION' || e.code === 'BAD_DATA');
}

export function emptyRevertLike(e: any): boolean {
  // ethers v6 often reports: missing revert data
  const msg = String(e?.message ?? '');
  return (
    msg.includes('missing revert data') ||
    msg.includes('call exception') ||
    msg.includes('BAD_DATA')
  );
}

export async function safeCall<T>(
  fn: () => Promise<T>,
  fallback: T,
  logLabel?: string,
): Promise<T> {
  try {
    return await fn();
  } catch (e: any) {
    // Only swallow “expected” read failures; keep other bugs visible.
    if (isEthersCallException(e) || emptyRevertLike(e)) {
      if (logLabel) console.warn(`[safeCall] ${logLabel}`, e);
      return fallback;
    }
    throw e;
  }
}
