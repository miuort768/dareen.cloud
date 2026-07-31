import type { ReactNode } from 'react';
import { ChevronRight, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCurrentUser } from '../../../context/AppContext';
import { useUnreadStore } from '../../../store/unreadStore';
import { cn } from '../../../lib/utils';

interface MobileTopBarProps {
    title?: string;
    subtitle?: string;
    showBack?: boolean;
    backTo?: string;
    avatar?: ReactNode;
    actions?: ReactNode;
    className?: string;
}

/**
 * Sticky frosted-glass mobile app bar. Renders a back button (optional),
 * title/subtitle, and trailing actions. Safe-area top is provided globally.
 */
export const MobileTopBar = ({
    title,
    subtitle,
    showBack = false,
    backTo,
    avatar,
    actions,
    className,
}: MobileTopBarProps) => {
    const navigate = useNavigate();
    const currentUser = useCurrentUser();
    const totalUnreadCount = useUnreadStore(s => s.totalUnreadCount);

    const firstName = (currentUser?.name || currentUser?.username || '').split(' ')[0];

    return (
        <header
            className={cn(
                'sticky top-0 z-[90] bg-surface/80 dark:bg-surface/90 backdrop-blur-xl border-b border-border',
                className
            )}
        >
            <div className="flex items-center justify-between gap-2 px-3 h-14">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    {showBack && (
                        <button
                            onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
                            aria-label="رجوع"
                            className="shrink-0 w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center text-main transition-colors active:scale-95 hover:bg-hover"
                        >
                            <ChevronRight size={18} />
                        </button>
                    )}
                    {avatar ?? (
                        <div className="shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-deep flex items-center justify-center shadow-elevation-1">
                            <span className="text-xs font-bold text-on-primary">
                                {(firstName || 'د').charAt(0)}
                            </span>
                        </div>
                    )}
                    <div className="min-w-0">
                        {title && (
                            <h1 className="text-sm font-bold text-main leading-tight truncate">{title}</h1>
                        )}
                        {subtitle && (
                            <p className="text-[11px] font-medium text-muted leading-snug truncate">{subtitle}</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                    {actions}
                    <button
                        onClick={() => navigate('/parent-announcements')}
                        aria-label="الإعلانات"
                        className="relative w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center text-muted transition-colors active:scale-95 hover:bg-hover"
                    >
                        <Bell size={16} strokeWidth={1.5} />
                        {totalUnreadCount > 0 && (
                            <span className="absolute -top-0.5 -end-0.5 min-w-[15px] h-[15px] px-1 bg-error text-on-error text-[8px] font-bold flex items-center justify-center rounded-full border-2 border-surface">
                                {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </header>
    );
};
