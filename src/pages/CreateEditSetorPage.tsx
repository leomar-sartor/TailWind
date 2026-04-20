import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client/react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import {
  CREATE_SETOR_MUTATION,
  UPDATE_SETOR_MUTATION,
} from '../graphql/mutations/setor.mutations';
import { GET_SETOR_BY_ID } from '../graphql/queries/setor.queries';

type SetorFormValues = {
  id?: string;
  nome: string;
  descricao: string;
};

const PAGE_SIZE = 10;
const EMPRESA_ID = 2;

export function CreateEditSetorPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setorId = searchParams.get('id');
  const isEditing = !!setorId;

  const setorForm = useForm<SetorFormValues>({
    defaultValues: { id: '', nome: '', descricao: '' },
  });

  const [createSetor, { loading: creating }] = useMutation(CREATE_SETOR_MUTATION);
  const [updateSetor, { loading: updating }] = useMutation(UPDATE_SETOR_MUTATION);

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
    }
  }, [setorData, setorForm, setorId]);

  const handleSubmit: SubmitHandler<SetorFormValues> = async (values) => {
    const payload = {
      nome: values.nome.trim(),
      descricao: values.descricao.trim(),
    };

    try {
      if (isEditing && setorId) {
        await updateSetor({
          variables: {
            id: Number(setorId),
            input: payload,
          },
        });
        // Navegar para SetorPage com mensagem de sucesso
        navigate('/dashboard/setor', {
          replace: true,
          state: { message: 'Setor atualizado com sucesso!' },
        });
      } else {
        await createSetor({
          variables: {
            empresaId: EMPRESA_ID,
            input: payload,
          },
        });
        // Navegar para SetorPage com mensagem de sucesso
        navigate('/dashboard/setor', {
          replace: true,
          state: { message: 'Setor cadastrado com sucesso!' },
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const isBusy = creating || updating || loadingSetor;

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
          <form className="space-y-6" onSubmit={setorForm.handleSubmit(handleSubmit)}>
            <div className="space-y-4">
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
