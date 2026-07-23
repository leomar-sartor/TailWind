import { describe, expect, it } from 'vitest';
import { getGraphQLErrorMessage } from './confirmToast';

describe('getGraphQLErrorMessage (errorPolicy: all)', () => {
  it('returns null when there is no error so callers can treat the mutation as success', () => {
    expect(getGraphQLErrorMessage(undefined)).toBeNull();
    expect(getGraphQLErrorMessage(null)).toBeNull();
  });

  it('reads message from Apollo CombinedGraphQLErrors-like shape on result.error', () => {
    expect(
      getGraphQLErrorMessage({
        errors: [{ message: 'Nome já existe', extensions: { message: 'Empresa duplicada' } }],
      }),
    ).toBe('Empresa duplicada');
  });

  it('falls back to graphQLErrors and top-level message', () => {
    expect(
      getGraphQLErrorMessage({
        graphQLErrors: [{ message: 'Falha de validação' }],
      }),
    ).toBe('Falha de validação');

    expect(getGraphQLErrorMessage({ message: 'Network down' })).toBe('Network down');
  });

  it('supports error arrays returned by some Apollo shapes', () => {
    expect(
      getGraphQLErrorMessage([{ message: 'Campo obrigatório', extensions: { message: 'Obrigatório' } }]),
    ).toBe('Obrigatório');
  });

  it('blocks false-success when mutation returns error under errorPolicy all', () => {
    const mutationResult = {
      data: { createEmpresa: { id: '1' } },
      error: {
        errors: [{ message: 'CNPJ inválido' }],
      },
    };

    const mutationErrorMessage = getGraphQLErrorMessage(mutationResult.error);
    expect(mutationErrorMessage).toBe('CNPJ inválido');
    // Pages must check this before toast.success / navigate
    expect(Boolean(mutationErrorMessage)).toBe(true);
  });
});
