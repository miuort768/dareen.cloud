import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PublicNavbar } from '../../components/public/PublicNavbar';
import { PublicFooter } from '../../components/public/PublicFooter';
import { SEO } from '../../components/SEO';
import { blogPosts as staticPosts } from '../../data/blogPosts';
import { Calendar, User, ArrowLeft, BookOpen, Loader2 } from 'lucide-react';
import { api } from '../../lib/api';

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

                    {/* Quick Categories Section */}
                    <div className="grid grid-cols-5 gap-2 sm:gap-4 max-w-5xl mx-auto mb-16">
                        {[
                            { name: 'الكتب المدرسية', icon: '📚', color: 'from-blue-500 to-blue-600', path: '/courses?category=books' },
                            { name: 'حل الكتب', icon: '📝', color: 'from-emerald-500 to-emerald-600', path: '/courses?category=solutions' },
                            { name: 'المذكرات', icon: '🗒️', color: 'from-purple-500 to-purple-600', path: '/courses?category=notes' },
                            { name: 'ملخصات', icon: '✨', color: 'from-amber-500 to-amber-600', path: '/courses?category=summaries' },
                            { name: 'المزيد', icon: '➕', color: 'from-slate-700 to-slate-800', path: '/courses' },
                        ].map((cat, i) => (
                            <Link 
                                key={i}
                                to={cat.path}
                                onClick={() => {
                                    window.scrollTo(0, 0);
                                }}
                                className="group flex flex-col items-center gap-2"
                            >
                                <div className={cn(
                                    "w-12 h-12 sm:w-20 sm:h-20 rounded-2xl sm:rounded-[2rem] bg-gradient-to-br flex items-center justify-center text-xl sm:text-3xl shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-2 group-hover:shadow-2xl relative overflow-hidden",
                                    cat.color
                                )}>
                                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <span className="relative z-10">{cat.icon}</span>
                                </div>
                                <span className="text-[9px] sm:text-sm font-black text-slate-800 dark:text-white text-center leading-tight">
                                    {cat.name}
                                </span>
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
