import { useCallback, useEffect, useState } from 'react';

type UseCursorPaginationOptions = {
  /** When any dependency changes, the cursor stack resets to the first page. */
  resetDeps?: ReadonlyArray<unknown>;
};

type UseCursorPaginationReturn = {
  after: string | null;
  cursorStack: Array<string | null>;
  currentCursorIndex: number;
  hasPreviousPage: boolean;
  goToFirst: () => void;
  goToPrevious: () => void;
  goToNext: (endCursor: string | null | undefined, hasNextPage: boolean) => void;
  /** Jumps to the last page that already has a cursor in the stack. */
  goToLastKnown: () => void;
  goToPageIndex: (
    pageIndex: number,
    endCursor: string | null | undefined,
    hasNextPage: boolean,
  ) => void;
  canGoToPage: (pageIndex: number, hasNextPage: boolean) => boolean;
  canGoToLastKnown: boolean;
};

/**
 * Cursor-based pagination helpers. Only navigates to pages with a known cursor
 * (or the immediate next page when hasNextPage is true).
 */
export function useCursorPagination(
  options: UseCursorPaginationOptions = {},
): UseCursorPaginationReturn {
  const { resetDeps = [] } = options;
  const [cursorStack, setCursorStack] = useState<Array<string | null>>([null]);
  const [currentCursorIndex, setCurrentCursorIndex] = useState(0);

  useEffect(() => {
    setCursorStack([null]);
    setCurrentCursorIndex(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- resetDeps is the intentional trigger list
  }, resetDeps);

  const goToFirst = useCallback(() => {
    setCurrentCursorIndex(0);
  }, []);

  const goToPrevious = useCallback(() => {
    setCurrentCursorIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const goToNext = useCallback(
    (endCursor: string | null | undefined, hasNextPage: boolean) => {
      if (!hasNextPage || !endCursor) return;

      setCursorStack((prev) => {
        const nextStack = prev.slice(0, currentCursorIndex + 1);
        return [...nextStack, endCursor];
      });
      setCurrentCursorIndex((prev) => prev + 1);
    },
    [currentCursorIndex],
  );

  const goToLastKnown = useCallback(() => {
    setCurrentCursorIndex(cursorStack.length - 1);
  }, [cursorStack.length]);

  const canGoToPage = useCallback(
    (pageIndex: number, hasNextPage: boolean) =>
      pageIndex < cursorStack.length || (pageIndex === currentCursorIndex + 1 && hasNextPage),
    [cursorStack.length, currentCursorIndex],
  );

  const goToPageIndex = useCallback(
    (pageIndex: number, endCursor: string | null | undefined, hasNextPage: boolean) => {
      if (pageIndex < cursorStack.length) {
        setCurrentCursorIndex(pageIndex);
        return;
      }

      if (pageIndex === currentCursorIndex + 1 && hasNextPage) {
        goToNext(endCursor, hasNextPage);
      }
    },
    [cursorStack.length, currentCursorIndex, goToNext],
  );

  return {
    after: cursorStack[currentCursorIndex] ?? null,
    cursorStack,
    currentCursorIndex,
    hasPreviousPage: currentCursorIndex > 0,
    goToFirst,
    goToPrevious,
    goToNext,
    goToLastKnown,
    goToPageIndex,
    canGoToPage,
    canGoToLastKnown: currentCursorIndex < cursorStack.length - 1,
  };
}
