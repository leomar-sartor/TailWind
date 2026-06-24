// src/graphql/types/disparo.types.ts

export interface PesquisaNode {
  id: number;
  nome: string;
  dataInicial: string;
  dataFinal: string;
  convites?: { id: number; status: string }[];
}

export interface EmpresaNode {
  id: number;
  nomeFantasia: string;
}

export interface SetorNode {
  id: number;
  nome: string;
}

export interface ColaboradorNode {
  id: number;
  nome: string;
  email: string;
  setor?: { id: number; nome: string };
}

export interface PaginatedResult<T> {
  nodes: T[];
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
  totalCount?: number;
}

export interface GetPesquisasData       { pesquisas:    PaginatedResult<PesquisaNode> }
export interface GetEmpresasData        { empresas:     PaginatedResult<EmpresaNode> }
export interface GetSetoresData         { setores:      PaginatedResult<SetorNode> }
export interface GetColaboradoresData   { colaboradores: PaginatedResult<ColaboradorNode> }