import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MobileHeader } from '../../components/public/MobileHeader';
import { PublicFooter } from '../../components/public/PublicFooter';
import { SEO } from '../../components/SEO';
import { blogPosts as staticPosts, type BlogPost as BlogPostType } from '../../data/blogPosts';
import { Image } from '../../shared/components/ui';
import { Calendar, User, ArrowRight, Loader2, Download, Eye, MessageCircle, Play, BookOpen, GraduationCap, School, Tag, Clock } from 'lucide-react';
import { api } from '../../lib/api';
import { useSettingsStore } from '../../store/settingsStore';
import DOMPurify from 'dompurify';

const sanitizeHTML = (html: string) => DOMPurify.sanitize(html);

// Plain function outside component — avoids Rules of Hooks violation
const processContent = (text: string, alt?: string): string => {
    if (!text) return '';
    const lines = text.split('\n');
    const hasHtml = /<[a-z][\s\S]*>/i.test(text);
    const processed = lines.map((line: string) => {
        const trimmed = line.trim();
        const imgRegex = /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp|svg))$/i;
        if (imgRegex.test(trimmed)) {
            return `<img src="${trimmed}" alt="${alt || ''}" loading="lazy" class="w-full h-auto my-8" onerror="this.style.display='none'" />`;
        }
        return line;
    });
    return hasHtml ? processed.join('\n') : processed.join('<br/>');
};

const curriculumNames: Record<string, string> = {
  kuwait: 'منهج كويتي', qatar: 'منهج قطري', uae: 'منهج إماراتي', saudi: 'منهج سعودي',
};
const levelNames: Record<string, string> = {
  primary: 'ابتدائي', middle: 'متوسط', secondary: 'ثانوي', basic: 'أساسي', preparatory: 'إعدادي',
};
const subjectNames: Record<string, string> = {
  arabic: 'عربي', math: 'رياضيات', islamic: 'إسلامية', english: 'إنجليزي', science: 'علوم',
  physics: 'فيزياء', chemistry: 'كيمياء', biology: 'أحياء', history: 'تاريخ', geography: 'جغرافيا',
  social: 'اجتماعيات', computer: 'حاسب آلي', stats: 'إحصاء',
};
const termNames: Record<string, string> = { '1': 'الفصل الأول', '2': 'الفصل الثاني' };
const gradeNames: Record<string, string> = {
  '1': 'الأول', '2': 'الثاني', '3': 'الثالث', '4': 'الرابع', '5': 'الخامس',
  '6': 'السادس', '7': 'السابع', '8': 'الثامن', '9': 'التاسع',
  '10': 'العاشر', '11': 'الحادي عشر', '12': 'الثاني عشر',
};

export const BlogPost = () => {
    const { slug } = useParams<{ slug: string }>();
    const { adminPhone } = useSettingsStore();
    const whatsappNumber = adminPhone.replace(/\D/g, '');
    const [copied, setCopied] = useState(false);
    const [post, setPost] = useState<BlogPostType | null>(null);
    const [loading, setLoading] = useState(true);
    const [relatedPosts, setRelatedPosts] = useState<{ slug: string; title: string; excerpt: string; coverImage: string; date: string }[]>([]);
    const [buttonState, setButtonState] = useState<{ type: 'download' | 'watch'; phase: 'counting' | 'ready'; seconds?: number } | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const data = await api.get<BlogPostType>(`/blog/${slug}`);
                setPost(data);
                try {
                    const related = await api.get<{ slug: string; title: string; excerpt: string; coverImage: string; date: string }[]>(`/blog/${slug}/related`);
                    setRelatedPosts(related);
                } catch (e) { console.warn(e); }
            } catch (err) {
                console.error('Failed to fetch blog post:', err);
                const staticPost = staticPosts.find(p => p.slug === slug);
                setPost(staticPost || null);
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [slug]);

    const handleButtonClick = (type: 'download' | 'watch', url: string, e: React.MouseEvent) => {
        e.preventDefault();
        if (buttonState?.type === type && buttonState.phase === 'ready') {
            window.open(url, '_blank', 'noopener,noreferrer');
            setButtonState(null);
            return;
        }
        if (buttonState) return;
        setButtonState({ type, phase: 'counting', seconds: 9 });
        timerRef.current = setInterval(() => {
            setButtonState(prev => {
                if (!prev || prev.seconds! <= 1) {
                    if (timerRef.current) clearInterval(timerRef.current);
                    timerRef.current = null;
                    return { type, phase: 'ready' };
                }
                return { ...prev, seconds: prev.seconds! - 1 };
            });
        }, 1000);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-error animate-spin" />
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-black mb-4">المقال غير موجود</h1>
                    <Link to="/books" className="text-error font-bold underline">العودة للمدونة</Link>
                </div>
            </div>
        );
    }

    const content = post.content || '';
    const contentParts = (() => {
        if (!content) return { first: '', rest: '' };
        const parts = content.split(/\n\n/);
        return { first: parts[0] || '', rest: parts.slice(1).join('\n\n') };
    })();



    return (
        <div className="min-h-full bg-white dark:bg-background font-sans text-main dark:text-main relative flex flex-col">
            <SEO
                title={post.seoTitle || post.title}
                description={post.seoDescription || post.excerpt}
                keywords={post.focusKeyword || post.keywords}
                image={post.ogImage || post.coverImage}
                url={`https://dareen.cloud/books/${post.slug}`}
                noindex={post.robotsIndex === false}
                breadcrumbs={[
                    { name: 'الرئيسية', item: '/' },
                    { name: 'المكتبة', item: '/books' },
                    { name: post.title, item: `/books/${post.slug}` }
                ]}
            />
            <script type="application/ld+json">
                {JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'Article',
                    headline: post.title,
                    description: post.excerpt,
                    image: post.coverImage?.startsWith('http') ? post.coverImage : `https://dareen.cloud${post.coverImage || ''}`,
                    datePublished: post.date,
                    dateModified: post.date,
                    author: { '@type': 'Person', name: post.author },
                    publisher: {
                        '@type': 'EducationalOrganization',
                        name: 'دارين السابعة',
                        url: 'https://dareen.cloud',
                        logo: { '@type': 'ImageObject', url: 'https://dareen.cloud/logo.png' }
                    },
                    mainEntityOfPage: { '@type': 'WebPage', '@id': `https://dareen.cloud/books/${post.slug}` }
                })}
            </script>
            <MobileHeader />

            <main className="flex-grow pt-3 md:pt-32 pb-6 md:pb-10 relative">
                {/* Article Header */}
                <header className="container mx-auto px-4 max-w-4xl mb-6 md:mb-12">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 md:gap-0 mb-3 md:mb-6">
                        <div className="order-2 md:order-1 flex flex-wrap gap-4 items-center">
                            <span className="bg-error-light dark:bg-error/30 text-error dark:text-error font-black text-xs px-3 py-1.5 uppercase tracking-widest">{post.category}</span>
                            <div className="flex items-center gap-4 text-xs text-muted dark:text-muted font-medium">
                                <div className="flex items-center gap-1.5"><Calendar size={14} /> <span>{post.date}</span></div>
                                {post.readingTime ? <div className="flex items-center gap-1.5"><Clock size={14} /> <span>{post.readingTime} دقيقة قراءة</span></div> : null}
                                <div className="bg-error-light dark:bg-error/30 text-error dark:text-error font-black text-xs sm:text-xs px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg"><User size={12} className="inline" /> {post.author}</div>
                                {/* Mobile share buttons below author */}
                                <div className="flex items-center gap-2 md:hidden mt-2">
                                    <a href={`https://wa.me/?text=${encodeURIComponent(post.title + ' ' + window.location.href)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-success text-on-primary text-xs font-bold rounded-lg hover:opacity-80 transition-all">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 6.5a8.5 8.5 0 0 1-3.5 16.2"/><path d="M3 21l1.7-5.9a8.5 8.5 0 1 1 5.8 5.8L3 21z"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="12" y1="8" x2="12" y2="16"/></svg>
                                        <span>واتساب</span>
                                    </a>
                                    <a href={`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post.title)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-info text-on-primary text-xs font-bold rounded-lg hover:opacity-80 transition-all">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.2 4.2L2.8 12.9c-.8.3-.7 1.5.1 1.7l5.1 1.4 2 6.3c.3.9 1.4.9 1.7 0L21.2 4.2z"/><path d="M11.9 15.7l6.5-6.5"/><path d="M9 21l3.4-5.8"/></svg>
                                        <span>تيليجرام</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                        <Link to="/books" className="order-1 md:order-2 w-full md:w-auto inline-flex items-center justify-center md:justify-start gap-2 px-4 py-3 bg-card dark:bg-white text-main dark:text-main hover:bg-error dark:hover:bg-error hover:text-on-primary transition-all font-bold text-sm rounded-card">
                            <ArrowRight size={16} />
                            <span>العودة لجميع المقالات</span>
                        </Link>
                    </div>

                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-black text-main dark:text-on-primary leading-tight mb-2 md:mb-4">
                        {post.title}
                    </h1>
                    {post.contentType !== 'more' && post.contentType !== 'foundation' && (post.curriculum || post.level || post.grade || post.term || post.subject) && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {post.curriculum && <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-info-light dark:bg-info/10 text-info dark:text-info text-xs font-bold rounded-lg border border-info/50 dark:border-info/20"><BookOpen size={12} />{curriculumNames[post.curriculum] || post.curriculum}</span>}
                        {post.level && <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-success-light dark:bg-success/10 text-success dark:text-success text-xs font-bold rounded-lg border border-success/50 dark:border-success/20"><GraduationCap size={12} />{levelNames[post.level] || post.level}</span>}
                        {post.grade && <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-soft dark:bg-primary/10 text-primary dark:text-primary text-xs font-bold rounded-lg border border-primary/50 dark:border-primary/20"><School size={12} />الصف {gradeNames[post.grade] || post.grade}</span>}
                        {post.term && <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-warning-light dark:bg-warning/10 text-warning dark:text-warning text-xs font-bold rounded-lg border border-warning/50 dark:border-warning/20"><Tag size={12} />{termNames[post.term] || post.term}</span>}
                        {post.subject && <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-error-light dark:bg-error/10 text-error dark:text-error text-xs font-bold rounded-lg border border-error/50 dark:border-error/20"><BookOpen size={12} />{subjectNames[post.subject] || post.subject}</span>}
                    </div>
                    )}
                    {post.tags && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.split(',').map((tag: string, i: number) => (
                            <span key={`tag-${i}`} className="text-micro font-bold text-muted dark:text-muted bg-surface dark:bg-card px-2 py-1 rounded-lg">#{tag.trim()}</span>
                        ))}
                    </div>
                    )}
                </header>

                {/* Image + First Content Side by Side */}
                <div className="container mx-auto px-4 max-w-5xl mb-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-start">
                        <div className="w-full bg-surface dark:bg-card overflow-hidden shadow-xl rounded-card">
                            <Image src={post.coverImage || ''} alt={post.title || ''} className="w-full h-auto" />
                        </div>
                        <div className="prose sm:prose-lg dark:prose-invert prose-headings:font-heading prose-headings:font-black prose-a:text-error prose-img:shadow-xl max-w-none prose-p:text-justify text-main dark:text-main"
                            dangerouslySetInnerHTML={{ __html: sanitizeHTML(processContent(contentParts.first, post.title)) }}
                        />
                    </div>
                </div>

                <article className="container mx-auto px-4 max-w-3xl">
                    
                    {/* Download & Watch Buttons */}
                        {(post.showButtons !== false && post.show_buttons !== 0) && (post.downloadLink || post.watchLink) && (
                        <div className="flex flex-wrap gap-3 justify-center my-8">
                            {post.downloadLink && (
                                <button onClick={(e) => handleButtonClick('download', post.downloadLink!, e)}
                                    disabled={buttonState !== null && buttonState.type !== 'download'}
                                    className={`flex-1 inline-flex items-center justify-center gap-2 px-6 md:px-16 py-3 md:py-4 font-black text-xs sm:text-sm rounded-card hover:bg-error hover:text-on-error transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap ${buttonState?.type === 'download' && buttonState.phase === 'counting' ? 'bg-success text-on-success' : buttonState?.type === 'download' && buttonState.phase === 'ready' ? 'bg-success text-on-success ring-2 ring-success ring-offset-2' : 'bg-card dark:bg-primary text-on-primary dark:text-on-primary'}`}>
                                    <Download size={16} />
                                    <span>{buttonState?.type === 'download' && buttonState.phase === 'counting' ? `${post.downloadButtonText || post.download_button_text || 'تحميل الملف'} (${buttonState.seconds})` : buttonState?.type === 'download' && buttonState.phase === 'ready' ? 'الملف جاهز ✓' : post.downloadButtonText || post.download_button_text || 'تحميل الملف'}</span>
                                </button>
                            )}
                            {post.watchLink && (
                                <button onClick={(e) => handleButtonClick('watch', post.watchLink!, e)}
                                    disabled={buttonState !== null && buttonState.type !== 'watch'}
                                    className={`flex-1 inline-flex items-center justify-center gap-2 px-6 md:px-16 py-3 md:py-4 font-black text-xs sm:text-sm rounded-card hover:bg-error-active transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap ${buttonState?.type === 'watch' && buttonState.phase === 'counting' ? 'bg-success text-on-success' : buttonState?.type === 'watch' && buttonState.phase === 'ready' ? 'bg-success text-on-success ring-2 ring-success ring-offset-2' : 'bg-error text-on-error'}`}>
                                    <Eye size={16} />
                                    <span>{buttonState?.type === 'watch' && buttonState.phase === 'counting' ? `${post.watchButtonText || post.watch_button_text || 'مشاهدة الملف'} (${buttonState.seconds})` : buttonState?.type === 'watch' && buttonState.phase === 'ready' ? 'الملف جاهز ✓' : post.watchButtonText || post.watch_button_text || 'مشاهدة الملف'}</span>
                                </button>
                            )}
                        </div>
                        )}
                    
                    {contentParts.rest && (
                        <div 
                            className="prose sm:prose-lg dark:prose-invert prose-headings:font-heading prose-headings:font-black prose-a:text-error prose-img:shadow-xl max-w-none mb-4 prose-p:text-justify text-main dark:text-main"
                            dangerouslySetInnerHTML={{ __html: sanitizeHTML(processContent(contentParts.rest, post.title)) }}
                        />
                    )}

                    {/* Share & CTA */}
                    <div className="border-t border-border dark:border-border pt-8 mt-0 flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <span className="font-bold text-main dark:text-on-primary text-sm">شارك</span>
                            <a href={`https://wa.me/?text=${encodeURIComponent(post.title + ' ' + window.location.href)}`} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-success flex items-center justify-center hover:opacity-80 transition-all text-on-primary" title="واتساب">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 6.5a8.5 8.5 0 0 1-3.5 16.2"/><path d="M3 21l1.7-5.9a8.5 8.5 0 1 1 5.8 5.8L3 21z"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="12" y1="8" x2="12" y2="16"/></svg>
                            </a>
                            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-info flex items-center justify-center hover:opacity-80 transition-all text-on-primary" title="فيسبوك">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                            </a>
                            <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title + ' ' + window.location.href)}`} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-black flex items-center justify-center hover:opacity-80 transition-all text-on-primary" title="تويتر">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l11.7 16.4L20 4"/><path d="M4 20l6.5-8.8"/><path d="M14.5 8.8L20 4"/></svg>
                            </a>
                            <a href={`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post.title)}`} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-info flex items-center justify-center hover:opacity-80 transition-all text-on-primary" title="تيليجرام">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.2 4.2L2.8 12.9c-.8.3-.7 1.5.1 1.7l5.1 1.4 2 6.3c.3.9 1.4.9 1.7 0L21.2 4.2z"/><path d="M11.9 15.7l6.5-6.5"/><path d="M9 21l3.4-5.8"/></svg>
                            </a>
                            <button onClick={() => { navigator.clipboard.writeText(window.location.href).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }); }} className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--bg-primary)] via-[var(--bg-primary)] to-[var(--bg-warning)] flex items-center justify-center hover:opacity-80 transition-all text-on-primary" title="انسخ الرابط">
                                {copied ? <span className="text-[10px] font-black">تم</span> : <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>}
                            </button>
                            <button onClick={() => { navigator.clipboard.writeText(window.location.href).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }).catch(() => { if (navigator.share) { navigator.share({ title: post.title, url: window.location.href }); } }); }} className="w-9 h-9 rounded-full bg-background0 flex items-center justify-center hover:opacity-80 transition-all text-on-primary" title="نسخ الرابط">
                                {copied ? <span className="text-[10px] font-black">تم</span> : <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>}
                            </button>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <a href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('السلام عليكم، لدي سؤال عن ' + post.title)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-4 bg-success text-on-primary font-black text-sm rounded-card hover:bg-success transition-all shadow-lg">
                                <MessageCircle size={18} />
                                <span>لدي سؤال؟</span>
                            </a>
                            <Link to="/courses" className="inline-flex items-center gap-2 px-6 py-4 bg-card dark:bg-white text-main dark:text-main font-black text-sm rounded-card shadow-lg hover:bg-error dark:hover:bg-error hover:text-on-primary transition-all">
                                <Play size={18} />
                                ابدأ التعلم الآن
                            </Link>
                        </div>
                    </div>
                </article>

                {/* Related Posts */}
                {relatedPosts.length > 0 && (
                <div className="container mx-auto px-4 max-w-5xl mt-16 mb-8">
                    <h2 className="text-2xl font-black text-main dark:text-on-primary mb-6">مقالات ذات صلة</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {relatedPosts.map((rp) => (
                            <Link key={rp.slug} to={`/books/${rp.slug}`} className="group block bg-white dark:bg-card rounded-card overflow-hidden shadow-md hover:shadow-xl transition-all border border-border dark:border-border">
                                <div className="aspect-[16/9] bg-surface dark:bg-card overflow-hidden">
                                    <Image src={rp.coverImage || ''} alt={rp.title} className="w-full h-full group-hover:scale-105" />
                                </div>
                                <div className="p-4">
                                    <p className="text-micro font-bold text-muted mb-1">{rp.date}</p>
                                    <h3 className="font-black text-sm text-main dark:text-on-primary group-hover:text-error transition-colors line-clamp-2">{rp.title}</h3>
                                    {rp.excerpt && <p className="text-xs text-muted dark:text-muted mt-1 line-clamp-2">{rp.excerpt}</p>}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
                )}
            </main>

            <PublicFooter />
        </div>
    );
};
