import { signal, computed } from '@angular/core';

type TxStatus = 'idle' | 'pending' | 'success' | 'error';
type TxKey = number;

const TX_TIMEOUT_SENTINEL = Symbol('tx-timeout');
let txKeyCounter = 0;

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(TX_TIMEOUT_SENTINEL), timeoutMs);
    promise
      .then((res) => {
        clearTimeout(timeout);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timeout);
        reject(err);
      });
  });
}

export function createTxTracker<T, R = void>(
  fn: (input: T) => Promise<R>,
  options?: { timeoutMs?: number; autoResetDelay?: number },
) {
  const statuses = signal(new Map<TxKey, TxStatus>());
  const errors = signal(new Map<TxKey, any>());
  const results = signal(new Map<TxKey, R | null>());

  function setStatus(key: TxKey, status: TxStatus) {
    const next = new Map(statuses());
    next.set(key, status);
    statuses.set(next);
  }

  function setError(key: TxKey, err: any) {
    const next = new Map(errors());
    next.set(key, err);
    errors.set(next);
  }

  function setResult(key: TxKey, res: R | null) {
    const next = new Map(results());
    next.set(key, res);
    results.set(next);
  }

  function clearKey(key: TxKey) {
    const s = new Map(statuses());
    s.delete(key);
    statuses.set(s);

    const e = new Map(errors());
    e.delete(key);
    errors.set(e);

    const r = new Map(results());
    r.delete(key);
    results.set(r);
  }

  function maybeAutoReset(key: TxKey) {
    const delay = options?.autoResetDelay;
    if (!delay) return;
    setTimeout(() => clearKey(key), delay);
  }

  function run(input: T): TxKey {
    const key = txKeyCounter++;

    // single source of truth updates
    setStatus(key, 'pending');

    // clear any previous error/result for that key (defensive)
    const e = new Map(errors());
    e.delete(key);
    errors.set(e);
    const r = new Map(results());
    r.delete(key);
    results.set(r);

    const promise = withTimeout(fn(input), options?.timeoutMs ?? 30000);

    promise
      .then((res) => {
        setResult(key, (res ?? null) as R | null);
        setStatus(key, 'success');
        maybeAutoReset(key);
      })
      .catch((err) => {
        setError(key, err === TX_TIMEOUT_SENTINEL ? new Error('Timeout') : err);
        setStatus(key, 'error');
        maybeAutoReset(key);
      });

    return key;
  }

  function getStatus(key: TxKey) {
    return computed(() => statuses().get(key) ?? 'idle');
  }

  function getError(key: TxKey) {
    return computed(() => errors().get(key) ?? null);
  }

  function getResult(key: TxKey) {
    return computed(() => results().get(key) ?? null);
  }

  function reset(key: TxKey) {
    clearKey(key);
  }

  return { run, getStatus, getError, getResult, reset };
}
