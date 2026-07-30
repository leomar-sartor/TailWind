import { useEffect, useState } from 'react';
import { useAuthStore, selectUser } from '../auth/authStore';
import { useAuth } from '../auth/AuthContext';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { DashboardFooter } from '../components/dashboard/DashboardFooter';
import { Sidebar } from '../components/dashboard/Sidebar';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { PageContainer } from '../components/dashboard/PageContainer';
import { useDashboardPageConfig, type MenuPage } from '../hooks/useDashboardPageConfig';
import { CreateEditCategoriaPage } from './CreateEditCategoriaPage';

export function CreateEditCategoriaPageWithLayout() {
  const user = useAuthStore(selectUser);
  const { logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const selectedPage: MenuPage = 'categoria';
  const { pageInfo, handlePageChange } = useDashboardPageConfig(selectedPage);

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
        <CreateEditCategoriaPage />
      </PageContainer>
    </DashboardLayout>
  );
}
