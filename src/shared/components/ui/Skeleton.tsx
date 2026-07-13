import { cn } from '../../../lib/utils';

interface SkeletonBaseProps {
    className?: string;
}

export const Skeleton = ({ className }: SkeletonBaseProps) => (
    <div className={cn('animate-pulse bg-hover rounded-md', className)} />
);

export const SkeletonText = ({ lines = 3, className }: { lines?: number; className?: string }) => (
    <div className={cn('flex flex-col gap-2', className)}>
        {Array.from({ length: lines }).map((_, i) => (
            <Skeleton key={i} className={cn('h-3', i === lines - 1 ? 'w-3/4' : 'w-full')} />
        ))}
    </div>
);

export const SkeletonAvatar = ({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) => (
    <Skeleton className={cn(
        'rounded-full shrink-0',
        size === 'sm' ? 'w-8 h-8' : size === 'md' ? 'w-10 h-10' : 'w-14 h-14',
        className
    )} />
);

export const SkeletonCard = ({ className }: { className?: string }) => (
    <div className={cn('bg-card border border-border rounded-card p-6', className)}>
        <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        <Skeleton className="h-8 w-20 mb-2" />
        <Skeleton className="h-3 w-32" />
    </div>
);

export interface SkeletonChartProps {
    chartType?: 'bar' | 'line' | 'pie';
    className?: string;
}

export const SkeletonChart = ({ chartType = 'bar', className }: SkeletonChartProps) => (
    <div className={cn('flex items-end gap-2 h-full', className)}>
        {chartType === 'bar' ? (
            Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className={cn('flex-1', ['h-12', 'h-20', 'h-10', 'h-24', 'h-16', 'h-8', 'h-28', 'h-14'][i])} />
            ))
        ) : (
            <Skeleton className="w-full h-full rounded-full" />
        )}
    </div>
);

export const SkeletonTable = ({ rows = 5, cols = 4, className }: { rows?: number; cols?: number; className?: string }) => (
    <div className={cn('flex flex-col gap-3', className)}>
        {Array.from({ length: rows }).map((_, r) => (
            <div key={r} className="flex gap-4">
                {Array.from({ length: cols }).map((_, c) => (
                    <Skeleton key={c} className={cn('h-4 flex-1', c === 0 ? 'w-1/3' : '')} />
                ))}
            </div>
        ))}
    </div>
);
