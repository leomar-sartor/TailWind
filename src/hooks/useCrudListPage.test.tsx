import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useCrudListPage } from './useCrudListPage';

afterEach(() => {
  vi.useRealTimers();
});

describe('useCrudListPage', () => {
  it('builds variables with debounced text filter and resets cursor when filter changes', () => {
    vi.useFakeTimers();

    const { result } = renderHook(() =>
      useCrudListPage({
        pageSize: 10,
        initialFilter: 'acme',
        buildWhere: (filter) =>
          filter
            ? {
                or: [{ nome: { contains: filter } }],
              }
            : null,
      }),
    );

    expect(result.current.debouncedGlobalFilter).toBe('acme');
    expect(result.current.variables).toMatchObject({
      first: 10,
      after: null,
      where: { or: [{ nome: { contains: 'acme' } }] },
    });

    act(() => {
      result.current.goToNext('cursor-1', true);
    });
    expect(result.current.currentCursorIndex).toBe(1);

    act(() => {
      result.current.setGlobalFilter('beta');
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.globalFilter).toBe('beta');
    expect(result.current.debouncedGlobalFilter).toBe('beta');
    expect(result.current.currentCursorIndex).toBe(0);
    expect(result.current.after).toBeNull();
    expect(result.current.variables).toMatchObject({
      first: 10,
      after: null,
      where: { or: [{ nome: { contains: 'beta' } }] },
    });
  });
});
