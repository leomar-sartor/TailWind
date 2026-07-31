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
import { GET_CATEGORIAS } from '../../graphql/Categoria/queries';
import { REMOVE_CATEGORIA_MUTATION } from '../../graphql/Categoria/mutations';
import type {
  CategoriaNode,
  GetCategoriasData,
  GetCategoriasVars,
  RemoveCategoriaData,
  RemoveCategoriaVars,
} from '../../graphql/Categoria/types';
import type { FilterClause, OrFilterInput } from '../../graphql/Common/types';
import { useCursorPagination } from '../../hooks/useCursorPagination';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { confirmDeletion, getGraphQLErrorMessage } from '../../utils/confirmToast';
import { CADASTRO_PAGE_SIZE } from '../../constants/cadastro';
import { formatDatePtBr } from '../../utils/date';

const COLUMNS = ['Ações', 'Código', 'Nome', 'Descrição', 'Data de Criação'];

function buildWhere(filter: string): OrFilterInput | null {
  const normalized = filter.trim();
  if (!normalized) return null;

  const or: FilterClause[] = [
    { nome: { contains: normalized } },
    { descricao: { contains: normalized } },
  ];

  if (/^\d+$/.test(normalized)) {
    or.unshift({ id: { eq: Number(normalized) } });
  }

  return { or };
}

export function CategoriaPage() {
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

  const variables = useMemo<GetCategoriasVars>(
    () => ({
      where: buildWhere(debouncedGlobalFilter),
      first: CADASTRO_PAGE_SIZE,
      after,
    }),
    [debouncedGlobalFilter, after],
  );

  const { data, loading, error, refetch } = useQuery<GetCategoriasData, GetCategoriasVars>(
    GET_CATEGORIAS,
    {
      variables,
      notifyOnNetworkStatusChange: true,
    },
  );

  const [removeCategoria, { loading: removing }] = useMutation<
    RemoveCategoriaData,
    RemoveCategoriaVars
  >(REMOVE_CATEGORIA_MUTATION);
  const [removeErrorMessage, setRemoveErrorMessage] = useState<string | null>(null);

  const categorias: CategoriaNode[] = data?.categorias?.nodes ?? [];
  const pageInfo = data?.categorias?.pageInfo;
  const totalCount = data?.categorias?.totalCount ?? 0;
  const hasNextPage = !!pageInfo?.hasNextPage;
  const isBusy = loading || removing;

  const handleRemove = (id: string | number) => {
    setRemoveErrorMessage(null);

    confirmDeletion({
      title: 'Excluir categoria',
      message: 'Esta ação não pode ser desfeita. Deseja continuar?',
      confirmLabel: 'Sim, excluir',
      onConfirm: async () => {
        try {
          const result = await removeCategoria({ variables: { id: Number(id) } });
          const mutationErrorMessage = getGraphQLErrorMessage(result.error);

          if (mutationErrorMessage) {
            setRemoveErrorMessage(mutationErrorMessage);
            toast.error(mutationErrorMessage);
            return;
          }

          await refetch(variables);
          toast.success('Categoria excluída com sucesso!');
        } catch (err: unknown) {
          const message =
            getGraphQLErrorMessage(err) ??
            'Não é possível remover a categoria. Tente novamente.';

          setRemoveErrorMessage(message);
          toast.error(message);
          console.error(err);
        }
      },
    });
  };

  return (
    <div className="space-y-4">
      <CadastroPageHeader
        title="Gestão de categorias"
        description="Cadastre categorias para classificar as questões das pesquisas."
        createLabel="Cadastrar categoria"
        onCreate={() => navigate('/dashboard/categoria/create')}
      />

      <CadastroSearchBar
        value={globalFilter}
        onChange={setGlobalFilter}
        hint="Pesquise por nome ou descrição."
      />

      <CadastroDataTable
        columns={COLUMNS}
        empty={!categorias.length}
        loading={loading}
        loadingText="Carregando categorias..."
        emptyText="Nenhuma categoria encontrada com os filtros escolhidos."
        footer={
          <CadastroPaginationBar
            pageSize={CADASTRO_PAGE_SIZE}
            totalCount={totalCount}
            currentCursorIndex={currentCursorIndex}
            hasPreviousPage={hasPreviousPage}
            hasNextPage={hasNextPage}
            canGoToLastKnown={canGoToLastKnown}
            canGoToPage={canGoToPage}
            itemLabel={(count) => `${count} categoria${count === 1 ? '' : 's'}`}
            endCursor={pageInfo?.endCursor}
            onFirst={goToFirst}
            onPrevious={goToPrevious}
            onNext={goToNext}
            onLastKnown={goToLastKnown}
            onPageIndex={goToPageIndex}
          />
        }
      >
        {categorias.map((categoria) => (
          <CadastroTableRow key={categoria.id}>
            <CadastroTableCell>
              <RowActions
                onEdit={() => navigate(`/dashboard/categoria/create?id=${categoria.id}`)}
                onDelete={() => handleRemove(categoria.id)}
                disabled={isBusy}
              />
            </CadastroTableCell>
            <CadastroTableCell muted>{categoria.id}</CadastroTableCell>
            <CadastroTableCell>{categoria.nome}</CadastroTableCell>
            <CadastroTableCell muted>{categoria.descricao || '—'}</CadastroTableCell>
            <CadastroTableCell muted>{formatDatePtBr(categoria.createdAt)}</CadastroTableCell>
          </CadastroTableRow>
        ))}
      </CadastroDataTable>

      {removeErrorMessage && <CadastroAlert>{removeErrorMessage}</CadastroAlert>}

      {error && (
        <CadastroAlert>
          Erro ao carregar categorias. Verifique a conexão e tente novamente.
        </CadastroAlert>
      )}
    </div>
  );
}
