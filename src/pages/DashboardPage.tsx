import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Building2, FileSearch } from 'lucide-react';
import { useAuthStore, selectUser } from '../auth/authStore';
import { useAuth } from '../auth/AuthContext';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { DashboardFooter } from '../components/dashboard/DashboardFooter';
import { Sidebar } from '../components/dashboard/Sidebar';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { PageContainer } from '../components/dashboard/PageContainer';
import { SetorPage } from './SetorPage';
import { EmpresaPage } from './EmpresaPage';

type MenuPage = 'dashboard' | 'cadastros' | 'pesquisas' | 'empresa' | 'setor' | 'consultar';

type PageInfo = {
  title: string;
  description: string;
  subtitle: string;
};

const pageInfo: Record<MenuPage, PageInfo> = {
  dashboard: {
    title: 'Dashboard',
    description: 'Visão geral do painel administrativo',
    subtitle: 'Acompanhe resultados, status de sistemas e ações recentes em tempo real.',
  },
  cadastros: {
    title: 'Cadastros',
    description: 'Visão geral dos cadastros',
    subtitle: 'Acesse os principais cadastros e acompanhe o estado das informações.',
  },
  pesquisas: {
    title: 'Pesquisas',
    description: 'Visão geral das pesquisas',
    subtitle: 'Acesse relatórios e filtros para encontrar os dados mais importantes.',
  },
  empresa: {
    title: 'Cadastros',
    description: 'Cadastro de empresas',
    subtitle: 'Gerencie empresas ativas, dados cadastrais e informações de contato.',
  },
  setor: {
    title: 'Cadastros',
    description: 'Cadastro de setores',
    subtitle: 'Organize setores internos com descrição e responsáveis.',
  },
  consultar: {
    title: 'Pesquisas',
    description: 'Consulta de dados',
    subtitle: 'Busque temas, relatórios e indicadores com respostas rápidas.',
  },
};

const stats = [
  { label: 'Receita Mensal', value: 'R$ 84.320', delta: '+12,4%', positive: true },
  { label: 'Usuários Ativos', value: '3.291', delta: '+8,1%', positive: true },
  { label: 'Tickets Abertos', value: '47', delta: '-3,2%', positive: false },
  { label: 'Uptime', value: '99,98%', delta: '+0,02%', positive: true },
];

const activity = [
  { id: 1, title: 'Novo pedido registrado', details: 'Ana Costa enviou uma cotação', time: '2 min atrás' },
  { id: 2, title: 'Perfil atualizado', details: 'Bruno Lima atualizou seus dados', time: '14 min atrás' },
  { id: 3, title: 'Ticket recebido', details: 'Carla Dias abriu ticket #4821', time: '31 min atrás' },
  { id: 4, title: 'Chamado finalizado', details: 'Diego Ramos resolveu ticket #4799', time: '1h atrás' },
];

export function DashboardPage() {
  const user = useAuthStore(selectUser);
  const { logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedPage, setSelectedPage] = useState<MenuPage>('dashboard');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 639.98px)');
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setSidebarCollapsed(true);
      return;
    }

    const saved = localStorage.getItem('dashboardSidebarCollapsed');
    setSidebarCollapsed(saved === 'true');
  }, [isMobile]);

  useEffect(() => {
    const saved = localStorage.getItem('dashboardSidebarCollapsed');
    if (!isMobile || saved !== null) {
      localStorage.setItem('dashboardSidebarCollapsed', String(sidebarCollapsed));
    }
  }, [sidebarCollapsed, isMobile]);

  const handleToggleSidebar = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  const handlePageChange = (page: MenuPage) => {
    if (page === selectedPage) {
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setSelectedPage(page);
      setLoading(false);
    }, 550);
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleSettings = () => {
    window.alert('Abrir configurações de usuário (a implementar).');
  };

  const content = useMemo(() => {
    if (selectedPage === 'dashboard') {
      return (
        <div className="space-y-6">
          <div className="grid gap-4 xl:grid-cols-4">
            {stats.map((item) => (
              <article
                key={item.label}
                className="dashboard-card rounded-[28px] border p-5 shadow-xl shadow-[0_18px_60px_-28px_rgba(43,44,64,0.18)]"
              >
                <p className="text-xs uppercase tracking-[0.32em] dashboard-text-muted">{item.label}</p>
                <div className="mt-4 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-3xl font-semibold text-[#2B2C40]">{item.value}</p>
                    <p className={`mt-2 text-sm font-semibold ${item.positive ? 'text-emerald-300' : 'text-rose-300'}`}>
                      {item.delta}
                    </p>
                  </div>
                  <div className={`h-14 w-14 rounded-3xl ${item.positive ? 'bg-emerald-500/10' : 'bg-rose-500/10'} flex items-center justify-center`}>
                    <ArrowRight className={`h-5 w-5 ${item.positive ? 'text-emerald-300' : 'text-rose-300'}`} />
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.3fr_0.9fr]">
            <section className="dashboard-card space-y-4 rounded-[28px] border p-6 shadow-xl shadow-[0_18px_60px_-28px_rgba(43,44,64,0.18)]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-[#2B2C40]">Atividade recente</h3>
                  <p className="mt-1 text-sm dashboard-text-muted">As últimas ações realizadas pela equipe.</p>
                </div>
                <span className="rounded-full bg-[#F4F6FA] px-3 py-1 text-xs uppercase tracking-[0.28em] dashboard-text-muted">Ao vivo</span>
              </div>
              <div className="space-y-3">
                {activity.map((item) => (
                  <article key={item.id} className="dashboard-card-alt rounded-3xl border p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-semibold text-[#2B2C40]">{item.title}</h4>
                        <p className="mt-1 text-sm dashboard-text-muted">{item.details}</p>
                      </div>
                      <time className="text-xs uppercase tracking-[0.24em] dashboard-text-muted">{item.time}</time>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="dashboard-card rounded-[28px] border p-6 shadow-xl shadow-[0_18px_60px_-28px_rgba(43,44,64,0.18)]">
              <h3 className="text-lg font-semibold text-[#2B2C40]">Status do sistema</h3>
              <div className="mt-5 space-y-4">
                {[
                  { label: 'API GraphQL', value: '99,98%', pct: 99, color: 'bg-emerald-400' },
                  { label: 'Banco de dados', value: '87 ms', pct: 82, color: 'bg-sky-400' },
                  { label: 'Cache (Redis)', value: '12 ms', pct: 95, color: 'bg-emerald-400' },
                  { label: 'Storage', value: '64%', pct: 64, color: 'bg-amber-400' },
                ].map((item) => (
                  <div key={item.label} className="space-y-2">
                    <div className="flex items-center justify-between text-sm dashboard-text-muted">
                      <span>{item.label}</span>
                      <span className="font-semibold text-[#2B2C40]">{item.value}</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#F4F6FA]">
                      <div className={`${item.color} h-2 rounded-full`} style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      );
    }

    if (selectedPage === 'empresa') {
      return <EmpresaPage />;
    }

    if (selectedPage === 'setor') {
      return <SetorPage />;
    }

    if (selectedPage === 'cadastros') {
      return (
        <div className="grid gap-4 lg:grid-cols-2">
          <article className="dashboard-card rounded-[28px] border p-6 shadow-xl shadow-[0_18px_60px_-28px_rgba(43,44,64,0.18)]">
            <h3 className="text-lg font-semibold text-[#2B2C40]">Resumo de cadastros</h3>
            <p className="mt-2 text-sm dashboard-text-muted">Acompanhe o status geral dos cadastros de empresas e setores.</p>
            <div className="mt-6 space-y-4">
              <div className="dashboard-card-alt rounded-3xl border p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm dashboard-text-muted">Empresas cadastradas</p>
                    <p className="text-2xl font-semibold text-[#2B2C40]">3</p>
                  </div>
                </div>
              </div>
              <div className="dashboard-card-alt rounded-3xl border p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm dashboard-text-muted">Setores ativos</p>
                    <p className="text-2xl font-semibold text-[#2B2C40]">3</p>
                  </div>
                </div>
              </div>
            </div>
          </article>

          <article className="dashboard-card rounded-[28px] border p-6 shadow-xl shadow-[0_18px_60px_-28px_rgba(43,44,64,0.18)]">
            <h3 className="text-lg font-semibold text-[#2B2C40]">Acessos rápidos</h3>
            <div className="mt-5 space-y-4">
              <button className="flex w-full items-center justify-between rounded-3xl border dashboard-border bg-white px-4 py-4 text-left text-[#2B2C40] transition hover:border-orange-400/40 hover:bg-[#F4F6FA]">
                <div>
                  <p className="font-semibold">Ir para empresas</p>
                  <p className="text-sm dashboard-text-muted">Gerencie a lista de empresas.</p>
                </div>
                <Building2 className="h-5 w-5 text-orange-400" />
              </button>
              <button className="flex w-full items-center justify-between rounded-3xl border dashboard-border bg-white px-4 py-4 text-left text-[#2B2C40] transition hover:border-orange-400/40 hover:bg-[#F4F6FA]">
                <div>
                  <p className="font-semibold">Ir para setores</p>
                  <p className="text-sm dashboard-text-muted">Visualize todos os setores.</p>
                </div>
                <ArrowRight className="h-5 w-5 text-orange-400" />
              </button>
            </div>
          </article>
        </div>
      );
    }

    if (selectedPage === 'pesquisas') {
      return (
        <div className="space-y-4">
          <section className="dashboard-card rounded-[28px] border p-6 shadow-xl shadow-[0_18px_60px_-28px_rgba(43,44,64,0.18)]">
            <h3 className="text-lg font-semibold text-[#2B2C40]">Painel de pesquisas</h3>
            <p className="mt-2 text-sm dashboard-text-muted">Veja as consultas recentes e métricas principais.</p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="dashboard-card-alt rounded-3xl border p-4">
                <p className="text-sm dashboard-text-muted">Consultas realizadas</p>
                <p className="mt-2 text-2xl font-semibold text-[#2B2C40]">124</p>
              </div>
              <div className="dashboard-card-alt rounded-3xl border p-4">
                <p className="text-sm dashboard-text-muted">Tempo médio de resposta</p>
                <p className="mt-2 text-2xl font-semibold text-[#2B2C40]">1,2s</p>
              </div>
            </div>
          </section>
          <section className="dashboard-card rounded-[28px] border p-6 shadow-xl shadow-[0_18px_60px_-28px_rgba(43,44,64,0.18)]">
            <h3 className="text-lg font-semibold text-[#2B2C40]">Últimas buscas</h3>
            <ul className="mt-5 space-y-3 text-[#646E78]">
              <li className="dashboard-card-alt rounded-3xl border p-4">Busca por contrato mais rápido.</li>
              <li className="dashboard-card-alt rounded-3xl border p-4">Filtragem de clientes por segmentação.</li>
            </ul>
          </section>
        </div>
      );
    }

    return (
      <div className="dashboard-card space-y-4 rounded-[28px] border p-6 shadow-xl shadow-[0_18px_60px_-28px_rgba(43,44,64,0.18)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-[#2B2C40]">Consulta inteligente</h3>
            <p className="mt-2 text-sm dashboard-text-muted">Use filtros para identificar os dados mais importantes.</p>
          </div>
          <FileSearch className="h-6 w-6 text-orange-400" />
        </div>
        <div className="rounded-3xl border dashboard-border bg-[#F4F6FA] p-6">
          <p className="text-sm text-[#646E78]">Pesquisa de contratos, clientes e valores está disponível aqui. Escolha o filtro desejado para começar.</p>
        </div>
      </div>
    );
  }, [selectedPage]);

  const contentPadding = sidebarCollapsed ? 'pl-20 pr-4' : 'pl-72 pr-4';

  return (
    <DashboardLayout
      sidebar={
        <Sidebar
          collapsed={sidebarCollapsed}
          activePage={selectedPage}
          onSelectPage={handlePageChange}
          onToggleSidebar={handleToggleSidebar}
        />
      }
      header={
        <DashboardHeader
          collapsed={sidebarCollapsed}
          pageTitle={pageInfo[selectedPage].title}
          userName={user?.username ?? user?.email?.split('@')[0] ?? 'Usuário'}
          roles={user?.roles ?? ['Gestor']}
          onSettings={handleSettings}
          onLogout={handleLogout}
        />
      }
      footer={<DashboardFooter collapsed={sidebarCollapsed} />}
      contentClassName={contentPadding}
    >
      <PageContainer
        loading={loading}
        title={pageInfo[selectedPage].title}
        description={pageInfo[selectedPage].description}
      >
        <div className="max-w-7xl mx-auto pb-24 pt-2">
          {content}
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
