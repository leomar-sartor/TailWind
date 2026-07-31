import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client/react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { CadastroFormActions, CadastroFormHeader } from '../../components/cadastro';
import { FormErrorAlert } from '../../components/FormErrorAlert';
import { LabeledInput } from '../../components/LabeledInput';
import { LabeledSelectWithSearch } from '../../components/LabeledSelect/LabeledSelectWithSearch';
import type { SelectItem } from '../../components/Select/SelectWithSearch';
import {
  CREATE_SETOR_MUTATION,
  UPDATE_SETOR_MUTATION,
} from '../../graphql/Setor/mutations';
import { GET_SETOR_BY_ID, GET_EMPRESAS_PAGINATED } from '../../graphql/Setor/queries';
import type {
  CreateSetorData,
  CreateSetorVars,
  GetSetorByIdData,
  GetSetorByIdVars,
  UpdateSetorData,
  UpdateSetorVars,
} from '../../graphql/Setor/types';
import type {
  GetEmpresasPaginatedData,
  GetEmpresasPaginatedVars,
} from '../../graphql/Empresa/types';
import { getGraphQLErrorMessage } from '../../utils/confirmToast';
import { mergeConnectionNodes } from '../../utils/mergeConnectionNodes';

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
  const goBack = () => navigate('/dashboard/setor');

  return (
    <div className="space-y-6">
      <CadastroFormHeader
        title={isEditing ? 'Editar setor' : 'Cadastrar novo setor'}
        description={
          isEditing
            ? 'Atualize as informações do setor.'
            : 'Preencha o formulário abaixo para criar um novo setor.'
        }
        onBack={goBack}
      />

      <section className="dashboard-card rounded-[28px] border p-6 shadow-xl">
        <FormErrorAlert message={submitError} />

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

          <CadastroFormActions
            submitLabel={isEditing ? 'Atualizar setor' : 'Salvar setor'}
            isBusy={isBusy}
            onCancel={goBack}
          />
        </form>
      </section>
    </div>
  );
}
