import { gql } from '@apollo/client';

export const CREATE_COLABORADOR_MUTATION = gql`
  mutation CreateColaborador($input: ColaboradorInput!) {
    createColaborador(input: $input) {
      id
      nome
      cpf
      email
      setorId
      empresaId
    }
  }
`;

export const UPDATE_COLABORADOR_MUTATION = gql`
  mutation UpdateColaborador($id: Long!, $input: ColaboradorInput!) {
    updateColaborador(id: $id, input: $input) {
      id
      nome
      cpf
      email
      setorId
      empresaId
    }
  }
`;

export const REMOVE_COLABORADOR_MUTATION = gql`
  mutation RemoveColaborador($id: Long!) {
    removeColaborador(id: $id)
  }
`;
