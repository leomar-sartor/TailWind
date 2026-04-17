import { gql } from '@apollo/client';

export const CREATE_SETOR_MUTATION = gql`
  mutation NovoSetor($empresaId: Long!, $input: SetorInput!) {
    createSetor(empresaId: $empresaId, input: $input) {
      id
      nome
      descricao
      createdAt
    }
  }
`;

export const UPDATE_SETOR_MUTATION = gql`
  mutation UpdateSetor($id: Long!, $input: SetorInput!) {
    updateSetor(id: $id, input: $input) {
      id
      nome
      descricao
    }
  }
`;

export const REMOVE_SETOR_MUTATION = gql`
  mutation RemoveSetor($id: Long!) {
    removeSetor(id: $id)
  }
`;
