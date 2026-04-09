import type { ReactNode } from 'react';

interface FormFieldProps {
  id: string;
  label: string;
  children: ReactNode;
  error?: string;
  labelClassName?: string;
}

const FormField = ({ id, label, children, error, labelClassName }: FormFieldProps) => (
  <div>
    <label
      htmlFor={id}
      className={labelClassName ?? 'mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300'}
    >
      {label}
    </label>
    {children}
    {error ? (
      <p className="mt-1.5 text-xs text-red-600 dark:text-red-400" role="alert">
        {error}
      </p>
    ) : null}
  </div>
);

export default FormField;
