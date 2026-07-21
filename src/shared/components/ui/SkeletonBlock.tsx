import { cn } from '../../../lib/utils';

interface SkeletonBlockProps {
    count?: number;
    height?: string;
    className?: string;
    rounded?: string;
}

export const SkeletonBlock = ({
    count = 3,
    height = 'h-32',
    className,
    rounded = 'rounded-card',
}: SkeletonBlockProps) => (
    <div className={cn('space-y-3', className)}>
        {Array.from({ length: count }).map((_, i) => (
            <div
                key={`skeleton-block-${i}`}
                className={cn(
                    'animate-pulse bg-hover border border-border/30',
                    height,
                    rounded
                )}
            />
        ))}
    </div>
);
