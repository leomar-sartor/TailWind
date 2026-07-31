import { gql } from '@apollo/client';

export const GET_CATEGORIAS = gql`
  query Categorias($where: CategoriaFilterInput, $first: Int = 10, $after: String) {
    categorias(where: $where, first: $first, after: $after, order: [{ id: DESC }]) {
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

export const GET_CATEGORIA_BY_ID = gql`
  query GetCategoria($id: Long!) {
    categoriaById(id: $id) {
      id
      nome
      descricao
      createdAt
    }
  }
`;

export const GET_CATEGORIAS_OPTIONS = gql`
  query CategoriasOptions($where: CategoriaFilterInput, $first: Int = 50, $after: String) {
    categorias(where: $where, first: $first, after: $after, order: [{ id: DESC }]) {
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
