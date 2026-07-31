import { CursorPagination } from '../CursorPagination';

type CadastroPaginationBarProps = {
  pageSize: number;
  totalCount: number;
  currentCursorIndex: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  canGoToLastKnown: boolean;
  canGoToPage: (pageIndex: number, hasNextPage: boolean) => boolean;
  itemLabel: (count: number) => string;
  endCursor?: string | null;
  onFirst: () => void;
  onPrevious: () => void;
  onNext: (endCursor: string | null | undefined, hasNextPage: boolean) => void;
  onLastKnown: () => void;
  onPageIndex: (
    pageIndex: number,
    endCursor: string | null | undefined,
    hasNextPage: boolean,
  ) => void;
};

/**
 * Footer with item count text and cursor pagination controls.
 */
export function CadastroPaginationBar({
  pageSize,
  totalCount,
  currentCursorIndex,
  hasPreviousPage,
  hasNextPage,
  canGoToLastKnown,
  canGoToPage,
  itemLabel,
  endCursor,
  onFirst,
  onPrevious,
  onNext,
  onLastKnown,
  onPageIndex,
}: CadastroPaginationBarProps) {
  return (
    <div className="flex flex-col gap-3 border-t px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm text-[#6C7287]">
        Página {currentCursorIndex + 1} · {itemLabel(totalCount)}
      </div>
      <CursorPagination
        pageSize={pageSize}
        totalCount={totalCount}
        currentCursorIndex={currentCursorIndex}
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        canGoToLastKnown={canGoToLastKnown}
        canGoToPage={canGoToPage}
        onFirst={onFirst}
        onPrevious={onPrevious}
        onNext={() => onNext(endCursor, hasNextPage)}
        onLastKnown={onLastKnown}
        onPage={(pageIndex) => onPageIndex(pageIndex, endCursor, hasNextPage)}
      />
    </div>
  );
}
