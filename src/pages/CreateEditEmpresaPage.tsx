import { useEffect, type ChangeEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client/react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import {
  CREATE_EMPRESA_MUTATION,
  UPDATE_EMPRESA_MUTATION,
} from '../graphql/mutations/empresa.mutations';
import { GET_EMPRESA_BY_ID } from '../graphql/queries/empresa.queries';
import { formatCnpj, stripCnpjMask } from '../utils/cnpj';

type EmpresaFormValues = {
  id?: string;
  cnpj: string;
  nomeFantasia: string;
  descricao?: string;
};

type GetEmpresaByIdData = {
  empresaById: {
    id: string;
    cnpj: string;
    nomeFantasia: string;
    descricao?: string | null;
  } | null;
};

type GetEmpresaByIdVars = {
  id: number;
};

export function CreateEditEmpresaPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const empresaId = searchParams.get('id');
  const isEditing = !!empresaId;

  const empresaForm = useForm<EmpresaFormValues>({
    defaultValues: { id: '', cnpj: '', nomeFantasia: '', descricao: '' },
  });

  const [createEmpresa, { loading: creating }] = useMutation(CREATE_EMPRESA_MUTATION);
  const [updateEmpresa, { loading: updating }] = useMutation(UPDATE_EMPRESA_MUTATION);

  // Buscar dados da empresa se for edição
  const { data: empresaData, loading: loadingEmpresa, refetch } = useQuery<GetEmpresaByIdData, GetEmpresaByIdVars>(
    GET_EMPRESA_BY_ID,
    {
      variables: {
        id: Number(empresaId),
      },
      skip: !empresaId,
    }
  );

  // Refetch quando o ID mudar
  useEffect(() => {
    if (empresaId && refetch) {
      refetch({ id: Number(empresaId) });
    }
  }, [empresaId, refetch]);

  // Preencher formulário com dados da empresa ao carregar
  useEffect(() => {
    if (empresaData?.empresaById) {
      const empresa = empresaData.empresaById;
      empresaForm.reset({
        id: empresa.id,
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
    const payload = {
      cnpj: stripCnpjMask(values.cnpj.trim()),
      nomeFantasia: values.nomeFantasia.trim(),
      descricao: values.descricao?.trim(),
    };

    try {
      if (isEditing && empresaId) {
        await updateEmpresa({
          variables: {
            id: Number(empresaId),
            input: payload,
          },
        });
        // Navegar para EmpresaPage com mensagem de sucesso
        navigate('/dashboard/empresa', {
          replace: true,
          state: { message: 'Empresa atualizada com sucesso!' },
        });
      } else {
        await createEmpresa({
          variables: {
            input: payload,
          },
        });
        // Navegar para EmpresaPage com mensagem de sucesso
        navigate('/dashboard/empresa', {
          replace: true,
          state: { message: 'Empresa cadastrada com sucesso!' },
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const isBusy = creating || updating || loadingEmpresa;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard/empresa')}
          className="inline-flex items-center gap-2 text-[#696CFF] hover:text-[#384551] transition"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm font-medium">Voltar</span>
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-[#2B2C40]">
            {isEditing ? 'Editar empresa' : 'Cadastrar nova empresa'}
          </h1>
          <p className="mt-1 text-sm text-[#6C7287]">
            {isEditing
              ? 'Atualize as informações da empresa.'
              : 'Preencha o formulário abaixo para criar uma nova empresa.'}
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div>
        <article className="dashboard-card rounded-[28px] border p-6 shadow-xl">
          <form className="space-y-6" onSubmit={empresaForm.handleSubmit(handleSubmit)}>
            <div className="space-y-4">
              <Input
                name="nomeFantasia"
                placeholder="Nome fantasia"
                registration={empresaForm.register('nomeFantasia', {
                  required: 'Nome fantasia obrigatório',
                })}
                error={empresaForm.formState.errors.nomeFantasia}
              />
              <Input
                name="cnpj"
                placeholder="CNPJ"
                registration={empresaForm.register('cnpj', {
                  required: 'CNPJ obrigatório',
                  onChange: handleCnpjChange,
                })}
                error={empresaForm.formState.errors.cnpj}
              />
              <Input
                name="descricao"
                placeholder="Descrição da empresa"
                registration={empresaForm.register('descricao', {
                })}
                error={empresaForm.formState.errors.descricao}
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                onClick={() => navigate('/dashboard/empresa')}
                className="rounded-3xl border border-slate-200 bg-white text-[#2B2C40] hover:bg-[#F4F6FA] px-5 py-3"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isBusy}
                className="rounded-3xl px-5 py-3"
              >
                {isBusy ? 'Salvando...' : isEditing ? 'Atualizar' : 'Cadastrar'}
              </Button>
            </div>
          </form>
        </article>
      </div>
    </div>
  );
}
