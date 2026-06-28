import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client/react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { SelectWithSearch, SelectItem } from '../components/Select/SelectWithSearch';
import {
  CREATE_SETOR_MUTATION,
  UPDATE_SETOR_MUTATION,
} from '../graphql/mutations/setor.mutations';
import { GET_SETOR_BY_ID, GET_EMPRESAS_PAGINATED } from '../graphql/queries/setor.queries';

type SetorFormValues = {
  id?: string;
  nome: string;
  descricao: string;
};

function getGraphQLErrorMessage(error: unknown): string | null {
  if (!error) return null;

  const err = error as any;
  const possibleErrors = err.errors ?? err.graphQLErrors;

  if (Array.isArray(possibleErrors) && possibleErrors.length > 0) {
    const firstError = possibleErrors[0];
    return firstError?.extensions?.message ?? firstError?.message ?? null;
  }

  if (err?.message) {
    return err.message;
  }

  return null;
}

export function CreateEditSetorPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setorId = searchParams.get('id');
  const isEditing = !!setorId;

  // Estados para SelectWithSearch de empresas
  const [empresasItems, setEmpresasItems] = useState<SelectItem[]>([]);
  const [empresasSearchQuery, setEmpresasSearchQuery] = useState('');
  const [selectedEmpresaId, setSelectedEmpresaId] = useState<string | number>();

  const setorForm = useForm<SetorFormValues>({
    defaultValues: { id: '', nome: '', descricao: '' },
  });

  const [createSetor, { loading: creating }] = useMutation(CREATE_SETOR_MUTATION);
  const [updateSetor, { loading: updating }] = useMutation(UPDATE_SETOR_MUTATION);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Query para empresas com paginação
  const { data: empresasData, loading: empresasLoading, fetchMore: fetchMoreEmpresas } = useQuery<{
    empresas: {
      nodes: Array<{ id: string | number; nomeFantasia: string }>;
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
        where: empresasSearchQuery ? { nomeFantasia: { contains: empresasSearchQuery } } : null,
      },
    }
  );

  // Atualizar items quando dados chegam
  useEffect(() => {
    if (empresasData?.empresas?.nodes) {
      const items = empresasData.empresas.nodes.map((emp: any) => ({
        id: emp.id,
        label: emp.nomeFantasia,
      }));
      setEmpresasItems(items);
    }
  }, [empresasData?.empresas?.nodes]);

  const handleLoadMoreEmpresas = async () => {
    const hasMore = empresasData?.empresas?.pageInfo?.hasNextPage;
    const endCursor = empresasData?.empresas?.pageInfo?.endCursor;

    if (!hasMore || !endCursor) return;

    try {
      await fetchMoreEmpresas({
        variables: {
          first: 10,
          after: endCursor,
          where: empresasSearchQuery ? { nomeFantasia: { contains: empresasSearchQuery } } : null,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          const newItems = fetchMoreResult.empresas.nodes.map((emp: any) => ({
            id: emp.id,
            label: emp.nomeFantasia,
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

  // Buscar dados do setor se for edição
  const { data: setorData, loading: loadingSetor, refetch } = useQuery(
    GET_SETOR_BY_ID,
    {
      variables: {
        id: Number(setorId),
      },
      skip: !setorId,
    }
  );

  // Refetch quando o ID mudar
  useEffect(() => {
    if (setorId && refetch) {
      refetch({ id: Number(setorId) });
    }
  }, [setorId, refetch]);

  // Preencher formulário com dados do setor ao carregar
  useEffect(() => {
    if (setorData?.setorById) {
      const setor = setorData.setorById;
      setorForm.reset({
        id: setor.id,
        nome: setor.nome,
        descricao: setor.descricao ?? '',
      });
      // Carregar empresa do setor se existir
      if (setor.empresa?.id) {
        setSelectedEmpresaId(setor.empresa.id);
      }
    }
  }, [setorData, setorForm, setorId]);

  const handleSubmit: SubmitHandler<SetorFormValues> = async (values) => {
    setSubmitError(null);

    if (!selectedEmpresaId) {
      setSubmitError('Por favor, selecione uma empresa');
      return;
    }

    const payload = {
      nome: values.nome.trim(),
      descricao: values.descricao.trim(),
    };

    try {
      let result: any;

      if (isEditing && setorId) {
        result = await updateSetor({
          variables: {
            id: Number(setorId),
            input: payload,
          },
        });
      } else {
        result = await createSetor({
          variables: {
            empresaId: Number(selectedEmpresaId),
            input: payload,
          },
        });
      }

      const mutationErrorMessage = getGraphQLErrorMessage((result as any)?.error ?? (result as any)?.errors);

      if (mutationErrorMessage) {
        setSubmitError(mutationErrorMessage);
        return;
      }

      navigate('/dashboard/setor', {
        replace: true,
        state: { message: isEditing ? 'Setor atualizado com sucesso!' : 'Setor cadastrado com sucesso!' },
      });
    } catch (err) {
      const message = getGraphQLErrorMessage(err) ?? 'Não foi possível salvar o setor. Tente novamente.';
      setSubmitError(message);
      console.error(err);
    }
  };

  const isBusy = creating || updating || loadingSetor || empresasLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard/setor')}
          className="inline-flex items-center gap-2 text-[#696CFF] hover:text-[#384551] transition"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm font-medium">Voltar</span>
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-[#2B2C40]">
            {isEditing ? 'Editar setor' : 'Cadastrar novo setor'}
          </h1>
          <p className="mt-1 text-sm text-[#6C7287]">
            {isEditing
              ? 'Atualize as informações do setor.'
              : 'Preencha o formulário abaixo para criar um novo setor.'}
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div>
        <article className="dashboard-card rounded-[28px] border p-6 shadow-xl">
          {submitError ? (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
              {submitError}
            </div>
          ) : null}

          <form className="space-y-6" onSubmit={setorForm.handleSubmit(handleSubmit)}>
            <div className="space-y-4">
              <SelectWithSearch
                items={empresasItems}
                selectedId={selectedEmpresaId}
                placeholder="Selecione uma empresa"
                searchPlaceholder="Buscar empresa..."
                isLoading={empresasLoading}
                hasMore={empresasData?.empresas?.pageInfo?.hasNextPage ?? false}
                onLoadMore={handleLoadMoreEmpresas}
                onSearch={handleSearchEmpresas}
                onChange={(item) => setSelectedEmpresaId(item.id)}
              />
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
                })}
                error={setorForm.formState.errors.descricao}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isBusy}
                className="rounded-3xl px-6 py-3"
              >
                {isEditing ? 'Atualizar setor' : 'Salvar setor'}
              </Button>
              <Button
                type="button"
                onClick={() => navigate('/dashboard/setor')}
                className="rounded-3xl border border-slate-200 bg-white text-[#2B2C40] hover:bg-[#F4F6FA] px-6 py-3"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </article>
      </div>
    </div>
  );
}
