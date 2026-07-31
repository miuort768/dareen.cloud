import type { ReactNode } from 'react';
import { ChevronLeft, MoreHorizontal } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { triggerHaptic } from '../../../lib/haptics';

interface MobileListItemProps {
    leading?: ReactNode;
    title: ReactNode;
    subtitle?: ReactNode;
    trailing?: ReactNode;
    onClick?: () => void;
    showChevron?: boolean;
    onMenu?: () => void;
    className?: string;
    selected?: boolean;
}

/**
 * Tappable native-style list row: leading icon/avatar, title + subtitle,
 * optional trailing element, chevron, and a three-dot action menu.
 */
export const MobileListItem = ({
    leading,
    title,
    subtitle,
    trailing,
    onClick,
    showChevron = false,
    onMenu,
    className,
    selected = false,
}: MobileListItemProps) => {
    const handleClick = () => {
        if (!onClick) return;
        triggerHaptic('light');
        onClick();
    };

    return (
        <div
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
            onClick={handleClick}
            onKeyDown={(e) => {
                if (onClick && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    handleClick();
                }
            }}
            className={cn(
                'flex items-center gap-3 px-4 py-3.5 bg-card border border-border rounded-2xl shadow-sm',
                'transition-all duration-fast active:scale-[0.985]',
                onClick && 'cursor-pointer',
                selected && 'border-primary',
                className
            )}
        >
            {leading && <div className="shrink-0">{leading}</div>}

            <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-main truncate">{title}</div>
                {subtitle && <div className="text-[11px] font-medium text-muted truncate mt-0.5">{subtitle}</div>}
            </div>

            {trailing && <div className="shrink-0">{trailing}</div>}

            {onMenu && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        triggerHaptic('light');
                        onMenu();
                    }}
                    aria-label="خيارات أخرى"
                    className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-muted transition-colors hover:bg-hover active:scale-95"
                >
                    <MoreHorizontal size={18} strokeWidth={2} />
                </button>
            )}

            {showChevron && (
                <ChevronLeft size={16} className="shrink-0 text-dim" />
            )}
        </div>
    );
};
