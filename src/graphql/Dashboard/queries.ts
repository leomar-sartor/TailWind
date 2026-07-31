import { gql } from '@apollo/client';

export const GET_DASHBOARD_PESQUISAS = gql`
  query DashboardPesquisas($first: Int = 50) {
    pesquisas(first: $first, order: [{ id: DESC }]) {
      nodes {
        id
        nome
        dataInicial
        dataFinal
        convites {
          id
          status
          colaborador {
            id
            empresaId
            setorId
            empresa {
              id
              nomeFantasia
            }
            setor {
              id
              nome
            }
          }
        }
      }
      totalCount
    }
  }
`;
