import { Link } from 'react-router-dom'
import { MobileHeader } from '../../components/public/MobileHeader'
import { PublicFooter } from '../../components/public/PublicFooter'
import { SEO } from '../../components/SEO'
import { useSettingsStore } from '../../store/settingsStore'
import { Home, Headphones } from 'lucide-react'

export const NotFound = () => {
  const adminPhone = useSettingsStore((s) => s.adminPhone)
  const whatsappNumbers = useSettingsStore((s) => s.whatsappNumbers)

  // Settings-driven support number (same recipe as FloatingActions/PrivacyPolicy)
  const getNumber = (label: string): string => {
    try {
      const entries: { label: string; phone: string }[] = JSON.parse(whatsappNumbers)
      const found = entries.find((e) => e.label === label)
      return found ? found.phone.replace(/\D/g, '') : adminPhone.replace(/\D/g, '')
    } catch (e) {
      console.warn(e)
      return adminPhone.replace(/\D/g, '')
    }
  }

  return (
    <div className="relative flex min-h-full flex-col bg-background font-sans text-main">
      <SEO
        title="الصفحة غير موجودة"
        description="عذراً، الصفحة التي تبحث عنها غير موجودة. يمكنك العودة إلى الصفحة الرئيسية أو تصفح دوراتنا التعليمية."
        url="https://dareen.cloud/404"
        noindex
      />

      <MobileHeader />

      <main className="relative flex flex-grow items-center justify-center pb-4 pt-4 md:pt-[72px]">
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="absolute start-[-10%] top-[-15%] h-[60%] w-[60%] rounded-full bg-gradient-to-br from-primary/5 to-primary/5 blur-[140px]" />
          <div className="to-primary/3 absolute bottom-[-10%] end-[-10%] h-[50%] w-[50%] rounded-full bg-gradient-to-tr from-info-soft blur-[120px]" />
          <div
            className="pointer-events-none absolute start-1/2 top-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 opacity-[0.02] dark:opacity-[0.03]"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, var(--bg-info) 1px, transparent 0)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        <div className="container relative z-10 mx-auto max-w-lg px-4 text-center md:max-w-7xl">
          <picture>
            <source srcSet="/404.webp" type="image/webp" />
            <source srcSet="/404.avif" type="image/avif" />
            <img
              src="/404.png"
              alt="صفحة غير موجودة"
              loading="lazy"
              className="mx-auto mb-0 block max-h-64 w-80 object-contain md:mb-4 md:max-h-[70vh] md:w-[1200px]"
            />
          </picture>

          <h2 className="mb-3 font-heading text-xl font-black text-main dark:text-dim md:mb-4 md:text-3xl">
            الصفحة غير موجودة
          </h2>

          <p className="mx-auto mb-6 max-w-sm text-sm leading-relaxed text-muted md:mb-8 md:text-base md:leading-relaxed">
            عذراً، الصفحة التي تبحث عنها قد تكون انتقلت أو تم حذفها. يمكنك العودة إلى الرئيسية أو
            تصفح دوراتنا.
          </p>

          <div className="flex flex-row flex-wrap items-center justify-center gap-2 md:gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-black text-on-primary shadow-elevation-2 transition-all hover:bg-primary-hover hover:shadow-elevation-3 active:scale-[0.98] md:px-8 md:py-3.5 md:text-base"
            >
              <Home size={16} />
              العودة للرئيسية
            </Link>
            <a
              href={`https://wa.me/${getNumber('تواصل مع الدعم الفني')}?text=${encodeURIComponent('السلام عليكم، وصلت لصفحة غير موجودة في الموقع وأحتاج مساعدة')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl bg-success px-6 py-3 text-sm font-black text-on-success shadow-elevation-2 transition-all hover:bg-success-hover hover:shadow-elevation-3 active:scale-[0.98] md:px-8 md:py-3.5 md:text-base"
            >
              <Headphones size={16} />
              تواصل مع الدعم
            </a>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}
