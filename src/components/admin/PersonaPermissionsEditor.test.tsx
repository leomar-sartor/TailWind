import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PersonaPermissionsEditor } from './PersonaPermissionsEditor';
import { GET_ACCESS_CATALOG } from '../../graphql/Auth/accessQueries';

const state = vi.hoisted(() => ({ codes: ['empresa.visualizar'], save: vi.fn(), fail: false }));
const permissions = [
  { id: '1', codigo: 'empresa.visualizar', descricao: 'Visualizar empresas' },
  { id: '2', codigo: 'empresa.editar', descricao: 'Editar empresas' },
  { id: '3', codigo: 'empresa.criar', descricao: 'Criar empresas' },
];
vi.mock('@apollo/client/react', () => ({
  useQuery: (document: unknown) => ({
    loading: false, refetch: vi.fn(async () => ({})),
    data: document === GET_ACCESS_CATALOG ? { accessCatalog: [{ codigo: 'operador', nome: 'Operador', permissoes: state.codes.map(codigo => ({ permissao: permissions.find(p => p.codigo === codigo)! })) }] } : { assignablePermissions: permissions },
  }),
  useMutation: () => [state.save, {}],
}));
vi.mock('../../utils/confirmToast', () => ({
  confirmDeletion: ({ onConfirm }: { onConfirm: () => Promise<unknown> }) => void onConfirm(),
  getGraphQLErrorMessage: (error: Error) => error.message,
}));
afterEach(() => { cleanup(); state.codes = ['empresa.visualizar']; state.save.mockReset(); state.fail = false; });
describe('Permissions assigned to a persona', () => {
  it('adds, replaces and removes permissions while preserving other assignments', async () => {
    state.save.mockImplementation(async ({ variables }) => {
      state.codes = variables.permissionCodes;
      return { data: { setPersonaPermissions: true } };
    });
    render(<PersonaPermissionsEditor />);
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar permissão' }));
    fireEvent.change(screen.getByRole('combobox', { name: 'Permissão' }), { target: { value: 'empresa.editar' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar permissão' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Editar permissão empresa.editar da persona' })).toBeEnabled());
    expect(state.save).toHaveBeenLastCalledWith({ variables: { personaCode: 'operador', permissionCodes: ['empresa.visualizar', 'empresa.editar'] } });
    fireEvent.click(screen.getByRole('button', { name: 'Editar permissão empresa.editar da persona' }));
    fireEvent.change(screen.getByRole('combobox', { name: 'Permissão' }), { target: { value: 'empresa.criar' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar permissão' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Remover permissão empresa.criar da persona' })).toBeEnabled());
    expect(state.save).toHaveBeenLastCalledWith({ variables: { personaCode: 'operador', permissionCodes: ['empresa.visualizar', 'empresa.criar'] } });
    fireEvent.click(screen.getByRole('button', { name: 'Remover permissão empresa.criar da persona' }));
    await waitFor(() => expect(screen.queryByText('empresa.criar')).not.toBeInTheDocument());
    expect(state.save).toHaveBeenLastCalledWith({ variables: { personaCode: 'operador', permissionCodes: ['empresa.visualizar'] } });
  });
  it('shows failed saves without losing the form', async () => {
    state.save.mockResolvedValue({ error: new Error('Falha ao salvar as permissões.') });
    render(<PersonaPermissionsEditor />);
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar permissão' }));
    fireEvent.change(screen.getByRole('combobox', { name: 'Permissão' }), { target: { value: 'empresa.editar' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar permissão' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Falha ao salvar as permissões.');
    expect(screen.getByRole('combobox', { name: 'Permissão' })).toHaveValue('empresa.editar');
  });
});
