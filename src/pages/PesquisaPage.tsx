import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client/react';
import { Edit3, PlusCircle, Trash2 } from 'lucide-react';
import { Button } from '../components/Button';
import { GET_PESQUISAS } from '../graphql/queries/pesquisa.queries';
import { DELETE_PESQUISA_MUTATION } from '../graphql/mutations/pesquisa.mutations';

type PesquisaNode = {
  id: string;
  nome: string;
  convites: Array<{ token: string }>;
  questoes: Array<{
    id: string;
    titulo: string;
    tipo: string;
  }>;
};

export function PesquisaPage() {
  const navigate = useNavigate();

  const { data, loading, error, refetch } = useQuery<{
    pesquisas: {
      nodes: PesquisaNode[];
    };
  }>(GET_PESQUISAS, {
    fetchPolicy: 'cache-and-network',
  });

  const pesquisas = data?.pesquisas?.nodes ?? [];

  const [deletePesquisa, { loading: deleting }] = useMutation(DELETE_PESQUISA_MUTATION);

  const handleCreate = () => {
    navigate('/dashboard/pesquisa/create');
  };

  const handleEdit = (pesquisaId: string) => {
    navigate(`/dashboard/pesquisa/create?id=${pesquisaId}`);
  };

  const handleDelete = async (pesquisaId: string) => {
    const confirmed = window.confirm('Deseja excluir esta pesquisa?');
    if (!confirmed) return;

    try {
      await deletePesquisa({ variables: { id: Number(pesquisaId) } });
      await refetch();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between px-4">
        <div>
          <h2 className="text-xl font-semibold text-[#2B2C40]">Pesquisas</h2>
          <p className="mt-1 text-sm dashboard-text-muted">Veja as pesquisas cadastradas e crie uma nova pesquisa.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button type="button" onClick={handleCreate} className="rounded-3xl px-5 py-3 inline-flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Cadastrar pesquisa
          </Button>
        </div>
      </div>

      <section className="dashboard-card rounded-[28px] border p-0 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left">
            <thead className="bg-[#F8FAFF]">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-[#2B2C40]">Ações</th>
                <th className="px-6 py-4 text-sm font-semibold text-[#2B2C40]">Código</th>
                <th className="px-6 py-4 text-sm font-semibold text-[#2B2C40]">Nome</th>
                <th className="px-6 py-4 text-sm font-semibold text-[#2B2C40]">Questões</th>
                <th className="px-6 py-4 text-sm font-semibold text-[#2B2C40]">Convites</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {pesquisas.map((pesquisa) => (
                <tr key={pesquisa.id} className="hover:bg-[#F4F6FA] transition-colors">
                  <td className="px-6 py-4 align-top text-sm text-[#2B2C40]">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-white px-3 py-2 text-sm text-[#2B2C40] transition hover:bg-[#F4F6FA]"
                        onClick={() => handleEdit(pesquisa.id)}
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-3xl border border-rose-200 bg-white px-3 py-2 text-sm text-rose-500 transition hover:bg-rose-50"
                        onClick={() => handleDelete(pesquisa.id)}
                        disabled={deleting}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top text-sm text-[#6C7287]">{pesquisa.id}</td>
                  <td className="px-6 py-4 align-top text-sm text-[#2B2C40]">{pesquisa.nome}</td>
                  <td className="px-6 py-4 align-top text-sm text-[#6C7287]">{pesquisa.questoes.length}</td>
                  <td className="px-6 py-4 align-top text-sm text-[#6C7287]">{pesquisa.convites.length}</td>
                </tr>
              ))}
              {!pesquisas.length && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-[#6C7287]">
                    {loading ? 'Carregando pesquisas...' : error ? 'Erro ao carregar pesquisas. Tente novamente.' : 'Nenhuma pesquisa cadastrada.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {error && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          Erro ao carregar pesquisas. Verifique a conexão e tente novamente.
        </div>
      )}
    </div>
  );
}
