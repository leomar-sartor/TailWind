import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client/react';
import { Edit3, PlusCircle, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { Button } from '../components/Button';
import { GET_SETORS } from '../graphql/queries/setor.queries';
import {
  REMOVE_SETOR_MUTATION,
} from '../graphql/mutations/setor.mutations';
import { confirmDeletion, getGraphQLErrorMessage } from '../utils/confirmToast';

type SetorNode = {
  id: string;
  nome: string;
  descricao?: string;
  createdAt?: string;
  empresa?: {
    id?: string;
    nomeFantasia?: string;
  };
};

const PAGE_SIZE = 10;

function buildWhere(filter: string) {
  const normalized = filter.trim();
  if (!normalized) return null;

  const or: any[] = [
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
  const [cursorStack, setCursorStack] = useState<Array<string | null>>([null]);
  const [currentCursorIndex, setCurrentCursorIndex] = useState(0);

  const [globalFilter, setGlobalFilter] = useState('');
  const [debouncedGlobalFilter, setDebouncedGlobalFilter] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedGlobalFilter(globalFilter), 300);
    return () => clearTimeout(handler);
  }, [globalFilter]);

  useEffect(() => {
    setCursorStack([null]);
    setCurrentCursorIndex(0);
  }, [debouncedGlobalFilter]);

  const variables = useMemo(
    () => ({
      where: buildWhere(debouncedGlobalFilter),
      first: PAGE_SIZE,
      after: cursorStack[currentCursorIndex],
    }),
    [debouncedGlobalFilter, cursorStack, currentCursorIndex],
  );

  const { data, loading, error, refetch } = useQuery<{
    setores: {
      nodes: SetorNode[];
      pageInfo: {
        hasNextPage: boolean;
        hasPreviousPage?: boolean;
        startCursor?: string;
        endCursor?: string;
      };
      totalCount: number;
    };
  }>(GET_SETORS, {
    variables,
    notifyOnNetworkStatusChange: true,
  });

  const [removeSetor, { loading: removing }] = useMutation(REMOVE_SETOR_MUTATION);

  const setores: SetorNode[] = data?.setores?.nodes ?? [];
  const pageInfo = data?.setores?.pageInfo;
  const totalCount = data?.setores?.totalCount ?? 0;

  const hasPreviousPage = currentCursorIndex > 0;
  const hasNextPage = !!pageInfo?.hasNextPage;


  const handleStartCreate = () => {
    navigate('/dashboard/setor/create');
  };

  const handleEdit = (setorId: string) => {
    navigate(`/dashboard/setor/create?id=${setorId}`);
  };

  const handleRemove = async (id: string) => {
    confirmDeletion({
      title: 'Excluir setor',
      message: 'Esta ação não pode ser desfeita. Deseja continuar?',
      confirmLabel: 'Sim, excluir',
      onConfirm: async () => {
        try {
          const result = await removeSetor({ variables: { id: Number(id) } });
          const mutationErrorMessage = getGraphQLErrorMessage((result as any)?.error ?? (result as any)?.errors);

          if (mutationErrorMessage) {
            toast.error(mutationErrorMessage);
            return;
          }

          await refetch(variables);
          toast.success('Setor excluído com sucesso!');
        } catch (err) {
          const message = getGraphQLErrorMessage(err) ?? 'Não foi possível excluir o setor. Tente novamente.';
          toast.error(message);
          console.error(err);
        }
      },
    });
  };

  const handlePreviousPage = () => {
    if (hasPreviousPage) {
      setCurrentCursorIndex((prev) => Math.max(0, prev - 1));
    }
  };

  const handleNextPage = () => {
    if (!hasNextPage || !pageInfo?.endCursor) return;

    setCursorStack((prev) => {
      const nextStack = prev.slice(0, currentCursorIndex + 1);
      return [...nextStack, pageInfo.endCursor ?? null];
    });
    setCurrentCursorIndex((prev) => prev + 1);
  };

  const isBusy = loading || removing;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between px-4">
        <div>
          <h2 className="text-xl font-semibold text-[#2B2C40]">Gestão de setores</h2>
          <p className="mt-1 text-sm dashboard-text-muted">Veja a lista de setores, busque por nome/descrição e edite ou exclua registros.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button type="button" onClick={handleStartCreate} className="rounded-3xl px-5 py-3 inline-flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Cadastrar setor
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
                <th className="px-6 py-4 text-sm font-semibold text-[#2B2C40]">Código</th>
                <th className="px-6 py-4 text-sm font-semibold text-[#2B2C40]">Nome</th>
                <th className="px-6 py-4 text-sm font-semibold text-[#2B2C40]">Descrição</th>
                <th className="px-6 py-4 text-sm font-semibold text-[#2B2C40]">Empresa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {setores.map((setor) => (
                <tr key={setor.id} className="hover:bg-[#F4F6FA] transition-colors">
                  <td className="px-6 py-4 align-top text-sm text-[#2B2C40]">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-white px-3 py-2 text-sm text-[#2B2C40] transition hover:bg-[#F4F6FA]"
                        onClick={() => handleEdit(setor.id)}
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-3xl border border-rose-200 bg-white px-3 py-2 text-sm text-rose-500 transition hover:bg-rose-50"
                        onClick={() => handleRemove(setor.id)}
                        disabled={isBusy}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top text-sm text-[#6C7287]">{setor.id}</td>
                  <td className="px-6 py-4 align-top text-sm text-[#2B2C40]">{setor.nome}</td>
                  <td className="px-6 py-4 align-top text-sm text-[#6C7287]">{setor.descricao || '—'}</td>
                  <td className="px-6 py-4 align-top text-sm text-[#2B2C40]">{setor.empresa?.nomeFantasia || '—'}</td>
                </tr>
              ))}
              {!setores.length && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-[#6C7287]">
                    {loading ? 'Carregando setores...' : 'Nenhum setor encontrado com os filtros escolhidos.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-[#6C7287]">
            Página {currentCursorIndex + 1} · {totalCount} setor{totalCount === 1 ? '' : 'es'}
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <button
              type="button"
              onClick={() => setCurrentCursorIndex(0)}
              disabled={!hasPreviousPage}
              className="rounded-lg border border-slate-200 bg-white text-[#2B2C40] hover:bg-[#F4F6FA] disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1 text-sm font-medium transition"
            >
              «
            </button>

            <button
              type="button"
              onClick={handlePreviousPage}
              disabled={!hasPreviousPage}
              className="rounded-lg border border-slate-200 bg-white text-[#2B2C40] hover:bg-[#F4F6FA] disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1 text-sm font-medium transition"
            >
              ‹ Anterior
            </button>

            {Array.from({ length: Math.ceil(totalCount / PAGE_SIZE) }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => {
                  const newIndex = pageNum - 1;
                  if (newIndex < cursorStack.length) {
                    setCurrentCursorIndex(newIndex);
                  } else if (newIndex === currentCursorIndex + 1 && hasNextPage) {
                    handleNextPage();
                  }
                }}
                className={`rounded-lg px-3 py-1 text-sm font-medium transition ${
                  currentCursorIndex === pageNum - 1
                    ? 'bg-[#696CFF] text-white'
                    : 'border border-slate-200 bg-white text-[#2B2C40] hover:bg-[#F4F6FA]'
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              type="button"
              onClick={handleNextPage}
              disabled={!hasNextPage}
              className="rounded-lg border border-slate-200 bg-white text-[#2B2C40] hover:bg-[#F4F6FA] disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1 text-sm font-medium transition"
            >
              Próxima ›
            </button>

            <button
              type="button"
              onClick={() => {
                const totalPages = Math.ceil(totalCount / PAGE_SIZE);
                setCurrentCursorIndex(totalPages - 1);
              }}
              disabled={!hasNextPage}
              className="rounded-lg border border-slate-200 bg-white text-[#2B2C40] hover:bg-[#F4F6FA] disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1 text-sm font-medium transition"
            >
              »
            </button>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          Erro ao carregar setores. Verifique a conexão e tente novamente.
        </div>
      )}
    </div>
  );
}
