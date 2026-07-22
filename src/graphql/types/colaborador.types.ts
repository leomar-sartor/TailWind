// src/graphql/types/colaborador.types.ts

import type {
  CursorPageVars,
  EntityId,
  PaginatedResult,
} from './common.types';

export interface ColaboradorEmpresaRef {
  id?: EntityId;
  nomeFantasia?: string;
}

export interface ColaboradorSetorRef {
  id?: EntityId;
  nome?: string;
}

export interface ColaboradorNode {
  id: EntityId;
  nome: string;
  cpf: string;
  email: string;
  ativo: boolean;
  setorId: EntityId;
  empresaId: EntityId;
  empresa?: ColaboradorEmpresaRef;
  setor?: ColaboradorSetorRef;
  createdAt?: string;
}

export interface ColaboradorInput {
  nome: string;
  cpf: string;
  email: string;
  empresaId: number;
  setorId: number;
}

export type GetColaboradoresData = {
  colaboradores: PaginatedResult<ColaboradorNode>;
};

export type GetColaboradoresVars = CursorPageVars;

export type GetColaboradorByIdData = {
  colaboradorById: {
    id: EntityId;
    nome: string;
    cpf: string;
    email: string;
    ativo?: boolean;
    setorId: EntityId;
    empresaId: EntityId;
    empresa?: { id: EntityId; nomeFantasia: string };
    setor?: { id: EntityId; nome: string };
  } | null;
};

export type GetColaboradorByIdVars = {
  id: number;
};

export type CreateColaboradorData = {
  createColaborador: {
    id: EntityId;
    nome: string;
    cpf: string;
    email: string;
    setorId: EntityId;
    empresaId: EntityId;
  };
};

export type CreateColaboradorVars = {
  input: ColaboradorInput;
};

export type UpdateColaboradorData = {
  updateColaborador: {
    id: EntityId;
    nome: string;
    cpf: string;
    email: string;
    setorId: EntityId;
    empresaId: EntityId;
  };
};

export type UpdateColaboradorVars = {
  id: number;
  input: ColaboradorInput;
};

export type RemoveColaboradorData = {
  removeColaborador: boolean | null;
};

export type RemoveColaboradorVars = {
  id: number;
};
