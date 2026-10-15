import type { ReactNode } from 'react';

type StatusBadgeProps = { children: ReactNode; tone?: 'positive' | 'negative' | 'warning' | 'neutral' };
const tones = {
  positive: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
  negative: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200',
  warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  neutral: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-200',
};

export function StatusBadge({ children, tone = 'neutral' }: StatusBadgeProps) {
  return <span className={`inline-flex items-center whitespace-nowrap rounded-full px-3 py-0.5 text-xs font-medium leading-4 ${tones[tone]}`}>{children}</span>;
}
