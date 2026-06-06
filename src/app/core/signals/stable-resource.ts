import { Signal, computed, effect, signal } from '@angular/core';

export type StableResourceOptions = {
  /**
   * Changes to this key mean the view context changed, for example a new
   * selected market/account. The committed value is reset for context changes,
   * but not for refresh ticks.
   */
  resetKey?: () => unknown;
};

/**
 * Keeps the last resolved resource value available to components.
 *
 * Angular resources can briefly expose `undefined` while a reload is pending.
 * Binding page rows directly to `resource.value() ?? []` makes orderbooks and
 * tables disappear during background refreshes. This helper commits only real
 * resolved values to a stable signal and exposes that stable signal to views.
 */
export function stableResourceValue<T>(
  read: () => T | undefined,
  initialValue: T,
  options: StableResourceOptions = {},
): Signal<T> {
  const committed = signal<T>(initialValue);

  if (options.resetKey) {
    let initialized = false;
    let previousKey: unknown;

    effect(() => {
      const nextKey = options.resetKey?.();
      if (!initialized) {
        initialized = true;
        previousKey = nextKey;
        return;
      }

      if (nextKey !== previousKey) {
        previousKey = nextKey;
        committed.set(initialValue);
      }
    });
  }

  effect(() => {
    const next = read();
    if (next !== undefined) committed.set(next);
  });

  return computed(() => committed());
}
