import { useMemo, useState } from 'react';
import type { CursorPageVars } from '../graphql/Common/types';
import { useCursorPagination } from './useCursorPagination';
import { useDebouncedValue } from './useDebouncedValue';

export type CrudListPageOptions<TVars extends CursorPageVars> = {
  pageSize: number;
  initialFilter?: string;
  buildWhere?: (filter: string) => TVars['where'];
  resetDeps?: ReadonlyArray<unknown>;
};

export type CrudListPageResult<TVars extends CursorPageVars> = {
  globalFilter: string;
  debouncedGlobalFilter: string;
  setGlobalFilter: (value: string) => void;
  variables: TVars;
  after: string | null;
  cursorStack: Array<string | null>;
  currentCursorIndex: number;
  hasPreviousPage: boolean;
  goToFirst: () => void;
  goToPrevious: () => void;
  goToNext: (endCursor: string | null | undefined, hasNextPage: boolean) => void;
  goToLastKnown: () => void;
  goToPageIndex: (
    pageIndex: number,
    endCursor: string | null | undefined,
    hasNextPage: boolean,
  ) => void;
  canGoToPage: (pageIndex: number, hasNextPage: boolean) => boolean;
  canGoToLastKnown: boolean;
};

export function useCrudListPage<TVars extends CursorPageVars>({
  pageSize,
  initialFilter = '',
  buildWhere,
  resetDeps = [],
}: CrudListPageOptions<TVars>): CrudListPageResult<TVars> {
  const [globalFilter, setGlobalFilter] = useState(initialFilter);
  const debouncedGlobalFilter = useDebouncedValue(globalFilter, 300);

  const pagination = useCursorPagination({
    resetDeps: [debouncedGlobalFilter, ...resetDeps],
  });

  const variables = useMemo<TVars>(() => {
    const base = {
      first: pageSize,
      after: pagination.after,
      where: buildWhere ? buildWhere(debouncedGlobalFilter) : null,
    } as TVars;

    return base;
  }, [pageSize, pagination.after, debouncedGlobalFilter, buildWhere]);

  return {
    globalFilter,
    debouncedGlobalFilter,
    setGlobalFilter,
    variables,
    after: pagination.after,
    cursorStack: pagination.cursorStack,
    currentCursorIndex: pagination.currentCursorIndex,
    hasPreviousPage: pagination.hasPreviousPage,
    goToFirst: pagination.goToFirst,
    goToPrevious: pagination.goToPrevious,
    goToNext: pagination.goToNext,
    goToLastKnown: pagination.goToLastKnown,
    goToPageIndex: pagination.goToPageIndex,
    canGoToPage: pagination.canGoToPage,
    canGoToLastKnown: pagination.canGoToLastKnown,
  };
}
