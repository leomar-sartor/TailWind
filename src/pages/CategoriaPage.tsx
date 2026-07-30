import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client/react';
import { Edit3, PlusCircle, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';

import { Button } from '../components/Button';
import { CursorPagination } from '../components/CursorPagination';
import { GET_CATEGORIAS } from '../graphql/queries/categoria.queries';
import { REMOVE_CATEGORIA_MUTATION } from '../graphql/mutations/categoria.mutations';
import type {
  CategoriaNode,
  GetCategoriasData,
  GetCategoriasVars,
  RemoveCategoriaData,
  RemoveCategoriaVars,
} from '../graphql/types/categoria.types';
import type { FilterClause, OrFilterInput } from '../graphql/types/common.types';
import { useCursorPagination } from '../hooks/useCursorPagination';
import { confirmDeletion, getGraphQLErrorMessage } from '../utils/confirmToast';

const PAGE_SIZE = 10;

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

function formatDate(value?: string) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}

export function CategoriaPage() {
  const navigate = useNavigate();
  const [globalFilter, setGlobalFilter] = useState('');
  const [debouncedGlobalFilter, setDebouncedGlobalFilter] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedGlobalFilter(globalFilter), 300);
    return () => clearTimeout(handler);
  }, [globalFilter]);

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
      first: PAGE_SIZE,
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

  const handleStartCreate = () => {
    navigate('/dashboard/categoria/create');
  };

  const handleEdit = (categoriaId: string | number) => {
    navigate(`/dashboard/categoria/create?id=${categoriaId}`);
  };

  const handleRemove = async (id: string | number) => {
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

  const isBusy = loading || removing;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between px-4">
        <div>
          <h2 className="text-xl font-semibold text-[#2B2C40]">Gestão de categorias</h2>
          <p className="mt-1 text-sm dashboard-text-muted">
            Cadastre categorias para classificar as questões das pesquisas.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button
            type="button"
            onClick={handleStartCreate}
            className="rounded-3xl px-5 py-3 inline-flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Cadastrar categoria
          </Button>
        </div>
      </div>

      <section className="dashboard-card rounded-[28px] border p-6 shadow-xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-[#2B2C40]">Buscar</h3>
            <p className="mt-1 text-sm dashboard-text-muted">Pesquise por nome ou descrição.</p>
          </div>
          <div className="w-full sm:w-80">
            <input
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Pesquisar..."
              className="w-full rounded-3xl border border-slate-200 px-4 py-2"
            />
          </div>
        </div>
      </section>

      <section className="dashboard-card rounded-[28px] border p-0 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left">
            <thead className="bg-[#F8FAFF]">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-[#2B2C40]">Ações</th>
                <th className="px-6 py-4 text-sm font-semibold text-[#2B2C40]">Código</th>
                <th className="px-6 py-4 text-sm font-semibold text-[#2B2C40]">Nome</th>
                <th className="px-6 py-4 text-sm font-semibold text-[#2B2C40]">Descrição</th>
                <th className="px-6 py-4 text-sm font-semibold text-[#2B2C40]">Data de Criação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {categorias.map((categoria) => (
                <tr key={categoria.id} className="hover:bg-[#F4F6FA] transition-colors">
                  <td className="px-6 py-4 align-top text-sm text-[#2B2C40]">
                    <div className="flex flex-nowrap items-center gap-1.5 whitespace-nowrap">
                      <button
                        type="button"
                        className="inline-flex shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white px-2 py-1.5 text-sm text-[#2B2C40] transition hover:bg-[#F4F6FA]"
                        onClick={() => handleEdit(categoria.id)}
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        className="inline-flex shrink-0 items-center justify-center rounded-2xl border border-rose-200 bg-white px-2 py-1.5 text-sm text-rose-500 transition hover:bg-rose-50"
                        onClick={() => handleRemove(categoria.id)}
                        disabled={isBusy}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top text-sm text-[#6C7287]">{categoria.id}</td>
                  <td className="px-6 py-4 align-top text-sm text-[#2B2C40]">{categoria.nome}</td>
                  <td className="px-6 py-4 align-top text-sm text-[#6C7287]">
                    {categoria.descricao || '—'}
                  </td>
                  <td className="px-6 py-4 align-top text-sm text-[#6C7287]">
                    {formatDate(categoria.createdAt)}
                  </td>
                </tr>
              ))}
              {!categorias.length && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-[#6C7287]">
                    {loading
                      ? 'Carregando categorias...'
                      : 'Nenhuma categoria encontrada com os filtros escolhidos.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-[#6C7287]">
            Página {currentCursorIndex + 1} · {totalCount} categoria{totalCount === 1 ? '' : 's'}
          </div>
          <CursorPagination
            pageSize={PAGE_SIZE}
            totalCount={totalCount}
            currentCursorIndex={currentCursorIndex}
            hasPreviousPage={hasPreviousPage}
            hasNextPage={hasNextPage}
            canGoToLastKnown={canGoToLastKnown}
            canGoToPage={canGoToPage}
            onFirst={goToFirst}
            onPrevious={goToPrevious}
            onNext={() => goToNext(pageInfo?.endCursor, hasNextPage)}
            onLastKnown={goToLastKnown}
            onPage={(pageIndex) => goToPageIndex(pageIndex, pageInfo?.endCursor, hasNextPage)}
          />
        </div>
      </section>

      {removeErrorMessage && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {removeErrorMessage}
        </div>
      )}

      {error && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          Erro ao carregar categorias. Verifique a conexão e tente novamente.
        </div>
      )}
    </div>
  );
}
