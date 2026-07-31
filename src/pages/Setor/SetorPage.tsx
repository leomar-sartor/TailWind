import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client/react';
import { toast } from 'react-toastify';
import {
  CadastroAlert,
  CadastroDataTable,
  CadastroPageHeader,
  CadastroPaginationBar,
  CadastroSearchBar,
  CadastroTableCell,
  CadastroTableRow,
  RowActions,
} from '../../components/cadastro';
import { GET_SETORS } from '../../graphql/Setor/queries';
import { REMOVE_SETOR_MUTATION } from '../../graphql/Setor/mutations';
import type {
  GetSetoresData,
  GetSetoresVars,
  RemoveSetorData,
  RemoveSetorVars,
  SetorNode,
} from '../../graphql/Setor/types';
import type { FilterClause, OrFilterInput } from '../../graphql/Common/types';
import { useCursorPagination } from '../../hooks/useCursorPagination';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { CADASTRO_PAGE_SIZE } from '../../constants/cadastro';
import { confirmDeletion, getGraphQLErrorMessage } from '../../utils/confirmToast';

const COLUMNS = ['Ações', 'Código', 'Nome', 'Descrição', 'Empresa'];

function buildWhere(filter: string): OrFilterInput | null {
  const normalized = filter.trim();
  if (!normalized) return null;

  const or: FilterClause[] = [
    { nome: { contains: normalized } },
    { descricao: { contains: normalized } },
    { empresa: { nomeFantasia: { contains: normalized } } },
  ];

  if (/^\d+$/.test(normalized)) {
    or.unshift({ id: { eq: Number(normalized) } });
  }

  return { or };
}

export function SetorPage() {
  const navigate = useNavigate();
  const [globalFilter, setGlobalFilter] = useState('');
  const debouncedGlobalFilter = useDebouncedValue(globalFilter, 300);

  const {
    after,
    currentCursorIndex,
    hasPreviousPage,
    goToFirst,
    goToPrevious,
    goToNext,
    goToLastKnown,
    goToPageIndex,
    canGoToPage,
    canGoToLastKnown,
  } = useCursorPagination({ resetDeps: [debouncedGlobalFilter] });

  const variables = useMemo<GetSetoresVars>(
    () => ({
      where: buildWhere(debouncedGlobalFilter),
      first: CADASTRO_PAGE_SIZE,
      after,
    }),
    [debouncedGlobalFilter, after],
  );

  const { data, loading, error, refetch } = useQuery<GetSetoresData, GetSetoresVars>(GET_SETORS, {
    variables,
    notifyOnNetworkStatusChange: true,
  });

  const [removeSetor, { loading: removing }] = useMutation<RemoveSetorData, RemoveSetorVars>(
    REMOVE_SETOR_MUTATION,
  );

  const setores: SetorNode[] = data?.setores?.nodes ?? [];
  const pageInfo = data?.setores?.pageInfo;
  const totalCount = data?.setores?.totalCount ?? 0;
  const hasNextPage = !!pageInfo?.hasNextPage;
  const isBusy = loading || removing;

  const handleRemove = (id: string | number) => {
    confirmDeletion({
      title: 'Excluir setor',
      message: 'Esta ação não pode ser desfeita. Deseja continuar?',
      confirmLabel: 'Sim, excluir',
      onConfirm: async () => {
        try {
          const result = await removeSetor({ variables: { id: Number(id) } });
          const mutationErrorMessage = getGraphQLErrorMessage(result.error);

          if (mutationErrorMessage) {
            toast.error(mutationErrorMessage);
            return;
          }

          await refetch(variables);
          toast.success('Setor excluído com sucesso!');
        } catch (err) {
          const message =
            getGraphQLErrorMessage(err) ?? 'Não foi possível excluir o setor. Tente novamente.';
          toast.error(message);
          console.error(err);
        }
      },
    });
  };

  return (
    <div className="space-y-4">
      <CadastroPageHeader
        title="Gestão de setores"
        description="Veja a lista de setores, busque por nome/descrição e edite ou exclua registros."
        createLabel="Cadastrar setor"
        onCreate={() => navigate('/dashboard/setor/create')}
      />

      <CadastroSearchBar value={globalFilter} onChange={setGlobalFilter} />

      <CadastroDataTable
        columns={COLUMNS}
        empty={!setores.length}
        loading={loading}
        loadingText="Carregando setores..."
        emptyText="Nenhum setor encontrado com os filtros escolhidos."
        footer={
          <CadastroPaginationBar
            pageSize={CADASTRO_PAGE_SIZE}
            totalCount={totalCount}
            currentCursorIndex={currentCursorIndex}
            hasPreviousPage={hasPreviousPage}
            hasNextPage={hasNextPage}
            canGoToLastKnown={canGoToLastKnown}
            canGoToPage={canGoToPage}
            itemLabel={(count) => `${count} setor${count === 1 ? '' : 'es'}`}
            endCursor={pageInfo?.endCursor}
            onFirst={goToFirst}
            onPrevious={goToPrevious}
            onNext={goToNext}
            onLastKnown={goToLastKnown}
            onPageIndex={goToPageIndex}
          />
        }
      >
        {setores.map((setor) => (
          <CadastroTableRow key={setor.id}>
            <CadastroTableCell>
              <RowActions
                onEdit={() => navigate(`/dashboard/setor/create?id=${setor.id}`)}
                onDelete={() => handleRemove(setor.id)}
                disabled={isBusy}
              />
            </CadastroTableCell>
            <CadastroTableCell muted>{setor.id}</CadastroTableCell>
            <CadastroTableCell>{setor.nome}</CadastroTableCell>
            <CadastroTableCell muted>{setor.descricao || '—'}</CadastroTableCell>
            <CadastroTableCell>{setor.empresa?.nomeFantasia || '—'}</CadastroTableCell>
          </CadastroTableRow>
        ))}
      </CadastroDataTable>

      {error && (
        <CadastroAlert>
          Erro ao carregar setores. Verifique a conexão e tente novamente.
        </CadastroAlert>
      )}
    </div>
  );
}
