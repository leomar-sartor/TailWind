import { gql } from '@apollo/client';

export const DISPARAR_PESQUISA_MUTATION = gql`
  mutation DispararPesquisa($pesquisaId: Long!, $colaboradorIds: [Long!]!) {
    dispararPesquisa(pesquisaId: $pesquisaId, colaboradorIds: $colaboradorIds)
  }
`;