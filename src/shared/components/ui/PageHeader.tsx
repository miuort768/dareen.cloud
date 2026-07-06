import React from 'react';
import { cn } from '../../../lib/utils';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
  stats?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title, subtitle, icon, actions, breadcrumbs, stats, className,
}) => {
  return (
    <div className={cn('mb-6', className)}>
      {breadcrumbs && (
        <div className="mb-3">
          {breadcrumbs}
        </div>
      )}

      <div className="bg-card border border-border rounded-card shadow-card p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="shrink-0 w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
                {icon}
              </div>
            )}
            <div>
              <h1 className="text-section font-bold text-main">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-muted mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
          {actions && (
            <div className="flex items-center gap-2 shrink-0">
              {actions}
            </div>
          )}
        </div>

        {stats && (
          <div className="mt-5 pt-5 border-t border-border">
            <div className="flex flex-wrap gap-4">
              {stats}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

PageHeader.displayName = 'PageHeader';
