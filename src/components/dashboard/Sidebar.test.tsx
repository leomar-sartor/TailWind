import { fireEvent, render, screen, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Sidebar } from './Sidebar';

afterEach(cleanup);
describe('Sidebar navigation', () => {
  it('opens Administração without navigating and reaches Perfis with one click', () => {
    const navigate = vi.fn();
    render(<Sidebar collapsed={false} activePage="dashboard" permissions={[]} isAdmin onSelectPage={navigate} onToggleSidebar={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Administração' }));
    expect(navigate).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Perfis' }));
    expect(navigate).toHaveBeenCalledExactlyOnceWith('acessos');
  });
  it('keeps the Administração group expanded on the Perfis page', () => {
    render(<Sidebar collapsed={false} activePage="acessos" permissions={[]} isAdmin onSelectPage={vi.fn()} onToggleSidebar={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Perfis' })).toBeInTheDocument();
  });
});
