import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  EXPIRY_PRESET_SECONDS,
  encodeRelativeExpiry,
  expiryHumanLabel,
  displayUnixForExpiry,
  parseExpirySelection,
} from '../expiry/expiry-settings';

type ExpiryMode = 'default' | '1h' | '1d' | '7d' | '30d' | 'custom' | 'manual';

function isExpiryMode(value: string): value is ExpiryMode {
  return ['default', '1h', '1d', '7d', '30d', 'custom', 'manual'].includes(value);
}

function toLocalDateTimeInput(unixSec: bigint): string {
  if (unixSec <= 0n) return '';
  const d = new Date(Number(unixSec) * 1000);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

function parsePositiveUnix(value: string): bigint | null {
  const raw = String(value ?? '').trim();
  if (!raw) return null;
  try {
    const parsed = BigInt(raw);
    return parsed >= 0n ? parsed : null;
  } catch {
    return null;
  }
}

@Component({
  selector: 'app-expiry-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './expiry-picker.component.html',
})
export class ExpiryPickerComponent {
  @Input() label = 'Expiry';
  @Input() value = '0';
  @Input() helper = 'Default sends 0 and lets the contract apply its default expiry.';
  @Input() allowDefault = true;
  @Output() valueChange = new EventEmitter<string>();

  mode: ExpiryMode = 'default';
  customLocal = '';
  manualUnix = '';

  readonly modes: Array<{ value: ExpiryMode; label: string }> = [
    { value: 'default', label: 'Default' },
    { value: '1h', label: '1 hour' },
    { value: '1d', label: '1 day' },
    { value: '7d', label: '7 days' },
    { value: '30d', label: '30 days' },
    { value: 'custom', label: 'Custom date/time' },
    { value: 'manual', label: 'Advanced/manual Unix timestamp' },
  ];

  async onModeChange(raw: string) {
    const next = isExpiryMode(String(raw)) ? String(raw) as ExpiryMode : 'default';
    this.mode = next;

    if (next === 'default') {
      this.emitValue('0');
      return;
    }

    if (next === '1h' || next === '1d' || next === '7d' || next === '30d') {
      const offset = EXPIRY_PRESET_SECONDS[next];
      this.emitValue(encodeRelativeExpiry(offset));
      return;
    }

    if (next === 'custom') {
      const current = parsePositiveUnix(this.value);
      this.customLocal = current && current > 0n ? toLocalDateTimeInput(current) : '';
      return;
    }

    if (next === 'manual') {
      this.manualUnix = String(this.value ?? '').trim();
    }
  }

  onCustomChange(next: string) {
    this.customLocal = next;
    const ms = Date.parse(next);
    if (Number.isFinite(ms)) {
      this.emitValue(String(Math.floor(ms / 1000)));
    }
  }

  onManualChange(next: string) {
    this.manualUnix = next;
    const parsed = parsePositiveUnix(next);
    if (parsed !== null) this.emitValue(parsed.toString());
  }

  previewHuman(): string {
    return expiryHumanLabel(this.value);
  }

  previewUnix(): string {
    const parsed = parseExpirySelection(this.value);
    if (parsed.kind === 'relative') return `chain time + ${parsed.seconds.toString()}s`;
    const displayUnix = displayUnixForExpiry(this.value);
    return displayUnix === null ? '—' : displayUnix.toString();
  }

  private emitValue(next: string) {
    this.value = next;
    this.valueChange.emit(next);
  }
}

