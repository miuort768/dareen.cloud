import { useState, useEffect } from 'react'
import { useAdminPhone } from '../context/AppContext'
import { Wrench, Zap, Rocket, ShieldCheck, Clock, MessageCircle } from 'lucide-react'

const FEATURES = [
  { icon: Zap, label: 'تحسين الأداء', desc: 'تحسين السرعة والاستجابة' },
  { icon: Rocket, label: 'مزايا جديدة', desc: 'إضافة أدوات تعليمية متقدمة' },
  { icon: ShieldCheck, label: 'تحديثات أمنية', desc: 'حماية بيانات طلابنا' },
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
      className="relative flex min-h-dvh w-full flex-col items-center overflow-x-hidden bg-background font-sans"
      dir="rtl"
    >
      {/* Decorative Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -end-32 -top-32 h-[520px] w-[520px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -start-40 top-1/3 h-[400px] w-[400px] rounded-full bg-primary/[0.03] blur-2xl" />
        <div className="absolute bottom-0 end-1/4 h-[300px] w-[300px] rounded-full bg-primary/[0.04] blur-3xl" />
        <svg
          className="absolute bottom-0 start-0 h-48 w-full text-primary/[0.04]"
          viewBox="0 0 1440 200"
          fill="none"
          preserveAspectRatio="none"
        >
          <path
            d="M0 120C360 60 720 180 1080 100C1260 60 1380 90 1440 120V200H0V120Z"
            fill="currentColor"
          />
        </svg>
      </div>

      {/* Spacer — top breathing room */}
      <div className="h-24 md:h-36" />

      {/* Content */}
      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center px-5 text-center">
        {/* Icon */}
        <div className="mb-6 animate-[fadeUp_0.6s_ease-out_both]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-soft shadow-elevation-1">
            <Wrench size={28} className="text-primary" />
          </div>
        </div>

        {/* Heading */}
        <div className="mb-8 animate-[fadeUp_0.8s_ease-out_0.1s_both]">
          <h1 className="mb-3 text-2xl font-black leading-snug text-main md:text-4xl">
            نحن بصدد إجراء
            <br />
            <span className="text-primary">تحديثات جذرية</span>
          </h1>
          <p className="mx-auto max-w-md text-sm leading-relaxed text-muted md:text-base">
            لضمان أفضل تجربة تعليمية لطلابنا ومعلمينا
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-10 w-full max-w-xs animate-[fadeUp_0.8s_ease-out_0.2s_both]">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold text-muted">التقدم</span>
            <span className="text-xs font-bold tabular-nums text-primary">{progress}%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-surface">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-center gap-1.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            <p className="text-xs font-bold text-primary">جارٍ التحديث...</p>
          </div>
        </div>

        {/* Features Cards */}
        <div className="mb-10 w-full max-w-md animate-[fadeUp_0.8s_ease-out_0.3s_both]">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-elevation-1 md:p-6">
            <div className="mb-4 flex items-center gap-2.5">
              <span className="h-2 w-2 animate-pulse rounded-full bg-warning" />
              <span className="text-sm font-bold text-main">العمل جاري الآن</span>
            </div>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              {FEATURES.map((f) => (
                <div
                  key={f.label}
                  className="dark:bg-surface/80 flex flex-col items-center gap-2 rounded-xl border border-border bg-surface p-4 transition-all hover:border-primary/20"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft">
                    <f.icon size={16} className="text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-main">{f.label}</p>
                    <p className="mt-0.5 text-[10px] text-muted">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="mb-4 animate-[fadeUp_0.8s_ease-out_0.4s_both]">
          {adminPhone ? (
            <a
              href={`https://wa.me/${adminPhone.replace(/\D/g, '').replace(/^0/, '20')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2.5 rounded-2xl bg-primary px-8 py-3.5 text-sm font-bold text-on-primary shadow-lg shadow-primary/20 transition-all duration-200 hover:bg-primary-hover hover:shadow-xl hover:shadow-primary/25 active:scale-[0.97]"
            >
              <MessageCircle
                size={18}
                className="transition-transform duration-200 group-hover:scale-110"
              />
              تواصل مع الدعم
            </a>
          ) : (
            <span className="inline-flex items-center gap-2.5 rounded-2xl bg-primary/10 px-8 py-3.5 text-sm font-bold text-primary">
              <Clock size={18} />
              سنكون متاحين قريبًا
            </span>
          )}
          <p className="mt-3 text-xs text-muted">فريق الدعم متاح لأي استفسار أو مساعدة</p>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-surface/50 relative z-10 mt-auto w-full animate-[fadeUp_0.8s_ease-out_0.5s_both] border-t border-border">
        <div className="mx-auto flex max-w-2xl flex-col items-center px-5 py-8 text-center">
          <p className="mb-1 text-sm font-bold text-main">شكرًا لصبركم وثقتكم</p>
          <p className="mb-3 text-xs text-muted">معًا نصنع تجربة تعليمية أفضل</p>
          <p className="text-xs font-bold text-primary/60">dareen.online</p>
        </div>
      </div>
    </div>
  )
}
