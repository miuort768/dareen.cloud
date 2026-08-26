import { Link } from 'react-router-dom'
import {
  Download,
  FileText,
  ArrowLeft,
  MessageCircle,
  Shield,
  BadgeCheck,
  Headphones,
} from 'lucide-react'
import { useSettingsStore } from '../../store/settingsStore'

export const MasarSection = () => {
  const adminPhone = useSettingsStore((s) => s.adminPhone)
  const whatsappNumbers = useSettingsStore((s) => s.whatsappNumbers)
  const contactUsNumber = (() => {
    try {
      const entries = JSON.parse(whatsappNumbers)
      const found = entries.find((e: { label: string; phone: string }) => e.label === 'تواصل معانا')
      return found ? found.phone.replace(/\D/g, '') : adminPhone.replace(/\D/g, '')
    } catch (e) {
      console.warn(e)
      return adminPhone.replace(/\D/g, '')
    }
  })()

  return (
    <>
      {/* ─── Desktop version ─── */}
      <section className="relative hidden overflow-hidden bg-surface py-4 transition-colors duration-500 dark:bg-black md:block">
        <div className="pointer-events-none absolute end-0 top-0 h-64 w-64 rounded-full bg-accent-soft blur-[100px] dark:bg-primary/[0.08]" />
        <div className="pointer-events-none absolute bottom-0 start-0 h-48 w-48 rounded-full bg-primary/5 blur-[80px] dark:bg-primary/[0.05]" />
        <div className="container relative z-10 mx-auto px-4">
          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-primary via-primary-hover to-primary shadow-2xl dark:border-primary/30 dark:from-surface dark:via-card dark:to-surface">
            <div className="pointer-events-none absolute inset-0 opacity-20">
              <div className="absolute start-0 top-0 h-80 w-80 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary/20 blur-[120px] dark:bg-primary/10"></div>
              <div className="absolute bottom-0 end-0 h-80 w-80 -translate-x-1/2 translate-y-1/2 rounded-full bg-primary/10 blur-[120px] dark:bg-primary/5"></div>
            </div>
            <div className="flex min-h-[400px] flex-col items-stretch lg:flex-row">
              <div className="group relative flex w-full shrink-0 items-center justify-center overflow-hidden border-b border-white/10 bg-white/[0.08] p-8 backdrop-blur-md dark:border-primary/20 dark:bg-primary/[0.05] lg:w-[40%] lg:border-b-0 lg:border-e lg:p-4">
                <div className="pointer-events-none absolute inset-0 z-30 h-full w-full animate-shine-slow bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-primary/10"></div>
                <div className="relative z-10 flex h-full w-full items-center justify-center">
                  <div className="absolute h-64 w-64 rounded-none bg-primary/20 opacity-0 blur-[80px] transition-opacity duration-700 group-hover:opacity-100 dark:bg-primary/10"></div>
                  <picture>
                    <source srcSet="/dareen_books_portal_v3.webp" type="image/webp" />
                    <source srcSet="/dareen_books_portal_v3.avif" type="image/avif" />
                    <img
                      src="/dareen_books_portal_v3.png"
                      alt="بوابة الكتب والملخصات - دارين السابعة"
                      width="680"
                      height="680"
                      loading="lazy"
                      decoding="async"
                      className="h-auto w-full max-w-[280px] object-contain drop-shadow-2xl transition-transform duration-700 hover:scale-105 lg:max-w-[340px]"
                    />
                  </picture>
                </div>
              </div>
              <div className="relative z-20 flex w-full flex-col justify-center p-6 text-center text-on-primary md:p-12 lg:w-[60%] lg:p-14 lg:text-start">
                <div className="mb-6 flex items-center justify-center gap-4 lg:justify-start">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 backdrop-blur-md dark:border-primary/40 dark:bg-primary/20">
                    <Download className="h-3.5 w-3.5 animate-pulse text-warning dark:text-primary" />
                    <span className="text-xs font-black uppercase tracking-widest text-on-primary dark:text-primary">
                      بوابة الكتب والملخصات
                    </span>
                  </div>
                </div>
                <h2 className="mb-3 font-heading text-lg font-black leading-tight sm:text-xl md:text-2xl lg:text-3xl">
                  <span className="text-on-primary dark:text-main">مركز</span>
                  <span className="text-shadow-none inline-block -rotate-1 transform whitespace-nowrap bg-primary px-3 py-1 text-on-primary shadow-lg dark:bg-primary dark:text-on-primary md:px-5 md:py-1">
                    دارين السابعة
                  </span>
                  <span className="text-on-primary dark:text-main">للمذكرات التعليمية</span>
                </h2>
                <p className="mx-auto mb-4 max-w-2xl text-micro font-medium leading-relaxed text-on-primary dark:text-white/90 sm:text-xs md:text-sm lg:mx-0 lg:text-base">
                  حصرياً في مركز دارين السابعة، نوفر لك أقوى المذكرات التعليمية والملخصات الشاملة
                  لجميع المراحل الدراسية، معدة بعناية من قبل نخبة من المعلمين لضمان تفوقك الدراسي.
                </p>
                <div className="mb-5 flex flex-wrap justify-center gap-2 lg:justify-start">
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-micro font-bold text-on-primary dark:border-primary/30 dark:bg-primary/15 dark:text-primary">
                    الكويت
                  </span>
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-micro font-bold text-on-primary dark:border-primary/30 dark:bg-primary/15 dark:text-primary">
                    السعودية
                  </span>
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-micro font-bold text-on-primary dark:border-primary/30 dark:bg-primary/15 dark:text-primary">
                    الإمارات وقطر
                  </span>
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-micro font-bold text-on-primary dark:border-primary/30 dark:bg-primary/15 dark:text-primary">
                    عمان والأردن
                  </span>
                </div>
                <div className="flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
                  <Link
                    to="/books"
                    className="group flex items-center justify-center gap-3 rounded-xl bg-primary px-10 py-4 text-lg font-black text-on-primary shadow-2xl shadow-primary/20 transition-all duration-300 hover:-translate-y-1 hover:bg-primary-hover dark:bg-primary dark:text-on-primary dark:shadow-primary/20 dark:hover:bg-warning"
                  >
                    <FileText className="h-6 w-6 transition-transform group-hover:scale-110" />
                    <span>تحميل مذكرة</span>
                    <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                  </Link>
                  <a
                    href={`https://wa.me/${contactUsNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 rounded-xl border border-white/20 bg-white/5 px-10 py-4 text-lg font-black text-on-primary backdrop-blur-sm transition-all duration-300 hover:border-white/40 hover:bg-white/10 dark:border-primary/30 dark:bg-primary/10 dark:text-primary dark:hover:border-primary/50 dark:hover:bg-primary/20"
                  >
                    <MessageCircle className="h-6 w-6" />
                    <span>تواصل معنا</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Mobile version ─── */}
      <section className="relative block overflow-hidden bg-surface pb-4 pt-3 transition-colors duration-500 dark:bg-black md:hidden">
        <div className="pointer-events-none absolute -start-20 top-20 h-60 w-60 rounded-full bg-accent-soft blur-[100px] dark:bg-primary/[0.08]"></div>
        <div className="pointer-events-none absolute -end-20 bottom-40 h-72 w-72 rounded-full bg-primary/10 blur-[120px] dark:bg-primary/[0.05]"></div>

        <div className="relative z-10 px-4">
          <div className="relative mb-4 overflow-hidden rounded-2xl shadow-lg">
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-primary/60 via-transparent to-transparent dark:from-black/80"></div>
            <picture>
              <source srcSet="/dareen_books_portal_v3.webp" type="image/webp" />
              <source srcSet="/dareen_books_portal_v3.avif" type="image/avif" />
              <img
                src="/dareen_books_portal_v3.png"
                alt="بوابة الكتب والملخصات"
                width="400"
                height="300"
                loading="lazy"
                className="h-auto w-full object-cover"
              />
            </picture>
          </div>

          <div className="mb-5 flex items-center justify-between rounded-2xl border border-border bg-surface p-5 shadow-sm dark:border-primary/30 dark:bg-card">
            <div>
              <h2 className="text-lg font-black text-main dark:text-main">بوابة الكتب والملخصات</h2>
              <p className="mt-0.5 text-xs font-medium text-muted dark:text-muted">
                جميع المذكرات في مكان واحد
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-soft dark:bg-primary/20">
              <Download size={20} className="text-primary dark:text-primary" />
            </div>
          </div>

          <div className="mb-5 rounded-3xl bg-gradient-to-br from-primary via-primary-hover to-primary p-6 shadow-lg shadow-primary/20 dark:from-primary dark:via-warning dark:to-primary dark:shadow-primary/20">
            <div className="mb-4 flex items-center gap-4">
              <div className="relative">
                <span className="text-sm font-black text-on-primary dark:text-on-primary">
                  مركز دارين السابعة
                </span>
                <div className="absolute -bottom-1 start-0 h-0.5 w-full rounded-full bg-white/80 shadow-sm dark:bg-black/30"></div>
              </div>
              <span className="rounded-[4px] border border-white/30 bg-white/20 px-3 py-1 text-micro font-bold text-on-primary backdrop-blur-sm dark:border-black/30 dark:bg-black/20 dark:text-on-primary">
                للمذكرات التعليمية
              </span>
            </div>

            <p className="mb-6 text-micro font-medium leading-relaxed text-on-primary dark:text-white/90">
              حصريًا في مركز دارين السابعة، نوفر لك أقوى المذكرات التعليمية والملخصات الشاملة لجميع
              المراحل الدراسية، معدة بعناية من قبل نخبة من المعلمين لضمان تفوقك الدراسي.
            </p>

            <div className="flex flex-col gap-3">
              <Link
                to="/books"
                className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-white/20 to-white/30 py-4 text-base font-black text-on-primary shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5 hover:shadow-primary/50 dark:from-black/20 dark:to-black/30 dark:text-on-primary dark:shadow-black/20"
              >
                <FileText size={20} />
                <span>تحميل مذكرة</span>
                <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
              </Link>
              <a
                href={`https://wa.me/${contactUsNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/20 bg-white/5 py-3.5 text-sm font-bold text-on-primary backdrop-blur-sm transition-all hover:bg-white/10 dark:border-black/20 dark:bg-black/10 dark:text-on-primary dark:hover:bg-black/20"
              >
                <MessageCircle size={18} />
                <span>تواصل معنا</span>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-2xl border border-border bg-surface p-4 text-center shadow-sm dark:border-primary/20 dark:bg-card">
              <div className="mx-auto mb-2.5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft dark:bg-primary/15">
                <Shield size={20} className="text-primary dark:text-primary" />
              </div>
              <span className="block text-xs font-bold leading-tight text-main dark:text-main">
                جودة مضمونة
              </span>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-4 text-center shadow-sm dark:border-primary/20 dark:bg-card">
              <div className="mx-auto mb-2.5 flex h-12 w-12 items-center justify-center rounded-2xl bg-success-light dark:bg-primary/15">
                <BadgeCheck size={20} className="text-success dark:text-primary" />
              </div>
              <span className="block text-xs font-bold leading-tight text-main dark:text-main">
                محتوى موثوق
              </span>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-4 text-center shadow-sm dark:border-primary/20 dark:bg-card">
              <div className="mx-auto mb-2.5 flex h-12 w-12 items-center justify-center rounded-2xl bg-warning-light dark:bg-primary/15">
                <Headphones size={20} className="text-warning dark:text-primary" />
              </div>
              <span className="block text-xs font-bold leading-tight text-main dark:text-main">
                دعم مستمر طوال اليوم
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
