import { useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  CheckCircle,
  FileText,
  AlignLeft,
  Search,
  Clock,
  Mail,
  Send,
  ArrowLeft,
  BookMarked,
  CheckCircle2,
  GraduationCap,
  Globe,
  Phone,
  ChevronDown,
  Languages,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Image } from '../../shared/components/ui'
import { cn } from '../../lib/utils'
import { api } from '../../lib/api'
import { useAcademyName } from '../../context/AppContext'
import { types, directTypes, curriculums, languages } from './LibraryConfig'
import { AdBanner } from './AdBanner'
import { BLOG_COUNTRIES, normalizePhoneInput } from './blogCustomers'
import type { BlogPost } from '../../data/blogPosts'

type TypeId = 'foundation' | 'solutions' | 'notes' | 'more'

interface TypeStyle {
  desc: string
  miniDesc: string
  badge: string
  iconWrap: string
  iconColor: string
  dot: string
  gradient: string
  linkColor: string
  countColor: string
  cardBg: string
  cardBorder: string
}

const TYPE_ICONS: Record<TypeId, LucideIcon> = {
  foundation: Languages,
  solutions: CheckCircle,
  notes: FileText,
  more: AlignLeft,
}

const TYPE_STYLES: Record<TypeId, TypeStyle> = {
  foundation: {
    desc: 'تعلم اللغات بأساليب متنوعة وتفاعلية',
    miniDesc: 'لغات متعددة للتعلم الذاتي',
    badge: 'bg-warning text-on-warning',
    iconWrap: 'bg-warning-soft',
    iconColor: 'text-warning',
    dot: 'bg-warning',
    gradient: 'from-warning-soft to-transparent',
    linkColor: 'text-warning',
    countColor: 'text-warning',
    cardBg: 'bg-card',
    cardBorder: 'border-border hover:border-warning',
  },
  solutions: {
    desc: 'حلول كاملة وموثوقة لكتب المناهج',
    miniDesc: 'حلول معتمدة لجميع الكتب',
    badge: 'bg-success text-on-success',
    iconWrap: 'bg-success-soft',
    iconColor: 'text-success',
    dot: 'bg-success',
    gradient: 'from-success-soft to-transparent',
    linkColor: 'text-success',
    countColor: 'text-success',
    cardBg: 'bg-card',
    cardBorder: 'border-border hover:border-success',
  },
  notes: {
    desc: 'مذكرات وملخصات جاهزة للتحميل المباشر',
    miniDesc: 'ملخصات منظمة للمذاكرة',
    badge: 'bg-info text-on-info',
    iconWrap: 'bg-info-soft',
    iconColor: 'text-info',
    dot: 'bg-info',
    gradient: 'from-info-soft to-transparent',
    linkColor: 'text-info',
    countColor: 'text-info',
    cardBg: 'bg-card',
    cardBorder: 'border-border hover:border-info',
  },
  more: {
    desc: 'مزيد من الموارد والأدوات التعليمية المتنوعة',
    miniDesc: 'موارد تعليمية إضافية',
    badge: 'bg-primary text-on-primary',
    iconWrap: 'bg-primary-soft',
    iconColor: 'text-primary',
    dot: 'bg-primary',
    gradient: 'from-primary/5 to-transparent',
    linkColor: 'text-primary',
    countColor: 'text-primary',
    cardBg: 'bg-card',
    cardBorder: 'border-border hover:border-primary/40',
  },
}

const FALLBACK_STYLE: TypeStyle = {
  desc: '',
  miniDesc: '',
  badge: 'bg-primary text-on-primary',
  iconWrap: 'bg-primary-soft',
  iconColor: 'text-primary',
  dot: 'bg-primary',
  gradient: 'from-primary/5 to-transparent',
  linkColor: 'text-primary',
  countColor: 'text-primary',
  cardBg: 'bg-card',
  cardBorder: 'border-border hover:border-primary/40',
}

const getStyleFor = (post: BlogPost) => {
  const ct = (post.contentType || '') as TypeId
  const style = TYPE_STYLES[ct]
  if (style)
    return { style, label: types.find((t) => t.id === ct)?.name || ct, icon: TYPE_ICONS[ct] }
  return { style: FALLBACK_STYLE, label: post.category || 'مقالة', icon: FileText }
}

const formatDate = (date?: string) => {
  if (!date) return ''
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
}

interface DesktopLibraryLandingProps {
  posts: BlogPost[]
  loading: boolean
  setSearchParams: (fn: (prev: URLSearchParams) => URLSearchParams) => void
}

export const DesktopLibraryLanding = ({
  posts,
  loading,
  setSearchParams,
}: DesktopLibraryLandingProps) => {
  const academyName = useAcademyName()
  const [search, setSearch] = useState('')
  const [country, setCountry] = useState('')
  const [phone, setPhone] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [subscribeError, setSubscribeError] = useState<string | null>(null)

  const goToType = (id: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (id === 'foundation') {
        next.set('type', id)
        next.set('view', 'languages')
        ;['curriculum', 'level', 'grade', 'term', 'subject'].forEach((k) => next.delete(k))
      } else if (directTypes.includes(id)) {
        next.set('type', id)
        next.set('view', 'results')
        ;['curriculum', 'level', 'grade', 'term', 'subject'].forEach((k) => next.delete(k))
      } else {
        next.set('type', id)
        next.set('view', 'curriculums')
        ;['level', 'grade', 'term', 'subject'].forEach((k) => next.delete(k))
      }
      return next
    })
  }

  const latestPosts = useMemo(() => {
    return [...posts].sort(
      (a, b) => new Date(b.date || '').getTime() - new Date(a.date || '').getTime(),
    )
  }, [posts])

  const searchQuery = search.trim().toLowerCase()
  const articles = useMemo(() => {
    const source = searchQuery ? posts : latestPosts
    return source
      .filter((p) => {
        if (!searchQuery) return true
        const typeName = types.find((t) => t.id === p.contentType)?.name || ''
        const haystack = [p.title, p.excerpt, p.category, p.keywords, typeName]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        return haystack.includes(searchQuery)
      })
      .slice(0, 6)
  }, [posts, latestPosts, searchQuery])

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { foundation: 0, solutions: 0, notes: 0, more: 0 }
    posts.forEach((p) => {
      const ct = p.contentType || ''
      if (counts[ct] !== undefined) {
        counts[ct] += 1
      } else {
        const cat = (p.category || '').toLowerCase()
        if (cat.includes('حل')) counts.solutions += 1
        else if (cat.includes('مذكر')) counts.notes += 1
        else if (cat.includes('网小编')) counts.foundation += 1
        else counts.more += 1
      }
    })
    return counts
  }, [posts])

  const handleSubscribe = async (e: FormEvent) => {
    e.preventDefault()
    if (!country || !phone.trim()) return
    setSubmitting(true)
    setSubscribeError(null)
    try {
      await api.post('/blog-customers', { country, phone: phone.trim() })
      setSubscribed(true)
    } catch (err) {
      setSubscribeError(err instanceof Error ? err.message : 'حدث خطأ ما، حاول مرة أخرى')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative z-10 mx-auto max-w-[1400px] px-6 py-8 lg:px-10 lg:py-10">
      {/* ===== TOP HEADING ===== */}
      <section className="mb-5 text-center">
        <h1 className="mb-3 font-heading text-3xl font-black text-main lg:text-4xl">
          مركز ملفات <span className="text-primary">{academyName}</span>
        </h1>
        <p className="mx-auto max-w-lg text-[13px] font-medium leading-relaxed text-muted lg:text-sm">
          دليلك الشامل للتفوق الدراسي — أحدث المناهج، مذكرات، ملخصات، وحلول الكتب لجميع المراحل في
          الكويت وقطر والإمارات والسعودية.
        </p>
      </section>

      <AdBanner slot="belowTypesHero" className="mb-8" />

      {/* ===== MOST READ FILES ===== */}
      <section className="mb-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary-soft px-3 py-1">
              <span className="text-[10px] font-extrabold text-primary">الأكثر قراءة</span>
            </div>
            <h2 className="font-heading text-2xl font-black text-main lg:text-3xl">
              الملفات الأكثر قراءة
            </h2>
            <p className="mt-1.5 text-sm font-medium text-muted">
              اختر القسم الذي يناسب احتياجك التعليمي
            </p>
          </div>
        </div>

        {/* Category cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {types.map((t) => {
            const s = TYPE_STYLES[t.id as TypeId]
            const count = categoryCounts[t.id] || 0
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => goToType(t.id)}
                className={cn(
                  'group relative overflow-hidden rounded-2xl border bg-card p-5 text-start transition-all duration-300 lg:rounded-none',
                  'cursor-pointer hover:-translate-y-1 hover:shadow-elevation-3',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2',
                  s.cardBorder,
                )}
              >
                <div
                  className={cn(
                    'absolute bottom-0 end-0 top-0 w-1 rounded-l-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100',
                    s.dot,
                  )}
                />
                <div
                  className={cn(
                    'absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100',
                    s.gradient,
                  )}
                />
                <div className="relative z-10">
                  <div className="mb-3 flex items-center justify-between">
                    <span
                      className={cn(
                        'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-elevation-3',
                        s.iconWrap,
                      )}
                    >
                      <t.icon size={22} className={s.iconColor} />
                    </span>
                    <span
                      className={cn('rounded-lg px-2.5 py-1 text-[11px] font-extrabold', s.badge)}
                    >
                      {count} مقال
                    </span>
                  </div>
                  <h3 className="mb-1 text-base font-extrabold text-main transition-colors duration-300 group-hover:text-primary">
                    {t.name}
                  </h3>
                  <p className="mb-3 text-[11px] font-medium leading-relaxed text-muted">
                    {s.miniDesc}
                  </p>
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 text-xs font-extrabold transition-all duration-300 group-hover:gap-2.5',
                      s.linkColor,
                    )}
                  >
                    تصفح المقالات
                    <ArrowLeft
                      size={12}
                      className="transition-transform duration-300 group-hover:-translate-x-1"
                    />
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {/* ===== SEARCH BAR ===== */}
      <section className="mb-6">
        <div className="rounded-2xl border border-primary/15 bg-primary-soft p-5 shadow-elevation-1 dark:bg-primary/5 lg:rounded-none">
          <div className="flex items-center gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-on-primary">
              <Search size={18} />
            </span>
            <div className="relative flex-1">
              <Search
                size={15}
                className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث عن مادة، كتاب، أو ملزمة..."
                aria-label="البحث في المقالات"
                className="w-full rounded-xl border border-border bg-card py-3 pe-4 ps-10 text-sm text-main outline-none transition-all placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-focus dark:border-white/15 dark:bg-white/5"
              />
            </div>
          </div>
        </div>
      </section>

      <AdBanner slot="belowSearch" className="mb-6" />

      {/* ===== ARTICLES + SIDEBAR ===== */}
      <section className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-5">
          {/* Popular Categories */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-elevation-1 lg:rounded-none">
            <h3 className="mb-4 flex items-center gap-2.5 text-sm font-extrabold text-main">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <BookMarked size={15} />
              </span>
              الأقسام
            </h3>
            <ul className="space-y-1">
              {types.map((t) => {
                const s = TYPE_STYLES[t.id as TypeId]
                const count = categoryCounts[t.id] || 0
                return (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => goToType(t.id)}
                      className="group flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                    >
                      <span className="flex min-w-0 items-center gap-2.5">
                        <span
                          className={cn(
                            'h-2 w-2 shrink-0 rounded-full transition-transform duration-200 group-hover:scale-125',
                            s.dot,
                          )}
                        />
                        <span className="truncate text-sm font-bold text-main transition-colors group-hover:text-primary">
                          {t.name}
                        </span>
                      </span>
                      <span
                        className={cn(
                          'shrink-0 rounded-lg bg-surface px-2 py-0.5 text-[11px] font-extrabold transition-colors',
                          s.countColor,
                        )}
                      >
                        {count}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="relative overflow-hidden rounded-2xl">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-bl from-primary-deep via-primary to-primary-deep dark:from-card dark:via-card dark:to-card" />
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />

            <div className="relative p-5">
              <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white">
                <Mail size={18} />
              </span>
              <h3 className="mb-1 text-sm font-extrabold text-on-primary dark:text-main">
                اشترك في النشرة التعليمية
              </h3>
              <p className="mb-4 text-[11px] font-medium leading-relaxed text-white/50">
                ليصلك جديد الكتب والمذكرات مباشرة على هاتفك.
              </p>
              {subscribed ? (
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-3">
                  <CheckCircle2 size={15} className="shrink-0 text-success" />
                  <span className="text-xs font-bold text-white">تم التسجيل بنجاح!</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-2.5">
                  <div>
                    <label
                      className="mb-1 block text-[10px] font-bold text-white/40"
                      htmlFor="newsletter-country-d"
                    >
                      الدولة
                    </label>
                    <div className="relative">
                      <Globe
                        size={13}
                        className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-white/30"
                      />
                      <select
                        id="newsletter-country-d"
                        required
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full appearance-none rounded-xl border border-white/10 bg-white/[0.07] py-2.5 pe-9 ps-8 text-sm text-white outline-none transition-all placeholder:text-white/30 focus:border-accent focus:ring-2 focus:ring-accent-soft"
                      >
                        <option value="" disabled className="text-main">
                          اختر الدولة
                        </option>
                        {BLOG_COUNTRIES.map((c) => (
                          <option key={c} value={c} className="text-main">
                            {c}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={13}
                        className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-white/30"
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      className="mb-1 block text-[10px] font-bold text-white/40"
                      htmlFor="newsletter-phone-d"
                    >
                      رقم الهاتف
                    </label>
                    <div className="relative">
                      <Phone
                        size={13}
                        className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-white/30"
                      />
                      <input
                        id="newsletter-phone-d"
                        type="tel"
                        required
                        dir="ltr"
                        inputMode="tel"
                        value={phone}
                        onChange={(e) => setPhone(normalizePhoneInput(e.target.value))}
                        placeholder="5xxxxxxxx"
                        className="w-full rounded-xl border border-white/10 bg-white/[0.07] py-2.5 pe-4 ps-8 text-sm text-white outline-none transition-all placeholder:text-white/30 focus:border-accent focus:ring-2 focus:ring-accent-soft"
                      />
                    </div>
                  </div>
                  {subscribeError && (
                    <p className="text-xs font-bold text-error">{subscribeError}</p>
                  )}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-2.5 text-sm font-extrabold text-on-accent transition-all duration-300 hover:bg-accent-hover hover:shadow-[0_4px_20px_rgba(212,175,55,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary-deep disabled:opacity-50"
                  >
                    {submitting ? 'جارٍ الإرسال...' : 'انضم مجاناً'}
                    {!submitting && <Send size={13} />}
                  </button>
                </form>
              )}
            </div>
          </div>
        </aside>

        {/* Articles */}
        <div className="min-w-0">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary-soft px-3 py-1">
                <span className="text-[10px] font-extrabold text-primary">آخر ما نُشر</span>
              </div>
              <h2 className="font-heading text-2xl font-black text-main lg:text-3xl">
                أحدث المقالات
              </h2>
              <p className="mt-1.5 text-sm font-medium text-muted">
                {searchQuery
                  ? `نتائج البحث عن «${search.trim()}»`
                  : 'تصفح أحدث ما نُشر في المكتبة التعليمية'}
              </p>
            </div>
            <span className="hidden items-center gap-2 text-sm font-bold text-muted sm:inline-flex">
              <GraduationCap size={16} className="text-primary" />
              {posts.length} مقال
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="overflow-hidden rounded-2xl border border-border bg-card">
                  <div className="aspect-[16/10] animate-pulse bg-surface" />
                  <div className="space-y-3 p-5">
                    <div className="h-4 w-3/4 animate-pulse rounded-lg bg-surface" />
                    <div className="h-3 w-full animate-pulse rounded-lg bg-surface" />
                    <div className="h-3 w-1/2 animate-pulse rounded-lg bg-surface" />
                  </div>
                </div>
              ))}
            </div>
          ) : articles.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-14 text-center shadow-elevation-1">
              <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                <Search size={24} />
              </span>
              <h3 className="mb-1 text-base font-extrabold text-main">لا توجد نتائج</h3>
              <p className="text-sm font-medium text-muted">
                جرّب كلمات بحث مختلفة أو تصفح الأقسام بالأسفل.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {articles.map((post) => {
                const { style, label, icon: Icon } = getStyleFor(post)
                return (
                  <Link
                    key={post.id}
                    to={`/books/${post.slug}`}
                    className="group relative flex gap-4 overflow-hidden rounded-2xl border border-border bg-card p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-elevation-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 lg:rounded-none"
                  >
                    <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-l from-transparent via-primary/0 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-surface">
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        className="absolute inset-0"
                        imgClassName="object-cover transition-transform duration-500 group-hover:scale-105"
                        withSkeleton
                      />
                      <span
                        className={cn(
                          'absolute end-2 top-2 inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[9px] font-extrabold',
                          style.badge,
                        )}
                      >
                        <Icon size={9} />
                        {label}
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <h3 className="mb-1.5 line-clamp-2 text-sm font-extrabold leading-snug text-main transition-colors duration-300 group-hover:text-primary">
                        {post.title}
                      </h3>
                      <p className="mb-3 line-clamp-3 text-[11px] font-medium leading-relaxed text-muted">
                        {post.excerpt}
                      </p>
                      <div className="mt-auto flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-muted">
                          <Clock size={11} />
                          {formatDate(post.date)}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-[11px] font-extrabold text-on-primary transition-all duration-300 hover:bg-primary-hover group-hover:gap-1.5 group-hover:shadow-elevation-2">
                          اقرأ المقال
                          <ArrowLeft
                            size={11}
                            className="transition-transform duration-300 group-hover:-translate-x-0.5"
                          />
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* ===== LANGUAGE SECTIONS ===== */}
      <section className="mt-14">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-warning-soft bg-warning-soft px-3 py-1">
              <Languages size={12} className="text-warning" />
              <span className="text-[10px] font-extrabold text-warning">تعلم بمفردك</span>
            </div>
            <h2 className="font-heading text-2xl font-black text-main lg:text-3xl">
              أقسام تعلم اللغة
            </h2>
            <p className="mt-1.5 text-sm font-medium text-muted">اختر اللغة التي تريد تعلمها</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {languages.map((lang) => (
            <button
              key={lang.id}
              type="button"
              onClick={() => {
                setSearchParams((prev) => {
                  const next = new URLSearchParams(prev)
                  next.set('type', 'foundation')
                  next.set('language', lang.id)
                  next.set('view', 'language-sections')
                  ;['curriculum', 'level', 'grade', 'term', 'subject'].forEach((k) =>
                    next.delete(k),
                  )
                  return next
                })
              }}
              className="group relative cursor-pointer overflow-hidden rounded-2xl border border-border bg-card p-5 text-start transition-all duration-300 hover:-translate-y-1 hover:border-warning hover:shadow-elevation-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 lg:rounded-none"
            >
              <div className="absolute bottom-0 end-0 top-0 w-1 rounded-l-xl bg-warning opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="absolute inset-0 bg-gradient-to-br from-warning-soft to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative z-10">
                <div className="mb-3 flex items-center justify-between">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-warning-soft transition-all duration-300 group-hover:scale-110 group-hover:shadow-elevation-3">
                    <Globe size={22} className="text-warning" />
                  </span>
                </div>
                <h3 className="mb-1 text-base font-extrabold text-main transition-colors duration-300 group-hover:text-warning">
                  {lang.name}
                </h3>
                <p className="mb-3 text-[11px] font-medium leading-relaxed text-muted">
                  {lang.sub}
                </p>
                <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-warning transition-all duration-300 group-hover:gap-2.5">
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

      {/* ===== BOOK SOLUTIONS & NOTES BY CURRICULUM ===== */}
      <section className="mt-14">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-success-soft bg-success-soft px-3 py-1">
              <CheckCircle size={12} className="text-success" />
              <span className="text-[10px] font-extrabold text-success">حلول الكتب والمذكرات</span>
            </div>
            <h2 className="font-heading text-2xl font-black text-main lg:text-3xl">
              حسب المنهج الدراسي
            </h2>
            <p className="mt-1.5 text-sm font-medium text-muted">
              اختر المنهج الخاص بك للوصول للمحتوى
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {curriculums.map((curr) => (
            <button
              key={curr.id}
              type="button"
              onClick={() => {
                setSearchParams((prev) => {
                  const next = new URLSearchParams(prev)
                  next.set('curriculum', curr.id)
                  next.set('view', 'grades')
                  ;['grade', 'term', 'subject'].forEach((k) => next.delete(k))
                  return next
                })
              }}
              className="group relative cursor-pointer overflow-hidden rounded-2xl border border-border bg-card p-5 text-start transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-elevation-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 lg:rounded-none"
            >
              <div className="absolute bottom-0 end-0 top-0 w-1 rounded-l-xl bg-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative z-10">
                <div className="mb-3 flex items-center justify-between">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft transition-all duration-300 group-hover:scale-110 group-hover:shadow-elevation-3">
                    <curr.icon size={22} className="text-primary" />
                  </span>
                </div>
                <h3 className="mb-1 text-base font-extrabold text-main transition-colors duration-300 group-hover:text-primary">
                  {curr.name}
                </h3>
                <div className="mt-2 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-md bg-success-soft px-2 py-0.5 text-[10px] font-extrabold text-success">
                    حلول الكتب
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-info-soft px-2 py-0.5 text-[10px] font-extrabold text-info">
                    المذكرات
                  </span>
                </div>
                <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-extrabold text-primary transition-all duration-300 group-hover:gap-2.5">
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
