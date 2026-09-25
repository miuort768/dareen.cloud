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
        className="group flex min-h-14 items-center gap-3 rounded-2xl border border-border bg-surface pe-2.5 ps-3 text-start shadow-soft transition-all duration-normal hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97]"
        aria-label="فتح صفحة الفواتير"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
          <Receipt size={18} />
        </span>
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block truncate text-xs font-black text-main">الفواتير</span>
          <span className="block truncate text-micro font-bold text-muted">فواتيرك ومدفوعاتك</span>
        </span>
        <span
          aria-hidden
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary transition-transform duration-normal group-hover:-translate-x-1"
        >
          <ArrowLeft size={16} />
        </span>
      </button>

      {whatsappHref ? (
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex min-h-14 items-center gap-3 rounded-2xl border border-border bg-surface pe-2.5 ps-3 text-start shadow-soft transition-all duration-normal hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97]"
          aria-label="تواصل مع الدعم عبر واتساب"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success-soft text-success-strong">
            <MessageCircle size={18} />
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block truncate text-xs font-black text-main">
              تواصل مع الدعم الفني
            </span>
            <span className="block truncate text-micro font-bold text-muted">متاح عبر واتساب</span>
          </span>
          <span
            aria-hidden
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-success-soft text-success-strong transition-transform duration-normal group-hover:-translate-x-1"
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
