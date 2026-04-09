import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

type InputProps = InputHTMLAttributes<HTMLInputElement>;

const Input = forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn('ui-input', className)} {...props} />
));

Input.displayName = 'Input';

export default Input;
