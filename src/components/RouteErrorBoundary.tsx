import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router-dom'
import { AlertTriangle, RotateCcw, Home } from 'lucide-react'

export const RouteErrorBoundary = () => {
  const error = useRouteError()
  const navigate = useNavigate()

  let title = 'عذراً، حدث خطأ غير متوقع'
  let message = 'حدثت مشكلة أثناء تحميل هذه الصفحة. يرجى المحاولة مرة أخرى.'

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      title = 'الصفحة غير موجودة'
      message = 'الصفحة التي تبحث عنها غير موجودة أو تم نقلها.'
    } else {
      title = `خطأ ${error.status}`
      message = error.statusText || 'حدث خطأ في الخادم.'
    }
  } else if (error instanceof Error) {
    message = error.message
  }

  return (
    <div className="flex min-h-full items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-lg rounded-card border border-error-soft bg-card p-8 text-center shadow-soft">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-card border border-error-soft bg-error-soft">
          <AlertTriangle size={28} className="text-error" />
        </div>
        <h1 className="mb-2 text-xl font-bold text-main">{title}</h1>
        <p className="mb-6 text-sm leading-relaxed text-muted">{message}</p>
        <div className="flex justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-5 py-2.5 text-sm font-bold text-main outline-none transition-all hover:bg-hover focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98]"
          >
            <RotateCcw size={14} /> العودة
          </button>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-on-primary outline-none transition-all hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98]"
          >
            <Home size={14} /> الصفحة الرئيسية
          </button>
        </div>
      </div>
    </div>
  )
}
