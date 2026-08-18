import { useState, useEffect } from 'react'
import { useAdminPhone } from '../context/AppContext'

const FEATURES = [
  { icon: '⚡', label: 'تحسين الأداء' },
  { icon: '🚀', label: 'إضافة مزايا جديدة' },
  { icon: '🔒', label: 'تحديثات أمنية' },
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
      className="relative flex min-h-dvh w-full flex-col items-center justify-center overflow-x-hidden bg-background font-sans"
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

      {/* Content */}
      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center px-5 pb-12 pt-16 text-center">
        {/* 1. Heading */}
        <div className="mb-8 animate-[fadeUp_0.8s_ease-out_both]">
          <h2 className="mb-3 text-2xl font-black leading-snug text-main md:text-4xl">
            نحن بصدد إجراء
            <br />
            <span className="text-primary">تحديثات جذرية</span>
          </h2>
          <p className="mx-auto mb-2 max-w-md text-sm leading-relaxed text-muted md:text-base">
            لضمان أفضل تجربة تعليمية لطلابنا ومعلمينا.
          </p>
          <p className="text-sm font-bold text-main">
            سنكون متاحين خلال <span className="text-primary">وقت قصير جدًا</span>.
          </p>
        </div>

        {/* 2. Progress Bar */}
        <div className="mb-8 w-full max-w-xs animate-[fadeUp_0.8s_ease-out_0.15s_both]">
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
          <p className="mt-2 animate-pulse text-center text-xs font-bold text-primary">
            جارٍ التحديث...
          </p>
        </div>

        {/* 3. Status Card */}
        <div className="mb-8 w-full max-w-md animate-[fadeUp_0.8s_ease-out_0.3s_both]">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-elevation-1 md:p-8">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft">
                <svg
                  className="h-5 w-5 text-primary"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-warning" />
                  <span className="text-sm font-bold text-main">العمل جاري الآن</span>
                </div>
                <p className="mt-0.5 text-xs text-muted">نقوم بتطوير المنصة وتحسين الأداء</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {FEATURES.map((f) => (
                <div
                  key={f.label}
                  className="flex items-center gap-1.5 rounded-xl bg-surface px-3 py-1.5 text-xs font-bold text-main"
                >
                  <span>{f.icon}</span>
                  <span>{f.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4. CTA Button */}
        <div className="mb-4 animate-[fadeUp_0.8s_ease-out_0.45s_both]">
          {adminPhone ? (
            <a
              href={`https://wa.me/${adminPhone.replace(/\D/g, '').replace(/^0/, '20')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2.5 rounded-2xl bg-primary px-8 py-3.5 text-sm font-bold text-on-primary shadow-lg shadow-primary/20 transition-all duration-200 hover:bg-primary-hover hover:shadow-xl hover:shadow-primary/25 active:scale-[0.97]"
            >
              <svg
                className="h-5 w-5 transition-transform duration-200 group-hover:scale-110"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
              </svg>
              تواصل مع الدعم
            </a>
          ) : (
            <span className="inline-flex items-center gap-2.5 rounded-2xl bg-primary/10 px-8 py-3.5 text-sm font-bold text-primary">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              سنكون متاحين قريبًا
            </span>
          )}
          <p className="mt-3 text-xs text-muted">فريق الدعم متاح لأي استفسار أو مساعدة</p>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-surface/50 relative z-10 mt-auto w-full animate-[fadeUp_0.8s_ease-out_0.6s_both] border-t border-border">
        <div className="mx-auto flex max-w-2xl flex-col items-center px-5 py-8 text-center">
          <p className="mb-1 text-sm font-bold text-main">شكرًا لصبركم وثقتكم</p>
          <p className="mb-3 text-xs text-muted">معًا نصنع تجربة تعليمية أفضل.</p>
          <p className="text-xs font-bold text-primary/60">dareen.online</p>
        </div>
      </div>
    </div>
  )
}
