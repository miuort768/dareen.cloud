import { useState, useEffect } from 'react'
import { useAdminPhone } from '../context/AppContext'
import { Image } from '../shared/components/ui'

const FEATURES = [
  { icon: '⚡', label: 'تحسين الأداء' },
  { icon: '🚀', label: 'إضافة مزايا جديدة' },
  { icon: '🔒', label: 'تحديثات أمنية' },
] as const

const SOCIALS = [
  {
    label: 'X',
    href: 'https://x.com',
    icon: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
  },
  {
    label: 'Instagram',
    href: 'https://instagram.com',
    icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z',
  },
  {
    label: 'YouTube',
    href: 'https://youtube.com',
    icon: 'M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
  },
  {
    label: 'WhatsApp',
    href: 'https://wa.me',
    icon: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z',
  },
]

export const MaintenanceScreen = () => {
  const adminPhone = useAdminPhone()
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => (prev >= 60 ? 60 : prev + 1))
    }, 80)
    return () => clearInterval(timer)
  }, [])

  return (
    <div
      className="relative flex min-h-dvh w-full flex-col items-center overflow-x-hidden bg-background font-sans"
      dir="rtl"
    >
      {/* ── Decorative Background ── */}
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
        <svg
          className="absolute start-8 top-20 h-16 w-16 text-primary/[0.06]"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <circle cx="6" cy="6" r="2" />
          <circle cx="18" cy="6" r="2" />
          <circle cx="6" cy="18" r="2" />
          <circle cx="18" cy="18" r="2" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center px-5 pb-12 pt-10 text-center">
        {/* 1. Logo / Header */}
        <div className="mb-6 flex animate-[fadeUp_0.8s_ease-out_both] flex-col items-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border border-border bg-card shadow-elevation-1 md:h-24 md:w-24">
            <Image
              src="/dareen_logo_new.webp"
              alt="دارين"
              className="h-14 w-14 md:h-16 md:w-16"
              imgClassName="object-contain"
            />
          </div>
          <h1 className="text-2xl font-black text-main md:text-3xl">دارين</h1>
          <p className="-mt-0.5 text-sm font-bold tracking-widest text-primary">السابعة</p>
          <p className="mt-1 text-xs text-muted">منصة تعليمية متكاملة</p>
        </div>

        {/* 2. Hero Illustration — Laptop + Gear + Engineer */}
        <div className="mb-8 w-full max-w-sm animate-[fadeUp_0.8s_ease-out_0.15s_both]">
          <div className="relative mx-auto aspect-[4/3] w-full">
            {/* Gear behind laptop — slow rotation */}
            <svg
              className="absolute start-1/2 top-2 h-28 w-28 -translate-x-1/2 animate-[spin_12s_linear_infinite] text-primary/[0.08] md:h-36 md:w-36"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12 3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m7.43-2.53a7.76 7.76 0 0 0 .07-1 7.76 7.76 0 0 0-.07-.97l2.11-1.63a.5.5 0 0 0 .12-.64l-2-3.46a.5.5 0 0 0-.61-.22l-2.49 1a7.15 7.15 0 0 0-1.68-.98l-.38-2.65A.49.49 0 0 0 14 2h-4a.49.49 0 0 0-.49.42l-.38 2.65a7.15 7.15 0 0 0-1.68.98l-2.49-1a.5.5 0 0 0-.61.22l-2 3.46a.49.49 0 0 0 .12.64l2.11 1.63a7.93 7.93 0 0 0 0 1.94l-2.11 1.65a.5.5 0 0 0-.12.64l2 3.46a.5.5 0 0 0 .61.22l2.49-1c.52.4 1.08.72 1.68.98l.38 2.65c.05.24.26.42.49.42h4c.24 0 .44-.18.49-.42l.38-2.65a7.15 7.15 0 0 0 1.68-.98l2.49 1a.5.5 0 0 0 .61-.22l2-3.46a.49.49 0 0 0-.12-.64z" />
            </svg>

            {/* Laptop body */}
            <svg
              className="absolute start-1/2 top-8 -translate-x-1/2"
              viewBox="0 0 260 180"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              width="260"
              height="180"
            >
              {/* Screen bezel */}
              <rect
                x="30"
                y="10"
                width="200"
                height="130"
                rx="10"
                fill="#E8EDF5"
                stroke="#CBD5E1"
                strokeWidth="2"
              />
              {/* Screen */}
              <rect x="42" y="22" width="176" height="106" rx="4" fill="white" />
              {/* Screen gear icon */}
              <g transform="translate(110,55) scale(0.9)">
                <path
                  d="M0-18a18 18 0 1 1 0 36 18 18 0 0 1 0-36m0 5a13 13 0 1 0 0 26 13 13 0 0 0 0-26"
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <circle cx="0" cy="0" r="4" fill="#2563EB" />
                <path
                  d="M0-28v-6M0 28v6M-28 0h-6M28 0h6M-20-20l-4-4M20 20l4 4M-20 20l-4 4M20-20l4-4"
                  stroke="#2563EB"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </g>
              {/* "جارٍ التحديث..." text */}
              <text
                x="130"
                y="95"
                textAnchor="middle"
                className="fill-primary text-[11px]"
                fontFamily="Tajawal, sans-serif"
                fontWeight="700"
              >
                جارٍ التحديث...
              </text>
              {/* Progress bar track */}
              <rect x="70" y="104" width="120" height="8" rx="4" fill="#E8EDF5" />
              {/* Progress bar fill */}
              <rect x="70" y="104" width={`${progress * 1.2}`} height="8" rx="4" fill="#2563EB">
                <animate
                  attributeName="opacity"
                  values="1;0.7;1"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </rect>
              {/* Progress percentage */}
              <text
                x="130"
                y="125"
                textAnchor="middle"
                className="fill-muted text-[9px]"
                fontFamily="Tajawal, sans-serif"
                fontWeight="600"
              >
                {progress}%
              </text>
              {/* Laptop base */}
              <path d="M15 145h230l10 20H5z" fill="#CBD5E1" />
              <rect x="100" y="155" width="60" height="6" rx="3" fill="#94A3B8" />
            </svg>

            {/* Engineer character */}
            <svg
              className="absolute -bottom-2 end-2 h-24 w-24 md:-bottom-1 md:end-4 md:h-28 md:w-28"
              viewBox="0 0 100 100"
              fill="none"
            >
              {/* Hard hat */}
              <ellipse cx="50" cy="28" rx="18" ry="6" fill="#FBBF24" />
              <rect x="36" y="20" width="28" height="10" rx="4" fill="#FBBF24" />
              <rect x="32" y="28" width="36" height="4" rx="2" fill="#F59E0B" />
              {/* Head */}
              <circle cx="50" cy="40" r="11" fill="#F3D4B0" />
              {/* Eyes */}
              <circle cx="46" cy="39" r="1.5" fill="#1E3A8A" />
              <circle cx="54" cy="39" r="1.5" fill="#1E3A8A" />
              {/* Smile */}
              <path
                d="M46 44c2 2 6 2 8 0"
                stroke="#1E3A8A"
                strokeWidth="1.2"
                strokeLinecap="round"
                fill="none"
              />
              {/* Body (shirt) */}
              <rect x="38" y="52" width="24" height="22" rx="6" fill="#2563EB" />
              {/* Arm + wrench */}
              <path d="M62 56l14-6" stroke="#2563EB" strokeWidth="5" strokeLinecap="round" />
              <circle cx="78" cy="48" r="4" fill="#94A3B8" />
              <rect x="74" y="44" width="8" height="2" rx="1" fill="#64748B" />
              {/* Legs */}
              <rect x="42" y="74" width="7" height="14" rx="3" fill="#334155" />
              <rect x="51" y="74" width="7" height="14" rx="3" fill="#334155" />
              {/* Boots */}
              <rect x="40" y="86" width="11" height="4" rx="2" fill="#1E293B" />
              <rect x="49" y="86" width="11" height="4" rx="2" fill="#1E293B" />
            </svg>

            {/* Toolbox */}
            <svg
              className="absolute bottom-4 start-4 h-12 w-12 md:start-8 md:h-14 md:w-14"
              viewBox="0 0 50 50"
              fill="none"
            >
              <rect x="5" y="18" width="40" height="24" rx="4" fill="#2563EB" />
              <rect x="17" y="12" width="16" height="8" rx="3" fill="#1E3A8A" />
              <rect x="22" y="22" width="6" height="3" rx="1.5" fill="#FBBF24" />
            </svg>

            {/* Small warning sign */}
            <div className="absolute -start-1 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-warning-soft shadow-sm md:start-2">
              <svg className="h-4 w-4 text-warning" viewBox="0 0 24 24" fill="currentColor">
                <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
              </svg>
            </div>
          </div>
        </div>

        {/* 3. Heading */}
        <div className="mb-8 animate-[fadeUp_0.8s_ease-out_0.3s_both]">
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

        {/* 4. Status Card */}
        <div className="mb-8 w-full max-w-md animate-[fadeUp_0.8s_ease-out_0.45s_both]">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-elevation-1 md:p-8">
            {/* Status line */}
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

            {/* Feature pills */}
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

        {/* 5. CTA Button */}
        <div className="mb-4 animate-[fadeUp_0.8s_ease-out_0.6s_both]">
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

      {/* ── Footer ── */}
      <div className="bg-surface/50 relative z-10 mt-auto w-full animate-[fadeUp_0.8s_ease-out_0.75s_both] border-t border-border">
        <div className="mx-auto flex max-w-2xl flex-col items-center px-5 py-8 text-center">
          {/* Illustration: book + graduation cap */}
          <svg className="mb-4 h-10 w-10 text-primary/20" viewBox="0 0 48 48" fill="currentColor">
            <path d="M24 4L4 14l20 10 20-10L24 4z" />
            <path d="M8 20v12c0 0 6 4 16 4s16-4 16-4V20L24 28 8 20z" opacity="0.5" />
            <path d="M38 20v14" stroke="currentColor" strokeWidth="2" fill="none" />
            <circle cx="38" cy="36" r="2" />
          </svg>

          <p className="mb-1 text-sm font-bold text-main">شكرًا لصبركم وثقتكم</p>
          <p className="mb-4 text-xs text-muted">معًا نصنع تجربة تعليمية أفضل.</p>

          {/* Social icons */}
          <div className="mb-5 flex items-center gap-3">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-card text-muted transition-all duration-200 hover:bg-primary/10 hover:text-primary"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d={s.icon} />
                </svg>
              </a>
            ))}
          </div>

          <p className="text-xs font-bold text-primary/60">www.dareen.cloud</p>
        </div>
      </div>
    </div>
  )
}
