import type { ReactNode } from 'react';

interface IconFieldProps {
  icon: ReactNode;
  children: ReactNode;
  className?: string;
}

const IconField = ({ icon, children, className }: IconFieldProps) => (
  <div className={className}>
    <div className="relative">
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
        {icon}
      </span>
      {children}
    </div>
  </div>
);

export default IconField;
