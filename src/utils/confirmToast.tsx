import { toast } from 'react-toastify';

type ConfirmDeletionOptions = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
};

export function confirmDeletion({
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
}: ConfirmDeletionOptions) {
  return toast(
    ({ closeToast }) => (
      <div className="mx-auto w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-5 text-center shadow-2xl dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
        <div className="font-semibold text-slate-800 dark:text-slate-100">{title}</div>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{message}</p>
        <div className="mt-4 flex justify-center gap-2">
          <button
            type="button"
            className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-900"
            onClick={() => {
              onCancel?.();
              closeToast();
            }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className="rounded-full bg-rose-500 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-rose-600"
            onClick={async () => {
              try {
                await onConfirm();
              } finally {
                closeToast();
              }
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    ),
    {
      autoClose: false,
      closeOnClick: false,
      closeButton: false,
      draggable: false,
      hideProgressBar: true,
      className: 'bg-transparent shadow-none p-0',
      style: { padding: 0, background: 'transparent', boxShadow: 'none' },
    }
  );
}

type GraphQLErrorLike = {
  message?: string;
  extensions?: { message?: string };
};

/**
 * Extracts a user-facing message from Apollo/GraphQL error shapes
 * (single error, error arrays, or mutation result.error).
 */
export function getGraphQLErrorMessage(error: unknown): string | null {
  if (!error) return null;

  if (Array.isArray(error)) {
    const firstError = error[0] as GraphQLErrorLike | undefined;
    return firstError?.extensions?.message ?? firstError?.message ?? null;
  }

  const err = error as {
    message?: string;
    errors?: GraphQLErrorLike[];
    graphQLErrors?: GraphQLErrorLike[];
  };
  const possibleErrors = err.errors ?? err.graphQLErrors;

  if (Array.isArray(possibleErrors) && possibleErrors.length > 0) {
    const firstError = possibleErrors[0];
    return firstError?.extensions?.message ?? firstError?.message ?? null;
  }

  if (err?.message) {
    return err.message;
  }

  return null;
}
