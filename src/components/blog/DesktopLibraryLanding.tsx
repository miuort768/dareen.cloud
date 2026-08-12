import { useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, Zap, CheckCircle, FileText, AlignLeft, Search, Eye, Clock,
  Mail, Send, ArrowLeft, BookMarked, CheckCircle2, GraduationCap, Globe, Phone, ChevronDown,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Image } from '../../shared/components/ui';
import { cn } from '../../lib/utils';
import { api } from '../../lib/api';
import { useAcademyName } from '../../context/AppContext';
import { types, directTypes, curriculums } from './LibraryConfig';
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
  foundation: Zap,
  solutions: CheckCircle,
  notes: FileText,
  more: AlignLeft,
};

const TYPE_STYLES: Record<TypeId, TypeStyle> = {
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
  foundation: {
    desc: 'ملفات تأسيسية شاملة لجميع المراحل الدراسية',
    miniDesc: 'تأسيس قوي للطلاب',
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
      if (directTypes.includes(id)) {
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
      .slice(0, 8);
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

      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden rounded-3xl bg-card border border-border shadow-elevation-2">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-accent/3 pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] lg:min-h-[440px]">
          <div className="relative z-10 p-8 lg:p-12 lg:pe-12 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-primary-soft border border-primary/20 rounded-2xl mb-6 w-fit">
              <div className="w-7 h-7 rounded-xl bg-primary flex items-center justify-center">
                <BookOpen size={13} className="text-on-primary" />
              </div>
              <span className="text-xs font-extrabold text-primary">المكتبة التعليمية</span>
            </div>

            <h1 className="text-4xl xl:text-5xl 2xl:text-6xl font-heading font-black text-main leading-[1.15] mb-4">
              مدونة <span className="text-primary">دارين</span> التعليمية
            </h1>

            <p className="text-base lg:text-lg text-muted font-medium leading-relaxed mb-8 max-w-xl">
              دليلك الشامل للتفوق الدراسي — أحدث المناهج، مذكرات، ملخصات، وحلول الكتب لجميع المراحل
              في الكويت وقطر والإمارات والسعودية.
            </p>

            <div className="grid grid-cols-2 gap-3 max-w-xl">
              {types.map(t => {
                const s = TYPE_STYLES[t.id as TypeId];
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => goToType(t.id)}
                    className={cn(
                      'group flex items-center gap-3 rounded-2xl border bg-card p-4 text-start transition-all duration-300',
                      'hover:-translate-y-0.5 hover:shadow-elevation-2',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2',
                      s.cardBorder
                    )}
                  >
                    <span className={cn('w-11 h-11 shrink-0 rounded-xl flex items-center justify-center transition-colors duration-300', s.iconWrap)}>
                      <t.icon size={18} className={cn('transition-colors duration-300', s.iconColor)} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-extrabold text-main group-hover:text-primary transition-colors duration-300">{t.name}</span>
                      <span className="block text-[11px] text-muted font-medium mt-0.5 leading-relaxed">{s.miniDesc}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative min-h-[280px] lg:min-h-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[70%] h-[60%] bg-success/5 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute top-[-15%] right-[-10%] w-[60%] h-[55%] bg-warning/5 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[280px] h-[280px] lg:w-[340px] lg:h-[340px] rounded-full border border-dashed border-primary/15 animate-[spin_30s_linear_infinite]" />
              <div className="absolute w-[220px] h-[220px] lg:w-[270px] lg:h-[270px] rounded-full border border-dashed border-accent/10 animate-[spin_20s_linear_infinite_reverse]" />
            </div>
            <Image
              src="/bbook.webp"
              alt={`بوابة ${academyName} التعليمية للكتب والمذكرات`}
              className="absolute inset-0"
              imgClassName="object-contain p-8 lg:p-10 drop-shadow-xl"
              withSkeleton
            />
          </div>
        </div>
      </section>

      {/* ===== STATS BAR ===== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
        {[
          { label: 'مادة تعليمية', value: `${posts.length}+`, color: 'text-primary' },
          { label: 'منهج خليجي', value: `${curriculums.length}`, color: 'text-info' },
          { label: 'مرحلة دراسية', value: '٣', color: 'text-success' },
          { label: 'دولة مستهدفة', value: '٤', color: 'text-warning' },
        ].map((stat, i) => (
          <div key={i} className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 shadow-elevation-1">
            <span className={cn('text-xl font-black font-heading', stat.color)}>{stat.value}</span>
            <span className="text-xs font-bold text-muted leading-tight">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* ===== CATEGORIES ===== */}
      <section id="library-categories" className="mt-12">
        <div className="flex items-end justify-between gap-4 mb-7">
          <div>
            <h2 className="text-2xl lg:text-3xl font-heading font-black text-main">الفئات الأكثر قراءة</h2>
            <p className="text-sm text-muted font-medium mt-1.5">اختر القسم الذي يناسب احتياجك التعليمي</p>
          </div>
        </div>

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
                  'group relative overflow-hidden rounded-2xl border bg-card p-5 text-start transition-all duration-300',
                  'hover:-translate-y-0.5 hover:shadow-elevation-2',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2',
                  s.cardBorder
                )}
              >
                <div className={cn('absolute top-0 bottom-0 end-0 w-1 rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300', s.dot)} />
                <div className={cn('absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300', s.gradient)} />
                <div className="relative z-10 flex items-start gap-4">
                  <span className={cn('w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110', s.iconWrap)}>
                    <t.icon size={22} className={s.iconColor} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="text-sm font-extrabold text-main group-hover:text-primary transition-colors duration-300 truncate">{t.name}</h3>
                      <span className={cn('shrink-0 text-[11px] font-extrabold rounded-lg px-2 py-0.5', s.badge)}>
                        {count}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted font-medium leading-relaxed">{s.miniDesc}</p>
                    <span className={cn('inline-flex items-center gap-1 mt-2.5 text-xs font-extrabold transition-all duration-300 group-hover:gap-1.5', s.linkColor)}>
                      تصفح
                      <ArrowLeft size={12} className="transition-transform duration-300 group-hover:-translate-x-1" />
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ===== SIDEBAR + ARTICLES ===== */}
      <section className="mt-12 grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 items-start">
        <aside className="lg:sticky lg:top-24 space-y-5">
          {/* Search */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-elevation-1">
            <h3 className="flex items-center gap-2.5 text-sm font-extrabold text-main mb-4">
              <span className="w-8 h-8 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
                <Search size={15} />
              </span>
              البحث في المكتبة
            </h3>
            <div className="relative">
              <Search size={15} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
              <input
                type="search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="ابحث عن مادة، كتاب، أو ملزمة..."
                aria-label="البحث في المقالات"
                className="w-full rounded-xl border border-border bg-surface ps-10 pe-4 py-2.5 text-sm text-main placeholder:text-muted outline-none transition-all focus:border-primary focus:ring-2 focus:ring-focus"
              />
            </div>
          </div>

          {/* Popular Categories */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-elevation-1">
            <h3 className="flex items-center gap-2.5 text-sm font-extrabold text-main mb-4">
              <span className="w-8 h-8 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
                <BookMarked size={15} />
              </span>
              الفئات الأكثر قراءة
            </h3>
            <ul className="space-y-0.5">
              {types.map(t => {
                const s = TYPE_STYLES[t.id as TypeId];
                const count = categoryCounts[t.id] || 0;
                return (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => goToType(t.id)}
                      className="w-full flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                    >
                      <span className="flex items-center gap-2.5 min-w-0">
                        <span className={cn('w-2 h-2 shrink-0 rounded-full', s.dot)} />
                        <span className="text-sm font-bold text-main truncate">{t.name}</span>
                      </span>
                      <span className={cn('shrink-0 text-xs font-extrabold rounded-lg bg-surface px-2.5 py-0.5', s.countColor)}>
                        {count}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-success/5 p-5 shadow-elevation-1 relative overflow-hidden">
            <div className="absolute top-0 start-0 w-16 h-16 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
            <span className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center mb-3">
              <Mail size={18} />
            </span>
            <h3 className="text-sm font-extrabold text-main mb-1">اشترك في نشرتنا البريدية</h3>
            <p className="text-xs text-muted font-medium leading-relaxed mb-4">
              اختر دولتك وسجّل رقم هاتفك ليصلك جديد الكتب والمذكرات.
            </p>
            {subscribed ? (
              <div className="flex items-center gap-2 rounded-xl bg-success-soft border border-success/30 px-4 py-3">
                <CheckCircle2 size={15} className="text-success shrink-0" />
                <span className="text-xs font-bold text-success">تم التسجيل بنجاح!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-muted mb-1" htmlFor="newsletter-country">الدولة</label>
                  <div className="relative">
                    <Globe size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                    <select
                      id="newsletter-country"
                      required
                      value={country}
                      onChange={e => setCountry(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-border bg-surface ps-9 pe-9 py-2.5 text-sm text-main outline-none transition-all focus:border-primary focus:ring-2 focus:ring-focus"
                    >
                      <option value="" disabled>اختر الدولة</option>
                      {BLOG_COUNTRIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute end-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-muted mb-1" htmlFor="newsletter-phone">رقم الهاتف</label>
                  <div className="relative">
                    <Phone size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                    <input
                      id="newsletter-phone"
                      type="tel"
                      required
                      dir="ltr"
                      inputMode="tel"
                      value={phone}
                      onChange={e => setPhone(normalizePhoneInput(e.target.value))}
                      placeholder="5xxxxxxxx"
                      className="w-full rounded-xl border border-border bg-surface ps-9 pe-4 py-2.5 text-sm text-main placeholder:text-muted outline-none transition-all focus:border-primary focus:ring-2 focus:ring-focus"
                    />
                  </div>
                </div>
                {subscribeError && (
                  <p className="text-xs font-bold text-error">{subscribeError}</p>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-extrabold text-on-primary transition-all duration-300 hover:bg-primary-hover hover:shadow-elevation-1 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
                >
                  {submitting ? 'جارٍ الإرسال...' : 'اشترك الآن'}
                  {!submitting && <Send size={13} />}
                </button>
              </form>
            )}
          </div>
        </aside>

        {/* Articles */}
        <div className="min-w-0">
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl lg:text-3xl font-heading font-black text-main">أحدث المقالات</h2>
              <p className="text-sm text-muted font-medium mt-1.5">
                {searchQuery ? `نتائج البحث عن «${search.trim()}»` : 'آخر ما نُشر في المكتبة التعليمية'}
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
                    className="group relative flex gap-4 rounded-2xl border border-border bg-card p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-elevation-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 overflow-hidden"
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
    </div>
  );
};
