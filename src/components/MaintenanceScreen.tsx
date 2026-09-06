import { useState, useEffect } from 'react'
import { useAdminPhone } from '../context/AppContext'
import { Wrench, Zap, Rocket, ShieldCheck, Clock, MessageCircle } from 'lucide-react'

const FEATURES = [
  { icon: Zap, label: 'تحسين الأداء' },
  { icon: Rocket, label: 'مزايا جديدة' },
  { icon: ShieldCheck, label: 'تحديثات أمنية' },
] as const

export const MaintenanceScreen = () => {
  const adminPhone = useAdminPhone()
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => (prev >= 96 ? 96 : prev + 1))
    }, 80)
    return () => clearInterval(timer)
  }, [])

  return (
    <div
      className="relative flex h-dvh w-full flex-col items-center overflow-hidden bg-background font-sans"
      dir="rtl"
    >
      {/* Decorative Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -end-32 -top-32 h-[520px] w-[520px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -start-40 top-1/3 h-[400px] w-[400px] rounded-full bg-primary/[0.03] blur-2xl" />
      </div>

      {/* Spacer — top */}
      <div className="h-10 md:h-36" />

      {/* Content */}
      <div className="relative z-10 flex w-full max-w-2xl flex-1 flex-col items-center justify-between px-5 pb-4 text-center">
        {/* Top Section */}
        <div className="flex flex-1 flex-col items-center justify-center">
          {/* Icon */}
          <div className="mb-4 animate-[fadeUp_0.6s_ease-out_both]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft shadow-elevation-1">
              <Wrench size={24} className="text-primary" />
            </div>
          </div>

          {/* Heading */}
          <div className="mb-5 animate-[fadeUp_0.8s_ease-out_0.1s_both]">
            <h1 className="mb-2 text-xl font-black leading-snug text-main md:mb-3 md:text-4xl">
              نحن بصدد إجراء
              <br />
              <span className="text-primary">تحديثات جذرية</span>
            </h1>
            <p className="mx-auto max-w-md text-xs leading-relaxed text-muted md:text-base">
              لضمان أفضل تجربة تعليمية لطلابنا ومعلمينا
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-5 w-full max-w-xs animate-[fadeUp_0.8s_ease-out_0.2s_both] md:mb-8">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[11px] font-bold text-muted">التقدم</span>
              <span className="text-[11px] font-bold tabular-nums text-primary">{progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surface">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-1.5 flex items-center justify-center gap-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              <p className="text-[11px] font-bold text-primary">جارٍ التحديث...</p>
            </div>
          </div>

          {/* Features — horizontal row on mobile */}
          <div className="mb-5 w-full max-w-sm animate-[fadeUp_0.8s_ease-out_0.3s_both] md:mb-8">
            <div className="rounded-xl border border-border bg-card p-3 shadow-elevation-1 md:rounded-2xl md:p-5">
              <div className="mb-2 flex items-center justify-center gap-2 md:mb-3 md:justify-start">
                <span className="h-2 w-2 animate-pulse rounded-full bg-warning" />
                <span className="text-xs font-bold text-main md:text-sm">العمل جاري الآن</span>
              </div>
              <div className="flex gap-2 md:grid md:grid-cols-3 md:gap-2.5">
                {FEATURES.map((f) => (
                  <div
                    key={f.label}
                    className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-surface px-2.5 py-2 transition-all hover:border-primary/20 dark:bg-surface md:flex-col md:items-center md:px-4 md:py-3"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft">
                      <f.icon size={14} className="text-primary" />
                    </div>
                    <p className="text-[11px] font-bold text-main md:mt-1 md:text-center md:text-xs">
                      {f.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="mb-2 animate-[fadeUp_0.8s_ease-out_0.4s_both]">
            {adminPhone ? (
              <a
                href={`https://wa.me/${adminPhone.replace(/\D/g, '').replace(/^0/, '20')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-xs font-bold text-on-primary shadow-lg shadow-primary/20 outline-none transition-all duration-200 hover:bg-primary-hover hover:shadow-xl hover:shadow-primary/25 focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97] md:px-8 md:py-3.5 md:text-sm"
              >
                <MessageCircle
                  size={16}
                  className="transition-transform duration-200 group-hover:scale-110 md:h-5 md:w-5"
                />
                تواصل مع الدعم
              </a>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-2xl bg-primary/10 px-6 py-3 text-xs font-bold text-primary md:px-8 md:py-3.5 md:text-sm">
                <Clock size={16} className="md:h-5 md:w-5" />
                سنكون متاحين قريبًا
              </span>
            )}
            <p className="mt-2 text-[10px] text-muted md:text-xs">
              فريق الدعم متاح لأي استفسار أو مساعدة
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="w-full animate-[fadeUp_0.8s_ease-out_0.5s_both] border-t border-border">
          <div className="mx-auto flex max-w-2xl flex-col items-center py-4 text-center md:py-6">
            <p className="mb-0.5 text-xs font-bold text-main md:mb-1 md:text-sm">
              شكرًا لصبركم وثقتكم
            </p>
            <p className="mb-1 text-[10px] text-muted md:mb-2 md:text-xs">
              معًا نصنع تجربة تعليمية أفضل
            </p>
            <p className="text-[10px] font-bold text-primary/60 md:text-xs">dareen.online</p>
          </div>
        </div>
      </div>
    </div>
  )
}
