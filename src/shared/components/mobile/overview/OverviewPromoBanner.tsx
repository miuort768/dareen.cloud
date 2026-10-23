import React from 'react'
import { ChevronLeft } from 'lucide-react'
import { cn } from '../../../lib/utils'

export interface OverviewPromoBannerProps {
  title: string
  subtitle: string
  iconEmoji?: string
  icon?: React.ReactNode
  onClick?: () => void
  ariaLabel?: string
  className?: string
}

export const OverviewPromoBanner: React.FC<OverviewPromoBannerProps> = ({
  title,
  subtitle,
  iconEmoji = '🦜',
  icon,
  onClick,
  ariaLabel,
  className,
}) => {
  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onClick()
        }
      }}
      aria-label={ariaLabel || title}
      className={cn(
        'border-accent/20 from-accent-light/40 group relative flex items-center justify-between gap-3 overflow-hidden rounded-[24px] border bg-gradient-to-r via-accent-soft to-card p-3.5 shadow-elevation-1 outline-none transition-all duration-normal hover:shadow-elevation-2 focus-visible:ring-2 focus-visible:ring-focus',
        onClick && 'cursor-pointer active:scale-[0.98]',
        className,
      )}
      dir="rtl"
    >
      <div className="flex min-w-0 items-center gap-3">
        {/* Leading Mascot / Icon */}
        <div className="bg-accent/20 border-accent/30 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-2xl shadow-elevation-1">
          {icon || <span>{iconEmoji}</span>}
        </div>

        {/* Text */}
        <div className="min-w-0">
          <h4 className="truncate text-xs font-black text-main transition-colors group-hover:text-primary">
            {title}
          </h4>
          <p className="truncate text-[10px] font-medium text-muted">{subtitle}</p>
        </div>
      </div>

      {/* Trailing Circular Action Button */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-on-accent shadow-elevation-1 transition-transform group-hover:translate-x-[-2px] group-hover:scale-105">
        <ChevronLeft size={16} strokeWidth={2.5} />
      </div>
    </div>
  )
}
