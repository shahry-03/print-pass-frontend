import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn('ui-input resize-y min-h-[88px]', className)} {...props} />
));

Textarea.displayName = 'Textarea';

export default Textarea;
