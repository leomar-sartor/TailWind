import { gql } from '@apollo/client';

export const GET_COLABORADORES = gql`
  query Colaboradores($where: ColaboradorFilterInput, $first: Int = 10, $after: String) {
    colaboradores(where: $where, first: $first, after: $after) {
      nodes {
        id
        nome
        cpf
        email
        ativo
        setorId
        empresaId
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

export const GET_COLABORADOR_BY_ID = gql`
  query GetColaborador($id: Long!) {
    colaboradorById(id: $id) {
      id
      nome
      cpf
      email
      ativo
      setorId
      empresaId
    }
  }
`;
