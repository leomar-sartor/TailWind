import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { Eye, Edit3, Trash2 } from 'lucide-react';
import { PersonaPermissionsEditor } from '../components/admin/PersonaPermissionsEditor';
import { StatusBadge } from '../components/StatusBadge';
import { FormErrorAlert } from '../components/FormErrorAlert';
import { CadastroDataTable, CadastroFormHeader, CadastroFormActions, CadastroSearchBar, CadastroTableCell, CadastroTableRow } from '../components/cadastro';
import { useActiveContext } from '../auth/ActiveContext';
import { useAdminAction } from '../hooks/useAdminAction';
import { GET_ACCESS_PERMISSIONS, type GetAccessPermissionsData, type AccessPermission } from '../graphql/Auth/accessQueries';
import { UPDATE_ACCESS_PERMISSION, REMOVE_ACCESS_PERMISSION } from '../graphql/Auth/accessMutations';
import { confirmDeletion, getGraphQLErrorMessage } from '../utils/confirmToast';
export function PermissionsPage() {
  const { isAdmin } = useActiveContext();
  return isAdmin ? <PermissionsAdmin /> : <FormErrorAlert message="Somente Admin pode gerenciar permissões." />;
}
function PermissionsAdmin() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<AccessPermission | null>(null);
  const [editing, setEditing] = useState(false);
  const [description, setDescription] = useState('');
  const { data, loading, error, refetch } = useQuery<GetAccessPermissionsData>(GET_ACCESS_PERMISSIONS, { fetchPolicy: 'network-only' });
  const [update] = useMutation(UPDATE_ACCESS_PERMISSION);
  const [remove] = useMutation(REMOVE_ACCESS_PERMISSION);
  const { busy, failure: errorMessage, run: runAdminAction } = useAdminAction(refetch);
  const permissions = (data?.accessPermissions ?? []).filter(p => `${p.codigo} ${p.descricao}`.toLocaleLowerCase().includes(search.toLocaleLowerCase()));
  function open(permission: AccessPermission, edit: boolean) { setSelected(permission); setEditing(edit); setDescription(permission.descricao); }
  function deletePermission(permission: AccessPermission) {
    confirmDeletion({ title: 'Excluir permissão', message: `Excluir ${permission.codigo}? Permissões do sistema e permissões atribuídas a personas são protegidas.`, confirmLabel: 'Excluir', onConfirm: async () => {
      if (await runAdminAction(() => remove({ variables: { id: Number(permission.id) } }))) setSelected(null);
    } });
  }
  return <div className="space-y-6">
    <header><h2 className="text-xl font-semibold dashboard-text">Permissões</h2><p className="mt-1 text-sm dashboard-text-muted">Consulte o catálogo e conceda ou revogue permissões por persona.</p></header>
    <FormErrorAlert message={errorMessage ?? (error ? getGraphQLErrorMessage(error) ?? 'Não foi possível carregar as permissões.' : null)} />
    <PersonaPermissionsEditor />

    {selected && <section className="dashboard-card rounded-xl border p-5 space-y-4" aria-label="Dados da permissão">
      <CadastroFormHeader title={editing ? 'Editar permissão' : 'Dados da permissão'} description="Dados da permissão no catálogo do sistema." onBack={() => setSelected(null)} />
      <p className="text-sm">{selected.codigo} · {selected.ativo ? 'Ativa' : 'Inativa'}</p>
      {editing ? <form className="space-y-4" onSubmit={async event => {
        event.preventDefault();
        if (await runAdminAction(() => update({ variables: { id: Number(selected.id), descricao: description.trim() } }))) setSelected(null);
      }}><label className="block text-sm">Descrição<input required value={description} onChange={e => setDescription(e.target.value)} className="mt-1 block w-full rounded-lg border dashboard-border bg-[var(--color-surface)] px-3 py-2" /></label>
        <CadastroFormActions submitLabel="Salvar" isBusy={busy} onCancel={() => setSelected(null)} />
      </form> : <p className="text-sm dashboard-text-muted">{selected.descricao}</p>}
    </section>}
    <CadastroSearchBar value={search} onChange={setSearch} hint="Pesquise pelo código ou descrição." />
    <CadastroDataTable columns={['Ações', 'Código', 'Descrição', 'Situação']} loading={loading} empty={!permissions.length} emptyText="Nenhuma permissão encontrada.">
      {permissions.map(permission => <CadastroTableRow key={permission.id}>
        <CadastroTableCell><div className="flex gap-1.5">
          <button type="button" className="rounded-lg border dashboard-border p-2" aria-label={`Ver ${permission.codigo}`} title="Ver dados" onClick={() => open(permission, false)}><Eye className="h-4 w-4" /></button>
          <button type="button" className="rounded-lg border dashboard-border p-2" disabled={busy} aria-label={`Editar ${permission.codigo}`} title="Editar descrição" onClick={() => open(permission, true)}><Edit3 className="h-4 w-4" /></button>
          <button type="button" className="rounded-lg border dashboard-border p-2 text-rose-600" disabled={busy} aria-label={`Excluir ${permission.codigo}`} title="Excluir permissão" onClick={() => deletePermission(permission)}><Trash2 className="h-4 w-4" /></button>
        </div></CadastroTableCell><CadastroTableCell>{permission.codigo}</CadastroTableCell><CadastroTableCell>{permission.descricao}</CadastroTableCell><CadastroTableCell><StatusBadge tone={permission.ativo ? 'positive' : 'negative'}>{permission.ativo ? 'Ativa' : 'Inativa'}</StatusBadge></CadastroTableCell>
      </CadastroTableRow>)}
    </CadastroDataTable>
  </div>;
}
