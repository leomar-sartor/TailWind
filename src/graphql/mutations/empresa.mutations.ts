import { gql } from '@apollo/client';

export const CREATE_EMPRESA_MUTATION = gql`
  mutation NovaEmpresa($input: EmpresaInput!) {
    createEmpresa(input: $input) {
      id
      cnpj
      nomeFantasia
      descricao
      createdAt
    }
  }
`;

export const UPDATE_EMPRESA_MUTATION = gql`
  mutation UpdateEmpresa($id: Long!, $input: EmpresaInput!) {
    updateEmpresa(id: $id, input: $input) {
      id
      nomeFantasia
      descricao
    }
  }
`;

export const REMOVE_EMPRESA_MUTATION = gql`
  mutation RemoveEmpresa($id: Long!) {
    removeEmpresa(id: $id)
  }
`;
