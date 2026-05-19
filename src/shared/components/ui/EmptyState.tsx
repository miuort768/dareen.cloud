import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: 'easeOut' }}
    className={cn(
      'flex flex-col items-center justify-center text-center py-16 px-6 rounded-2xl',
      'bg-white/60 dark:bg-slate-900/50 backdrop-blur-md',
      'border border-dashed border-slate-200 dark:border-slate-800',
      className
    )}
    dir="rtl"
  >
    {/* Floating icon bubble */}
    {icon && (
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        className="mb-5 p-5 rounded-2xl bg-gradient-to-br from-red-50 to-rose-100 dark:from-slate-800 dark:to-slate-900 text-red-500 dark:text-teal-400 shadow-[0_8px_30px_rgba(239,68,68,0.1)] dark:shadow-[0_8px_30px_rgba(20,184,166,0.1)]"
      >
        {icon}
      </motion.div>
    )}

    <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-2">
      {title}
    </h3>
    {description && (
      <p className="text-sm text-slate-400 dark:text-slate-500 max-w-xs leading-relaxed font-medium mb-6">
        {description}
      </p>
    )}
    {action && <div>{action}</div>}
  </motion.div>
);
