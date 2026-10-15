import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { UserTenantsEditor } from './UserTenantsEditor';
import { GRANT_TENANT_MEMBERSHIP, REVOKE_TENANT_MEMBERSHIP, UPDATE_TENANT_MEMBERSHIP } from '../../graphql/Auth/accessMutations';

const state = vi.hoisted(() => ({ memberships: [{ id: '10', tenantId: '1', tenantName: 'Tenant 1' }], grant: vi.fn(), update: vi.fn(), revoke: vi.fn() }));
vi.mock('../../auth/ActiveContext', () => ({ useActiveContext: () => ({ contexts: [1, 2, 3].map(id => ({ tenantId: String(id), tenantName: `Tenant ${id}`, companyId: String(id) })) }) }));
vi.mock('@apollo/client/react', () => ({
  useQuery: () => ({ loading: false, data: { accessUserTenants: state.memberships }, refetch: vi.fn(async () => ({})) }),
  useMutation: (document: unknown) => [document === GRANT_TENANT_MEMBERSHIP ? state.grant : document === UPDATE_TENANT_MEMBERSHIP ? state.update : document === REVOKE_TENANT_MEMBERSHIP ? state.revoke : vi.fn(), {}],
}));
vi.mock('../../utils/confirmToast', () => ({
  confirmDeletion: ({ onConfirm }: { onConfirm: () => Promise<unknown> }) => void onConfirm(),
  getGraphQLErrorMessage: (error: Error) => error.message,
}));
afterEach(() => { cleanup(); state.memberships = [{ id: '10', tenantId: '1', tenantName: 'Tenant 1' }]; vi.clearAllMocks(); });
describe('User tenant memberships', () => {
  it('adds, changes and removes only the selected user membership', async () => {
    const changed = vi.fn(async () => {});
    state.grant.mockImplementation(async ({ variables }) => { state.memberships = [...state.memberships, { id: '20', tenantId: String(variables.tenantId), tenantName: `Tenant ${variables.tenantId}` }]; return { data: { grantTenantMembership: { id: '20' } } }; });
    state.update.mockImplementation(async ({ variables }) => { state.memberships = state.memberships.map(m => Number(m.tenantId) === variables.tenantId ? { ...m, tenantId: String(variables.newTenantId), tenantName: `Tenant ${variables.newTenantId}` } : m); return { data: { updateTenantMembership: true } }; });
    state.revoke.mockImplementation(async ({ variables }) => { state.memberships = state.memberships.filter(m => Number(m.tenantId) !== variables.tenantId); return { data: { revokeTenantMembership: true } }; });
    render(<UserTenantsEditor userId="4" onChanged={changed} />);
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar tenant' }));
    fireEvent.change(screen.getByRole('combobox', { name: 'Tenant' }), { target: { value: '2' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar vínculo' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Editar tenant Tenant 2' })).toBeEnabled());
    expect(state.grant).toHaveBeenLastCalledWith({ variables: { userId: 4, tenantId: 2 } });
    fireEvent.click(screen.getByRole('button', { name: 'Editar tenant Tenant 1' }));
    fireEvent.change(screen.getByRole('combobox', { name: 'Tenant' }), { target: { value: '3' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar vínculo' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Remover tenant Tenant 3' })).toBeEnabled());
    expect(state.update).toHaveBeenLastCalledWith({ variables: { userId: 4, tenantId: 1, newTenantId: 3 } });
    fireEvent.click(screen.getByRole('button', { name: 'Remover tenant Tenant 2' }));
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Remover tenant Tenant 2' })).not.toBeInTheDocument());
    expect(screen.getByText('Tenant 3')).toBeInTheDocument();
    expect(state.revoke).toHaveBeenLastCalledWith({ variables: { userId: 4, tenantId: 2 } });
    expect(changed).toHaveBeenCalledTimes(3);
  });
});
