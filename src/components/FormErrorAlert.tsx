type FormErrorAlertProps = {
  message?: string | null;
  className?: string;
};

/**
 * Reusable inline alert for form-level GraphQL / domain errors.
 */
export function FormErrorAlert({ message, className }: FormErrorAlertProps) {
  if (!message) return null;

  return (
    <div
      className={[
        'mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      role="alert"
    >
      {message}
    </div>
  );
}
