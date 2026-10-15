import { useEffect, useMemo, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import { apolloClient } from '../graphql/client';
import { ActiveContext } from './ActiveContext';
import {
  GET_MY_AVAILABLE_ACCESS_CONTEXTS,
  GET_MY_ACCESS_CONTROL,
  type AvailableAccessContext,
  type GetMyAccessControlData,
  type GetMyAvailableAccessContextsData,
} from '../graphql/Auth/accessQueries';
import { useActiveContextStore } from './activeContextStore';

const EMPTY_CONTEXTS: AvailableAccessContext[] = [];

function sameContext(
  context: AvailableAccessContext,
  tenantId: string | null,
  companyId: string | null,
) {
  return context.tenantId === tenantId && context.companyId === companyId;
}

export function ActiveContextGate() {
  const [switching, setSwitching] = useState(false);
  const { data, loading, error, refetch } = useQuery<GetMyAvailableAccessContextsData>(
    GET_MY_AVAILABLE_ACCESS_CONTEXTS,
    { fetchPolicy: 'network-only' },
  );
  const tenantId = useActiveContextStore((state) => state.tenantId);
  const companyId = useActiveContextStore((state) => state.companyId);
  const setActiveContext = useActiveContextStore((state) => state.setActiveContext);
  const clearActiveContext = useActiveContextStore((state) => state.clearActiveContext);
  const contexts = useMemo(() => (data?.myAvailableAccessContexts?.contexts ?? EMPTY_CONTEXTS).map(context => ({
    ...context, tenantId: context.tenantId == null ? null : String(context.tenantId), companyId: context.companyId == null ? null : String(context.companyId),
  })), [data]);
  const activeContext = contexts.find((context) => sameContext(context, tenantId, companyId));

  useEffect(() => {
    if (loading || !data) return;

    if (contexts.length === 1) {
      const onlyContext = contexts[0];
      if (!sameContext(onlyContext, tenantId, companyId)) {
        setActiveContext(onlyContext.tenantId, onlyContext.companyId);
      }
      return;
    }

    if ((tenantId || companyId) && !activeContext) clearActiveContext();
  }, [activeContext, clearActiveContext, companyId, contexts, data, loading, setActiveContext, tenantId]);

  async function switchContext(nextContext: AvailableAccessContext) {
    if (sameContext(nextContext, tenantId, companyId)) return;
    setSwitching(true);
    setActiveContext(nextContext.tenantId, nextContext.companyId);
    try {
      await apolloClient.clearStore();
      await refetch();
    } finally {
      setSwitching(false);
    }
  }

  if (switching) return <main className="min-h-screen grid place-items-center dashboard-text">Alterando contexto...</main>;

  if (loading) {
    return <main className="min-h-screen grid place-items-center dashboard-text">Carregando contextos autorizados...</main>;
  }

  if (error) {
    return <main className="min-h-screen grid place-items-center p-6 dashboard-text">Não foi possível carregar seus contextos autorizados.</main>;
  }

  if (contexts.length === 0) {
    return <main className="min-h-screen grid place-items-center p-6 dashboard-text">Nenhum perfil com permissões ativas está disponível para esta conta. Solicite ao Admin a configuração em Perfis.</main>;
  }

  if (!activeContext) {
    return (
      <main className="min-h-screen bg-[var(--color-surface-soft)] px-4 py-12 dashboard-text">
        <section className="mx-auto max-w-xl rounded-xl border dashboard-border bg-white p-6 shadow-sm dark:bg-[var(--color-surface)]">
          <h1 className="text-xl font-semibold">Selecione um contexto</h1>
          <p className="mt-2 text-sm dashboard-text-muted">Escolha um tenant e uma empresa autorizados para continuar.</p>
          <div className="mt-6 grid gap-3">
            {contexts.map((context) => (
              <button
                key={`${context.tenantId}:${context.companyId ?? ''}`}
                type="button"
                onClick={() => void switchContext(context)}
                className="flex min-h-11 items-center justify-between rounded-lg border dashboard-border px-4 py-2 text-left transition hover:bg-[#F4F6FA] dark:hover:bg-[var(--color-surface-soft)]"
              >
                <span>
                  <span className="block font-medium">{context.companyName ?? context.tenantName}</span>
                  {context.companyName && <span className="text-sm dashboard-text-muted">{context.tenantName}</span>}
                </span>
                <span aria-hidden="true">›</span>
              </button>
            ))}
          </div>
        </section>
      </main>
    );
  }

  return <ContextPermissions key={`${tenantId}:${companyId}`} contexts={contexts} activeContext={activeContext}
    isAdmin={data?.myAvailableAccessContexts?.isAdmin ?? false} switchContext={switchContext} />;
}

function ContextPermissions({ contexts, activeContext, isAdmin, switchContext }: {
  contexts: AvailableAccessContext[];
  activeContext: AvailableAccessContext;
  isAdmin: boolean;
  switchContext: (context: AvailableAccessContext) => Promise<void>;
}) {
  const { data: accessControlData, loading: accessControlLoading, error: accessControlError, refetch } = useQuery<GetMyAccessControlData>(
    GET_MY_ACCESS_CONTROL, { fetchPolicy: 'network-only', context: { queryDeduplication: false } },
  );
  if (accessControlError) {
    return <main className="min-h-screen grid place-items-center p-6 dashboard-text"><div className="space-y-3 text-center">
      <p>Não foi possível carregar as permissões deste contexto.</p>
      <button type="button" className="rounded-lg border dashboard-border px-4 py-2" onClick={() => void refetch()}>Tentar novamente</button>
    </div></main>;
  }
  if (accessControlLoading || !accessControlData) {
    return <main className="min-h-screen grid place-items-center dashboard-text">Carregando permissões do contexto...</main>;
  }


  return (
    <ActiveContext.Provider value={{
      contexts,
      activeContext,
      personas: accessControlData.myPersonas,
      permissions: accessControlData.myPermissions,
      isAdmin,
      switchContext,
    }}>
      <Outlet />
    </ActiveContext.Provider>
  );
}
