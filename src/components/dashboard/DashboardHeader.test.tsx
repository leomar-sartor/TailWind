import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DashboardHeader } from './DashboardHeader';

vi.mock('../../auth/ActiveContext', () => ({ useActiveContext: () => ({
  contexts: [{ tenantId: '1', tenantName: 'Tenant 1', companyId: '1', companyName: 'Empresa 1' }, { tenantId: '2', tenantName: 'Tenant 2', companyId: '2', companyName: 'Empresa 2' }],
  activeContext: { tenantId: '1', companyId: '1' }, personas: ['operador'], switchContext: vi.fn(),
}) }));
afterEach(cleanup);
describe('Header menu', () => {
  function setup() {
    const view = render(<DashboardHeader collapsed={false} pageTitle="Pesquisas" userName="Operador" onSettings={vi.fn()} onLogout={vi.fn()} />);
    const details = view.container.querySelector('details')!;
    details.open = true;
    return details;
  }
  it('closes on outside pointer and Escape, while keeping internal clicks open', () => {
    const details = setup();
    fireEvent.pointerDown(screen.getByRole('button', { name: /Tema:/ }));
    expect(details.open).toBe(true);
    fireEvent.pointerDown(document.body);
    expect(details.open).toBe(false);
    details.open = true;
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(details.open).toBe(false);
  });
  it('closes after changing the theme', () => {
    const details = setup();
    fireEvent.click(screen.getByRole('button', { name: /Tema:/ }));
    expect(details.open).toBe(false);
  });
});
