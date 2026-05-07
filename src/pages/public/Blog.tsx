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
        <div className="min-h-full bg-[#fafafa] dark:bg-slate-950 font-sans text-gray-800 dark:text-slate-100 relative flex flex-col">
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
            
            <main className="flex-grow pt-24 md:pt-32 pb-16 relative overflow-hidden bg-[#fafafa] dark:bg-slate-950">
                {/* Premium Background Elements */}
                <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.08]" 
                     style={{ 
                         backgroundImage: 'radial-gradient(circle at 5% 10%, #4F46E5 0%, transparent 35%), radial-gradient(circle at 95% 90%, #7C3AED 0%, transparent 35%)',
                         filter: 'blur(100px)'
                     }}>
                </div>
                <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.02]"
                     style={{ 
                         backgroundImage: 'url("https://www.transparenttextures.com/patterns/simple-dashed.png")',
                         backgroundSize: '150px 150px'
                     }}>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50/50 dark:bg-indigo-500/10 backdrop-blur-sm border border-indigo-100 dark:border-indigo-500/20 rounded-full mb-6">
                            <BookOpen size={14} className="text-indigo-600" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600/80">منصة المعرفة الذكية</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-heading font-black text-slate-900 dark:text-white mb-6">
                            مدونة <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-600">دارين السابعة</span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-bold text-sm md:text-lg leading-relaxed max-w-2xl mx-auto">
                            دليلك الشامل للتفوق الدراسي، أحدث المناهج الخليجية، ونصائح الخبراء لرحلة تعليمية متميزة وفريدة من نوعها.
                        </p>
                    </div>

                    {/* Interactive Categories Section - Redesigned */}
                    {(() => {
                        const [view, setView] = useState<'types' | 'curriculums'>('types');
                        const [selectedType, setSelectedType] = useState('');

                        const types = [
                            { id: 'foundation', name: 'التأسيس', color: 'from-orange-500 to-orange-700', link: '/courses?category=foundation' },
                            { id: 'solutions', name: 'حل الكتب', color: 'from-emerald-600 to-emerald-800', link: '' },
                            { id: 'notes', name: 'المذكرات', color: 'from-violet-600 to-violet-800', link: '' },
                            { id: 'summaries', name: 'ملخصات', color: 'from-rose-600 to-rose-800', link: '' },
                        ];

                        const curriculums = [
                            { id: 'kuwait', name: 'منهج كويتي', color: 'from-blue-600 to-blue-800' },
                            { id: 'qatar', name: 'منهج قطري', color: 'from-red-800 to-red-950' },
                            { id: 'uae', name: 'منهج إماراتي', color: 'from-green-700 to-green-900' },
                            { id: 'saudi', name: 'منهج سعودي', color: 'from-emerald-800 to-emerald-950' },
                        ];

                        return (
                            <div className="max-w-5xl mx-auto mb-16">
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 px-2">
                                    {view === 'types' ? (
                                        <>
                                            {types.map((cat) => (
                                                cat.link ? (
                                                    <Link
                                                        key={cat.id}
                                                        to={cat.link}
                                                        onClick={() => window.scrollTo(0, 0)}
                                                        className={cn(
                                                            "relative h-16 flex items-center justify-center transition-all duration-300 shadow-lg shadow-black/5 hover:shadow-indigo-500/20 group bg-gradient-to-br",
                                                            cat.color
                                                        )}
                                                    >
                                                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                        <span className="relative z-10 text-[10px] sm:text-xs font-black text-white text-center uppercase tracking-widest px-2">
                                                            {cat.name}
                                                        </span>
                                                    </Link>
                                                ) : (
                                                    <button 
                                                        key={cat.id}
                                                        onClick={() => {
                                                            setSelectedType(cat.id);
                                                            setView('curriculums');
                                                        }}
                                                        className={cn(
                                                            "relative h-16 flex items-center justify-center transition-all duration-300 shadow-lg shadow-black/5 hover:shadow-indigo-500/20 group bg-gradient-to-br",
                                                            cat.color
                                                        )}
                                                    >
                                                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                        <span className="relative z-10 text-[10px] sm:text-xs font-black text-white text-center uppercase tracking-widest px-2">
                                                            {cat.name}
                                                        </span>
                                                    </button>
                                                )
                                            ))}
                                        </>
                                    ) : (
                                        <>
                                            {curriculums.map((curr) => (
                                                <Link 
                                                    key={curr.id}
                                                    to={`/courses?category=${selectedType}&curriculum=${curr.id}`}
                                                    onClick={() => window.scrollTo(0, 0)}
                                                    className={cn(
                                                        "relative h-16 flex items-center justify-center transition-all duration-300 shadow-lg shadow-black/5 hover:shadow-indigo-500/20 group bg-gradient-to-br animate-in zoom-in-95 duration-300",
                                                        curr.color
                                                    )}
                                                >
                                                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                    <span className="relative z-10 text-[10px] sm:text-xs font-black text-white text-center uppercase tracking-widest px-2">
                                                        {curr.name}
                                                    </span>
                                                </Link>
                                            ))}
                                        </>
                                    )}
                                    
                                    <Link 
                                        to="/courses"
                                        className="relative h-16 flex items-center justify-center transition-all duration-300 shadow-lg shadow-black/5 hover:bg-indigo-600 group bg-slate-900 col-span-2 md:col-span-1"
                                    >
                                        <span className="relative z-10 text-[10px] sm:text-xs font-black text-white text-center uppercase tracking-widest">
                                            المزيد
                                        </span>
                                    </Link>

                                </div>
                                
                                {view === 'curriculums' && (
                                    <button 
                                        onClick={() => setView('types')}
                                        className="w-full text-center text-[10px] font-black text-gray-400 hover:text-indigo-600 transition-colors mt-4 uppercase tracking-tighter"
                                    >
                                        ← العودة للتصنيفات الرئيسية
                                    </button>
                                )}
                            </div>
                        );
                    })()}


                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24">
                            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">جاري تحميل المعرفة...</span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                            {posts.map((post, idx) => (
                                <Link 
                                    key={post.id} 
                                    to={`/blog/${post.slug}`} 
                                    className={cn(
                                        "group bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl rounded-none shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 border border-gray-100 dark:border-slate-800/50 flex flex-col h-full overflow-hidden",
                                        idx === 0 && "md:col-span-2 md:flex-row md:min-h-[400px]"
                                    )}
                                >
                                    <div className={cn(
                                        "relative w-full overflow-hidden shrink-0",
                                        idx === 0 ? "md:w-[50%] aspect-video md:aspect-auto" : "aspect-video"
                                    )}>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 z-10"></div>
                                        <img 
                                            src={post.coverImage} 
                                            alt={post.title} 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                                        />
                                        <div className="absolute top-4 right-4 z-20">
                                            <span className="bg-indigo-600 text-white text-[9px] font-black px-3 py-1.5 uppercase tracking-wider shadow-xl">
                                                {post.category}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-6 md:p-10 flex flex-col flex-grow justify-center">
                                        <div className="flex items-center gap-4 text-[10px] text-gray-400 dark:text-slate-500 font-black uppercase tracking-widest mb-4">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar size={14} className="text-indigo-500" /> 
                                                <span>{post.date?.split('T')[0]}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <User size={14} className="text-indigo-500" /> 
                                                <span>{post.author}</span>
                                            </div>
                                        </div>
                                        <h2 className={cn(
                                            "font-black text-gray-900 dark:text-white mb-4 font-heading group-hover:text-indigo-600 transition-colors leading-tight",
                                            idx === 0 ? "text-2xl md:text-3xl" : "text-xl"
                                        )}>
                                            {post.title}
                                        </h2>
                                        <p className="text-gray-500 dark:text-slate-400 text-sm md:text-base mb-6 line-clamp-2 leading-relaxed font-medium">
                                            {post.excerpt}
                                        </p>
                                        <div className="mt-auto inline-flex items-center gap-3 text-indigo-600 dark:text-indigo-400 font-black text-xs uppercase tracking-[0.2em]">
                                            <span>اقرأ المقال بالكامل</span>
                                            <ArrowLeft size={18} className="group-hover:-translate-x-2 transition-transform" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {!loading && posts.length === 0 && (
                        <div className="text-center py-24">
                            <BookOpen size={48} className="text-gray-200 mx-auto mb-4" />
                            <p className="text-gray-400 font-bold">لا توجد مقالات حالياً، ننتظرك قريباً!</p>
                        </div>
                    )}
                </div>
            </main>

            <PublicFooter />
        </div>
    );
};
