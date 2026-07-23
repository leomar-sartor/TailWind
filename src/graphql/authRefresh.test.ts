import { describe, expect, it, vi } from 'vitest';
import {
  createPendingRequestQueue,
  shouldAttemptTokenRefresh,
} from './authRefresh';

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe('shouldAttemptTokenRefresh', () => {
  it('attempts refresh only for UNAUTHENTICATED errors', () => {
    expect(shouldAttemptTokenRefresh('GetEmpresas', ['UNAUTHENTICATED'])).toBe(true);
  });

  it('does not refresh on AUTH_NOT_AUTHORIZED (permission denied)', () => {
    expect(shouldAttemptTokenRefresh('GetEmpresas', ['AUTH_NOT_AUTHORIZED'])).toBe(false);
  });

  it('skips refresh for Login, RefreshToken and Logout', () => {
    expect(shouldAttemptTokenRefresh('Login', ['UNAUTHENTICATED'])).toBe(false);
    expect(shouldAttemptTokenRefresh('RefreshToken', ['UNAUTHENTICATED'])).toBe(false);
    expect(shouldAttemptTokenRefresh('Logout', ['UNAUTHENTICATED'])).toBe(false);
  });

  it('does not refresh when no auth error code is present', () => {
    expect(shouldAttemptTokenRefresh('GetEmpresas', ['BAD_USER_INPUT', undefined])).toBe(false);
  });
});

describe('createPendingRequestQueue', () => {
  it('resolves every pending request when refresh succeeds', async () => {
    const queue = createPendingRequestQueue();
    const first = deferred<string>();
    const second = deferred<string>();

    queue.enqueue({ resolve: first.resolve, reject: first.reject });
    queue.enqueue({ resolve: second.resolve, reject: second.reject });
    expect(queue.size).toBe(2);

    queue.resolveAll('new-token');

    await expect(first.promise).resolves.toBe('new-token');
    await expect(second.promise).resolves.toBe('new-token');
    expect(queue.size).toBe(0);
  });

  it('rejects every pending request when refresh fails', async () => {
    const queue = createPendingRequestQueue();
    const first = deferred<string>();
    const second = deferred<string>();
    const failure = new Error('refresh failed');

    queue.enqueue({ resolve: first.resolve, reject: first.reject });
    queue.enqueue({ resolve: second.resolve, reject: second.reject });

    queue.rejectAll(failure);

    await expect(first.promise).rejects.toBe(failure);
    await expect(second.promise).rejects.toBe(failure);
    expect(queue.size).toBe(0);
  });

  it('does not leave dangling listeners after rejectAll', () => {
    const queue = createPendingRequestQueue();
    const reject = vi.fn();

    queue.enqueue({ resolve: vi.fn(), reject });
    queue.rejectAll(new Error('boom'));
    queue.rejectAll(new Error('second boom'));

    expect(reject).toHaveBeenCalledTimes(1);
    expect(queue.size).toBe(0);
  });
});
