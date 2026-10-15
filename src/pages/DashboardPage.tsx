import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, FileSearch } from 'lucide-react';
import { useAuthStore, selectUser } from '../auth/authStore';
import { useAuth } from '../auth/AuthContext';
import { useActiveContext } from '../auth/ActiveContext';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { DashboardFooter } from '../components/dashboard/DashboardFooter';
import { DashboardOperationsOverview } from '../components/dashboard/DashboardOperationsOverview';
import { MySurveysOverview } from '../components/dashboard/MySurveysOverview';
import { Sidebar } from '../components/dashboard/Sidebar';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { PageContainer } from '../components/dashboard/PageContainer';
import { SetorPage } from './Setor/SetorPage';
import { EmpresaPage } from './Empresa/EmpresaPage';
import { PesquisaPadronizadaPage } from './Pesquisa/PesquisaPadronizadaPage';
import { AccessManagementPage } from './AccessManagementPage';
import { useDashboardPageConfig, type MenuPage } from '../hooks/useDashboardPageConfig';
type PageInfo = {
  title: string;
  description: string;
  subtitle: string;
};

const pageInfo: Record<MenuPage, PageInfo> = {
  usuarios: { title: 'Usuários', subtitle: 'Administração', description: 'Gestão de usuários' },
  permissoes: { title: 'Permissões', subtitle: 'Administração', description: 'Permissões por persona' },
  tenants: { title: 'Tenants', subtitle: 'Administração', description: 'Administração global de tenants' },
  dashboard: {
    title: 'Dashboard',
    description: 'Andamento das pesquisas por empresa e setor',
    subtitle: 'Acompanhe convites e progresso real das pesquisas disparadas.',
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
  pesquisa: {
    title: 'Pesquisa',
    description: 'Cadastro de pesquisa e perguntas',
    subtitle: 'Cadastre novas pesquisas, perguntas e opções em uma única página.',
  },
  pesquisaPadronizada: {
    title: 'Pesquisas padronizadas',
    description: 'Gestão de pesquisas padronizadas',
    subtitle: 'Crie, publique e acompanhe pesquisas com escala fixa.',
  },
  acessos: {
    title: 'Perfis',
    description: 'Administração de acessos',
    subtitle: 'Gerencie memberships e personas contextuais.',
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
  colaboradores: {
    title: 'Cadastros',
    description: 'Cadastro de colaboradores',
    subtitle: 'Gerencie colaboradores ativos e inativos com CPF e setor.',
  },
  categoria: {
    title: 'Cadastros',
    description: 'Cadastro de categorias',
    subtitle: 'Categorize questões das pesquisas para relatórios futuros.',
  },
  consultar: {
    title: 'Pesquisas',
    description: 'Consulta de dados',
    subtitle: 'Busque temas, relatórios e indicadores com respostas rápidas.',
  },
  enviar: {
    title: 'Enviar',
    description: 'Disparo de pesquisas',
    subtitle: 'Envie pesquisas para colaboradores ou setores específicos.',
  },
};

export function DashboardPage() {
  const user = useAuthStore(selectUser);
  const { permissions, isAdmin } = useActiveContext();
  const { logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() =>
    typeof window !== 'undefined' && localStorage.getItem('dashboardSidebarCollapsed') === 'true');
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(max-width: 639.98px)').matches);
  const [selectedPage, setSelectedPage] = useState<MenuPage>('dashboard');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 639.98px)');
    const update = () => setIsMobile(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('dashboardSidebarCollapsed');
    if (!isMobile || saved !== null) {
      localStorage.setItem('dashboardSidebarCollapsed', String(sidebarCollapsed));
    }
  }, [sidebarCollapsed, isMobile]);

  const navigate = useNavigate();

  const handleToggleSidebar = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  const { handlePageChange: navigatePage } = useDashboardPageConfig(selectedPage);
  const handlePageChange = (page: MenuPage) => {
    if (['consultar', 'usuarios', 'permissoes'].includes(page)) { navigatePage(page); return; }
    if (page === 'tenants') { navigate('/dashboard/tenants'); return; }
    if (page === selectedPage && page !== 'pesquisa') {
      return;
    }

    if (page === 'empresa') {
      navigate('/dashboard/empresa');
      return;
    }

    if (page === 'setor') {
      navigate('/dashboard/setor');
      return;
    }

    if (page === 'colaboradores') {
      navigate('/dashboard/colaboradores');
      return;
    }

    if (page === 'categoria') {
      navigate('/dashboard/categoria');
      return;
    }

    if (page === 'pesquisa') {
      navigate('/dashboard/pesquisa');
      return;
    }

    if (page === 'pesquisaPadronizada') {
      navigate('/dashboard/pesquisa-padronizada');
      return;
    }

    if (page === 'acessos') {
      navigate('/dashboard/perfis');
      return;
    }

    if (page === 'enviar') {
      navigate('/dashboard/pesquisa/disparar');
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
      if (!isAdmin && permissions.includes('pesquisa.responder') && !permissions.includes('pesquisa.acompanhar')) {
        return <MySurveysOverview />;
      }
      return <DashboardOperationsOverview />;
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
          <article className="dashboard-card rounded-xl border p-6 shadow-xl shadow-[0_18px_60px_-28px_rgba(43,44,64,0.18)]">
            <h3 className="text-lg font-semibold text-[#2B2C40]">Resumo de cadastros</h3>
            <p className="mt-2 text-sm dashboard-text-muted">Acompanhe o status geral dos cadastros de empresas e setores.</p>
            <div className="mt-6 space-y-4">
              <div className="dashboard-card-alt rounded-xl border p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm dashboard-text-muted">Empresas cadastradas</p>
                    <p className="text-2xl font-semibold text-[#2B2C40]">—</p>
                  </div>
                </div>
              </div>
              <div className="dashboard-card-alt rounded-xl border p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm dashboard-text-muted">Setores ativos</p>
                    <p className="text-2xl font-semibold text-[#2B2C40]">—</p>
                  </div>
                </div>
              </div>
            </div>
          </article>

          <article className="dashboard-card rounded-xl border p-6 shadow-xl shadow-[0_18px_60px_-28px_rgba(43,44,64,0.18)]">
            <h3 className="text-lg font-semibold text-[#2B2C40]">Acessos rápidos</h3>
            <div className="mt-5 space-y-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard/empresa')}
                className="flex w-full items-center justify-between rounded-xl border dashboard-border bg-white px-4 py-4 text-left text-[#2B2C40] transition hover:border-orange-400/40 hover:bg-[#F4F6FA]"
              >
                <div>
                  <p className="font-semibold">Ir para empresas</p>
                  <p className="text-sm dashboard-text-muted">Gerencie a lista de empresas.</p>
                </div>
                <Building2 className="h-5 w-5 text-orange-400" />
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard/setor')}
                className="flex w-full items-center justify-between rounded-xl border dashboard-border bg-white px-4 py-4 text-left text-[#2B2C40] transition hover:border-orange-400/40 hover:bg-[#F4F6FA]"
              >
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
      return <DashboardOperationsOverview />;
    }

    if (selectedPage === 'pesquisaPadronizada') {
      return <PesquisaPadronizadaPage />;
    }

    if (selectedPage === 'acessos') {
      return <AccessManagementPage />;
    }

    return (
      <div className="dashboard-card space-y-4 rounded-xl border p-6 shadow-xl shadow-[0_18px_60px_-28px_rgba(43,44,64,0.18)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-[#2B2C40]">Consulta inteligente</h3>
            <p className="mt-2 text-sm dashboard-text-muted">Use filtros para identificar os dados mais importantes.</p>
          </div>
          <FileSearch className="h-6 w-6 text-orange-400" />
        </div>
        <div className="rounded-xl border dashboard-border bg-[#F4F6FA] p-6">
          <p className="text-sm text-[#646E78]">Pesquisa de contratos, clientes e valores está disponível aqui. Escolha o filtro desejado para começar.</p>
        </div>
      </div>
    );
  }, [navigate, selectedPage, isAdmin, permissions]);

  const isSidebarCollapsed = sidebarCollapsed || isMobile;
  const contentPadding = isSidebarCollapsed ? 'pl-20 pr-4' : 'pl-72 pr-4';

  return (
    <DashboardLayout
      sidebar={
        <Sidebar
          collapsed={isSidebarCollapsed}
          activePage={selectedPage}
          permissions={permissions}
          isAdmin={isAdmin}
          onSelectPage={handlePageChange}
          onToggleSidebar={handleToggleSidebar}
        />
      }
      header={
        <DashboardHeader
          collapsed={isSidebarCollapsed}
          pageTitle={pageInfo[selectedPage].title}
          userName={user?.username ?? user?.email?.split('@')[0] ?? 'Usuário'}
          onSettings={handleSettings}
          onLogout={handleLogout}
        />
      }
      footer={<DashboardFooter collapsed={isSidebarCollapsed} />}
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
