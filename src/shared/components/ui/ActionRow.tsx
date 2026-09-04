import React from 'react'
import { cn } from '../../../lib/utils'
import { triggerHaptic } from '../../../lib/haptics'

export interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ComponentType<{ size?: number }> | React.ReactNode
  label: string
  color?: 'success' | 'error' | 'info' | 'warning' | 'primary'
  tooltip?: string
}

const colorMap = {
  success:
    'bg-success-soft text-success hover:bg-success border-success-soft dark:bg-success-soft dark:text-success dark:border-success-soft',
  error:
    'bg-error-soft text-error hover:bg-error border-error-soft dark:bg-error-soft dark:text-error dark:border-error-soft',
  info: 'bg-info-soft text-info hover:bg-info border-info-soft dark:bg-info-soft dark:text-info dark:border-info-soft',
  warning:
    'bg-warning-soft text-warning hover:bg-warning border-warning-soft dark:bg-warning-soft dark:text-warning dark:border-warning-soft',
  primary:
    'bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 dark:bg-primary/15 dark:text-primary dark:border-primary/15',
}

export const ActionButton = React.forwardRef<HTMLButtonElement, ActionButtonProps>(
  ({ className, icon, label, color = 'success', tooltip, onClick, ...props }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      triggerHaptic('light')
      onClick?.(e)
    }

    const isComponent =
      typeof icon === 'function' ||
      (typeof icon === 'object' &&
        icon !== null &&
        '$$typeof' in icon &&
        !React.isValidElement(icon))

    return (
      <button
        ref={ref}
        onClick={handleClick}
        title={tooltip || label}
        aria-label={tooltip || label}
        className={cn(
          'inline-flex items-center justify-center',
          'h-10 w-10 rounded-xl border md:h-8 md:w-8',
          'text-[10px] font-bold',
          'transition-all duration-200',
          'active:scale-95',
          'focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-40',
          colorMap[color],
          className,
        )}
        {...props}
      >
        {isComponent
          ? React.createElement(icon as React.ComponentType<{ size?: number }>, { size: 16 })
          : icon}
      </button>
    )
  },
)

ActionButton.displayName = 'ActionButton'

export interface ActionRowProps {
  children: React.ReactNode
  className?: string
}

export const ActionRow = ({ children, className }: ActionRowProps) => (
  <div className={cn('flex items-center justify-end gap-1.5', className)}>{children}</div>
)
