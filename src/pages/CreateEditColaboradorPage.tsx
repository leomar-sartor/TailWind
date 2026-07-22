import { useEffect, useState, type ChangeEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client/react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Button } from '../components/Button';
import { LabeledInput } from '../components/LabeledInput';
import { LabeledSelect } from '../components/LabeledSelect';
import { LabeledSelectWithSearch } from '../components/LabeledSelect/LabeledSelectWithSearch';
import type { SelectItem } from '../components/Select/SelectWithSearch';
import { GET_COLABORADOR_BY_ID } from '../graphql/queries/colaborador.queries';
import { GET_EMPRESAS_PAGINATED, GET_SETORS } from '../graphql/queries/setor.queries';
import { CREATE_COLABORADOR_MUTATION, UPDATE_COLABORADOR_MUTATION } from '../graphql/mutations/colaborador.mutations';
import { formatCpf, stripCpfMask } from '../utils/cpf';

type ColaboradorFormValues = {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  empresaId: string;
  setorId: string;
  ativo: string;
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

export function CreateEditColaboradorPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const colaboradorId = searchParams.get('id');

  // Estados para SelectWithSearch de empresas
  const [empresasItems, setEmpresasItems] = useState<SelectItem[]>([]);
  const [empresasSearchQuery, setEmpresasSearchQuery] = useState('');
  const [selectedEmpresaId, setSelectedEmpresaId] = useState<string | number>();

  // Estados para SelectWithSearch de setores
  const [setoresItems, setSetoresItems] = useState<SelectItem[]>([]);
  const [setoresSearchQuery, setSetoresSearchQuery] = useState('');
  const [selectedSetorId, setSelectedSetorId] = useState<string | number>();

  const colaboradorForm = useForm<ColaboradorFormValues>({
    defaultValues: { id: '', nome: '', cpf: '', email: '', empresaId: '', setorId: '', ativo: 'true' },
  });

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

  const { data: colaboradorData } = useQuery<{
    colaboradorById: {
      id: string;
      nome: string;
      cpf: string;
      email: string;
      empresaId: string;
      setorId: string;
    };
  }>(
    GET_COLABORADOR_BY_ID,
    {
      variables: { id: Number(colaboradorId) },
      skip: !colaboradorId,
    }
  );

  const [createColaborador, { loading: creating }] = useMutation(CREATE_COLABORADOR_MUTATION);
  const [updateColaborador, { loading: updating }] = useMutation(UPDATE_COLABORADOR_MUTATION);
  const [submitError, setSubmitError] = useState<string | null>(null);

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
    colaboradorForm.setValue('empresaId', String(selectedEmpresaId || ''));
  }, [selectedEmpresaId, colaboradorForm]);

  useEffect(() => {
    colaboradorForm.setValue('setorId', String(selectedSetorId || ''));
  }, [selectedSetorId, colaboradorForm]);

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
          return {
            ...fetchMoreResult,
            empresas: {
              ...fetchMoreResult.empresas,
              nodes: [...(prev.empresas?.nodes ?? []), ...fetchMoreResult.empresas.nodes],
            },
          };
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
          return {
            ...fetchMoreResult,
            setores: {
              ...fetchMoreResult.setores,
              nodes: [...(prev.setores?.nodes ?? []), ...fetchMoreResult.setores.nodes],
            },
          };
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

  const handleCpfChange = (event: ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCpf(event.target.value);
    colaboradorForm.setValue('cpf', formatted, { shouldValidate: true, shouldDirty: true });
  };

  useEffect(() => {
    if (colaboradorData?.colaboradorById) {
      const colaborador = colaboradorData.colaboradorById;
      colaboradorForm.reset({
        id: colaborador.id,
        nome: colaborador.nome,
        cpf: formatCpf(colaborador.cpf),
        email: colaborador.email,
        empresaId: String(colaborador.empresaId),
        setorId: String(colaborador.setorId),
      });
      setSelectedEmpresaId(colaborador.empresaId);
      setSelectedSetorId(colaborador.setorId);
    }
  }, [colaboradorData, colaboradorForm, colaboradorId]);

  const handleSubmit: SubmitHandler<ColaboradorFormValues> = async (values) => {
    setSubmitError(null);

    try {
      const input = {
        nome: values.nome,
        cpf: stripCpfMask(values.cpf),
        email: values.email,
        empresaId: Number(values.empresaId),
        setorId: Number(values.setorId),
      };

      let result: any;

      if (colaboradorId) {
        result = await updateColaborador({
          variables: {
            id: Number(colaboradorId),
            input,
          },
        });
      } else {
        result = await createColaborador({
          variables: { input },
        });
      }

      const mutationErrorMessage = getGraphQLErrorMessage((result as any)?.error ?? (result as any)?.errors);

      if (mutationErrorMessage) {
        setSubmitError(mutationErrorMessage);
        return;
      }

      navigate('/dashboard/colaboradores', {
        replace: true,
        state: { message: colaboradorId ? 'Colaborador atualizado com sucesso!' : 'Colaborador cadastrado com sucesso!' },
      });
    } catch (err) {
      const message = getGraphQLErrorMessage(err) ?? 'Não foi possível salvar o colaborador. Tente novamente.';
      setSubmitError(message);
      console.error(err);
    }
  };

  const isBusy = creating || updating;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between px-4">
        <div>
          <h2 className="text-xl font-semibold text-[#2B2C40]">
            {colaboradorId ? 'Editar colaborador' : 'Cadastrar colaborador'}
          </h2>
          <p className="mt-1 text-sm dashboard-text-muted">
            {colaboradorId ? 'Atualize as informações do colaborador.' : 'Preencha os dados para cadastrar um novo colaborador.'}
          </p>
        </div>
      </div>

      <section className="dashboard-card rounded-[28px] border p-6 shadow-xl">
        {submitError ? (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {submitError}
          </div>
        ) : null}

        <form onSubmit={colaboradorForm.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <LabeledInput
              name="nome"
              label="Nome completo"
              required
              registration={colaboradorForm.register('nome', {
                required: 'Nome obrigatório',
              })}
              error={colaboradorForm.formState.errors.nome}
            />
            <LabeledInput
              name="cpf"
              label="CPF"
              required
              registration={colaboradorForm.register('cpf', {
                required: 'CPF obrigatório',
                onChange: handleCpfChange,
              })}
              error={colaboradorForm.formState.errors.cpf}
            />
            <LabeledInput
              name="email"
              label="E-mail"
              required
              registration={colaboradorForm.register('email', {
                required: 'E-mail obrigatório',
              })}
              error={colaboradorForm.formState.errors.email}
            />
            <LabeledSelectWithSearch
              label="Empresa"
              required
              items={empresasItems}
              selectedId={selectedEmpresaId}
              placeholder="Selecione a empresa"
              searchPlaceholder="Buscar empresa..."
              isLoading={empresasLoading}
              hasMore={empresasData?.empresas?.pageInfo?.hasNextPage ?? false}
              onLoadMore={handleLoadMoreEmpresas}
              onSearch={handleSearchEmpresas}
              onChange={(item) => setSelectedEmpresaId(item.id)}
              error={colaboradorForm.formState.errors.empresaId}
            />
            <LabeledSelectWithSearch
              label="Setor"
              required
              items={setoresItems}
              selectedId={selectedSetorId}
              placeholder="Selecione o setor"
              searchPlaceholder="Buscar setor..."
              isLoading={setoresLoading}
              hasMore={setoresData?.setores?.pageInfo?.hasNextPage ?? false}
              onLoadMore={handleLoadMoreSetores}
              onSearch={handleSearchSetores}
              onChange={(item) => setSelectedSetorId(item.id)}
              error={colaboradorForm.formState.errors.setorId}
            />
            <LabeledSelect
              label="Status"
              required
              defaultValue="true"
              options={[
                { value: 'true', label: 'Ativo' },
                { value: 'false', label: 'Inativo' },
              ]}
              registration={colaboradorForm.register('ativo', {
                required: 'Informe se está ativo',
              })}
              error={colaboradorForm.formState.errors.ativo}
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              onClick={() => navigate('/dashboard/colaboradores')}
              className="rounded-3xl border border-slate-200 bg-white text-[#2B2C40] hover:bg-[#F4F6FA] px-5 py-3"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isBusy}
              className="rounded-3xl px-5 py-3"
            >
              {isBusy ? 'Salvando...' : colaboradorId ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
