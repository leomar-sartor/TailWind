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
import { GET_COLABORADORES } from '../../graphql/Colaborador/queries';
import { REMOVE_COLABORADOR_MUTATION } from '../../graphql/Colaborador/mutations';
import type {
  ColaboradorNode,
  GetColaboradoresData,
  GetColaboradoresVars,
  RemoveColaboradorData,
  RemoveColaboradorVars,
} from '../../graphql/Colaborador/types';
import type { FilterClause, OrFilterInput } from '../../graphql/Common/types';
import { useCursorPagination } from '../../hooks/useCursorPagination';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { formatCpfForDisplay, stripCpfMask } from '../../utils/cpf';
import { confirmDeletion, getGraphQLErrorMessage } from '../../utils/confirmToast';
import { CADASTRO_PAGE_SIZE } from '../../constants/cadastro';
import { formatDatePtBr } from '../../utils/date';

const COLUMNS = ['Ações', 'CPF', 'Nome', 'E-mail', 'Empresa', 'Setor', 'Ativo', 'Criado em'];

function buildWhere(filter: string): OrFilterInput | null {
  const normalized = filter.trim();
  if (!normalized) return null;

  const strippedCpf = stripCpfMask(normalized);
  const or: FilterClause[] = [
    { nome: { contains: normalized } },
    { email: { contains: normalized } },
    { empresa: { nomeFantasia: { contains: normalized } } },
    { setor: { nome: { contains: normalized } } },
  ];

  if (strippedCpf) {
    or.unshift({ cpf: { contains: strippedCpf } });
  }

  if (/^\d+$/.test(normalized)) {
    or.unshift({ id: { eq: Number(normalized) } });
  }

  return { or };
}

export function ColaboradorPage() {
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

  const variables = useMemo<GetColaboradoresVars>(
    () => ({
      where: buildWhere(debouncedGlobalFilter),
      first: CADASTRO_PAGE_SIZE,
      after,
    }),
    [debouncedGlobalFilter, after],
  );

  const { data, loading, error, refetch } = useQuery<GetColaboradoresData, GetColaboradoresVars>(
    GET_COLABORADORES,
    {
      variables,
      notifyOnNetworkStatusChange: true,
    },
  );

  const [removeColaborador, { loading: removing }] = useMutation<
    RemoveColaboradorData,
    RemoveColaboradorVars
  >(REMOVE_COLABORADOR_MUTATION);

  const colaboradores: ColaboradorNode[] = data?.colaboradores?.nodes ?? [];
  const pageInfo = data?.colaboradores?.pageInfo;
  const totalCount = data?.colaboradores?.totalCount ?? 0;
  const hasNextPage = !!pageInfo?.hasNextPage;
  const isBusy = loading || removing;

  const handleRemove = (id: string | number) => {
    confirmDeletion({
      title: 'Excluir colaborador',
      message: 'Esta ação não pode ser desfeita. Deseja continuar?',
      confirmLabel: 'Sim, excluir',
      onConfirm: async () => {
        try {
          const result = await removeColaborador({ variables: { id: Number(id) } });
          const mutationErrorMessage = getGraphQLErrorMessage(result.error);

          if (mutationErrorMessage) {
            toast.error(mutationErrorMessage);
            return;
          }

          await refetch(variables);
          toast.success('Colaborador excluído com sucesso!');
        } catch (err) {
          const message =
            getGraphQLErrorMessage(err) ??
            'Não foi possível excluir o colaborador. Tente novamente.';
          toast.error(message);
          console.error(err);
        }
      },
    });
  };

  return (
    <div className="space-y-4">
      <CadastroPageHeader
        title="Gestão de colaboradores"
        description="Cadastre, atualize, filtre e remova colaboradores ativos ou inativos."
        createLabel="Cadastrar colaborador"
        onCreate={() => navigate('/dashboard/colaboradores/create')}
      />

      <CadastroSearchBar value={globalFilter} onChange={setGlobalFilter} />

      <CadastroDataTable
        columns={COLUMNS}
        empty={!colaboradores.length}
        loading={loading}
        loadingText="Carregando colaboradores..."
        emptyText="Nenhum colaborador encontrado com os filtros escolhidos."
        footer={
          <CadastroPaginationBar
            pageSize={CADASTRO_PAGE_SIZE}
            totalCount={totalCount}
            currentCursorIndex={currentCursorIndex}
            hasPreviousPage={hasPreviousPage}
            hasNextPage={hasNextPage}
            canGoToLastKnown={canGoToLastKnown}
            canGoToPage={canGoToPage}
            itemLabel={(count) => `${count} colaborador${count === 1 ? '' : 'es'}`}
            endCursor={pageInfo?.endCursor}
            onFirst={goToFirst}
            onPrevious={goToPrevious}
            onNext={goToNext}
            onLastKnown={goToLastKnown}
            onPageIndex={goToPageIndex}
          />
        }
      >
        {colaboradores.map((colaborador) => (
          <CadastroTableRow key={colaborador.id}>
            <CadastroTableCell>
              <RowActions
                onEdit={() =>
                  navigate(`/dashboard/colaboradores/create?id=${colaborador.id}`)
                }
                onDelete={() => handleRemove(colaborador.id)}
                disabled={isBusy}
              />
            </CadastroTableCell>
            <CadastroTableCell muted>{formatCpfForDisplay(colaborador.cpf)}</CadastroTableCell>
            <CadastroTableCell>{colaborador.nome}</CadastroTableCell>
            <CadastroTableCell muted>{colaborador.email}</CadastroTableCell>
            <CadastroTableCell>{colaborador.empresa?.nomeFantasia || '—'}</CadastroTableCell>
            <CadastroTableCell>{colaborador.setor?.nome || '—'}</CadastroTableCell>
            <CadastroTableCell>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  colaborador.ativo
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {colaborador.ativo ? 'Ativo' : 'Inativo'}
              </span>
            </CadastroTableCell>
            <CadastroTableCell muted>{formatDatePtBr(colaborador.createdAt)}</CadastroTableCell>
          </CadastroTableRow>
        ))}
      </CadastroDataTable>

      {error && (
        <CadastroAlert>
          Erro ao carregar colaboradores. Verifique a conexão e tente novamente.
        </CadastroAlert>
      )}
    </div>
  );
}
