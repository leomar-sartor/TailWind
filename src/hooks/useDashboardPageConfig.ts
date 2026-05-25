import { useNavigate } from 'react-router-dom';

export type MenuPage = 'dashboard' | 'cadastros' | 'pesquisas' | 'pesquisa' | 'empresa' | 'setor' | 'colaboradores' | 'consultar';

export const pageInfo: Record<MenuPage, { title: string; description: string }> = {
  dashboard: { title: 'Dashboard', description: 'Visão geral do painel administrativo' },
  cadastros: { title: 'Cadastros', description: 'Visão geral dos cadastros' },
  pesquisas: { title: 'Pesquisas', description: 'Visão geral das pesquisas' },
  pesquisa: { title: 'Pesquisa', description: 'Listagem e cadastro de pesquisas' },
  empresa: { title: 'Cadastros', description: 'Cadastro de empresas' },
  setor: { title: 'Cadastros', description: 'Cadastro de setores' },
  colaboradores: { title: 'Cadastros', description: 'Cadastro de colaboradores' },
  consultar: { title: 'Pesquisas', description: 'Consulta de dados' },
};

const navigationMap: Record<MenuPage, string | null> = {
  dashboard: '/dashboard',
  cadastros: '/dashboard',
  pesquisas: '/dashboard',
  pesquisa: '/dashboard/pesquisa',
  empresa: '/dashboard/empresa',
  setor: '/dashboard/setor',
  colaboradores: '/dashboard/colaboradores',
  consultar: '/dashboard',
};

export function useDashboardPageConfig(currentPage: MenuPage) {
  const navigate = useNavigate();

  const handlePageChange = (page: MenuPage) => {
    // Não fazer nada se for a página atual
    if (page === currentPage) return;

    // Navegar para a página
    const path = navigationMap[page];
    if (path) {
      navigate(path);
    }
  };

  return {
    pageInfo,
    handlePageChange,
  };
}
