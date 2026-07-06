import React from 'react';
import { cn } from '../../../lib/utils';
import { Badge } from './Badge';
import type { BadgeProps } from './Badge';

export interface ActivityItem {
  id: string;
  title: string;
  description?: string;
  time: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  badge?: string;
  badgeVariant?: BadgeProps['variant'];
  onClick?: () => void;
}

export interface ActivityFeedProps {
  items: ActivityItem[];
  title?: string;
  subtitle?: string;
  emptyMessage?: string;
  className?: string;
  maxHeight?: number;
  dir?: 'rtl' | 'ltr';
}

const dotColor: Record<string, string> = {
  default: 'bg-muted',
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-error',
  info: 'bg-info',
};

const lineColor: Record<string, string> = {
  default: 'bg-border',
  success: 'bg-success/30',
  warning: 'bg-warning/30',
  error: 'bg-error/30',
  info: 'bg-info/30',
};

const iconColor: Record<string, string> = {
  default: 'text-muted',
  success: 'text-success',
  warning: 'text-warning-dark',
  error: 'text-error',
  info: 'text-info',
};

const iconBg: Record<string, string> = {
  default: 'bg-muted/10',
  success: 'bg-success-soft',
  warning: 'bg-warning-soft',
  error: 'bg-error-soft',
  info: 'bg-info-soft',
};

export const ActivityFeed = ({
  items,
  title,
  subtitle,
  emptyMessage = 'لا توجد نشاطات حديثة',
  className,
  maxHeight,
  dir = 'rtl',
}: ActivityFeedProps) => {
  const lineSide = dir === 'rtl' ? 'start-4' : 'end-4';

  return (
    <div className={cn('bg-card border border-border rounded-2xl shadow-sm p-5', className)}>
      {title && (
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-bold text-main">{title}</h3>
            {subtitle && <p className="text-micro font-medium text-muted mt-0.5">{subtitle}</p>}
          </div>
        </div>
      )}

      <div
        className={cn('space-y-0', maxHeight && 'overflow-y-auto')}
        style={maxHeight ? { maxHeight } : undefined}
        dir={dir}
      >
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center mb-2">
              <span className="text-dim text-lg">•</span>
            </div>
            <p className="text-xs font-bold text-muted">{emptyMessage}</p>
          </div>
        ) : (
          items.map((item, i) => {
            const Icon = item.icon;
            const isLast = i === items.length - 1;
            const dotCls = dotColor[item.variant || 'default'];
            const lineCls = lineColor[item.variant || 'default'];
            const icnCls = iconColor[item.variant || 'default'];
            const bgCls = iconBg[item.variant || 'default'];

            return (
              <div key={item.id} className="relative flex gap-4 items-start group py-2">
                {!isLast && (
                  <div className={cn('absolute top-10 w-[2px] h-[calc(100%-20px)]', lineCls, lineSide)} />
                )}

                {Icon ? (
                  <div className={cn('z-10 w-10 h-10 rounded-xl flex items-center justify-center shrink-0', bgCls)}>
                    <Icon size={16} className={icnCls} />
                  </div>
                ) : (
                  <div className={cn('z-10 w-4 h-4 rounded-full mt-1.5 shrink-0', dotCls)} />
                )}

                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={cn('text-xs font-bold text-main truncate', item.onClick && 'cursor-pointer hover:text-primary')}
                      onClick={item.onClick}
                      role={item.onClick ? 'button' : undefined}
                      tabIndex={item.onClick ? 0 : undefined}
                      onKeyDown={item.onClick ? (e) => { if (e.key === 'Enter') item.onClick?.(); } : undefined}
                    >
                      {item.title}
                    </span>
                    {item.badge && (
                      <Badge variant={item.badgeVariant || item.variant || 'default'} size="sm">
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-micro font-medium text-muted mt-0.5">{item.description}</p>
                  )}
                  <p className="text-micro font-bold text-dim mt-1">{item.time}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

ActivityFeed.displayName = 'ActivityFeed';
