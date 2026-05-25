import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Colaborador {
  id: string;
  nome: string;
  email: string;
  setor?: { id: string; nome: string };
}

interface DisparoState {
  // Seleções do wizard
  pesquisaId: string | null;
  pesquisaNome: string | null;
  empresaId: string | null;
  empresaNome: string | null;
  setorIdsSelecionados: string[];
  colaboradoresSelecionados: string[]; // ids

  // Actions
  selecionarPesquisa: (id: string, nome: string) => void;
  selecionarEmpresa: (id: string, nome: string) => void;
  toggleSetor: (id: string) => void;
  selecionarTodosSetores: (ids: string[]) => void;
  limparSetores: () => void;
  setColaboradoresSelecionados: (ids: string[]) => void;
  toggleColaborador: (id: string) => void;
  selecionarTodosColaboradores: (ids: string[]) => void;
  limparTudo: () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useDisparoStore = create<DisparoState>()(
  devtools(
    (set) => ({
      pesquisaId: null,
      pesquisaNome: null,
      empresaId: null,
      empresaNome: null,
      setorIdsSelecionados: [],
      colaboradoresSelecionados: [],

      selecionarPesquisa: (id, nome) =>
        set(
          { pesquisaId: id, pesquisaNome: nome, empresaId: null, empresaNome: null, setorIdsSelecionados: [], colaboradoresSelecionados: [] },
          false, 'disparo/selecionarPesquisa'
        ),

      selecionarEmpresa: (id, nome) =>
        set(
          { empresaId: id, empresaNome: nome, setorIdsSelecionados: [], colaboradoresSelecionados: [] },
          false, 'disparo/selecionarEmpresa'
        ),

      toggleSetor: (id) =>
        set(
          (s) => ({
            setorIdsSelecionados: s.setorIdsSelecionados.includes(id)
              ? s.setorIdsSelecionados.filter((x) => x !== id)
              : [...s.setorIdsSelecionados, id],
            colaboradoresSelecionados: [],
          }),
          false, 'disparo/toggleSetor'
        ),

      selecionarTodosSetores: (ids) =>
        set({ setorIdsSelecionados: ids, colaboradoresSelecionados: [] }, false, 'disparo/selecionarTodosSetores'),

      limparSetores: () =>
        set({ setorIdsSelecionados: [], colaboradoresSelecionados: [] }, false, 'disparo/limparSetores'),

      setColaboradoresSelecionados: (ids) =>
        set({ colaboradoresSelecionados: ids }, false, 'disparo/setColaboradores'),

      toggleColaborador: (id) =>
        set(
          (s) => ({
            colaboradoresSelecionados: s.colaboradoresSelecionados.includes(id)
              ? s.colaboradoresSelecionados.filter((x) => x !== id)
              : [...s.colaboradoresSelecionados, id],
          }),
          false, 'disparo/toggleColaborador'
        ),

      selecionarTodosColaboradores: (ids) =>
        set({ colaboradoresSelecionados: ids }, false, 'disparo/selecionarTodos'),

      limparTudo: () =>
        set(
          { pesquisaId: null, pesquisaNome: null, empresaId: null, empresaNome: null, setorIdsSelecionados: [], colaboradoresSelecionados: [] },
          false, 'disparo/limparTudo'
        ),
    }),
    { name: 'DisparoStore' }
  )
);