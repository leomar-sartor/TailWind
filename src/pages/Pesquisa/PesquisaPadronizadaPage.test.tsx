import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PesquisaPadronizadaPage, PesquisaPadronizadaForm } from './PesquisaPadronizadaPage';
import { MemoryRouter } from 'react-router-dom';

const queries = vi.hoisted(() => ({ responses: {} as Record<string, Record<string, unknown>>, calls: [] as number[] }));
vi.mock('@apollo/client/react', () => ({
  useQuery: (document: { definitions: Array<{ name?: { value: string } }> }, options: { variables: { first: number } }) => {
    queries.calls.push(options.variables.first);
    return queries.responses[document.definitions[0].name?.value ?? ''] ?? {};
  },
  useMutation: () => [vi.fn(), { loading: false }],
}));
vi.mock('../../auth/ActiveContext', () => ({
  useActiveContext: () => ({ activeContext: { tenantId: '1', companyId: '1' }, permissions: [], isAdmin: true }),
}));

afterEach(() => { cleanup(); queries.responses = {}; queries.calls = []; });

describe('PesquisaPadronizadaPage', () => {
  it('keeps the form visible and reports errors when GraphQL returns null collections', () => {
    queries.responses = {
      GetPesquisasPadronizadas: { data: { pesquisasPadronizadas: null }, error: new Error('Limite de paginação excedido') },
      CategoriasOptions: { data: { categorias: null }, error: new Error('Falha nas categorias') },
      Empresas: { data: { empresas: null }, error: new Error('Falha nas empresas') },
    };
    render(<MemoryRouter><PesquisaPadronizadaForm /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'Pesquisas padronizadas' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Salvar rascunho' })).toBeInTheDocument();
    expect(screen.getAllByRole('alert')).toHaveLength(2);
  });

  it('requests collections within the API limit and renders an empty result', () => {
    queries.responses = { GetPesquisasPadronizadas: { data: { pesquisasPadronizadas: { nodes: [], totalCount: 0 } } } };
    render(<MemoryRouter><PesquisaPadronizadaPage /></MemoryRouter>);
    expect(queries.calls.every(first => first <= 50)).toBe(true);
    expect(screen.getByText('Nenhuma pesquisa padronizada cadastrada.')).toBeInTheDocument();
  });

  it('does not display previously cached surveys when access fails', () => {
    queries.responses = { GetPesquisasPadronizadas: {
      error: new Error('Acesso negado'),
      data: { pesquisasPadronizadas: { nodes: [{ id: '1', nome: 'Pesquisa de outro contexto' }] } },
    } };
    render(<MemoryRouter><PesquisaPadronizadaPage /></MemoryRouter>);
    expect(screen.queryByText('Pesquisa de outro contexto')).not.toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
