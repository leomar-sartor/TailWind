import { useEffect, useState, type ChangeEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client/react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { CadastroFormActions, CadastroFormHeader } from '../../components/cadastro';
import { FormErrorAlert } from '../../components/FormErrorAlert';
import { LabeledInput } from '../../components/LabeledInput';
import {
  CREATE_EMPRESA_MUTATION,
  UPDATE_EMPRESA_MUTATION,
} from '../../graphql/Empresa/mutations';
import { GET_EMPRESA_BY_ID } from '../../graphql/Empresa/queries';
import type {
  CreateEmpresaData,
  CreateEmpresaVars,
  GetEmpresaByIdData,
  GetEmpresaByIdVars,
  UpdateEmpresaData,
  UpdateEmpresaVars,
} from '../../graphql/Empresa/types';
import { formatCnpj, stripCnpjMask } from '../../utils/cnpj';
import { getGraphQLErrorMessage } from '../../utils/confirmToast';

type EmpresaFormValues = {
  id?: string;
  cnpj: string;
  nomeFantasia: string;
  descricao?: string;
};

export function CreateEditEmpresaPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const empresaId = searchParams.get('id');
  const isEditing = !!empresaId;

  const empresaForm = useForm<EmpresaFormValues>({
    defaultValues: { id: '', cnpj: '', nomeFantasia: '', descricao: '' },
  });

  const [createEmpresa, { loading: creating }] = useMutation<CreateEmpresaData, CreateEmpresaVars>(
    CREATE_EMPRESA_MUTATION,
  );
  const [updateEmpresa, { loading: updating }] = useMutation<UpdateEmpresaData, UpdateEmpresaVars>(
    UPDATE_EMPRESA_MUTATION,
  );
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: empresaData, loading: loadingEmpresa, refetch } = useQuery<
    GetEmpresaByIdData,
    GetEmpresaByIdVars
  >(GET_EMPRESA_BY_ID, {
    variables: {
      id: Number(empresaId),
    },
    skip: !empresaId,
  });

  useEffect(() => {
    if (empresaId && refetch) {
      refetch({ id: Number(empresaId) });
    }
  }, [empresaId, refetch]);

  useEffect(() => {
    if (empresaData?.empresaById) {
      const empresa = empresaData.empresaById;
      empresaForm.reset({
        id: String(empresa.id),
        cnpj: formatCnpj(empresa.cnpj),
        nomeFantasia: empresa.nomeFantasia,
        descricao: empresa.descricao ?? '',
      });
    }
  }, [empresaData, empresaForm, empresaId]);

  const handleCnpjChange = (event: ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCnpj(event.target.value);
    empresaForm.setValue('cnpj', formatted, { shouldValidate: true, shouldDirty: true });
  };

  const handleSubmit: SubmitHandler<EmpresaFormValues> = async (values) => {
    setSubmitError(null);

    const payload = {
      cnpj: stripCnpjMask(values.cnpj.trim()),
      nomeFantasia: values.nomeFantasia.trim(),
      descricao: values.descricao?.trim(),
    };

    try {
      const result =
        isEditing && empresaId
          ? await updateEmpresa({
              variables: {
                id: Number(empresaId),
                input: payload,
              },
            })
          : await createEmpresa({
              variables: {
                input: payload,
              },
            });

      const mutationErrorMessage = getGraphQLErrorMessage(result.error);

      if (mutationErrorMessage) {
        setSubmitError(mutationErrorMessage);
        return;
      }

      navigate('/dashboard/empresa', {
        replace: true,
        state: {
          message: isEditing
            ? 'Empresa atualizada com sucesso!'
            : 'Empresa cadastrada com sucesso!',
        },
      });
    } catch (err) {
      const message =
        getGraphQLErrorMessage(err) ?? 'Não foi possível salvar a empresa. Tente novamente.';
      setSubmitError(message);
      console.error(err);
    }
  };

  const isBusy = creating || updating || loadingEmpresa;
  const goBack = () => navigate('/dashboard/empresa');

  return (
    <div className="space-y-6">
      <CadastroFormHeader
        title={isEditing ? 'Editar empresa' : 'Cadastrar nova empresa'}
        description={
          isEditing
            ? 'Atualize as informações da empresa.'
            : 'Preencha o formulário abaixo para criar uma nova empresa.'
        }
        onBack={goBack}
      />

      <section className="dashboard-card rounded-[28px] border p-6 shadow-xl">
        <FormErrorAlert message={submitError} />

        <form className="space-y-6" onSubmit={empresaForm.handleSubmit(handleSubmit)}>
          <div className="space-y-4">
            <LabeledInput
              name="nomeFantasia"
              label="Nome fantasia"
              required
              registration={empresaForm.register('nomeFantasia', {
                required: 'Nome fantasia obrigatório',
              })}
              error={empresaForm.formState.errors.nomeFantasia}
            />
            <LabeledInput
              name="cnpj"
              label="CNPJ"
              required
              registration={empresaForm.register('cnpj', {
                required: 'CNPJ obrigatório',
                onChange: handleCnpjChange,
              })}
              error={empresaForm.formState.errors.cnpj}
            />
            <LabeledInput
              name="descricao"
              label="Descrição da empresa"
              registration={empresaForm.register('descricao')}
              error={empresaForm.formState.errors.descricao}
            />
          </div>

          <CadastroFormActions
            submitLabel={isEditing ? 'Atualizar' : 'Cadastrar'}
            isBusy={isBusy}
            onCancel={goBack}
          />
        </form>
      </section>
    </div>
  );
}
