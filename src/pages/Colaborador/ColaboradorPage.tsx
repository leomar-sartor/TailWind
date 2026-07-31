import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client/react';
import { Edit3, PlusCircle, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { Button } from '../../components/Button';
import { CursorPagination } from '../../components/CursorPagination';
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
import { formatCpfForDisplay, stripCpfMask } from '../../utils/cpf';
import { confirmDeletion, getGraphQLErrorMessage } from '../../utils/confirmToast';

const PAGE_SIZE = 10;

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

  const variables = useMemo<GetColaboradoresVars>(
    () => ({
      where: buildWhere(debouncedGlobalFilter),
      first: PAGE_SIZE,
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

  const handleStartCreate = () => {
    navigate('/dashboard/colaboradores/create');
  };

  const handleEdit = (colaboradorId: string | number) => {
    navigate(`/dashboard/colaboradores/create?id=${colaboradorId}`);
  };

  const handleRemove = async (id: string | number) => {
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
          const message = getGraphQLErrorMessage(err) ?? 'Não foi possível excluir o colaborador. Tente novamente.';
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
          <h2 className="text-xl font-semibold text-[#2B2C40]">Gestão de colaboradores</h2>
          <p className="mt-1 text-sm dashboard-text-muted">Cadastre, atualize, filtre e remova colaboradores ativos ou inativos.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button type="button" onClick={handleStartCreate} className="rounded-3xl px-5 py-3 inline-flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Cadastrar colaborador
          </Button>
        </div>
      </div>

      <section className="dashboard-card rounded-[28px] border p-6 shadow-xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-[#2B2C40]">Buscar</h3>
            <p className="mt-1 text-sm dashboard-text-muted">Pesquise em todas as colunas.</p>
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
                <th className="px-6 py-4 text-sm font-semibold text-[#2B2C40]">CPF</th>
                <th className="px-6 py-4 text-sm font-semibold text-[#2B2C40]">Nome</th>
                <th className="px-6 py-4 text-sm font-semibold text-[#2B2C40]">E-mail</th>
                <th className="px-6 py-4 text-sm font-semibold text-[#2B2C40]">Empresa</th>
                <th className="px-6 py-4 text-sm font-semibold text-[#2B2C40]">Setor</th>
                <th className="px-6 py-4 text-sm font-semibold text-[#2B2C40]">Ativo</th>
                <th className="px-6 py-4 text-sm font-semibold text-[#2B2C40]">Criado em</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {colaboradores.map((colaborador) => (
                <tr key={colaborador.id} className="hover:bg-[#F4F6FA] transition-colors">
                  <td className="px-6 py-4 align-top text-sm text-[#2B2C40]">
                    <div className="flex flex-nowrap items-center gap-1.5 whitespace-nowrap">
                      <button
                        type="button"
                        className="inline-flex shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white px-2 py-1.5 text-sm text-[#2B2C40] transition hover:bg-[#F4F6FA]"
                        onClick={() => handleEdit(colaborador.id)}
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        className="inline-flex shrink-0 items-center justify-center rounded-2xl border border-rose-200 bg-white px-2 py-1.5 text-sm text-rose-500 transition hover:bg-rose-50"
                        onClick={() => handleRemove(colaborador.id)}
                        disabled={isBusy}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top text-sm text-[#6C7287]">{formatCpfForDisplay(colaborador.cpf)}</td>
                  <td className="px-6 py-4 align-top text-sm text-[#2B2C40]">{colaborador.nome}</td>
                  <td className="px-6 py-4 align-top text-sm text-[#6C7287]">{colaborador.email}</td>
                  <td className="px-6 py-4 align-top text-sm text-[#2B2C40]">{colaborador.empresa?.nomeFantasia || '—'}</td>
                  <td className="px-6 py-4 align-top text-sm text-[#2B2C40]">{colaborador.setor?.nome || '—'}</td>
                  <td className="px-6 py-4 align-top text-sm text-[#2B2C40]">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colaborador.ativo
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                      }`}>
                      {colaborador.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 align-top text-sm text-[#6C7287]">
                    {colaborador.createdAt ? new Date(colaborador.createdAt).toLocaleDateString('pt-BR') : '—'}
                  </td>
                </tr>
              ))}
              {!colaboradores.length && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-sm text-[#6C7287]">
                    {loading ? 'Carregando colaboradores...' : 'Nenhum colaborador encontrado com os filtros escolhidos.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-[#6C7287]">
            Página {currentCursorIndex + 1} · {totalCount} colaborador{totalCount === 1 ? '' : 'es'}
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

      {error && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          Erro ao carregar colaboradores. Verifique a conexão e tente novamente.
        </div>
      )}
    </div>
  );
}