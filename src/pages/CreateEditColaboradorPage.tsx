import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client/react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { SelectWithSearch, SelectItem } from '../components/Select/SelectWithSearch';
import { GET_COLABORADOR_BY_ID } from '../graphql/queries/colaborador.queries';
import { GET_EMPRESAS_PAGINATED, GET_SETORS } from '../graphql/queries/setor.queries';
import { CREATE_COLABORADOR_MUTATION, UPDATE_COLABORADOR_MUTATION } from '../graphql/mutations/colaborador.mutations';

type ColaboradorFormValues = {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  empresaId: string;
  setorId: string;
  ativo: string;
};

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
      nodes: Array<{ id: string | number; razaoSocial: string }>;
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
        where: empresasSearchQuery ? { razaoSocial: { contains: empresasSearchQuery } } : null,
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

  // Atualizar items quando dados chegam
  useEffect(() => {
    if (empresasData?.empresas?.nodes) {
      const items = empresasData.empresas.nodes.map((emp: any) => ({
        id: emp.id,
        label: emp.razaoSocial,
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
          where: empresasSearchQuery ? { razaoSocial: { contains: empresasSearchQuery } } : null,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          const newItems = fetchMoreResult.empresas.nodes.map((emp: any) => ({
            id: emp.id,
            label: emp.razaoSocial,
          }));
          setEmpresasItems((prev) => [...prev, ...newItems]);
          return fetchMoreResult;
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
          const newItems = fetchMoreResult.setores.nodes.map((setor: any) => ({
            id: setor.id,
            label: setor.nome,
          }));
          setSetoresItems((prev) => [...prev, ...newItems]);
          return fetchMoreResult;
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

  useEffect(() => {
    if (colaboradorData?.colaboradorById) {
      const colaborador = colaboradorData.colaboradorById;
      colaboradorForm.reset({
        id: colaborador.id,
        nome: colaborador.nome,
        cpf: colaborador.cpf,
        email: colaborador.email,
        empresaId: String(colaborador.empresaId),
        setorId: String(colaborador.setorId),
      });
      setSelectedEmpresaId(colaborador.empresaId);
      setSelectedSetorId(colaborador.setorId);
    }
  }, [colaboradorData, colaboradorForm, colaboradorId]);

  const handleSubmit: SubmitHandler<ColaboradorFormValues> = async (values) => {
    try {
      const input = {
        nome: values.nome,
        cpf: values.cpf,
        email: values.email,
        empresaId: Number(values.empresaId),
        setorId: Number(values.setorId),
      };

      if (colaboradorId) {
        await updateColaborador({
          variables: {
            id: Number(colaboradorId),
            input,
          },
        });
      } else {
        await createColaborador({
          variables: { input },
        });
      }

      navigate('/dashboard/colaboradores');
    } catch (err) {
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
        <form onSubmit={colaboradorForm.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              name="nome"
              placeholder="Nome completo"
              registration={colaboradorForm.register('nome', {
                required: 'Nome obrigatório',
              })}
              error={colaboradorForm.formState.errors.nome}
            />
            <Input
              name="cpf"
              placeholder="CPF"
              registration={colaboradorForm.register('cpf', {
                required: 'CPF obrigatório',
              })}
              error={colaboradorForm.formState.errors.cpf}
            />
            <Input
              name="email"
              placeholder="E-mail"
              registration={colaboradorForm.register('email', {
                required: 'E-mail obrigatório',
              })}
              error={colaboradorForm.formState.errors.email}
            />
            <SelectWithSearch
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
            <SelectWithSearch
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
            <Select
              name="ativo"
              registration={colaboradorForm.register('ativo', {
                required: 'Informe se está ativo',
              })}
              error={colaboradorForm.formState.errors.ativo}
            >
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </Select>
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