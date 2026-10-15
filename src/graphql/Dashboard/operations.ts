import { gql } from '@apollo/client';

export const GET_PESQUISA_OPERATIONS_SUMMARY = gql`
  query PesquisaOperationsSummary {
    pesquisaOperationsSummary {
      pesquisaId
      nome
      dataInicial
      dataFinal
      distribuidas
      iniciadas
      concluidas
    }
  }
`;

export type PesquisaOperationsSummary = {
  pesquisaId: string;
  nome: string;
  dataInicial: string | null;
  dataFinal: string | null;
  distribuidas: number;
  iniciadas: number;
  concluidas: number;
};

export type GetPesquisaOperationsSummaryData = {
  pesquisaOperationsSummary: PesquisaOperationsSummary[];
};