import { useNavigate } from 'react-router-dom'
import { Wallet, MessageCircle, ArrowLeft } from 'lucide-react'

interface SupportStripProps {
  adminPhone: string | undefined
}

export const SupportStrip = ({ adminPhone }: SupportStripProps) => {
  const navigate = useNavigate()
  const phone = (adminPhone || '').replace(/\D/g, '')
  const whatsappHref = phone ? `https://wa.me/${phone}` : null

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <button
        onClick={() => navigate('/parent-payment-history')}
        className="group flex min-h-14 items-center gap-3 rounded-full bg-primary pe-2.5 ps-3 text-start text-on-primary shadow-soft transition-all duration-normal hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-elevation-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97]"
        aria-label="فتح سجل الدفعات"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 text-on-primary">
          <Wallet size={18} />
        </span>
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block truncate text-xs font-black text-on-primary">سجل الدفعات</span>
          <span className="block truncate text-[10px] font-bold text-on-primary opacity-80">
            تتبّع مدفوعاتك
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
          className="group flex min-h-14 items-center gap-3 rounded-full bg-success pe-2.5 ps-3 text-start text-on-success shadow-soft transition-all duration-normal hover:-translate-y-0.5 hover:bg-success-hover hover:shadow-elevation-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97]"
          aria-label="تواصل مع الدعم عبر واتساب"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 text-on-success">
            <MessageCircle size={18} />
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block truncate text-xs font-black text-on-success">
              الدعم والاستفسار
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
