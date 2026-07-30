import { gql } from '@apollo/client';

export const CREATE_CATEGORIA_MUTATION = gql`
  mutation NovaCategoria($input: CategoriaInput!) {
    createCategoria(input: $input) {
      id
      nome
      descricao
      createdAt
    }
  }
`;

export const UPDATE_CATEGORIA_MUTATION = gql`
  mutation UpdateCategoria($id: Long!, $input: CategoriaInput!) {
    updateCategoria(id: $id, input: $input) {
      id
      nome
      descricao
    }
  }
`;

export const REMOVE_CATEGORIA_MUTATION = gql`
  mutation RemoveCategoria($id: Long!) {
    removeCategoria(id: $id)
  }
`;
