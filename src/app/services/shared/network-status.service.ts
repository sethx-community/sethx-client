import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NetworkStatusService {
  readonly available = signal(true);
  readonly error = signal<string | null>(null);

  setAvailable() {
    this.available.set(true);
    this.error.set(null);
  }

  setUnavailable(err: unknown) {
    this.available.set(false);
    this.error.set(err instanceof Error ? err.message : 'Network unavailable');
  }
}
