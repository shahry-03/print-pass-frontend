import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  children?: ReactNode;
}

/** Centered empty / zero-data state for dashboards and lists */
const EmptyState = ({ icon, title, description, children }: EmptyStateProps) => (
  <div
    className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-600/60 bg-slate-50/80 dark:bg-slate-900/40 px-6 py-12 sm:py-14 text-center"
    role="status"
  >
    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100/90 dark:bg-primary-900/35 text-primary-600 dark:text-primary-400 [&>svg]:h-7 [&>svg]:w-7">
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
    {description && (
      <p className="mt-2 max-w-md mx-auto text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
        {description}
      </p>
    )}
    {children && <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">{children}</div>}
  </div>
);

export default EmptyState;
