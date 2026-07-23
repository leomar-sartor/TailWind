import { useQuery } from '@apollo/client/react';
import { NetworkStatus } from '@apollo/client';
import { Building2, ChevronLeft, ChevronRight, Layers, Users, CheckSquare, Square } from 'lucide-react';
import { Button } from '../../components/Button';
import { useDisparoStore } from '../../store/disparoStore';
import {
  GET_EMPRESAS_DISPARO,
  GET_SETORES_BY_EMPRESA,
  GET_COLABORADORES_BY_SETOR,
} from '../../graphql/queries/disparo.queries';
import type {
  GetEmpresasData,
  GetEmpresasDisparoVars,
  GetSetoresData,
  GetSetoresByEmpresaVars,
  GetColaboradoresData,
  GetColaboradoresBySetorVars,
  EmpresaNode,
  SetorNode,
  ColaboradorNode,
} from '../../graphql/types/disparo.types';
import { mergeConnectionNodes } from '../../utils/mergeConnectionNodes';

interface Props {
  onNext: () => void;
  onBack: () => void;
}

const COLABORADORES_PAGE_SIZE = 50;

export function StepSelecionarDestinatarios({ onNext, onBack }: Props) {

  const empresaId = useDisparoStore((s) => s.empresaId);
  const empresaNome = useDisparoStore((s) => s.empresaNome);
  const setorIdsSelecionados = useDisparoStore((s) => s.setorIdsSelecionados);
  const colaboradoresSelecionados = useDisparoStore((s) => s.colaboradoresSelecionados);
  
  const selecionarEmpresa = useDisparoStore((s) => s.selecionarEmpresa);
  const toggleSetor = useDisparoStore((s) => s.toggleSetor);
  const selecionarTodosSetores = useDisparoStore((s) => s.selecionarTodosSetores);
  const limparSetores = useDisparoStore((s) => s.limparSetores);
  const toggleColaborador = useDisparoStore((s) => s.toggleColaborador);
  const selecionarTodosColaboradores = useDisparoStore((s) => s.selecionarTodosColaboradores);
  const setColaboradoresSelecionados = useDisparoStore((s) => s.setColaboradoresSelecionados);

  // ── Empresas ────────────────────────────────────────────────────────────────
  const { data: empresasData, loading: loadingEmpresas } = useQuery<
    GetEmpresasData,
    GetEmpresasDisparoVars
  >(GET_EMPRESAS_DISPARO, {
    variables: { first: 50 },
    fetchPolicy: 'cache-first',
  });
  const empresas = empresasData?.empresas?.nodes ?? [];

  // ── Setores da empresa selecionada ──────────────────────────────────────────
  const { data: setoresData, loading: loadingSetores } = useQuery<
    GetSetoresData,
    GetSetoresByEmpresaVars
  >(GET_SETORES_BY_EMPRESA, {
    variables: { first: 100, where: empresaId ? { empresaId: { eq: Number(empresaId) } } : null },
    skip: !empresaId,
    fetchPolicy: 'cache-first',
  });
  const setores = setoresData?.setores?.nodes ?? [];

  // ── Colaboradores dos setores selecionados ──────────────────────────────────
  const colaboradoresWhere = setorIdsSelecionados.length > 0
    ? { setorId: { in: setorIdsSelecionados.map(Number) } }
    : null;

  const {
    data: colaboradoresData,
    loading: loadingColabs,
    fetchMore: fetchMoreColaboradores,
    networkStatus,
  } = useQuery<GetColaboradoresData, GetColaboradoresBySetorVars>(GET_COLABORADORES_BY_SETOR, {
    variables: {
      first: COLABORADORES_PAGE_SIZE,
      where: colaboradoresWhere,
    },
    skip: setorIdsSelecionados.length === 0,
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
  });
  const colaboradores = colaboradoresData?.colaboradores?.nodes ?? [];
  const colaboradoresPageInfo = colaboradoresData?.colaboradores?.pageInfo;
  const colaboradoresTotalCount = colaboradoresData?.colaboradores?.totalCount ?? colaboradores.length;
  const hasMoreColaboradores = !!colaboradoresPageInfo?.hasNextPage;
  const loadingMoreColaboradores = networkStatus === NetworkStatus.fetchMore;

  const handleLoadMoreColaboradores = async () => {
    if (!hasMoreColaboradores || !colaboradoresPageInfo?.endCursor || loadingMoreColaboradores) return;

    try {
      await fetchMoreColaboradores({
        variables: {
          first: COLABORADORES_PAGE_SIZE,
          after: colaboradoresPageInfo.endCursor,
          where: colaboradoresWhere,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          return {
            ...fetchMoreResult,
            colaboradores: {
              ...fetchMoreResult.colaboradores,
              nodes: mergeConnectionNodes(
                prev.colaboradores?.nodes,
                fetchMoreResult.colaboradores.nodes,
              ),
            },
          };
        },
      });
    } catch (err) {
      console.error('Erro ao carregar mais colaboradores:', err);
    }
  };

  const todosSetoresSelecionados = setores.length > 0 && setorIdsSelecionados.length === setores.length;
  const todosColabsSelecionados = colaboradores.length > 0 && colaboradoresSelecionados.length === colaboradores.length;

  return (
    <div className="space-y-4">

      {/* ── Empresa ─────────────────────────────────────────────────────────── */}
      <div className="dashboard-card rounded-[20px] border shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="h-4 w-4 text-[#696CFF]" />
          <h3 className="text-base font-semibold text-[#2B2C40]">Empresa</h3>
        </div>

        {loadingEmpresas ? (
          <p className="text-sm text-[#8592A3]">Carregando empresas...</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {empresas.map((e: EmpresaNode) => {
              const isSelected = empresaId === String(e.id);
              return (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => selecionarEmpresa(String(e.id), e.nomeFantasia)}
                  className={[
                    'px-4 py-2 rounded-xl text-sm font-medium border transition-all',
                    isSelected
                      ? 'bg-[#696CFF] text-white border-[#696CFF] shadow-md'
                      : 'bg-white text-[#384551] border-[#E4E6E8] hover:border-[#696CFF] hover:bg-[#F4F6FA]',
                  ].join(' ')}
                >
                  {e.nomeFantasia}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Setores ─────────────────────────────────────────────────────────── */}
      {empresaId && (
        <div className="dashboard-card rounded-[20px] border shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-[#696CFF]" />
              <h3 className="text-base font-semibold text-[#2B2C40]">
                Setores de <span className="text-[#696CFF]">{empresaNome}</span>
              </h3>
            </div>
            {setores.length > 0 && (
              <button
                type="button"
                className="text-xs text-[#696CFF] hover:underline"
                onClick={() =>
                  todosSetoresSelecionados
                    ? limparSetores()
                    : selecionarTodosSetores(setores.map((s: SetorNode) => String(s.id)))
                }
              >
                {todosSetoresSelecionados ? 'Desmarcar todos' : 'Selecionar todos'}
              </button>
            )}
          </div>

          {loadingSetores ? (
            <p className="text-sm text-[#8592A3]">Carregando setores...</p>
          ) : setores.length === 0 ? (
            <p className="text-sm text-[#8592A3]">Nenhum setor encontrado para esta empresa.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {setores.map((s: SetorNode) => {
                const isSelected = setorIdsSelecionados.includes(String(s.id));
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleSetor(String(s.id))}
                    className={[
                      'px-4 py-2 rounded-xl text-sm font-medium border transition-all inline-flex items-center gap-2',
                      isSelected
                        ? 'bg-[#696CFF] text-white border-[#696CFF] shadow-md'
                        : 'bg-white text-[#384551] border-[#E4E6E8] hover:border-[#696CFF] hover:bg-[#F4F6FA]',
                    ].join(' ')}
                  >
                    {isSelected
                      ? <CheckSquare className="h-3.5 w-3.5" />
                      : <Square className="h-3.5 w-3.5 text-[#C4C8CC]" />
                    }
                    {s.nome}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Colaboradores ───────────────────────────────────────────────────── */}
      {setorIdsSelecionados.length > 0 && (
        <div className="dashboard-card rounded-[20px] border shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-[#696CFF]" />
              <h3 className="text-base font-semibold text-[#2B2C40]">
                Colaboradores
                {!loadingColabs && (
                  <span className="ml-2 text-xs font-normal text-[#8592A3]">
                    ({colaboradoresSelecionados.length}/{colaboradores.length} selecionados
                    {colaboradoresTotalCount > colaboradores.length
                      ? ` · ${colaboradores.length} de ${colaboradoresTotalCount} carregados`
                      : ''}
                    )
                  </span>
                )}
              </h3>
            </div>
            {colaboradores.length > 0 && (
              <button
                type="button"
                className="text-xs text-[#696CFF] hover:underline"
                onClick={() =>
                  todosColabsSelecionados
                    ? setColaboradoresSelecionados([])
                    : selecionarTodosColaboradores(colaboradores.map((c: ColaboradorNode) => String(c.id)))
                }
              >
                {todosColabsSelecionados ? 'Desmarcar todos' : 'Selecionar todos (carregados)'}
              </button>
            )}
          </div>

          {loadingColabs && !loadingMoreColaboradores && (
            <div className="py-10 text-center text-sm text-[#8592A3]">Carregando colaboradores...</div>
          )}

          {!loadingColabs && colaboradores.length === 0 && (
            <div className="py-10 text-center text-sm text-[#8592A3]">
              Nenhum colaborador encontrado nos setores selecionados.
            </div>
          )}

          {(!loadingColabs || loadingMoreColaboradores) && colaboradores.map((c: ColaboradorNode) => {
            const isSelected = colaboradoresSelecionados.includes(String(c.id));

            return (
              <button
                key={c.id}
                type="button"
                onClick={() => toggleColaborador(String(c.id))}
                className={[
                  'w-full flex items-center gap-4 px-6 py-3 border-b last:border-b-0 text-left transition-all',
                  isSelected ? 'bg-[#F0F0FF]' : 'hover:bg-[#F8FAFF]',
                ].join(' ')}
              >
                <div className={[
                  'flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all',
                  isSelected ? 'bg-[#696CFF] border-[#696CFF]' : 'border-[#C4C8CC]',
                ].join(' ')}>
                  {isSelected && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>

                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#E6E7FF] text-[#696CFF] text-xs font-bold flex items-center justify-center">
                  {c.nome?.[0]?.toUpperCase() ?? '?'}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#2B2C40] truncate">{c.nome}</p>
                  <p className="text-xs text-[#8592A3] truncate">{c.email}</p>
                </div>

                <span className="text-xs text-[#8592A3] bg-[#F4F6FA] px-2 py-1 rounded-full hidden sm:block">
                  {c.setor?.nome ?? '—'}
                </span>
              </button>
            );
          })}

          {hasMoreColaboradores && (
            <div className="px-6 py-4 border-t bg-[#F8FAFF] space-y-2">
              <p className="text-xs text-[#8592A3]">
                Há mais colaboradores além dos {colaboradores.length} carregados. Carregue todos antes de confirmar o disparo.
              </p>
              <button
                type="button"
                onClick={handleLoadMoreColaboradores}
                disabled={loadingMoreColaboradores}
                className="text-sm font-medium text-[#696CFF] hover:underline disabled:opacity-50"
              >
                {loadingMoreColaboradores ? 'Carregando...' : 'Carregar mais colaboradores'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Navegação */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E4E6E8] bg-white text-sm text-[#384551] hover:bg-[#F4F6FA] transition"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar
        </button>

        <Button
          type="button"
          onClick={onNext}
          disabled={colaboradoresSelecionados.length === 0}
          className="rounded-2xl px-6 py-3 inline-flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Próximo: Confirmar
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
