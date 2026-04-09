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
        sm: 'px-1.5 py-0.5 text-[8px] gap-1 border',
        md: 'px-2.5 py-1 text-[10px] gap-1.5 border-2',
        lg: 'px-4 py-2 text-xs gap-2 border-[3px]'
    };

    const iconSizes = {
        sm: 'text-[10px]',
        md: 'text-[14px]',
        lg: 'text-[18px]'
    };

    return (
        <div className={cn(
            "inline-flex items-center font-black uppercase text-white border-gray-950 shadow-[2px_2px_0px_0px_black] transform skew-x-[-12deg]",
            rank.badgeColor,
            sizeClasses[size],
            className
        )}>
            <span className={cn("transform skew-x-[12deg]", iconSizes[size])}>{rank.icon}</span>
            {showName && <span className="transform skew-x-[12deg] tracking-tighter">{rank.name}</span>}
        </div>
    );
};
