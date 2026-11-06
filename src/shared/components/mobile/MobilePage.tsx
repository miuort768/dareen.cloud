import type { ReactNode } from 'react'
import { cn } from '../../../lib/utils'

interface MobilePageProps {
  children: ReactNode
  className?: string
  /** Bottom padding reserved for the global AppTabBar. Default true. */
  withBottomNav?: boolean
}

/**
 * Full-screen mobile page container: light padding, bottom space for the
 * global tab bar, and a subtle slide-up entrance animation.
 */
export const MobilePage = ({ children, className, withBottomNav = true }: MobilePageProps) => (
  <div
    dir="rtl"
    className={cn(
      'animate-page-enter min-h-full overflow-x-hidden bg-background',
      withBottomNav ? 'pb-6' : 'pb-2',
      className,
    )}
  >
    {children}
  </div>
)
