import { gql } from '@apollo/client';

export const GET_PESQUISAS = gql`
  query BuscarPesquisa {
    pesquisas {
      nodes {
        id
        nome
        convites {
          token
        }
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
            questao {
              titulo
            }
          }
          respostas {
            questao {
              titulo
              opcoes {
                id
                descricao
              }
            }
            id
            questaoId
            questaoOpcaoId
            questaoOpcao {
              descricao
            }
            textoResposta
          }
        }
      }
    }
  }
`;

export const GET_PESQUISA_BY_ID = gql`
  query GetPesquisaById($id: Long!) {
    pesquisaById(id: $id) {
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
  }
`;

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