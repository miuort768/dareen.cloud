import React, { useState } from 'react'
import { Bell, ChevronDown, Check } from 'lucide-react'
import { BottomSheet } from '../BottomSheet'
import { cn } from '../../../lib/utils'

export interface OverviewContextOption {
  id: string
  label: string
}

export interface OverviewHeaderProps {
  appName?: string
  slogan?: string
  logoIcon?: React.ReactNode
  notificationCount?: number
  onNotificationClick?: () => void
  contextLabel?: string
  contextOptions?: OverviewContextOption[]
  selectedContextId?: string
  onSelectContext?: (id: string) => void
  className?: string
}

export const OverviewHeader: React.FC<OverviewHeaderProps> = ({
  appName = 'أكاديمية دارين',
  slogan = 'تعليم متقن يصنع الفرق',
  logoIcon,
  notificationCount = 0,
  onNotificationClick,
  contextLabel = 'الفرع الرئيسي',
  contextOptions,
  selectedContextId,
  onSelectContext,
  className,
}) => {
  const [sheetOpen, setSheetOpen] = useState(false)

  const hasOptions = contextOptions && contextOptions.length > 0

  return (
    <header className={cn('space-y-2', className)} dir="rtl">
      {/* Top Bar: Brand + Notifications */}
      <div className="flex items-center justify-between gap-3">
        {/* Brand / Logo */}
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent text-on-accent shadow-elevation-1">
            {logoIcon || (
              <span className="text-xl" role="img" aria-label="شعار">
                🎓
              </span>
            )}
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-base font-black tracking-tight text-main">{appName}</h1>
            <p className="truncate text-[11px] font-medium text-muted">{slogan}</p>
          </div>
        </div>

        {/* Notifications button */}
        <button
          type="button"
          onClick={onNotificationClick}
          aria-label="التنبيهات"
          className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border bg-card text-main shadow-elevation-1 outline-none transition-all duration-normal hover:bg-hover focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.96]"
        >
          <Bell size={19} strokeWidth={2} />
          {notificationCount > 0 && (
            <span className="absolute -end-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-[9px] font-black leading-none text-on-error shadow-elevation-1">
              {notificationCount > 99 ? '99+' : notificationCount}
            </span>
          )}
        </button>
      </div>

      {/* Context dropdown chip (like "Cairo, Egypt ⌄") */}
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => hasOptions && setSheetOpen(true)}
          disabled={!hasOptions}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold outline-none transition-all duration-normal focus-visible:ring-2 focus-visible:ring-focus',
            hasOptions
              ? 'cursor-pointer text-main hover:bg-hover active:scale-[0.98]'
              : 'cursor-default text-muted',
          )}
        >
          <span className="text-sm">📍</span>
          <span className="truncate">{contextLabel}</span>
          {hasOptions && <ChevronDown size={14} className="text-muted" />}
        </button>
      </div>

      {/* Context Selection Bottom Sheet */}
      {hasOptions && (
        <BottomSheet isOpen={sheetOpen} onClose={() => setSheetOpen(false)} title="تغيير العرض">
          <div className="space-y-1.5 p-2">
            {contextOptions.map((opt) => {
              const isSelected = opt.id === selectedContextId
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    onSelectContext?.(opt.id)
                    setSheetOpen(false)
                  }}
                  className={cn(
                    'flex w-full items-center justify-between rounded-xl p-3 text-xs font-bold outline-none transition-all duration-normal focus-visible:ring-2 focus-visible:ring-focus',
                    isSelected
                      ? 'bg-primary text-on-primary shadow-elevation-1'
                      : 'bg-surface text-main hover:bg-hover',
                  )}
                >
                  <span>{opt.label}</span>
                  {isSelected && <Check size={16} strokeWidth={2.5} />}
                </button>
              )
            })}
          </div>
        </BottomSheet>
      )}
    </header>
  )
}
