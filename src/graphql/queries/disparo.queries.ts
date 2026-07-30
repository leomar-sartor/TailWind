import { gql } from '@apollo/client';

export const GET_PESQUISAS_PAGINATED = gql`
  query GetPesquisas($first: Int, $after: String, $where: PesquisaFilterInput) {
    pesquisas(first: $first, after: $after, where: $where) {
      nodes {
        id
        nome
        dataInicial
        dataFinal
        convites {
          id
          status
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
`;

export const GET_EMPRESAS_DISPARO = gql`
  query GetEmpresasDisparo($first: Int, $after: String, $where: EmpresaFilterInput) {
    empresas(first: $first, after: $after, where: $where) {
      nodes {
        id
        nomeFantasia
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const GET_SETORES_BY_EMPRESA = gql`
  query GetSetoresByEmpresa($first: Int, $after: String, $where: SetorFilterInput) {
    setores(first: $first, after: $after, where: $where) {
      nodes {
        id
        nome
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
`;

export const GET_COLABORADORES_BY_SETOR = gql`
  query GetColaboradoresBySetor($first: Int, $after: String, $where: ColaboradorFilterInput) {
    colaboradores(first: $first, after: $after, where: $where) {
      nodes {
        id
        nome
        email
        setor {
          id
          nome
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
`;