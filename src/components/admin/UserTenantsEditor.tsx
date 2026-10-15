import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { Edit3, Plus, Trash2 } from 'lucide-react';
import { useActiveContext } from '../../auth/ActiveContext';
import { Button } from '../Button';
import { FormErrorAlert } from '../FormErrorAlert';
import { CadastroDataTable, CadastroFormActions, CadastroFormHeader, CadastroTableCell, CadastroTableRow } from '../cadastro';
import { GET_ACCESS_USER_TENANTS, type AccessUserTenant, type GetAccessUserTenantsData } from '../../graphql/Auth/accessQueries';
import { GRANT_TENANT_MEMBERSHIP, REVOKE_TENANT_MEMBERSHIP, UPDATE_TENANT_MEMBERSHIP } from '../../graphql/Auth/accessMutations';
import { useAdminAction } from '../../hooks/useAdminAction';
import { confirmDeletion, getGraphQLErrorMessage } from '../../utils/confirmToast';

export function UserTenantsEditor({ userId, onChanged }: { userId: string; onChanged: () => Promise<unknown> }) {
  const { contexts } = useActiveContext();
  const tenants = [...new Map(contexts.filter(c => c.tenantId !== null).map(c => [String(c.tenantId), c.tenantName])).entries()];
  const { data, loading, error, refetch } = useQuery<GetAccessUserTenantsData>(GET_ACCESS_USER_TENANTS, { variables: { userId: Number(userId) }, fetchPolicy: 'network-only' });
  const [grant] = useMutation(GRANT_TENANT_MEMBERSHIP);
  const [update] = useMutation(UPDATE_TENANT_MEMBERSHIP);
  const [revoke] = useMutation(REVOKE_TENANT_MEMBERSHIP);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AccessUserTenant | null>(null);
  const [tenantId, setTenantId] = useState('');
  const { busy, failure, run } = useAdminAction(async () => { await refetch(); await onChanged(); });
  const memberships = data?.accessUserTenants ?? [];
  const choices = tenants.filter(([id]) => String(editing?.tenantId) === id || !memberships.some(m => String(m.tenantId) === id));
  function closeForm() { setShowForm(false); setEditing(null); setTenantId(''); }
  function open(membership: AccessUserTenant | null) { setEditing(membership); setTenantId(membership ? String(membership.tenantId) : ''); setShowForm(true); }
  async function save() {
    const variables = { userId: Number(userId), tenantId: Number(editing?.tenantId ?? tenantId), newTenantId: Number(tenantId) };
    if (await run(() => editing ? update({ variables }) : grant({ variables: { userId: variables.userId, tenantId: variables.tenantId } }))) closeForm();
  }
  function remove(membership: AccessUserTenant) {
    confirmDeletion({ title: 'Remover vínculo com tenant', message: `Remover o vínculo com ${membership.tenantName}? Os perfis e vínculos com empresas deste tenant também serão revogados.`, confirmLabel: 'Remover vínculo', onConfirm: async () => { if (await run(() => revoke({ variables: { userId: Number(userId), tenantId: Number(membership.tenantId) } }))) closeForm(); } });
  }
  const disabled = busy || loading || !!error;
  return <section className="space-y-4" aria-label="Tenants do usuário">
    <div className="flex flex-wrap items-center justify-between gap-3"><h4 className="font-semibold">Tenants do usuário</h4><Button type="button" disabled={disabled || !tenants.some(([id]) => !memberships.some(m => String(m.tenantId) === id))} onClick={() => open(null)}><Plus className="h-4 w-4" /> Adicionar tenant</Button></div>
    <FormErrorAlert message={failure ?? (error ? getGraphQLErrorMessage(error) ?? 'Não foi possível carregar os tenants do usuário.' : null)} />
    {showForm && <form className="rounded-xl border dashboard-border p-4 space-y-4" onSubmit={event => {
      event.preventDefault(); if (disabled || !tenantId) return;
      if (editing && String(editing.tenantId) !== tenantId)
        confirmDeletion({ title: 'Trocar tenant do usuário', message: `Trocar ${editing.tenantName} por ${tenants.find(([id]) => id === tenantId)?.[1]}? Os perfis e vínculos de empresa do tenant anterior serão revogados.`, confirmLabel: 'Trocar tenant', onConfirm: save });
      else void save();
    }}>
      <CadastroFormHeader title={editing ? 'Editar tenant do usuário' : 'Adicionar tenant ao usuário'} description="Após vincular o tenant, configure as empresas e personas na tela Perfis." onBack={closeForm} />
      <label className="block text-sm">Tenant<select required value={tenantId} disabled={disabled} onChange={e => setTenantId(e.target.value)} className="mt-1 block w-full rounded-lg border dashboard-border bg-[var(--color-surface)] px-3 py-2"><option value="">Selecione um tenant</option>{choices.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label>
      <CadastroFormActions submitLabel="Salvar vínculo" isBusy={busy} submitDisabled={disabled || !tenantId} onCancel={closeForm} />
    </form>}
    <CadastroDataTable columns={['Ações', 'Tenant']} empty={!memberships.length} loading={loading} emptyText="Este usuário não pertence a nenhum tenant.">
      {memberships.map(m => <CadastroTableRow key={m.id}><CadastroTableCell><div className="flex gap-1.5">
        <button type="button" className="rounded-lg border dashboard-border p-2" disabled={disabled} title="Editar vínculo com tenant" aria-label={`Editar tenant ${m.tenantName}`} onClick={() => open(m)}><Edit3 className="h-4 w-4" /></button>
        <button type="button" className="rounded-lg border dashboard-border p-2 text-rose-600" disabled={disabled} title="Remover vínculo com tenant" aria-label={`Remover tenant ${m.tenantName}`} onClick={() => remove(m)}><Trash2 className="h-4 w-4" /></button>
      </div></CadastroTableCell><CadastroTableCell>{m.tenantName}</CadastroTableCell></CadastroTableRow>)}
    </CadastroDataTable>
  </section>;
}
