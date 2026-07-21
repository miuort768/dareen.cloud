import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface EmptyStateProps {
    icon?: LucideIcon;
    iconClassName?: string;
    title: string;
    subtitle?: string;
    action?: React.ReactNode;
    className?: string;
    compact?: boolean;
}

export const EmptyState = ({
    icon: Icon = Inbox,
    iconClassName,
    title,
    subtitle,
    action,
    className,
    compact = false,
}: EmptyStateProps) => (
    <div
        className={cn(
            'flex flex-col items-center justify-center text-center',
            compact ? 'py-10' : 'py-16 md:py-20',
            className
        )}
    >
        <div
            className={cn(
                'flex items-center justify-center mb-4 rounded-card bg-hover border border-border/50',
                compact ? 'w-12 h-12' : 'w-14 h-14 md:w-16 md:h-16'
            )}
        >
            <Icon
                size={compact ? 20 : 24}
                className={cn('text-muted', iconClassName)}
            />
        </div>
        <p
            className={cn(
                'font-semibold text-main',
                compact ? 'text-sm' : 'text-base'
            )}
        >
            {title}
        </p>
        {subtitle && (
            <p className="text-sm text-muted mt-1 max-w-xs">{subtitle}</p>
        )}
        {action && <div className="mt-4">{action}</div>}
    </div>
);
