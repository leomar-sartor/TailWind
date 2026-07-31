// src/graphql/Empresa/types.ts

import type {
  CursorPageVars,
  EntityId,
  PaginatedResult,
} from '../Common/types';

export interface EmpresaNode {
  id: EntityId;
  cnpj: string;
  nomeFantasia: string;
  descricao?: string | null;
  createdAt?: string;
}

export interface EmpresaOptionNode {
  id: EntityId;
  nomeFantasia: string;
}

export interface EmpresaInput {
  cnpj: string;
  nomeFantasia: string;
  descricao?: string;
}

export type GetEmpresasData = {
  empresas: PaginatedResult<EmpresaNode>;
};

export type GetEmpresasVars = CursorPageVars;

export type GetEmpresaByIdData = {
  empresaById: {
    id: EntityId;
    cnpj: string;
    nomeFantasia: string;
    descricao?: string | null;
    createdAt?: string;
  } | null;
};

export type GetEmpresaByIdVars = {
  id: number;
};

export type GetEmpresasPaginatedData = {
  empresas: PaginatedResult<EmpresaOptionNode>;
};

export type GetEmpresasPaginatedVars = CursorPageVars;

export type CreateEmpresaData = {
  createEmpresa: EmpresaNode;
};

export type CreateEmpresaVars = {
  input: EmpresaInput;
};

export type UpdateEmpresaData = {
  updateEmpresa: {
    id: EntityId;
    nomeFantasia: string;
    descricao?: string | null;
  };
};

export type UpdateEmpresaVars = {
  id: number;
  input: EmpresaInput;
};

export type RemoveEmpresaData = {
  removeEmpresa: boolean | null;
};

export type RemoveEmpresaVars = {
  id: number;
};
