import { StatusBadge } from '../components/StatusBadge';
import { UserTenantsEditor } from '../components/admin/UserTenantsEditor';
import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { Edit3, Eye, ShieldCheck, ShieldOff, Trash2 } from 'lucide-react';
import { useActiveContext } from '../auth/ActiveContext';
import { useAuthStore, selectUser } from '../auth/authStore';
import { Button } from '../components/Button';
import { FormErrorAlert } from '../components/FormErrorAlert';
import { CadastroDataTable, CadastroFormHeader, CadastroFormActions, CadastroSearchBar, CadastroTableCell, CadastroTableRow } from '../components/cadastro';
import { GET_ACCESS_MANAGED_USERS, GET_ACTIVE_PERSONA_ASSIGNMENTS, type GetAccessManagedUsersData, type GetActivePersonaAssignmentsData } from '../graphql/Auth/accessQueries';
import { GRANT_GLOBAL_ADMIN, REVOKE_GLOBAL_ADMIN, UPDATE_ACCESS_USER, REMOVE_ACCESS_USER } from '../graphql/Auth/accessMutations';
import { useAdminAction } from '../hooks/useAdminAction';
import { confirmDeletion, getGraphQLErrorMessage } from '../utils/confirmToast';

type ManagedUser = GetAccessManagedUsersData['accessManagedUsers'][number];
const actionClass = 'rounded-lg border dashboard-border p-2 transition hover:bg-[var(--color-surface-soft)] disabled:opacity-40';

export function UsersPage() {
  const { isAdmin } = useActiveContext();
  return isAdmin ? <UsersAdmin /> : <FormErrorAlert message="Somente Admin pode gerenciar usuários." />;
}
function UsersAdmin() {
  const currentUser = useAuthStore(selectUser);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<ManagedUser | null>(null);
  const [editing, setEditing] = useState(false);
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const { data, loading, error, refetch } = useQuery<GetAccessManagedUsersData>(GET_ACCESS_MANAGED_USERS, { fetchPolicy: 'network-only' });
  const { data: assignmentsData, error: assignmentsError, refetch: refetchAssignments } = useQuery<GetActivePersonaAssignmentsData>(GET_ACTIVE_PERSONA_ASSIGNMENTS, { fetchPolicy: 'network-only' });
  const [update] = useMutation(UPDATE_ACCESS_USER);
  const [remove] = useMutation(REMOVE_ACCESS_USER);
  const [grant] = useMutation(GRANT_GLOBAL_ADMIN);
  const [revoke] = useMutation(REVOKE_GLOBAL_ADMIN);
  const { busy, failure, run } = useAdminAction(refetch);
  const users = (data?.accessManagedUsers ?? []).filter(user => `${user.userName} ${user.email}`.toLocaleLowerCase().includes(search.toLocaleLowerCase()));
  const selectedUser = data?.accessManagedUsers.find(user => String(user.id) === String(selected?.id)) ?? selected;
  const assignments = assignmentsData?.activePersonaAssignments.filter(a => String(a.userId) === String(selectedUser?.id)) ?? [];
  function open(user: ManagedUser, edit: boolean) { setSelected(user); setEditing(edit); setUserName(user.userName); setEmail(user.email); }
  function removeUser(user: ManagedUser) {
    confirmDeletion({ title: 'Excluir usuário', message: `Excluir ${user.email}? Contas com vínculos ou histórico não podem ser excluídas.`, confirmLabel: 'Excluir',
      onConfirm: async () => { if (await run(() => remove({ variables: { userId: Number(user.id) } }))) setSelected(null); } });
  }
  function changeAdmin(user: ManagedUser) {
    confirmDeletion({ title: user.isAdmin ? 'Revogar Admin global' : 'Conceder Admin global',
      message: `${user.isAdmin ? 'Revogar' : 'Conceder'} acesso administrativo global para ${user.email}?`, confirmLabel: 'Confirmar',
      onConfirm: async () => { await run(() => (user.isAdmin ? revoke : grant)({ variables: { userId: Number(user.id) } })); } });
  }
  return <div className="space-y-5">
    <header><h2 className="text-xl font-semibold dashboard-text">Usuários</h2><p className="mt-1 text-sm dashboard-text-muted">Consulte dados, edite contas e gerencie o acesso Admin global.</p></header>
    <FormErrorAlert message={failure ?? (error ? getGraphQLErrorMessage(error) ?? 'Não foi possível carregar os usuários.' : null)} />
    {selectedUser && <section className="dashboard-card rounded-xl border p-5 space-y-4" aria-label="Dados do usuário">
<CadastroFormHeader title={editing ? 'Editar usuário' : 'Dados do usuário'} description="Dados da conta e vínculos de acesso." onBack={() => setSelected(null)} />
      {editing ? <form className="space-y-4" onSubmit={async event => {
        event.preventDefault();
        if (await run(() => update({ variables: { userId: Number(selectedUser.id), userName: userName.trim(), email: email.trim() } }))) setEditing(false);
      }}>
        <label className="block text-sm">Nome de usuário<input required value={userName} onChange={e => setUserName(e.target.value)} className="mt-1 block w-full rounded-lg border dashboard-border bg-[var(--color-surface)] px-3 py-2" /></label>
        <label className="block text-sm">E-mail<input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full rounded-lg border dashboard-border bg-[var(--color-surface)] px-3 py-2" /></label>
        <CadastroFormActions submitLabel="Salvar" isBusy={busy} onCancel={() => setEditing(false)} />
      </form> : <>
        <dl className="grid gap-4 sm:grid-cols-2"><div><dt className="text-xs dashboard-text-muted">Nome de usuário</dt><dd>{selectedUser.userName}</dd></div><div><dt className="text-xs dashboard-text-muted">E-mail</dt><dd>{selectedUser.email}</dd></div><div><dt className="text-xs dashboard-text-muted">Situação</dt><dd><StatusBadge tone={selectedUser.ativo ? 'positive' : 'negative'}>{selectedUser.ativo ? 'Ativo' : 'Inativo'}</StatusBadge></dd></div><div><dt className="text-xs dashboard-text-muted">Admin global</dt><dd><StatusBadge tone={selectedUser.isAdmin ? 'positive' : 'neutral'}>{selectedUser.isAdmin ? 'Sim' : 'Não'}</StatusBadge></dd></div></dl>
        <h4 className="font-medium">Personas e empresas</h4>
        <FormErrorAlert message={assignmentsError ? 'Não foi possível carregar os vínculos.' : null} />
        {assignments.map(a => <p key={a.id} className="text-sm dashboard-text-muted">{a.personaCode} · {a.tenantName} · {a.companyName ?? 'Todas as empresas do tenant'}</p>)}
        {!assignments.length && !assignmentsError && <p className="text-sm dashboard-text-muted">Nenhuma persona contextual atribuída.</p>}
        <Button type="button" onClick={() => open(selectedUser, true)}><Edit3 className="h-4 w-4" /> Editar</Button>
      </>}
      <UserTenantsEditor key={selectedUser.id} userId={selectedUser.id} onChanged={async () => { await Promise.all([refetch(), refetchAssignments()]); }} />
    </section>}
    <CadastroSearchBar value={search} onChange={setSearch} hint="Pesquise por nome ou e-mail." />
    <CadastroDataTable columns={['Ações', 'Usuário', 'E-mail', 'Situação', 'Admin global']} loading={loading} empty={!users.length} emptyText="Nenhum usuário encontrado.">
      {users.map(user => <CadastroTableRow key={user.id}>
        <CadastroTableCell><div className="flex gap-1.5">
          <button type="button" className={actionClass} title="Ver dados" aria-label={`Ver dados de ${user.email}`} onClick={() => open(user, false)}><Eye className="h-4 w-4" /></button>
          <button type="button" className={actionClass} disabled={busy} title="Editar usuário" aria-label={`Editar ${user.email}`} onClick={() => open(user, true)}><Edit3 className="h-4 w-4" /></button>
          <button type="button" className={actionClass} disabled={busy || user.isAdmin && String(user.id) === String(currentUser?.id)} title={user.isAdmin ? 'Revogar Admin global' : 'Conceder Admin global'} aria-label={`${user.isAdmin ? 'Revogar' : 'Conceder'} Admin global ${user.email}`} onClick={() => changeAdmin(user)}>{user.isAdmin ? <ShieldOff className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}</button>
          <button type="button" className={`${actionClass} text-rose-600`} disabled={busy || user.isAdmin || String(user.id) === String(currentUser?.id)} title="Excluir usuário" aria-label={`Excluir ${user.email}`} onClick={() => removeUser(user)}><Trash2 className="h-4 w-4" /></button>
        </div></CadastroTableCell><CadastroTableCell>{user.userName}</CadastroTableCell><CadastroTableCell>{user.email}</CadastroTableCell><CadastroTableCell><StatusBadge tone={user.ativo ? 'positive' : 'negative'}>{user.ativo ? 'Ativo' : 'Inativo'}</StatusBadge></CadastroTableCell><CadastroTableCell><StatusBadge tone={user.isAdmin ? 'positive' : 'neutral'}>{user.isAdmin ? 'Sim' : 'Não'}</StatusBadge></CadastroTableCell>
      </CadastroTableRow>)}
    </CadastroDataTable>
  </div>;
}
