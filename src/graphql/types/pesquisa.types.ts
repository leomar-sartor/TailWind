// src/graphql/types/pesquisa.types.ts

import type { EntityId } from './common.types';

export type TipoQuestao = 'TEXTO' | 'OPCAO';

export interface PesquisaListNode {
  id: EntityId;
  nome: string;
  convites: Array<{ token: string }>;
  questoes: Array<{
    id: EntityId;
    titulo: string;
    tipo: string;
  }>;
}

export interface QuestaoOpcaoDetail {
  id: EntityId;
  ordem: number;
  descricao: string;
}

export interface QuestaoDetail {
  id: EntityId;
  titulo: string;
  tipo: TipoQuestao | string;
  obrigatoria: boolean;
  multiplasRespostas: boolean;
  maximoDeCaracteres: number | null;
  opcoes: QuestaoOpcaoDetail[];
}

export interface PesquisaDetail {
  id: EntityId;
  nome: string;
  dataInicial: string;
  dataFinal: string;
  questoes: QuestaoDetail[];
}

export interface QuestaoOpcaoInput {
  ordem: number;
  descricao: string;
}

export interface QuestaoInput {
  titulo: string;
  tipo: TipoQuestao | string;
  obrigatoria: boolean;
  multiplasRespostas: boolean;
  maximoDeCaracteres: number | null;
  opcoes?: QuestaoOpcaoInput[];
}

export interface PesquisaInput {
  nome: string;
  dataInicial: string;
  dataFinal: string;
  questoes: QuestaoInput[];
}

export type GetPesquisasListData = {
  pesquisas: {
    nodes: PesquisaListNode[];
  };
};

export type GetPesquisaByIdData = {
  pesquisaById: PesquisaDetail | null;
};

export type GetPesquisaByIdVars = {
  id: number;
};

export type CreatePesquisaData = {
  createPesquisa: {
    id: EntityId;
    nome: string;
    dataInicial: string;
    dataFinal: string;
  };
};

export type CreatePesquisaVars = {
  input: PesquisaInput;
};

export type UpdatePesquisaData = {
  updatePesquisa: {
    id: EntityId;
    nome: string;
    dataInicial: string;
    dataFinal: string;
  };
};

export type UpdatePesquisaVars = {
  id: number;
  input: PesquisaInput;
};

export type DeletePesquisaData = {
  deletePesquisa: boolean | null;
};

export type DeletePesquisaVars = {
  id: number;
};
