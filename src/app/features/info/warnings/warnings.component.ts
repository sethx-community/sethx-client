import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { stableComputed } from '../../../core/signals/stable-resource';

import { WARNING_EXPIRY_ORANGE_WINDOW_DAYS, WARNING_STATUS_LABELS } from '../../../constants/warnings.constants';
import { WarningCenterService, WarningRow } from '../../../services/shared/warnings/warning-center.service';

@Component({
  selector: 'app-warnings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './warnings.component.html',
})
export class WarningsComponent {
  readonly warningsCenter = inject(WarningCenterService);
  readonly orangeWindowDays = WARNING_EXPIRY_ORANGE_WINDOW_DAYS;

  readonly warnings = stableComputed<WarningRow[]>(() => this.warningsCenter.warnings());
  redCount(): number { return this.warningsCenter.redCount(); }
  orangeCount(): number { return this.warningsCenter.orangeCount(); }
  loading(): boolean { return this.warningsCenter.loading(); }

  refresh(): void {
    void this.warningsCenter.refresh();
  }

  trackWarning(index: number, row: WarningRow): string {
    return `${row.level}:${row.type}:${row.title}:${row.detail}:${row.due.toString()}:${index}`;
  }

  levelLabel(row: WarningRow): string {
    return WARNING_STATUS_LABELS[row.level];
  }

  levelClass(row: WarningRow): string {
    return row.level === 'red' ? 'is-attention' : 'is-warning';
  }

  dueLabel(ts: bigint): string {
    if (!ts) return 'Immediate / risk based';
    return new Date(Number(ts) * 1000).toLocaleString(undefined, { timeZoneName: 'short' });
  }

  lastUpdatedLabel(): string {
    const ts = this.warningsCenter.lastUpdatedAt();
    if (!ts) return 'Not refreshed yet';
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }
}
