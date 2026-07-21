import React from 'react';
import { cn } from '../../../lib/utils';

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  noPadding?: boolean;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, noPadding = false, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "bg-white/70 dark:bg-white/[0.07] backdrop-blur-xl",
        "border border-white/20 dark:border-white/10",
        "rounded-2xl shadow-lg shadow-black/[0.03]",
        !noPadding && "p-5",
        "overflow-hidden",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);

GlassCard.displayName = 'GlassCard';
