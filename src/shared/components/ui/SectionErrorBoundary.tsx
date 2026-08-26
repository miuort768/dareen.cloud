import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'
import { cn } from '../../../lib/utils'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  name?: string
  compact?: boolean
}

interface State {
  hasError: boolean
  error: Error | null
}

export class SectionErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(
      `[SectionErrorBoundary${this.props.name ? `:${this.props.name}` : ''}]`,
      error,
      info,
    )
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      if (this.props.compact) {
        return (
          <div
            className={cn(
              'flex items-center justify-center gap-3 rounded-2xl border border-error-soft',
              'bg-error-soft p-6 text-center',
            )}
            dir="rtl"
          >
            <div>
              <AlertTriangle size={20} className="mx-auto mb-2 text-error" />
              <p className="text-sm font-bold text-muted">حدث خطأ في هذا القسم</p>
              <button
                onClick={this.handleReset}
                className="mt-3 inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-error transition-colors hover:bg-error-soft hover:text-error"
              >
                <RotateCcw size={12} /> إعادة المحاولة
              </button>
            </div>
          </div>
        )
      }

      return (
        <div
          className={cn(
            'flex min-h-[300px] items-center justify-center rounded-3xl',
            'border border-error-soft bg-surface',
          )}
          dir="rtl"
        >
          <div className="max-w-xs text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-error-soft">
              <AlertTriangle size={24} className="text-error" />
            </div>
            <p className="mb-2 text-sm font-bold text-main">عذراً، حدث خطأ غير متوقع</p>
            <p className="mb-4 text-xs text-muted">تعذر تحميل هذا القسم. يرجى المحاولة مرة أخرى.</p>
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-on-primary transition-colors hover:bg-primary-hover active:scale-95"
            >
              <RotateCcw size={14} /> إعادة المحاولة
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
