import type { ReactNode } from 'react';
import { cn } from '../../../lib/utils';

interface MobilePageProps {
    children: ReactNode;
    className?: string;
    /** Bottom padding reserved for the global AppTabBar. Default true. */
    withBottomNav?: boolean;
}

/**
 * Full-screen mobile page container: light padding, bottom space for the
 * global tab bar, and a subtle slide-up entrance animation.
 */
export const MobilePage = ({ children, className, withBottomNav = true }: MobilePageProps) => (
    <div
        dir="rtl"
        className={cn(
            'min-h-full bg-background overflow-x-hidden animate-page-enter',
            withBottomNav ? 'pb-28' : 'pb-6',
            className
        )}
    >
        {children}
    </div>
);
