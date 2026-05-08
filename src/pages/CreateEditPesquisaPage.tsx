import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client/react';
import { useFieldArray, useForm, SubmitHandler } from 'react-hook-form';
import { ArrowLeft, PlusCircle, Plus, Trash2 } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { CREATE_PESQUISA_MUTATION, UPDATE_PESQUISA_MUTATION } from '../graphql/mutations/pesquisa.mutations';
import { GET_PESQUISA_BY_ID } from '../graphql/queries/pesquisa.queries';

type QuestaoForm = {
  titulo: string;
  tipo: 'TEXTO' | 'OPCAO';
  obrigatoria: boolean;
  multiplasRespostas: boolean;
  maximoDeCaracteres: string;
  opcoes: Array<{ ordem: number; descricao: string }>;
};

type PesquisaFormValues = {
  nome: string;
  dataInicial: string;
  dataFinal: string;
  questoes: QuestaoForm[];
};

const defaultQuestao: QuestaoForm = {
  titulo: '',
  tipo: 'TEXTO',
  obrigatoria: true,
  multiplasRespostas: false,
  maximoDeCaracteres: '',
  opcoes: [{ ordem: 1, descricao: '' }],
};

export function CreateEditPesquisaPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const pesquisaId = searchParams.get('id');
  const isEditing = !!pesquisaId;

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const pesquisaForm = useForm<PesquisaFormValues>({
    defaultValues: {
      nome: '',
      dataInicial: '',
      dataFinal: '',
      questoes: [{ ...defaultQuestao }],
    },
  });

  const { control, register, handleSubmit, watch, setValue, reset, formState } = pesquisaForm;
  const questoes = watch('questoes');

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questoes',
  });

  const [createPesquisa, { loading: creating }] = useMutation(CREATE_PESQUISA_MUTATION);
  const [updatePesquisa, { loading: updating }] = useMutation(UPDATE_PESQUISA_MUTATION);

  // Buscar dados da pesquisa se for edição
  const { data: pesquisaData, loading: loadingPesquisa, refetch } = useQuery<{
    pesquisaById: {
      id: string;
      nome: string;
      dataInicial: string;
      dataFinal: string;
      questoes: Array<{
        id: string;
        titulo: string;
        tipo: string;
        obrigatoria: boolean;
        multiplasRespostas: boolean;
        maximoDeCaracteres: number | null;
        opcoes: Array<{
          id: string;
          ordem: number;
          descricao: string;
        }>;
      }>;
    };
  }>(
    GET_PESQUISA_BY_ID,
    {
      variables: {
        id: Number(pesquisaId),
      },
      skip: !pesquisaId,
    }
  );

  // Refetch quando o ID mudar
  useEffect(() => {
    if (pesquisaId && refetch) {
      refetch({ id: Number(pesquisaId) });
    }
  }, [pesquisaId, refetch]);

  // Preencher formulário com dados da pesquisa ao carregar
  useEffect(() => {
    if (pesquisaData?.pesquisaById) {
      const pesquisa = pesquisaData.pesquisaById;
      pesquisaForm.reset({
        nome: pesquisa.nome,
        dataInicial: pesquisa.dataInicial.slice(0, 16), // Converter ISO para datetime-local
        dataFinal: pesquisa.dataFinal.slice(0, 16),
        questoes: pesquisa.questoes.map((q: any) => ({
          titulo: q.titulo,
          tipo: q.tipo,
          obrigatoria: q.obrigatoria,
          multiplasRespostas: q.multiplasRespostas,
          maximoDeCaracteres: q.maximoDeCaracteres ? String(q.maximoDeCaracteres) : '',
          opcoes: q.opcoes.map((op: any) => ({
            ordem: op.ordem,
            descricao: op.descricao,
          })),
        })),
      });
    }
  }, [pesquisaData, pesquisaForm, pesquisaId]);

  const addQuestao = () => {
    append({ ...defaultQuestao });
  };

  const removeQuestao = (index: number) => {
    if (fields.length <= 1) return;
    remove(index);
  };

  const addOpcao = (questaoIndex: number) => {
    const opcoes = questoes?.[questaoIndex]?.opcoes ?? [];
    setValue(`questoes.${questaoIndex}.opcoes` as const, [...opcoes, { ordem: opcoes.length + 1, descricao: '' }], {
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  const removeOpcao = (questaoIndex: number, optionIndex: number) => {
    const opcoes = questoes?.[questaoIndex]?.opcoes ?? [];
    if (opcoes.length <= 1) return;
    const updated = opcoes.filter((_, index) => index !== optionIndex).map((item, index) => ({
      ordem: index + 1,
      descricao: item.descricao,
    }));
    setValue(`questoes.${questaoIndex}.opcoes` as const, updated, {
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  const handleSubmitPesquisa: SubmitHandler<PesquisaFormValues> = async (values) => {
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const payload = {
        nome: values.nome.trim(),
        dataInicial: new Date(values.dataInicial).toISOString(),
        dataFinal: new Date(values.dataFinal).toISOString(),
        questoes: values.questoes.map((questao) => ({
          titulo: questao.titulo.trim(),
          tipo: questao.tipo,
          obrigatoria: questao.obrigatoria,
          multiplasRespostas: questao.multiplasRespostas,
          maximoDeCaracteres:
            questao.tipo === 'TEXTO' && questao.maximoDeCaracteres
              ? Number(questao.maximoDeCaracteres)
              : null,
          ...(questao.tipo === 'OPCAO'
            ? {
                opcoes: questao.opcoes.map((opcao, index) => ({
                  ordem: index + 1,
                  descricao: opcao.descricao.trim(),
                })),
              }
            : {}),
        })),
      };

      if (isEditing && pesquisaId) {
        await updatePesquisa({
          variables: {
            id: Number(pesquisaId),
            input: payload,
          },
        });
        setSuccessMessage('Pesquisa atualizada com sucesso!');
        navigate('/dashboard/pesquisa', {
          replace: true,
          state: { message: 'Pesquisa atualizada com sucesso!' },
        });
      } else {
        await createPesquisa({
          variables: {
            input: payload,
          },
        });
        setSuccessMessage('Pesquisa cadastrada com sucesso!');
        reset({ nome: '', dataInicial: '', dataFinal: '', questoes: [{ ...defaultQuestao }] });
        navigate('/dashboard/pesquisa', {
          replace: true,
          state: { message: 'Pesquisa cadastrada com sucesso!' },
        });
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Não foi possível salvar a pesquisa. Verifique os dados e tente novamente.');
    }
  };

  const isBusy = creating || updating || loadingPesquisa;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard/pesquisa')}
          className="inline-flex items-center gap-2 text-[#696CFF] hover:text-[#384551] transition"
          type="button"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm font-medium">Voltar</span>
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-[#2B2C40]">
            {isEditing ? 'Editar pesquisa' : 'Cadastrar nova pesquisa'}
          </h1>
          <p className="mt-1 text-sm text-[#6C7287]">
            {isEditing
              ? 'Atualize as informações da pesquisa, suas perguntas e opções.'
              : 'Preencha o formulário abaixo para criar uma pesquisa com perguntas e opções.'}
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {errorMessage}
        </div>
      )}

      <article className="dashboard-card rounded-[28px] border p-6 shadow-xl">
        <form className="space-y-8" onSubmit={handleSubmit(handleSubmitPesquisa)}>
          <div className="grid gap-4 lg:grid-cols-3">
            <Input
              name="nome"
              placeholder="Nome da pesquisa"
              registration={register('nome', {
                required: 'Nome da pesquisa é obrigatório',
              })}
              error={formState.errors.nome}
            />
            <Input
              name="dataInicial"
              type="datetime-local"
              placeholder="Data inicial"
              registration={register('dataInicial', {
                required: 'Data inicial é obrigatória',
              })}
              error={formState.errors.dataInicial}
            />
            <Input
              name="dataFinal"
              type="datetime-local"
              placeholder="Data final"
              registration={register('dataFinal', {
                required: 'Data final é obrigatória',
              })}
              error={formState.errors.dataFinal}
            />
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#2B2C40]">Questões</h2>
                <p className="mt-1 text-sm dashboard-text-muted">
                  Adicione todas as perguntas que farão parte da pesquisa.
                </p>
              </div>
              <Button
                type="button"
                onClick={addQuestao}
                className="rounded-3xl px-5 py-3 inline-flex items-center gap-2"
              >
                <PlusCircle className="h-4 w-4" />
                Adicionar questão
              </Button>
            </div>

            <div className="space-y-6">
              {fields.map((field, index) => {
                const questaoTipo = questoes?.[index]?.tipo ?? 'TEXTO';
                const opcoes = questoes?.[index]?.opcoes ?? [];

                return (
                  <section key={field.id} className="rounded-[28px] border border-slate-200 bg-[#FBFCFF] p-5 shadow-sm">
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-[#2B2C40]">Questão {index + 1}</p>
                        <p className="text-xs dashboard-text-muted">Configure título, tipo e regras da pergunta.</p>
                      </div>
                      <Button
                        type="button"
                        onClick={() => removeQuestao(index)}
                        className="rounded-3xl border border-rose-200 bg-white text-rose-500 hover:bg-rose-50 px-4 py-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remover
                      </Button>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                      <Input
                        name={`questoes.${index}.titulo`}
                        placeholder="Título da questão"
                        registration={register(`questoes.${index}.titulo` as const, {
                          required: 'Título da questão é obrigatório',
                        })}
                        error={formState.errors.questoes?.[index]?.titulo as any}
                      />
                      <Select
                        name={`questoes.${index}.tipo`}
                        registration={register(`questoes.${index}.tipo` as const)}
                        error={formState.errors.questoes?.[index]?.tipo as any}
                      >
                        <option value="TEXTO">Texto</option>
                        <option value="OPCAO">Opção</option>
                      </Select>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <label className="inline-flex items-center gap-2 text-sm text-[#2B2C40]">
                        <input
                          type="checkbox"
                          {...register(`questoes.${index}.obrigatoria` as const)}
                          className="h-4 w-4 rounded border-slate-300 text-[#696CFF] focus:ring-[#696CFF]"
                        />
                        Obrigatória
                      </label>
                      <label className="inline-flex items-center gap-2 text-sm text-[#2B2C40]">
                        <input
                          type="checkbox"
                          {...register(`questoes.${index}.multiplasRespostas` as const)}
                          disabled={questaoTipo !== 'OPCAO'}
                          className="h-4 w-4 rounded border-slate-300 text-[#696CFF] focus:ring-[#696CFF] disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        Multiplas respostas
                      </label>
                      {questaoTipo === 'TEXTO' && (
                        <Input
                          name={`questoes.${index}.maximoDeCaracteres`}
                          type="number"
                          placeholder="Máximo de caracteres"
                          registration={register(`questoes.${index}.maximoDeCaracteres` as const, {
                            valueAsNumber: true,
                            validate: (value) =>
                              value === '' || Number(value) > 0 || 'Use um número maior que zero',
                          })}
                          error={formState.errors.questoes?.[index]?.maximoDeCaracteres as any}
                        />
                      )}
                    </div>

                    {questaoTipo === 'OPCAO' && (
                      <div className="space-y-4 pt-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-[#2B2C40]">Opções</p>
                            <p className="text-xs dashboard-text-muted">Defina os valores que o usuário poderá escolher.</p>
                          </div>
                          <Button
                            type="button"
                            onClick={() => addOpcao(index)}
                            className="rounded-3xl px-4 py-2 inline-flex items-center gap-2"
                          >
                            <Plus className="h-4 w-4" />
                            Adicionar opção
                          </Button>
                        </div>

                        <div className="space-y-3">
                          {opcoes.map((_, optionIndex) => (
                            <div key={`${field.id}-opcao-${optionIndex}`} className="grid gap-3 md:grid-cols-[1fr_auto] items-end rounded-3xl border border-slate-200 bg-white p-4">
                              <Input
                                name={`questoes.${index}.opcoes.${optionIndex}.descricao`}
                                placeholder={`Opção ${optionIndex + 1}`}
                                registration={register(`questoes.${index}.opcoes.${optionIndex}.descricao` as const, {
                                  required: 'Descrição da opção é obrigatória',
                                })}
                                error={formState.errors.questoes?.[index]?.opcoes?.[optionIndex]?.descricao as any}
                              />
                              <div className="flex items-center gap-2">
                                <span className="rounded-3xl border border-slate-200 bg-[#F4F6FA] px-3 py-2 text-sm text-[#6C7287]">
                                  {optionIndex + 1}
                                </span>
                                <Button
                                  type="button"
                                  onClick={() => removeOpcao(index, optionIndex)}
                                  className="rounded-3xl border border-rose-200 bg-white text-rose-500 hover:bg-rose-50 px-4 py-2"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button
              type="submit"
              disabled={isBusy}
              className="rounded-3xl px-5 py-3"
            >
              {isBusy ? 'Salvando...' : isEditing ? 'Atualizar pesquisa' : 'Cadastrar pesquisa'}
            </Button>
            <Button
              type="button"
              onClick={() => navigate('/dashboard/pesquisa')}
              className="rounded-3xl border border-slate-200 bg-white text-[#2B2C40] hover:bg-[#F4F6FA] px-5 py-3"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </article>
    </div>
  );
}
