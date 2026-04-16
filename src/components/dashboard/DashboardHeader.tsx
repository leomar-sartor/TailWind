import { Bell, ChevronDown, LogOut, Settings, SunMoon, UserCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';

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

  const [theme, setTheme] = useState<AvailableThemes>('dark');

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

    setTheme(prevTheme => {
      const nextTheme = prevTheme === 'dark' ? 'light' : 'dark';
      return nextTheme;
    });
  }

  useEffect(() => {
    const htmlElement = document.documentElement;
    htmlElement.classList.toggle('dark');

    return () => {
    };
  }, [theme]);

  return (
    <header className={`fixed top-0 z-30 border-t-4 border-orange-500 border-b dashboard-header backdrop-blur-xl shadow-sm ${headerPositionClass}`}>
      <div className="mx-auto flex min-w-0 h-[64px] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.25em] dashboard-text-muted">
              {pageTitle}
            </p>
            <h1 className="truncate text-lg font-semibold text-[#384551] sm:text-xl">
              Bem-vindo de volta, {userName}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:inline-flex rounded-2xl border dashboard-border bg-white px-3 py-2 text-sm text-[#646E78]">
            {formattedDate}
          </div>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border dashboard-border bg-white text-[#384551] transition hover:bg-[#F4F6FA]"
            aria-label="Notificações"
          >
            <Bell className="h-5 w-5" />
          </button>
          <details
            className="relative"
            onToggle={(event) => setMenuOpen((event.target as HTMLDetailsElement).open)}
          >
            <summary className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border dashboard-border bg-white px-3 py-2 text-sm text-[#384551] transition hover:bg-[#F4F6FA]">
              <UserCircle2 className="h-5 w-5 text-orange-400" />
              <div className="flex flex-col leading-tight">
                <span>{userName}</span>
                <span className="text-xs dashboard-text-muted">{roles.join(', ')}</span>
              </div>
              <ChevronDown className={`h-4 w-4 text-[#8592A3] transition ${menuOpen ? 'rotate-180' : ''}`} />
            </summary>

            <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-3xl border dashboard-border bg-white text-left shadow-xl shadow-[0_20px_60px_-40px_rgba(43,44,64,0.12)]">
              <button
                type="button"
                onClick={onSettings}
                className="flex w-full items-center gap-3 px-4 py-3 text-sm text-[#384551] transition hover:bg-[#F4F6FA]"
              >
                <Settings className="h-4 w-4 text-[#8592A3]" />
                Configurações
              </button>
              <button
                type="button"
                onClick={(event) => handleThemeChange(event)}
                className="flex w-full items-center gap-3 px-4 py-3 text-sm text-[#384551] transition hover:bg-[#F4F6FA]"
              >
                <SunMoon className="h-4 w-4 text-[#8592A3]" />
                Tema
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="flex w-full items-center gap-3 border-t dashboard-border px-4 py-3 text-sm text-[#384551] transition hover:bg-[#F4F6FA]"
              >
                <LogOut className="h-4 w-4 text-[#8592A3]" />
                Sair
              </button>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
