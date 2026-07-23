/**
 * Operations that must never trigger a silent token refresh.
 */
export const SKIP_REFRESH_OPERATIONS = new Set(['Login', 'RefreshToken', 'Logout']);

export type PendingRequest = {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
};

/**
 * Creates a queue for requests that arrive while a refresh is in progress.
 */
export function createPendingRequestQueue() {
  let pendingRequests: PendingRequest[] = [];

  return {
    enqueue(request: PendingRequest) {
      pendingRequests.push(request);
    },
    resolveAll(newToken: string) {
      pendingRequests.forEach(({ resolve }) => resolve(newToken));
      pendingRequests = [];
    },
    rejectAll(error: unknown) {
      pendingRequests.forEach(({ reject }) => reject(error));
      pendingRequests = [];
    },
    get size() {
      return pendingRequests.length;
    },
  };
}

/**
 * Returns true only when the GraphQL error indicates an expired session
 * (`UNAUTHENTICATED`). Permission errors (`AUTH_NOT_AUTHORIZED`) must not
 * trigger refresh. Login/Refresh/Logout operations are always skipped.
 */
export function shouldAttemptTokenRefresh(
  operationName: string | undefined,
  errorCodes: Array<string | undefined>,
): boolean {
  if (operationName && SKIP_REFRESH_OPERATIONS.has(operationName)) {
    return false;
  }

  return errorCodes.some((code) => code === 'UNAUTHENTICATED');
}
