import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RotateCcw, Home } from 'lucide-react'

interface Props {
  children?: ReactNode
}
interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
    // Stale-bundle after a new deploy: old index.html references removed chunks.
    // Reload once to pick up the fresh build instead of showing a dead screen.
    const msg = error?.message || ''
    const isChunkError =
      msg.includes('Failed to fetch dynamically imported module') ||
      msg.includes('Importing a module script failed') ||
      msg.includes('error loading dynamically imported module') ||
      msg.includes('Loading CSS chunk')
    if (isChunkError) {
      const key = 'dareen_chunk_reload_at'
      const last = Number(sessionStorage.getItem(key) || 0)
      if (Date.now() - last > 10000) {
        sessionStorage.setItem(key, String(Date.now()))
        window.location.reload()
      }
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4" dir="rtl">
          <div className="w-full max-w-lg rounded-card border border-error-soft bg-card p-8 text-center shadow-soft">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-card border border-error-soft bg-error-soft">
              <AlertTriangle size={28} className="text-error" />
            </div>
            <h1 className="mb-2 text-xl font-bold text-main">عذراً، حدث خطأ غير متوقع</h1>
            <p className="mb-6 text-sm leading-relaxed text-muted">
              حدثت مشكلة أثناء تشغيل التطبيق. يرجى تحديث الصفحة أو المحاولة لاحقاً.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-5 py-2.5 text-sm font-bold text-main outline-none transition-all hover:bg-hover focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98]"
              >
                <RotateCcw size={14} /> إعادة المحاولة
              </button>
              <button
                onClick={() => {
                  window.location.href = '/'
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-on-primary outline-none transition-all hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98]"
              >
                <Home size={14} /> الصفحة الرئيسية
              </button>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
