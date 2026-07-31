import { PlusCircle } from 'lucide-react';
import { Button } from '../Button';

type CadastroPageHeaderProps = {
  title: string;
  description: string;
  createLabel: string;
  onCreate: () => void;
};

/**
 * List page header with title, description and create action.
 */
export function CadastroPageHeader({
  title,
  description,
  createLabel,
  onCreate,
}: CadastroPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between px-4">
      <div>
        <h2 className="text-xl font-semibold text-[#2B2C40]">{title}</h2>
        <p className="mt-1 text-sm dashboard-text-muted">{description}</p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Button
          type="button"
          onClick={onCreate}
          className="rounded-3xl px-5 py-3 inline-flex items-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          {createLabel}
        </Button>
      </div>
    </div>
  );
}
