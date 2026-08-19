import { QRCodeSVG } from 'qrcode.react'
import { GraduationCap, Phone, User, ShieldCheck, X, Printer } from 'lucide-react'
import { useAcademyName } from '../../../context/AppContext'
import type { Student } from '../types'

interface StudentCardProps {
  student: Student
  onClose: () => void
}

export const StudentCard = ({ student, onClose }: StudentCardProps) => {
  const academyName = useAcademyName()
  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm duration-300 animate-in fade-in">
      <div className="group relative w-full max-w-md overflow-hidden border-4 border-border bg-card shadow-elevation-3">
        {/* Header Actions - Hidden on Print */}
        <div className="flex items-center justify-between border-b-2 border-border p-4 print:hidden">
          <h3 className="text-xs font-medium uppercase italic tracking-label text-muted">
            Student ID Card
          </h3>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="border-2 border-success bg-success-soft p-2 text-success transition-colors hover:bg-success hover:text-on-success"
              aria-label="طباعة"
            >
              <Printer size={18} />
            </button>
            <button
              onClick={onClose}
              className="border-2 border-error bg-error-soft p-2 text-error transition-colors hover:bg-error hover:text-on-error"
              aria-label="إغلاق"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* THE CARD CONTENT */}
        <div className="relative p-4 md:p-8 print:p-0">
          {/* Background Pattern */}
          <div className="pointer-events-none absolute start-0 top-0 -ms-16 -mt-16 h-48 w-48 rotate-45 rounded-2xl border-s-8 border-t-8 border-border bg-surface"></div>

          {/* Academy Name Tag */}
          <div className="relative z-10 mb-10 flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-primary">
                <ShieldCheck size={20} className="fill-current/10" />
                <span className="text-xs font-medium uppercase tracking-widest">
                  {academyName || 'دارين السابعة'}
                </span>
              </div>
              <h2 className="text-xl font-medium leading-none text-main">بطاقة تعريف طالب</h2>
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-xl border-4 border-white/20 bg-primary shadow-sm">
              <GraduationCap size={32} className="text-inverse" />
            </div>
          </div>

          {/* Main Info Section */}
          <div className="relative z-10 flex flex-col gap-4 md:flex-row md:gap-8">
            {/* Student Photo Placeholder / Icon */}
            <div className="relative flex h-40 w-32 items-center justify-center rounded-xl border-4 border-border bg-surface shadow-inner">
              <User size={64} className="text-muted" />
              <div className="absolute bottom-0 end-0 h-1 w-full bg-primary"></div>
            </div>

            {/* Details */}
            <div className="flex-1 space-y-4 text-start" dir="rtl">
              <div className="space-y-1">
                <label className="block text-micro font-medium uppercase tracking-widest text-muted">
                  الاسم الكامل
                </label>
                <p className="text-lg font-medium tracking-tighter text-main">{student.name}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-micro font-medium uppercase tracking-widest text-muted">
                    الصف الدراسي
                  </label>
                  <p className="text-sm font-normal text-muted">{student.grade}</p>
                </div>
                <div className="space-y-1">
                  <label className="block text-micro font-medium uppercase tracking-widest text-muted">
                    كود الطالب
                  </label>
                  <p className="text-sm font-normal text-muted">
                    #{student.id.slice(0, 6).toUpperCase()}
                  </p>
                </div>
              </div>

              <div className="space-y-1 border-t border-border pt-2">
                <div className="flex items-center justify-end gap-2 text-success">
                  <span className="text-xs font-normal tabular-nums">{student.parentPhone}</span>
                  <Phone size={14} />
                </div>
              </div>
            </div>
          </div>

          {/* Footer / QR Code */}
          <div className="relative z-10 mt-10 flex items-center justify-between border-t-2 border-dashed border-border pt-6">
            <div className="space-y-1 text-start" dir="rtl">
              <p className="text-micro font-medium uppercase text-muted">
                نظام إدارة دارين السابعة
              </p>
              <p className="text-micro font-normal text-muted">
                يُرجى إبراز هذه البطاقة عند طلبها داخل المعهد
              </p>
            </div>
            <div className="rounded-xl border-2 border-border bg-card p-2">
              <QRCodeSVG
                value={`dareen-student://${student.id}`}
                size={48}
                level="M"
                includeMargin={false}
              />
            </div>
          </div>

          {/* Vertical Text Rind */}
          <div className="pointer-events-none absolute bottom-10 end-0 flex h-32 w-8 -rotate-90 items-center gap-2 opacity-20">
            <span className="whitespace-nowrap text-micro font-medium uppercase tracking-label text-muted">
              STU-ID-{student.id.slice(0, 4)}
            </span>
          </div>
        </div>

        {/* Print Footer Background */}
        <div className="h-2 w-full bg-primary"></div>
      </div>
    </div>
  )
}
