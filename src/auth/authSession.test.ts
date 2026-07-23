import { describe, expect, it } from 'vitest';
import {
  getSafeRedirectPath,
  isTokenValid,
  shouldAcceptRefreshPayload,
} from './authSession';
import type { AuthPayload } from '../graphql/types/auth.types';
import { makeTestJwt } from '../test/jwtTestUtils';

function makePayload(overrides: Partial<AuthPayload> = {}): AuthPayload {
  return {
    success: true,
    message: 'ok',
    accessToken: makeTestJwt(3600),
    user: {
      id: '1',
      email: 'user@example.com',
      userName: 'user',
      roles: ['Admin'],
    },
    ...overrides,
  };
}

describe('shouldAcceptRefreshPayload', () => {
  it('accepts a successful refresh with a valid token and user', () => {
    expect(shouldAcceptRefreshPayload(undefined, makePayload())).toBe(true);
  });

  it('rejects when success is false (clearAuth path)', () => {
    expect(shouldAcceptRefreshPayload(undefined, makePayload({ success: false }))).toBe(false);
  });

  it('rejects when GraphQL error is present even if data looks valid', () => {
    expect(shouldAcceptRefreshPayload(new Error('auth failed'), makePayload())).toBe(false);
  });

  it('rejects when access token is missing or expired', () => {
    expect(shouldAcceptRefreshPayload(undefined, makePayload({ accessToken: '' }))).toBe(false);
    expect(
      shouldAcceptRefreshPayload(undefined, makePayload({ accessToken: makeTestJwt(-120) })),
    ).toBe(false);
  });

  it('rejects when user is missing', () => {
    expect(
      shouldAcceptRefreshPayload(undefined, {
        ...makePayload(),
        user: undefined as unknown as AuthPayload['user'],
      }),
    ).toBe(false);
  });
});

describe('isTokenValid', () => {
  it('returns true for tokens that expire far enough in the future', () => {
    expect(isTokenValid(makeTestJwt(120))).toBe(true);
  });

  it('returns false for expired or malformed tokens', () => {
    expect(isTokenValid(makeTestJwt(-10))).toBe(false);
    expect(isTokenValid('not-a-jwt')).toBe(false);
  });
});

describe('getSafeRedirectPath', () => {
  it('allows internal relative paths and falls back otherwise', () => {
    expect(getSafeRedirectPath('/empresas')).toBe('/empresas');
    expect(getSafeRedirectPath('//evil.com')).toBe('/dashboard');
    expect(getSafeRedirectPath('https://evil.com')).toBe('/dashboard');
    expect(getSafeRedirectPath(null)).toBe('/dashboard');
  });
});
