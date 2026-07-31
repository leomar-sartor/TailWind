/**
 * Formats an ISO date string as dd/MM/yyyy (pt-BR). Returns "—" when empty.
 */
export function formatDatePtBr(value?: string | null): string {
  if (!value) return '—';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}
