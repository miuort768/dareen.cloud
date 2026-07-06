import React from 'react';
import { cn } from '../../../lib/utils';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
}

const variants = {
  success: 'bg-success-soft border-success text-success-dark',
  warning: 'bg-warning-soft border-warning text-warning-dark',
  error: 'bg-error-soft border-error text-error-dark',
  info: 'bg-info-soft border-info text-info-dark',
  neutral: 'bg-surface border-border text-muted',
};

export const Alert: React.FC<AlertProps> = ({ className, variant = 'info', children, ...props }) => {
  return (
    <div
      role="alert"
      className={cn('rounded-card border p-4 text-sm', variants[variant], className)}
      {...props}
    >
      {children}
    </div>
  );
};

Alert.displayName = 'Alert';
