import type { ReactNode } from 'react';
import Card from './Card';
import { cn } from '../../utils/cn';

interface StatCardProps {
  label: string;
  value: ReactNode;
  className?: string;
}

const StatCard = ({ label, value, className }: StatCardProps) => (
  <Card className={cn('rounded-2xl p-5', className)}>
    <p className="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
    <div className="text-3xl font-black">{value}</div>
  </Card>
);

export default StatCard;
