import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { useDashboardPageConfig } from './useDashboardPageConfig';
afterEach(cleanup);
function Navigation() {
  const { handlePageChange } = useDashboardPageConfig('empresa');
  const { pathname } = useLocation();
  return <><button onClick={() => handlePageChange('consultar')}>Consultar</button><output>{pathname}</output></>;
}
describe('Dashboard routes', () => {
  it('keeps Consultar in its own route after leaving a cadastro', () => {
    render(<MemoryRouter initialEntries={['/dashboard/empresa']}><Navigation /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: 'Consultar' }));
    expect(screen.getByRole('status')).toHaveTextContent('/dashboard/consultar');
  });
});
