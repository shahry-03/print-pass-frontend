import type { JobStatus } from '../../types';

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  PENDING: { label: 'Pending', bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400' },
  PROCESSING: { label: 'Processing', bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400' },
  READY: { label: 'Ready', bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400' },
  COMPLETED: { label: 'Completed', bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400' },
  CANCELLED: { label: 'Cancelled', bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' },
};

interface StatusBadgeProps {
  status: JobStatus;
}

/** Color-coded badge for job status */
const StatusBadge = ({ status }: StatusBadgeProps) => {
  const config = statusConfig[status] || statusConfig.PENDING;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {config.label}
    </span>
  );
};

export default StatusBadge;
