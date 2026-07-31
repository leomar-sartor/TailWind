import type { ReactNode } from 'react';

type CadastroAlertVariant = 'error' | 'success';

type CadastroAlertProps = {
  children: ReactNode;
  variant?: CadastroAlertVariant;
  className?: string;
};

const variantClassName: Record<CadastroAlertVariant, string> = {
  error: 'border-rose-200 bg-rose-50 text-rose-700',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
};

/**
 * Banner alert used on cadastro list/form pages.
 */
export function CadastroAlert({
  children,
  variant = 'error',
  className = '',
}: CadastroAlertProps) {
  return (
    <div
      className={`rounded-3xl border p-4 text-sm ${variantClassName[variant]} ${className}`.trim()}
    >
      {children}
    </div>
  );
}
