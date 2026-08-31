import { MessageSquare } from 'lucide-react'

interface SupportBannerProps {
  adminPhone: string | undefined
}

export const SupportBanner = ({ adminPhone }: SupportBannerProps) => {
  const digits = (adminPhone?.replace(/\D/g, '') || '').replace(/^0/, '20')
  const hasPhone = digits.length >= 10

  return (
    <div className="rounded-3xl border border-border bg-surface p-4 shadow-sm transition-colors duration-300 dark:border-primary/20 dark:bg-card sm:p-5">
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="text-center sm:text-start">
          <h4 className="mb-0.5 text-sm font-bold text-main dark:text-main">هل تحتاج لمساعدة؟</h4>
          <p className="text-[11px] font-medium text-muted dark:text-muted">
            فريق الدعم متاح دائماً لخدمة ولي الأمر
          </p>
        </div>
        {hasPhone ? (
          <a
            href={`https://wa.me/${digits}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-primary px-5 py-3 text-[11px] font-bold text-on-primary transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-95 dark:bg-primary dark:text-on-primary sm:w-auto"
          >
            <MessageSquare size={14} />
            تواصل معنا
          </a>
        ) : (
          <span
            className="flex w-full cursor-not-allowed items-center justify-center gap-2.5 rounded-xl border border-border bg-hover px-5 py-3 text-[11px] font-bold text-muted sm:w-auto"
            title="رقم الدعم غير متوفر حالياً"
          >
            <MessageSquare size={14} />
            الدعم عبر الإدارة
          </span>
        )}
      </div>
    </div>
  )
}
