import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

type ButtonVariant = 'primary' | 'soft' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'ui-btn-primary',
  soft: 'ui-btn-soft',
  ghost: 'bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', type = 'button', ...props }, ref) => (
    <button ref={ref} type={type} className={cn('btn-press', variantClasses[variant], className)} {...props} />
  )
);

Button.displayName = 'Button';

export default Button;
