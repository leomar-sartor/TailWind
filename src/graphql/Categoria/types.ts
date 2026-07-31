// src/graphql/Categoria/types.ts

import type {
  CursorPageVars,
  EntityId,
  PaginatedResult,
} from '../Common/types';

export interface CategoriaNode {
  id: EntityId;
  nome: string;
  descricao?: string | null;
  createdAt?: string;
}

export interface CategoriaOptionNode {
  id: EntityId;
  nome: string;
}

export interface CategoriaInput {
  nome: string;
  descricao?: string;
}

export type GetCategoriasData = {
  categorias: PaginatedResult<CategoriaNode>;
};

export type GetCategoriasVars = CursorPageVars;

export type GetCategoriaByIdData = {
  categoriaById: {
    id: EntityId;
    nome: string;
    descricao?: string | null;
    createdAt?: string;
  } | null;
};

export type GetCategoriaByIdVars = {
  id: number;
};

export type GetCategoriasOptionsData = {
  categorias: PaginatedResult<CategoriaOptionNode>;
};

export type GetCategoriasOptionsVars = CursorPageVars;

export type CreateCategoriaData = {
  createCategoria: CategoriaNode;
};

export type CreateCategoriaVars = {
  input: CategoriaInput;
};

export type UpdateCategoriaData = {
  updateCategoria: {
    id: EntityId;
    nome: string;
    descricao?: string | null;
  };
};

export type UpdateCategoriaVars = {
  id: number;
  input: CategoriaInput;
};

export type RemoveCategoriaData = {
  removeCategoria: boolean | null;
};

export type RemoveCategoriaVars = {
  id: number;
};
