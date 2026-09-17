import { useNavigate } from 'react-router-dom'
import { Receipt, MessageCircle, ArrowLeft } from 'lucide-react'
import { useAdminPhone } from '../../context/AppContext'

export const StudentSupportStrip = () => {
  const navigate = useNavigate()
  const adminPhone = useAdminPhone()
  const phone = (adminPhone || '').replace(/\D/g, '')
  const whatsappHref = phone ? `https://wa.me/${phone}` : null

  return (
    <div className="grid grid-cols-1 gap-3">
      <button
        onClick={() => navigate('/student-invoices')}
        className="group flex min-h-14 items-center gap-3 rounded-full bg-primary pe-2.5 ps-3 text-start text-on-primary shadow-elevation-1 shadow-black/20 transition-all duration-normal hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97]"
        aria-label="فتح صفحة الفواتير"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 text-on-primary">
          <Receipt size={18} />
        </span>
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block truncate text-xs font-black text-on-primary">الفواتير</span>
          <span className="block truncate text-micro font-bold text-on-primary opacity-80">
            فواتيرك ومدفوعاتك
          </span>
        </span>
        <span
          aria-hidden
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-on-primary transition-transform duration-normal group-hover:-translate-x-1"
        >
          <ArrowLeft size={16} />
        </span>
      </button>

      {whatsappHref ? (
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex min-h-14 items-center gap-3 rounded-full bg-success pe-2.5 ps-3 text-start text-on-success shadow-elevation-1 shadow-black/20 transition-all duration-normal hover:bg-success-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97]"
          aria-label="تواصل مع الدعم عبر واتساب"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 text-on-success">
            <MessageCircle size={18} />
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block truncate text-xs font-black text-on-success">
              تواصل مع الدعم الفني
            </span>
            <span className="block truncate text-micro font-bold text-on-success opacity-80">
              متاح عبر واتساب
            </span>
          </span>
          <span
            aria-hidden
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-on-success transition-transform duration-normal group-hover:-translate-x-1"
          >
            <ArrowLeft size={16} />
          </span>
        </a>
      ) : (
        <div className="flex min-h-14 items-center gap-3 rounded-full border border-dashed border-border px-4 opacity-70">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-divider">
            <MessageCircle size={18} className="text-muted" />
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <span className="block truncate text-xs font-black text-muted">الدعم غير متاح</span>
            <span className="block truncate text-micro font-bold text-muted">لم تتم إضافة رقم</span>
          </div>
        </div>
      )}
    </div>
  )
}
