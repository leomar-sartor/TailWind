import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client/react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/Button';
import { LabeledInput } from '../components/LabeledInput';
import { LabeledSelectWithSearch } from '../components/LabeledSelect/LabeledSelectWithSearch';
import type { SelectItem } from '../components/Select/SelectWithSearch';
import {
  CREATE_SETOR_MUTATION,
  UPDATE_SETOR_MUTATION,
} from '../graphql/mutations/setor.mutations';
import { GET_SETOR_BY_ID, GET_EMPRESAS_PAGINATED } from '../graphql/queries/setor.queries';
import type {
  CreateSetorData,
  CreateSetorVars,
  GetSetorByIdData,
  GetSetorByIdVars,
  UpdateSetorData,
  UpdateSetorVars,
} from '../graphql/types/setor.types';
import type {
  GetEmpresasPaginatedData,
  GetEmpresasPaginatedVars,
} from '../graphql/types/empresa.types';
import { getGraphQLErrorMessage } from '../utils/confirmToast';
import { mergeConnectionNodes } from '../utils/mergeConnectionNodes';

type SetorFormValues = {
  id?: string;
  nome: string;
  descricao: string;
  empresaId: string;
};

function mergeSeedItem(items: SelectItem[], seed?: SelectItem | null): SelectItem[] {
  if (!seed) return items;
  if (items.some((item) => String(item.id) === String(seed.id))) return items;
  return [seed, ...items];
}

export function CreateEditSetorPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setorId = searchParams.get('id');
  const isEditing = !!setorId;

  const [empresasSearchQuery, setEmpresasSearchQuery] = useState('');

  const setorForm = useForm<SetorFormValues>({
    defaultValues: { id: '', nome: '', descricao: '', empresaId: '' },
  });

  const selectedEmpresaId = setorForm.watch('empresaId') || undefined;

  const [createSetor, { loading: creating }] = useMutation<CreateSetorData, CreateSetorVars>(
    CREATE_SETOR_MUTATION,
  );
  const [updateSetor, { loading: updating }] = useMutation<UpdateSetorData, UpdateSetorVars>(
    UPDATE_SETOR_MUTATION,
  );
  const [submitError, setSubmitError] = useState<string | null>(null);

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

  const { data: setorData, loading: loadingSetor } = useQuery<GetSetorByIdData, GetSetorByIdVars>(
    GET_SETOR_BY_ID,
    {
      variables: {
        id: Number(setorId),
      },
      skip: !setorId,
    },
  );

  const seedEmpresa = useMemo(() => {
    const empresa = setorData?.setorById?.empresa;
    return empresa?.id
      ? { id: empresa.id, label: empresa.nomeFantasia ?? '' }
      : null;
  }, [setorData?.setorById?.empresa]);

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

  const handleEmpresaChange = (item: SelectItem) => {
    if (isEditing) return;
    setorForm.setValue('empresaId', String(item.id), { shouldValidate: true, shouldDirty: true });
  };

  useEffect(() => {
    const setor = setorData?.setorById;
    if (!setor) return;

    setorForm.reset({
      id: String(setor.id),
      nome: setor.nome,
      descricao: setor.descricao ?? '',
      empresaId: setor.empresa?.id ? String(setor.empresa.id) : '',
    });
  }, [setorData, setorForm, setorId]);

  const handleSubmit: SubmitHandler<SetorFormValues> = async (values) => {
    setSubmitError(null);

    if (!isEditing && !values.empresaId) {
      setSubmitError('Por favor, selecione uma empresa');
      return;
    }

    const payload = {
      nome: values.nome.trim(),
      descricao: values.descricao.trim(),
    };

    try {
      const result = isEditing && setorId
        ? await updateSetor({
            variables: {
              id: Number(setorId),
              input: payload,
            },
          })
        : await createSetor({
            variables: {
              empresaId: Number(values.empresaId),
              input: payload,
            },
          });

      const mutationErrorMessage = getGraphQLErrorMessage(result.error);

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
      <div className="flex items-center gap-4">
        <button
          type="button"
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

      <div>
        <article className="dashboard-card rounded-[28px] border p-6 shadow-xl">
          {submitError ? (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
              {submitError}
            </div>
          ) : null}

          <form className="space-y-6" onSubmit={setorForm.handleSubmit(handleSubmit)}>
            <div className="space-y-4">
              <LabeledSelectWithSearch
                label="Empresa"
                required
                items={empresasItems}
                selectedId={selectedEmpresaId}
                placeholder="Selecione uma empresa"
                searchPlaceholder="Buscar empresa..."
                isLoading={empresasLoading}
                hasMore={empresasData?.empresas?.pageInfo?.hasNextPage ?? false}
                onLoadMore={handleLoadMoreEmpresas}
                onSearch={setEmpresasSearchQuery}
                onChange={handleEmpresaChange}
                disabled={isEditing}
                registration={setorForm.register('empresaId', {
                  required: isEditing ? false : 'Empresa obrigatória',
                })}
                error={setorForm.formState.errors.empresaId}
              />
              <LabeledInput
                name="nome"
                label="Nome do setor"
                required
                registration={setorForm.register('nome', {
                  required: 'Nome obrigatório',
                })}
                error={setorForm.formState.errors.nome}
              />
              <LabeledInput
                name="descricao"
                label="Descrição do setor"
                registration={setorForm.register('descricao')}
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
