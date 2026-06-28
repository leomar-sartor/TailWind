import { Bell, ChevronDown, LogOut, Settings, SunMoon, UserCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { applyTheme, getPreferredTheme } from '../../utils/theme';

type AvailableThemes = 'dark' | 'light';

type DashboardHeaderProps = {
  collapsed: boolean;
  pageTitle: string;
  userName: string;
  roles: string[];
  onSettings: () => void;
  onLogout: () => void;
};

export function DashboardHeader({
  collapsed,
  pageTitle,
  userName,
  roles,
  onSettings,
  onLogout,
}: DashboardHeaderProps) {

  const [theme, setTheme] = useState<AvailableThemes>(() => getPreferredTheme());

  const [menuOpen, setMenuOpen] = useState(false);
  const now = new Date();
  const formattedDate = now.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const headerPositionClass = collapsed ? 'left-20 right-0' : 'left-72 right-0';

  function handleThemeChange(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) {
    event.preventDefault();

    setTheme((prevTheme) => {
      const nextTheme = prevTheme === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme);
      return nextTheme;
    });
  }

  useEffect(() => {
    const initialTheme = getPreferredTheme();
    setTheme(initialTheme);
  }, []);

  return (
    <header className={`fixed top-0 z-30 border-t-4 border-orange-500 border-b dashboard-header backdrop-blur-xl shadow-sm ${headerPositionClass}`}>
      <div className="mx-auto flex min-w-0 h-[64px] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.25em] dashboard-text-muted">
              {pageTitle}
            </p>
            <h1 className="truncate text-lg font-semibold dashboard-text sm:text-xl">
              Bem-vindo de volta, {userName}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:inline-flex rounded-2xl border dashboard-border bg-white px-3 py-2 text-sm dashboard-text-muted dark:bg-[var(--color-surface-soft)]">
            {formattedDate}
          </div>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border dashboard-border bg-white dashboard-text transition hover:bg-[#F4F6FA] dark:bg-[var(--color-surface-soft)] dark:hover:bg-[var(--color-surface)]"
            aria-label="Notificações"
          >
            <Bell className="h-5 w-5" />
          </button>
          <details
            className="relative"
            onToggle={(event) => setMenuOpen((event.target as HTMLDetailsElement).open)}
          >
            <summary className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border dashboard-border bg-white px-3 py-2 text-sm dashboard-text transition hover:bg-[#F4F6FA] dark:bg-[var(--color-surface-soft)] dark:hover:bg-[var(--color-surface)]">
              <UserCircle2 className="h-5 w-5 text-orange-400" />
              <div className="flex flex-col leading-tight">
                <span>{userName}</span>
                <span className="text-xs dashboard-text-muted">{roles.join(', ')}</span>
              </div>
              <ChevronDown className={`h-4 w-4 text-[#8592A3] transition ${menuOpen ? 'rotate-180' : ''}`} />
            </summary>

            <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-3xl border dashboard-border bg-white text-left shadow-xl dark:bg-[var(--color-surface)]">
              <button
                type="button"
                onClick={onSettings}
                className="flex w-full items-center gap-3 px-4 py-3 text-sm dashboard-text transition hover:bg-[#F4F6FA] dark:hover:bg-[var(--color-surface-soft)]"
              >
                <Settings className="h-4 w-4 dashboard-text-muted" />
                Configurações
              </button>
              <button
                type="button"
                onClick={(event) => handleThemeChange(event)}
                className="flex w-full items-center gap-3 px-4 py-3 text-sm dashboard-text transition hover:bg-[#F4F6FA] dark:hover:bg-[var(--color-surface-soft)]"
              >
                <SunMoon className="h-4 w-4 dashboard-text-muted" />
                Tema: {theme}
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="flex w-full items-center gap-3 border-t dashboard-border px-4 py-3 text-sm dashboard-text transition hover:bg-[#F4F6FA] dark:hover:bg-[var(--color-surface-soft)]"
              >
                <LogOut className="h-4 w-4 dashboard-text-muted" />
                Sair
              </button>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
