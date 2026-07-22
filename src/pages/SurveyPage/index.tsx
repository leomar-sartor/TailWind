import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import { GET_SESSAO_PESQUISA } from '../../graphql/queries/pesquisa.queries.ts';
import { useSurveyStore, Pesquisa } from '../../store/surveyStore.ts';

import { SurveyQuestion } from './SurveyQuestion.tsx';
import { SurveyFinished } from './SurveyFinished.tsx';
import { SurveyInvalid } from './SurveyInvalid.tsx';
import { Loader } from 'lucide-react';

import headerImage from '@/assets/logos/LogoHeaderFormSample.png';
import { ServerError } from '@apollo/client/errors';

interface GetSessaoPesquisaData {
  sessaoPesquisa: {
    pesquisa: Pesquisa;
    ultimaQuestaoRespondidaId: string | null;
    respostasParciais: string | null;
  };
}

export function SurveyPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const inicializar = useSurveyStore((s) => s.inicializar);
  const reset = useSurveyStore((s) => s.reset);
  const isFinished = useSurveyStore((s) => s.isFinished);
  const hasPesquisa = useSurveyStore((s) => s.pesquisa !== null);

  const { data, loading, error } = useQuery<GetSessaoPesquisaData>(GET_SESSAO_PESQUISA, {
    variables: { token },
    skip: !token,
    fetchPolicy: 'network-only',
  });

  // Limpa estado ao trocar de token e no unmount (evita vazamento entre pesquisas)
  useEffect(() => {
    reset();

    return () => {
      reset();
    };
  }, [token, reset]);

  // Sempre inicializa para o token atual quando a sessão chega (ignora data stale enquanto loading)
  useEffect(() => {
    if (!token || loading || !data?.sessaoPesquisa) return;

    const { pesquisa, ultimaQuestaoRespondidaId, respostasParciais } = data.sessaoPesquisa;
    inicializar(token, pesquisa, ultimaQuestaoRespondidaId, respostasParciais);
  }, [token, loading, data?.sessaoPesquisa, inicializar]);

  // ── Token ausente ──────────────────────────────────────────────────────────
  if (!token) {
    return <SurveyInvalid message="Link de pesquisa inválido. Verifique o link enviado por e-mail."/>;
  }

  // ── Carregando ─────────────────────────────────────────────────────────────
  if (loading || (!error && !hasPesquisa && !isFinished)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6" style={{ background: 'var(--color-bg)' }}>
        <img src={headerImage} alt="Logo" className="w-48 h-12 object-contain opacity-80" />
        <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-2xl shadow-md">
          <Loader className="size-5 animate-spin text-[#696CFF] [animation-duration:1.5s]" />
          <span className="text-sm font-medium text-[#384551]">Carregando pesquisa...</span>
        </div>
      </div>
    );
  }

  // ── Erro (token inválido, expirado, já respondido) ─────────────────────────
  if (error) {
    const apolloError = error as ServerError;
    const msg = apolloError.message ?? 'Não foi possível carregar a pesquisa.';
    return <SurveyInvalid message={msg} />;
  }

  // ── Concluída ──────────────────────────────────────────────────────────────
  if (isFinished) {
    return <SurveyFinished />;
  }

  // ── Pesquisa ───────────────────────────────────────────────────────────────
  return <SurveyQuestion />;
}
