import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface MobileSectionHeaderProps {
    title: string;
    subtitle?: string;
    icon?: LucideIcon;
    action?: ReactNode;
    className?: string;
}

/**
 * Compact section label used to group content on mobile screens.
 */
export const MobileSectionHeader = ({ title, subtitle, icon: Icon, action, className }: MobileSectionHeaderProps) => (
    <div className={cn('flex items-center gap-2 px-1 mb-2', className)}>
        {Icon && (
            <div className="w-7 h-7 rounded-lg bg-primary-soft flex items-center justify-center shrink-0">
                <Icon size={14} className="text-primary" />
            </div>
        )}
        <div className="flex-1 min-w-0">
            <h2 className="text-xs font-bold text-main truncate">{title}</h2>
            {subtitle && <p className="text-[10px] font-medium text-muted truncate">{subtitle}</p>}
        </div>
        {action}
    </div>
);
