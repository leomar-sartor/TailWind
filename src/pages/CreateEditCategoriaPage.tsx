import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client/react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/Button';
import { FormErrorAlert } from '../components/FormErrorAlert';
import { LabeledInput } from '../components/LabeledInput';
import {
  CREATE_CATEGORIA_MUTATION,
  UPDATE_CATEGORIA_MUTATION,
} from '../graphql/mutations/categoria.mutations';
import { GET_CATEGORIA_BY_ID } from '../graphql/queries/categoria.queries';
import type {
  CreateCategoriaData,
  CreateCategoriaVars,
  GetCategoriaByIdData,
  GetCategoriaByIdVars,
  UpdateCategoriaData,
  UpdateCategoriaVars,
} from '../graphql/types/categoria.types';
import { getGraphQLErrorMessage } from '../utils/confirmToast';

type CategoriaFormValues = {
  id?: string;
  nome: string;
  descricao?: string;
};

export function CreateEditCategoriaPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoriaId = searchParams.get('id');
  const isEditing = !!categoriaId;

  const categoriaForm = useForm<CategoriaFormValues>({
    defaultValues: { id: '', nome: '', descricao: '' },
  });

  const [createCategoria, { loading: creating }] = useMutation<
    CreateCategoriaData,
    CreateCategoriaVars
  >(CREATE_CATEGORIA_MUTATION);
  const [updateCategoria, { loading: updating }] = useMutation<
    UpdateCategoriaData,
    UpdateCategoriaVars
  >(UPDATE_CATEGORIA_MUTATION);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: categoriaData, loading: loadingCategoria, refetch } = useQuery<
    GetCategoriaByIdData,
    GetCategoriaByIdVars
  >(GET_CATEGORIA_BY_ID, {
    variables: { id: Number(categoriaId) },
    skip: !categoriaId,
  });

  useEffect(() => {
    if (categoriaId && refetch) {
      refetch({ id: Number(categoriaId) });
    }
  }, [categoriaId, refetch]);

  useEffect(() => {
    if (categoriaData?.categoriaById) {
      const categoria = categoriaData.categoriaById;
      categoriaForm.reset({
        id: String(categoria.id),
        nome: categoria.nome,
        descricao: categoria.descricao ?? '',
      });
    }
  }, [categoriaData, categoriaForm, categoriaId]);

  const handleSubmit: SubmitHandler<CategoriaFormValues> = async (values) => {
    setSubmitError(null);

    const payload = {
      nome: values.nome.trim(),
      descricao: values.descricao?.trim() || undefined,
    };

    try {
      const result =
        isEditing && categoriaId
          ? await updateCategoria({
              variables: {
                id: Number(categoriaId),
                input: payload,
              },
            })
          : await createCategoria({
              variables: { input: payload },
            });

      const mutationErrorMessage = getGraphQLErrorMessage(result.error);
      if (mutationErrorMessage) {
        setSubmitError(mutationErrorMessage);
        return;
      }

      navigate('/dashboard/categoria', {
        replace: true,
        state: {
          message: isEditing
            ? 'Categoria atualizada com sucesso!'
            : 'Categoria cadastrada com sucesso!',
        },
      });
    } catch (err) {
      setSubmitError(
        getGraphQLErrorMessage(err) ??
          'Não foi possível salvar a categoria. Verifique os dados e tente novamente.',
      );
    }
  };

  const isBusy = creating || updating || loadingCategoria;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard/categoria')}
          className="inline-flex items-center gap-2 text-[#696CFF] hover:text-[#384551] transition"
          type="button"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm font-medium">Voltar</span>
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-[#2B2C40]">
            {isEditing ? 'Editar categoria' : 'Cadastrar categoria'}
          </h1>
          <p className="mt-1 text-sm text-[#6C7287]">
            {isEditing
              ? 'Atualize o nome e a descrição da categoria.'
              : 'Informe o nome e, se quiser, uma descrição para a categoria.'}
          </p>
        </div>
      </div>

      <section className="dashboard-card rounded-[28px] border p-6 shadow-xl">
        <FormErrorAlert message={submitError} />

        <form onSubmit={categoriaForm.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <LabeledInput
              name="nome"
              label="Nome"
              registration={categoriaForm.register('nome', {
                required: 'Nome é obrigatório',
              })}
              error={categoriaForm.formState.errors.nome}
            />
            <LabeledInput
              name="descricao"
              label="Descrição"
              registration={categoriaForm.register('descricao')}
              error={categoriaForm.formState.errors.descricao}
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button type="submit" disabled={isBusy} className="rounded-3xl px-5 py-3">
              {isBusy ? 'Salvando...' : isEditing ? 'Atualizar categoria' : 'Cadastrar categoria'}
            </Button>
            <Button
              type="button"
              onClick={() => navigate('/dashboard/categoria')}
              className="rounded-3xl border border-slate-200 bg-white text-[#2B2C40] hover:bg-[#F4F6FA] px-5 py-3"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
