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