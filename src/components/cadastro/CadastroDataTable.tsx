import type { ReactNode } from 'react';

type CadastroDataTableProps = {
  columns: string[];
  children: ReactNode;
  empty: boolean;
  emptyText: string;
  loadingText?: string;
  loading?: boolean;
  footer?: ReactNode;
};

/**
 * Table shell with header columns, empty/loading state and optional footer.
 */
export function CadastroDataTable({
  columns,
  children,
  empty,
  emptyText,
  loadingText,
  loading = false,
  footer,
}: CadastroDataTableProps) {
  return (
    <section className="dashboard-card rounded-[28px] border p-0 overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left">
          <thead className="bg-[#F8FAFF]">
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  className="px-6 py-4 text-sm font-semibold text-[#2B2C40]"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {children}
            {empty && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-sm text-[#6C7287]"
                >
                  {loading ? (loadingText ?? emptyText) : emptyText}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {footer}
    </section>
  );
}

type CadastroTableCellProps = {
  children: ReactNode;
  muted?: boolean;
  className?: string;
};

/**
 * Standard table cell styling for cadastro lists.
 */
export function CadastroTableCell({
  children,
  muted = false,
  className = '',
}: CadastroTableCellProps) {
  return (
    <td
      className={`px-6 py-4 align-top text-sm ${muted ? 'text-[#6C7287]' : 'text-[#2B2C40]'} ${className}`.trim()}
    >
      {children}
    </td>
  );
}

type CadastroTableRowProps = {
  children: ReactNode;
};

/**
 * Hoverable table row for cadastro lists.
 */
export function CadastroTableRow({ children }: CadastroTableRowProps) {
  return <tr className="hover:bg-[#F4F6FA] transition-colors">{children}</tr>;
}
