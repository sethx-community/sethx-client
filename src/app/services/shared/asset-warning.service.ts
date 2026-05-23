import { Injectable } from '@angular/core';

export type AssetWarningSeverity = 'ok' | 'attention' | 'critical';

export type AssetWarningInput = {
  expiringSoon?: number;
  expired?: number;
  reclaimable?: number;
  repayDue?: number;
  ltvAttention?: number;
  liquidationRisk?: number;
  customAttention?: number;
  customCritical?: number;
};

export type AssetWarningStatus = {
  severity: AssetWarningSeverity;
  label: string;
  title: string;
};

@Injectable({ providedIn: 'root' })
export class AssetWarningService {
  status(input: AssetWarningInput = {}): AssetWarningStatus {
    const critical: string[] = [];
    const attention: string[] = [];

    this.pushCount(critical, input.expired, 'expired');
    this.pushCount(critical, input.liquidationRisk, 'liquidation risk');
    this.pushCount(critical, input.customCritical, 'critical');

    this.pushCount(attention, input.expiringSoon, 'expiring soon');
    this.pushCount(attention, input.reclaimable, 'reclaimable');
    this.pushCount(attention, input.repayDue, 'repay due');
    this.pushCount(attention, input.ltvAttention, 'LTV attention');
    this.pushCount(attention, input.customAttention, 'attention');

    if (critical.length) {
      return {
        severity: 'critical',
        label: critical.join(' · '),
        title: 'Action required',
      };
    }

    if (attention.length) {
      return {
        severity: 'attention',
        label: attention.join(' · '),
        title: 'Needs attention',
      };
    }

    return {
      severity: 'ok',
      label: 'No warnings',
      title: 'No warnings',
    };
  }

  private pushCount(target: string[], count: number | null | undefined, label: string): void {
    const value = Number(count ?? 0);
    if (!Number.isFinite(value) || value <= 0) return;
    target.push(`${value} ${label}`);
  }
}
