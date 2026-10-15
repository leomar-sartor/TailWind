import { useQuery } from '@apollo/client/react';
import { useNavigate } from 'react-router-dom';
import { useActiveContext } from '../../auth/ActiveContext';
import { Button } from '../Button';
import { GET_PESQUISA_OPERATIONS_SUMMARY, type GetPesquisaOperationsSummaryData } from '../../graphql/Dashboard/operations';

function formatDate(value: string | null) {
  if (!value) return 'Sem data';
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(value));
}

export function DashboardOperationsOverview() {
  const navigate = useNavigate();
  const { isAdmin, permissions } = useActiveContext();
  const { data, loading, error } = useQuery<GetPesquisaOperationsSummaryData>(
    GET_PESQUISA_OPERATIONS_SUMMARY,
    { fetchPolicy: 'network-only' },
  );
  const surveys = data?.pesquisaOperationsSummary ?? [];
  const totals = surveys.reduce((sum, survey) => ({
    distribuidas: sum.distribuidas + survey.distribuidas,
    iniciadas: sum.iniciadas + survey.iniciadas,
    concluidas: sum.concluidas + survey.concluidas,
  }), { distribuidas: 0, iniciadas: 0, concluidas: 0 });
  const completion = totals.distribuidas > 0
    ? Math.round((totals.concluidas / totals.distribuidas) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] dashboard-text-muted">Operação</p>
          <h2 className="mt-1 text-2xl font-semibold dashboard-text">Andamento das pesquisas</h2>
        </div>
        <div className="flex gap-2">
          {permissions.includes('pesquisa_padronizada.gerenciar') && (
            <Button type="button" onClick={() => navigate('/dashboard/pesquisa-padronizada')}>Pesquisas padronizadas</Button>
          )}
          {isAdmin && <Button type="button" onClick={() => navigate('/dashboard/pesquisa')}>Pesquisas administrativas</Button>}
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Pesquisas', value: surveys.length },
          { label: 'Distribuídas', value: totals.distribuidas },
          { label: 'Iniciadas', value: totals.iniciadas },
          { label: 'Concluídas', value: `${totals.concluidas} · ${completion}%` },
        ].map((item) => (
          <article key={item.label} className="dashboard-card border p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] dashboard-text-muted">{item.label}</p>
            <p className="mt-3 text-2xl font-semibold dashboard-text">{item.value}</p>
          </article>
        ))}
      </section>

      <section className="border-t dashboard-border pt-5">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold dashboard-text">Pesquisas vinculadas</h3>
            <p className="mt-1 text-sm dashboard-text-muted">Somente status operacional agregado, sem respostas individuais.</p>
          </div>
        </div>
        {loading && <p className="py-8 text-center text-sm dashboard-text-muted">Carregando indicadores...</p>}
        {error && <p className="py-8 text-center text-sm text-rose-600">Não foi possível carregar os indicadores.</p>}
        {!loading && !error && surveys.length === 0 && <p className="py-8 text-center text-sm dashboard-text-muted">Nenhuma pesquisa vinculada a este contexto.</p>}
        {!loading && !error && surveys.length > 0 && (
          <div className="overflow-x-auto border-y dashboard-border">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b dashboard-border dashboard-text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Pesquisa</th>
                  <th className="px-4 py-3 font-medium">Vigência</th>
                  <th className="px-4 py-3 font-medium">Distribuídas</th>
                  <th className="px-4 py-3 font-medium">Iniciadas</th>
                  <th className="px-4 py-3 font-medium">Concluídas</th>
                  <th className="px-4 py-3 font-medium">Conclusão</th>
                </tr>
              </thead>
              <tbody className="divide-y dashboard-border">
                {surveys.map((survey) => {
                  const percent = survey.distribuidas > 0
                    ? Math.round((survey.concluidas / survey.distribuidas) * 100)
                    : 0;
                  return (
                    <tr key={survey.pesquisaId}>
                      <td className="px-4 py-3 font-medium dashboard-text">{survey.nome}</td>
                      <td className="px-4 py-3 dashboard-text-muted">{formatDate(survey.dataInicial)} – {formatDate(survey.dataFinal)}</td>
                      <td className="px-4 py-3 dashboard-text">{survey.distribuidas}</td>
                      <td className="px-4 py-3 dashboard-text">{survey.iniciadas}</td>
                      <td className="px-4 py-3 dashboard-text">{survey.concluidas}</td>
                      <td className="px-4 py-3 dashboard-text">{percent}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}