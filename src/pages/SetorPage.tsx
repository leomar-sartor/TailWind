import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { ArrowLeft, ArrowRight, Edit3, PlusCircle, Search, Trash2, XCircle } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { GET_SETORS } from '../graphql/queries/setor.queries';
import {
  CREATE_SETOR_MUTATION,
  REMOVE_SETOR_MUTATION,
  UPDATE_SETOR_MUTATION,
} from '../graphql/mutations/setor.mutations';

type SetorNode = {
  id: string;
  nome: string;
  descricao?: string;
  createdAt?: string;
};

type SearchFormValues = {
  nome: string;
  descricao: string;
};

type SetorFormValues = {
  id?: string;
  nome: string; 
  descricao: string;
};

const PAGE_SIZE = 10;
const EMPRESA_ID = 2;

function buildWhere(values: SearchFormValues) {
  const where: Record<string, { eq: string }> = {};

  if (values.nome?.trim()) {
    where.nome = { eq: values.nome.trim() };
  }

  if (values.descricao?.trim()) {
    where.descricao = { eq: values.descricao.trim() };
  }

  return Object.keys(where).length ? where : null;
}

function formatDate(value?: string) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}

export function SetorPage() {
  const [currentFilters, setCurrentFilters] = useState<SearchFormValues>({ nome: '', descricao: '' });
  const [cursorStack, setCursorStack] = useState<Array<string | null>>([null]);
  const [currentCursorIndex, setCurrentCursorIndex] = useState(0);
  const [editingSetor, setEditingSetor] = useState<SetorNode | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const searchForm = useForm<SearchFormValues>({ defaultValues: currentFilters });
  const setorForm = useForm<SetorFormValues>({ defaultValues: { id: '', nome: '', descricao: '' } });

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

  const [createSetor, { loading: creating }] = useMutation(CREATE_SETOR_MUTATION);
  const [updateSetor, { loading: updating }] = useMutation(UPDATE_SETOR_MUTATION);
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
    searchForm.reset({ nome: '', descricao: '' });
    setCurrentFilters({ nome: '', descricao: '' });
    setCursorStack([null]);
    setCurrentCursorIndex(0);
  };

  const handleStartCreate = () => {
    setEditingSetor(null);
    setorForm.reset({ nome: '', descricao: '' });
    setMessage(null);
  };

  const handleEdit = (setor: SetorNode) => {
    setEditingSetor(setor);
    setorForm.reset({ id: setor.id, nome: setor.nome, descricao: setor.descricao ?? '' });
    setMessage(null);
  };

  const handleCancelEdit = () => {
    setEditingSetor(null);
    setorForm.reset({ nome: '', descricao: '' });
    setMessage(null);
  };

  const handleSubmitSetor: SubmitHandler<SetorFormValues> = async (values) => {
    const payload = {
      nome: values.nome.trim(),
      descricao: values.descricao.trim(),
    };

    try {
      if (editingSetor) {
        await updateSetor({
          variables: {
            id: Number(editingSetor.id),
            input: payload,
          },
        });
        setMessage('Setor atualizado com sucesso.');
      } else {
        await createSetor({
          variables: {
            empresaId: EMPRESA_ID,
            input: payload,
          },
        });
        setMessage('Setor cadastrado com sucesso.');
      }

      setorForm.reset({ nome: '', descricao: '' });
      setEditingSetor(null);
      await refetch(variables);
    } catch (err) {
      setMessage('Erro ao salvar setor.');
      console.error(err);
    }
  };

  const handleRemove = async (id: string) => {
    const confirmed = window.confirm('Deseja excluir este setor?');
    if (!confirmed) return;

    try {
      await removeSetor({ variables: { id: Number(id) } });
      setMessage('Setor removido com sucesso.');
      if (editingSetor?.id === id) {
        setEditingSetor(null);
        setorForm.reset({ nome: '', descricao: '' });
      }
      await refetch(variables);
    } catch (err) {
      setMessage('Erro ao excluir setor.');
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

  const isBusy = loading || creating || updating || removing;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
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
          <div className="grid w-full gap-4 sm:grid-cols-2">
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
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
          <div className="flex flex-1 gap-3 flex-wrap">
            <Button type="button" onClick={searchForm.handleSubmit(handleSearch)} className="rounded-3xl px-5 py-3">
              <Search className="h-4 w-4" /> Buscar
            </Button>
            <Button type="button" onClick={handleClearSearch} className="rounded-3xl border border-slate-200 bg-white text-[#2B2C40] hover:bg-[#F4F6FA] px-5 py-3">
              Limpar filtros
            </Button>
          </div>
          <div className="text-sm dashboard-text-muted">
            {totalCount} setor{totalCount === 1 ? '' : 'es'} encontrado{totalCount === 1 ? '' : 's'}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="dashboard-card rounded-[28px] border p-6 shadow-xl">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[#2B2C40]">{editingSetor ? 'Editar setor' : 'Cadastrar novo setor'}</h3>
              <p className="mt-1 text-sm dashboard-text-muted">Preencha o formulário e salve o setor.</p>
            </div>
            {editingSetor && (
              <button
                type="button"
                className="inline-flex items-center gap-2 text-sm text-[#696CFF] hover:text-[#384551]"
                onClick={handleCancelEdit}
              >
                <XCircle className="h-4 w-4" /> Cancelar edição
              </button>
            )}
          </div>

          <form className="space-y-4" onSubmit={setorForm.handleSubmit(handleSubmitSetor)}>
            <Input
              name="nome"
              placeholder="Nome do setor"
              registration={setorForm.register('nome', {
                required: 'Nome obrigatório',
              })}
              error={setorForm.formState.errors.nome}
            />
            <Input
              name="descricao"
              placeholder="Descrição do setor"
              registration={setorForm.register('descricao', {
                required: 'Descrição obrigatória',
              })}
              error={setorForm.formState.errors.descricao}
            />
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
              <Button type="submit" disabled={isBusy} className="rounded-3xl px-5 py-3">
                {editingSetor ? 'Atualizar setor' : 'Salvar setor'}
              </Button>
              {message && <p className="text-sm text-slate-600">{message}</p>}
            </div>
          </form>
        </article>

        <article className="dashboard-card rounded-[28px] border p-6 shadow-xl">
          <h3 className="text-lg font-semibold text-[#2B2C40]">Resumo rápido</h3>
          <p className="mt-2 text-sm dashboard-text-muted">Use o formulário para buscar e abrir a edição de qualquer setor da lista.</p>
          <div className="mt-5 space-y-3">
            <div className="rounded-3xl border dashboard-border bg-[#F4F6FA] p-4">
              <p className="text-sm text-[#646E78]">Página atual</p>
              <p className="mt-2 text-2xl font-semibold text-[#2B2C40]">{currentCursorIndex + 1}</p>
            </div>
            <div className="rounded-3xl border dashboard-border bg-[#F4F6FA] p-4">
              <p className="text-sm text-[#646E78]">Setores carregados</p>
              <p className="mt-2 text-2xl font-semibold text-[#2B2C40]">{setores.length}</p>
            </div>
          </div>
        </article>
      </section>

      <section className="dashboard-card rounded-[28px] border p-0 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left">
            <thead className="bg-[#F8FAFF]">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-[#2B2C40]">Nome</th>
                <th className="px-6 py-4 text-sm font-semibold text-[#2B2C40]">Descrição</th>
                <th className="px-6 py-4 text-sm font-semibold text-[#2B2C40]">Criado em</th>
                <th className="px-6 py-4 text-sm font-semibold text-[#2B2C40]">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {setores.map((setor) => (
                <tr key={setor.id} className="hover:bg-[#F4F6FA] transition-colors">
                  <td className="px-6 py-4 align-top text-sm text-[#2B2C40]">{setor.nome}</td>
                  <td className="px-6 py-4 align-top text-sm text-[#6C7287]">{setor.descricao || '—'}</td>
                  <td className="px-6 py-4 align-top text-sm text-[#6C7287]">{formatDate(setor.createdAt)}</td>
                  <td className="px-6 py-4 align-top text-sm text-[#2B2C40]">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-white px-3 py-2 text-sm text-[#2B2C40] transition hover:bg-[#F4F6FA]"
                        onClick={() => handleEdit(setor)}
                      >
                        <Edit3 className="h-4 w-4" /> Editar
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-3xl border border-rose-200 bg-white px-3 py-2 text-sm text-rose-500 transition hover:bg-rose-50"
                        onClick={() => handleRemove(setor.id)}
                        disabled={isBusy}
                      >
                        <Trash2 className="h-4 w-4" /> Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!setores.length && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm text-[#6C7287]">
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
          <div className="flex items-center gap-2">
            <Button type="button" onClick={handlePreviousPage} disabled={!hasPreviousPage} className="rounded-3xl border border-slate-200 bg-white text-[#2B2C40] hover:bg-[#F4F6FA] px-4 py-2">
              <ArrowLeft className="h-4 w-4" /> Anterior
            </Button>
            <Button type="button" onClick={handleNextPage} disabled={!hasNextPage} className="rounded-3xl border border-slate-200 bg-white text-[#2B2C40] hover:bg-[#F4F6FA] px-4 py-2">
              Próxima <ArrowRight className="h-4 w-4" />
            </Button>
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
