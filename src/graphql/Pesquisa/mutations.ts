import { gql } from '@apollo/client';

export const CREATE_RESPOSTA_MUTATION = gql`
  mutation CreateResposta(
    $token: String!
    $questaoId: Long!
    $textoResposta: String
    $questaoOpcaoIds: [Long!]
  ) {
    createResposta(input: {
      token: $token
      questaoId: $questaoId
      textoResposta: $textoResposta
      questaoOpcaoIds: $questaoOpcaoIds
    }) {
      id
      questaoId
    }
  }
`;

export const AUTO_SAVE_PESQUISA_MUTATION = gql`
  mutation AutoSavePesquisa(
    $token: String!
    $ultimaQuestaoRespondidaId: Long!
    $respostasParciais: String
  ) {
    autoSavePesquisa(
      token: $token
      ultimaQuestaoRespondidaId: $ultimaQuestaoRespondidaId
      respostasParciais: $respostasParciais
    )
  }
`;

export const FINALIZAR_PESQUISA_MUTATION = gql`
  mutation FinalizarPesquisa($token: String!) {
    finalizarPesquisa(token: $token)
  }
`;

export const CREATE_PESQUISA_MUTATION = gql`
  mutation NovaPesquisa($input: PesquisaInput!) {
    createPesquisa(input: $input) {
      id
      nome
      dataInicial
      dataFinal
    }
  }
`;

export const UPDATE_PESQUISA_MUTATION = gql`
  mutation UpdatePesquisa($id: Long!, $input: PesquisaInput!) {
    updatePesquisa(id: $id, input: $input) {
      id
      nome
      dataInicial
      dataFinal
    }
  }
`;

export const DELETE_PESQUISA_MUTATION = gql`
  mutation DeletePesquisa($id: Long!) {
    deletePesquisa(id: $id)
  }
`;
