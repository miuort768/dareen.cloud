import { AlertCircle } from 'lucide-react'
import { InputField, SecondaryBtn } from './SettingsUI'

interface SecureActionModalProps {
  secureAction: {
    type: 'reset' | 'archive'
    title: string
    description: string
    confirmWord: string
    actionFn: () => void
  } | null
  secureInput: string
  setSecureInput: (v: string) => void
  setSecureAction: (v: SecureActionModalProps['secureAction']) => void
}

export const SecureActionModal = ({
  secureAction,
  secureInput,
  setSecureInput,
  setSecureAction,
}: SecureActionModalProps) => {
  if (!secureAction) return null

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/50 animate-in fade-in md:items-center md:p-4"
      onClick={() => {
        setSecureAction(null)
        setSecureInput('')
      }}
    >
      <div
        className="max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl border-x-0 border-t border-error bg-card p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-xl md:max-h-none md:max-w-md md:overflow-hidden md:rounded-2xl md:border md:p-6"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        <div className="flex flex-col items-center gap-y-3 text-center">
          <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-2xl bg-error-soft text-error">
            <AlertCircle size={24} />
          </div>
          <h3 className="text-base font-bold text-main">{secureAction.title}</h3>
          <p className="text-xs leading-relaxed text-muted">{secureAction.description}</p>

          <div className="mt-2 w-full space-y-3 rounded-xl border border-border bg-surface p-4 text-start">
            <p className="text-xs font-bold text-muted">اكتب للتأكيد:</p>
            <div
              className="select-all rounded-lg border border-error bg-error-soft py-1.5 text-center text-xs font-black text-error"
              dir="ltr"
            >
              {secureAction.confirmWord}
            </div>
            <InputField
              value={secureInput}
              onChange={(e) => setSecureInput(e.target.value)}
              placeholder="اكتب العبارة للتحقق..."
              className="text-center"
              autoFocus
            />
          </div>

          <div className="flex w-full gap-2 pt-2">
            <SecondaryBtn
              onClick={() => {
                setSecureAction(null)
                setSecureInput('')
              }}
              className="flex-1"
            >
              تراجع
            </SecondaryBtn>
            <button
              disabled={secureInput !== secureAction.confirmWord}
              onClick={() => {
                secureAction.actionFn()
                setSecureAction(null)
                setSecureInput('')
              }}
              className="flex-1 rounded-xl bg-error py-2.5 text-xs font-bold text-on-error outline-none transition-all hover:bg-error-hover focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
            >
              تنفيذ نهائي
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
