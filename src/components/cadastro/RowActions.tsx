import { Edit3, Trash2 } from 'lucide-react';

type RowActionsProps = {
  onEdit: () => void;
  onDelete: () => void;
  disabled?: boolean;
};

/**
 * Edit/delete action buttons for cadastro table rows.
 */
export function RowActions({ onEdit, onDelete, disabled = false }: RowActionsProps) {
  return (
    <div className="flex flex-nowrap items-center gap-1.5 whitespace-nowrap">
      <button
        type="button"
        className="inline-flex shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white px-2 py-1.5 text-sm text-[#2B2C40] transition hover:bg-[#F4F6FA]"
        onClick={onEdit}
      >
        <Edit3 className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        className="inline-flex shrink-0 items-center justify-center rounded-2xl border border-rose-200 bg-white px-2 py-1.5 text-sm text-rose-500 transition hover:bg-rose-50"
        onClick={onDelete}
        disabled={disabled}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
