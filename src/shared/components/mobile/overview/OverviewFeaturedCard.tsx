import React from 'react'
import { Heart, ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface OverviewFeaturedCardProps {
  id?: string
  badge?: {
    label: string
    tone?: 'warning' | 'success' | 'info' | 'primary' | 'accent'
  }
  title: string
  subtitle?: string
  meta?: string
  highlight: string
  highlightLabel?: string
  visual?: React.ReactNode
  isFavorite?: boolean
  onToggleFavorite?: () => void
  onClick?: () => void
  actionLabel?: string
  className?: string
}

const BADGE_TONES = {
  warning: 'bg-warning-soft text-warning',
  success: 'bg-success-soft text-success',
  info: 'bg-info-soft text-info',
  primary: 'bg-primary-soft text-primary',
  accent: 'bg-accent/20 text-main',
}

export const OverviewFeaturedCard: React.FC<OverviewFeaturedCardProps> = ({
  badge,
  title,
  subtitle,
  meta,
  highlight,
  highlightLabel,
  visual,
  isFavorite = false,
  onToggleFavorite,
  onClick,
  actionLabel,
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
      className={cn(
        'group relative flex flex-col justify-between overflow-hidden rounded-[24px] border border-border bg-card p-3 shadow-elevation-1 outline-none transition-all duration-normal hover:shadow-elevation-2 focus-visible:ring-2 focus-visible:ring-focus',
        onClick && 'cursor-pointer active:scale-[0.98]',
        className,
      )}
      dir="rtl"
    >
      {/* Top Row: Badge + Favorite Heart */}
      <div className="flex items-center justify-between gap-1.5 pb-2">
        {badge ? (
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-black',
              BADGE_TONES[badge.tone || 'accent'],
            )}
          >
            {badge.label}
          </span>
        ) : (
          <span />
        )}

        {onToggleFavorite && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onToggleFavorite()
            }}
            aria-label={isFavorite ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-surface text-muted transition-colors hover:text-error focus-visible:ring-2 focus-visible:ring-focus"
          >
            <Heart size={13} className={cn(isFavorite ? 'fill-error text-error' : 'text-muted')} />
          </button>
        )}
      </div>

      {/* Center Visual / Avatar */}
      <div className="flex items-center justify-center py-1">
        <div className="bg-surface/80 border-border/50 relative flex h-20 w-full items-center justify-center overflow-hidden rounded-2xl border">
          {visual || (
            <span className="text-3xl" role="img" aria-label="صورة">
              📖
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="mt-2.5 space-y-1">
        <h4 className="truncate text-xs font-black leading-tight text-main transition-colors group-hover:text-primary">
          {title}
        </h4>

        {subtitle && <p className="truncate text-[10px] font-medium text-muted">{subtitle}</p>}

        {meta && (
          <p className="flex items-center gap-1 truncate text-[9px] font-semibold text-dim">
            <span>📍</span>
            <span>{meta}</span>
          </p>
        )}
      </div>

      {/* Bottom Highlight Row */}
      <div className="border-border/50 mt-2.5 flex items-center justify-between border-t pt-2">
        <div className="min-w-0">
          <p className="truncate font-dash text-xs font-black text-accent">{highlight}</p>
          {highlightLabel && (
            <p className="truncate text-[8px] font-bold text-muted">{highlightLabel}</p>
          )}
        </div>

        {actionLabel ? (
          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-primary transition-transform group-hover:translate-x-[-2px]">
            <span>{actionLabel}</span>
            <ChevronLeft size={12} />
          </span>
        ) : null}
      </div>
    </div>
  )
}
