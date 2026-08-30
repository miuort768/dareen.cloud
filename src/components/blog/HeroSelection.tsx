import { BookOpen, MessageCircle, Send, CheckCircle, Languages, ArrowLeft } from 'lucide-react'
import { directTypes, languages } from './LibraryConfig'
import type { ViewType, GridItem } from './LibraryConfig'
import { useAcademyName } from '../../context/AppContext'
import { useSettingsStore } from '../../store/settingsStore'
import { Image } from '../../shared/components/ui'

const GRID_TONES = [
  'bg-primary text-on-primary',
  'bg-success text-on-success',
  'bg-info text-on-info',
  'bg-warning text-on-warning',
  'bg-error text-on-error',
]

interface HeroSelectionProps {
  view: ViewType
  gridItems: GridItem[]
  currentTypeName: string
  currentCurriculumName: string
  setSearchParams: (fn: (prev: URLSearchParams) => URLSearchParams) => void
  isMobile?: boolean
}

export const MobileHero = ({
  view,
  gridItems,
  currentTypeName,
  currentCurriculumName,
  setSearchParams,
}: HeroSelectionProps) => {
  const academyName = useAcademyName()
  const adminPhone = useSettingsStore((s) => s.adminPhone)
  const libraryWhatsapp = useSettingsStore((s) => s.libraryWhatsapp)
  const libraryTelegram = useSettingsStore((s) => s.libraryTelegram)
  const whatsappNumber = adminPhone.replace(/\D/g, '')

  if (view === 'types') {
    return (
      <div className="pb-6">
        {/* Hero Banner */}
        <div className="relative mb-4 overflow-hidden rounded-[1.75rem] border border-divider bg-primary-deep dark:bg-card">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute start-[-30%] top-[-50%] h-[120%] w-[80%] rounded-full bg-gradient-to-br from-white/[0.04] to-transparent blur-[60px]" />
            <div className="absolute bottom-[-30%] end-[-20%] h-[100%] w-[70%] rounded-full bg-gradient-to-tl from-transparent to-transparent blur-[50px]" />
          </div>

          <div className="relative p-5">
            {/* Sponsored badge */}
            <div className="mb-4 flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 backdrop-blur-sm">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent"></span>
                </span>
                <span className="text-[10px] font-extrabold text-white/90">
                  برعاية {academyName}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <a
                  href={`https://wa.me/${libraryWhatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('السلام عليكم، أرغب في الاستفسار عن المكتبة التعليمية')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/10 transition-all active:scale-95"
                  aria-label="واتساب"
                >
                  <MessageCircle size={13} className="text-white/70" />
                </a>
                <a
                  href={
                    libraryTelegram.startsWith('http')
                      ? libraryTelegram
                      : `https://t.me/${libraryTelegram}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/10 transition-all active:scale-95"
                  aria-label="تيليجرام"
                >
                  <Send size={13} className="text-white/70" />
                </a>
              </div>
            </div>

            {/* Content */}
            <div className="min-w-0">
              <h1 className="mb-1.5 font-heading text-lg font-black leading-tight text-on-primary dark:text-main">
                مكتبة <span className="text-accent">{academyName}</span>
              </h1>
              <p className="mb-4 text-[10px] font-medium leading-relaxed text-white/50">
                دليلك الشامل للتفوق الدراسي — أحدث المناهج، مذكرات، ملخصات، وحلول الكتب لجميع
                المراحل في الكويت وقطر والإمارات والسعودية.
              </p>
              <div className="flex items-center gap-2">
                <a
                  href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('السلام عليكم، أرغب في حجز حصة تجريبية مجانية')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-[11px] font-extrabold text-on-accent shadow-[0_4px_20px_rgba(212,175,55,0.3)] transition-all hover:bg-accent-hover active:scale-[0.97]"
                >
                  حصة مجانية فردية
                </a>
                <a
                  href="#mobile-categories"
                  className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-[11px] font-extrabold text-primary-deep transition-all hover:bg-white/90 active:scale-[0.97]"
                >
                  تصفح الدورات
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Free download card */}
        <div className="mb-3 rounded-2xl border border-border bg-card p-4 shadow-elevation-1">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-success-soft">
              <CheckCircle size={15} className="text-success" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-main">تحميل مجاني بدون إعلانات</h3>
              <p className="text-[10px] font-medium text-muted">
                اختر ما تريد من كتب أو مذكرات مجاناً
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={`https://wa.me/${libraryWhatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('السلام عليكم، أريد الاستفسار عن المكتبة')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-success py-2.5 text-[11px] font-extrabold text-on-success transition-all hover:bg-success-hover active:scale-[0.97]"
            >
              <MessageCircle size={13} />
              واتساب
            </a>
            <a
              href={
                libraryTelegram.startsWith('http')
                  ? libraryTelegram
                  : `https://t.me/${libraryTelegram}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-info py-2.5 text-[11px] font-extrabold text-on-info transition-all hover:bg-info-hover active:scale-[0.97]"
            >
              <Send size={13} />
              تيليجرام
            </a>
          </div>
        </div>

        {/* Category buttons */}
        <div id="mobile-categories" className="mb-3 grid grid-cols-2 gap-2.5">
          {gridItems.map((item: GridItem, i: number) => (
            <button
              type="button"
              key={item.id}
              onClick={() => {
                setSearchParams((prev) => {
                  const next = new URLSearchParams(prev)
                  if (view === 'types') {
                    if (item.id === 'foundation') {
                      next.set('type', item.id)
                      next.set('view', 'languages')
                      ;['curriculum', 'level', 'grade', 'term', 'subject'].forEach((k) =>
                        next.delete(k),
                      )
                    } else if (directTypes.includes(item.id)) {
                      next.set('type', item.id)
                      next.set('view', 'results')
                      ;['curriculum', 'level', 'grade', 'term', 'subject'].forEach((k) =>
                        next.delete(k),
                      )
                    } else {
                      next.set('type', item.id)
                      next.set('view', 'curriculums')
                      ;['level', 'grade', 'term', 'subject'].forEach((k) => next.delete(k))
                    }
                  }
                  return next
                })
              }}
              className={`relative flex cursor-pointer flex-col items-center justify-center gap-2.5 overflow-hidden rounded-2xl p-5 shadow-sm transition-all duration-200 hover:opacity-90 active:scale-[0.97] ${
                GRID_TONES[i % GRID_TONES.length]
              }`}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20">
                <item.icon size={20} />
              </div>
              <span className="text-center text-sm font-extrabold leading-tight">{item.name}</span>
              {item.sub && (
                <span className="text-center text-[10px] font-bold opacity-75">{item.sub}</span>
              )}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // For other views (curriculums, grades, languages), show selection grid
  return (
    <div className="pb-6">
      <div className="relative mb-4 overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary via-primary-deep to-primary px-5 pb-5 pt-5 shadow-lg shadow-primary/10 dark:border-border dark:from-card dark:via-card dark:to-card">
        <div className="pointer-events-none absolute -end-10 -top-12 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <div className="bg-accent/20 pointer-events-none absolute -bottom-14 -start-10 h-32 w-32 rounded-full blur-2xl" />

        <div className="relative">
          <div className="mb-3 flex items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
              <BookOpen size={15} className="text-on-primary dark:text-main" />
            </span>
            <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-[10px] font-extrabold text-on-primary backdrop-blur-sm dark:text-main">
              {view === 'curriculums'
                ? currentTypeName
                : view === 'languages'
                  ? 'تعلم اللغة'
                  : currentCurriculumName}
            </span>
          </div>
          <h2 className="mb-1 text-lg font-black leading-tight text-on-primary dark:text-main">
            {view === 'curriculums' ? (
              <>
                اختر <span className="text-accent">المنهج</span>
              </>
            ) : view === 'languages' ? (
              <>
                اختر <span className="text-accent">اللغة</span>
              </>
            ) : (
              <>
                اختر <span className="text-accent">المرحلة</span>
              </>
            )}
          </h2>
          <p className="text-[11px] font-medium leading-relaxed text-white/70">
            {view === 'curriculums'
              ? `تصفح وتحميل ${currentTypeName} لأفضل المناهج`
              : view === 'languages'
                ? 'اختر اللغة التي تريد تعلمها'
                : `جميع ملفات ${currentCurriculumName} مرتبة ومصنفة`}
          </p>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-2.5">
        {(view === 'languages' ? languages.map((l) => ({ ...l, icon: l.icon })) : gridItems).map(
          (item: GridItem, i: number) => (
            <button
              type="button"
              key={item.id}
              onClick={() => {
                setSearchParams((prev) => {
                  const next = new URLSearchParams(prev)
                  if (view === 'curriculums') {
                    next.set('curriculum', item.id)
                    next.set('view', 'grades')
                    ;['grade', 'term', 'subject'].forEach((k) => next.delete(k))
                  } else if (view === 'languages') {
                    next.set('language', item.id)
                    next.set('view', 'language-sections')
                    ;['curriculum', 'level', 'grade', 'term', 'subject'].forEach((k) =>
                      next.delete(k),
                    )
                  } else {
                    next.set('level', item.id)
                    next.set('view', 'classrooms')
                    ;['term', 'subject'].forEach((k) => next.delete(k))
                  }
                  return next
                })
              }}
              className={`relative flex cursor-pointer flex-col items-center justify-center gap-2.5 overflow-hidden rounded-2xl p-5 shadow-sm transition-all duration-200 hover:opacity-90 active:scale-[0.97] ${
                GRID_TONES[i % GRID_TONES.length]
              }`}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20">
                <item.icon size={20} />
              </div>
              <span className="text-center text-sm font-extrabold leading-tight">{item.name}</span>
              {item.sub && (
                <span className="text-center text-[10px] font-bold opacity-75">{item.sub}</span>
              )}
            </button>
          ),
        )}
      </div>
    </div>
  )
}

export const DesktopHero = ({
  view,
  gridItems,
  currentTypeName,
  currentCurriculumName,
  setSearchParams,
}: HeroSelectionProps) => {
  const academyName = useAcademyName()
  const adminPhone = useSettingsStore((s) => s.adminPhone)
  const whatsappNumber = adminPhone.replace(/\D/g, '')

  if (view === 'types') {
    return (
      <div className="relative z-10 mx-auto max-w-[1400px] px-6 py-8 lg:px-10 lg:py-10">
        {/* Hero Section */}
        <section className="relative min-h-[420px] overflow-hidden rounded-2xl border border-divider bg-gradient-to-bl from-primary-deep via-primary to-primary-deep dark:from-card dark:via-card dark:to-card lg:rounded-none">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute start-[-15%] top-[-40%] h-[120%] w-[70%] animate-[pulse_8s_ease-in-out_infinite] rounded-full bg-gradient-to-br from-white/[0.04] to-transparent blur-[100px]" />
            <div className="absolute bottom-[-30%] end-[-10%] h-[100%] w-[60%] animate-[pulse_6s_ease-in-out_infinite_1s] rounded-full bg-gradient-to-tl from-transparent to-transparent blur-[80px]" />
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                backgroundSize: '60px 60px',
              }}
            />
          </div>

          <div className="relative grid min-h-[420px] grid-cols-1 lg:grid-cols-[1fr_380px]">
            {/* Left content */}
            <div className="relative z-10 flex flex-col justify-center p-8 lg:p-14 lg:pe-10">
              <div className="mb-6 inline-flex w-fit items-center gap-2.5 rounded-full border border-white/10 bg-white/10 px-4 py-2 backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-accent"></span>
                </span>
                <span className="text-[11px] font-extrabold tracking-wide text-white/90">
                  مركز ملفات {academyName}
                </span>
              </div>

              <h1 className="mb-5 max-w-xl font-heading text-4xl font-black leading-[1.1] text-on-primary dark:text-main xl:text-5xl 2xl:text-[3.5rem]">
                مركز ملفات
                <span className="relative mx-3 inline-block">
                  <span className="relative z-10 text-accent">{academyName}</span>
                  <span className="absolute inset-x-0 -bottom-1 -z-0 h-3 rounded-full bg-accent-soft blur-[2px]" />
                </span>
              </h1>

              <p className="mb-8 max-w-md text-sm font-medium leading-relaxed text-white/60 lg:text-base">
                دليلك الشامل للتفوق الدراسي — أحدث المناهج، مذكرات، ملخصات، وحلول الكتب لجميع
                المراحل في الكويت وقطر والإمارات والسعودية.
              </p>

              {/* Action buttons */}
              <div className="mb-8 flex items-center gap-3">
                <a
                  href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('السلام عليكم، أرغب في حجز حصة تجريبية مجانية')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-extrabold text-on-accent shadow-[0_4px_20px_rgba(212,175,55,0.3)] transition-all hover:bg-accent-hover active:scale-[0.97]"
                >
                  طلب حصة مجانية
                </a>
                <a
                  href="#library-categories"
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 px-6 py-3 text-sm font-extrabold text-white backdrop-blur-sm transition-all hover:bg-white/15 active:scale-[0.97] dark:bg-white/5"
                >
                  تصفح الدورات
                </a>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-8">
                {[
                  { label: 'مادة تعليمية', value: '١٠٠+' },
                  { label: 'منهج خليجي', value: '٦' },
                  { label: 'دولة مستهدفة', value: '٦' },
                ].map((stat, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="font-heading text-2xl font-black text-accent">
                      {stat.value}
                    </span>
                    <span className="max-w-[60px] text-[11px] font-bold leading-tight text-white/40">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right image area */}
            <div className="relative min-h-[250px] overflow-hidden lg:min-h-full">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-transparent via-white/[0.03] to-white/[0.06]" />
              <div className="pointer-events-none absolute end-[10%] top-[15%] h-56 w-56 animate-[pulse_7s_ease-in-out_infinite] rounded-full bg-accent-soft blur-[80px]" />

              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="h-[300px] w-[300px] animate-[spin_30s_linear_infinite] rounded-full border border-dashed border-white/[0.06] lg:h-[350px] lg:w-[350px]" />
                <div className="border-accent/[0.08] absolute h-[240px] w-[240px] animate-[spin_22s_linear_infinite_reverse] rounded-full border border-dashed lg:h-[290px] lg:w-[290px]" />
              </div>

              <div className="absolute inset-0 flex items-center justify-center p-8 lg:p-12">
                <div className="relative h-full w-full max-w-[300px]">
                  <Image
                    src="/bbook.webp"
                    alt={`بوابة ${academyName} التعليمية`}
                    className="absolute inset-0"
                    imgClassName="object-contain drop-shadow-[0_20px_60px_rgba(0,0,0,0.4)]"
                    withSkeleton
                  />
                </div>
              </div>

              {/* Floating cards */}
              <div className="pointer-events-none absolute start-[5%] top-[10%] animate-[float_6s_ease-in-out_infinite] rounded-2xl border border-white/10 bg-white/10 px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.15)] backdrop-blur-md">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-success-soft">
                    <CheckCircle size={14} className="text-success" />
                  </span>
                  <div>
                    <span className="block text-[11px] font-extrabold text-white">حلول معتمدة</span>
                    <span className="block text-[9px] text-white/40">١٠٠+ كتاب</span>
                  </div>
                </div>
              </div>
              <div className="pointer-events-none absolute bottom-[15%] end-[3%] animate-[float_7s_ease-in-out_infinite_1s] rounded-2xl border border-white/10 bg-white/10 px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.15)] backdrop-blur-md">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-info-soft">
                    <Languages size={14} className="text-info" />
                  </span>
                  <div>
                    <span className="block text-[11px] font-extrabold text-white">تعلم اللغة</span>
                    <span className="block text-[9px] text-white/40">٤ لغات متاحة</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom text */}
          <div className="relative border-t border-white/10 px-8 py-4">
            <p className="text-center text-[11px] font-medium text-white/40">
              نقدم تجربة تعليمية متكاملة تناسب المناهج الخليجية المختلفة | يسعدنا انضمامك إلى
              العائلة
            </p>
          </div>
        </section>

        {/* Categories Section */}
        <section id="library-categories" className="mt-14">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary-soft px-3 py-1">
                <span className="text-[10px] font-extrabold text-primary">تصفح حسب القسم</span>
              </div>
              <h2 className="font-heading text-2xl font-black text-main lg:text-3xl">
                الفئات الأكثر قراءة
              </h2>
              <p className="mt-1.5 text-sm font-medium text-muted">
                اختر القسم الذي يناسب احتياجك التعليمي
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {gridItems.map((item: GridItem, i: number) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setSearchParams((prev) => {
                    const next = new URLSearchParams(prev)
                    if (item.id === 'foundation') {
                      next.set('type', item.id)
                      next.set('view', 'languages')
                      ;['curriculum', 'level', 'grade', 'term', 'subject'].forEach((k) =>
                        next.delete(k),
                      )
                    } else if (directTypes.includes(item.id)) {
                      next.set('type', item.id)
                      next.set('view', 'results')
                      ;['curriculum', 'level', 'grade', 'term', 'subject'].forEach((k) =>
                        next.delete(k),
                      )
                    } else {
                      next.set('type', item.id)
                      next.set('view', 'curriculums')
                      ;['level', 'grade', 'term', 'subject'].forEach((k) => next.delete(k))
                    }
                    return next
                  })
                }}
                className={`group relative flex cursor-pointer items-center gap-4 overflow-hidden rounded-2xl p-5 text-start shadow-sm transition-all duration-300 hover:-translate-y-1 hover:opacity-95 hover:shadow-elevation-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 lg:rounded-none ${
                  GRID_TONES[i % GRID_TONES.length]
                }`}
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 transition-all duration-300 group-hover:scale-110">
                  <item.icon size={22} />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="mb-0.5 text-base font-extrabold">{item.name}</h3>
                  {item.sub && (
                    <p className="text-[11px] font-medium leading-relaxed opacity-75">{item.sub}</p>
                  )}
                  <span className="mt-1 inline-flex items-center gap-1.5 text-xs font-extrabold transition-all duration-300 group-hover:gap-2.5">
                    تصفح المحتوى
                    <ArrowLeft
                      size={12}
                      className="transition-transform duration-300 group-hover:-translate-x-1"
                    />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>
    )
  }

  // For other views (curriculums, grades, languages)
  return (
    <div className="mx-auto w-full">
      {/* Banner */}
      <section className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-bl from-primary-deep via-primary to-primary-deep shadow-lg shadow-primary/10 dark:border-border dark:from-card dark:via-card dark:to-card">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute start-[-15%] top-[-40%] h-[130%] w-[60%] rounded-full bg-white/[0.05] blur-[100px]" />
          <div className="bg-accent/15 absolute bottom-[-40%] end-[-10%] h-[120%] w-[50%] rounded-full blur-[100px]" />
        </div>

        <div className="relative grid grid-cols-1 items-center gap-6 px-6 py-8 md:grid-cols-[1fr_240px] lg:px-10 lg:py-10">
          <div className="text-center md:text-start">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3.5 py-1.5 backdrop-blur-sm">
              <BookOpen size={12} className="text-on-primary dark:text-main" />
              <span className="text-[11px] font-extrabold text-on-primary dark:text-main">
                {view === 'curriculums'
                  ? `تحميل ${currentTypeName}`
                  : view === 'languages'
                    ? 'تعلم اللغة'
                    : currentCurriculumName}
              </span>
            </div>

            <h1 className="mb-3 font-heading text-3xl font-black leading-tight text-on-primary dark:text-main lg:text-4xl">
              {view === 'curriculums' ? (
                <>
                  اختر <span className="text-accent">المنهج</span>
                </>
              ) : view === 'languages' ? (
                <>
                  اختر <span className="text-accent">اللغة</span>
                </>
              ) : (
                <>
                  اختر <span className="text-accent">المرحلة</span>
                </>
              )}
            </h1>
            <p className="mx-auto max-w-lg text-sm font-medium leading-relaxed text-white/60 md:mx-0 lg:text-base">
              {view === 'curriculums'
                ? `تصفح وتحميل ${currentTypeName} لأفضل المناهج التعليمية في الخليج`
                : view === 'languages'
                  ? 'اختر اللغة التي تريد تعلمها وتصفح المحتوى المتاح'
                  : `جميع ملفات ${currentCurriculumName} مرتبة ومصنفة لتسهيل الوصول`}
            </p>
          </div>

          <div className="relative hidden h-[190px] items-center justify-center md:flex">
            <div className="animate-spin-slow pointer-events-none absolute inset-[8%] rounded-full border-[1.5px] border-dashed border-white/20"></div>
            <div className="animate-reverse-spin-slow pointer-events-none absolute inset-[16%] rounded-full border-[1.5px] border-dashed border-accent-soft"></div>
            <div className="to-accent/10 pointer-events-none absolute inset-0 rounded-full bg-gradient-to-br from-white/10 blur-2xl"></div>
            <picture className="relative z-10 flex h-full w-full items-center justify-center">
              <source srcSet="/book3.webp" type="image/webp" />
              <source srcSet="/book3.avif" type="image/avif" />
              <img
                src="/book3.png"
                alt="بوابة دارين السابعة التعليمية"
                width="380"
                height="380"
                loading="lazy"
                className="h-4/5 w-4/5 object-contain drop-shadow-lg"
              />
            </picture>
          </div>
        </div>
      </section>

      {/* Selection grid */}
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-3">
        {(view === 'languages' ? languages.map((l) => ({ ...l, icon: l.icon })) : gridItems).map(
          (item: GridItem, i: number) => (
            <button
              type="button"
              key={item.id}
              onClick={() => {
                setSearchParams((prev) => {
                  const next = new URLSearchParams(prev)
                  if (view === 'curriculums') {
                    next.set('curriculum', item.id)
                    next.set('view', 'grades')
                    ;['grade', 'term', 'subject'].forEach((k) => next.delete(k))
                  } else if (view === 'languages') {
                    next.set('language', item.id)
                    next.set('view', 'language-sections')
                    ;['curriculum', 'level', 'grade', 'term', 'subject'].forEach((k) =>
                      next.delete(k),
                    )
                  } else {
                    next.set('level', item.id)
                    next.set('view', 'classrooms')
                    ;['term', 'subject'].forEach((k) => next.delete(k))
                  }
                  return next
                })
              }}
              className={`group relative flex w-full cursor-pointer items-center gap-3 overflow-hidden rounded-2xl px-4 py-4 text-start shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:opacity-95 hover:shadow-elevation-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 active:scale-[0.97] ${
                GRID_TONES[i % GRID_TONES.length]
              }`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 transition-transform duration-300 group-hover:scale-110">
                <item.icon size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-sm font-extrabold leading-tight">{item.name}</span>
                {item.sub && (
                  <span className="block text-[11px] font-medium opacity-75">{item.sub}</span>
                )}
              </div>
              <ArrowLeft
                size={14}
                className="shrink-0 opacity-60 transition-all duration-300 group-hover:opacity-100"
              />
            </button>
          ),
        )}
      </div>
    </div>
  )
}
