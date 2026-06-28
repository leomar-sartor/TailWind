import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client/react';
import { Edit3, PlusCircle, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';

import { Button } from '../components/Button';
import { GET_EMPRESAS } from '../graphql/queries/empresa.queries';
import {
  REMOVE_EMPRESA_MUTATION,
} from '../graphql/mutations/empresa.mutations';
import { formatCnpj, stripCnpjMask } from '../utils/cnpj';
import { confirmDeletion, getGraphQLErrorMessage } from '../utils/confirmToast';

const PAGE_SIZE = 10;

function buildWhere(filter: string) {
  const normalized = filter.trim();
  if (!normalized) return null;

  const stripped = stripCnpjMask(normalized);
  const or: any[] = [
    { nomeFantasia: { contains: normalized } },
    { descricao: { contains: normalized } },
  ];

  if (stripped) {
    or.unshift({ cnpj: { contains: stripped } });
  }

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

export function EmpresaPage() {
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
    empresas: {
      nodes: EmpresaNode[];
      pageInfo: {
        hasNextPage: boolean;
        hasPreviousPage?: boolean;
        startCursor?: string;
        endCursor?: string;
      };
      totalCount: number;
    };
  }>(GET_EMPRESAS, {
    variables,
    notifyOnNetworkStatusChange: true,
  });

  const [removeEmpresa, { loading: removing }] = useMutation(REMOVE_EMPRESA_MUTATION);
  const [removeErrorMessage, setRemoveErrorMessage] = useState<string | null>(null);

  const empresas: EmpresaNode[] = data?.empresas?.nodes ?? [];
  const pageInfo = data?.empresas?.pageInfo;
  const totalCount = data?.empresas?.totalCount ?? 0;

  const hasPreviousPage = currentCursorIndex > 0;
  const hasNextPage = !!pageInfo?.hasNextPage;


  const handleStartCreate = () => {
    navigate('/dashboard/empresa/create');
  };

  const handleEdit = (empresaId: string) => {
    navigate(`/dashboard/empresa/create?id=${empresaId}`);
  };

  const handleRemove = async (id: string) => {
    setRemoveErrorMessage(null);

    confirmDeletion({
      title: 'Excluir empresa',
      message: 'Esta ação não pode ser desfeita. Deseja continuar?',
      confirmLabel: 'Sim, excluir',
      onConfirm: async () => {
        try {
          const result = await removeEmpresa({ variables: { id: Number(id) } });
          const mutationErrorMessage = getGraphQLErrorMessage((result as any)?.error ?? (result as any)?.errors);

          if (mutationErrorMessage) {
            setRemoveErrorMessage(mutationErrorMessage);
            toast.error(mutationErrorMessage);
            return;
          }

          await refetch(variables);
          toast.success('Empresa excluída com sucesso!');
        } catch (err: unknown) {
          const message =
            getGraphQLErrorMessage(err) ??
            'Não é possível remover a empresa. Tente novamente.';

          setRemoveErrorMessage(message);
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
          <h2 className="text-xl font-semibold text-[#2B2C40]">Gestão de empresas</h2>
          <p className="mt-1 text-sm dashboard-text-muted">Veja a lista de empresas, busque por razão social/descrição e edite ou exclua registros.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button type="button" onClick={handleStartCreate} className="rounded-3xl px-5 py-3 inline-flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Cadastrar empresa
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
                <th className="px-6 py-4 text-sm font-semibold text-[#2B2C40]">Cnpj</th>
                <th className="px-6 py-4 text-sm font-semibold text-[#2B2C40]">Nome Fantasia</th>
                <th className="px-6 py-4 text-sm font-semibold text-[#2B2C40]">Descrição</th>
                <th className="px-6 py-4 text-sm font-semibold text-[#2B2C40]">Data de Criação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {empresas.map((empresa) => (
                <tr key={empresa.id} className="hover:bg-[#F4F6FA] transition-colors">
                  <td className="px-6 py-4 align-top text-sm text-[#2B2C40]">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-white px-3 py-2 text-sm text-[#2B2C40] transition hover:bg-[#F4F6FA]"
                        onClick={() => handleEdit(empresa.id)}
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-3xl border border-rose-200 bg-white px-3 py-2 text-sm text-rose-500 transition hover:bg-rose-50"
                        onClick={() => handleRemove(empresa.id)}
                        disabled={isBusy}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top text-sm text-[#6C7287]">{empresa.id}</td>
                  <td className="px-6 py-4 align-top text-sm text-[#2B2C40]">{formatCnpj(empresa.cnpj)}</td>
                  <td className="px-6 py-4 align-top text-sm text-[#2B2C40]">{empresa.nomeFantasia}</td>
                  <td className="px-6 py-4 align-top text-sm text-[#6C7287]">{empresa.descricao || '—'}</td>
                  <td className="px-6 py-4 align-top text-sm text-[#6C7287]">{formatDate(empresa.createdAt)}</td>
                </tr>
              ))}
              {!empresas.length && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-[#6C7287]">
                    {loading ? 'Carregando empresas...' : 'Nenhuma empresa encontrada com os filtros escolhidos.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-[#6C7287]">
            Página {currentCursorIndex + 1} · {totalCount} empresa{totalCount === 1 ? '' : 's'}
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

      {removeErrorMessage && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {removeErrorMessage}
        </div>
      )}

      {error && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          Erro ao carregar empresas. Verifique a conexão e tente novamente.
        </div>
      )}
    </div>
  );
}

type EmpresaNode = {
  id: string;
  cnpj: string;
  nomeFantasia: string;
  descricao?: string;
  createdAt?: string;
};
