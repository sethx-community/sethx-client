import { Signal, computed, effect, signal, untracked } from '@angular/core';

export type StableResourceOptions<T = unknown> = {
  /**
   * Changes to this key mean the view context changed, for example a new
   * selected market/account. The committed value is reset for context changes,
   * but not for refresh ticks.
   */
  resetKey?: () => unknown;
  /**
   * Optional equality check. When it returns true the committed signal is not
   * updated, so components keep the same reference and do not repaint lists.
   */
  equal?: (previous: T, next: T) => boolean;
};

export type StableComputedOptions<T = unknown> = {
  /**
   * Optional equality check. Defaults to structural equality so derived arrays,
   * maps and plain objects keep the old reference when their content did not
   * change across a resource/block refresh.
   */
  equal?: (previous: T, next: T) => boolean;
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object') return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

/**
 * Structural equality used by stable resources and component-level derived rows.
 * It intentionally supports the value shapes commonly used by the client views:
 * arrays, plain objects, Maps, Dates, bigints and primitive values.
 */
export function structuralEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return false;

  if (a instanceof Date || b instanceof Date) {
    return a instanceof Date && b instanceof Date && a.getTime() === b.getTime();
  }

  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b)) return false;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i += 1) {
      if (!structuralEqual(a[i], b[i])) return false;
    }
    return true;
  }

  if (a instanceof Map || b instanceof Map) {
    if (!(a instanceof Map) || !(b instanceof Map)) return false;
    if (a.size !== b.size) return false;
    for (const [key, value] of a.entries()) {
      if (!b.has(key)) return false;
      if (!structuralEqual(value, b.get(key))) return false;
    }
    return true;
  }

  if (a instanceof Set || b instanceof Set) {
    if (!(a instanceof Set) || !(b instanceof Set)) return false;
    if (a.size !== b.size) return false;
    for (const value of a.values()) {
      if (!b.has(value)) return false;
    }
    return true;
  }

  if (isPlainObject(a) || isPlainObject(b)) {
    if (!isPlainObject(a) || !isPlainObject(b)) return false;
    const aKeys = Object.keys(a).sort();
    const bKeys = Object.keys(b).sort();
    if (aKeys.length !== bKeys.length) return false;
    for (let i = 0; i < aKeys.length; i += 1) {
      if (aKeys[i] !== bKeys[i]) return false;
      if (!structuralEqual(a[aKeys[i]], b[bKeys[i]])) return false;
    }
    return true;
  }

  return false;
}

/**
 * Keeps the previous computed value reference when the newly derived value is
 * structurally equal. Use this for component/store rows that filter, map, slice
 * or rebuild objects for templates.
 */
export function stableComputed<T>(
  derive: () => T,
  options: StableComputedOptions<T> = {},
): Signal<T> {
  const equal = options.equal ?? structuralEqual;

  // Angular class fields are initialized top-to-bottom. Calling derive() here
  // eagerly can read another field before that field has been assigned, for
  // example filteredMarkets -> this.myOrders(). Keep the computation lazy so
  // the first read happens only after the service/component instance exists.
  return computed(derive, { equal });
}

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
  options: StableResourceOptions<T> = {},
): Signal<T> {
  const equal = options.equal ?? structuralEqual;
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
    if (next === undefined) return;

    const previous = untracked(() => committed());
    if (equal(previous, next)) return;

    committed.set(next);
  });

  return computed(() => committed());
}
