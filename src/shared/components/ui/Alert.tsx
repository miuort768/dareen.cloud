import React from 'react'
import { cn } from '../../../lib/utils'

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'premium'
}

const variants = {
  success: 'bg-success-soft border-success text-success-dark shadow-sm ',
  warning: 'bg-warning-soft border-warning text-warning-dark shadow-sm ',
  error: 'bg-error-soft border-error text-error-dark shadow-sm ',
  info: 'bg-info-soft border-info text-info-dark shadow-sm ',
  neutral: 'bg-surface border-border text-muted',
  premium:
    'bg-gradient-to-br from-primary-soft to-primary-soft dark:from-primary-soft dark:to-primary-soft border-primary/20 text-primary-dark shadow-sm shadow-primary/10',
}

export const Alert: React.FC<AlertProps> = ({
  className,
  variant = 'info',
  children,
  ...props
}) => {
  return (
    <div
      role="alert"
      className={cn(
        'rounded-xl border p-4 text-sm font-medium leading-relaxed',
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

Alert.displayName = 'Alert'
