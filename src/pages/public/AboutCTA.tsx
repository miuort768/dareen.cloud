import { Link } from 'react-router-dom'
import { ArrowLeft, Sparkles, Users, Target } from 'lucide-react'
import { AnimateOnScroll } from '../../components/ui/AnimateOnScroll'
import { useIsAuthenticated } from '../../context/useApp'

export const AboutCTA = () => {
  const isAuthenticated = useIsAuthenticated()
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-active via-primary to-primary-active py-6 transition-colors duration-500 dark:from-card dark:via-card dark:to-card md:py-8">
      {/* Decorative gold glow */}
      <div
        className="pointer-events-none absolute start-0 top-0 h-[600px] w-[600px] rounded-full dark:bg-primary/[0.03]"
        style={{
          background:
            'radial-gradient(circle, color-mix(in srgb, var(--bg-warning) 8%, transparent) 0%, transparent 70%)',
        }}
      />
      <div
        className="pointer-events-none absolute bottom-0 end-0 h-[500px] w-[500px] rounded-full dark:bg-primary/[0.02]"
        style={{
          background:
            'radial-gradient(circle, color-mix(in srgb, var(--bg-warning) 6%, transparent) 0%, transparent 70%)',
        }}
      />
      <div
        className="pointer-events-none absolute start-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            'radial-gradient(circle, color-mix(in srgb, var(--bg-primary) 4%, transparent) 0%, transparent 70%)',
        }}
      />

      <div className="container relative z-10 mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <AnimateOnScroll animation="fadeUp">
            <div className="group relative overflow-hidden rounded-3xl shadow-2xl">
              <div
                className="pointer-events-none absolute -inset-[2px] rounded-3xl opacity-50 transition-opacity duration-1000 group-hover:opacity-80"
                style={{
                  background:
                    'linear-gradient(135deg, color-mix(in srgb, var(--bg-warning) 40%, transparent), color-mix(in srgb, var(--bg-warning) 10%, transparent), color-mix(in srgb, var(--bg-primary) 30%, transparent), color-mix(in srgb, var(--bg-warning) 40%, transparent))',
                }}
              />

              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-active to-primary-hover p-8 dark:border dark:border-primary/20 dark:from-card dark:to-surface md:p-14">
                {/* Gold grid pattern */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-[0.03]"
                  style={{
                    backgroundImage:
                      "url(\"data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30Z' fill='none' stroke='%23D4AF37' stroke-width='0.5'/%3E%3C/svg%3E\")",
                    backgroundSize: '60px 60px',
                  }}
                />

                <div className="relative z-20 flex flex-col items-stretch gap-10 lg:flex-row lg:gap-16">
                  <div className="flex w-full flex-col justify-center text-center lg:w-[58%] lg:text-start">
                    <div
                      className="mx-auto mb-6 inline-flex items-center gap-2.5 rounded-full px-5 py-2 dark:border dark:border-primary/25 dark:bg-primary/10 lg:mx-0 lg:mb-8"
                      style={{
                        background: 'color-mix(in srgb, var(--bg-warning) 12%, transparent)',
                        border: '1px solid color-mix(in srgb, var(--bg-warning) 25%, transparent)',
                      }}
                    >
                      <Sparkles size={14} className="text-accent dark:text-primary" />
                      <span className="text-xs font-black tracking-wider text-accent dark:text-primary">
                        انضم إلى عائلتنا
                      </span>
                    </div>

                    <h2 className="mb-4 text-xl font-black leading-tight text-on-primary dark:text-main md:text-3xl lg:text-4xl">
                      هل أنت مستعد لتكون <br />
                      <span className="from-white to-white/80 bg-clip-text text-transparent dark:from-primary dark:to-primary">
                        جزءاً من حكايتنا؟
                      </span>
                    </h2>

                    <p className="text-on-primary/70 dark:text-main/50 mx-auto mb-8 max-w-2xl text-sm font-medium leading-relaxed md:text-base lg:mx-0">
                      انضم إلى آلاف الطلاب الذين بدؤوا رحلتهم نحو التميز الحقيقي مع دارين السابعة.
                      مستقبلك المشرق يبدأ بقرار واحد تتخذه الآن.
                    </p>

                    <div className="flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
                      <Link
                        to="/courses"
                        onClick={() => window.scrollTo(0, 0)}
                        className="group relative flex items-center justify-center gap-3 overflow-hidden rounded-xl bg-gradient-to-br from-warning to-warning-dark px-10 py-4 text-base font-black text-on-primary shadow-xl transition-all duration-500 hover:-translate-y-1 dark:from-primary dark:to-primary dark:text-card dark:shadow-primary/20"
                      >
                        <span className="relative z-10">ابدأ رحلتك الآن</span>
                        <ArrowLeft
                          size={18}
                          className="relative z-10 transition-transform group-hover:-translate-x-1.5"
                        />
                      </Link>
                      <Link
                        to={isAuthenticated ? '/dashboard' : '/login'}
                        onClick={() => window.scrollTo(0, 0)}
                        className="text-on-primary/85 group flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-10 py-4 text-base font-black backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 dark:border-primary/25 dark:bg-white/5 dark:text-primary"
                      >
                        <span>{isAuthenticated ? 'لوحة التحكم' : 'تسجيل الدخول'}</span>
                      </Link>
                    </div>
                  </div>

                  <div className="relative flex w-full items-center lg:w-[42%]">
                    <div className="grid w-full grid-cols-2 gap-3">
                      <div className="group/card relative flex min-h-[180px] transform flex-col items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-sm transition-all duration-500 hover:-translate-y-1.5 dark:border-primary/15 dark:bg-white/5 md:p-8">
                        <div
                          className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/card:opacity-100 dark:bg-primary/[0.03]"
                          style={{
                            background:
                              'radial-gradient(circle at 50% 0%, color-mix(in srgb, var(--bg-warning) 6%, transparent), transparent 70%)',
                          }}
                        />
                        <div className="relative z-10">
                          <div
                            className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-500 group-hover/card:scale-110 dark:bg-primary/15"
                            style={{
                              background: 'color-mix(in srgb, var(--bg-warning) 15%, transparent)',
                            }}
                          >
                            <Users size={22} className="text-accent dark:text-primary" />
                          </div>
                          <span className="mb-1 block text-3xl font-black tracking-tight text-on-primary dark:text-main md:text-4xl">
                            5k+
                          </span>
                          <span className="text-on-primary/90 dark:text-main/40 text-micro font-black">
                            طالب فعال
                          </span>
                        </div>
                      </div>

                      <div className="group/card relative flex min-h-[180px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-sm transition-all duration-500 hover:-translate-y-1.5 dark:border-primary/15 dark:bg-white/5 md:p-8">
                        <div
                          className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/card:opacity-100 dark:bg-primary/[0.03]"
                          style={{
                            background:
                              'radial-gradient(circle at 50% 0%, color-mix(in srgb, var(--bg-primary) 6%, transparent), transparent 70%)',
                          }}
                        />
                        <div className="relative z-10">
                          <div
                            className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-500 group-hover/card:scale-110 dark:bg-primary/15"
                            style={{
                              background: 'color-mix(in srgb, var(--bg-warning) 20%, transparent)',
                            }}
                          >
                            <Target size={22} className="text-warning dark:text-primary" />
                          </div>
                          <span className="mb-1 block text-3xl font-black tracking-tight text-on-primary dark:text-main md:text-4xl">
                            97.3%
                          </span>
                          <span className="text-on-primary/90 dark:text-main/40 text-micro font-black">
                            نسبة نجاح
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  )
}
