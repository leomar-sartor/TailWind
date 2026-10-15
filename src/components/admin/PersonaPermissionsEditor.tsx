import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { Edit3, Plus, Trash2 } from 'lucide-react';
import { Button } from '../Button';
import { FormErrorAlert } from '../FormErrorAlert';
import { CadastroDataTable, CadastroFormActions, CadastroFormHeader, CadastroTableCell, CadastroTableRow } from '../cadastro';
import { GET_ACCESS_CATALOG, GET_ASSIGNABLE_PERMISSIONS, type GetAccessCatalogData, type GetAssignablePermissionsData } from '../../graphql/Auth/accessQueries';
import { SET_PERSONA_PERMISSIONS } from '../../graphql/Auth/accessMutations';
import { useAdminAction } from '../../hooks/useAdminAction';
import { confirmDeletion, getGraphQLErrorMessage } from '../../utils/confirmToast';

const PERSONAS = [{ code: 'operador', label: 'Operador' }, { code: 'empresa', label: 'Empresa' }, { code: 'colaborador', label: 'Colaborador' }];
export function PersonaPermissionsEditor() {
  const [personaCode, setPersonaCode] = useState('operador');
  const [showForm, setShowForm] = useState(false);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [permissionCode, setPermissionCode] = useState('');
  const { data, loading, error, refetch } = useQuery<GetAccessCatalogData>(GET_ACCESS_CATALOG, { fetchPolicy: 'network-only' });
  const { data: availableData, loading: loadingAvailable, error: availableError } = useQuery<GetAssignablePermissionsData>(GET_ASSIGNABLE_PERMISSIONS, { variables: { personaCode }, fetchPolicy: 'network-only' });
  const [save] = useMutation(SET_PERSONA_PERMISSIONS);
  const { run, busy, failure } = useAdminAction(refetch);
  const persona = data?.accessCatalog.find(p => p.codigo === personaCode);
  const assigned = persona?.permissoes.map(m => m.permissao) ?? [];
  const codes = assigned.map(p => p.codigo);
  const available = (availableData?.assignablePermissions ?? []).filter(p => p.codigo === editingCode || !codes.includes(p.codigo));
  function closeForm() { setShowForm(false); setEditingCode(null); setPermissionCode(''); }
  function edit(code: string | null) { setEditingCode(code); setPermissionCode(code ?? ''); setShowForm(true); }
  function remove(code: string) {
    confirmDeletion({ title: 'Remover permissão da persona', message: `Remover ${code} da persona ${persona?.nome ?? personaCode}?`, confirmLabel: 'Remover', onConfirm: async () => {
      if (await run(() => save({ variables: { personaCode, permissionCodes: codes.filter(c => c !== code) } }))) closeForm();
    } });
  }
  const disabled = busy || loading || loadingAvailable || !!error || !!availableError || !persona;
  return <section className="space-y-4" aria-label="Permissões por persona">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><h3 className="text-lg font-semibold dashboard-text">Permissões por persona</h3><p className="mt-1 text-sm dashboard-text-muted">Adicione, substitua ou remova permissões do perfil selecionado.</p></div>
      <label className="min-w-48 text-sm">Persona<select disabled={busy} value={personaCode} onChange={e => { setPersonaCode(e.target.value); setShowForm(false); }} className="mt-1 block w-full rounded-lg border dashboard-border bg-[var(--color-surface)] px-3 py-2">{PERSONAS.map(p => <option key={p.code} value={p.code}>{p.label}</option>)}</select></label>
      <Button type="button" disabled={disabled || !(availableData?.assignablePermissions ?? []).some(p => !codes.includes(p.codigo))} onClick={() => edit(null)}><Plus className="h-4 w-4" /> Adicionar permissão</Button>
    </div>
    <FormErrorAlert message={failure ?? (error || availableError ? getGraphQLErrorMessage(error ?? availableError) ?? 'Não foi possível carregar as permissões da persona.' : null)} />
    {showForm && <form className="dashboard-card rounded-xl border p-5 space-y-4" onSubmit={async event => {
      event.preventDefault();
      if (disabled || !permissionCode) return;
      const next = [...codes.filter(c => c !== editingCode), permissionCode];
      if (await run(() => save({ variables: { personaCode, permissionCodes: [...new Set(next)] } }))) closeForm();
    }}>
      <CadastroFormHeader title={editingCode ? 'Editar permissão da persona' : 'Adicionar permissão à persona'} description={`Persona: ${persona?.nome ?? personaCode}`} onBack={closeForm} />
      <label className="block text-sm">Permissão<select required disabled={disabled} value={permissionCode} onChange={e => setPermissionCode(e.target.value)} className="mt-1 block w-full rounded-lg border dashboard-border bg-[var(--color-surface)] px-3 py-2"><option value="">Selecione uma permissão</option>{available.map(p => <option key={p.codigo} value={p.codigo}>{p.codigo} — {p.descricao}</option>)}</select></label>
      <p className="text-xs dashboard-text-muted">São exibidas as permissões compatíveis com as funções desta persona.</p>
      <CadastroFormActions submitLabel="Salvar permissão" isBusy={busy} submitDisabled={disabled || !permissionCode} onCancel={closeForm} />
    </form>}
    <CadastroDataTable columns={['Ações', 'Permissão', 'Descrição']} empty={!assigned.length} loading={loading} emptyText="Nenhuma permissão atribuída a esta persona.">
      {assigned.map(p => <CadastroTableRow key={p.codigo}><CadastroTableCell><div className="flex gap-1.5">
        <button type="button" className="rounded-lg border dashboard-border p-2" disabled={disabled} title="Editar permissão da persona" aria-label={`Editar permissão ${p.codigo} da persona`} onClick={() => edit(p.codigo)}><Edit3 className="h-4 w-4" /></button>
        <button type="button" className="rounded-lg border dashboard-border p-2 text-rose-600" disabled={disabled} title="Remover permissão da persona" aria-label={`Remover permissão ${p.codigo} da persona`} onClick={() => remove(p.codigo)}><Trash2 className="h-4 w-4" /></button>
      </div></CadastroTableCell><CadastroTableCell>{p.codigo}</CadastroTableCell><CadastroTableCell>{p.descricao}</CadastroTableCell></CadastroTableRow>)}
    </CadastroDataTable>
  </section>;
}
