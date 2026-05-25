import { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { Search, ChevronRight, RadioTower } from 'lucide-react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useDisparoStore } from '../../store/disparoStore';
import { GET_PESQUISAS_PAGINATED } from '../../graphql/queries/disparo.queries';
import type { GetPesquisasData, PesquisaNode } from '../../graphql/types/disparo.types';

interface Props {
  onNext: () => void;
}

const PAGE_SIZE = 8;

export function StepSelecionarPesquisa({ onNext }: Props) {

  const pesquisaId = useDisparoStore((s) => s.pesquisaId);
  const selecionarPesquisa = useDisparoStore((s) => s.selecionarPesquisa);

  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');

  const { data, loading } = useQuery<GetPesquisasData>(GET_PESQUISAS_PAGINATED, {
    variables: {
      first: PAGE_SIZE,
      where: appliedSearch ? { nome: { contains: appliedSearch } } : null,
    },
    fetchPolicy: 'cache-first',
  });

  const pesquisas = data?.pesquisas?.nodes ?? [];

  function handleSelecionar(id: string, nome: string) {
    selecionarPesquisa(id, nome);
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="dashboard-card rounded-[20px] border shadow-sm p-6">
        <h3 className="text-base font-semibold text-[#2B2C40] mb-4">Selecione a pesquisa</h3>

        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <Input
              placeholder="Buscar por nome da pesquisa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && setAppliedSearch(search)}
            />
          </div>
          <Button
            type="button"
            onClick={() => setAppliedSearch(search)}
            className="rounded-2xl px-5 py-3 inline-flex items-center gap-2 mb-2"
          >
            <Search className="h-4 w-4" />
            Buscar
          </Button>
        </div>
      </div>

      {/* Lista */}
      <div className="dashboard-card rounded-[20px] border shadow-sm overflow-hidden">
        {loading && (
          <div className="py-12 text-center text-sm text-[#8592A3]">Carregando pesquisas...</div>
        )}

        {!loading && pesquisas.length === 0 && (
          <div className="py-12 text-center text-sm text-[#8592A3]">Nenhuma pesquisa encontrada.</div>
        )}

        {!loading && pesquisas.map((p: PesquisaNode) => {
          const isSelected = pesquisaId === String(p.id);
          const totalConvites = p.convites?.length ?? 0;
          const dataFinal = p.dataFinal ? new Date(p.dataFinal).toLocaleDateString('pt-BR') : '—';

          return (
            <button
              key={p.id}
              type="button"
              onClick={() => handleSelecionar(String(p.id), p.nome)}
              className={[
                'w-full flex items-center justify-between px-6 py-4 border-b last:border-b-0 text-left transition-all',
                isSelected
                  ? 'bg-[#F0F0FF] border-l-4 border-l-[#696CFF]'
                  : 'hover:bg-[#F8FAFF] border-l-4 border-l-transparent',
              ].join(' ')}
            >
              <div className="flex items-center gap-4">
                <div className={[
                  'flex items-center justify-center w-10 h-10 rounded-xl transition-all',
                  isSelected ? 'bg-[#696CFF] text-white' : 'bg-[#F4F6FA] text-[#8592A3]',
                ].join(' ')}>
                  <RadioTower className="h-5 w-5" />
                </div>
                <div>
                  <p className={['font-medium text-sm', isSelected ? 'text-[#696CFF]' : 'text-[#2B2C40]'].join(' ')}>
                    {p.nome}
                  </p>
                  <p className="text-xs text-[#8592A3] mt-0.5">
                    Válida até {dataFinal} · {totalConvites} convite{totalConvites !== 1 ? 's' : ''} enviado{totalConvites !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {isSelected && (
                <span className="text-xs font-semibold text-[#696CFF] bg-[#E6E7FF] px-3 py-1 rounded-full">
                  Selecionada
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Ação */}
      <div className="flex justify-end">
        <Button
          type="button"
          onClick={onNext}
          disabled={!pesquisaId}
          className="rounded-2xl px-6 py-3 inline-flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Próximo: Destinatários
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}