export type AppTheme = 'dark' | 'light';

const STORAGE_KEY = 'theme';

function isBrowser() {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

export function getStoredTheme(): AppTheme | null {
  if (!isBrowser()) {
    return null;
  }

  const storedValue = window.localStorage.getItem(STORAGE_KEY);
  return storedValue === 'dark' || storedValue === 'light' ? storedValue : null;
}

export function getPreferredTheme(): AppTheme {
  const storedTheme = getStoredTheme();
  if (storedTheme) {
    return storedTheme;
  }

  if (isBrowser() && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

  return 'light';
}

export function applyTheme(theme: AppTheme) {
  if (!isBrowser()) {
    return;
  }

  const htmlElement = document.documentElement;
  htmlElement.classList.toggle('dark', theme === 'dark');
  window.localStorage.setItem(STORAGE_KEY, theme);
}
