import { gql } from '@apollo/client';

export const GET_PESQUISAS_PADRONIZADAS = gql`
  query GetPesquisasPadronizadas($first: Int = 10, $after: String, $where: PesquisaPadronizadaResumoFilterInput) {
    pesquisasPadronizadas(first: $first, after: $after, where: $where, order: [{ id: DESC }]) {
      nodes {
        id
        nome
        publicadaEm
        dataInicial
        dataFinal
        questoes {
          id
          titulo
          categoria {
            id
            nome
          }
        }
        empresasVinculadas {
          empresa {
            id
            nomeFantasia
          }
        }
      }
      totalCount
      pageInfo { hasNextPage endCursor }
    }
  }
`;

export const GET_PESQUISA_PADRONIZADA_BY_ID = gql`
  query GetPesquisaPadronizadaById($id: Long!) {
    pesquisaPadronizadaById(id: $id) {
      id nome publicadaEm dataInicial dataFinal
      questoes { id titulo categoria { id nome } }
      empresasVinculadas { empresa { id nomeFantasia } }
    }
  }
`;

export const CREATE_PESQUISA_PADRONIZADA = gql`
  mutation CreatePesquisaPadronizada($input: PesquisaPadronizadaInput!) {
    createPesquisaPadronizada(input: $input) {
      id
      nome
      publicadaEm
    }
  }
`;

export const UPDATE_PESQUISA_PADRONIZADA = gql`
  mutation UpdatePesquisaPadronizada($id: Long!, $input: PesquisaPadronizadaInput!) {
    updatePesquisaPadronizada(id: $id, input: $input) {
      id
      nome
      publicadaEm
    }
  }
`;

export const PUBLISH_PESQUISA_PADRONIZADA = gql`
  mutation PublishPesquisaPadronizada($id: Long!) {
    publishPesquisaPadronizada(id: $id)
  }
`;

export const GET_COLABORADORES_DA_EMPRESA_ATIVA = gql`
  query GetColaboradoresDaEmpresaAtiva($first: Int = 50) {
    colaboradores(first: $first, order: [{ nome: ASC }]) {
      nodes { id nome email }
      totalCount
    }
  }
`;

export const DISPARAR_PESQUISA_PADRONIZADA = gql`
  mutation DispararPesquisaPadronizada($pesquisaId: Long!, $colaboradorIds: [Long!]!) {
    dispararPesquisaPadronizada(pesquisaId: $pesquisaId, colaboradorIds: $colaboradorIds)
  }
`;

export type StandardQuestionInput = {
  titulo: string;
  obrigatoria: boolean;
  categoriaId: number;
};

export type StandardSurveyInput = {
  nome: string;
  dataInicial: string | null;
  dataFinal: string | null;
  empresaIds: number[];
  questoes: StandardQuestionInput[];
};

export type StandardSurveyNode = {
  id: string;
  nome: string;
  publicadaEm: string | null;
  dataInicial: string | null;
  dataFinal: string | null;
  questoes: Array<{
    id: string;
    titulo: string;
    categoria: { id: string; nome: string } | null;
  }>;
  empresasVinculadas: Array<{
    empresa: { id: string; nomeFantasia: string | null };
  }>;
};

export type GetPesquisasPadronizadasData = {
  pesquisasPadronizadas: { nodes: StandardSurveyNode[]; totalCount: number; pageInfo: { hasNextPage: boolean; endCursor: string | null } } | null;
};

export type GetColaboradoresDaEmpresaAtivaData = {
  colaboradores: {
    nodes: Array<{ id: string; nome: string; email: string }>;
    totalCount: number;
  };
};
