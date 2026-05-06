import { useMutation } from '@apollo/client/react';
import { ChevronLeft, ChevronRight, Send } from 'lucide-react';
import { Button } from '../../components/Button';

import {
  useSurveyStore,
  selectQuestaoAtual,
  selectProgresso,
  selectIsUltimaQuestao,
} from '../../store/surveyStore';
import {
  CREATE_RESPOSTA_MUTATION,
  AUTO_SAVE_PESQUISA_MUTATION,
  FINALIZAR_PESQUISA_MUTATION,
} from '../../graphql/mutations/pesquisa.mutations';
import headerImage from '@/assets/logos/LogoHeaderFormSample.png';

export function SurveyQuestion() {
  const token = useSurveyStore((s) => s.token);
  const pesquisa = useSurveyStore((s) => s.pesquisa);
  const questaoAtualIndex = useSurveyStore((s) => s.questaoAtualIndex);
  const questoesOrdenadas = useSurveyStore((s) => s.questoesOrdenadas);
  const respostas = useSurveyStore((s) => s.respostas);
  const isLoading = useSurveyStore((s) => s.isLoading);
  const error = useSurveyStore((s) => s.error);
  const setRespostaTexto = useSurveyStore((s) => s.setRespostaTexto);
  const setRespostaOpcao = useSurveyStore((s) => s.setRespostaOpcao);
  const avancar = useSurveyStore((s) => s.avancar);
  const voltar = useSurveyStore((s) => s.voltar);
  const setFinished = useSurveyStore((s) => s.setFinished);
  const setLoading = useSurveyStore((s) => s.setLoading);
  const setError = useSurveyStore((s) => s.setError);
  const getRespostasJson = useSurveyStore((s) => s.getRespostasJson);

  // ← Deriva localmente em vez de usar os selectors separados
  const questaoAtual = questoesOrdenadas[questaoAtualIndex] ?? null;
  const isUltima = questaoAtualIndex === questoesOrdenadas.length - 1;
  const progresso = {
    atual: questaoAtualIndex + 1,
    total: questoesOrdenadas.length,
    percentual: questoesOrdenadas.length
      ? Math.round(((questaoAtualIndex + 1) / questoesOrdenadas.length) * 100)
      : 0,
  };
  const respostaAtual = questaoAtual ? respostas[questaoAtual.id] : null;

  const [createResposta] = useMutation(CREATE_RESPOSTA_MUTATION);
  const [autoSave] = useMutation(AUTO_SAVE_PESQUISA_MUTATION);
  const [finalizarPesquisa] = useMutation(FINALIZAR_PESQUISA_MUTATION);

  if (!questaoAtual || !pesquisa)
    return null;

  // ── Validação local antes de avançar ────────────────────────────────────────
  function validarRespostaAtual(): string | null {
    if (!questaoAtual!.obrigatoria) return null;

    if (questaoAtual!.tipo === 'TEXTO') {
      if (!respostaAtual?.textoResposta?.trim()) {
        return 'Esta questão é obrigatória. Por favor, escreva sua resposta.';
      }
    }

    if (questaoAtual!.tipo === 'OPCAO') {
      if (!respostaAtual?.questaoOpcaoIds?.length) {
        return 'Esta questão é obrigatória. Por favor, selecione uma opção.';
      }
    }

    return null;
  }

  // ── Salvar resposta atual + autosave ─────────────────────────────────────────
  async function salvarEAvancar() {
    const erroValidacao = validarRespostaAtual();
    if (erroValidacao) {
      setError(erroValidacao);
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // 1. Envia a resposta da questão atual
      await createResposta({
        variables: {
          token,
          questaoId: Number(questaoAtual!.id),
          textoResposta: respostaAtual?.textoResposta ?? null,
          questaoOpcaoIds: respostaAtual?.questaoOpcaoIds?.map(Number) ?? null,
        },
      });

      // 2. Autosave do rascunho (progresso)
      await autoSave({
        variables: {
          token,
          ultimaQuestaoRespondidaId: Number(questaoAtual!.id),
          respostasParciais: getRespostasJson(),
        },
      });

      avancar();
    } catch (err: any) {
      const msg = err?.graphQLErrors?.[0]?.message ?? 'Erro ao salvar resposta. Tente novamente.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  // ── Finalizar pesquisa ──────────────────────────────────────────────────────
  async function handleFinalizar() {
    const erroValidacao = validarRespostaAtual();
    if (erroValidacao) {
      setError(erroValidacao);
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // 1. Salva a última resposta
      await createResposta({
        variables: {
          token,
          questaoId: Number(questaoAtual!.id),
          textoResposta: respostaAtual?.textoResposta ?? null,
          questaoOpcaoIds: respostaAtual?.questaoOpcaoIds?.map(Number) ?? null,
        },
      });

      // 2. Finaliza o convite
      await finalizarPesquisa({ variables: { token } });

      setFinished(true);
    } catch (err: any) {
      const msg = err?.graphQLErrors?.[0]?.message ?? 'Erro ao finalizar pesquisa. Tente novamente.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-bg)' }}>

      {/* Header */}
      <header className="dashboard-header border-b px-6 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <img src={headerImage} alt="Logo" className="h-10 object-contain" />
        <span className="text-sm text-[#6C7287]">{pesquisa.nome}</span>
      </header>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-[#E4E6E8]">
        <div
          className="h-full bg-[#696CFF] transition-all duration-500 ease-out"
          style={{ width: `${progresso.percentual}%` }}
        />
      </div>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-xl">

          {/* Progresso textual */}
          <p className="text-xs text-[#8592A3] mb-2 font-medium tracking-wide uppercase">
            Questão {progresso.atual} de {progresso.total}
          </p>

          {/* Card da questão */}
          <div className="dashboard-card rounded-[20px] border shadow-lg p-8 mb-6">

            <h2 className="text-lg font-semibold text-[#2B2C40] mb-1 leading-snug">
              {questaoAtual.titulo}
              {questaoAtual.obrigatoria && (
                <span className="text-[#FF3E1D] ml-1">*</span>
              )}
            </h2>

            {questaoAtual.multiplasRespostas && questaoAtual.tipo === 'OPCAO' && (
              <p className="text-xs text-[#8592A3] mb-4">Você pode selecionar mais de uma opção.</p>
            )}

            <div className="mt-6">
              {/* ── Questão de TEXTO ────────────────────────────────────── */}
              {questaoAtual.tipo === 'TEXTO' && (
                <textarea
                  className="w-full rounded-xl border border-[#E4E6E8] bg-[#F5F5F9] px-4 py-3 text-sm text-[#384551] resize-none focus:outline-none focus:border-[#696CFF] focus:bg-white transition-all duration-200"
                  rows={4}
                  maxLength={questaoAtual.maximoDeCaracteres ?? undefined}
                  placeholder="Digite sua resposta aqui..."
                  value={respostaAtual?.textoResposta ?? ''}
                  onChange={(e) => setRespostaTexto(questaoAtual.id, e.target.value)}
                />
              )}

              {/* Contador de caracteres */}
              {questaoAtual.tipo === 'TEXTO' && questaoAtual.maximoDeCaracteres && (
                <p className="text-xs text-[#8592A3] text-right mt-1">
                  {(respostaAtual?.textoResposta ?? '').length}/{questaoAtual.maximoDeCaracteres}
                </p>
              )}

              {/* ── Questão de OPÇÃO ────────────────────────────────────── */}
              {questaoAtual.tipo === 'OPCAO' && (
                <div className="flex flex-col gap-3">
                  {[...questaoAtual.opcoes]
                    .sort((a, b) => a.ordem - b.ordem)
                    .map((opcao) => {
                      const selecionado = respostaAtual?.questaoOpcaoIds?.includes(opcao.id) ?? false;

                      return (
                        <button
                          key={opcao.id}
                          type="button"
                          onClick={() =>
                            setRespostaOpcao(questaoAtual.id, opcao.id, questaoAtual.multiplasRespostas)
                          }
                          className={[
                            'w-full text-left px-5 py-4 rounded-xl border text-sm font-medium transition-all duration-200',
                            selecionado
                              ? 'bg-[#696CFF] text-white border-[#696CFF] shadow-md'
                              : 'bg-white text-[#384551] border-[#E4E6E8] hover:border-[#696CFF] hover:bg-[#F4F6FA]',
                          ].join(' ')}
                        >
                          <span className={[
                            'inline-flex items-center justify-center w-6 h-6 rounded-full border text-xs mr-3 font-bold transition-all',
                            selecionado
                              ? 'border-white text-white bg-white/20'
                              : 'border-[#8592A3] text-[#8592A3]',
                          ].join(' ')}>
                            {String.fromCharCode(65 + (opcao.ordem - 1))}
                          </span>
                          {opcao.descricao}
                        </button>
                      );
                    })}
                </div>
              )}
            </div>
          </div>

          {/* Erro */}
          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700">
              {error}
            </div>
          )}

          {/* Navegação */}
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={voltar}
              disabled={questaoAtualIndex === 0 || isLoading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E4E6E8] bg-white text-sm text-[#384551] hover:bg-[#F4F6FA] disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </button>

            {isUltima ? (
              <Button
                onClick={handleFinalizar}
                disabled={isLoading}
                className="inline-flex items-center gap-2 rounded-xl px-6 py-2.5"
              >
                {isLoading ? 'Enviando...' : (
                  <>
                    <Send className="h-4 w-4" />
                    Finalizar pesquisa
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={salvarEAvancar}
                disabled={isLoading}
                className="inline-flex items-center gap-2 rounded-xl px-6 py-2.5"
              >
                {isLoading ? 'Salvando...' : (
                  <>
                    Próxima
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="dashboard-footer border-t px-6 py-3 text-center text-xs">
        © Prospect 2025 — Análise de Riscos Psicossociais
      </footer>
    </div>
  );
}