import { cn } from '../../../lib/utils'

interface MobileSkeletonProps {
  rows?: number
  className?: string
}

/**
 * Native-style list skeleton: a card with shimmering placeholder rows.
 */
export const MobileSkeleton = ({ rows = 4, className }: MobileSkeletonProps) => (
  <div className={cn('space-y-3 px-3 pt-3', className)}>
    {Array.from({ length: rows }).map((_, i) => (
      <div
        key={`skel-mobile-${i}`}
        className="space-y-3 rounded-2xl border border-border bg-card p-4 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 shrink-0 animate-pulse rounded-xl bg-hover" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-3/5 animate-pulse rounded-full bg-hover" />
            <div className="h-2.5 w-2/5 animate-pulse rounded-full bg-hover" />
          </div>
          <div className="h-8 w-8 animate-pulse rounded-xl bg-hover" />
        </div>
      </div>
    ))}
  </div>
)
