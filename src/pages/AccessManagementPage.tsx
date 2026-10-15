import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { UserPlus, UserRoundX } from 'lucide-react';
import { Button } from '../components/Button';
import { FormErrorAlert } from '../components/FormErrorAlert';
import { useActiveContext } from '../auth/ActiveContext';
import {
  GET_ACCESS_MANAGED_USERS,
  GET_ACTIVE_PERSONA_ASSIGNMENTS,
  type GetActivePersonaAssignmentsData,
  type GetAccessManagedUsersData,
} from '../graphql/Auth/accessQueries';
import {
  ASSIGN_PERSONA,
  GRANT_COMPANY_MEMBERSHIP,
  GRANT_TENANT_MEMBERSHIP,
  REVOKE_PERSONA,
} from '../graphql/Auth/accessMutations';
import { getGraphQLErrorMessage } from '../utils/confirmToast';
import { toast } from 'react-toastify';

export function checkAccessMutation(result: unknown) {
  if (!result || typeof result !== 'object') return;
  const response = result as { error?: unknown; data?: Record<string, unknown> };
  if (response.error) throw response.error;
  if (!response.data || Object.values(response.data).some(value => value === false || value === null))
    throw new Error('Nenhuma alteração foi aplicada. Verifique se o usuário possui o acesso ou vínculo selecionado.');
}

const PERSONAS = [
  { code: 'operador', label: 'Operador' },
  { code: 'colaborador', label: 'Colaborador' },
  { code: 'empresa', label: 'Empresa' },
];

export function AccessManagementPage() {
  const { isAdmin } = useActiveContext();
  return isAdmin ? <ContextualAccessPage /> : <FormErrorAlert message="Somente Admin pode gerenciar perfis e personas." />;
}
function ContextualAccessPage() {
  const { contexts } = useActiveContext();
  const companies = contexts.filter(context => context.companyId !== null);
  const [busy, setBusy] = useState(false);
  const [userId, setUserId] = useState('');
  const [companyId, setCompanyId] = useState('');
  const tenantId = companies.find(company => String(company.companyId) === companyId)?.tenantId;
  const [personaCode, setPersonaCode] = useState(PERSONAS[0].code);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { data: usersData, loading: usersLoading, refetch: refetchUsers } = useQuery<GetAccessManagedUsersData>(
    GET_ACCESS_MANAGED_USERS,
    { fetchPolicy: 'network-only' },
  );
  const { data: assignmentsData, refetch: refetchAssignments } = useQuery<GetActivePersonaAssignmentsData>(
    GET_ACTIVE_PERSONA_ASSIGNMENTS,
    { fetchPolicy: 'network-only' },
  );

  const [grantTenant] = useMutation(GRANT_TENANT_MEMBERSHIP);
  const [grantCompany] = useMutation(GRANT_COMPANY_MEMBERSHIP);
  const [assignPersona] = useMutation(ASSIGN_PERSONA);
  const [revokePersona] = useMutation(REVOKE_PERSONA);

  const users = usersData?.accessManagedUsers ?? [];
  const assignments = assignmentsData?.activePersonaAssignments ?? [];
  async function runAdminAction(action: () => Promise<unknown>) {
    setErrorMessage(null);
    setBusy(true);
    try {
      checkAccessMutation(await action());
      await refetchUsers();
      await refetchAssignments();
      toast.success('Acesso atualizado com sucesso.');
      return true;
    } catch (error: unknown) {
      const message = getGraphQLErrorMessage(error) ?? 'Não foi possível atualizar o acesso.';
      setErrorMessage(message);
      toast.error(message);
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function assignContextualPersona() {
    if (!userId || !tenantId) return;
    await runAdminAction(async () => {
      if (companyId) {
        checkAccessMutation(await grantCompany({ variables: { userId: Number(userId), companyId: Number(companyId) } }));
      } else {
        checkAccessMutation(await grantTenant({ variables: { userId: Number(userId), tenantId: Number(tenantId) } }));
      }
      checkAccessMutation(await assignPersona({
        variables: {
          userId: Number(userId),
          personaCode,
          tenantId: Number(tenantId),
          companyId: companyId ? Number(companyId) : null,
        },
      }));
    });
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] dashboard-text-muted">Administração global</p>
        <h2 className="mt-1 text-2xl font-semibold dashboard-text">Perfis e personas</h2>
      </header>

      <FormErrorAlert message={errorMessage} />

      <section className="dashboard-card rounded-xl border p-5 sm:p-6">
        <h3 className="text-lg font-semibold dashboard-text">Atribuir acesso contextual</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label>
            <span className="mb-1 block text-sm font-medium dashboard-text">Usuário</span>
            <select className="w-full border dashboard-border bg-white px-3 py-2 dark:bg-[var(--color-surface-soft)]" value={userId} onChange={(event) => setUserId(event.target.value)}>
              <option value="">Selecione um usuário</option>
              {users.map((user) => <option key={user.id} value={user.id}>{user.userName || user.email} · {user.email}</option>)}
            </select>
          </label>
          <label>
            <span className="mb-1 block text-sm font-medium dashboard-text">Empresa</span>
            <select className="w-full border dashboard-border bg-white px-3 py-2 dark:bg-[var(--color-surface-soft)]" value={companyId} onChange={(event) => setCompanyId(event.target.value)}>
              <option value="">Selecione uma empresa</option>
              {companies.map((company) => <option key={company.companyId} value={company.companyId!}>{company.companyName}</option>)}
            </select>
          </label>
          <label>
            <span className="mb-1 block text-sm font-medium dashboard-text">Persona</span>
            <select className="w-full border dashboard-border bg-white px-3 py-2 dark:bg-[var(--color-surface-soft)]" value={personaCode} onChange={(event) => setPersonaCode(event.target.value)}>
              {PERSONAS.map((persona) => <option key={persona.code} value={persona.code}>{persona.label}</option>)}
            </select>
          </label>
        </div>
        <div className="mt-5 flex justify-end">
          <Button type="button" disabled={busy || !userId || !tenantId || usersLoading} onClick={() => void assignContextualPersona()}>
            <UserPlus className="h-4 w-4" /> Conceder vínculo e persona
          </Button>
        </div>
      </section>

      <section className="border-t dashboard-border pt-5">
        <h3 className="mb-3 text-lg font-semibold dashboard-text">Personas atribuídas</h3>
        <div className="divide-y dashboard-border border-y">
          {assignments.map((assignment) => (
            <article key={assignment.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>
                <p className="font-medium dashboard-text">{assignment.userName || assignment.email} · {assignment.personaCode}</p>
                <p className="text-sm dashboard-text-muted">{assignment.tenantName}{assignment.companyName ? ` · ${assignment.companyName}` : ' · Todas as empresas do tenant'}</p>
              </div>
              <button type="button" disabled={busy} className="rounded-lg border dashboard-border p-2 text-rose-600" aria-label={`Revogar persona ${assignment.personaCode} de ${assignment.email}`} onClick={() => void runAdminAction(() => revokePersona({ variables: { assignmentId: Number(assignment.id) } }))}>
                <UserRoundX className="h-4 w-4" />
              </button>
            </article>
          ))}
          {assignments.length === 0 && <p className="py-8 text-center text-sm dashboard-text-muted">Nenhuma persona contextual atribuída.</p>}
        </div>
      </section>

    </div>
  );
}
