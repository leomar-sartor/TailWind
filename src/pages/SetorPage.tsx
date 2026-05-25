import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client/react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Edit3, PlusCircle, Search, Trash2 } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { SelectWithSearch, SelectItem } from '../components/Select/SelectWithSearch';
import { GET_SETORS, GET_EMPRESAS_PAGINATED } from '../graphql/queries/setor.queries';
import {
  REMOVE_SETOR_MUTATION,
} from '../graphql/mutations/setor.mutations';

type SearchFormValues = {
  nome: string;
  descricao: string;
  empresaId: string;
};

type EmpresaNode = {
  id: string;
  razaoSocial: string;
};

type EmpresaSetorNode = {
  empresa: EmpresaNode;
};


type SetorNode = {
  id: string;
  nome: string;
  descricao?: string;
  createdAt?: string;
  // empresaSetores: EmpresaSetorNode[];
  empresaSetores?: {
    empresa?: {
      id?: string;
      razaoSocial?: string;
    };
  }[];
};

const PAGE_SIZE = 10;

function buildWhere(values: SearchFormValues) {
  const where: Record<string, any> = {};

  if (values.nome?.trim()) {
    where.nome = { eq: values.nome.trim() };
  }

  if (values.descricao?.trim()) {
    where.descricao = { eq: values.descricao.trim() };
  }

  if (values.empresaId?.trim()) {
    where.empresaId = { eq: Number(values.empresaId) };
  }

  return Object.keys(where).length ? where : null;
}

export function SetorPage() {
  const navigate = useNavigate();
  const [currentFilters, setCurrentFilters] = useState<SearchFormValues>({ nome: '', descricao: '', empresaId: '' });
  const [cursorStack, setCursorStack] = useState<Array<string | null>>([null]);
  const [currentCursorIndex, setCurrentCursorIndex] = useState(0);

  // Estados para SelectWithSearch de empresas
  const [empresasItems, setEmpresasItems] = useState<SelectItem[]>([]);
  const [empresasSearchQuery, setEmpresasSearchQuery] = useState('');
  const [selectedEmpresaId, setSelectedEmpresaId] = useState<string | number>();

  const searchForm = useForm<SearchFormValues>({ defaultValues: currentFilters });
  
  // Query para empresas com paginação
  const { data: empresasData, loading: empresasLoading, fetchMore: fetchMoreEmpresas } = useQuery<{
    empresas: {
      nodes: Array<{ id: string | number; razaoSocial: string }>;
      pageInfo: {
        hasNextPage: boolean;
        endCursor?: string;
      };
    };
  }>(
    GET_EMPRESAS_PAGINATED,
    {
      variables: {
        first: 10,
        where: empresasSearchQuery ? { razaoSocial: { contains: empresasSearchQuery } } : null,
      },
    }
  );

  // Atualizar items quando dados chegam
  useEffect(() => {
    if (empresasData?.empresas?.nodes) {
      const items = empresasData.empresas.nodes.map((emp: any) => ({
        id: emp.id,
        label: emp.razaoSocial,
      }));
      setEmpresasItems(items);
    }
  }, [empresasData?.empresas?.nodes]);

  // Sync com formulário
  useEffect(() => {
    searchForm.setValue('empresaId', String(selectedEmpresaId || ''));
  }, [selectedEmpresaId, searchForm]);

  const handleLoadMoreEmpresas = async () => {
    const hasMore = empresasData?.empresas?.pageInfo?.hasNextPage;
    const endCursor = empresasData?.empresas?.pageInfo?.endCursor;

    if (!hasMore || !endCursor) return;

    try {
      await fetchMoreEmpresas({
        variables: {
          first: 10,
          after: endCursor,
          where: empresasSearchQuery ? { razaoSocial: { contains: empresasSearchQuery } } : null,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          const newItems = fetchMoreResult.empresas.nodes.map((emp: any) => ({
            id: emp.id,
            label: emp.razaoSocial,
          }));
          setEmpresasItems((prev) => [...prev, ...newItems]);
          return fetchMoreResult;
        },
      });
    } catch (err) {
      console.error('Erro ao carregar mais empresas:', err);
    }
  };

  const handleSearchEmpresas = (query: string) => {
    setEmpresasSearchQuery(query);
    setEmpresasItems([]);
    setSelectedEmpresaId(undefined);
  };

  const variables = useMemo(
    () => ({
      where: buildWhere(currentFilters),
      first: PAGE_SIZE,
      after: cursorStack[currentCursorIndex],
    }),
    [currentFilters, cursorStack, currentCursorIndex],
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

  const handleSearch: SubmitHandler<SearchFormValues> = async (values) => {
    setCurrentFilters(values);
    setCursorStack([null]);
    setCurrentCursorIndex(0);
  };

  const handleClearSearch = () => {
    searchForm.reset({ nome: '', descricao: '', empresaId: '' });
    setCurrentFilters({ nome: '', descricao: '', empresaId: '' });
    setCursorStack([null]);
    setCurrentCursorIndex(0);
  };

  const handleStartCreate = () => {
    navigate('/dashboard/setor/create');
  };

  const handleEdit = (setorId: string) => {
    navigate(`/dashboard/setor/create?id=${setorId}`);
  };

  const handleRemove = async (id: string) => {
    const confirmed = window.confirm('Deseja excluir este setor?');
    if (!confirmed) return;

    try {
      await removeSetor({ variables: { id: Number(id) } });
      await refetch(variables);
    } catch (err) {
      console.error(err);
    }
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
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[#2B2C40]">Buscar setores</h3>
            <p className="mt-1 text-sm dashboard-text-muted">Filtre a lista por nome ou descrição.</p>
          </div>
          <div className="grid w-full gap-4 sm:grid-cols-3">
            <Input
              name="nome"
              placeholder="Nome do setor"
              registration={searchForm.register('nome')}
              error={searchForm.formState.errors.nome}
            />
            <Input
              name="descricao"
              placeholder="Descrição"
              registration={searchForm.register('descricao')}
              error={searchForm.formState.errors.descricao}
            />
            <SelectWithSearch
              items={empresasItems}
              selectedId={selectedEmpresaId}
              placeholder="Todas as empresas"
              searchPlaceholder="Buscar empresa..."
              isLoading={empresasLoading}
              hasMore={empresasData?.empresas?.pageInfo?.hasNextPage ?? false}
              onLoadMore={handleLoadMoreEmpresas}
              onSearch={handleSearchEmpresas}
              onChange={(item) => setSelectedEmpresaId(item.id)}
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
          <div className="flex flex-1 gap-3 flex-wrap justify-center">
            <Button type="button" onClick={handleClearSearch} className="rounded-3xl border border-slate-200 bg-white text-[#2B2C40] hover:bg-[#F4F6FA] px-5 py-3">
              Limpar filtros
            </Button>
            <Button type="button" onClick={searchForm.handleSubmit(handleSearch)} className="rounded-3xl px-5 py-3">
              <Search className="h-4 w-4" /> Buscar
            </Button>
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
                  <td className="px-6 py-4 align-top text-sm text-[#2B2C40]">{setor.empresaSetores[0]?.empresa?.razaoSocial || '—'}</td>
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
