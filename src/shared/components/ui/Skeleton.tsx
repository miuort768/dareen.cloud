import type { CSSProperties } from 'react'
import { cn } from '../../../lib/utils'

interface SkeletonBaseProps {
  className?: string
  style?: CSSProperties
}

export const Skeleton = ({ className, style }: SkeletonBaseProps) => (
  <div className={cn('animate-pulse rounded-md bg-hover', className)} style={style} />
)

export const SkeletonText = ({ lines = 3, className }: { lines?: number; className?: string }) => (
  <div className={cn('flex flex-col gap-2', className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={`skel-${i}`} className={cn('h-3', i === lines - 1 ? 'w-3/4' : 'w-full')} />
    ))}
  </div>
)

export const SkeletonAvatar = ({
  size = 'md',
  className,
}: {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) => (
  <Skeleton
    className={cn(
      'shrink-0 rounded-full',
      size === 'sm' ? 'h-8 w-8' : size === 'md' ? 'h-10 w-10' : 'h-14 w-14',
      className,
    )}
  />
)

export const SkeletonCard = ({ className }: { className?: string }) => (
  <div className={cn('rounded-card border border-border bg-card p-6', className)}>
    <div className="mb-4 flex items-center justify-between">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-8 rounded-full" />
    </div>
    <Skeleton className="mb-2 h-8 w-20" />
    <Skeleton className="h-3 w-32" />
  </div>
)

export interface SkeletonChartProps {
  chartType?: 'bar' | 'line' | 'pie'
  className?: string
}

export const SkeletonChart = ({ chartType = 'bar', className }: SkeletonChartProps) => (
  <div className={cn('flex h-full items-end gap-2', className)}>
    {chartType === 'bar' ? (
      Array.from({ length: 8 }).map((_, i) => (
        <Skeleton
          key={`skel-${i}`}
          className={cn(
            'flex-1',
            ['h-12', 'h-20', 'h-10', 'h-24', 'h-16', 'h-8', 'h-28', 'h-14'][i],
          )}
        />
      ))
    ) : (
      <Skeleton className="h-full w-full rounded-full" />
    )}
  </div>
)

export const SkeletonTable = ({
  rows = 5,
  cols = 4,
  className,
}: {
  rows?: number
  cols?: number
  className?: string
}) => (
  <div className={cn('flex flex-col gap-3', className)}>
    {Array.from({ length: rows }).map((_, r) => (
      <div key={r} className="flex gap-4">
        {Array.from({ length: cols }).map((_, c) => (
          <Skeleton key={c} className={cn('h-4 flex-1', c === 0 ? 'w-1/3' : '')} />
        ))}
      </div>
    ))}
  </div>
)
