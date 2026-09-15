import { useNavigate } from 'react-router-dom'
import { Wallet, LifeBuoy } from 'lucide-react'

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
        className="flex min-h-11 items-center gap-3 rounded-full bg-primary px-5 py-3.5 text-start text-on-primary shadow-elevation-1 shadow-black/20 transition-all duration-normal hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97]"
        aria-label="فتح سجل الدفعات"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20 text-on-primary">
          <Wallet size={16} />
        </span>
        <span className="min-w-0 flex-1 text-xs font-black text-on-primary">سجل الدفعات</span>
      </button>

      {whatsappHref ? (
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-11 items-center gap-3 rounded-full bg-success px-5 py-3.5 text-start text-on-success shadow-elevation-1 shadow-black/20 transition-all duration-normal hover:bg-success-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97]"
          aria-label="تواصل مع الدعم عبر واتساب"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20 text-on-success">
            <LifeBuoy size={16} />
          </span>
          <span className="min-w-0 flex-1 text-xs font-black text-on-success">
            الدعم والاستفسار
          </span>
        </a>
      ) : (
        <div className="flex min-h-11 items-center gap-3 rounded-2xl border border-dashed border-border p-3.5 opacity-60">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-divider">
            <LifeBuoy size={16} className="text-muted" />
          </div>
          <span className="min-w-0 flex-1 text-xs font-black text-muted">الدعم غير متاح</span>
        </div>
      )}
    </div>
  )
}
