import React from 'react';
import { cn } from '../../../lib/utils';

export interface Tab {
  label: string;
  value: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

export interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (value: string) => void;
  variant?: 'underline' | 'pills' | 'buttons';
  className?: string;
}

const variantStyles = {
  underline: {
    container: 'flex gap-0 border-b border-border',
    tab: (isActive: boolean) => cn(
      'px-4 py-2.5 text-sm font-semibold border-b-2 transition-all duration-200 -mb-px',
      'focus:outline-none focus:ring-2 focus:ring-focus focus:ring-inset',
      isActive
        ? 'text-primary border-primary'
        : 'text-muted border-transparent hover:text-main hover:border-strong'
    ),
  },
  pills: {
    container: 'flex gap-1.5 p-1',
    tab: (isActive: boolean) => cn(
      'px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-focus',
      isActive
        ? 'bg-primary text-on-primary shadow-sm'
        : 'text-muted hover:text-main hover:bg-hover'
    ),
  },
  buttons: {
    container: 'flex gap-2',
    tab: (isActive: boolean) => cn(
      'px-4 py-2 text-sm font-semibold rounded-card border transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-focus',
      isActive
        ? 'bg-card text-main border-primary shadow-sm'
        : 'bg-surface text-muted border-border hover:text-main hover:border-strong'
    ),
  },
};

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'underline',
  className,
}) => {
  const styles = variantStyles[variant];

  return (
    <div className={cn(styles.container, className)} role="tablist">
      {tabs.map((tab) => {
        const isActive = tab.value === activeTab;
        return (
          <button
            key={tab.value}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.value)}
            className={cn(
              styles.tab(isActive),
              'inline-flex items-center gap-2 whitespace-nowrap'
            )}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            {tab.label}
            {tab.badge !== undefined && (
              <span className={cn(
                'text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center',
                isActive
                  ? variant === 'pills' ? 'bg-on-primary/20 text-on-primary' : 'bg-primary text-on-primary'
                  : 'bg-surface text-muted'
              )}>
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

Tabs.displayName = 'Tabs';
