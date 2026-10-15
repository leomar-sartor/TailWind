import { useState } from 'react';
import { Building2, Check, ChevronDown, FileSearch, Layers, LayoutDashboard, Menu, Search, Send, ShieldCheck, Tags, Users, ContactRound } from 'lucide-react';
import type { MenuPage } from '../../hooks/useDashboardPageConfig';

type SidebarProps = {
  collapsed: boolean;
  activePage: MenuPage;
  permissions: string[];
  isAdmin: boolean;
  onSelectPage: (page: MenuPage) => void;
  onToggleSidebar: () => void;
};

const items = [
  {
    title: 'Principal',
    icon: <LayoutDashboard className="h-5 w-5 text-[#696CFF]" />,
    page: 'dashboard' as MenuPage,
  },
];

const groups = [
  {
    title: 'Cadastros',
    icon: <Building2 className="h-5 w-5 text-[#8592A3]" />,
    page: 'cadastros',
    children: [
      { label: 'Empresa', page: 'empresa' as MenuPage, permission: 'empresa.visualizar', icon: <Building2 className="h-4 w-4" /> },
      { label: 'Setor', page: 'setor' as MenuPage, permission: 'setor.gerenciar', icon: <Layers className="h-4 w-4" /> },
      { label: 'Colaboradores', page: 'colaboradores' as MenuPage, permission: 'colaborador.gerenciar', icon: <Users className="h-4 w-4" /> },
      { label: 'Categoria', page: 'categoria' as MenuPage, permission: 'categoria.gerenciar', icon: <Tags className="h-4 w-4" /> },
    ],
  },
  {
    title: 'Pesquisas',
    icon: <Search className="h-5 w-5 text-[#03C3EC]" />,
    page: 'pesquisas',
    children: [
      { label: 'Pesquisa', page: 'pesquisa' as MenuPage, adminOnly: true, icon: <Search className="h-4 w-4" /> },
      { label: 'Padronizada', page: 'pesquisaPadronizada' as MenuPage, permission: 'pesquisa_padronizada.gerenciar', icon: <Check className="h-4 w-4" /> },
      { label: 'Enviar', page: 'enviar' as MenuPage, adminOnly: true, icon: <Send className="h-4 w-4" /> },
      { label: 'Consultar', page: 'consultar' as MenuPage, permission: 'pesquisa.acompanhar', icon: <FileSearch className="h-4 w-4" /> },
    ],
  },
  {
    title: 'Administração',
    icon: <ShieldCheck className="h-5 w-5 text-[#8592A3]" />,
    page: 'cadastros',
    children: [
      { label: 'Usuários', page: 'usuarios' as MenuPage, adminOnly: true, icon: <Users className="h-4 w-4" /> },
      { label: 'Permissões', page: 'permissoes' as MenuPage, adminOnly: true, icon: <ShieldCheck className="h-4 w-4" /> },
      { label: 'Perfis', page: 'acessos' as MenuPage, adminOnly: true, icon: <ContactRound className="h-4 w-4" /> },
      { label: 'Tenants', page: 'tenants' as MenuPage, adminOnly: true, icon: <Building2 className="h-4 w-4" /> },
    ],
  },
];

export function Sidebar({ collapsed, activePage, permissions, isAdmin, onSelectPage, onToggleSidebar }: SidebarProps) {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    Cadastros: true,
    Pesquisas: true,
    Administração: ['acessos', 'tenants', 'usuarios', 'permissoes'].includes(activePage),
  });

  const handleGroupToggle = (group: string) => {
    setOpenGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  };

  const wrapperClasses = [
    'fixed inset-y-0 left-0 z-40 flex flex-col border-t-4 border-orange-500 border-r dashboard-sidebar transition-all duration-300 ease-out',
    collapsed ? 'w-20' : 'w-72',
  ].join(' ');

  const contentClasses = ['flex h-full flex-col overflow-hidden', collapsed ? 'items-center' : 'items-stretch'].join(' ');
  const visibleGroups = groups
    .map((group) => ({
      ...group,
      children: group.children.filter((child) =>
        child.adminOnly ? isAdmin : !child.permission || permissions.includes(child.permission)),
    }))
    .filter((group) => group.children.length > 0);

  return (
    <aside className={wrapperClasses}>
      <div className={contentClasses}>
        <div className="flex h-[65.5px] items-center justify-between gap-2 border-b-2 dashboard-border bg-white shadow px-4 dark:bg-[var(--color-surface)]">


          {/* shadow-xl shadow-[0_20px_60px_-40px_rgba(43,44,64,0.12)] */}
          {!collapsed && (
            <div className="inline-flex items-center gap-2">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-orange-400 text-slate-950 shadow-sm">
                <span className="text-lg font-bold">F</span>
              </div>
              <div>
                <p className="text-sm font-semibold dashboard-text">Funcional</p>
                <p className="text-xs dashboard-text-muted">Painel</p>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={onToggleSidebar}
            className="inline-flex h-10 w-11 items-center justify-center rounded-xl border dashboard-border bg-white dashboard-text transition hover:bg-[#F4F6FA] dark:bg-[var(--color-surface-soft)] dark:hover:bg-[var(--color-surface)]"
            aria-label="Alternar menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-3">
          <div className="space-y-0.5">
            {items.map((item) => {
              const active = activePage === item.page;
              return (
                <button
                  key={item.page}
                  type="button"
                  onClick={() => onSelectPage(item.page)}
                  aria-current={active ? 'page' : undefined}
                  className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium transition ${
                    active
                      ? 'bg-[#E6E7FF] text-[#696CFF] ring-1 ring-[#D7D8FF] dark:bg-[rgba(0,184,124,0.15)] dark:text-[#83e8c4] dark:ring-[rgba(0,184,124,0.3)]'
                      : 'text-[#646E78] hover:bg-[#F4F6FA] hover:text-[#384551] dark:text-[var(--color-text-muted)] dark:hover:bg-[var(--color-surface-soft)] dark:hover:text-[var(--color-text)]'
                  } ${collapsed ? 'justify-center' : ''}`}
                >
                  {item.icon}
                  {!collapsed && <span>{item.title}</span>}
                </button>
              );
            })}
          </div>

          <div className="mt-3 space-y-3">
            {visibleGroups.map((group) => {
              const open = openGroups[group.title];
              return (
                <div key={group.title} className="rounded-2xl border dashboard-border bg-[#F5F7FC] px-2 py-1.5 pb-2 dark:bg-[var(--color-surface)]">
                  {(() => {
                    const groupActive = activePage === group.page || group.children.some((child) => child.page === activePage);
                    return (
                      <>
                        <button
                          type="button"
                          onClick={() => handleGroupToggle(group.title)}
                          aria-expanded={!!open}
                          data-active={groupActive || undefined}
                          className={`group w-full rounded-2xl px-3 transition ${collapsed ? 'flex flex-col items-center justify-center gap-2 py-2' : 'flex items-center gap-3 py-2 hover:bg-[#E6E7FF] dark:hover:bg-[var(--color-surface-soft)]'} ${groupActive ? 'bg-[#E6E7FF] text-[#696CFF] dark:bg-[rgba(0,184,124,0.15)] dark:text-[#83e8c4]' : 'text-[#646E78] dark:text-[var(--color-text-muted)]'}`}
                          title={group.title}
                        >
                          {group.icon}
                          {!collapsed && <span className="flex-1 text-left">{group.title}</span>}
                          {!collapsed && (
                            <ChevronDown
                              className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
                            />
                          )}
                          {collapsed && groupActive && (
                            <span className="mt-1 h-2 w-2 rounded-full bg-[#696CFF] dark:bg-[#00b87c]" />
                          )}
                        </button>

                        {open && (
                          <div className={`${collapsed ? 'mt-2 flex flex-wrap justify-center gap-2 px-1' : 'mt-1 space-y-1 px-3'}`}>
                            {group.children.map((child) => {
                              const active = activePage === child.page;
                              return collapsed ? (
                                <button
                                  key={child.page}
                                  type="button"
                                  onClick={() => onSelectPage(child.page)}
                                  aria-current={active ? 'page' : undefined}
                                  className={`h-9 w-9 rounded-xl border dashboard-border bg-white flex items-center justify-center transition ${active ? 'bg-[#E6E7FF] text-[#696CFF] dark:bg-[rgba(0,184,124,0.15)] dark:text-[#83e8c4]' : 'text-[#8592A3] hover:bg-[#F4F6FA] dark:text-[var(--color-text-muted)] dark:hover:bg-[var(--color-surface-soft)]'}`}
                                  title={child.label}
                                >
                                  {child.icon}
                                </button>
                              ) : (
                                <button
                                  key={child.page}
                                  type="button"
                                  onClick={() => onSelectPage(child.page)}
                                  aria-current={active ? 'page' : undefined}
                                  className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm transition ${
                                    active
                                      ? 'bg-[#E6E7FF] text-[#696CFF] dark:bg-[rgba(0,184,124,0.15)] dark:text-[#83e8c4]'
                                      : 'text-[#646E78] hover:bg-[#F4F6FA] hover:text-[#384551] dark:text-[var(--color-text-muted)] dark:hover:bg-[var(--color-surface-soft)] dark:hover:text-[var(--color-text)]'
                                  }`}
                                >
                                  {child.icon}
                                  <span>{child.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              );
            })}
          </div>
        </nav>
      </div>
    </aside>
  );
}
