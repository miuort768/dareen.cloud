import React from 'react'
import { cn } from '../../../lib/utils'
import { triggerHaptic } from '../../../lib/haptics'

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'error'
  size?: 'sm' | 'md'
  icon: React.ReactNode
  label: string
  active?: boolean
}

const variants = {
  default:
    'bg-card dark:bg-card border border-border dark:border-primary/20' +
    ' text-muted dark:text-muted' +
    ' hover:bg-hover hover:text-main dark:hover:bg-primary/10 dark:hover:text-primary',
  error:
    'bg-card dark:bg-card border border-border dark:border-primary/20' +
    ' text-muted dark:text-muted' +
    ' hover:bg-error-soft hover:text-error dark:hover:bg-error-soft dark:hover:text-error',
}

const sizes = {
  sm: 'w-9 h-9',
  md: 'w-10 h-10',
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    { className, variant = 'default', size = 'md', icon, label, active, onClick, ...props },
    ref,
  ) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      triggerHaptic('light')
      onClick?.(e)
    }

    return (
      <button
        ref={ref}
        onClick={handleClick}
        aria-label={label}
        className={cn(
          'inline-flex items-center justify-center rounded-lg',
          'transition-all duration-200',
          'active:scale-95',
          'focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:scale-100 disabled:opacity-40',
          '[&_svg]:pointer-events-none',
          variants[variant],
          sizes[size],
          active && 'bg-primary/10 text-primary dark:bg-primary/15 dark:text-primary',
          className,
        )}
        {...props}
      >
        {icon}
      </button>
    )
  },
)

IconButton.displayName = 'IconButton'
