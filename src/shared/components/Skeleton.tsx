import { cn } from '../../lib/utils';

interface SkeletonProps {
    className?: string;
}

export const Skeleton = ({ className }: SkeletonProps) => {
    return (
        <div
            className={cn(
                "animate-pulse bg-gray-200 dark:bg-gray-800",
                className
            )}
        />
    );
};
