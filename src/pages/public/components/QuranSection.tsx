import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeft, Clock, ClipboardCheck, Mic, Sparkles, Star } from 'lucide-react'
import { Image } from '../../../shared/components/ui'

interface QuranSectionProps {
  whatsappNumber: string
}

const LeafDecoration = () => (
  <div className="pointer-events-none absolute start-0 top-0 h-48 w-48 overflow-hidden opacity-60 md:h-64 md:w-64">
    <svg viewBox="0 0 200 200" className="h-full w-full">
      <defs>
        <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--color-success)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.15" />
        </linearGradient>
      </defs>
      <path
        d="M180 20 Q140 40 120 80 Q100 120 130 150 Q160 130 170 90 Q180 50 180 20Z"
        fill="url(#leafGrad)"
        transform="rotate(15, 100, 100)"
      />
      <path
        d="M160 60 Q120 70 100 100 Q80 130 110 155 Q140 140 150 110 Q160 80 160 60Z"
        fill="url(#leafGrad)"
        transform="rotate(30, 100, 100)"
      />
      <path
        d="M200 40 Q170 50 150 80 Q130 110 150 135 Q170 120 180 90 Q190 60 200 40Z"
        fill="url(#leafGrad)"
        transform="rotate(-10, 100, 100)"
      />
      <circle cx="170" cy="30" r="8" fill="var(--color-success)" opacity="0.15" />
      <circle cx="150" cy="70" r="5" fill="var(--color-primary)" opacity="0.1" />
      <circle cx="190" cy="60" r="6" fill="var(--color-success)" opacity="0.12" />
    </svg>
  </div>
)

export const QuranSection = ({ whatsappNumber }: QuranSectionProps) => {
  return (
    <>
      {/* Desktop version */}
      <section className="relative hidden overflow-hidden bg-surface pb-6 pt-4 transition-colors duration-500 dark:bg-background md:block md:pt-6">
        <div className="pointer-events-none absolute end-0 top-0 h-64 w-64 rounded-full bg-accent-soft blur-[100px] dark:bg-primary/10" />
        <div className="pointer-events-none absolute bottom-0 start-0 h-48 w-48 rounded-full bg-primary/5 blur-[80px] dark:bg-primary/10" />
        <div className="container relative z-10 mx-auto px-4 md:px-8">
          <div className="mx-auto max-w-6xl overflow-hidden rounded-2xl border border-success bg-success-soft shadow-sm dark:border-primary/40 dark:bg-card">
            <div className="flex flex-col items-center justify-center gap-4 p-6 md:p-10 lg:flex-row lg:gap-16">
              <div className="w-full text-center lg:w-1/2">
                <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-success bg-white/80 px-4 py-1.5 dark:border-primary/40 dark:bg-primary/15">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-success dark:bg-primary"></span>
                  <span className="text-xs font-bold text-success-dark dark:text-primary">
                    برامج تحفيظ متميزة
                  </span>
                </div>
                <h2 className="mb-4 font-heading text-lg font-black leading-tight text-main dark:text-main sm:text-2xl lg:text-3xl">
                  رحلتك مع{' '}
                  <span className="relative inline-block text-success dark:text-primary">
                    كتاب الله
                    <svg
                      className="absolute -bottom-2 end-0 h-3 w-full"
                      viewBox="0 0 100 10"
                      preserveAspectRatio="none"
                    >
                      <path
                        d="M0 5 Q 50 10 100 5"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        className="text-success opacity-40 dark:text-primary"
                      />
                    </svg>
                  </span>{' '}
                  تبدأ بخطوة
                </h2>
                <p className="dark:text-soft mx-auto mb-6 max-w-xl text-xs font-medium leading-relaxed text-muted lg:text-sm">
                  منهجية فريدة تجمع بين أصالة التلقي وتقنيات التعليم الحديثة. نقدم حلقات فردية
                  ومجموعات صغيرة مع نخبة من المقرئين المجازين.
                </p>
                <div className="mb-5 flex flex-col justify-center gap-3 sm:flex-row">
                  <a
                    href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('السلام عليكم، أرغب في البدء بحفظ القرآن الكريم في دارين السابعة')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-center gap-2 rounded-xl bg-success px-8 py-3.5 text-sm font-extrabold text-on-success shadow-lg transition-all hover:-translate-y-0.5 hover:brightness-90 dark:bg-gradient-to-r dark:from-primary dark:to-warning dark:text-on-primary"
                  >
                    <span>ابدأ الحفظ الآن</span>
                    <ArrowLeft
                      size={18}
                      className="transition-transform group-hover:-translate-x-1"
                    />
                  </a>
                  <Link
                    to="/courses"
                    onClick={() => window.scrollTo(0, 0)}
                    className="flex items-center justify-center rounded-xl border border-border bg-card px-8 py-3.5 text-sm font-bold text-main transition-all hover:border-success hover:text-success dark:border-primary/30 dark:bg-white/5 dark:text-main"
                  >
                    <Sparkles size={16} className="me-2 dark:text-primary" />
                    تصفح المزيد
                  </Link>
                </div>
                <div className="inline-flex items-center justify-center gap-4">
                  <div className="flex -space-x-3 space-x-reverse">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={`avatar-${i}`}
                        className="h-10 w-10 overflow-hidden rounded-full border-2 border-card bg-success-soft shadow-sm dark:border-primary/40 dark:bg-background"
                      >
                        <Image
                          src={`https://i.pravatar.cc/100?img=${i + 10}`}
                          alt=""
                          className="h-10 w-10"
                        />
                      </div>
                    ))}
                    <div className="dark:text-soft flex h-10 w-10 items-center justify-center rounded-full border-2 border-card bg-surface text-xs font-bold text-muted shadow-sm dark:border-primary/40 dark:bg-background">
                      +5k
                    </div>
                  </div>
                  <div className="h-8 w-px bg-success opacity-40 dark:bg-primary"></div>
                  <div className="text-start">
                    <div className="flex items-center gap-1 text-sm font-bold text-main dark:text-main">
                      4.9/5
                      <Star className="h-4 w-4 fill-warning text-warning dark:fill-primary dark:text-primary" />
                    </div>
                    <div className="text-xs font-medium text-muted dark:text-muted">
                      من قبل آلاف الطلاب
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex w-full justify-center py-4 lg:w-1/2 lg:py-0">
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-50px' }}
                  variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
                  className="grid w-full max-w-[400px] grid-cols-2 gap-3"
                >
                  <motion.div
                    variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col items-center rounded-2xl border border-border bg-card p-4 text-center shadow-sm dark:border-primary/25 dark:bg-surface"
                  >
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-surface text-primary dark:bg-primary/15 dark:text-primary">
                      <Clock className="h-5 w-5" />
                    </div>
                    <h3 className="mb-1 text-xs font-black text-main dark:text-main">أوقات مرنة</h3>
                    <p className="text-micro font-medium leading-tight text-muted dark:text-muted">
                      اختر مواعيدك المفضلة
                    </p>
                  </motion.div>
                  <motion.div
                    variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col items-center rounded-2xl border border-border bg-card p-4 text-center shadow-sm dark:border-primary/25 dark:bg-surface"
                  >
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-warning-soft text-warning dark:bg-primary/15 dark:text-primary">
                      <ClipboardCheck className="h-5 w-5" />
                    </div>
                    <h3 className="mb-1 text-xs font-black text-main dark:text-main">
                      متابعة دقيقة
                    </h3>
                    <p className="text-micro font-medium leading-tight text-muted dark:text-muted">
                      تقارير إنجاز أسبوعية
                    </p>
                  </motion.div>
                  <motion.div
                    variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col items-center rounded-2xl border border-border bg-card p-4 text-center shadow-sm dark:border-primary/25 dark:bg-surface"
                  >
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-success-soft text-success dark:bg-primary/15 dark:text-primary">
                      <Mic className="h-5 w-5" />
                    </div>
                    <h3 className="mb-1 text-xs font-black text-main dark:text-main">
                      معلمون مجازون
                    </h3>
                    <p className="text-micro font-medium leading-tight text-muted dark:text-muted">
                      نخبة الحفاظ المبدعون
                    </p>
                  </motion.div>
                  <motion.div
                    variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                    transition={{ duration: 0.4 }}
                  >
                    <Link
                      to="/contact"
                      className="flex cursor-pointer flex-col items-center rounded-2xl bg-primary p-4 text-center text-on-primary shadow-lg transition-all hover:brightness-90 dark:bg-gradient-to-r dark:from-primary dark:to-warning dark:text-on-primary"
                    >
                      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 text-on-primary backdrop-blur-sm dark:bg-black/20 dark:text-on-primary">
                        <Sparkles className="h-5 w-5" />
                      </div>
                      <h3 className="mb-1 text-xs font-black text-on-primary dark:text-on-primary">
                        جرب مجاناً
                      </h3>
                      <p className="text-micro font-extrabold leading-tight text-on-primary opacity-80 dark:text-on-primary">
                        حصة تجريبية للمشتركين
                      </p>
                    </Link>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile version */}
      <section className="relative block overflow-hidden bg-surface pb-4 pt-2 transition-colors duration-500 dark:bg-background md:hidden">
        <LeafDecoration />

        <div className="pointer-events-none absolute -end-20 top-40 h-64 w-64 rounded-full bg-accent-soft blur-[100px] dark:bg-primary/10"></div>
        <div className="pointer-events-none absolute -start-20 bottom-40 h-80 w-80 rounded-full bg-primary/10 blur-[120px] dark:bg-primary/10"></div>

        <div className="relative z-10 px-5">
          <div className="mb-5 mt-2 flex items-center justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-success bg-white/80 px-5 py-2.5 shadow-sm dark:border-primary/40 dark:bg-primary/15">
              <span className="h-2 w-2 animate-pulse rounded-full bg-success dark:bg-primary"></span>
              <span className="text-xs font-bold tracking-wide text-success-dark dark:text-primary">
                برامج حفظ متميزة
              </span>
            </div>
          </div>

          <div className="mb-5 text-center">
            <h2 className="font-heading text-2xl font-black leading-tight text-main dark:text-main">
              رحلتك مع{' '}
              <span className="relative inline-block text-success dark:text-primary">
                كتاب الله
                <svg
                  className="absolute -bottom-1.5 end-0 h-3 w-full"
                  viewBox="0 0 120 12"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M2 8 Q 30 0 60 8 Q 90 12 118 4"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                    className="text-success opacity-40 dark:text-primary"
                  />
                </svg>
              </span>
              <br />
              تبدأ بخطوة
            </h2>
          </div>

          <p className="dark:text-soft mx-auto mb-6 max-w-xs text-center text-xs font-medium leading-relaxed text-muted">
            منهجية فريدة تجمع بين أصالة التلقي وتقنيات التعليم الحديثة. نقدم حلقات فردية ومجموعات
            صغيرة مع نخبة من المقرئين المجازين.
          </p>

          <div className="mb-7 flex flex-col items-center gap-3">
            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('السلام عليكم، أرغب في البدء بحفظ القرآن الكريم في دارين السابعة')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex w-full max-w-[320px] items-center justify-center gap-2 rounded-2xl bg-success py-4 text-base font-extrabold text-on-success shadow-lg transition-all hover:-translate-y-0.5 hover:brightness-90 dark:bg-gradient-to-r dark:from-primary dark:to-warning dark:text-on-primary"
            >
              <span>ابدأ الحفظ الآن</span>
              <ArrowLeft size={20} className="transition-transform group-hover:-translate-x-1" />
            </a>
            <Link
              to="/courses"
              onClick={() => window.scrollTo(0, 0)}
              className="flex w-full max-w-[320px] items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3.5 text-sm font-bold text-main shadow-sm transition-all dark:border-primary/30 dark:bg-white/5 dark:text-main"
            >
              <Sparkles size={16} className="dark:text-primary" />
              تصفح المزيد
            </Link>
          </div>

          <div className="mb-8 flex items-center justify-center gap-4">
            <div className="text-end">
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black text-main dark:text-main">4.9</span>
                <span className="text-sm font-bold text-muted dark:text-muted">/5</span>
                <Star
                  size={14}
                  className="fill-warning text-warning dark:fill-primary dark:text-primary"
                />
              </div>
              <div className="mt-0.5 text-xs font-medium text-muted dark:text-muted">
                من قبل آلاف الطلاب
              </div>
            </div>
            <div className="h-10 w-px bg-success opacity-40 dark:bg-primary"></div>
            <div className="flex -space-x-2.5 space-x-reverse">
              {[1, 2, 3].map((i) => (
                <div
                  key={`avatar-${i}`}
                  className="h-9 w-9 overflow-hidden rounded-full border-2 border-card bg-surface shadow-sm dark:border-primary/40 dark:bg-background"
                >
                  <Image
                    src={`https://i.pravatar.cc/100?img=${i + 10}`}
                    alt=""
                    className="h-full w-full"
                  />
                </div>
              ))}
              <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-card bg-success text-micro font-black text-on-success shadow-sm dark:border-primary/40 dark:bg-primary dark:text-on-primary">
                5K+
              </div>
            </div>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
            className="mx-auto mb-8 grid max-w-[360px] grid-cols-2 gap-3"
          >
            <motion.div
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center rounded-2xl border border-border bg-card p-4 text-center shadow-sm dark:border-primary/25 dark:bg-surface"
            >
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-warning-soft dark:bg-primary/15">
                <ClipboardCheck size={22} className="text-warning dark:text-primary" />
              </div>
              <h3 className="mb-1 text-sm font-black text-main dark:text-main">متابعة دقيقة</h3>
              <p className="text-micro leading-relaxed text-muted dark:text-muted">
                تقارير إنجاز أسبوعية
              </p>
            </motion.div>
            <motion.div
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center rounded-2xl border border-border bg-card p-4 text-center shadow-sm dark:border-primary/25 dark:bg-surface"
            >
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-soft dark:bg-primary/15">
                <Clock size={22} className="text-primary dark:text-primary" />
              </div>
              <h3 className="mb-1 text-sm font-black text-main dark:text-main">أوقات مرنة</h3>
              <p className="text-micro leading-relaxed text-muted dark:text-muted">
                اختر مواعيدك المفضلة
              </p>
            </motion.div>
            <motion.div
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center rounded-2xl border-0 bg-primary p-4 text-center shadow-lg dark:bg-gradient-to-r dark:from-primary dark:to-warning"
            >
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm dark:bg-black/20">
                <Sparkles size={22} className="text-on-primary dark:text-on-primary" />
              </div>
              <h3 className="mb-1 text-sm font-black text-on-primary dark:text-on-primary">
                جرب مجانًا
              </h3>
              <p className="text-micro font-bold leading-relaxed text-on-primary opacity-80 dark:text-on-primary">
                حصة تجريبية للمشتركين
              </p>
            </motion.div>
            <motion.div
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center rounded-2xl border border-border bg-card p-4 text-center shadow-sm dark:border-primary/25 dark:bg-surface"
            >
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-success-soft dark:bg-primary/15">
                <Mic size={22} className="text-success dark:text-primary" />
              </div>
              <h3 className="mb-1 text-sm font-black text-main dark:text-main">معلمون مجازون</h3>
              <p className="text-micro leading-relaxed text-muted dark:text-muted">
                نخبة الحفاظ المبدعون
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
