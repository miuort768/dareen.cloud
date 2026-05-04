import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PublicNavbar } from '../../components/public/PublicNavbar';
import { PublicFooter } from '../../components/public/PublicFooter';
import { SEO } from '../../components/SEO';
import { blogPosts as staticPosts } from '../../data/blogPosts';
import { Calendar, User, ArrowLeft, BookOpen, Loader2 } from 'lucide-react';
import { api } from '../../lib/api';
import { cn } from '../../lib/utils';

export const Blog = () => {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const data = await api.get<any[]>('/blog');
                setPosts(data.length > 0 ? data : staticPosts);
            } catch (err) {
                console.error('Failed to fetch blog posts:', err);
                setPosts(staticPosts);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    return (
        <div className="min-h-full bg-gray-50 dark:bg-slate-950 font-sans text-gray-800 dark:text-slate-100 relative flex flex-col">
            <SEO
                title="المدونة التعليمية | مقالات ونصائح للتفوق الدراسي"
                description="استكشف أحدث المقالات التعليمية، نصائح المذاكرة، وتحديثات المناهج في السعودية، الكويت، ودول الخليج من خبراء دارين السابعة."
                keywords="مدونة دارين, مقالات تعليمية, نصائح المذاكرة, اختبار القدرات, المنهج الكويتي, المنهج السعودي, تعليم عن بعد"
                url="https://dareen-edu.com/blog"
                breadcrumbs={[
                    { name: 'الرئيسية', item: '/' },
                    { name: 'المدونة', item: '/blog' }
                ]}
            />
            <PublicNavbar />

            <main className="flex-grow pt-24 md:pt-32 pb-20 relative">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gray-900 text-green-400 rounded-full mb-6">
                            <BookOpen size={14} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">منصة المعرفة</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-heading font-black text-slate-900 dark:text-white mb-6">
                            المدونة <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-green-600">التعليمية</span>
                        </h1>
                        <p className="text-gray-500 dark:text-slate-400 font-medium md:text-lg">
                            مقالات حصرية، نصائح ذهبية للمذاكرة، وكل ما يهم الطالب وولي الأمر في مسيرة التفوق الدراسي.
                        </p>
                    </div>

                    {/* Premium Sharp Categories Section */}
                    <div className="grid grid-cols-5 gap-3 sm:gap-6 max-w-5xl mx-auto mb-20">
                        {[
                            { name: 'الكتب المدرسية', icon: '📚', color: 'from-indigo-600 to-blue-700', shadow: 'shadow-blue-500/20', path: '/courses?category=books' },
                            { name: 'حل الكتب', icon: '📝', color: 'from-emerald-600 to-teal-700', shadow: 'shadow-emerald-500/20', path: '/courses?category=solutions' },
                            { name: 'المذكرات', icon: '🗒️', color: 'from-violet-600 to-purple-700', shadow: 'shadow-purple-500/20', path: '/courses?category=notes' },
                            { name: 'ملخصات', icon: '✨', color: 'from-rose-600 to-red-700', shadow: 'shadow-red-500/20', path: '/courses?category=summaries' },
                            { name: 'المزيد', icon: '➕', color: 'from-slate-800 to-slate-950', shadow: 'shadow-slate-500/20', path: '/courses' },
                        ].map((cat, i) => (
                            <Link 
                                key={i}
                                to={cat.path}
                                onClick={() => window.scrollTo(0, 0)}
                                className="group relative"
                            >
                                <div className={cn(
                                    "relative z-10 w-full aspect-square sm:h-28 rounded-none border-2 border-slate-900 dark:border-white/20 bg-gradient-to-br flex flex-col items-center justify-center gap-2 transition-all duration-300 group-hover:-translate-y-2 group-hover:-translate-x-1 group-active:translate-y-0 group-active:translate-x-0 overflow-hidden shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]",
                                    cat.color
                                )}>
                                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <span className="text-2xl sm:text-4xl filter drop-shadow-md transform group-hover:scale-125 transition-transform duration-500">{cat.icon}</span>
                                    <span className="text-[8px] sm:text-xs font-black text-white text-center leading-tight px-1 uppercase tracking-tighter sm:tracking-normal">
                                        {cat.name}
                                    </span>
                                </div>
                                {/* Sharp Offset Background */}
                                <div className="absolute inset-0 bg-slate-900 dark:bg-white/5 translate-x-1 translate-y-1 -z-0"></div>
                            </Link>
                        ))}
                    </div>


                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                            {posts.map(post => (
                                <Link key={post.id} to={`/blog/${post.slug}`} className="group bg-white dark:bg-slate-900 rounded-none shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-slate-800 flex flex-col h-full overflow-hidden">
                                    <div className="relative h-56 overflow-hidden">
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10"></div>
                                        <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        <div className="absolute top-4 right-4 z-20">
                                            <span className="bg-red-600 text-white text-xs font-black px-3 py-1 uppercase tracking-wider shadow-md">{post.category}</span>
                                        </div>
                                    </div>
                                    <div className="p-6 flex flex-col flex-grow">
                                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-slate-400 font-medium mb-4">
                                            <div className="flex items-center gap-1.5"><Calendar size={14} /> <span>{post.date?.split('T')[0]}</span></div>
                                            <div className="flex items-center gap-1.5"><User size={14} /> <span>{post.author}</span></div>
                                        </div>
                                        <h2 className="text-xl font-black text-gray-900 dark:text-white mb-3 font-heading group-hover:text-red-600 transition-colors leading-snug">
                                            {post.title}
                                        </h2>
                                        <p className="text-gray-500 dark:text-slate-400 text-sm mb-6 flex-grow leading-relaxed">
                                            {post.excerpt}
                                        </p>
                                        <div className="inline-flex items-center gap-2 text-green-600 dark:text-green-500 font-black text-xs uppercase tracking-widest mt-auto">
                                            <span>اقرأ المقال كامل</span>
                                            <ArrowLeft size={16} className="group-hover:-translate-x-2 transition-transform" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <PublicFooter />
        </div>
    );
};
