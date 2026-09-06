import { CheckCircle2 } from 'lucide-react'

interface SuccessToastProps {
  showSuccess: boolean
  message: string
}

export const SuccessToast = ({ showSuccess, message }: SuccessToastProps) => {
  if (!showSuccess) return null

  return (
    <div className="fixed bottom-20 end-4 start-4 z-[2000] duration-slow animate-in fade-in slide-in-from-bottom-4 md:end-6 md:start-auto">
      <div className="shadow-l ms-auto flex max-w-md items-center gap-3 rounded-2xl border border-success-soft bg-card px-4 py-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success-soft">
          <CheckCircle2 size={16} className="text-success" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-bold leading-snug text-main">
            {message || 'تمت العملية بنجاح'}
          </p>
        </div>
        <div className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-success" />
      </div>
    </div>
  )
}
