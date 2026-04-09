import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

const PageHeader = ({ title, subtitle, icon, actions, className }: PageHeaderProps) => (
  <div className={cn('mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}>
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
        {icon}
        {title}
      </h1>
      {subtitle ? <p className="mt-1 text-slate-500 dark:text-slate-400">{subtitle}</p> : null}
    </div>
    {actions ? <div>{actions}</div> : null}
  </div>
);

export default PageHeader;
