import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { MySurveysOverview } from './MySurveysOverview';

const query = vi.hoisted(() => ({ value: {} as Record<string, unknown> }));
vi.mock('@apollo/client/react', () => ({ useQuery: () => query.value }));

describe('MySurveysOverview', () => {
  it('offers start and resume links, and no response link for completed participation', () => {
    query.value = { data: { minhasPesquisas: [
      { id: '1', nome: 'Nova pesquisa', status: 'PENDENTE', token: 'new' },
      { id: '2', nome: 'Pesquisa iniciada', status: 'EM_PROGRESSO', token: 'resume' },
      { id: '3', nome: 'Pesquisa concluída', status: 'COMPLETO', token: null },
    ] } };
    render(<MemoryRouter><MySurveysOverview /></MemoryRouter>);
    expect(screen.getByRole('link', { name: 'Iniciar pesquisa' }).getAttribute('href')).toBe('/survey?token=new');
    expect(screen.getByRole('link', { name: 'Retomar pesquisa' }).getAttribute('href')).toBe('/survey?token=resume');
    expect(screen.getAllByRole('link')).toHaveLength(2);
    expect(screen.getByText('Concluída')).toBeTruthy();
  });

  it('shows authorization errors without displaying previously returned data', () => {
    query.value = { error: new Error('forbidden'), data: { minhasPesquisas: [
      { id: '1', nome: 'Dados antigos', status: 'PENDENTE', token: 'old' },
    ] } };
    render(<MemoryRouter><MySurveysOverview /></MemoryRouter>);
    expect(screen.getByRole('alert')).toBeTruthy();
    expect(screen.queryByText('Dados antigos')).toBeNull();
  });
});
