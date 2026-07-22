type CursorPaginationProps = {
  pageSize: number;
  totalCount: number;
  currentCursorIndex: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  canGoToLastKnown: boolean;
  canGoToPage: (pageIndex: number, hasNextPage: boolean) => boolean;
  onFirst: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onLastKnown: () => void;
  onPage: (pageIndex: number) => void;
};

const buttonClassName =
  'rounded-lg border border-slate-200 bg-white text-[#2B2C40] hover:bg-[#F4F6FA] disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1 text-sm font-medium transition';

/**
 * Cursor-safe pagination controls. Jump-to-last only reaches pages already
 * present in the cursor stack (no blind jump to an unvisited page index).
 */
export function CursorPagination({
  pageSize,
  totalCount,
  currentCursorIndex,
  hasPreviousPage,
  hasNextPage,
  canGoToLastKnown,
  canGoToPage,
  onFirst,
  onPrevious,
  onNext,
  onLastKnown,
  onPage,
}: CursorPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className="flex items-center gap-2 flex-wrap justify-center">
      <button type="button" onClick={onFirst} disabled={!hasPreviousPage} className={buttonClassName}>
        «
      </button>

      <button type="button" onClick={onPrevious} disabled={!hasPreviousPage} className={buttonClassName}>
        ‹ Anterior
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
        const pageIndex = pageNum - 1;
        const isCurrent = currentCursorIndex === pageIndex;
        const isReachable = canGoToPage(pageIndex, hasNextPage);

        return (
          <button
            key={pageNum}
            type="button"
            onClick={() => onPage(pageIndex)}
            disabled={!isReachable && !isCurrent}
            className={`rounded-lg px-3 py-1 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${
              isCurrent
                ? 'bg-[#696CFF] text-white'
                : 'border border-slate-200 bg-white text-[#2B2C40] hover:bg-[#F4F6FA]'
            }`}
          >
            {pageNum}
          </button>
        );
      })}

      <button type="button" onClick={onNext} disabled={!hasNextPage} className={buttonClassName}>
        Próxima ›
      </button>

      <button
        type="button"
        onClick={onLastKnown}
        disabled={!canGoToLastKnown}
        className={buttonClassName}
        title="Ir para a última página já carregada"
      >
        »
      </button>
    </div>
  );
}
