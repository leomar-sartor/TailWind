// src/graphql/types/setor.types.ts

import type {
  CursorPageVars,
  EntityId,
  PaginatedResult,
} from './common.types';

export interface SetorEmpresaRef {
  id?: EntityId;
  nomeFantasia?: string;
}

export interface SetorNode {
  id: EntityId;
  nome: string;
  descricao?: string | null;
  createdAt?: string;
  empresa?: SetorEmpresaRef;
}

export interface SetorOptionNode {
  id: EntityId;
  nome: string;
}

export interface SetorInput {
  nome: string;
  descricao: string;
}

export type GetSetoresData = {
  setores: PaginatedResult<SetorNode>;
};

export type GetSetoresVars = CursorPageVars;

export type GetSetorByIdData = {
  setorById: {
    id: EntityId;
    nome: string;
    descricao?: string | null;
    createdAt?: string;
    empresa?: {
      id: EntityId;
      nomeFantasia?: string;
    };
  } | null;
};

export type GetSetorByIdVars = {
  id: number;
};

export type CreateSetorData = {
  createSetor: {
    id: EntityId;
    nome: string;
    descricao?: string | null;
    createdAt?: string;
  };
};

export type CreateSetorVars = {
  empresaId: number;
  input: SetorInput;
};

export type UpdateSetorData = {
  updateSetor: {
    id: EntityId;
    nome: string;
    descricao?: string | null;
  };
};

export type UpdateSetorVars = {
  id: number;
  input: SetorInput;
};

export type RemoveSetorData = {
  removeSetor: boolean | null;
};

export type RemoveSetorVars = {
  id: number;
};
