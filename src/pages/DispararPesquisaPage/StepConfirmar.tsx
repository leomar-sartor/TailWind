import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { CheckCircle, ChevronLeft, RadioTower, Users, Send, AlertTriangle } from 'lucide-react';
import { Button } from '../../components/Button';
import { useDisparoStore } from '../../store/disparoStore';
import { DISPARAR_PESQUISA_MUTATION } from '../../graphql/mutations/disparo.mutations';
import { GET_COLABORADORES_BY_SETOR } from '../../graphql/queries/disparo.queries';
import type {
  ColaboradorNode,
  DispararPesquisaData,
  DispararPesquisaVars,
  GetColaboradoresBySetorVars,
  GetColaboradoresData,
} from '../../graphql/types/disparo.types';
import { getGraphQLErrorMessage } from '../../utils/confirmToast';

interface Props {
  onBack: () => void;
  onSuccess: () => void;
}

export function StepConfirmar({ onBack, onSuccess }: Props) {
  const pesquisaId = useDisparoStore((s) => s.pesquisaId);
  const pesquisaNome = useDisparoStore((s) => s.pesquisaNome);
  const empresaNome = useDisparoStore((s) => s.empresaNome);
  const setorIdsSelecionados = useDisparoStore((s) => s.setorIdsSelecionados);
  const colaboradoresSelecionados = useDisparoStore((s) => s.colaboradoresSelecionados);
  const limparTudo = useDisparoStore((s) => s.limparTudo);

  const [disparado, setDisparado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [dispararPesquisa, { loading }] = useMutation<DispararPesquisaData, DispararPesquisaVars>(
    DISPARAR_PESQUISA_MUTATION,
  );

  // Busca nomes dos colaboradores selecionados para exibição
  const { data: colaboradoresData } = useQuery<GetColaboradoresData, GetColaboradoresBySetorVars>(
    GET_COLABORADORES_BY_SETOR,
    {
      variables: {
        first: 50,
        where: setorIdsSelecionados.length > 0
          ? {
              and: [
                { setorId: { in: setorIdsSelecionados.map(Number) } },
                { id: { in: colaboradoresSelecionados.map(Number) } },
              ],
            }
          : null,
      },
      skip: setorIdsSelecionados.length === 0,
      fetchPolicy: 'cache-first',
    },
  );
  const todosColaboradores = colaboradoresData?.colaboradores?.nodes ?? [];
  const colaboradoresParaEnviar = todosColaboradores.filter((c: ColaboradorNode) =>
    colaboradoresSelecionados.includes(String(c.id))
  );

  async function handleDisparar() {
    setErro(null);
    try {
      const result = await dispararPesquisa({
        variables: {
          pesquisaId: Number(pesquisaId),
          colaboradorIds: colaboradoresSelecionados.map(Number),
        },
      });

      const mutationErrorMessage = getGraphQLErrorMessage(result.error);
      if (mutationErrorMessage) {
        setErro(mutationErrorMessage);
        return;
      }

      setDisparado(true);
    } catch (err: unknown) {
      setErro(getGraphQLErrorMessage(err) ?? 'Erro ao disparar pesquisa. Tente novamente.');
    }
  }

  function handleNovoDisparo() {
    limparTudo();
    setDisparado(false);
    setErro(null);
    onSuccess();
  }

  // ── Sucesso ──────────────────────────────────────────────────────────────────
  if (disparado) {
    return (
      <div className="dashboard-card rounded-[20px] border shadow-sm p-10 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-[#E6FFE9] rounded-full p-4">
            <CheckCircle className="h-12 w-12 text-[#71DD37]" strokeWidth={1.5} />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-[#2B2C40] mb-2">Pesquisa disparada!</h3>
        <p className="text-sm text-[#6C7287] mb-1">
          <span className="font-medium text-[#696CFF]">{colaboradoresSelecionados.length}</span> convite{colaboradoresSelecionados.length !== 1 ? 's' : ''} gerado{colaboradoresSelecionados.length !== 1 ? 's' : ''} para
        </p>
        <p className="text-sm font-medium text-[#2B2C40] mb-8">"{pesquisaNome}"</p>

        <div className="bg-[#F4F6FA] rounded-xl px-4 py-3 text-xs text-[#8592A3] mb-6">
          Os tokens de acesso foram criados. Envie os links no formato
          <span className="font-mono text-[#696CFF] ml-1">/survey?token=&#123;token&#125;</span> para cada colaborador.
        </div>

        <Button
          type="button"
          onClick={handleNovoDisparo}
          className="rounded-2xl px-6 py-3 inline-flex items-center gap-2"
        >
          <Send className="h-4 w-4" />
          Novo disparo
        </Button>
      </div>
    );
  }

  // ── Resumo para confirmar ─────────────────────────────────────────────────────
  return (
    <div className="space-y-4">

      {/* Resumo */}
      <div className="dashboard-card rounded-[20px] border shadow-sm p-6 space-y-5">
        <h3 className="text-base font-semibold text-[#2B2C40]">Confirmar disparo</h3>

        {/* Pesquisa */}
        <div className="flex items-start gap-4 p-4 rounded-xl bg-[#F4F6FA]">
          <div className="w-9 h-9 rounded-xl bg-[#E6E7FF] flex items-center justify-center flex-shrink-0">
            <RadioTower className="h-4 w-4 text-[#696CFF]" />
          </div>
          <div>
            <p className="text-xs text-[#8592A3] uppercase tracking-wide font-medium mb-0.5">Pesquisa</p>
            <p className="text-sm font-semibold text-[#2B2C40]">{pesquisaNome}</p>
          </div>
        </div>

        {/* Destinatários */}
        <div className="flex items-start gap-4 p-4 rounded-xl bg-[#F4F6FA]">
          <div className="w-9 h-9 rounded-xl bg-[#E6E7FF] flex items-center justify-center flex-shrink-0">
            <Users className="h-4 w-4 text-[#696CFF]" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-[#8592A3] uppercase tracking-wide font-medium mb-0.5">
              Destinatários — {empresaNome}
            </p>
            <p className="text-sm font-semibold text-[#2B2C40] mb-3">
              {colaboradoresSelecionados.length} colaborador{colaboradoresSelecionados.length !== 1 ? 'es' : ''} selecionado{colaboradoresSelecionados.length !== 1 ? 's' : ''}
            </p>

            {/* Lista resumida (máx 5, depois "e mais X") */}
            <div className="space-y-1.5">
              {colaboradoresParaEnviar.slice(0, 5).map((c: ColaboradorNode) => (
                <div key={c.id} className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#696CFF] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                    {c.nome?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <span className="text-xs text-[#384551]">{c.nome}</span>
                  <span className="text-xs text-[#C4C8CC]">·</span>
                  <span className="text-xs text-[#8592A3] truncate">{c.email}</span>
                </div>
              ))}
              {colaboradoresParaEnviar.length > 5 && (
                <p className="text-xs text-[#8592A3] pl-8">
                  e mais {colaboradoresParaEnviar.length - 5} colaborador{colaboradoresParaEnviar.length - 5 !== 1 ? 'es' : ''}...
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Aviso de duplicatas */}
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700">
            Colaboradores que já receberam convite para esta pesquisa serão ignorados automaticamente — não receberão convite duplicado.
          </p>
        </div>
      </div>

      {/* Erro */}
      {erro && (
        <div className="px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700">
          {erro}
        </div>
      )}

      {/* Navegação */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E4E6E8] bg-white text-sm text-[#384551] hover:bg-[#F4F6FA] disabled:opacity-40 transition"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar
        </button>

        <Button
          type="button"
          onClick={handleDisparar}
          disabled={loading}
          className="rounded-2xl px-6 py-3 inline-flex items-center gap-2 disabled:opacity-60"
        >
          {loading ? (
            'Disparando...'
          ) : (
            <>
              <Send className="h-4 w-4" />
              Disparar para {colaboradoresSelecionados.length} colaborador{colaboradoresSelecionados.length !== 1 ? 'es' : ''}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}