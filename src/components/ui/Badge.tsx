import type { HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

type BadgeVariant =
  | 'success'
  | 'warning'
  | 'info'
  | 'danger'
  | 'neutral'
  | 'primary';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const styles: Record<BadgeVariant, string> = {
  success: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
  warning: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  danger: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  neutral: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
  primary: 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300',
};

const Badge = ({ className, variant = 'neutral', ...props }: BadgeProps) => (
  <span
    className={cn(
      'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
      styles[variant],
      className
    )}
    {...props}
  />
);

export default Badge;
