import { useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap, CheckCircle, FileText, AlignLeft, Search, Clock,
  Mail, Send, ArrowLeft, BookMarked, CheckCircle2, Globe, Phone, ChevronDown, MessageCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Image } from '../../shared/components/ui';
import { cn } from '../../lib/utils';
import { api } from '../../lib/api';
import { useAcademyName } from '../../context/AppContext';
import { useSettingsStore } from '../../store/settingsStore';
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
  linkColor: string;
  countColor: string;
  cardBorder: string;
  hoverBorder: string;
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
    miniDesc: 'ملخصات منظمة للمذاكرة — جاهزة للتحميل',
    badge: 'bg-info-soft text-info',
    iconWrap: 'bg-info-soft',
    iconColor: 'text-info',
    dot: 'bg-info',
    linkColor: 'text-info',
    countColor: 'text-info',
    cardBorder: 'border-border',
    hoverBorder: 'hover:border-info/40',
  },
  solutions: {
    desc: 'حلول كاملة وموثوقة لكتب المناهج',
    miniDesc: 'حلول معتمدة لجميع كتب المنهج',
    badge: 'bg-success-soft text-success',
    iconWrap: 'bg-success-soft',
    iconColor: 'text-success',
    dot: 'bg-success',
    linkColor: 'text-success',
    countColor: 'text-success',
    cardBorder: 'border-border',
    hoverBorder: 'hover:border-success/40',
  },
  more: {
    desc: 'مزيد من الموارد والأدوات التعليمية المتنوعة',
    miniDesc: 'موارد تعليمية متنوعة وإضافية',
    badge: 'bg-primary-soft text-primary',
    iconWrap: 'bg-primary-soft',
    iconColor: 'text-primary',
    dot: 'bg-primary',
    linkColor: 'text-primary',
    countColor: 'text-primary',
    cardBorder: 'border-border',
    hoverBorder: 'hover:border-primary/40',
  },
  foundation: {
    desc: 'ملفات تأسيسية شاملة لجميع المراحل الدراسية',
    miniDesc: 'تأسيس قوي وشامل للطلاب',
    badge: 'bg-warning-soft text-warning',
    iconWrap: 'bg-warning-soft',
    iconColor: 'text-warning',
    dot: 'bg-warning',
    linkColor: 'text-warning',
    countColor: 'text-warning',
    cardBorder: 'border-border',
    hoverBorder: 'hover:border-warning/40',
  },
};

const FALLBACK_STYLE: TypeStyle = {
  desc: '',
  miniDesc: '',
  badge: 'bg-primary-soft text-primary',
  iconWrap: 'bg-primary-soft',
  iconColor: 'text-primary',
  dot: 'bg-primary',
  linkColor: 'text-primary',
  countColor: 'text-primary',
  cardBorder: 'border-border',
  hoverBorder: 'hover:border-primary/40',
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
  const adminPhone = useSettingsStore(s => s.adminPhone);
  const whatsappNumber = adminPhone.replace(/\D/g, '');
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
        else if (cat.includes('تأسيس')) counts.foundation += 1;
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

      {/* ===== HERO — Gradient Hero ===== */}
      <section className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary via-primary-hover to-primary dark:from-card dark:via-surface dark:to-card">
        {/* Decorative blurs */}
        <div className="absolute top-0 end-0 w-64 h-64 bg-white/10 dark:bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 start-0 w-48 h-48 bg-white/10 dark:bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNENEFGMzciIGZpbGwtb3BhY2l0eT0iMC4wNCI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-6 lg:gap-10 p-8 lg:p-12">
          {/* Text side */}
          <div className="lg:w-[60%] text-center lg:text-start">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/15 dark:bg-primary/20 border border-white/20 dark:border-primary/30 rounded-full mb-5">
              <BookMarked size={13} className="text-warning dark:text-primary" />
              <span className="text-[11px] font-extrabold text-on-primary dark:text-primary">بوابتك التعليمية</span>
            </div>

            <h1 className="text-3xl xl:text-4xl 2xl:text-5xl font-heading font-black text-on-primary dark:text-main leading-[1.15] mb-3">
              مكتبة <span className="text-warning dark:text-primary">{academyName}</span>
              <br />
              <span className="text-white/80 dark:text-muted">للكتب والمذكرات</span>
            </h1>

            <p className="text-sm lg:text-base text-on-primary/80 dark:text-muted font-medium leading-relaxed mb-7 max-w-lg mx-auto lg:mx-0">
              أفضل الكتب والمذكرات والملخصات لجميع المراحل بطرق تدريس أكاديمية
              — في الكويت وقطر والإمارات والسعودية.
            </p>

            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('السلام عليكم، أرغب في حجز حصة تجريبية فردية')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-primary text-primary dark:text-on-primary text-sm font-extrabold transition-all duration-200 hover:bg-white/90 dark:hover:bg-primary-hover hover:shadow-sm active:scale-[0.98]"
            >
              <MessageCircle size={16} />
              طلب حصة مجانية فردية الآن
            </a>

            {/* Stats strip */}
            <div className="flex items-center gap-6 mt-6 pt-5 border-t border-white/15 dark:border-border max-w-lg mx-auto lg:mx-0">
              <div className="text-center">
                <div className="text-lg font-black text-warning dark:text-primary">500+</div>
                <div className="text-[10px] text-on-primary/70 dark:text-muted font-bold">مذكرة</div>
              </div>
              <div className="w-px h-8 bg-white/20 dark:bg-border" />
              <div className="text-center">
                <div className="text-lg font-black text-warning dark:text-primary">4</div>
                <div className="text-[10px] text-on-primary/70 dark:text-muted font-bold">مناهج خليجية</div>
              </div>
              <div className="w-px h-8 bg-white/20 dark:bg-border" />
              <div className="text-center">
                <div className="text-lg font-black text-warning dark:text-primary">100%</div>
                <div className="text-[10px] text-on-primary/70 dark:text-muted font-bold">مجاني</div>
              </div>
            </div>
          </div>

          {/* Image side */}
          <div className="hidden lg:flex lg:w-[40%] items-center justify-center relative">
            <div className="relative w-full max-w-[380px]">
              <div className="absolute inset-0 bg-white/10 dark:bg-primary/10 rounded-full blur-[60px] pointer-events-none" />
              <Image
                src="/bbook.webp"
                alt={`بوابة ${academyName} التعليمية للكتب والمذكرات`}
                className="relative z-10 w-full h-auto"
                imgClassName="object-contain drop-shadow-2xl"
                withSkeleton
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===== TYPE CARDS — D4: Improved ===== */}
      <section id="library-categories" className="mt-10">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl lg:text-3xl font-heading font-black text-main">الفئات التعليمية</h2>
            <p className="text-sm text-muted font-medium mt-1.5">اختر القسم الذي يناسب احتياجك التعليمي</p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {types.map(t => {
            const s = TYPE_STYLES[t.id as TypeId];
            const count = categoryCounts[t.id] || 0;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => goToType(t.id)}
                className={cn(
                  'group relative bg-card border rounded-2xl p-5 text-start transition-all duration-200',
                  'hover:-translate-y-0.5 hover:shadow-sm',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2',
                  s.cardBorder, s.hoverBorder
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={cn('w-11 h-11 shrink-0 rounded-xl flex items-center justify-center transition-colors', s.iconWrap)}>
                    <t.icon size={20} className={cn('transition-colors', s.iconColor)} />
                  </span>
                  <span className={cn('text-[11px] font-extrabold rounded-lg px-2.5 py-1', s.badge)}>
                    {count} مقال
                  </span>
                </div>
                <h3 className="text-sm font-extrabold text-main mb-1.5 group-hover:text-primary transition-colors">{t.name}</h3>
                <p className="text-[11px] text-muted font-medium leading-relaxed mb-3">{s.miniDesc}</p>
                <span className={cn('inline-flex items-center gap-1 text-xs font-extrabold transition-colors', s.linkColor)}>
                  تصفح المقالات
                  <ArrowLeft size={12} className="transition-transform group-hover:-translate-x-1" />
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ===== SIDEBAR + ARTICLES ===== */}
      <section className="mt-10 grid grid-cols-[300px_1fr] gap-8 items-start">
        <aside className="sticky top-24 space-y-5">
          {/* D5: Search — properly working */}
          <div className="rounded-2xl border border-border bg-card p-5">
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
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-muted hover:text-main transition-colors"
                  aria-label="مسح البحث"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Categories list */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="flex items-center gap-2.5 text-sm font-extrabold text-main mb-4">
              <span className="w-8 h-8 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
                <BookMarked size={15} />
              </span>
              الأقسام
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

          {/* D6: Newsletter — linked to blog-customers API */}
          <div className="rounded-2xl border border-primary/15 bg-card p-5">
            <span className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center mb-3">
              <Mail size={18} />
            </span>
            <h3 className="text-sm font-extrabold text-main mb-1">اشترك في النشرة البريدية</h3>
            <p className="text-xs text-muted font-medium leading-relaxed mb-4">
              سجّل رقم هاتفك ليصلك جديد الكتب والمذكرات.
            </p>
            {subscribed ? (
              <div className="flex items-center gap-2 rounded-xl bg-success-soft border border-success/30 px-4 py-3">
                <CheckCircle2 size={15} className="text-success shrink-0" />
                <span className="text-xs font-bold text-success">تم التسجيل بنجاح!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-muted mb-1" htmlFor="newsletter-country-desktop">الدولة</label>
                  <div className="relative">
                    <Globe size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                    <select
                      id="newsletter-country-desktop"
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
                  <label className="block text-[11px] font-bold text-muted mb-1" htmlFor="newsletter-phone-desktop">رقم الهاتف</label>
                  <div className="relative">
                    <Phone size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                    <input
                      id="newsletter-phone-desktop"
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
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-extrabold text-on-primary transition-all duration-200 hover:bg-primary-hover hover:shadow-sm disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
                >
                  {submitting ? 'جارٍ الإرسال...' : 'اشترك الآن'}
                  {!submitting && <Send size={13} />}
                </button>
              </form>
            )}
          </div>
        </aside>

        {/* D7 + D8: Articles — fixed "اقرأ المقال" + dark mode colors */}
        <div className="min-w-0">
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl lg:text-3xl font-heading font-black text-main">أحدث المقالات</h2>
              <p className="text-sm text-muted font-medium mt-1.5">
                {searchQuery ? `نتائج البحث عن «${search.trim()}»` : 'آخر ما نُشر في المكتبة التعليمية'}
              </p>
            </div>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="text-xs font-bold text-primary hover:text-primary-hover transition-colors"
              >
                مسح البحث
              </button>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-5">
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
            <div className="rounded-2xl border border-border bg-card p-14 text-center">
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
                    onClick={() => window.scrollTo(0, 0)}
                    className="group flex gap-4 rounded-2xl border border-border bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
                  >
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
                      <h3 className="text-sm font-extrabold text-main leading-snug mb-1.5 line-clamp-2 group-hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-[11px] text-muted font-medium leading-relaxed line-clamp-3 mb-3">{post.excerpt}</p>
                      <div className="mt-auto flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-[10px] text-muted font-bold">
                          <Clock size={11} />
                          {formatDate(post.date)}
                        </span>
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-on-primary text-[11px] font-extrabold transition-all duration-200 hover:bg-primary-hover pointer-events-none">
                          اقرأ المقال
                          <ArrowLeft size={11} />
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
