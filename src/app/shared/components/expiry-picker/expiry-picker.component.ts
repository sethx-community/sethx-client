import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ExpirySelection, ExpirySettingsService } from '../../../services/shared/expiry/expiry-settings.service';

@Component({
  selector: 'app-expiry-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './expiry-picker.component.html',
})
export class ExpiryPickerComponent {
  readonly expiry = inject(ExpirySettingsService);

  @Input() selection: ExpirySelection = { mode: 'default' };
  @Input() label = 'Expiry';
  @Input() defaultDescription = 'Contract default';
  @Output() selectionChange = new EventEmitter<ExpirySelection>();

  presetValue(): string {
    const s = this.selection ?? { mode: 'default' };
    if (s.mode === 'default') return 'default';
    if (s.mode === 'preset') return String(s.seconds ?? '');
    return s.mode;
  }

  onPresetChange(value: string) {
    if (value === 'default') this.emit({ mode: 'default' });
    else if (value === 'custom') this.emit({ mode: 'custom', customLocal: this.selection?.customLocal ?? '' });
    else if (value === 'manual') this.emit({ mode: 'manual', manualUnix: this.selection?.manualUnix ?? '' });
    else this.emit({ mode: 'preset', seconds: Number(value) });
  }

  onCustomChange(value: string) {
    this.emit({ mode: 'custom', customLocal: value });
  }

  onManualChange(value: string) {
    this.emit({ mode: 'manual', manualUnix: value });
  }

  preview(): string {
    return this.expiry.previewLabel(this.selection, this.defaultDescription);
  }

  private emit(selection: ExpirySelection) {
    this.selectionChange.emit(selection);
  }
}
