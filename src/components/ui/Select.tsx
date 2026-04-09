import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

const Select = forwardRef<HTMLSelectElement, SelectProps>(({ className, ...props }, ref) => (
  <select ref={ref} className={cn('ui-input', className)} {...props} />
));

Select.displayName = 'Select';

export default Select;
