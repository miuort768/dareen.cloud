import React from 'react'
import { cn } from '../../../lib/utils'

export interface Tab {
  label: string
  value: string
  icon?: React.ReactNode
  badge?: string | number
}

export interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onChange: (value: string) => void
  variant?: 'underline' | 'pills' | 'buttons'
  /** Scrollable horizontal strip on mobile (recommended when tabs overflow) */
  scrollable?: boolean
  className?: string
}

const variantStyles = {
  underline: {
    container: 'flex gap-0 border-b border-border',
    tab: (isActive: boolean) =>
      cn(
        'px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors duration-normal -mb-px',
        'outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-inset',
        isActive
          ? 'text-primary border-primary'
          : 'text-muted border-transparent hover:text-main hover:border-strong',
      ),
  },
  pills: {
    container: 'flex gap-1.5 p-1',
    tab: (isActive: boolean) =>
      cn(
        'px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-normal',
        'outline-none focus-visible:ring-2 focus-visible:ring-focus',
        isActive
          ? 'bg-primary text-on-primary shadow-elevation-1'
          : 'text-muted hover:text-main hover:bg-hover',
      ),
  },
  buttons: {
    container: 'flex gap-2',
    tab: (isActive: boolean) =>
      cn(
        'px-4 py-2 text-sm font-semibold rounded-card border transition-colors duration-normal',
        'outline-none focus-visible:ring-2 focus-visible:ring-focus',
        isActive
          ? 'bg-card text-main border-primary shadow-elevation-1'
          : 'bg-surface text-muted border-border hover:text-main hover:border-strong',
      ),
  },
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'underline',
  scrollable = false,
  className,
}) => {
  const styles = variantStyles[variant]

  const tabList = tabs.map((tab) => {
    const isActive = tab.value === activeTab
    return (
      <button
        key={tab.value}
        role="tab"
        aria-selected={isActive}
        onClick={() => onChange(tab.value)}
        className={cn(
          styles.tab(isActive),
          'inline-flex items-center gap-2 whitespace-nowrap',
          scrollable && 'min-h-11 shrink-0',
        )}
      >
        {tab.icon && <span className="shrink-0">{tab.icon}</span>}
        {tab.label}
        {tab.badge !== undefined && (
          <span
            className={cn(
              'min-w-[18px] rounded-full px-1.5 py-0.5 text-center text-micro font-bold',
              isActive
                ? variant === 'pills'
                  ? 'bg-white/20 text-on-primary'
                  : 'bg-primary text-on-primary'
                : 'bg-surface text-muted',
            )}
          >
            {tab.badge}
          </span>
        )}
      </button>
    )
  })

  if (scrollable) {
    return (
      <div
        className={cn(
          'no-scrollbar -mx-1 flex overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          className,
        )}
        role="tablist"
      >
        {tabList}
      </div>
    )
  }

  return (
    <div className={cn(styles.container, className)} role="tablist">
      {tabList}
    </div>
  )
}

Tabs.displayName = 'Tabs'
