import { Button } from '../Button';

type CadastroFormActionsProps = {
  submitLabel: string;
  busyLabel?: string;
  isBusy?: boolean;
  onCancel: () => void;
  cancelLabel?: string;
};

/**
 * Submit/cancel actions for cadastro create/edit forms.
 */
export function CadastroFormActions({
  submitLabel,
  busyLabel = 'Salvando...',
  isBusy = false,
  onCancel,
  cancelLabel = 'Cancelar',
}: CadastroFormActionsProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
      <Button
        type="submit"
        disabled={isBusy}
        className="rounded-3xl px-5 py-3"
      >
        {isBusy ? busyLabel : submitLabel}
      </Button>
      <Button
        type="button"
        onClick={onCancel}
        className="rounded-3xl border border-slate-200 bg-white text-[#2B2C40] hover:bg-[#F4F6FA] px-5 py-3"
      >
        {cancelLabel}
      </Button>
    </div>
  );
}
