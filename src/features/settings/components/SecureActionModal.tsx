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
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4 animate-in fade-in"
      onClick={() => {
        setSecureAction(null)
        setSecureInput('')
      }}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-error bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        <div className="flex flex-col items-center space-y-3 text-center">
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
              className="flex-1 rounded-xl bg-error py-2.5 text-xs font-bold text-on-error transition-all hover:bg-error-hover active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
            >
              تنفيذ نهائي
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
