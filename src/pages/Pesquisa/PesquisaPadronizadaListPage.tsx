import { StatusBadge } from '../../components/StatusBadge';
import { Send } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client/react';
import { toast } from 'react-toastify';
import { Button } from '../../components/Button';
import { CadastroAlert, CadastroDataTable, CadastroPageHeader, CadastroPaginationBar, CadastroSearchBar, CadastroTableCell, CadastroTableRow } from '../../components/cadastro';
import { useCursorPagination } from '../../hooks/useCursorPagination';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { CADASTRO_PAGE_SIZE } from '../../constants/cadastro';
import { GET_PESQUISAS_PADRONIZADAS, PUBLISH_PESQUISA_PADRONIZADA, type GetPesquisasPadronizadasData } from '../../graphql/Pesquisa/padronizadas';
import { DELETE_PESQUISA_MUTATION } from '../../graphql/Pesquisa/mutations';
import { confirmDeletion, getGraphQLErrorMessage } from '../../utils/confirmToast';
import { useActiveContext } from '../../auth/ActiveContext';

export function PesquisaPadronizadaListPage() {
  const navigate = useNavigate();
  const { activeContext, permissions, isAdmin } = useActiveContext();
  const [filter, setFilter] = useState('');
  const search = useDebouncedValue(filter, 300);
  const pagination = useCursorPagination({ resetDeps: [search, activeContext.tenantId, activeContext.companyId] });
  const { data, loading, error, refetch } = useQuery<GetPesquisasPadronizadasData>(GET_PESQUISAS_PADRONIZADAS, {
    variables: { first: CADASTRO_PAGE_SIZE, after: pagination.after, where: search.trim() ? { nome: { contains: search.trim() } } : null },
    fetchPolicy: 'cache-and-network', notifyOnNetworkStatusChange: true,
  });
  const [remove, { loading: removing }] = useMutation<{ deletePesquisa: boolean }>(DELETE_PESQUISA_MUTATION);
  const [publish, { loading: publishing }] = useMutation(PUBLISH_PESQUISA_PADRONIZADA);
  const surveys = error ? [] : data?.pesquisasPadronizadas?.nodes ?? [];
  const pageInfo = data?.pesquisasPadronizadas?.pageInfo;
  const busy = loading || removing || publishing;
  const can = (permission: string) => isAdmin || permissions.includes(permission);

  function deleteSurvey(id: string) {
    confirmDeletion({ title: 'Excluir pesquisa', message: 'Deseja excluir este rascunho?', confirmLabel: 'Sim, excluir', onConfirm: async () => {
      try {
        const result = await remove({ variables: { id: Number(id) } });
        if (result.error) throw result.error;
        if (!result.data?.deletePesquisa) throw new Error('Pesquisa não encontrada no contexto ativo.');
        await refetch();
        toast.success('Pesquisa excluída com sucesso!');
      } catch (failure) { toast.error(getGraphQLErrorMessage(failure) ?? 'Não foi possível excluir a pesquisa.'); }
    } });
  }

  async function publishSurvey(id: string) {
    try {
      const result = await publish({ variables: { id: Number(id) } });
      if (result.error) throw result.error;
      await refetch();
      toast.success('Pesquisa publicada.');
    } catch (failure) { toast.error(getGraphQLErrorMessage(failure) ?? 'Não foi possível publicar a pesquisa.'); }
  }

  return <div className="space-y-6">
    {can('pesquisa_padronizada.criar') ? <CadastroPageHeader title="Pesquisas padronizadas" description="Pesquisas das empresas autorizadas no tenant ativo." createLabel="Cadastrar pesquisa" onCreate={() => navigate('/dashboard/pesquisa-padronizada/create')} /> : <h2>Pesquisas padronizadas</h2>}
    <CadastroSearchBar value={filter} onChange={setFilter} hint="Pesquise pelo nome da pesquisa." />
    {error && <CadastroAlert>{getGraphQLErrorMessage(error) ?? 'Não foi possível carregar pesquisas.'}</CadastroAlert>}
    <CadastroDataTable columns={['Ações', 'Código', 'Nome', 'Perguntas', 'Empresas', 'Situação']} empty={!surveys.length} loading={loading} emptyText="Nenhuma pesquisa padronizada cadastrada."
      footer={<CadastroPaginationBar pageSize={CADASTRO_PAGE_SIZE} totalCount={data?.pesquisasPadronizadas?.totalCount ?? 0} currentCursorIndex={pagination.currentCursorIndex}
        hasPreviousPage={pagination.hasPreviousPage} hasNextPage={!!pageInfo?.hasNextPage} canGoToLastKnown={pagination.canGoToLastKnown} canGoToPage={pagination.canGoToPage}
        itemLabel={count => `${count} pesquisa${count === 1 ? '' : 's'}`} endCursor={pageInfo?.endCursor}
        onFirst={pagination.goToFirst} onPrevious={pagination.goToPrevious} onNext={pagination.goToNext} onLastKnown={pagination.goToLastKnown} onPageIndex={pagination.goToPageIndex} />}>
      {surveys.map(survey => <CadastroTableRow key={survey.id}>
        <CadastroTableCell><div className="flex gap-2">
          {!survey.publicadaEm && can('pesquisa_padronizada.editar') && <Button type="button" disabled={busy} onClick={() => navigate(`/dashboard/pesquisa-padronizada/create?id=${survey.id}`)}>Editar</Button>}
          {!survey.publicadaEm && can('pesquisa_padronizada.gerenciar') && <Button type="button" disabled={busy} onClick={() => deleteSurvey(survey.id)}>Excluir</Button>}
          {!survey.publicadaEm && can('pesquisa_padronizada.publicar') && <Button type="button" disabled={busy} onClick={() => void publishSurvey(survey.id)}>Publicar</Button>}
          {survey.publicadaEm && <button type="button" disabled={busy} title="Disparar pesquisa" aria-label={`Disparar pesquisa ${survey.nome}`} className="inline-flex items-center justify-center rounded-lg border dashboard-border p-2 disabled:opacity-40" onClick={() => navigate(`/dashboard/pesquisa-padronizada/create?disparar=${survey.id}`)}><Send aria-hidden="true" className="h-4 w-4" /></button>}
        </div></CadastroTableCell>
        <CadastroTableCell muted>{survey.id}</CadastroTableCell><CadastroTableCell>{survey.nome}</CadastroTableCell>
        <CadastroTableCell>{survey.questoes.length}</CadastroTableCell><CadastroTableCell>{survey.empresasVinculadas.length}</CadastroTableCell>
        <CadastroTableCell><StatusBadge tone={survey.publicadaEm ? 'positive' : 'warning'}>{survey.publicadaEm ? 'Publicada' : 'Rascunho'}</StatusBadge></CadastroTableCell>
      </CadastroTableRow>)}
    </CadastroDataTable>
  </div>;
}
