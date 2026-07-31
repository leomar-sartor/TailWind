// src/graphql/Disparo/types.ts

import type { CursorPageVars, EntityId, PaginatedResult } from '../Common/types';

export interface PesquisaNode {
  id: EntityId;
  nome: string;
  dataInicial: string;
  dataFinal: string;
  convites?: { id: EntityId; status: string }[];
}

export interface EmpresaNode {
  id: EntityId;
  nomeFantasia: string;
}

export interface SetorNode {
  id: EntityId;
  nome: string;
}

export interface ColaboradorNode {
  id: EntityId;
  nome: string;
  email: string;
  setor?: { id: EntityId; nome: string };
}

export type { PaginatedResult };

export interface GetPesquisasData {
  pesquisas: PaginatedResult<PesquisaNode>;
}

export type GetPesquisasVars = CursorPageVars;

export interface GetEmpresasData {
  empresas: PaginatedResult<EmpresaNode>;
}

export type GetEmpresasDisparoVars = CursorPageVars;

export interface GetSetoresData {
  setores: PaginatedResult<SetorNode>;
}

export type GetSetoresByEmpresaVars = CursorPageVars;

export interface GetColaboradoresData {
  colaboradores: PaginatedResult<ColaboradorNode>;
}

export type GetColaboradoresBySetorVars = CursorPageVars;

export type DispararPesquisaData = {
  dispararPesquisa: boolean | null;
};

export type DispararPesquisaVars = {
  pesquisaId: number;
  colaboradorIds: number[];
};
