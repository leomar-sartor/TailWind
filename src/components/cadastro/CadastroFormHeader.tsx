import { ArrowLeft } from 'lucide-react';

type CadastroFormHeaderProps = {
  title: string;
  description: string;
  onBack: () => void;
};

/**
 * Create/edit form header with back navigation.
 */
export function CadastroFormHeader({
  title,
  description,
  onBack,
}: CadastroFormHeaderProps) {
  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-xs font-medium dashboard-text-muted transition-colors hover:bg-[var(--color-surface-soft)] hover:text-[var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
      >
        <ArrowLeft aria-hidden="true" className="h-3.5 w-3.5" />
        <span>Voltar à listagem</span>
      </button>
      <div>
        <h1 className="text-xl font-semibold dashboard-text">{title}</h1>
        <p className="mt-1 text-sm dashboard-text-muted">{description}</p>
      </div>
    </div>
  );
}
