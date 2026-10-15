import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

type PageContainerProps = {
  loading: boolean;
  title: string;
  description: string;
  children: React.ReactNode;
};

export function PageContainer({ loading, title, description, children }: PageContainerProps) {
  const { pathname, search } = useLocation();
  const section = pathname.split('/')[2];
  const sections: Record<string, [string, string]> = {
    empresa: ['Cadastros', 'Empresas'], setor: ['Cadastros', 'Setores'],
    colaboradores: ['Cadastros', 'Colaboradores'], categoria: ['Cadastros', 'Categorias'],
    pesquisa: ['Pesquisas', 'Pesquisa'], 'pesquisa-padronizada': ['Pesquisas', 'Padronizadas'],
    usuarios: ['Administração', 'Usuários'], permissoes: ['Administração', 'Permissões'], consultar: ['Pesquisas', 'Consultar'],
    tenants: ['Administração', 'Tenants'], acessos: ['Administração', 'Perfis'], perfis: ['Administração', 'Perfis'],
  };
  const labels = sections[section];
  const isForm = pathname.endsWith('/create') || pathname.endsWith('/disparar');
  const crumbs = labels
    ? [{ label: labels[0] }, { label: labels[1], to: isForm ? `/dashboard/${section}` : undefined },
      ...(isForm ? [{ label: pathname.endsWith('/disparar') ? 'Disparo' : new URLSearchParams(search).has('id') ? 'Editar' : 'Formulário' }] : [])]
    : [{ label: title === 'Dashboard' ? 'Principal' : title }, ...(title === 'Dashboard' ? [] : [{ label: description }])];
  if (loading) {
    return (
      <section className="space-y-5 px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto pb-24 pt-2 space-y-5">
          <div className="h-12 w-3/4 rounded-lg bg-[#E4E6E8]/70 animate-pulse" />
          <div className="grid gap-4 md:grid-cols-3">
            <div className="h-36 rounded-xl bg-[#E4E6E8]/70 animate-pulse" />
            <div className="h-36 rounded-xl bg-[#E4E6E8]/70 animate-pulse" />
            <div className="h-36 rounded-xl bg-[#E4E6E8]/70 animate-pulse" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="h-48 rounded-xl bg-[#E4E6E8]/70 animate-pulse" />
            <div className="h-48 rounded-xl bg-[#E4E6E8]/70 animate-pulse" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-2 py-2 sm:px-4 lg:px-6">
      <div className="max-w-7xl mx-auto pb-24 pt-2">
        <div className="mb-5 py-1">
          <nav aria-label="Breadcrumb" className="text-xs dashboard-text-muted">
            <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
              {crumbs.map((crumb, index) => <li key={`${crumb.label}:${index}`} className="inline-flex items-center gap-1.5">
                {index > 0 && <ChevronRight aria-hidden="true" className="h-3 w-3 opacity-50" />}
                {'to' in crumb && crumb.to
                  ? <Link to={crumb.to} className="rounded-sm transition-colors hover:text-[var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]">{crumb.label}</Link>
                  : <span aria-current={index === crumbs.length - 1 ? 'page' : undefined} className={index === crumbs.length - 1 ? 'font-medium dashboard-text' : undefined}>{crumb.label}</span>}
              </li>)}
            </ol>
          </nav>
        </div>
        {children}
      </div>
    </section>
  );
}
