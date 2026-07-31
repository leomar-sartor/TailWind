import { jwtDecode } from 'jwt-decode';
import type { AuthPayload } from '../graphql/Auth/types';

interface JwtPayload {
  sub: string;
  email: string;
  exp: number;
}

/**
 * Returns true if the access token is still valid for more than 30 seconds.
 * The margin avoids using a token that would expire mid-request.
 */
export function isTokenValid(token: string): boolean {
  try {
    const { exp } = jwtDecode<JwtPayload>(token);
    return exp * 1000 > Date.now() + 30_000;
  } catch {
    return false;
  }
}

/**
 * Accepts only same-origin relative paths to avoid open redirects after login.
 */
export function getSafeRedirectPath(pathname: unknown): string {
  if (
    typeof pathname === 'string' &&
    pathname.startsWith('/') &&
    !pathname.startsWith('//') &&
    !pathname.includes('://')
  ) {
    return pathname;
  }

  return '/dashboard';
}

/**
 * Decides whether a refreshToken mutation payload can restore the session.
 * Requires success === true, a still-valid access token, and a user object.
 */
export function shouldAcceptRefreshPayload(
  error: unknown,
  payload: AuthPayload | null | undefined,
): payload is AuthPayload {
  return (
    !error &&
    payload?.success === true &&
    !!payload.accessToken &&
    isTokenValid(payload.accessToken) &&
    !!payload.user
  );
}
