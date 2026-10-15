import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { EmpresaPage } from './EmpresaPage';

const state = vi.hoisted(() => ({ navigate: vi.fn(), companyId: '9' }));
vi.mock('react-router-dom', () => ({ useNavigate: () => state.navigate }));
vi.mock('../../auth/ActiveContext', () => ({ useActiveContext: () => ({
  activeContext: { companyId: state.companyId }, personas: ['empresa'], isAdmin: false, permissions: ['empresa.visualizar', 'empresa.editar'],
}) }));
vi.mock('@apollo/client/react', () => ({ useQuery: () => ({ data: { empresaById: {
  id: '9', nomeFantasia: 'Minha empresa autorizada', cnpj: '11444777000161', descricao: 'Descrição',
} } }) }));

afterEach(() => { cleanup(); state.navigate.mockClear(); });
describe('Empresa persona', () => {
  it('shows its own details without list, create or delete actions', () => {
    render(<EmpresaPage />);
    expect(screen.getByRole('heading', { name: 'Minha empresa' })).toBeInTheDocument();
    expect(screen.getByText('Minha empresa autorizada')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /excluir|cadastrar/i })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Editar dados' }));
    expect(state.navigate).toHaveBeenCalledWith('/dashboard/empresa/create');
  });
});
