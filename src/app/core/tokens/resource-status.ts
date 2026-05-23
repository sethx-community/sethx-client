import type { ResourceStatus } from '@angular/core';

export type Status = 'idle' | 'pending' | 'success' | 'error';

export function toStatus(s: ResourceStatus): Status {
  switch (s as any) {
    case 'idle':
      return 'idle';
    case 'loading':
      return 'pending';
    case 'resolved':
      return 'success';
    case 'error':
      return 'error';
    default:
      return 'pending';
  }
}
