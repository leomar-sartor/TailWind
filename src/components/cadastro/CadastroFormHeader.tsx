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
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-[#696CFF] hover:text-[#384551] transition"
      >
        <ArrowLeft className="h-5 w-5" />
        <span className="text-sm font-medium">Voltar</span>
      </button>
      <div>
        <h1 className="text-2xl font-semibold text-[#2B2C40]">{title}</h1>
        <p className="mt-1 text-sm text-[#6C7287]">{description}</p>
      </div>
    </div>
  );
}
