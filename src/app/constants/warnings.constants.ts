export type WarningStatus = 'orange' | 'red';

export const WARNING_STATUS_LABELS: Record<WarningStatus, string> = {
  orange: 'Orange',
  red: 'Red',
};

export const WARNING_EXPIRY_ORANGE_WINDOW_DAYS = 7;
export const WARNING_SECONDS_PER_DAY = 86_400n;
export const WARNING_EXPIRY_ORANGE_WINDOW_SECONDS = BigInt(WARNING_EXPIRY_ORANGE_WINDOW_DAYS) * WARNING_SECONDS_PER_DAY;

// Lending LTV warning policy. Values are basis points of the configured tier threshold.
// Orange: current LTV is at or above the normal max borrow LTV.
// Red: current LTV is at or above this percentage of the liquidation LTV.
export const WARNING_LTV_RED_FRACTION_BPS = 9_000n;
