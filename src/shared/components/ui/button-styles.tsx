import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '../../../lib/utils'
import { FAB_SURFACE } from './button-tokens'

const FAB_SIZE = {
  sm: 'h-12 w-12 rounded-2xl',
  md: 'h-14 w-14 rounded-2xl',
  lg: 'h-16 w-16 rounded-2xl',
}

export interface FabProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Accessible name — used as aria-label and title */
  label: string
  size?: 'sm' | 'md' | 'lg'
}

export const Fab = forwardRef<HTMLButtonElement, FabProps>(function Fab(
  { label, size = 'md', className, type = 'button', children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      className={cn(FAB_SURFACE, FAB_SIZE[size], className)}
      {...rest}
    >
      {children}
    </button>
  )
})

Fab.displayName = 'Fab'
