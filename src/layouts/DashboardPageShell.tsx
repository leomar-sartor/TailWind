import { useEffect, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore, selectUser } from '../auth/authStore';
import { useAuth } from '../auth/AuthContext';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { DashboardFooter } from '../components/dashboard/DashboardFooter';
import { Sidebar } from '../components/dashboard/Sidebar';
import { PageContainer } from '../components/dashboard/PageContainer';
import { CadastroAlert } from '../components/cadastro/CadastroAlert';
import { useDashboardPageConfig, type MenuPage } from '../hooks/useDashboardPageConfig';
import { DashboardLayout } from './DashboardLayout';

type DashboardPageShellProps = {
  page: MenuPage;
  children: ReactNode;
  /** Show flash message from `location.state.message`. Defaults to true. */
  showFlashMessage?: boolean;
};

/**
 * Shared dashboard chrome (sidebar, header, footer, page container) for cadastro routes.
 */
export function DashboardPageShell({
  page,
  children,
  showFlashMessage = true,
}: DashboardPageShellProps) {
  const location = useLocation();
  const user = useAuthStore(selectUser);
  const { logout } = useAuth();
  const [message, setMessage] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { pageInfo, handlePageChange } = useDashboardPageConfig(page);

  useEffect(() => {
    if (!showFlashMessage || !location.state?.message) return;

    setMessage(location.state.message);
    const timer = setTimeout(() => setMessage(null), 5000);
    return () => clearTimeout(timer);
  }, [location.state?.message, showFlashMessage]);

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
          activePage={page}
          onSelectPage={handlePageChange}
          onToggleSidebar={handleToggleSidebar}
        />
      }
      header={
        <DashboardHeader
          collapsed={sidebarCollapsed}
          pageTitle={pageInfo[page].title}
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
        title={pageInfo[page].title}
        description={pageInfo[page].description}
      >
        {message && (
          <CadastroAlert variant="success" className="mb-4">
            {message}
          </CadastroAlert>
        )}
        {children}
      </PageContainer>
    </DashboardLayout>
  );
}
