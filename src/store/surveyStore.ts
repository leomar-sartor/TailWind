import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// ─── Types ────────────────────────────────────────────────────────────────────

export type TipoQuestao = 'TEXTO' | 'OPCAO';

export interface QuestaoOpcao {
  id: string;
  ordem: number;
  descricao: string;
}

export interface Questao {
  id: string;
  titulo: string;
  tipo: TipoQuestao;
  obrigatoria: boolean;
  multiplasRespostas: boolean;
  maximoDeCaracteres?: number | null;
  opcoes: QuestaoOpcao[];
}

export interface Pesquisa {
  id: string;
  nome: string;
  dataInicial: string;
  dataFinal: string;
  questoes: Questao[];
}

// Resposta atual de uma questão (em memória antes do submit)
export interface RespostaLocal {
  questaoId: string;
  textoResposta?: string;
  questaoOpcaoIds?: string[];
}

interface SurveyState {
  // Dados da pesquisa
  token: string | null;
  pesquisa: Pesquisa | null;
  questoesOrdenadas: Questao[];

  // Progresso
  questaoAtualIndex: number;
  respostas: Record<string, RespostaLocal>; // key = questaoId
  isFinished: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  inicializar: (token: string, pesquisa: Pesquisa, ultimaQuestaoRespondidaId?: string | null, respostasParciais?: string | null) => void;
  setRespostaTexto: (questaoId: string, texto: string) => void;
  setRespostaOpcao: (questaoId: string, opcaoId: string, multiplas: boolean) => void;
  avancar: () => void;
  voltar: () => void;
  setFinished: (value: boolean) => void;
  setLoading: (value: boolean) => void;
  setError: (msg: string | null) => void;
  getRespostasJson: () => string;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useSurveyStore = create<SurveyState>()(
  devtools(
    (set, get) => ({
      token: null,
      pesquisa: null,
      questoesOrdenadas: [],
      questaoAtualIndex: 0,
      respostas: {},
      isFinished: false,
      isLoading: false,
      error: null,

      inicializar: (token, pesquisa, ultimaQuestaoRespondidaId, respostasParciais) => {
        const questoesOrdenadas = [...pesquisa.questoes]
          .map(q => ({ ...q, id: String(q.id), opcoes: q.opcoes.map(o => ({ ...o, id: String(o.id) })) }))
          .sort((a, b) => Number(a.id) - Number(b.id));

        // Restaura respostas parciais salvas no backend
        let respostas: Record<string, RespostaLocal> = {};
        if (respostasParciais) {
          try {
            respostas = JSON.parse(respostasParciais);
          } catch {
            respostas = {};
          }
        }

        // Restaura o índice da última questão respondida
        let questaoAtualIndex = 0;
        if (ultimaQuestaoRespondidaId) {
          const idx = questoesOrdenadas.findIndex((q) => q.id === ultimaQuestaoRespondidaId);
          if (idx !== -1) {
            // Retoma na próxima questão após a última respondida
            questaoAtualIndex = Math.min(idx + 1, questoesOrdenadas.length - 1);
          }
        }

        set(
          { token, pesquisa, questoesOrdenadas, respostas, questaoAtualIndex, isFinished: false, error: null },
          false,
          'survey/inicializar'
        );
      },

      setRespostaTexto: (questaoId, texto) =>
        set(
          (state) => ({
            respostas: {
              ...state.respostas,
              [questaoId]: { questaoId, textoResposta: texto },
            },
          }),
          false,
          'survey/setRespostaTexto'
        ),

      setRespostaOpcao: (questaoId, opcaoId, multiplas) =>
        set(
          (state) => {
            const atual = state.respostas[questaoId];
            const idsAtuais = atual?.questaoOpcaoIds ?? [];

            let novosIds: string[];
            if (multiplas) {
              // Toggle: adiciona se não tem, remove se já tem
              novosIds = idsAtuais.includes(opcaoId)
                ? idsAtuais.filter((id) => id !== opcaoId)
                : [...idsAtuais, opcaoId];
            } else {
              // Opção única: substitui
              novosIds = [opcaoId];
            }

            return {
              respostas: {
                ...state.respostas,
                [questaoId]: { questaoId, questaoOpcaoIds: novosIds },
              },
            };
          },
          false,
          'survey/setRespostaOpcao'
        ),

      avancar: () =>
        set(
          (state) => ({
            questaoAtualIndex: Math.min(
              state.questaoAtualIndex + 1,
              state.questoesOrdenadas.length - 1
            ),
          }),
          false,
          'survey/avancar'
        ),

      voltar: () =>
        set(
          (state) => ({
            questaoAtualIndex: Math.max(state.questaoAtualIndex - 1, 0),
          }),
          false,
          'survey/voltar'
        ),

      setFinished: (value) =>
        set({ isFinished: value }, false, 'survey/setFinished'),

      setLoading: (value) =>
        set({ isLoading: value }, false, 'survey/setLoading'),

      setError: (msg) =>
        set({ error: msg }, false, 'survey/setError'),

      getRespostasJson: () => JSON.stringify(get().respostas),
    }),
    { name: 'SurveyStore' }
  )
);

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectQuestaoAtual = (s: SurveyState) =>
  s.questoesOrdenadas[s.questaoAtualIndex] ?? null;

export const selectProgresso = (s: SurveyState) => ({
  atual: s.questaoAtualIndex + 1,
  total: s.questoesOrdenadas.length,
  percentual: s.questoesOrdenadas.length
    ? Math.round(((s.questaoAtualIndex + 1) / s.questoesOrdenadas.length) * 100)
    : 0,
});

export const selectRespostaAtual = (questaoId: string) => (s: SurveyState) =>
  s.respostas[questaoId] ?? null;

export const selectIsUltimaQuestao = (s: SurveyState) =>
  s.questaoAtualIndex === s.questoesOrdenadas.length - 1;