import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client/react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Edit3, PlusCircle, Search, Trash2 } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { SelectWithSearch, SelectItem } from '../components/Select/SelectWithSearch';
import { GET_COLABORADORES } from '../graphql/queries/colaborador.queries';
import { GET_EMPRESAS_PAGINATED, GET_SETORS } from '../graphql/queries/setor.queries';
import { REMOVE_COLABORADOR_MUTATION } from '../graphql/mutations/colaborador.mutations';

type SearchFormValues = {
  nome: string;
  cpf: string;
  email: string;
  empresaId: string;
  setorId: string;
  ativo: string;
};

type ColaboradorNode = {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  ativo: boolean;
  setorId: string;
  empresaId: string;
  createdAt?: string;
};

const PAGE_SIZE = 10;

function buildWhere(values: SearchFormValues) {
  const where: Record<string, any> = {};

  if (values.nome?.trim()) {
    where.nome = { eq: values.nome.trim() };
  }

  if (values.cpf?.trim()) {
    where.cpf = { eq: values.cpf.trim() };
  }

  if (values.email?.trim()) {
    where.email = { eq: values.email.trim() };
  }

  if (values.empresaId?.trim()) {
    where.empresaId = { eq: Number(values.empresaId) };
  }

  if (values.setorId?.trim()) {
    where.setorId = { eq: Number(values.setorId) };
  }

  if (values.ativo?.trim()) {
    where.ativo = { eq: values.ativo === 'true' };
  }

  return Object.keys(where).length ? where : null;
}

export function ColaboradorPage() {
  const navigate = useNavigate();
  const [currentFilters, setCurrentFilters] = useState<SearchFormValues>({ nome: '', cpf: '', email: '', empresaId: '', setorId: '', ativo: '' });
  const [cursorStack, setCursorStack] = useState<Array<string | null>>([null]);
  const [currentCursorIndex, setCurrentCursorIndex] = useState(0);

  // Estados para SelectWithSearch de empresas
  const [empresasItems, setEmpresasItems] = useState<SelectItem[]>([]);
  const [empresasSearchQuery, setEmpresasSearchQuery] = useState('');
  const [selectedEmpresaId, setSelectedEmpresaId] = useState<string | number>();

  // Estados para SelectWithSearch de setores
  const [setoresItems, setSetoresItems] = useState<SelectItem[]>([]);
  const [setoresSearchQuery, setSetoresSearchQuery] = useState('');
  const [selectedSetorId, setSelectedSetorId] = useState<string | number>();

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

  // Query para setores com paginação
  const { data: setoresData, loading: setoresLoading, fetchMore: fetchMoreSetores } = useQuery<{
    setores: {
      nodes: Array<{ id: string | number; nome: string }>;
      pageInfo: {
        hasNextPage: boolean;
        endCursor?: string;
      };
    };
  }>(
    GET_SETORS,
    {
      variables: {
        first: 10,
        where: setoresSearchQuery ? { nome: { contains: setoresSearchQuery } } : null,
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

  useEffect(() => {
    if (setoresData?.setores?.nodes) {
      const items = setoresData.setores.nodes.map((setor: any) => ({
        id: setor.id,
        label: setor.nome,
      }));
      setSetoresItems(items);
    }
  }, [setoresData?.setores?.nodes]);

  // Sync com formulário
  useEffect(() => {
    searchForm.setValue('empresaId', String(selectedEmpresaId || ''));
  }, [selectedEmpresaId, searchForm]);

  useEffect(() => {
    searchForm.setValue('setorId', String(selectedSetorId || ''));
  }, [selectedSetorId, searchForm]);

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

  const handleLoadMoreSetores = async () => {
    const hasMore = setoresData?.setores?.pageInfo?.hasNextPage;
    const endCursor = setoresData?.setores?.pageInfo?.endCursor;

    if (!hasMore || !endCursor) return;

    try {
      await fetchMoreSetores({
        variables: {
          first: 10,
          after: endCursor,
          where: setoresSearchQuery ? { nome: { contains: setoresSearchQuery } } : null,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          const newItems = fetchMoreResult.setores.nodes.map((setor: any) => ({
            id: setor.id,
            label: setor.nome,
          }));
          setSetoresItems((prev) => [...prev, ...newItems]);
          return fetchMoreResult;
        },
      });
    } catch (err) {
      console.error('Erro ao carregar mais setores:', err);
    }
  };

  const handleSearchEmpresas = (query: string) => {
    setEmpresasSearchQuery(query);
    setEmpresasItems([]);
    setSelectedEmpresaId(undefined);
  };

  const handleSearchSetores = (query: string) => {
    setSetoresSearchQuery(query);
    setSetoresItems([]);
    setSelectedSetorId(undefined);
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
    colaboradores: {
      nodes: ColaboradorNode[];
      pageInfo: {
        hasNextPage: boolean;
        hasPreviousPage?: boolean;
        startCursor?: string;
        endCursor?: string;
      };
      totalCount: number;
    };
  }>(GET_COLABORADORES, {
    variables,
    notifyOnNetworkStatusChange: true,
  });

  const [removeColaborador, { loading: removing }] = useMutation(REMOVE_COLABORADOR_MUTATION);

  const colaboradores: ColaboradorNode[] = data?.colaboradores?.nodes ?? [];
  const pageInfo = data?.colaboradores?.pageInfo;
  const totalCount = data?.colaboradores?.totalCount ?? 0;

  const hasPreviousPage = currentCursorIndex > 0;
  const hasNextPage = !!pageInfo?.hasNextPage;

  const handleSearch: SubmitHandler<SearchFormValues> = async (values) => {
    setCurrentFilters(values);
    setCursorStack([null]);
    setCurrentCursorIndex(0);
  };

  const handleClearSearch = () => {
    searchForm.reset({ nome: '', cpf: '', email: '', empresaId: '', setorId: '', ativo: '' });
    setCurrentFilters({ nome: '', cpf: '', email: '', empresaId: '', setorId: '', ativo: '' });
    setCursorStack([null]);
    setCurrentCursorIndex(0);
    setSelectedEmpresaId(undefined);
    setSelectedSetorId(undefined);
  };

  const handleStartCreate = () => {
    navigate('/dashboard/colaboradores/create');
  };

  const handleEdit = (colaboradorId: string) => {
    navigate(`/dashboard/colaboradores/create?id=${colaboradorId}`);
  };

  const handleRemove = async (id: string) => {
    const confirmed = window.confirm('Deseja excluir este colaborador?');
    if (!confirmed) return;

    try {
      await removeColaborador({ variables: { id: Number(id) } });
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
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[#2B2C40]">Buscar colaboradores</h3>
            <p className="mt-1 text-sm dashboard-text-muted">Filtre a lista por nome, CPF, e-mail, empresa, setor ou status.</p>
          </div>
          <div className="grid w-full gap-4 sm:grid-cols-3">
            <Input
              name="nome"
              placeholder="Nome"
              registration={searchForm.register('nome')}
              error={searchForm.formState.errors.nome}
            />
            <Input
              name="cpf"
              placeholder="CPF"
              registration={searchForm.register('cpf')}
              error={searchForm.formState.errors.cpf}
            />
            <Input
              name="email"
              placeholder="E-mail"
              registration={searchForm.register('email')}
              error={searchForm.formState.errors.email}
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
            <SelectWithSearch
              items={setoresItems}
              selectedId={selectedSetorId}
              placeholder="Todos os setores"
              searchPlaceholder="Buscar setor..."
              isLoading={setoresLoading}
              hasMore={setoresData?.setores?.pageInfo?.hasNextPage ?? false}
              onLoadMore={handleLoadMoreSetores}
              onSearch={handleSearchSetores}
              onChange={(item) => setSelectedSetorId(item.id)}
            />
            <Select
              name="ativo"
              registration={searchForm.register('ativo')}
              error={searchForm.formState.errors.ativo}
            >
              <option value="">Todos os status</option>
              <option value="true">Ativos</option>
              <option value="false">Inativos</option>
            </Select>
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
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-white px-3 py-2 text-sm text-[#2B2C40] transition hover:bg-[#F4F6FA]"
                        onClick={() => handleEdit(colaborador.id)}
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-3xl border border-rose-200 bg-white px-3 py-2 text-sm text-rose-500 transition hover:bg-rose-50"
                        onClick={() => handleRemove(colaborador.id)}
                        disabled={isBusy}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top text-sm text-[#6C7287]">{colaborador.cpf}</td>
                  <td className="px-6 py-4 align-top text-sm text-[#2B2C40]">{colaborador.nome}</td>
                  <td className="px-6 py-4 align-top text-sm text-[#6C7287]">{colaborador.email}</td>
                  <td className="px-6 py-4 align-top text-sm text-[#2B2C40]">{/* Empresa name */}</td>
                  <td className="px-6 py-4 align-top text-sm text-[#2B2C40]">{/* Setor name */}</td>
                  <td className="px-6 py-4 align-top text-sm text-[#2B2C40]">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      colaborador.ativo
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
          Erro ao carregar colaboradores. Verifique a conexão e tente novamente.
        </div>
      )}
    </div>
  );
}