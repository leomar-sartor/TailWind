import { gql } from '@apollo/client';

export const GET_SETORS = gql`
  query Setores($where: SetorFilterInput, $first: Int = 10, $after: String) {
    setores(where: $where, first: $first, after: $after) {
      nodes {
        id
        nome
        descricao
        createdAt
        empresa {
					id
					nomeFantasia
				}
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`;

export const GET_SETOR_BY_ID = gql`
  query GetSetor($id: Long!) {
    setorById(id: $id) {
      id
      nome
      descricao
      createdAt
      empresa{
        id
        nomeFantasia
      }
    }
  }
`;

export const GET_EMPRESAS = gql`
  query EmpresasWithSetores {
    empresas {
      nodes {
        id
        nomeFantasia
      }
      pageInfo {
        hasNextPage
      }
      totalCount
    }
  }
`;

export const GET_EMPRESAS_PAGINATED = gql`
  query EmpresasPaginated($where: EmpresaFilterInput, $first: Int = 10, $after: String) {
    empresas(where: $where, first: $first, after: $after) {
      nodes {
        id
        nomeFantasia
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
`;