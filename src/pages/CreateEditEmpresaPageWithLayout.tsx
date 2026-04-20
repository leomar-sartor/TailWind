import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, selectUser } from '../auth/authStore';
import { useAuth } from '../auth/AuthContext';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { DashboardFooter } from '../components/dashboard/DashboardFooter';
import { Sidebar } from '../components/dashboard/Sidebar';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { PageContainer } from '../components/dashboard/PageContainer';
import { CreateEditEmpresaPage } from './CreateEditEmpresaPage';

type MenuPage = 'dashboard' | 'cadastros' | 'pesquisas' | 'empresa' | 'setor' | 'consultar';

const pageInfo: Record<MenuPage, { title: string; description: string }> = {
  dashboard: { title: 'Dashboard', description: 'Visão geral do painel administrativo' },
  cadastros: { title: 'Cadastros', description: 'Visão geral dos cadastros' },
  pesquisas: { title: 'Pesquisas', description: 'Visão geral das pesquisas' },
  empresa: { title: 'Cadastros', description: 'Cadastro de empresas' },
  setor: { title: 'Cadastros', description: 'Cadastro de setores' },
  consultar: { title: 'Pesquisas', description: 'Consulta de dados' },
};

export function CreateEditEmpresaPageWithLayout() {
  const navigate = useNavigate();
  const user = useAuthStore(selectUser);
  const { logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedPage] = useState<MenuPage>('empresa');

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
    if (page === 'empresa') return;
    navigate('/dashboard');
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleSettings = () => {
    window.alert('Abrir configurações de usuário (a implementar).');
  };

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
        loading={false}
        title={pageInfo[selectedPage].title}
        description={pageInfo[selectedPage].description}
      >
        <CreateEditEmpresaPage />
      </PageContainer>
    </DashboardLayout>
  );
}
