import { Smartphone, Download, Shield, MonitorDown } from 'lucide-react'
import { useSettingsStore } from '../../../store/settingsStore'

export const AppDownloadSection = () => {
  const googlePlayUrl = useSettingsStore((s) => s.googlePlayUrl)
  const appStoreUrl = useSettingsStore((s) => s.appStoreUrl)

  return (
    <>
      {/* Desktop */}
      <section className="relative hidden overflow-hidden bg-surface pb-6 pt-4 transition-colors duration-500 dark:bg-background md:block md:pt-6">
        <div className="pointer-events-none absolute end-0 top-0 h-64 w-64 rounded-full bg-accent-soft blur-[100px] dark:bg-primary/[0.08]" />
        <div className="pointer-events-none absolute bottom-0 start-0 h-48 w-48 rounded-full bg-primary/5 blur-[80px] dark:bg-primary/[0.05]" />
        <div className="container relative z-10 mx-auto px-4 md:px-8">
          <div className="mx-auto max-w-6xl overflow-hidden rounded-2xl border border-primary/30 bg-primary-soft shadow-sm dark:border-primary/30 dark:bg-card">
            <div className="flex flex-col items-center justify-center p-6 text-center md:p-10">
              <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-primary/50 bg-white/80 px-4 py-1.5 dark:border-primary/40 dark:bg-primary/20">
                <Smartphone size={14} className="text-primary dark:text-primary" />
                <span className="text-xs font-bold text-primary dark:text-primary">
                  تطبيق دارين السابعة
                </span>
              </div>
              <h2 className="mb-2 font-heading text-lg font-black leading-tight text-main dark:text-main sm:text-2xl lg:text-3xl">
                حمل التطبيق الآن
              </h2>
              <p className="mx-auto mb-6 max-w-xl text-xs font-medium leading-relaxed text-muted dark:text-muted lg:text-xs">
                أفضل مدرسة افتراضية. حمل تطبيق دارين السابعة على هاتفك واستمتع بتجربة تعليمية
                متكاملة من أي مكان وفي أي وقت.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <a
                  href={googlePlayUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-all hover:-translate-y-0.5"
                >
                  <img src="/google-play.svg" alt="Google Play" className="h-12 w-auto" />
                </a>
                <a
                  href={appStoreUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-all hover:-translate-y-0.5"
                >
                  <img src="/app-store.svg" alt="App Store" className="h-12 w-auto" />
                </a>
              </div>
              <div className="mt-6 flex items-center justify-center gap-6">
                <div className="flex items-center gap-1.5 text-muted dark:text-muted">
                  <Download size={14} />
                  <span className="text-micro font-medium">مجاني</span>
                </div>
                <div className="h-4 w-px bg-border dark:bg-primary/30"></div>
                <div className="flex items-center gap-1.5 text-muted dark:text-muted">
                  <Shield size={14} />
                  <span className="text-micro font-medium">آمن</span>
                </div>
                <div className="h-4 w-px bg-border dark:bg-primary/30"></div>
                <div className="flex items-center gap-1.5 text-muted dark:text-muted">
                  <MonitorDown size={14} />
                  <span className="text-micro font-medium">متوافق مع جميع الأجهزة</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile */}
      <section className="relative block overflow-hidden bg-surface pb-4 pt-2 transition-colors duration-500 dark:bg-background md:hidden">
        <div className="pointer-events-none absolute -end-20 top-40 h-64 w-64 rounded-full bg-accent-soft blur-[100px] dark:bg-primary/[0.08]"></div>
        <div className="pointer-events-none absolute -start-20 bottom-40 h-80 w-80 rounded-full bg-primary/10 blur-[120px] dark:bg-primary/[0.05]"></div>
        <div className="relative z-10 px-5">
          <div className="mb-5 mt-2 flex items-center justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/50 bg-white/80 px-5 py-2.5 shadow-sm dark:border-primary/40 dark:bg-primary/20">
              <Smartphone size={14} className="text-primary dark:text-primary" />
              <span className="text-xs font-bold tracking-wide text-primary dark:text-primary">
                تطبيق دارين السابعة
              </span>
            </div>
          </div>
          <div className="mb-2 text-center">
            <h2 className="font-heading text-2xl font-black leading-tight text-main dark:text-main">
              حمل التطبيق الآن
            </h2>
          </div>
          <p className="mx-auto mb-6 max-w-xs text-center text-micro font-medium leading-tight text-muted dark:text-muted">
            أفضل مدرسة افتراضية. حمل تطبيق دارين السابعة على هاتفك واستمتع بتجربة تعليمية متكاملة من
            أي مكان وفي أي وقت.
          </p>
          <div className="mb-7 flex flex-row items-center justify-center gap-4">
            <a
              href={googlePlayUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-all hover:-translate-y-0.5"
            >
              <img src="/google-play.svg" alt="Google Play" className="h-11 w-auto" />
            </a>
            <a
              href={appStoreUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-all hover:-translate-y-0.5"
            >
              <img src="/app-store.svg" alt="App Store" className="h-11 w-auto" />
            </a>
          </div>
          <div className="mt-5 flex items-center justify-center gap-6">
            <div className="flex items-center gap-1.5 text-muted dark:text-muted">
              <Download size={14} />
              <span className="text-micro font-medium">مجاني</span>
            </div>
            <div className="h-4 w-px bg-border dark:bg-primary/30"></div>
            <div className="flex items-center gap-1.5 text-muted dark:text-muted">
              <Shield size={14} />
              <span className="text-micro font-medium">آمن</span>
            </div>
            <div className="h-4 w-px bg-border dark:bg-primary/30"></div>
            <div className="flex items-center gap-1.5 text-muted dark:text-muted">
              <MonitorDown size={14} />
              <span className="text-micro font-medium">متوافق مع جميع الأجهزة</span>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
