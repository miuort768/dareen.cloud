import { Link } from 'react-router-dom'
import { ArrowLeft, Star, MessageCircle, Users } from 'lucide-react'

interface HeroSectionProps {
  typewriterText: string
  signupNowNumber: string
  requestFreeNumber: string
  academyName: string
  bannersArray: string[]
}

export const HeroSection = ({
  typewriterText,
  signupNowNumber,
  requestFreeNumber,
  academyName,
  bannersArray,
}: HeroSectionProps) => {
  return (
    <section className="relative overflow-hidden bg-surface pb-4 pt-20 transition-colors duration-500 dark:bg-background md:pb-4 md:pt-28">
      <div className="pointer-events-none absolute end-0 top-0 h-64 w-64 rounded-full bg-accent-soft blur-[100px] dark:bg-primary/10" />
      <div className="pointer-events-none absolute bottom-0 start-0 h-48 w-48 rounded-full bg-primary/5 blur-[80px] dark:bg-primary/10" />
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary-soft via-primary-soft to-card shadow-sm dark:border-primary/30 dark:from-card dark:via-surface dark:to-card">
          <div className="flex flex-col-reverse items-center gap-2 p-6 md:p-10 lg:flex-row lg:gap-6">
            <div className="z-10 text-center lg:w-[60%]">
              <div className="mx-auto mb-4 mt-4 inline-flex items-center gap-2 rounded-full border border-primary/50 bg-white/80 px-3 py-1.5 dark:border-primary/40 dark:bg-primary/10 lg:mt-0">
                <span className="h-2 w-2 animate-pulse rounded-full bg-primary dark:bg-primary"></span>
                <span className="text-micro font-bold text-primary dark:text-primary sm:text-xs">
                  منصة تعليم عن بعد رائدة في الكويت والخليج
                </span>
              </div>
              <h1 className="relative mb-0 font-heading text-3xl font-black leading-none text-main dark:text-main sm:text-4xl lg:text-6xl">
                <span className="sr-only">
                  دارين السابعة للتعليم والتدريب عن بعد - المنصة رقم 1 للدروس الخصوصية وتحفيظ القرآن
                  في الكويت، الكويت، الإمارات، قطر وسلطنة عمان ومملكة البحرين - دروس خصوصية في
                  الدوحة والرياض ومسقط وصلالة ومنامة ومملكة البحرين
                </span>
                <span className="aria-hidden mb-0 block min-h-[1.1em]">
                  {typewriterText || '\u00A0'}
                  <span className="me-1 inline-block h-[0.9em] animate-pulse border-s-4 border-primary align-middle dark:border-primary"></span>
                </span>
                <span className="aria-hidden -mt-1 block bg-gradient-to-r from-primary to-accent bg-clip-text py-1 text-base text-transparent dark:from-warning dark:to-primary sm:text-lg lg:text-2xl">
                  للتعليم والتدريب عن بعد
                </span>
              </h1>
              <p className="dark:text-soft mx-auto mb-5 max-w-[320px] px-0 text-xs font-medium leading-normal text-muted sm:max-w-full sm:text-xs">
                أفضل منصة تعليم عن بعد في الكويت، الكويت، الإمارات، قطر وعمان والبحرين.
                <br />
                دروس خصوصية، قدرات وتحصيلي، تحفيظ القرآن، وتأسيس للمناهج الخليجية مع نخبة المعلمين.
              </p>
              <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
                <Link
                  to="/courses"
                  onClick={() => window.scrollTo(0, 0)}
                  className="group flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary px-6 py-3 text-base font-extrabold text-on-primary shadow-lg transition-all hover:-translate-y-0.5 hover:brightness-90 dark:from-primary dark:to-warning dark:text-on-primary dark:shadow-primary/20 sm:px-10 sm:py-4 sm:text-lg"
                  aria-label="تصفح الدورات التعليمية"
                >
                  <span>تصفح الدورات</span>
                  <ArrowLeft className="h-5 w-5 transition-transform group-hover:translate-x-[-4px]" />
                </Link>
                <a
                  href={`https://wa.me/${requestFreeNumber}?text=${encodeURIComponent('السلام عليكم، أرغب في حجز حصة مجانية في ' + academyName)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-center gap-3 rounded-xl bg-success px-6 py-3 text-base font-extrabold text-on-success shadow-lg transition-all hover:bg-success-dark hover:shadow-xl active:scale-[0.97] dark:bg-gradient-to-r dark:from-primary dark:to-warning dark:text-on-primary sm:px-10 sm:py-4 sm:text-lg"
                  aria-label="حجز حصة مجانية عبر واتساب"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>حجز حصة مجانية</span>
                  <ArrowLeft className="h-5 w-5 transition-transform group-hover:translate-x-[-4px]" />
                </a>
              </div>
              <div className="mt-4 flex items-center justify-center gap-6 border-t border-border pt-4 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft dark:bg-primary/20">
                    <Users className="h-5 w-5 text-primary dark:text-primary" />
                  </div>
                  <div className="-ms-4 flex h-10 w-10 items-center justify-center rounded-full border-2 border-surface bg-success-light dark:border-background dark:bg-primary/20">
                    <span className="text-xs font-black text-success dark:text-primary">+2k</span>
                  </div>
                </div>
                <div className="text-start">
                  <div className="flex items-center gap-1 font-bold text-main dark:text-main">
                    4.9/5
                    <Star className="h-4 w-4 fill-warning text-warning dark:fill-primary dark:text-primary" />
                  </div>
                  <p className="text-xs font-medium text-muted dark:text-muted">
                    تقييم الطلاب وأولياء الأمور
                  </p>
                </div>
              </div>
            </div>
            <div className="relative z-10 flex justify-center lg:mb-0 lg:w-[40%]">
              <div className="relative flex aspect-auto w-full max-w-[220px] items-center justify-center lg:aspect-[4/5] lg:max-w-[375px]">
                <div className="animate-spin-slow pointer-events-none absolute inset-[2%] rounded-full border-[1px] border-dashed border-primary/40 dark:border-primary/40"></div>
                <div className="animate-reverse-spin-slow pointer-events-none absolute inset-[4%] rounded-full border-[1px] border-dashed border-accent-soft dark:border-warning-soft"></div>

                <div className="absolute inset-0 animate-pulse rounded-[3rem] bg-gradient-to-br from-primary/20 to-accent-soft blur-2xl dark:from-primary/20 dark:to-transparent"></div>
                <picture>
                  <source srcSet="/hero-child.webp" type="image/webp" />
                  <source srcSet="/hero-child.avif" type="image/avif" />
                  <img
                    src="/hero-child.png"
                    alt="طفل يدرس على منصة دارين السابعة"
                    width="490"
                    height="490"
                    className="relative z-20 h-auto w-full object-contain drop-shadow-2xl filter lg:h-full"
                    fetchPriority="high"
                    decoding="async"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1000&auto=format&fit=crop'
                    }}
                  />
                </picture>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-3 hidden max-w-6xl grid-cols-4 gap-2 md:grid">
          {bannersArray.slice(0, 4).map((text, idx) =>
            text ? (
              <div
                key={idx}
                className="group flex items-center justify-between gap-1 rounded-2xl border border-border bg-surface p-2 shadow-sm transition-all hover:shadow-md dark:border-primary/20 dark:bg-card"
              >
                <p className="dark:text-soft flex-1 text-micro font-black leading-tight text-main lg:text-xs">
                  {text}
                </p>
                <a
                  href={`https://wa.me/${signupNowNumber.replace(/\D/g, '')}?text=${encodeURIComponent('السلام عليكم، ' + text)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`سجل الآن: ${text}`}
                  className="shrink-0 whitespace-nowrap rounded-xl bg-primary px-2.5 py-1 text-micro font-extrabold text-on-primary shadow-sm transition-all hover:brightness-90 dark:bg-gradient-to-r dark:from-primary dark:to-warning dark:text-on-primary lg:text-micro"
                >
                  سجل الآن
                </a>
              </div>
            ) : null,
          )}
        </div>
      </div>
    </section>
  )
}
