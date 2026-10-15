import { describe, expect, it } from 'vitest';
import { checkAccessMutation } from './AccessManagementPage';

describe('Access management mutation results', () => {
  it('surfaces GraphQL errors returned without throwing by Apollo', () => {
    const error = new Error('Não é permitido remover o último Admin global.');
    expect(() => checkAccessMutation({ error })).toThrow(error);
  });
  it('reports false or missing results instead of pretending access changed', () => {
    expect(() => checkAccessMutation({ data: { revokeCompanyMembership: false } })).toThrow('Nenhuma alteração');
    expect(() => checkAccessMutation({ data: null })).toThrow('Nenhuma alteração');
  });
  it('accepts successful role and membership changes', () => {
    expect(() => checkAccessMutation({ data: { grantGlobalAdmin: true } })).not.toThrow();
    expect(() => checkAccessMutation({ data: { assignPersona: { id: 1 } } })).not.toThrow();
  });
});
