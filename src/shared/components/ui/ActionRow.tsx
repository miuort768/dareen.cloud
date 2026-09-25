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
  success: 'bg-transparent text-success hover:bg-success-soft border-transparent',
  error: 'bg-transparent text-error hover:bg-error-soft border-transparent',
  info: 'bg-transparent text-info hover:bg-info-soft border-transparent',
  warning: 'bg-transparent text-warning hover:bg-warning-soft border-transparent',
  primary: 'bg-transparent text-primary hover:bg-primary-soft border-transparent',
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
          'h-10 w-10 rounded-xl md:h-8 md:w-8',
          'text-[10px] font-bold',
          'transition-all duration-normal ease-out active:duration-fast',
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
