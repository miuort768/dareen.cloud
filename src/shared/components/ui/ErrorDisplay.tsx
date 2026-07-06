import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface ErrorDisplayProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  title = 'حدث خطأ',
  message = 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.',
  onRetry,
  className,
}) => (
  <div
    className={cn(
      'flex flex-col items-center justify-center text-center py-16 px-6 rounded-2xl',
      'bg-error/5 border border-error/20',
      className
    )}
    dir="rtl"
  >
    <div className="mb-5 p-4 rounded-2xl bg-error/10 text-error">
      <AlertCircle size={32} />
    </div>

    <h3 className="text-base font-bold text-main mb-2">{title}</h3>
    <p className="text-sm text-muted max-w-xs leading-relaxed font-medium mb-6">
      {message}
    </p>

    {onRetry && (
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary text-sm font-bold rounded-xl hover:bg-primary-hover active:bg-primary-active transition-all active:scale-95 shadow-sm"
      >
        <RefreshCw size={16} />
        إعادة المحاولة
      </button>
    )}
  </div>
);
