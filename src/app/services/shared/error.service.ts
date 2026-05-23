// src/app/core/services/error.service.ts
import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ErrorService {
  private readonly errorSignal = signal<string | null>(null);

  readonly error = this.errorSignal.asReadonly();
  private readonly _tick = signal(0);
  readonly tick = this._tick.asReadonly();

  show(message: string) {
    this.errorSignal.set(message);
    this._tick.update((v) => v + 1);
    console.error('[ErrorService]', message);
  }
  clear() {
    this.errorSignal.set(null);
  }
}
