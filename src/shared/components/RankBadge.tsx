import { Star } from 'lucide-react'
import { cn } from '../../lib/utils'
import { RANK_ICON_MAP } from '../utils/ranks'
import type { Rank } from '../utils/ranks'

interface RankBadgeProps {
  rank: Rank
  className?: string
  showName?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export const RankBadge = ({ rank, className, showName = true, size = 'md' }: RankBadgeProps) => {
  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-micro gap-1 border',
    md: 'px-2.5 py-1 text-micro gap-1.5 border-2',
    lg: 'px-4 py-2 text-xs gap-2 border-[3px]',
  }

  const iconSizes = {
    sm: 10,
    md: 14,
    lg: 18,
  }

  const IconComponent = RANK_ICON_MAP[rank.icon] || Star

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-2xl font-bold uppercase text-on-primary shadow-elevation-1',
        rank.badgeColor,
        sizeClasses[size],
        className,
      )}
    >
      <IconComponent size={iconSizes[size]} />
      {showName && <span className="tracking-tighter">{rank.name}</span>}
    </div>
  )
}
