import { gql } from '@apollo/client';

export const GET_SESSAO_PESQUISA = gql`
  query GetSessaoPesquisa($token: String!) {
    sessaoPesquisa(token: $token) {
      pesquisa {
        id
        nome
        dataInicial
        dataFinal
        questoes {
          id
          titulo
          tipo
          obrigatoria
          multiplasRespostas
          maximoDeCaracteres
          opcoes {
            id
            ordem
            descricao
          }
        }
      }
      ultimaQuestaoRespondidaId
      respostasParciais
    }
  }
`;