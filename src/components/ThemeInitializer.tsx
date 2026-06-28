import { useEffect } from 'react';
import { applyTheme, getPreferredTheme } from '../utils/theme';

export function ThemeInitializer() {
  useEffect(() => {
    applyTheme(getPreferredTheme());
  }, []);

  return null;
}
