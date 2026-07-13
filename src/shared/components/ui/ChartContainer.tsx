import React from 'react';
import { cn } from '../../../lib/utils';

interface ChartContainerProps {
  title?: string;
  subtitle?: string;
  headerExtra?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  height?: number;
  dir?: 'ltr' | 'rtl';
}

export const ChartContainer = ({
  title,
  subtitle,
  headerExtra,
  children,
  className,
  height = 280,
  dir = 'ltr',
}: ChartContainerProps) => (
  <div className={cn('bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-colors duration-slow overflow-hidden', className)}>
    {(title || headerExtra) && (
      <div className="flex items-center justify-between gap-4 p-5 pb-0">
        {title && (
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-main">{title}</h3>
            {subtitle && <p className="text-micro font-medium text-muted mt-0.5">{subtitle}</p>}
          </div>
        )}
        {headerExtra && <div className="shrink-0">{headerExtra}</div>}
      </div>
    )}
    <div className="p-5" style={{ height }} dir={dir}>
      {children}
    </div>
  </div>
);

ChartContainer.displayName = 'ChartContainer';
