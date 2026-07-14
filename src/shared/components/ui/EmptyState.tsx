import React from 'react';
import { cn } from '../../../lib/utils';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
}) => (
  <div
    className={cn(
      'flex flex-col items-center justify-center text-center py-16 px-6 rounded-2xl fade-in',
      'bg-white/60 dark:bg-primary-active/50 backdrop-blur-md',
      'border border-dashed border-border dark:border-border',
      className
    )}
    dir="rtl"
  >
    {/* Floating icon bubble */}
    {icon && (
      <div
        className="mb-5 p-5 rounded-2xl bg-gradient-to-br from-[var(--bg-error)] to-[var(--bg-error)] dark:from-[var(--bg-primary-active)] dark:to-[var(--bg-primary-active)] text-error dark:text-info shadow-[0_8px_30px_rgb(239_68_68_/_0.1)] dark:shadow-[0_8px_30px_rgb(20_184_166_/_0.1)] animate-float"
      >
        {icon}
      </div>
    )}

    <h3 className="text-base font-bold text-main dark:text-dim mb-2">
      {title}
    </h3>
    {description && (
      <p className="text-sm text-muted dark:text-muted max-w-xs leading-relaxed font-medium mb-6">
        {description}
      </p>
    )}
    {action && <div>{action}</div>}
  </div>
);
