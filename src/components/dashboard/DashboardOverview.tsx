import { useMemo, useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { useNavigate } from 'react-router-dom';
import { Building2, Layers, RadioTower, Send } from 'lucide-react';
import { Button } from '../Button';
import { GET_DASHBOARD_PESQUISAS } from '../../graphql/Dashboard/queries';
import { GET_EMPRESAS_DISPARO, GET_SETORES_BY_EMPRESA } from '../../graphql/Disparo/queries';
import type {
  GetEmpresasData,
  GetEmpresasDisparoVars,
  GetSetoresByEmpresaVars,
  GetSetoresData,
} from '../../graphql/Disparo/types';
import type { EntityId } from '../../graphql/Common/types';

type ConviteNode = {
  id: EntityId;
  status: string;
  colaborador?: {
    id: EntityId;
    empresaId?: EntityId | null;
    setorId?: EntityId | null;
    empresa?: { id: EntityId; nomeFantasia: string } | null;
    setor?: { id: EntityId; nome: string } | null;
  } | null;
};

type PesquisaDashboardNode = {
  id: EntityId;
  nome: string;
  dataInicial?: string | null;
  dataFinal?: string | null;
  convites: ConviteNode[];
};

type DashboardPesquisasData = {
  pesquisas: {
    nodes: PesquisaDashboardNode[];
    totalCount?: number;
  };
};

function normalizeStatus(status: string): 'PENDENTE' | 'EM_PROGRESSO' | 'COMPLETO' | 'OUTRO' {
  const value = status.toUpperCase().replace(/\s+/g, '_');
  if (value.includes('PENDENTE') || value === '1') return 'PENDENTE';
  if (value.includes('PROGRESSO') || value.includes('PROGRESS') || value === '2') return 'EM_PROGRESSO';
  if (value.includes('COMPLETO') || value.includes('COMPLETE') || value === '3') return 'COMPLETO';
  return 'OUTRO';
}

function formatDate(value?: string | null) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}

function countByStatus(convites: ConviteNode[]) {
  return convites.reduce(
    (acc, convite) => {
      const status = normalizeStatus(String(convite.status));
      if (status === 'PENDENTE') acc.pendente += 1;
      else if (status === 'EM_PROGRESSO') acc.emProgresso += 1;
      else if (status === 'COMPLETO') acc.completo += 1;
      return acc;
    },
    { pendente: 0, emProgresso: 0, completo: 0 },
  );
}

export function DashboardOverview() {
  const navigate = useNavigate();
  const [empresaId, setEmpresaId] = useState('');
  const [setorId, setSetorId] = useState('');

  const { data, loading, error } = useQuery<DashboardPesquisasData>(GET_DASHBOARD_PESQUISAS, {
    variables: { first: 50 },
    fetchPolicy: 'cache-and-network',
  });

  const { data: empresasData } = useQuery<GetEmpresasData, GetEmpresasDisparoVars>(
    GET_EMPRESAS_DISPARO,
    { variables: { first: 50 } },
  );

  const { data: setoresData } = useQuery<GetSetoresData, GetSetoresByEmpresaVars>(
    GET_SETORES_BY_EMPRESA,
    {
      variables: {
        first: 50,
        where: empresaId ? { empresaId: { eq: Number(empresaId) } } : null,
      },
      skip: !empresaId,
    },
  );

  const empresas = empresasData?.empresas?.nodes ?? [];
  const setores = setoresData?.setores?.nodes ?? [];
  const pesquisas = data?.pesquisas?.nodes ?? [];

  const filteredPesquisas = useMemo(() => {
    return pesquisas
      .map((pesquisa) => {
        const convites = (pesquisa.convites ?? []).filter((convite) => {
          const colaborador = convite.colaborador;
          if (!colaborador) return !empresaId && !setorId;
          if (empresaId && String(colaborador.empresaId) !== empresaId) return false;
          if (setorId && String(colaborador.setorId) !== setorId) return false;
          return true;
        });
        return { ...pesquisa, convites };
      })
      .filter((pesquisa) => {
        if (!empresaId && !setorId) return true;
        return pesquisa.convites.length > 0;
      });
  }, [pesquisas, empresaId, setorId]);

  const totals = useMemo(() => {
    const allConvites = filteredPesquisas.flatMap((p) => p.convites);
    const byStatus = countByStatus(allConvites);
    return {
      pesquisas: filteredPesquisas.length,
      convites: allConvites.length,
      ...byStatus,
    };
  }, [filteredPesquisas]);

  return (
    <div className="space-y-6">
      <div className="dashboard-card rounded-[28px] border p-6 shadow-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[#2B2C40]">Andamento das pesquisas</h3>
            <p className="mt-1 text-sm dashboard-text-muted">
              Acompanhe convites enviados, em progresso e concluídos por empresa e setor.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              onClick={() => navigate('/dashboard/pesquisa')}
              className="rounded-2xl px-4 py-2.5 inline-flex items-center gap-2"
            >
              <RadioTower className="h-4 w-4" />
              Pesquisas
            </Button>
            <Button
              type="button"
              onClick={() => navigate('/dashboard/pesquisa/disparar')}
              className="rounded-2xl border border-slate-200 bg-white text-[#2B2C40] hover:bg-[#F4F6FA] px-4 py-2.5 inline-flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              Disparar
            </Button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <label className="space-y-1.5">
            <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-[#8592A3]">
              <Building2 className="h-3.5 w-3.5" />
              Empresa
            </span>
            <select
              value={empresaId}
              onChange={(e) => {
                setEmpresaId(e.target.value);
                setSetorId('');
              }}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-[#2B2C40]"
            >
              <option value="">Todas as empresas</option>
              {empresas.map((empresa) => (
                <option key={empresa.id} value={String(empresa.id)}>
                  {empresa.nomeFantasia}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1.5">
            <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-[#8592A3]">
              <Layers className="h-3.5 w-3.5" />
              Setor
            </span>
            <select
              value={setorId}
              onChange={(e) => setSetorId(e.target.value)}
              disabled={!empresaId}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-[#2B2C40] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">
                {!empresaId ? 'Selecione uma empresa' : 'Todos os setores'}
              </option>
              {setores.map((setor) => (
                <option key={setor.id} value={String(setor.id)}>
                  {setor.nome}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Pesquisas', value: totals.pesquisas },
          { label: 'Convites', value: totals.convites },
          { label: 'Pendentes', value: totals.pendente },
          { label: 'Concluídos', value: totals.completo },
        ].map((item) => (
          <article key={item.label} className="dashboard-card rounded-[28px] border p-5 shadow-xl">
            <p className="text-xs uppercase tracking-[0.2em] dashboard-text-muted">{item.label}</p>
            <p className="mt-3 text-3xl font-semibold text-[#2B2C40]">{item.value}</p>
          </article>
        ))}
      </div>

      <section className="dashboard-card rounded-[28px] border p-0 overflow-hidden shadow-xl">
        <div className="border-b px-6 py-4">
          <h3 className="text-lg font-semibold text-[#2B2C40]">Pesquisas</h3>
          <p className="mt-1 text-sm dashboard-text-muted">
            Status dos convites considerando o filtro atual.
          </p>
        </div>

        {loading && (
          <div className="px-6 py-10 text-center text-sm text-[#8592A3]">Carregando pesquisas...</div>
        )}

        {error && (
          <div className="px-6 py-10 text-center text-sm text-rose-600">
            Não foi possível carregar o andamento das pesquisas.
          </div>
        )}

        {!loading && !error && filteredPesquisas.length === 0 && (
          <div className="px-6 py-10 text-center text-sm text-[#8592A3]">
            Nenhuma pesquisa encontrada para os filtros selecionados.
          </div>
        )}

        {!loading && !error && filteredPesquisas.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left">
              <thead className="bg-[#F8FAFF]">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-[#2B2C40]">Pesquisa</th>
                  <th className="px-6 py-4 text-sm font-semibold text-[#2B2C40]">Vigência</th>
                  <th className="px-6 py-4 text-sm font-semibold text-[#2B2C40]">Convites</th>
                  <th className="px-6 py-4 text-sm font-semibold text-[#2B2C40]">Pendentes</th>
                  <th className="px-6 py-4 text-sm font-semibold text-[#2B2C40]">Em progresso</th>
                  <th className="px-6 py-4 text-sm font-semibold text-[#2B2C40]">Concluídos</th>
                  <th className="px-6 py-4 text-sm font-semibold text-[#2B2C40]">Progresso</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredPesquisas.map((pesquisa) => {
                  const counts = countByStatus(pesquisa.convites);
                  const total = pesquisa.convites.length;
                  const pct = total > 0 ? Math.round((counts.completo / total) * 100) : 0;

                  return (
                    <tr key={pesquisa.id} className="hover:bg-[#F4F6FA] transition-colors">
                      <td className="px-6 py-4 align-top text-sm font-medium text-[#2B2C40]">
                        {pesquisa.nome}
                      </td>
                      <td className="px-6 py-4 align-top text-sm text-[#6C7287]">
                        {formatDate(pesquisa.dataInicial)} — {formatDate(pesquisa.dataFinal)}
                      </td>
                      <td className="px-6 py-4 align-top text-sm text-[#2B2C40]">{total}</td>
                      <td className="px-6 py-4 align-top text-sm text-[#6C7287]">{counts.pendente}</td>
                      <td className="px-6 py-4 align-top text-sm text-[#6C7287]">{counts.emProgresso}</td>
                      <td className="px-6 py-4 align-top text-sm text-[#2B2C40]">{counts.completo}</td>
                      <td className="px-6 py-4 align-top text-sm text-[#2B2C40]">
                        <div className="min-w-[120px] space-y-1">
                          <div className="flex items-center justify-between text-xs text-[#8592A3]">
                            <span>{pct}%</span>
                            <span>
                              {counts.completo}/{total || 0}
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-[#F4F6FA]">
                            <div
                              className="h-2 rounded-full bg-[#696CFF]"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </td>
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
