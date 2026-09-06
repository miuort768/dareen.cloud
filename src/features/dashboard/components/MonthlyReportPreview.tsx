import { Share2, FileDown, CheckCircle2, Star, Calendar, X, Award, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '../../../shared/components/ui'
import { useAcademyName } from '../../../context/AppContext'

interface MonthlyReportPreviewProps {
  isOpen: boolean
  onClose: () => void
  student: {
    id: string
    name: string
    grade: string
    subject: string
    points: number
    attendance: number // percentage
    sessionsCompleted: number
    lastNotes: string[]
  } | null
  onShare: (platform: string) => void
}

export const MonthlyReportPreview = ({
  isOpen,
  onClose,
  student,
  onShare,
}: MonthlyReportPreviewProps) => {
  const academyName = useAcademyName()

  if (!isOpen || !student) return null

  return (
    <div
      className="fixed inset-0 z-[110] flex items-end justify-center bg-background dark:bg-black/70 md:items-center md:p-4"
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-label={`تقرير ${student.name}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose()
      }}
    >
      <div className="relative flex max-h-[95vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border-2 border-border bg-card shadow-[16px_16px_0px_0px_black] dark:border-primary/20 dark:bg-card">
        <div className="custom-scrollbar relative z-10 flex-1 overflow-y-auto p-10 pb-6">
          {/* Brand / Logo */}
          <div className="mb-12 flex flex-col items-center justify-center gap-y-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-border bg-primary text-on-primary shadow-[6px_6px_0px_0px_black] dark:border-primary/20 dark:bg-primary dark:text-on-primary">
              <Award size={32} />
            </div>
            <div>
              <h3 className="text-xl font-medium uppercase italic tracking-tight text-main">
                تقرير التميز الأكاديمي
              </h3>
              <p className="mt-1 text-micro font-medium uppercase text-muted">
                منصة {academyName} التعليمية —{' '}
                {new Date().toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="space-y-8">
            {/* Student Signature Header */}
            <div className="flex items-center justify-between rounded-2xl border-2 border-border bg-background p-6 dark:border-primary/20 dark:bg-card">
              <div className="space-y-1 text-start">
                <p className="text-micro font-medium uppercase text-primary dark:text-primary">
                  نجمة أكاديمية
                </p>
                <h4 className="text-2xl font-medium uppercase tracking-tight text-main">
                  {student.name}
                </h4>
              </div>
              <div className="rounded-2xl border-2 border-border bg-card px-4 py-2 text-end dark:border-primary/20 dark:bg-card">
                <p className="mb-0.5 text-micro font-medium uppercase text-muted">
                  المستوى / المادة
                </p>
                <p className="text-xs font-medium uppercase text-primary dark:text-primary">
                  {student.grade} - {student.subject}
                </p>
              </div>
            </div>

            {/* Quantitative Metrics Grid */}
            <div className="grid grid-cols-3 gap-4">
              {[
                {
                  label: 'الحضور',
                  value: `${student.attendance}%`,
                  icon: ShieldCheck,
                  color: 'bg-success',
                  onColor: 'text-on-success',
                },
                {
                  label: 'إجمالي النقاط',
                  value: student.points,
                  icon: Star,
                  color: 'bg-warning',
                  onColor: 'text-on-warning',
                },
                {
                  label: 'الجلسات',
                  value: student.sessionsCompleted,
                  icon: Calendar,
                  color: 'bg-primary',
                  onColor: 'text-on-primary',
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border-2 border-border bg-card p-5 text-center shadow-md transition-transform hover:translate-y-[-2px] dark:border-primary/20 dark:bg-card"
                >
                  <div
                    className={cn(
                      'mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-border',
                      item.onColor,
                      item.color,
                    )}
                  >
                    <item.icon size={20} />
                  </div>
                  <p className="text-xl font-medium tabular-nums text-main">{item.value}</p>
                  <p className="mt-1 text-micro font-medium uppercase text-muted">{item.label}</p>
                </div>
              ))}
            </div>

            {/* Qualitative Feedback */}
            <div className="space-y-4 rounded-2xl border-2 border-border bg-background p-6 dark:border-primary/20 dark:bg-card">
              <p className="flex items-center gap-2 text-micro font-medium uppercase text-muted">
                <CheckCircle2 size={14} className="text-primary dark:text-primary" />
                التوصيات الأكاديمية ومسارات التطوير
              </p>
              <div className="space-y-3">
                {student.lastNotes.map((note, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 shrink-0 rounded-2xl border border-border bg-primary dark:bg-primary"></div>
                    <p className="text-sm font-normal italic leading-tight text-main">"{note}"</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Message */}
            <div className="rounded-2xl border-2 border-border bg-background p-6 text-center text-main shadow-[6px_6px_0px_0px_var(--bg-primary)] dark:border-primary/20 dark:bg-card dark:text-main">
              <p className="text-micro font-medium uppercase italic">
                نحن فخورون بتقدمك المستمر يا بطل! استمر في التألق.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-4 border-t-2 border-border bg-background p-10 pt-6 dark:border-primary/20 dark:bg-card">
          <Button
            onClick={() => onShare('whatsapp')}
            className="h-14 flex-1 rounded-2xl border-2 border-border bg-success text-on-success shadow-[4px_4px_0px_0px_black] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_black] active:translate-y-0 active:shadow-none"
          >
            <Share2 size={18} />
            إرسال لولي الأمر
          </Button>
          <Button
            onClick={() => window.print()}
            variant="outline"
            className="h-14 flex-1 rounded-2xl border-2 border-border shadow-[4px_4px_0px_0px_black] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_black] active:translate-y-0 active:shadow-none"
          >
            <FileDown size={18} />
            تحميل PDF
          </Button>
          <Button
            onClick={onClose}
            variant="ghost"
            className="h-14 w-14 rounded-2xl border-2 border-border shadow-[4px_4px_0px_0px_black] hover:bg-error hover:text-on-error"
            aria-label="إغلاق"
          >
            <X size={24} />
          </Button>
        </div>
      </div>
    </div>
  )
}
