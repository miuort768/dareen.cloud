import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { MobileHeader } from '../../components/public/MobileHeader';
import { PublicFooter } from '../../components/public/PublicFooter';
import { SEO } from '../../components/SEO';
import { blogPosts as staticPosts, type BlogPost as BlogPostType } from '../../data/blogPosts';
import { Image } from '../../shared/components/ui';
import { Loader2, Download, Eye } from 'lucide-react';
import { api } from '../../lib/api';
import { useSettingsStore } from '../../store/settingsStore';
import DOMPurify from 'dompurify';
import { BlogPostHeader } from './BlogPostHeader';
import { BlogPostShareSection } from './BlogPostShareSection';
import { BlogPostRelatedPosts } from './BlogPostRelatedPosts';

const sanitizeHTML = (html: string) => DOMPurify.sanitize(html);

const processContent = (text: unknown, alt?: string): string => {
    if (!text) return '';
    if (typeof text !== 'string') return String(text);
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

export const BlogPost = () => {
    const { slug } = useParams<{ slug: string }>();
    const adminPhone = useSettingsStore(s => s.adminPhone);
    const whatsappNumber = adminPhone.replace(/\D/g, '');
    const [buttonState, setButtonState] = useState<{ type: 'download' | 'watch'; phase: 'counting' | 'ready'; seconds?: number } | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const { data: post, isLoading: loading } = useQuery<BlogPostType | null>({
        queryKey: ['blog-post', slug],
        queryFn: async () => {
            try {
                return await api.get<BlogPostType>(`/blog/${slug}`);
            } catch (err) {
                console.error('Failed to fetch blog post:', err);
                return staticPosts.find(p => p.slug === slug) || null;
            }
        },
        enabled: !!slug,
    });

    const { data: relatedPosts = [] } = useQuery<
        { slug: string; title: string; excerpt: string; coverImage: string; date: string }[]
    >({
        queryKey: ['blog-post-related', slug],
        queryFn: async () => {
            try {
                return await api.get<{ slug: string; title: string; excerpt: string; coverImage: string; date: string }[]>(`/blog/${slug}/related`);
            } catch (e) {
                console.warn(e);
                return [];
            }
        },
        enabled: !!slug,
    });

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

    const rawContent = typeof post.content === 'string' ? post.content : String(post.content || '');
    const content = rawContent || '';
    const contentParts = (() => {
        if (!content) return { first: '', rest: '' };
        const parts = content.split(/\n\n/);
        return { first: parts[0] || '', rest: parts.slice(1).join('\n\n') };
    })();



    return (
        <div className="min-h-full bg-background font-sans text-main relative flex flex-col">
            <SEO
                title={post.seoTitle || post.title}
                description={post.seoDescription || post.excerpt}
                keywords={post.focusKeyword || post.keywords}
                image={post.ogImage || post.coverImage}
                url={post.canonicalUrl || `https://dareen.cloud/books/${post.slug}`}
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
                    <BlogPostHeader post={post} slug={slug} />

                {/* Image + First Content Side by Side */}
                <div className="container mx-auto px-4 max-w-5xl mb-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-start">
                        <div className="w-full bg-surface overflow-hidden shadow-xl rounded-card">
                            <Image src={post.coverImage || ''} alt={post.title || ''} className="w-full h-auto" />
                        </div>
                        <div className="prose sm:prose-lg prose-headings:font-heading prose-headings:font-black prose-a:text-error prose-img:shadow-xl max-w-none prose-p:text-justify text-main"
                            dangerouslySetInnerHTML={{ __html: sanitizeHTML(processContent(contentParts.first, post.title)) }}
                        />
                    </div>
                </div>

                <article className="container mx-auto px-4 max-w-3xl">
                    
                    {/* Download & Watch Buttons */}
                        {(post.showButtons !== false && post.show_buttons !== 0) && (post.downloadLink || post.watchLink) && (
                        <div className="flex flex-wrap gap-3 justify-center my-8">
                            {post.downloadLink && (
                                <button onClick={(e) => handleButtonClick('download', post.downloadLink, e)}
                                    disabled={buttonState !== null && buttonState.type !== 'download'}
                                    className={`flex-1 inline-flex items-center justify-center gap-2 px-6 md:px-16 py-3 md:py-4 font-black text-xs sm:text-sm rounded-card hover:bg-error hover:text-on-error transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap ${buttonState?.type === 'download' && buttonState.phase === 'counting' ? 'bg-success text-on-success' : buttonState?.type === 'download' && buttonState.phase === 'ready' ? 'bg-success text-on-success ring-2 ring-success ring-offset-2' : 'bg-card text-on-primary'}`}>
                                    <Download size={16} />
                                    <span>{buttonState?.type === 'download' && buttonState.phase === 'counting' ? `${post.downloadButtonText || post.download_button_text || 'تحميل الملف'} (${buttonState.seconds})` : buttonState?.type === 'download' && buttonState.phase === 'ready' ? 'الملف جاهز' : post.downloadButtonText || post.download_button_text || 'تحميل الملف'}</span>
                                </button>
                            )}
                            {post.watchLink && (
                                <button onClick={(e) => handleButtonClick('watch', post.watchLink, e)}
                                    disabled={buttonState !== null && buttonState.type !== 'watch'}
                                    className={`flex-1 inline-flex items-center justify-center gap-2 px-6 md:px-16 py-3 md:py-4 font-black text-xs sm:text-sm rounded-card hover:bg-error-active transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap ${buttonState?.type === 'watch' && buttonState.phase === 'counting' ? 'bg-success text-on-success' : buttonState?.type === 'watch' && buttonState.phase === 'ready' ? 'bg-success text-on-success ring-2 ring-success ring-offset-2' : 'bg-error text-on-error'}`}>
                                    <Eye size={16} />
                                    <span>{buttonState?.type === 'watch' && buttonState.phase === 'counting' ? `${post.watchButtonText || post.watch_button_text || 'مشاهدة الملف'} (${buttonState.seconds})` : buttonState?.type === 'watch' && buttonState.phase === 'ready' ? 'الملف جاهز' : post.watchButtonText || post.watch_button_text || 'مشاهدة الملف'}</span>
                                </button>
                            )}
                        </div>
                        )}
                    
                    {contentParts.rest && (
                        <div 
                            className="prose sm:prose-lg prose-headings:font-heading prose-headings:font-black prose-a:text-error prose-img:shadow-xl max-w-none mb-4 prose-p:text-justify text-main"
                            dangerouslySetInnerHTML={{ __html: sanitizeHTML(processContent(contentParts.rest, post.title)) }}
                        />
                    )}

                    <BlogPostShareSection post={post} whatsappNumber={whatsappNumber} />
                </article>

                <BlogPostRelatedPosts posts={relatedPosts} />
            </main>

            <PublicFooter />
        </div>
    );
};
