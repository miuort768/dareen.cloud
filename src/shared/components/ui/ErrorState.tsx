import type { LucideIcon } from 'lucide-react'
import { AlertTriangle } from 'lucide-react'
import { cn } from '../../../lib/utils'
import { Button } from './Button'

interface ErrorStateProps {
  icon?: LucideIcon
  title?: string
  message?: string
  onRetry?: () => void
  retryLabel?: string
  className?: string
  compact?: boolean
}

export const ErrorState = ({
  icon: Icon = AlertTriangle,
  title = 'حدث خطأ',
  message = 'عذراً، حدث خطأ في تحميل البيانات. يرجى المحاولة مرة أخرى.',
  onRetry,
  retryLabel = 'إعادة المحاولة',
  className,
  compact = false,
}: ErrorStateProps) => (
  <div
    className={cn(
      'flex flex-col items-center justify-center text-center',
      compact ? 'py-8' : 'py-12 md:py-16',
      className,
    )}
  >
    <div
      className={cn(
        'mb-3 flex items-center justify-center rounded-card border border-error-soft bg-error-soft',
        compact ? 'h-10 w-10' : 'h-12 w-12 md:h-14 md:w-14',
      )}
    >
      <Icon size={compact ? 18 : 22} className="text-error" />
    </div>
    <p className="text-sm font-semibold text-main md:text-base">{title}</p>
    <p className="mt-1 max-w-xs text-sm text-muted">{message}</p>
    {onRetry && (
      <Button variant="outline" size="sm" onClick={onRetry} className="mt-4">
        {retryLabel}
      </Button>
    )}
  </div>
)

interface ErrorBannerProps {
  message?: string
  className?: string
}

export const ErrorBanner = ({
  message = 'عذراً، حدث خطأ في تحميل البيانات. يرجى المحاولة مرة أخرى.',
  className,
}: ErrorBannerProps) => (
  <div
    className={cn(
      'rounded-card border border-error-soft bg-error-soft px-4 py-3 text-sm font-medium text-error',
      className,
    )}
  >
    {message}
  </div>
)
