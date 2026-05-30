import { Injectable, inject } from '@angular/core';
import { JsonRpcProvider } from 'ethers';

import { WalletConnectService } from '../../../wallet/wallet-connect.service';
import { CURRENT_NETWORK } from '../../../constants/network.config';
import { NETWORKS } from '../../../constants/networks';

export type ExpirySelectionMode = 'default' | 'preset' | 'custom' | 'manual';

export interface ExpirySelection {
  mode: ExpirySelectionMode;
  /** Relative seconds for preset selections. */
  seconds?: number;
  /** datetime-local value, interpreted by the browser in the user's local timezone. */
  customLocal?: string;
  /** Advanced absolute Unix timestamp string. */
  manualUnix?: string;
}

export interface ResolvedExpiry {
  expiry: bigint;
  chainTimestamp: bigint;
  localPreviewTimestamp: bigint;
  label: string;
}

@Injectable({ providedIn: 'root' })
export class ExpirySettingsService {
  private readonly wallet = inject(WalletConnectService);

  readonly presets: Array<{ label: string; seconds: number }> = [
    { label: '1 hour', seconds: 60 * 60 },
    { label: '1 day', seconds: 24 * 60 * 60 },
    { label: '7 days', seconds: 7 * 24 * 60 * 60 },
    { label: '30 days', seconds: 30 * 24 * 60 * 60 },
  ];

  defaultSelection(): ExpirySelection {
    return { mode: 'default' };
  }

  presetSelection(seconds: number): ExpirySelection {
    return { mode: 'preset', seconds };
  }

  /** Browser/local-time preview only. Never use this value for preset transaction submission. */
  localPreviewUnix(selection: ExpirySelection | null | undefined): bigint {
    const s = selection ?? this.defaultSelection();
    if (s.mode === 'default') return 0n;

    if (s.mode === 'preset') {
      const offset = BigInt(Math.max(0, Number(s.seconds ?? 0)));
      return BigInt(Math.floor(Date.now() / 1000)) + offset;
    }

    if (s.mode === 'custom') {
      const raw = String(s.customLocal ?? '').trim();
      if (!raw) return 0n;
      const d = new Date(raw);
      const t = d.getTime();
      return Number.isFinite(t) && t > 0 ? BigInt(Math.floor(t / 1000)) : 0n;
    }

    return this.parseManualUnix(s.manualUnix);
  }

  /** Actual contract value. Presets are resolved from chain time; custom/manual are absolute timestamps. */
  async resolveForContract(selection: ExpirySelection | null | undefined): Promise<ResolvedExpiry> {
    const s = selection ?? this.defaultSelection();
    const chainTimestamp = await this.getChainTimestamp();
    const localPreviewTimestamp = this.localPreviewUnix(s);

    let expiry = 0n;
    if (s.mode === 'default') {
      expiry = 0n;
    } else if (s.mode === 'preset') {
      const offset = BigInt(Math.max(0, Number(s.seconds ?? 0)));
      expiry = offset > 0n ? chainTimestamp + offset : 0n;
    } else {
      expiry = localPreviewTimestamp;
      if (expiry !== 0n && expiry <= chainTimestamp) {
        throw new Error(
          `Expiry is in the past for the connected chain. Pick a future expiry. Chain time: ${this.formatTimestamp(chainTimestamp)} (unix ${chainTimestamp.toString()}).`,
        );
      }
    }

    return {
      expiry,
      chainTimestamp,
      localPreviewTimestamp,
      label: this.previewLabel(s),
    };
  }

  previewLabel(selection: ExpirySelection | null | undefined, defaultDescription = 'Contract default'): string {
    const s = selection ?? this.defaultSelection();
    if (s.mode === 'default') return `${defaultDescription} (sends 0)`;

    const preview = this.localPreviewUnix(s);
    if (preview === 0n) return 'Invalid expiry selection';

    const date = this.formatTimestamp(preview);
    const unix = preview.toString();

    if (s.mode === 'preset') {
      return `${date} (local preview, unix ${unix}; contract uses chain time + ${this.formatDuration(BigInt(s.seconds ?? 0))})`;
    }
    if (s.mode === 'custom') {
      return `${date} (custom local date/time, unix ${unix})`;
    }
    return `${date} (manual Unix timestamp ${unix})`;
  }

  formatTimestamp(ts: bigint): string {
    const d = new Date(Number(ts) * 1000);
    return Number.isFinite(d.getTime()) ? d.toLocaleString() : `unix ${ts.toString()}`;
  }

  formatDuration(seconds: bigint): string {
    const day = 24n * 60n * 60n;
    const hour = 60n * 60n;
    const minute = 60n;
    if (seconds === 0n) return '0 seconds';
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

  private parseManualUnix(raw: unknown): bigint {
    try {
      const value = BigInt(String(raw ?? '').trim());
      return value > 0n ? value : 0n;
    } catch {
      return 0n;
    }
  }

  private async getChainTimestamp(): Promise<bigint> {
    const walletProvider = this.wallet.provider?.() ?? null;
    const rpcUrl = NETWORKS[CURRENT_NETWORK].rpcUrls.default.http[0];
    const provider = walletProvider ?? new JsonRpcProvider(rpcUrl);
    const block = await provider.getBlock('latest');
    const timestamp = BigInt(Number(block?.timestamp ?? 0));
    if (timestamp <= 0n) throw new Error('Could not read connected chain time.');
    return timestamp;
  }
}
