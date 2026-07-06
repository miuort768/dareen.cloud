import { cn } from '../../../lib/utils';
import { Loader2 } from 'lucide-react';

interface SpinnerProps {
  size?: number;
  className?: string;
}

export const Spinner = ({ size = 24, className }: SpinnerProps) => (
  <Loader2
    size={size}
    className={cn('animate-spin text-primary', className)}
  />
);
