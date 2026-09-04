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
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      <button
        onClick={() => navigate('/parent-payment-history')}
        className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3.5 text-start transition-all duration-200 hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.99]"
        aria-label="فتح سجل الدفعات"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-success-soft">
          <Wallet size={16} className="text-success" />
        </div>
        <span className="min-w-0 flex-1 text-xs font-black text-main">سجل الدفعات</span>
      </button>

      {whatsappHref ? (
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3.5 text-start transition-all duration-200 hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.99]"
          aria-label="تواصل مع الدعم عبر واتساب"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-info-soft">
            <LifeBuoy size={16} className="text-info" />
          </div>
          <span className="min-w-0 flex-1 text-xs font-black text-main">الدعم والاستفسار</span>
        </a>
      ) : (
        <div className="flex items-center gap-3 rounded-2xl border border-dashed border-border p-3.5 opacity-60">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-divider">
            <LifeBuoy size={16} className="text-muted" />
          </div>
          <span className="min-w-0 flex-1 text-xs font-black text-muted">الدعم غير متاح</span>
        </div>
      )}
    </div>
  )
}
