/**
 * Builds an unsigned JWT for unit tests (jwt-decode does not verify signatures).
 */
export function makeTestJwt(expOffsetSeconds: number): string {
  const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({
      sub: 'user-1',
      email: 'user@example.com',
      exp: Math.floor(Date.now() / 1000) + expOffsetSeconds,
    }),
  ).toString('base64url');

  return `${header}.${payload}.sig`;
}
