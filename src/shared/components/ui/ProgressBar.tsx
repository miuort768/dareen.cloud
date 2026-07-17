import React from 'react';
import { cn } from '../../../lib/utils';
import type { ProgressVariant } from '../../../lib/progress';
import { getProgressColor } from '../../../lib/progress';

export interface ProgressBarProps {
  value: number;
  variant?: ProgressVariant;
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
  showLabel?: boolean;
  className?: string;
  trackClassName?: string;
}

const sizeClasses: Record<string, string> = {
  sm: 'h-1',
  md: 'h-1.5',
  lg: 'h-2',
};

export const ProgressBar = ({
  value,
  variant = 'usage',
  size = 'md',
  animate = true,
  showLabel = false,
  className,
  trackClassName,
}: ProgressBarProps) => {
  const clamped = Math.max(0, Math.min(100, value));
  const color = getProgressColor(clamped, variant);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        className={cn(
          'flex-1 bg-surface rounded-full overflow-hidden',
          sizeClasses[size],
          trackClassName,
        )}
      >
        <div
          className={cn(
            'h-full rounded-full',
            color,
            animate && 'transition-all duration-1000 ease-out',
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-micro font-mono font-medium text-dim shrink-0 min-w-[2.5rem] text-end">
          {clamped}%
        </span>
      )}
    </div>
  );
};

ProgressBar.displayName = 'ProgressBar';
