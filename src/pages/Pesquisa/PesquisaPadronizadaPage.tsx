import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client/react';
import { Check, CirclePlus, Send, X } from 'lucide-react';
import { Button } from '../../components/Button';
import { FormErrorAlert } from '../../components/FormErrorAlert';
import { useActiveContext } from '../../auth/ActiveContext';
import { GET_CATEGORIAS_OPTIONS } from '../../graphql/Categoria/queries';
import type { GetCategoriasOptionsData, GetCategoriasOptionsVars } from '../../graphql/Categoria/types';
import { GET_EMPRESAS } from '../../graphql/Empresa/queries';
import type { GetEmpresasData, GetEmpresasVars } from '../../graphql/Empresa/types';
import {
  CREATE_PESQUISA_PADRONIZADA,
  DISPARAR_PESQUISA_PADRONIZADA,
  GET_COLABORADORES_DA_EMPRESA_ATIVA,
  GET_PESQUISA_PADRONIZADA_BY_ID,
  UPDATE_PESQUISA_PADRONIZADA,
  type StandardSurveyNode,
  type GetColaboradoresDaEmpresaAtivaData,
  type StandardQuestionInput,
  type StandardSurveyInput,
} from '../../graphql/Pesquisa/padronizadas';
import { getGraphQLErrorMessage } from '../../utils/confirmToast';
import { PesquisaPadronizadaListPage } from './PesquisaPadronizadaListPage';
import { CadastroFormHeader } from '../../components/cadastro';

const EMPTY_QUESTION: StandardQuestionInput = { titulo: '', obrigatoria: true, categoriaId: 0 };
const RESPONSE_OPTIONS = ['Nunca', 'Raramente', 'Algumas Vezes', 'Frequente', 'Muito Frequente'];

const EMPTY_FORM: StandardSurveyInput = {
  nome: '',
  dataInicial: null,
  dataFinal: null,
  empresaIds: [],
  questoes: [{ ...EMPTY_QUESTION }],
};

export function PesquisaPadronizadaPage() {
  const location = useLocation();
  return location.pathname.endsWith('/create') ? <PesquisaPadronizadaForm /> : <PesquisaPadronizadaListPage />;
}

export function PesquisaPadronizadaForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editingId = searchParams.get('id') ? Number(searchParams.get('id')) : null;
  const { activeContext } = useActiveContext();
  const [form, setForm] = useState<StandardSurveyInput>(EMPTY_FORM);
  const [dispatchingSurveyId, setDispatchingSurveyId] = useState<string | null>(searchParams.get('disparar'));
  const [selectedCollaboratorIds, setSelectedCollaboratorIds] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: surveyData, loading: loadingSurvey, error: surveyError } = useQuery<{ pesquisaPadronizadaById: StandardSurveyNode | null }>(
    GET_PESQUISA_PADRONIZADA_BY_ID,
    { variables: { id: editingId }, skip: !editingId, fetchPolicy: 'network-only' },
  );
  const { data: categoryData, error: categoryError } = useQuery<GetCategoriasOptionsData, GetCategoriasOptionsVars>(
    GET_CATEGORIAS_OPTIONS,
    { variables: { first: 50 }, fetchPolicy: 'cache-and-network' },
  );
  const { data: companyData, error: companyError } = useQuery<GetEmpresasData, GetEmpresasVars>(
    GET_EMPRESAS,
    { variables: { first: 50 }, fetchPolicy: 'cache-and-network' },
  );
  const { data: collaboratorData, loading: loadingCollaborators, error: collaboratorError } = useQuery<GetColaboradoresDaEmpresaAtivaData>(
    GET_COLABORADORES_DA_EMPRESA_ATIVA,
    {
      variables: { first: 50 },
      skip: !dispatchingSurveyId,
      fetchPolicy: 'network-only',
    },
  );

  const [createSurvey, { loading: creating }] = useMutation(CREATE_PESQUISA_PADRONIZADA);
  const [updateSurvey, { loading: updating }] = useMutation(UPDATE_PESQUISA_PADRONIZADA);
  const [dispatchSurvey, { loading: dispatching }] = useMutation(DISPARAR_PESQUISA_PADRONIZADA);

  const categories = categoryError ? [] : categoryData?.categorias?.nodes ?? [];
  const companies = companyError ? [] : companyData?.empresas?.nodes ?? [];
  const busy = creating || updating || dispatching || loadingSurvey;
  const collaborators = collaboratorError ? [] : collaboratorData?.colaboradores?.nodes ?? [];

  function updateQuestion(index: number, patch: Partial<StandardQuestionInput>) {
    setForm((current) => ({
      ...current,
      questoes: current.questoes.map((question, questionIndex) =>
        questionIndex === index ? { ...question, ...patch } : question),
    }));
  }

  useEffect(() => {
    const survey = surveyData?.pesquisaPadronizadaById;
    if (!survey || survey.publicadaEm) return;
    setForm({
      nome: survey.nome,
      dataInicial: survey.dataInicial?.slice(0, 10) ?? null,
      dataFinal: survey.dataFinal?.slice(0, 10) ?? null,
      empresaIds: survey.empresasVinculadas.map((link) => Number(link.empresa.id)),
      questoes: survey.questoes.map((question) => ({
        titulo: question.titulo,
        obrigatoria: true,
        categoriaId: Number(question.categoria?.id ?? 0),
      })),
    });
  }, [surveyData]);

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    if (!form.nome.trim() || form.empresaIds.length === 0 || form.questoes.length === 0
      || form.questoes.some((question) => !question.titulo.trim() || !question.categoriaId)) {
      setErrorMessage('Informe nome, empresas, pergunta e categoria para cada item.');
      return;
    }

    const input: StandardSurveyInput = {
      ...form,
      nome: form.nome.trim(),
      dataInicial: form.dataInicial ? new Date(`${form.dataInicial}T00:00:00`).toISOString() : null,
      dataFinal: form.dataFinal ? new Date(`${form.dataFinal}T23:59:59`).toISOString() : null,
      questoes: form.questoes.map((question) => ({ ...question, titulo: question.titulo.trim() })),
    };

    try {
      const result = editingId
        ? await updateSurvey({ variables: { id: editingId, input } })
        : await createSurvey({ variables: { input } });
      const message = getGraphQLErrorMessage(result.error);
      if (message) {
        setErrorMessage(message);
        return;
      }

      setForm(EMPTY_FORM);
      navigate('/dashboard/pesquisa-padronizada', { state: { message: 'Pesquisa salva com sucesso!' } });
    } catch (error: unknown) {
      setErrorMessage(getGraphQLErrorMessage(error) ?? 'Não foi possível salvar a pesquisa padronizada.');
    }
  }

  async function handleDispatch() {
    if (!dispatchingSurveyId || selectedCollaboratorIds.length === 0) {
      setErrorMessage('Selecione ao menos um colaborador.');
      return;
    }
    if (!activeContext.companyId) {
      setErrorMessage('Selecione uma empresa no contexto ativo antes de disparar.');
      return;
    }

    setErrorMessage(null);
    try {
      const result = await dispatchSurvey({
        variables: {
          pesquisaId: Number(dispatchingSurveyId),
          colaboradorIds: selectedCollaboratorIds.map(Number),
        },
      });
      const message = getGraphQLErrorMessage(result.error);
      if (message) {
        setErrorMessage(message);
        return;
      }

      setDispatchingSurveyId(null);
      setSelectedCollaboratorIds([]);
      navigate('/dashboard/pesquisa-padronizada', { state: { message: 'Pesquisa disponibilizada aos colaboradores.' } });
    } catch (error: unknown) {
      setErrorMessage(getGraphQLErrorMessage(error) ?? 'Não foi possível disparar a pesquisa.');
    }
  }

  return (
    <div className="space-y-6">
      <CadastroFormHeader title="Pesquisas padronizadas" description="Escala fixa de frequência · 1 a 5" onBack={() => navigate('/dashboard/pesquisa-padronizada')} />
      <FormErrorAlert message={surveyError ? getGraphQLErrorMessage(surveyError) ?? 'Não foi possível carregar a pesquisa.' : null} />
      {editingId && !loadingSurvey && !surveyData?.pesquisaPadronizadaById && <p>Pesquisa não encontrada no contexto ativo.</p>}
      {editingId && surveyData?.pesquisaPadronizadaById?.publicadaEm && <p>Pesquisas publicadas não podem ser editadas.</p>}
      {!dispatchingSurveyId && (!editingId || (!!surveyData?.pesquisaPadronizadaById && !surveyData.pesquisaPadronizadaById.publicadaEm)) && <section className="dashboard-card border p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h3 className="text-lg font-semibold dashboard-text">{editingId ? 'Editar rascunho' : 'Nova pesquisa'}</h3>
          {editingId && (
            <Button type="button" onClick={() => navigate('/dashboard/pesquisa-padronizada')}>
              <X className="h-4 w-4" /> Cancelar edição
            </Button>
          )}
        </div>

        <FormErrorAlert message={errorMessage} />
        <FormErrorAlert message={categoryError ? getGraphQLErrorMessage(categoryError) ?? 'Não foi possível carregar as categorias.' : null} />
        <FormErrorAlert message={companyError ? getGraphQLErrorMessage(companyError) ?? 'Não foi possível carregar as empresas.' : null} />
        <form className="mt-5 space-y-6" onSubmit={handleSave}>
          <div className="grid gap-4 md:grid-cols-3">
            <label className="md:col-span-3">
              <span className="mb-1 block text-sm font-medium dashboard-text">Nome</span>
              <input className="w-full border dashboard-border bg-white px-3 py-2 dark:bg-[var(--color-surface-soft)]" value={form.nome} onChange={(event) => setForm((current) => ({ ...current, nome: event.target.value }))} required />
            </label>
            <label>
              <span className="mb-1 block text-sm font-medium dashboard-text">Início</span>
              <input type="date" className="w-full border dashboard-border bg-white px-3 py-2 dark:bg-[var(--color-surface-soft)]" value={form.dataInicial ?? ''} onChange={(event) => setForm((current) => ({ ...current, dataInicial: event.target.value || null }))} />
            </label>
            <label>
              <span className="mb-1 block text-sm font-medium dashboard-text">Término</span>
              <input type="date" className="w-full border dashboard-border bg-white px-3 py-2 dark:bg-[var(--color-surface-soft)]" value={form.dataFinal ?? ''} onChange={(event) => setForm((current) => ({ ...current, dataFinal: event.target.value || null }))} />
            </label>
            <label className="md:col-span-3">
              <span className="mb-1 block text-sm font-medium dashboard-text">Empresas vinculadas</span>
              <select multiple className="min-h-28 w-full border dashboard-border bg-white px-3 py-2 dark:bg-[var(--color-surface-soft)]" value={form.empresaIds.map(String)} onChange={(event) => setForm((current) => ({ ...current, empresaIds: Array.from(event.target.selectedOptions, (option) => Number(option.value)) }))}>
                {companies.map((company) => <option key={company.id} value={company.id}>{company.nomeFantasia || company.cnpj}</option>)}
              </select>
            </label>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h4 className="font-semibold dashboard-text">Perguntas</h4>
              <Button type="button" onClick={() => setForm((current) => ({ ...current, questoes: [...current.questoes, { ...EMPTY_QUESTION }] }))}>
                <CirclePlus className="h-4 w-4" /> Adicionar pergunta
              </Button>
            </div>
            {form.questoes.map((question, index) => (
              <fieldset key={index} className="grid gap-3 border dashboard-border p-4 md:grid-cols-[1fr_15rem_auto]">
                <label>
                  <span className="mb-1 block text-sm font-medium dashboard-text">Pergunta {index + 1}</span>
                  <textarea className="min-h-20 w-full border dashboard-border bg-white px-3 py-2 dark:bg-[var(--color-surface-soft)]" value={question.titulo} onChange={(event) => updateQuestion(index, { titulo: event.target.value })} required />
                </label>
                <label>
                  <span className="mb-1 block text-sm font-medium dashboard-text">Categoria</span>
                  <select className="w-full border dashboard-border bg-white px-3 py-2 dark:bg-[var(--color-surface-soft)]" value={question.categoriaId || ''} onChange={(event) => updateQuestion(index, { categoriaId: Number(event.target.value) })} required>
                    <option value="" disabled>Selecione</option>
                    {categories.map((category) => <option key={category.id} value={category.id}>{category.nome}</option>)}
                  </select>
                </label>
                <button type="button" aria-label={`Remover pergunta ${index + 1}`} className="self-end border dashboard-border p-2 text-rose-600 disabled:opacity-40" disabled={form.questoes.length <= 1} onClick={() => setForm((current) => ({ ...current, questoes: current.questoes.filter((_, questionIndex) => questionIndex !== index) }))}>
                  <X className="h-4 w-4" />
                </button>
              </fieldset>
            ))}
          </div>

          <fieldset className="border dashboard-border p-4">
            <legend className="px-2 text-sm font-semibold dashboard-text">Alternativas fixas</legend>
            <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
              {RESPONSE_OPTIONS.map((option, index) => (
                <li key={option} className="flex items-center gap-2 text-sm dashboard-text"><span className="inline-grid h-6 w-6 place-items-center border dashboard-border text-xs">{index + 1}</span>{option}</li>
              ))}
            </ol>
          </fieldset>

          <div className="flex justify-end">
            <Button type="submit" disabled={busy}>
              <Check className="h-4 w-4" /> {busy ? 'Salvando...' : editingId ? 'Salvar alterações' : 'Salvar rascunho'}
            </Button>
          </div>
        </form>
      </section>}

      {dispatchingSurveyId && (
        <section className="dashboard-card border p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold dashboard-text">Selecionar destinatários</h3>
              <p className="mt-1 text-sm dashboard-text-muted">A lista contém somente colaboradores autorizados da empresa ativa.</p>
            </div>
            <button type="button" aria-label="Fechar seleção de destinatários" className="border dashboard-border p-2" onClick={() => navigate('/dashboard/pesquisa-padronizada')}><X className="h-4 w-4" /></button>
          </div>
          <select
            multiple
            aria-label="Colaboradores destinatários"
            className="mt-4 min-h-44 w-full border dashboard-border bg-white px-3 py-2 dark:bg-[var(--color-surface-soft)]"
            value={selectedCollaboratorIds}
            onChange={(event) => setSelectedCollaboratorIds(Array.from(event.target.selectedOptions, (option) => option.value))}
          >
            {collaborators.map((collaborator) => <option key={collaborator.id} value={collaborator.id}>{collaborator.nome} · {collaborator.email}</option>)}
          </select>
          <FormErrorAlert message={collaboratorError ? getGraphQLErrorMessage(collaboratorError) ?? 'Não foi possível carregar os colaboradores.' : null} />
          {loadingCollaborators && <p className="mt-2 text-sm dashboard-text-muted">Carregando colaboradores...</p>}
          {!loadingCollaborators && collaborators.length === 0 && <p className="mt-2 text-sm dashboard-text-muted">Nenhum colaborador ativo está vinculado à empresa atual.</p>}
          <div className="mt-4 flex justify-end">
            <Button type="button" disabled={busy || selectedCollaboratorIds.length === 0} onClick={() => void handleDispatch()}>
              <Send className="h-4 w-4" /> {dispatching ? 'Disparando...' : `Disparar para ${selectedCollaboratorIds.length}`}
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
