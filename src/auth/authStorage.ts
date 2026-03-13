const ACCESS_TOKEN_KEY = 'access_token';
const USER_KEY = 'auth_user';

export const authStorage = {
  getToken: (): string | null =>
    sessionStorage.getItem(ACCESS_TOKEN_KEY),

  setToken: (token: string): void =>
    sessionStorage.setItem(ACCESS_TOKEN_KEY, token),

  getUser: <T>(): T | null => {
    const raw = sessionStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  },

  setUser: <T>(user: T): void =>
    sessionStorage.setItem(USER_KEY, JSON.stringify(user)),

  clear: (): void => {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  },
};