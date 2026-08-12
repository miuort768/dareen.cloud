import { useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle, FileText, AlignLeft, Search, Clock,
  Mail, Send, ArrowLeft, BookMarked, CheckCircle2, GraduationCap, Globe, Phone, ChevronDown,
  Languages,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Image } from '../../shared/components/ui';
import { cn } from '../../lib/utils';
import { api } from '../../lib/api';
import { useAcademyName } from '../../context/AppContext';
import { types, directTypes, curriculums, languages } from './LibraryConfig';
import { BLOG_COUNTRIES, normalizePhoneInput } from './blogCustomers';
import type { BlogPost } from '../../data/blogPosts';

type TypeId = 'foundation' | 'solutions' | 'notes' | 'more';

interface TypeStyle {
  desc: string;
  miniDesc: string;
  badge: string;
  iconWrap: string;
  iconColor: string;
  dot: string;
  gradient: string;
  linkColor: string;
  countColor: string;
  cardBg: string;
  cardBorder: string;
}

const TYPE_ICONS: Record<TypeId, LucideIcon> = {
  foundation: Languages,
  solutions: CheckCircle,
  notes: FileText,
  more: AlignLeft,
};

const TYPE_STYLES: Record<TypeId, TypeStyle> = {
  foundation: {
    desc: 'تعلم اللغات بأساليب متنوعة وتفاعلية',
    miniDesc: 'لغات متعددة للتعلم الذاتي',
    badge: 'bg-warning text-on-warning',
    iconWrap: 'bg-warning-soft',
    iconColor: 'text-warning',
    dot: 'bg-warning',
    gradient: 'from-warning/5 to-transparent',
    linkColor: 'text-warning',
    countColor: 'text-warning',
    cardBg: 'bg-card',
    cardBorder: 'border-border hover:border-warning/40',
  },
  solutions: {
    desc: 'حلول كاملة وموثوقة لكتب المناهج',
    miniDesc: 'حلول معتمدة لجميع الكتب',
    badge: 'bg-success text-on-success',
    iconWrap: 'bg-success-soft',
    iconColor: 'text-success',
    dot: 'bg-success',
    gradient: 'from-success/5 to-transparent',
    linkColor: 'text-success',
    countColor: 'text-success',
    cardBg: 'bg-card',
    cardBorder: 'border-border hover:border-success/40',
  },
  notes: {
    desc: 'مذكرات وملخصات جاهزة للتحميل المباشر',
    miniDesc: 'ملخصات منظمة للمذاكرة',
    badge: 'bg-info text-on-info',
    iconWrap: 'bg-info-soft',
    iconColor: 'text-info',
    dot: 'bg-info',
    gradient: 'from-info/5 to-transparent',
    linkColor: 'text-info',
    countColor: 'text-info',
    cardBg: 'bg-card',
    cardBorder: 'border-border hover:border-info/40',
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
};

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
};

const getStyleFor = (post: BlogPost) => {
  const ct = (post.contentType || '') as TypeId;
  const style = TYPE_STYLES[ct];
  if (style) return { style, label: types.find(t => t.id === ct)?.name || ct, icon: TYPE_ICONS[ct] };
  return { style: FALLBACK_STYLE, label: post.category || 'مقالة', icon: FileText };
};

const formatDate = (date?: string) => {
  if (!date) return '';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
};

interface DesktopLibraryLandingProps {
  posts: BlogPost[];
  loading: boolean;
  setSearchParams: (fn: (prev: URLSearchParams) => URLSearchParams) => void;
}

export const DesktopLibraryLanding = ({ posts, loading, setSearchParams }: DesktopLibraryLandingProps) => {
  const academyName = useAcademyName();
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('');
  const [phone, setPhone] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [subscribeError, setSubscribeError] = useState<string | null>(null);

  const goToType = (id: string) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (id === 'foundation') {
        next.set('type', id);
        next.set('view', 'languages');
        ['curriculum', 'level', 'grade', 'term', 'subject'].forEach(k => next.delete(k));
      } else if (directTypes.includes(id)) {
        next.set('type', id);
        next.set('view', 'results');
        ['curriculum', 'level', 'grade', 'term', 'subject'].forEach(k => next.delete(k));
      } else {
        next.set('type', id);
        next.set('view', 'curriculums');
        ['level', 'grade', 'term', 'subject'].forEach(k => next.delete(k));
      }
      return next;
    });
  };

  const latestPosts = useMemo(() => {
    return [...posts].sort((a, b) => new Date(b.date || '').getTime() - new Date(a.date || '').getTime());
  }, [posts]);

  const searchQuery = search.trim().toLowerCase();
  const articles = useMemo(() => {
    const source = searchQuery ? posts : latestPosts;
    return source
      .filter(p => {
        if (!searchQuery) return true;
        const typeName = types.find(t => t.id === p.contentType)?.name || '';
        const haystack = [p.title, p.excerpt, p.category, p.keywords, typeName]
          .filter(Boolean).join(' ').toLowerCase();
        return haystack.includes(searchQuery);
      })
      .slice(0, 6);
  }, [posts, latestPosts, searchQuery]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { foundation: 0, solutions: 0, notes: 0, more: 0 };
    posts.forEach(p => {
      const ct = p.contentType || '';
      if (counts[ct] !== undefined) {
        counts[ct] += 1;
      } else {
        const cat = (p.category || '').toLowerCase();
        if (cat.includes('حل')) counts.solutions += 1;
        else if (cat.includes('مذكر')) counts.notes += 1;
        else if (cat.includes('网小编')) counts.foundation += 1;
        else counts.more += 1;
      }
    });
    return counts;
  }, [posts]);

  const handleSubscribe = async (e: FormEvent) => {
    e.preventDefault();
    if (!country || !phone.trim()) return;
    setSubmitting(true);
    setSubscribeError(null);
    try {
      await api.post('/blog-customers', { country, phone: phone.trim() });
      setSubscribed(true);
    } catch (err) {
      setSubscribeError(err instanceof Error ? err.message : 'حدث خطأ ما، حاول مرة أخرى');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative z-10 mx-auto max-w-[1400px] px-6 lg:px-10 py-8 lg:py-10">

      {/* ===== TOP HEADING ===== */}
      <section className="mb-5 text-center">
        <h1 className="text-3xl lg:text-4xl font-heading font-black text-main mb-3">
          مركز ملفات <span className="text-primary">{academyName}</span> السابعة
        </h1>
        <p className="text-sm lg:text-base text-muted font-medium max-w-lg mx-auto leading-relaxed">
          دليلك الشامل للتفوق الدراسي — أحدث المناهج، مذكرات، ملخصات، وحلول الكتب لجميع المراحل في الكويت وقطر والإمارات والسعودية.
        </p>
      </section>

      {/* ===== MOST READ FILES ===== */}
      <section className="mb-8">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-soft border border-primary/10 rounded-full mb-3">
              <span className="text-[10px] font-extrabold text-primary">الأكثر قراءة</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-heading font-black text-main">الملفات الأكثر قراءة</h2>
            <p className="text-sm text-muted font-medium mt-1.5">اختر القسم الذي يناسب احتياجك التعليمي</p>
          </div>
        </div>

        {/* Category cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {types.map(t => {
            const s = TYPE_STYLES[t.id as TypeId];
            const count = categoryCounts[t.id] || 0;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => goToType(t.id)}
                className={cn(
                  'group relative overflow-hidden rounded-2xl lg:rounded-none border bg-card p-5 text-start transition-all duration-300',
                  'hover:-translate-y-1 hover:shadow-elevation-3',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2',
                  s.cardBorder
                )}
              >
                <div className={cn('absolute top-0 bottom-0 end-0 w-1 rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300', s.dot)} />
                <div className={cn('absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300', s.gradient)} />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <span className={cn('w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg', s.iconWrap)}>
                      <t.icon size={22} className={s.iconColor} />
                    </span>
                    <span className={cn('text-[11px] font-extrabold rounded-lg px-2.5 py-1', s.badge)}>
                      {count} مقال
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-main group-hover:text-primary transition-colors duration-300 mb-1">{t.name}</h3>
                  <p className="text-[11px] text-muted font-medium leading-relaxed mb-3">{s.miniDesc}</p>
                  <span className={cn('inline-flex items-center gap-1.5 text-xs font-extrabold transition-all duration-300 group-hover:gap-2.5', s.linkColor)}>
                    تصفح المقالات
                    <ArrowLeft size={12} className="transition-transform duration-300 group-hover:-translate-x-1" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ===== SEARCH BAR ===== */}
      <section className="mb-6">
        <div className="rounded-2xl lg:rounded-none border border-border dark:border-white/15 bg-card dark:bg-[#181b20] p-5 shadow-elevation-1">
          <div className="flex items-center gap-4">
            <span className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center shrink-0">
              <Search size={18} />
            </span>
            <div className="relative flex-1">
              <Search size={15} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
              <input
                type="search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="ابحث عن مادة، كتاب، أو ملزمة..."
                aria-label="البحث في المقالات"
                className="w-full rounded-xl border border-border dark:border-white/20 bg-surface dark:bg-white/5 ps-10 pe-4 py-3 text-sm text-main placeholder:text-muted outline-none transition-all focus:border-primary focus:ring-2 focus:ring-focus"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===== ARTICLES + SIDEBAR ===== */}
      <section className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8 items-start">
        <aside className="space-y-5">
          {/* Popular Categories */}
          <div className="rounded-2xl lg:rounded-none border border-border bg-card p-5 shadow-elevation-1">
            <h3 className="flex items-center gap-2.5 text-sm font-extrabold text-main mb-4">
              <span className="w-8 h-8 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
                <BookMarked size={15} />
              </span>
              الأقسام
            </h3>
            <ul className="space-y-1">
              {types.map(t => {
                const s = TYPE_STYLES[t.id as TypeId];
                const count = categoryCounts[t.id] || 0;
                return (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => goToType(t.id)}
                      className="w-full flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 hover:bg-surface group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                    >
                      <span className="flex items-center gap-2.5 min-w-0">
                        <span className={cn('w-2 h-2 shrink-0 rounded-full transition-transform duration-200 group-hover:scale-125', s.dot)} />
                        <span className="text-sm font-bold text-main group-hover:text-primary transition-colors truncate">{t.name}</span>
                      </span>
                      <span className={cn('shrink-0 text-[11px] font-extrabold rounded-lg bg-surface px-2 py-0.5 transition-colors', s.countColor)}>
                        {count}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="rounded-2xl lg:rounded-none overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-bl from-primary-deep via-primary to-primary-deep dark:from-card dark:via-card dark:to-card pointer-events-none" />
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

            <div className="relative p-5">
              <span className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center mb-3">
                <Mail size={18} />
              </span>
              <h3 className="text-sm font-extrabold text-white mb-1">اشترك في النشرة التعليمية</h3>
              <p className="text-[11px] text-white/50 font-medium leading-relaxed mb-4">
                ليصلك جديد الكتب والمذكرات مباشرة على هاتفك.
              </p>
              {subscribed ? (
                <div className="flex items-center gap-2 rounded-xl bg-white/10 border border-white/10 px-4 py-3">
                  <CheckCircle2 size={15} className="text-success shrink-0" />
                  <span className="text-xs font-bold text-white">تم التسجيل بنجاح!</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-white/40 mb-1" htmlFor="newsletter-country-d">الدولة</label>
                    <div className="relative">
                      <Globe size={13} className="absolute start-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                      <select
                        id="newsletter-country-d"
                        required
                        value={country}
                        onChange={e => setCountry(e.target.value)}
                        className="w-full appearance-none rounded-xl border border-white/10 bg-white/[0.07] ps-8 pe-9 py-2.5 text-sm text-white outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/30 placeholder:text-white/30"
                      >
                        <option value="" disabled className="text-main">اختر الدولة</option>
                        {BLOG_COUNTRIES.map(c => (
                          <option key={c} value={c} className="text-main">{c}</option>
                        ))}
                      </select>
                      <ChevronDown size={13} className="absolute end-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-white/40 mb-1" htmlFor="newsletter-phone-d">رقم الهاتف</label>
                    <div className="relative">
                      <Phone size={13} className="absolute start-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                      <input
                        id="newsletter-phone-d"
                        type="tel"
                        required
                        dir="ltr"
                        inputMode="tel"
                        value={phone}
                        onChange={e => setPhone(normalizePhoneInput(e.target.value))}
                        placeholder="5xxxxxxxx"
                        className="w-full rounded-xl border border-white/10 bg-white/[0.07] ps-8 pe-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/30"
                      />
                    </div>
                  </div>
                  {subscribeError && (
                    <p className="text-xs font-bold text-error">{subscribeError}</p>
                  )}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-accent py-2.5 text-sm font-extrabold text-on-accent transition-all duration-300 hover:bg-accent-hover hover:shadow-[0_4px_20px_rgba(212,175,55,0.3)] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary-deep"
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
        <div className="flex items-end justify-between gap-4 mb-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-soft border border-primary/10 rounded-full mb-3">
                <span className="text-[10px] font-extrabold text-primary">آخر ما نُشر</span>
              </div>
              <h2 className="text-2xl lg:text-3xl font-heading font-black text-main">أحدث المقالات</h2>
              <p className="text-sm text-muted font-medium mt-1.5">
                {searchQuery ? `نتائج البحث عن «${search.trim()}»` : 'تصفح أحدث ما نُشر في المكتبة التعليمية'}
              </p>
            </div>
            <span className="hidden sm:inline-flex items-center gap-2 text-sm font-bold text-muted">
              <GraduationCap size={16} className="text-primary" />
              {posts.length} مقال
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="rounded-2xl border border-border bg-card overflow-hidden">
                  <div className="aspect-[16/10] animate-pulse bg-surface" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 w-3/4 rounded-lg animate-pulse bg-surface" />
                    <div className="h-3 w-full rounded-lg animate-pulse bg-surface" />
                    <div className="h-3 w-1/2 rounded-lg animate-pulse bg-surface" />
                  </div>
                </div>
              ))}
            </div>
          ) : articles.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-14 text-center shadow-elevation-1">
              <span className="w-14 h-14 mx-auto rounded-2xl bg-primary-soft text-primary flex items-center justify-center mb-4">
                <Search size={24} />
              </span>
              <h3 className="text-base font-extrabold text-main mb-1">لا توجد نتائج</h3>
              <p className="text-sm text-muted font-medium">جرّب كلمات بحث مختلفة أو تصفح الأقسام بالأسفل.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {articles.map(post => {
                const { style, label, icon: Icon } = getStyleFor(post);
                return (
                  <Link
                    key={post.id}
                    to={`/books/${post.slug}`}
                    className="group relative flex gap-4 rounded-2xl lg:rounded-none border border-border bg-card p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-elevation-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 overflow-hidden"
                  >
                    <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-l from-transparent via-primary/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative w-28 h-28 shrink-0 rounded-xl overflow-hidden bg-surface">
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        className="absolute inset-0"
                        imgClassName="object-cover transition-transform duration-500 group-hover:scale-105"
                        withSkeleton
                      />
                      <span className={cn('absolute top-2 end-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-extrabold', style.badge)}>
                        <Icon size={9} />
                        {label}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col">
                      <h3 className="text-sm font-extrabold text-main leading-snug mb-1.5 line-clamp-2 group-hover:text-primary transition-colors duration-300">
                        {post.title}
                      </h3>
                      <p className="text-[11px] text-muted font-medium leading-relaxed line-clamp-3 mb-3">{post.excerpt}</p>
                      <div className="mt-auto flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-[10px] text-muted font-bold">
                          <Clock size={11} />
                          {formatDate(post.date)}
                        </span>
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-on-primary text-[11px] font-extrabold transition-all duration-300 hover:bg-primary-hover group-hover:shadow-md group-hover:gap-1.5">
                          اقرأ المقال
                          <ArrowLeft size={11} className="transition-transform duration-300 group-hover:-translate-x-0.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ===== LANGUAGE SECTIONS ===== */}
      <section className="mt-14">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-warning-soft border border-warning/10 rounded-full mb-3">
              <Languages size={12} className="text-warning" />
              <span className="text-[10px] font-extrabold text-warning">تعلم بمفردك</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-heading font-black text-main">أقسام تعلم اللغة</h2>
            <p className="text-sm text-muted font-medium mt-1.5">اختر اللغة التي تريد تعلمها</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {languages.map(lang => (
            <button
              key={lang.id}
              type="button"
              onClick={() => {
                setSearchParams(prev => {
                  const next = new URLSearchParams(prev);
                  next.set('type', 'foundation');
                  next.set('language', lang.id);
                  next.set('view', 'language-sections');
                  ['curriculum', 'level', 'grade', 'term', 'subject'].forEach(k => next.delete(k));
                  return next;
                });
              }}
              className="group relative overflow-hidden rounded-2xl lg:rounded-none border border-border bg-card p-5 text-start transition-all duration-300 hover:-translate-y-1 hover:shadow-elevation-3 hover:border-warning/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
            >
              <div className="absolute top-0 bottom-0 end-0 w-1 rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-warning" />
              <div className="absolute inset-0 bg-gradient-to-br from-warning/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <span className="w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center bg-warning-soft transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg">
                    <Globe size={22} className="text-warning" />
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-main group-hover:text-warning transition-colors duration-300 mb-1">{lang.name}</h3>
                <p className="text-[11px] text-muted font-medium leading-relaxed mb-3">{lang.sub}</p>
                <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-warning transition-all duration-300 group-hover:gap-2.5">
                  تصفح المحتوى
                  <ArrowLeft size={12} className="transition-transform duration-300 group-hover:-translate-x-1" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ===== BOOK SOLUTIONS & NOTES BY CURRICULUM ===== */}
      <section className="mt-14">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-success-soft border border-success/10 rounded-full mb-3">
              <CheckCircle size={12} className="text-success" />
              <span className="text-[10px] font-extrabold text-success">حلول الكتب والمذكرات</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-heading font-black text-main">حسب المنهج الدراسي</h2>
            <p className="text-sm text-muted font-medium mt-1.5">اختر المنهج الخاص بك للوصول للمحتوى</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {curriculums.map(curr => (
            <button
              key={curr.id}
              type="button"
              onClick={() => {
                setSearchParams(prev => {
                  const next = new URLSearchParams(prev);
                  next.set('curriculum', curr.id);
                  next.set('view', 'grades');
                  ['grade', 'term', 'subject'].forEach(k => next.delete(k));
                  return next;
                });
              }}
              className="group relative overflow-hidden rounded-2xl lg:rounded-none border border-border bg-card p-5 text-start transition-all duration-300 hover:-translate-y-1 hover:shadow-elevation-3 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
            >
              <div className="absolute top-0 bottom-0 end-0 w-1 rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-primary" />
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <span className="w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center bg-primary-soft transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg">
                    <curr.icon size={22} className="text-primary" />
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-main group-hover:text-primary transition-colors duration-300 mb-1">{curr.name}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-success-soft text-success text-[10px] font-extrabold">
                    حلول الكتب
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-info-soft text-info text-[10px] font-extrabold">
                    المذكرات
                  </span>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-primary mt-3 transition-all duration-300 group-hover:gap-2.5">
                  تصفح المحتوى
                  <ArrowLeft size={12} className="transition-transform duration-300 group-hover:-translate-x-1" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};
