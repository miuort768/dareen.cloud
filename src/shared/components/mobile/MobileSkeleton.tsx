import { cn } from '../../../lib/utils';

interface MobileSkeletonProps {
    rows?: number;
    className?: string;
}

/**
 * Native-style list skeleton: a card with shimmering placeholder rows.
 */
export const MobileSkeleton = ({ rows = 4, className }: MobileSkeletonProps) => (
    <div className={cn('space-y-3 px-3 pt-3', className)}>
        {Array.from({ length: rows }).map((_, i) => (
            <div key={`skel-mobile-${i}`} className="bg-card border border-border rounded-2xl p-4 space-y-3 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-hover animate-pulse shrink-0" />
                    <div className="flex-1 space-y-2">
                        <div className="h-3.5 bg-hover rounded-full animate-pulse w-3/5" />
                        <div className="h-2.5 bg-hover/70 rounded-full animate-pulse w-2/5" />
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-hover animate-pulse" />
                </div>
            </div>
        ))}
    </div>
);
