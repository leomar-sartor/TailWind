import { gql } from '@apollo/client';

export const GET_SETORS = gql`
  query Setores($where: SetorFilterInput, $first: Int = 10, $after: String) {
    setores(where: $where, first: $first, after: $after) {
      nodes {
        id
        nome
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