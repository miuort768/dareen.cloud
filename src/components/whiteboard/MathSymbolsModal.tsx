import React from 'react'
import { X } from 'lucide-react'

interface MathSymbolsModalProps {
  isOpen: boolean
  onClose: () => void
  onInsertSymbol: (symbol: string) => void
}

const MATH_CATEGORIES = [
  {
    title: 'العمليات الأساسية',
    symbols: ['+', '−', '×', '÷', '=', '≠', '≈', '±', '∓', '<', '>', '≤', '≥'],
  },
  {
    title: 'الكسور والنسب والجذور',
    symbols: ['√', '∛', '∜', '½', '⅓', '¼', '¾', '%', '‰', 'π', '∞'],
  },
  {
    title: 'المجموعات والمنطق',
    symbols: ['∈', '∉', '⊂', '⊆', '∪', '∩', '∅', '∀', '∃', '∴', '∵', '⇒', '⇔'],
  },
  {
    title: 'الهندسة والزوايا',
    symbols: ['∠', '∡', '°', '⊥', '∥', '△', '□', '◯', '≅', '∼'],
  },
  {
    title: 'الحروف اليونانية الشائعة',
    symbols: ['α', 'β', 'γ', 'δ', 'θ', 'λ', 'μ', 'σ', 'ω', 'Δ', 'Σ', 'Ω'],
  },
  {
    title: 'صيغ ومعادلات جاهزة',
    symbols: [
      'f(x) = ',
      'x² + y² = r²',
      'E = mc²',
      'a² + b² = c²',
      'sin(θ)',
      'cos(θ)',
      'tan(θ)',
      'lim (x → 0)',
      '∑ (i=1 to n)',
    ],
  },
]

export const MathSymbolsModal: React.FC<MathSymbolsModalProps> = ({
  isOpen,
  onClose,
  onInsertSymbol,
}) => {
  if (!isOpen) return null

  return (
    <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="animate-scale-up w-full max-w-xl rounded-2xl border border-border bg-surface p-5 shadow-elevation-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="text-base font-black text-main">الرموز والمعادلات الرياضية</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-hover hover:text-main"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 max-h-[60vh] space-y-4 overflow-y-auto pe-1">
          {MATH_CATEGORIES.map((cat, i) => (
            <div key={i} className="space-y-1.5">
              <span className="text-xs font-bold text-muted">{cat.title}</span>
              <div className="flex flex-wrap gap-1.5">
                {cat.symbols.map((sym, sIdx) => (
                  <button
                    key={sIdx}
                    type="button"
                    onClick={() => {
                      onInsertSymbol(sym)
                      onClose()
                    }}
                    className="flex h-10 min-w-10 items-center justify-center rounded-xl border border-border bg-surface px-2.5 font-mono text-sm font-bold text-main transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
                  >
                    {sym}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-end border-t border-border pt-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-bold text-muted hover:bg-hover"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  )
}
