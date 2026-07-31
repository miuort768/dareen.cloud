import { useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, Zap, CheckCircle, FileText, AlignLeft, Search, Eye, Clock,
  Mail, Send, ArrowLeft, BookMarked, CheckCircle2, GraduationCap, Globe, Phone,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Image } from '../../shared/components/ui';
import { cn } from '../../lib/utils';
import { api } from '../../lib/api';
import { types, directTypes } from './LibraryConfig';
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
    badge: 'bg-info-soft text-info-dark',
    iconWrap: 'bg-info-soft',
    iconColor: 'text-info-dark',
    dot: 'bg-info',
    gradient: 'bg-gradient-to-br from-info-soft to-transparent',
    linkColor: 'text-info-dark',
    countColor: 'text-info-dark',
  },
  solutions: {
    desc: 'حلول كاملة وموثوقة لكتب المناهج',
    miniDesc: 'حلول معتمدة لجميع الكتب',
    badge: 'bg-success-soft text-success',
    iconWrap: 'bg-success-soft',
    iconColor: 'text-success',
    dot: 'bg-success',
    gradient: 'bg-gradient-to-br from-success-soft to-transparent',
    linkColor: 'text-success',
    countColor: 'text-success',
  },
  more: {
    desc: 'مزيد من الموارد والأدوات التعليمية المتنوعة',
    miniDesc: 'موارد تعليمية إضافية',
    badge: 'bg-primary-soft text-primary',
    iconWrap: 'bg-primary-soft',
    iconColor: 'text-primary',
    dot: 'bg-primary',
    gradient: 'bg-gradient-to-br from-primary-soft to-transparent',
    linkColor: 'text-primary',
    countColor: 'text-primary',
  },
  foundation: {
    desc: 'ملفات تأسيسية شاملة لجميع المراحل الدراسية',
    miniDesc: 'تأسيس قوي للطلاب',
    badge: 'bg-warning-soft text-warning',
    iconWrap: 'bg-warning-soft',
    iconColor: 'text-warning',
    dot: 'bg-warning',
    gradient: 'bg-gradient-to-br from-warning-soft to-transparent',
    linkColor: 'text-warning',
    countColor: 'text-warning',
  },
};

const FALLBACK_STYLE: TypeStyle = {
  desc: '',
  miniDesc: '',
  badge: 'bg-primary-soft text-primary',
  iconWrap: 'bg-primary-soft',
  iconColor: 'text-primary',
  dot: 'bg-primary',
  gradient: 'bg-gradient-to-br from-primary-soft to-transparent',
  linkColor: 'text-primary',
  countColor: 'text-primary',
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
      .slice(0, 4);
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
        else if (cat.includes('تأسي')) counts.foundation += 1;
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
      <section className="relative overflow-hidden rounded-[24px] bg-card border border-border shadow-elevation-1">
        <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] lg:min-h-[440px]">
          <div className="relative z-10 p-8 lg:p-12 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-soft border border-primary rounded-full mb-6 w-fit">
              <BookOpen size={14} className="text-primary" />
              <span className="text-xs font-black text-primary">المكتبة التعليمية</span>
            </div>

            <h1 className="text-4xl xl:text-5xl 2xl:text-6xl font-heading font-black text-main leading-tight mb-4">
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
                    className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 text-start transition-all duration-300 hover:-translate-y-1 hover:shadow-elevation-2 hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
                  >
                    <span className={cn('w-10 h-10 shrink-0 rounded-xl flex items-center justify-center transition-colors duration-300', s.iconWrap)}>
                      <t.icon size={18} className={cn('transition-colors duration-300', s.iconColor)} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-black text-main group-hover:text-primary transition-colors duration-300">{t.name}</span>
                      <span className="block text-xs text-muted font-medium mt-0.5">{s.miniDesc}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative min-h-[280px] lg:min-h-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-soft to-transparent" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[70%] h-[60%] bg-success-soft blur-3xl rounded-full pointer-events-none" />
            <div className="absolute top-[-15%] right-[-10%] w-[60%] h-[55%] bg-warning-soft blur-3xl rounded-full pointer-events-none" />
            <Image
              src="/dareen_books_portal_v3.png"
              alt="بوابة دارين التعليمية للكتب والمذكرات"
              className="absolute inset-0"
              imgClassName="object-contain p-8 lg:p-10 drop-shadow-xl"
              withSkeleton
            />
          </div>
        </div>
      </section>

      <section id="library-categories" className="mt-10">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl lg:text-3xl font-heading font-black text-main">تصفح الأقسام</h2>
            <p className="text-sm text-muted font-medium mt-1">اختر القسم الذي يناسب احتياجك التعليمي</p>
          </div>
          <a
            href="#library-categories"
            className="inline-flex items-center gap-1.5 text-sm font-black text-primary hover:text-primary-hover transition-colors duration-300"
          >
            عرض جميع الأقسام
            <ArrowLeft size={16} />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {types.map(t => {
            const s = TYPE_STYLES[t.id as TypeId];
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => goToType(t.id)}
                className="group relative overflow-hidden rounded-[20px] border border-border bg-card p-6 text-start transition-all duration-300 hover:-translate-y-1 hover:shadow-elevation-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
              >
                <div className={cn('absolute inset-0 bg-gradient-to-br opacity-60 transition-opacity duration-300 group-hover:opacity-100', s.gradient)} />
                <div className="relative z-10">
                  <span className={cn('w-12 h-12 rounded-2xl flex items-center justify-center mb-4', s.iconWrap)}>
                    <t.icon size={22} className={s.iconColor} />
                  </span>
                  <h3 className="text-xl font-heading font-black text-main mb-1.5">{t.name}</h3>
                  <p className="text-sm text-muted font-medium leading-relaxed">{s.desc}</p>
                  <span className={cn('inline-flex items-center gap-1.5 mt-4 text-sm font-black transition-colors duration-300', s.linkColor)}>
                    تصفح القسم
                    <ArrowLeft size={14} className="transition-transform duration-300 group-hover:-translate-x-1" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-10 grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 items-start">
        <aside className="lg:sticky lg:top-24 space-y-6">
          <div className="rounded-[20px] border border-border bg-card p-6 shadow-elevation-1">
            <h3 className="flex items-center gap-2 text-base font-black text-main mb-4">
              <span className="w-8 h-8 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
                <Search size={15} />
              </span>
              البحث في المكتبة
            </h3>
            <div className="relative">
              <Search size={16} className="absolute start-4 top-1/2 -translate-y-1/2 text-dim pointer-events-none" />
              <input
                type="search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="ابحث عن مادة، كتاب، أو ملزمة..."
                aria-label="البحث في المقالات"
                className="w-full rounded-xl border border-border bg-surface ps-11 pe-4 py-3 text-sm text-main placeholder:text-dim outline-none transition-all focus:border-primary focus:ring-2 focus:ring-focus"
              />
            </div>
          </div>

          <div className="rounded-[20px] border border-border bg-card p-6 shadow-elevation-1">
            <h3 className="flex items-center gap-2 text-base font-black text-main mb-4">
              <span className="w-8 h-8 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
                <BookMarked size={15} />
              </span>
              الفئات الأكثر قراءة
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
                      className="w-full flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition-all duration-300 hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                    >
                      <span className="flex items-center gap-2.5 min-w-0">
                        <span className={cn('w-2 h-2 shrink-0 rounded-full', s.dot)} />
                        <span className="text-sm font-bold text-main truncate">{t.name}</span>
                      </span>
                      <span className={cn('shrink-0 text-xs font-black rounded-full bg-surface px-2.5 py-0.5', s.countColor)}>
                        {count}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="rounded-[20px] border border-primary bg-gradient-to-br from-primary-soft to-success-soft p-6 shadow-elevation-1">
            <span className="w-11 h-11 rounded-2xl bg-primary-soft text-primary flex items-center justify-center mb-4">
              <Mail size={20} />
            </span>
            <h3 className="text-base font-black text-main mb-1.5">اشترك في نشرتنا البريدية</h3>
            <p className="text-sm text-muted font-medium leading-relaxed mb-4">
              اختر دولتك وسجّل رقم هاتفك ليصلك جديد الكتب والمذكرات والملخصات.
            </p>
            {subscribed ? (
              <div className="flex items-center gap-2 rounded-xl bg-success-soft border border-success px-4 py-3">
                <CheckCircle2 size={16} className="text-success shrink-0" />
                <span className="text-sm font-bold text-success">تم تسجيل بياناتك بنجاح!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-main mb-1.5" htmlFor="newsletter-country">اختر الدولة</label>
                  <div className="relative">
                    <Globe size={16} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-dim pointer-events-none" />
                    <select
                      id="newsletter-country"
                      required
                      value={country}
                      onChange={e => setCountry(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-border bg-card ps-10 pe-4 py-3 text-sm text-main outline-none transition-all focus:border-primary focus:ring-2 focus:ring-focus"
                    >
                      <option value="" disabled>الدولة</option>
                      {BLOG_COUNTRIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-main mb-1.5" htmlFor="newsletter-phone">رقم الهاتف</label>
                  <div className="relative">
                    <Phone size={16} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-dim pointer-events-none" />
                    <input
                      id="newsletter-phone"
                      type="tel"
                      required
                      dir="ltr"
                      inputMode="tel"
                      value={phone}
                      onChange={e => setPhone(normalizePhoneInput(e.target.value))}
                      placeholder="5xxxxxxxx"
                      className="w-full rounded-xl border border-border bg-card ps-10 pe-4 py-3 text-sm text-main placeholder:text-dim outline-none transition-all focus:border-primary focus:ring-2 focus:ring-focus"
                    />
                  </div>
                </div>
                {subscribeError && (
                  <p className="text-xs font-bold text-error">{subscribeError}</p>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-black text-on-primary transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-elevation-2 disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
                >
                  {submitting ? 'جارٍ الإرسال...' : 'اشترك الآن'}
                  {!submitting && <Send size={14} />}
                </button>
              </form>
            )}
          </div>
        </aside>

        <div className="min-w-0">
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl lg:text-3xl font-heading font-black text-main">أحدث المقالات</h2>
              <p className="text-sm text-muted font-medium mt-1">
                {searchQuery ? `نتائج البحث عن «${search.trim()}»` : 'آخر ما نُشر في المكتبة التعليمية'}
              </p>
            </div>
            <span className="hidden sm:inline-flex items-center gap-2 text-sm font-bold text-muted">
              <GraduationCap size={16} className="text-primary" />
              {posts.length} مقال
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="rounded-[20px] border border-border bg-card overflow-hidden">
                  <div className="aspect-[16/10] animate-pulse bg-surface" />
                  <div className="p-6 space-y-3">
                    <div className="h-4 w-3/4 rounded-full animate-pulse bg-surface" />
                    <div className="h-3 w-full rounded-full animate-pulse bg-surface" />
                    <div className="h-3 w-1/2 rounded-full animate-pulse bg-surface" />
                  </div>
                </div>
              ))}
            </div>
          ) : articles.length === 0 ? (
            <div className="rounded-[20px] border border-border bg-card p-14 text-center shadow-elevation-1">
              <span className="w-16 h-16 mx-auto rounded-2xl bg-primary-soft text-primary flex items-center justify-center mb-4">
                <Search size={28} />
              </span>
              <h3 className="text-lg font-black text-main mb-1.5">لا توجد نتائج</h3>
              <p className="text-sm text-muted font-medium">جرّب كلمات بحث مختلفة أو تصفح الأقسام بالأسفل.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {articles.map(post => {
                const { style, label, icon: Icon } = getStyleFor(post);
                return (
                  <Link
                    key={post.id}
                    to={`/books/${post.slug}`}
                    className="group rounded-[20px] border border-border bg-card overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-elevation-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-surface">
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        className="absolute inset-0"
                        imgClassName="object-cover transition-transform duration-500 group-hover:scale-105"
                        withSkeleton
                      />
                      <span className={cn('absolute top-3 start-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black', style.badge)}>
                        <Icon size={11} />
                        {label}
                      </span>
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg lg:text-xl font-heading font-black text-main leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-300">
                        {post.title}
                      </h3>
                      <p className="text-sm text-muted font-medium leading-relaxed line-clamp-2 mb-4">{post.excerpt}</p>
                      <div className="flex items-center justify-between text-xs text-muted font-bold">
                        <span className="flex items-center gap-1.5">
                          <Eye size={14} />
                          {(post.views ?? 0).toLocaleString('en-US')} مشاهدة
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock size={14} />
                          {formatDate(post.date)}
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
