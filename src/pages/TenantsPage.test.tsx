import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TenantsPage } from './TenantsPage';
const state = vi.hoisted(() => ({ admin: true }));
vi.mock('../auth/ActiveContext', () => ({ useActiveContext: () => ({ isAdmin: state.admin }) }));
vi.mock('@apollo/client/react', () => ({
  useQuery: () => ({ data: { tenants: { nodes: [{ id: '1', nome: 'Tenant autorizado', ativo: true }], totalCount: 1, pageInfo: { hasNextPage: false } } } }),
  useMutation: () => [vi.fn(), {}],
}));
afterEach(() => { cleanup(); state.admin = true; });
describe('Tenant administration', () => {
  it('lists tenants and opens the create form for Admin', () => {
    render(<TenantsPage />);
    expect(screen.getByText('Tenant autorizado')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cadastrar tenant' }));
    expect(screen.getByRole('textbox', { name: 'Nome do tenant' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeInTheDocument();
  });
  it('denies the tenant CRUD to non-admin personas', () => {
    state.admin = false;
    render(<TenantsPage />);
    expect(screen.getByRole('alert')).toHaveTextContent('Somente Admin');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});
