import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client/react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Button } from '../components/Button';
import { LabeledInput } from '../components/LabeledInput';
import { LabeledSelectWithSearch } from '../components/LabeledSelect/LabeledSelectWithSearch';
import type { SelectItem } from '../components/Select/SelectWithSearch';
import { GET_COLABORADOR_BY_ID } from '../graphql/queries/colaborador.queries';
import { GET_EMPRESAS_PAGINATED, GET_SETORS } from '../graphql/queries/setor.queries';
import { CREATE_COLABORADOR_MUTATION, UPDATE_COLABORADOR_MUTATION } from '../graphql/mutations/colaborador.mutations';
import type {
  CreateColaboradorData,
  CreateColaboradorVars,
  GetColaboradorByIdData,
  GetColaboradorByIdVars,
  UpdateColaboradorData,
  UpdateColaboradorVars,
} from '../graphql/types/colaborador.types';
import type {
  GetEmpresasPaginatedData,
  GetEmpresasPaginatedVars,
} from '../graphql/types/empresa.types';
import type {
  GetSetoresData,
  GetSetoresVars,
} from '../graphql/types/setor.types';
import type { AndFilterInput } from '../graphql/types/common.types';
import { formatCpf, stripCpfMask } from '../utils/cpf';
import { getGraphQLErrorMessage } from '../utils/confirmToast';
import { mergeConnectionNodes } from '../utils/mergeConnectionNodes';

type ColaboradorFormValues = {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  empresaId: string;
  setorId: string;
};

function buildSetoresWhere(
  empresaId: string | number | undefined,
  searchQuery: string,
): AndFilterInput | null {
  if (!empresaId) return null;

  const and: AndFilterInput['and'] = [
    { empresaId: { eq: Number(empresaId) } },
  ];

  const normalized = searchQuery.trim();
  if (normalized) {
    and.push({ nome: { contains: normalized } });
  }

  return { and };
}

function mergeSeedItem(items: SelectItem[], seed?: SelectItem | null): SelectItem[] {
  if (!seed) return items;
  if (items.some((item) => String(item.id) === String(seed.id))) return items;
  return [seed, ...items];
}

export function CreateEditColaboradorPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const colaboradorId = searchParams.get('id');

  const [empresasSearchQuery, setEmpresasSearchQuery] = useState('');
  const [setoresSearchQuery, setSetoresSearchQuery] = useState('');

  const colaboradorForm = useForm<ColaboradorFormValues>({
    defaultValues: { id: '', nome: '', cpf: '', email: '', empresaId: '', setorId: '' },
  });

  const selectedEmpresaId = colaboradorForm.watch('empresaId') || undefined;
  const selectedSetorId = colaboradorForm.watch('setorId') || undefined;

  const { data: empresasData, loading: empresasLoading, fetchMore: fetchMoreEmpresas } = useQuery<
    GetEmpresasPaginatedData,
    GetEmpresasPaginatedVars
  >(
    GET_EMPRESAS_PAGINATED,
    {
      variables: {
        first: 10,
        where: empresasSearchQuery ? { nomeFantasia: { contains: empresasSearchQuery } } : null,
      },
    },
  );

  const setoresWhere = useMemo(
    () => buildSetoresWhere(selectedEmpresaId, setoresSearchQuery),
    [selectedEmpresaId, setoresSearchQuery],
  );

  const { data: setoresData, loading: setoresLoading, fetchMore: fetchMoreSetores } = useQuery<
    GetSetoresData,
    GetSetoresVars
  >(
    GET_SETORS,
    {
      variables: {
        first: 10,
        where: setoresWhere,
      },
      skip: !selectedEmpresaId,
    },
  );

  const { data: colaboradorData, loading: loadingColaborador } = useQuery<
    GetColaboradorByIdData,
    GetColaboradorByIdVars
  >(
    GET_COLABORADOR_BY_ID,
    {
      variables: { id: Number(colaboradorId) },
      skip: !colaboradorId,
    },
  );

  const [createColaborador, { loading: creating }] = useMutation<
    CreateColaboradorData,
    CreateColaboradorVars
  >(CREATE_COLABORADOR_MUTATION);
  const [updateColaborador, { loading: updating }] = useMutation<
    UpdateColaboradorData,
    UpdateColaboradorVars
  >(UPDATE_COLABORADOR_MUTATION);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const seedEmpresa = useMemo(() => {
    const empresa = colaboradorData?.colaboradorById?.empresa;
    return empresa ? { id: empresa.id, label: empresa.nomeFantasia } : null;
  }, [colaboradorData?.colaboradorById?.empresa]);

  const seedSetor = useMemo(() => {
    const colaborador = colaboradorData?.colaboradorById;
    if (!colaborador?.setor) return null;
    if (String(selectedEmpresaId) !== String(colaborador.empresaId)) return null;
    return { id: colaborador.setor.id, label: colaborador.setor.nome };
  }, [colaboradorData?.colaboradorById, selectedEmpresaId]);

  const empresasItems = useMemo(
    () =>
      mergeSeedItem(
        (empresasData?.empresas?.nodes ?? []).map((emp) => ({
          id: emp.id,
          label: emp.nomeFantasia,
        })),
        seedEmpresa,
      ),
    [empresasData?.empresas?.nodes, seedEmpresa],
  );

  const setoresItems = useMemo(() => {
    if (!selectedEmpresaId) return seedSetor ? [seedSetor] : [];

    return mergeSeedItem(
      (setoresData?.setores?.nodes ?? []).map((setor) => ({
        id: setor.id,
        label: setor.nome,
      })),
      seedSetor,
    );
  }, [selectedEmpresaId, setoresData?.setores?.nodes, seedSetor]);

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
              nodes: mergeConnectionNodes(prev.empresas?.nodes, fetchMoreResult.empresas.nodes),
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

    if (!hasMore || !endCursor || !selectedEmpresaId) return;

    try {
      await fetchMoreSetores({
        variables: {
          first: 10,
          after: endCursor,
          where: setoresWhere,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          return {
            ...fetchMoreResult,
            setores: {
              ...fetchMoreResult.setores,
              nodes: mergeConnectionNodes(prev.setores?.nodes, fetchMoreResult.setores.nodes),
            },
          };
        },
      });
    } catch (err) {
      console.error('Erro ao carregar mais setores:', err);
    }
  };

  const handleEmpresaChange = (item: SelectItem) => {
    setSetoresSearchQuery('');
    colaboradorForm.setValue('empresaId', String(item.id), { shouldValidate: true, shouldDirty: true });
    colaboradorForm.setValue('setorId', '', { shouldValidate: true, shouldDirty: true });
  };

  const handleSetorChange = (item: SelectItem) => {
    colaboradorForm.setValue('setorId', String(item.id), { shouldValidate: true, shouldDirty: true });
  };

  const handleCpfChange = (event: ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCpf(event.target.value);
    colaboradorForm.setValue('cpf', formatted, { shouldValidate: true, shouldDirty: true });
  };

  useEffect(() => {
    const colaborador = colaboradorData?.colaboradorById;
    if (!colaborador) return;

    colaboradorForm.reset({
      id: String(colaborador.id),
      nome: colaborador.nome,
      cpf: formatCpf(colaborador.cpf),
      email: colaborador.email,
      empresaId: String(colaborador.empresaId),
      setorId: String(colaborador.setorId),
    });
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

      const result = colaboradorId
        ? await updateColaborador({
            variables: {
              id: Number(colaboradorId),
              input,
            },
          })
        : await createColaborador({
            variables: { input },
          });

      const mutationErrorMessage = getGraphQLErrorMessage(result.error);

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

  const isBusy = creating || updating || loadingColaborador;

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
              onSearch={setEmpresasSearchQuery}
              onChange={handleEmpresaChange}
              registration={colaboradorForm.register('empresaId', {
                required: 'Empresa obrigatória',
              })}
              error={colaboradorForm.formState.errors.empresaId}
            />
            <LabeledSelectWithSearch
              label="Setor"
              required
              items={setoresItems}
              selectedId={selectedSetorId}
              placeholder={selectedEmpresaId ? 'Selecione o setor' : 'Selecione uma empresa primeiro'}
              searchPlaceholder="Buscar setor..."
              isLoading={setoresLoading}
              hasMore={setoresData?.setores?.pageInfo?.hasNextPage ?? false}
              onLoadMore={handleLoadMoreSetores}
              onSearch={setSetoresSearchQuery}
              onChange={handleSetorChange}
              disabled={!selectedEmpresaId}
              registration={colaboradorForm.register('setorId', {
                required: 'Setor obrigatório',
              })}
              error={colaboradorForm.formState.errors.setorId}
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
