import { Button } from '../Button';

type CadastroFormActionsProps = {
  submitLabel: string;
  busyLabel?: string;
  isBusy?: boolean;
  submitDisabled?: boolean;
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
  submitDisabled = false,
  onCancel,
  cancelLabel = 'Cancelar',
}: CadastroFormActionsProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
      <Button
        type="submit"
        disabled={isBusy || submitDisabled}
      >
        {isBusy ? busyLabel : submitLabel}
      </Button>
      <Button
        type="button"
        variant="secondary"
        onClick={onCancel}
      >
        {cancelLabel}
      </Button>
    </div>
  );
}
