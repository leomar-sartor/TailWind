import { StatusBadge } from '../StatusBadge';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { Link } from 'react-router-dom';

export const GET_MY_SURVEYS = gql`
  query MinhasPesquisas {
    minhasPesquisas { id nome status token }
  }
`;

type Participation = { id: string; nome: string; status: string; token: string | null };

export function MySurveysOverview() {
  const { data, loading, error } = useQuery<{ minhasPesquisas: Participation[] }>(GET_MY_SURVEYS, {
    fetchPolicy: 'network-only',
  });
  if (loading) return <p className="dashboard-text">Carregando suas pesquisas...</p>;
  if (error) return <p role="alert" className="dashboard-text">Não foi possível carregar suas pesquisas.</p>;
  const participations = data?.minhasPesquisas ?? [];
  return (
    <section className="space-y-5">
      <header>
        <h2 className="text-2xl font-semibold dashboard-text">Minhas pesquisas</h2>
        <p className="mt-2 dashboard-text-muted">Responda às pesquisas atribuídas a você nesta empresa ou retome seu progresso.</p>
      </header>
      {participations.length === 0 && <p className="dashboard-text-muted">Nenhuma pesquisa atribuída nesta empresa.</p>}
      {participations.map((participation) => (
        <article key={participation.id} className="dashboard-card flex flex-wrap items-center justify-between gap-4 border p-5">
          <div>
            <h3 className="font-semibold dashboard-text">{participation.nome}</h3>
            <StatusBadge tone={participation.status === 'COMPLETO' ? 'positive' : 'warning'}>{participation.status === 'COMPLETO' ? 'Concluída' : participation.status === 'EM_PROGRESSO' ? 'Em andamento' : 'Pendente'}</StatusBadge>
          </div>
          {participation.token && <Link className="font-semibold text-indigo-600" to={`/survey?token=${encodeURIComponent(participation.token)}`}>
            {participation.status === 'EM_PROGRESSO' ? 'Retomar pesquisa' : 'Iniciar pesquisa'}
          </Link>}
        </article>
      ))}
    </section>
  );
}
