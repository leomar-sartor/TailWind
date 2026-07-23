import { beforeEach, describe, expect, it } from 'vitest';
import { useSurveyStore, type Pesquisa } from '../store/surveyStore';

const pesquisaA: Pesquisa = {
  id: 'p-a',
  nome: 'Pesquisa A',
  dataInicial: '2026-01-01',
  dataFinal: '2026-12-31',
  questoes: [
    {
      id: '1',
      titulo: 'Q1',
      tipo: 'TEXTO',
      obrigatoria: true,
      multiplasRespostas: false,
      opcoes: [],
    },
    {
      id: '2',
      titulo: 'Q2',
      tipo: 'TEXTO',
      obrigatoria: false,
      multiplasRespostas: false,
      opcoes: [],
    },
  ],
};

const pesquisaB: Pesquisa = {
  id: 'p-b',
  nome: 'Pesquisa B',
  dataInicial: '2026-01-01',
  dataFinal: '2026-12-31',
  questoes: [
    {
      id: '10',
      titulo: 'Only question',
      tipo: 'OPCAO',
      obrigatoria: true,
      multiplasRespostas: false,
      opcoes: [{ id: 'o1', ordem: 1, descricao: 'Sim' }],
    },
  ],
};

describe('surveyStore multi-token reset', () => {
  beforeEach(() => {
    useSurveyStore.getState().reset();
  });

  it('resets leftover answers when switching to another survey token', () => {
    const store = useSurveyStore.getState();
    store.inicializar('token-a', pesquisaA);
    store.setRespostaTexto('1', 'resposta do token A');
    store.avancar();

    expect(useSurveyStore.getState().token).toBe('token-a');
    expect(useSurveyStore.getState().respostas['1']?.textoResposta).toBe('resposta do token A');
    expect(useSurveyStore.getState().questaoAtualIndex).toBe(1);

    useSurveyStore.getState().reset();
    useSurveyStore.getState().inicializar('token-b', pesquisaB);

    const next = useSurveyStore.getState();
    expect(next.token).toBe('token-b');
    expect(next.pesquisa?.id).toBe('p-b');
    expect(next.respostas).toEqual({});
    expect(next.questaoAtualIndex).toBe(0);
    expect(next.isFinished).toBe(false);
  });

  it('inicializar always binds state to the provided token', () => {
    useSurveyStore.getState().inicializar('token-a', pesquisaA);
    useSurveyStore.getState().setRespostaTexto('1', 'stale');

    useSurveyStore.getState().inicializar('token-b', pesquisaB, null, null);

    const state = useSurveyStore.getState();
    expect(state.token).toBe('token-b');
    expect(state.pesquisa?.nome).toBe('Pesquisa B');
    expect(state.respostas).toEqual({});
    expect(state.questoesOrdenadas).toHaveLength(1);
  });

  it('reset returns the store to the initial empty state', () => {
    useSurveyStore.getState().inicializar('token-a', pesquisaA);
    useSurveyStore.getState().setFinished(true);
    useSurveyStore.getState().reset();

    const state = useSurveyStore.getState();
    expect(state.token).toBeNull();
    expect(state.pesquisa).toBeNull();
    expect(state.respostas).toEqual({});
    expect(state.isFinished).toBe(false);
  });
});
