import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PublicNavbar } from '../../components/public/PublicNavbar';
import { PublicFooter } from '../../components/public/PublicFooter';
import { SEO } from '../../components/SEO';
import { blogPosts as staticPosts } from '../../data/blogPosts';
import { Calendar, User, ArrowRight, Share2, Loader2 } from 'lucide-react';
import axios from 'axios';

export const BlogPost = () => {
    const { slug } = useParams<{ slug: string }>();
    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL || 'https://api.dareen-edu.com/api'}/blog/${slug}`);
                setPost(response.data);
            } catch (err) {
                console.error('Failed to fetch blog post:', err);
                const staticPost = staticPosts.find(p => p.slug === slug);
                setPost(staticPost || null);
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-black mb-4">المقال غير موجود</h1>
                    <Link to="/blog" className="text-red-600 font-bold underline">العودة للمدونة</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-full bg-white dark:bg-slate-950 font-sans text-gray-800 dark:text-slate-100 relative flex flex-col">
            <SEO
                title={post.title}
                description={post.excerpt}
                keywords={post.keywords}
                image={post.coverImage}
                url={`https://dareen-edu.com/blog/${post.slug}`}
                breadcrumbs={[
                    { name: 'الرئيسية', item: '/' },
                    { name: 'المدونة', item: '/blog' },
                    { name: post.title, item: `/blog/${post.slug}` }
                ]}
            />
            <PublicNavbar />

            <main className="flex-grow pt-24 md:pt-32 pb-20 relative">
                {/* Article Header */}
                <header className="container mx-auto px-4 max-w-4xl mb-12">
                    <Link to="/blog" className="inline-flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors font-bold text-sm mb-8">
                        <ArrowRight size={16} />
                        <span>العودة لجميع المقالات</span>
                    </Link>
                    
                    <div className="mb-6 flex flex-wrap gap-4 items-center">
                        <span className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-black text-xs px-3 py-1.5 uppercase tracking-widest">{post.category}</span>
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-slate-400 font-medium">
                            <div className="flex items-center gap-1.5"><Calendar size={14} /> <span>{post.date}</span></div>
                            <div className="flex items-center gap-1.5"><User size={14} /> <span>{post.author}</span></div>
                        </div>
                    </div>

                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-heading font-black text-slate-900 dark:text-white leading-tight mb-8">
                        {post.title}
                    </h1>
                </header>

                {/* Hero Image */}
                <div className="container mx-auto px-4 max-w-5xl mb-12">
                    <div className="w-full h-[300px] md:h-[500px] bg-gray-100 dark:bg-slate-900 overflow-hidden shadow-xl">
                        <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
                    </div>
                </div>

                {/* Article Content */}
                <article className="container mx-auto px-4 max-w-3xl">
                    <div 
                        className="prose prose-lg dark:prose-invert prose-headings:font-heading prose-headings:font-black prose-a:text-red-600 prose-img:shadow-xl max-w-none mb-12"
                        dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br/>') }}
                    />
                    
                    {/* Share & CTA */}
                    <div className="border-t border-gray-100 dark:border-slate-800 pt-8 mt-12 flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <span className="font-bold text-gray-900 dark:text-white">شارك المقال:</span>
                            <button className="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 transition-colors">
                                <Share2 size={18} />
                            </button>
                        </div>
                        
                        <Link to="/courses" className="px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black text-sm uppercase tracking-widest shadow-lg hover:bg-red-600 dark:hover:bg-red-500 hover:text-white transition-all">
                            ابدأ التعلم الآن
                        </Link>
                    </div>
                </article>
            </main>

            <PublicFooter />
        </div>
    );
};
