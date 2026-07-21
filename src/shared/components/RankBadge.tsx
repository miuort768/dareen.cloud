import { cn } from '../../lib/utils';
import type { Rank } from '../utils/ranks';

interface RankBadgeProps {
    rank: Rank;
    className?: string;
    showName?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export const RankBadge = ({ rank, className, showName = true, size = 'md' }: RankBadgeProps) => {
    const sizeClasses = {
        sm: 'px-1.5 py-0.5 text-micro gap-1 border',
        md: 'px-2.5 py-1 text-micro gap-1.5 border-2',
        lg: 'px-4 py-2 text-xs gap-2 border-[3px]'
    };

    const iconSizes = {
        sm: 'text-micro',
        md: 'text-sm',
        lg: 'text-lg'
    };

    return (
        <div className={cn(
            "inline-flex items-center font-bold uppercase text-on-primary shadow-sm rounded-none",
            rank.badgeColor,
            sizeClasses[size],
            className
        )}>
            <span className={cn(iconSizes[size])}>{rank.icon}</span>
            {showName && <span className="tracking-tighter">{rank.name}</span>}
        </div>
    );
};
