import React from 'react';
import { cn } from '../../../lib/utils';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'premium';
}

const variants = {
  success: 'bg-success-soft border-success/50 text-success-dark shadow-sm shadow-success/5',
  warning: 'bg-warning-soft border-warning/50 text-warning-dark shadow-sm shadow-warning/5',
  error: 'bg-error-soft border-error/50 text-error-dark shadow-sm shadow-error/5',
  info: 'bg-info-soft border-info/50 text-info-dark shadow-sm shadow-info/5',
  neutral: 'bg-surface border-border/50 text-muted',
  premium: 'bg-gradient-to-br from-primary-soft to-indigo-50 dark:from-primary-soft/20 dark:to-indigo-950/20 border-primary/20 text-primary-dark shadow-sm shadow-primary/10',
};

export const Alert: React.FC<AlertProps> = ({ className, variant = 'info', children, ...props }) => {
  return (
    <div
      role="alert"
      className={cn('rounded-xl border p-4 text-sm font-medium leading-relaxed', variants[variant], className)}
      {...props}
    >
      {children}
    </div>
  );
};

Alert.displayName = 'Alert';
