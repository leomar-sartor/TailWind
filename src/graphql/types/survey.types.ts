// src/graphql/types/survey.types.ts

import type { Pesquisa } from '../../store/surveyStore';
import type { EntityId } from './common.types';

export type GetSessaoPesquisaData = {
  sessaoPesquisa: {
    pesquisa: Pesquisa;
    ultimaQuestaoRespondidaId: string | null;
    respostasParciais: string | null;
  };
};

export type GetSessaoPesquisaVars = {
  token: string;
};

export type CreateRespostaData = {
  createResposta: {
    id: EntityId;
    questaoId: EntityId;
  };
};

export type CreateRespostaVars = {
  token: string | null;
  questaoId: number;
  textoResposta?: string | null;
  questaoOpcaoIds?: number[] | null;
};

export type AutoSavePesquisaData = {
  autoSavePesquisa: boolean | null;
};

export type AutoSavePesquisaVars = {
  token: string | null;
  ultimaQuestaoRespondidaId: number;
  respostasParciais?: string | null;
};

export type FinalizarPesquisaData = {
  finalizarPesquisa: boolean | null;
};

export type FinalizarPesquisaVars = {
  token: string | null;
};
