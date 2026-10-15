import { StatusBadge } from '../components/StatusBadge';
import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { toast } from 'react-toastify';
import { FormErrorAlert } from '../components/FormErrorAlert';
import { CadastroDataTable, CadastroFormHeader, CadastroFormActions, CadastroPageHeader, CadastroPaginationBar, CadastroSearchBar, CadastroTableCell, CadastroTableRow, RowActions } from '../components/cadastro';
import { useCursorPagination } from '../hooks/useCursorPagination';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { CADASTRO_PAGE_SIZE } from '../constants/cadastro';
import { CREATE_TENANT } from '../graphql/Auth/accessMutations';
import { GET_MY_AVAILABLE_ACCESS_CONTEXTS } from '../graphql/Auth/accessQueries';
import { GET_TENANTS, UPDATE_TENANT, REMOVE_TENANT, type GetTenantsData, type TenantNode } from '../graphql/Auth/tenantQueries';
import { confirmDeletion, getGraphQLErrorMessage } from '../utils/confirmToast';
import { useActiveContext } from '../auth/ActiveContext';
import { apolloClient } from '../graphql/client';

export function TenantsPage() {
  const { isAdmin } = useActiveContext();
  return isAdmin ? <TenantAdminPage /> : <FormErrorAlert message="Somente Admin pode gerenciar tenants." />;
}
function TenantAdminPage() {
  const [filter, setFilter] = useState('');
  const search = useDebouncedValue(filter, 300);
  const pagination = useCursorPagination({ resetDeps: [search] });
  const [editing, setEditing] = useState<TenantNode | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [failure, setFailure] = useState<string | null>(null);
  const { data, loading, error, refetch } = useQuery<GetTenantsData>(GET_TENANTS, {
    variables: { first: CADASTRO_PAGE_SIZE, after: pagination.after, where: search.trim() ? { nome: { contains: search.trim() } } : null },
    notifyOnNetworkStatusChange: true, fetchPolicy: 'cache-and-network',
  });
  const [create, { loading: creating }] = useMutation(CREATE_TENANT);
  const [update, { loading: updating }] = useMutation<{ updateTenant: TenantNode | null }>(UPDATE_TENANT);
  const [remove, { loading: removing }] = useMutation<{ removeTenant: boolean }>(REMOVE_TENANT);
  const busy = creating || updating || removing;
  const tenants = error ? [] : data?.tenants?.nodes ?? [];
  const pageInfo = data?.tenants?.pageInfo;
  async function save(event: React.FormEvent) {
    event.preventDefault(); setFailure(null);
    try {
      const result = editing ? await update({ variables: { id: Number(editing.id), nome: name.trim() } }) : await create({ variables: { nome: name.trim() } });
      if (result.error) throw result.error;
      if (!result.data || Object.values(result.data).some(value => value == null)) throw new Error('Tenant não encontrado.');
      setShowForm(false); setEditing(null); setName(''); await refetch();
      await apolloClient.refetchQueries({ include: [GET_MY_AVAILABLE_ACCESS_CONTEXTS] });
      toast.success('Tenant salvo com sucesso.');
    } catch (err) { const message = getGraphQLErrorMessage(err) ?? 'Não foi possível salvar o tenant.'; setFailure(message); toast.error(message); }
  }
  function removeTenant(tenant: TenantNode) {
    confirmDeletion({ title: 'Remover tenant', message: `Remover ${tenant.nome}? Tenants com empresas ou usuários vinculados não podem ser removidos.`, confirmLabel: 'Sim, remover', onConfirm: async () => {
      setFailure(null);
      try {
        const result = await remove({ variables: { id: Number(tenant.id) } });
        if (result.error) throw result.error;
        if (!result.data?.removeTenant) throw new Error('Tenant não encontrado.');
        await refetch(); await apolloClient.refetchQueries({ include: [GET_MY_AVAILABLE_ACCESS_CONTEXTS] }); toast.success('Tenant removido.');
      } catch (err) { const message = getGraphQLErrorMessage(err) ?? 'Não foi possível remover o tenant.'; setFailure(message); toast.error(message); }
    } });
  }
  return <div className="space-y-6">
    <CadastroPageHeader title="Tenants" description="Administração global de tenants." createLabel="Cadastrar tenant" onCreate={() => { setEditing(null); setName(''); setShowForm(true); }} />
    <FormErrorAlert message={failure ?? (error ? getGraphQLErrorMessage(error) ?? 'Não foi possível carregar tenants.' : null)} />
    {showForm && <form onSubmit={save} className="dashboard-card border p-6 space-y-4">
      <CadastroFormHeader title={editing ? 'Editar tenant' : 'Novo tenant'} description="Dados do tenant." onBack={() => setShowForm(false)} />
      <label className="block">Nome do tenant<input required value={name} onChange={event => setName(event.target.value)} className="block w-full border dashboard-border px-3 py-2 dark:bg-[var(--color-surface-soft)]" /></label>
      <CadastroFormActions submitLabel="Salvar" isBusy={busy} onCancel={() => setShowForm(false)} />
    </form>}
    <CadastroSearchBar value={filter} onChange={setFilter} hint="Pesquise pelo nome do tenant." />
    <CadastroDataTable columns={['Ações', 'Código', 'Nome', 'Situação']} empty={!tenants.length} loading={loading} emptyText="Nenhum tenant encontrado."
      footer={<CadastroPaginationBar pageSize={CADASTRO_PAGE_SIZE} totalCount={data?.tenants?.totalCount ?? 0} currentCursorIndex={pagination.currentCursorIndex} hasPreviousPage={pagination.hasPreviousPage}
        hasNextPage={!!pageInfo?.hasNextPage} canGoToLastKnown={pagination.canGoToLastKnown} canGoToPage={pagination.canGoToPage} itemLabel={count => `${count} tenant${count === 1 ? '' : 's'}`}
        endCursor={pageInfo?.endCursor} onFirst={pagination.goToFirst} onPrevious={pagination.goToPrevious} onNext={pagination.goToNext} onLastKnown={pagination.goToLastKnown} onPageIndex={pagination.goToPageIndex} />}>
      {tenants.map(tenant => <CadastroTableRow key={tenant.id}>
        <CadastroTableCell><RowActions disabled={busy} onEdit={() => { setEditing(tenant); setName(tenant.nome); setShowForm(true); }} onDelete={() => removeTenant(tenant)} /></CadastroTableCell>
        <CadastroTableCell muted>{tenant.id}</CadastroTableCell><CadastroTableCell>{tenant.nome}</CadastroTableCell><CadastroTableCell><StatusBadge tone={tenant.ativo ? 'positive' : 'negative'}>{tenant.ativo ? 'Ativo' : 'Inativo'}</StatusBadge></CadastroTableCell>
      </CadastroTableRow>)}
    </CadastroDataTable>
  </div>;
}
