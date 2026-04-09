import type { HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

type CardProps = HTMLAttributes<HTMLDivElement>;

const Card = ({ className, ...props }: CardProps) => (
  <div className={cn('ui-card', className)} {...props} />
);

export default Card;
