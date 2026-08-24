import { useEffect, useRef, useCallback } from 'react'
import { Receipt, X, Activity as ActivityIcon, Printer } from 'lucide-react'
import { SectionTitle, PrimaryBtn, SecondaryBtn } from './ClosingUI'
import { CURRENCY_SYMBOL } from '../../../config/constants'

interface TeacherSlip {
  name: string
  subject: string
  sessionsCount: number
  totalAmount: number
  sessionsList?: { date: string; studentName: string; teacherPrice?: number }[]
  price?: number
}

export const SalarySlipModal = ({
  teacher,
  month,
  onClose,
}: {
  teacher: TeacherSlip | null
  month: string
  onClose: () => void
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      }
    },
    [onClose],
  )

  useEffect(() => {
    if (!teacher) return
    const first = containerRef.current?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )
    first?.focus()
  }, [teacher])

  if (!teacher) return null

  return (
    <div
      ref={containerRef}
      className="bg-background/40 fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm"
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-label="قسيمة راتب"
      onKeyDown={handleKeyDown}
    >
      <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-card shadow-lg md:duration-200 md:animate-in md:zoom-in-95">
        <div className="flex items-center justify-between bg-gradient-to-l from-primary to-primary-hover p-5 text-on-primary">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
              <Receipt size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold">قسيمة راتب المعلمة</h2>
              <p className="text-on-primary/70 text-micro font-medium tracking-wider">
                سجل مالي معتمد • {month}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-error/20 flex h-8 w-8 items-center justify-center rounded-xl text-error transition-colors"
            aria-label="إغلاق"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[80vh] space-y-6 overflow-y-auto p-6">
          <div className="flex items-start justify-between border-b border-border pb-6">
            <div>
              <p className="mb-1 text-micro font-bold uppercase text-muted">المعلمة</p>
              <h3 className="text-lg font-bold text-main">{teacher.name}</h3>
              <span className="mt-1 inline-block rounded-lg bg-primary-soft px-2 py-0.5 text-micro font-bold text-primary">
                {teacher.subject}
              </span>
            </div>
            <div className="text-end">
              <p className="mb-1 text-micro font-bold uppercase text-muted">التاريخ</p>
              <p className="text-xs font-semibold text-main">
                {new Date().toLocaleDateString('ar-EG')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="mb-1 text-micro font-bold uppercase text-muted">إجمالي الحصص</p>
              <p className="font-mono text-2xl font-bold text-main">{teacher.sessionsCount}</p>
            </div>
            <div className="bg-primary-soft/30 rounded-xl border border-primary-soft p-4">
              <p className="mb-1 text-micro font-bold uppercase text-primary">صافي المستحق</p>
              <div className="flex items-baseline gap-1">
                <p className="font-mono text-2xl font-bold text-primary">
                  {teacher.totalAmount.toLocaleString()}
                </p>
                <span className="text-micro font-bold uppercase text-primary">
                  {CURRENCY_SYMBOL}
                </span>
              </div>
            </div>
          </div>

          <div>
            <SectionTitle icon={ActivityIcon} label="بيان الحصص التفصيلي" />
            <div className="overflow-hidden rounded-xl border border-border">
              <table className="w-full text-start text-xs">
                <thead className="bg-surface">
                  <tr>
                    <th className="p-2.5 font-bold text-muted">التاريخ</th>
                    <th className="p-2.5 font-bold text-muted">الطالب</th>
                    <th className="p-2.5 text-center font-bold text-muted">القيمة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {teacher.sessionsList
                    ?.slice(0, 10)
                    .map(
                      (
                        s: { date: string; studentName: string; teacherPrice?: number },
                        idx: number,
                      ) => (
                        <tr key={idx} className="hover:bg-hover/50 transition-colors">
                          <td className="p-2.5 font-mono text-muted">{s.date}</td>
                          <td className="p-2.5 font-bold text-main">{s.studentName}</td>
                          <td className="p-2.5 text-center font-mono font-bold text-success">
                            {s.teacherPrice || teacher.price} {CURRENCY_SYMBOL}
                          </td>
                        </tr>
                      ),
                    )}
                </tbody>
              </table>
            </div>
            {(teacher.sessionsList?.length ?? 0) > 10 && (
              <p className="mt-2 text-center text-micro italic text-muted">
                ... و {(teacher.sessionsList?.length ?? 0) - 10} حصص أخرى في السجل
              </p>
            )}
          </div>

          <div className="no-print flex gap-3 pt-2">
            <SecondaryBtn onClick={onClose} className="flex-1">
              إغلاق
            </SecondaryBtn>
            <PrimaryBtn onClick={() => window.print()} className="flex-[2] py-3">
              <Printer size={16} /> طباعة القسيمة الرسمية
            </PrimaryBtn>
          </div>
        </div>
      </div>
    </div>
  )
}
