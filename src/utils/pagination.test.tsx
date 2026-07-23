import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useCursorPagination } from '../hooks/useCursorPagination';
import { mergeConnectionNodes } from './mergeConnectionNodes';

describe('mergeConnectionNodes', () => {
  it('concatenates previous and next nodes instead of replacing the list', () => {
    const prev = [{ id: '1' }, { id: '2' }];
    const next = [{ id: '3' }, { id: '4' }];

    expect(mergeConnectionNodes(prev, next)).toEqual([
      { id: '1' },
      { id: '2' },
      { id: '3' },
      { id: '4' },
    ]);
  });

  it('treats missing previous nodes as an empty list', () => {
    expect(mergeConnectionNodes(undefined, [{ id: '1' }])).toEqual([{ id: '1' }]);
    expect(mergeConnectionNodes(null, null)).toEqual([]);
  });
});

describe('useCursorPagination', () => {
  it('advances only when hasNextPage and endCursor are present', () => {
    const { result } = renderHook(() => useCursorPagination());

    act(() => {
      result.current.goToNext(undefined, true);
    });
    expect(result.current.currentCursorIndex).toBe(0);
    expect(result.current.cursorStack).toEqual([null]);

    act(() => {
      result.current.goToNext('cursor-1', false);
    });
    expect(result.current.currentCursorIndex).toBe(0);

    act(() => {
      result.current.goToNext('cursor-1', true);
    });
    expect(result.current.currentCursorIndex).toBe(1);
    expect(result.current.after).toBe('cursor-1');
    expect(result.current.cursorStack).toEqual([null, 'cursor-1']);
  });

  it('does not jump » to an unknown page without a cursor in the stack', () => {
    const { result } = renderHook(() => useCursorPagination());

    act(() => {
      result.current.goToNext('cursor-1', true);
    });

    expect(result.current.canGoToPage(2, false)).toBe(false);
    expect(result.current.canGoToPage(2, true)).toBe(true);

    act(() => {
      result.current.goToPageIndex(5, 'cursor-x', false);
    });
    expect(result.current.currentCursorIndex).toBe(1);

    act(() => {
      result.current.goToPageIndex(2, 'cursor-2', true);
    });
    expect(result.current.currentCursorIndex).toBe(2);
    expect(result.current.cursorStack).toEqual([null, 'cursor-1', 'cursor-2']);
  });

  it('resets the cursor stack when resetDeps change', () => {
    const { result, rerender } = renderHook(
      ({ filter }) => useCursorPagination({ resetDeps: [filter] }),
      { initialProps: { filter: 'acme' } },
    );

    act(() => {
      result.current.goToNext('cursor-1', true);
    });
    expect(result.current.cursorStack).toHaveLength(2);

    rerender({ filter: 'beta' });

    expect(result.current.currentCursorIndex).toBe(0);
    expect(result.current.after).toBeNull();
    expect(result.current.cursorStack).toEqual([null]);
  });
});
