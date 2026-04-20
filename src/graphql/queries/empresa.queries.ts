import { gql } from '@apollo/client';

export const GET_EMPRESAS = gql`
  query Empresas($where: EmpresaFilterInput, $first: Int = 10, $after: String) {
    empresas(where: $where, first: $first, after: $after) {
      nodes {
        id
        razaoSocial
        descricao
        createdAt
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

export const GET_EMPRESA_BY_ID = gql`
  query GetEmpresa($id: Long!) {
    empresaById(id: $id) {
      id
      razaoSocial
      descricao
      createdAt
    }
  }
`;
