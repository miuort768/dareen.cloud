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
                    <div className="text-center max-w-3xl mx-auto mb-8">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gray-900 text-green-400 rounded-full mb-6">
                            <BookOpen size={14} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">منصة المعرفة</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-heading font-black text-slate-900 dark:text-white mb-6">
                            مدونة <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-green-600">دارين السابعة</span>
                        </h1>
                        <p className="text-slate-600 dark:text-slate-300 font-bold text-sm md:text-xl leading-relaxed max-w-4xl mx-auto">
                            اكتشف عالماً من المعرفة المتجددة مع مدونة دارين السابعة؛ دليلك الشامل للتفوق الدراسي، أحدث المناهج الخليجية، ونصائح الخبراء لرحلة تعليمية متميزة وفريدة من نوعها.
                        </p>
                    </div>

                    {/* Interactive Two-Tier Categories Section */}
                    {(() => {
                        const [view, setView] = useState<'types' | 'curriculums'>('types');
                        const [selectedType, setSelectedType] = useState('');

                        const types = [
                            { id: 'books', name: 'الكتب المدرسية', color: 'bg-indigo-600 hover:bg-indigo-700' },
                            { id: 'solutions', name: 'حل الكتب المدرسية', color: 'bg-emerald-600 hover:bg-emerald-700' },
                            { id: 'notes', name: 'المذكرات', color: 'bg-violet-600 hover:bg-violet-700' },
                            { id: 'summaries', name: 'ملخصات', color: 'bg-rose-600 hover:bg-rose-700' },
                        ];

                        const curriculums = [
                            { id: 'kuwait', name: 'منهج كويتي', color: 'bg-blue-600 hover:bg-blue-700' },
                            { id: 'qatar', name: 'منهج قطري', color: 'bg-red-800 hover:bg-red-900' },
                            { id: 'uae', name: 'منهج إماراتي', color: 'bg-green-700 hover:bg-green-800' },
                            { id: 'saudi', name: 'منهج سعودي', color: 'bg-emerald-800 hover:bg-emerald-900' },
                        ];

                        return (
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 max-w-5xl mx-auto mb-12 px-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {view === 'types' ? (
                                    <>
                                        {types.map((cat) => (
                                            <button 
                                                key={cat.id}
                                                onClick={() => {
                                                    setSelectedType(cat.id);
                                                    setView('curriculums');
                                                }}
                                                className={cn(
                                                    "relative h-14 sm:h-16 flex items-center justify-center transition-all duration-300 border-b-4 border-black/20 overflow-hidden group",
                                                    cat.color
                                                )}
                                            >
                                                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                                <span className="relative z-10 text-[10px] sm:text-xs font-black text-white text-center uppercase tracking-widest">
                                                    {cat.name}
                                                </span>
                                            </button>
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
                                                    "relative h-14 sm:h-16 flex items-center justify-center transition-all duration-300 border-b-4 border-black/20 overflow-hidden group animate-in zoom-in-95 duration-300",
                                                    curr.color
                                                )}
                                            >
                                                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                                <span className="relative z-10 text-[10px] sm:text-xs font-black text-white text-center uppercase tracking-widest">
                                                    {curr.name}
                                                </span>
                                            </Link>
                                        ))}
                                    </>
                                )}
                                
                                {/* More button */}
                                <Link 
                                    to="/courses"
                                    onClick={() => window.scrollTo(0, 0)}
                                    className={cn(
                                        "relative h-14 sm:h-16 flex items-center justify-center transition-all duration-300 border-b-4 border-black/20 overflow-hidden group bg-slate-900 hover:bg-black col-span-2 md:col-span-1"
                                    )}
                                >
                                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                    <span className="relative z-10 text-[10px] sm:text-xs font-black text-white text-center uppercase tracking-widest">
                                        المزيد
                                    </span>
                                </Link>

                                {/* Foundation Button - Full width on desktop, below More on mobile */}
                                <Link 
                                    to="/courses?category=foundation"
                                    onClick={() => window.scrollTo(0, 0)}
                                    className={cn(
                                        "relative h-14 sm:h-16 flex items-center justify-center transition-all duration-300 border-b-4 border-black/20 overflow-hidden group bg-orange-600 hover:bg-orange-700 col-span-2 md:col-span-5"
                                    )}
                                >
                                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                    <span className="relative z-10 text-[10px] sm:text-xs font-black text-white text-center uppercase tracking-widest">
                                        تأسيس
                                    </span>
                                </Link>

                                {view === 'curriculums' && (
                                    <button 
                                        onClick={() => setView('types')}
                                        className="col-span-2 md:col-span-5 text-[10px] font-bold text-gray-400 hover:text-red-600 transition-colors mt-2 uppercase tracking-tighter"
                                    >
                                        ← العودة للتصنيفات
                                    </button>
                                )}
                            </div>

                        );
                    })()}


                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
                        </div>
                    ) : (
                        <div className="hidden md:flex flex-col gap-6 max-w-5xl mx-auto">
                            {posts.slice(0, 2).map(post => (
                                <Link key={post.id} to={`/blog/${post.slug}`} className="group bg-white dark:bg-slate-900 rounded-none shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-slate-800 flex flex-col md:flex-row h-full overflow-hidden">
                                    <div className="relative w-full md:w-[40%] aspect-video overflow-hidden shrink-0">
                                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-10"></div>
                                        <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                        <div className="absolute top-3 right-3 z-20">
                                            <span className="bg-red-600 text-white text-[9px] font-black px-2 py-1 uppercase tracking-wider shadow-sm">{post.category}</span>
                                        </div>
                                    </div>
                                    <div className="p-5 md:p-8 flex flex-col flex-grow justify-center">
                                        <div className="flex items-center gap-4 text-[10px] text-gray-500 dark:text-slate-400 font-medium mb-3">
                                            <div className="flex items-center gap-1.5"><Calendar size={14} /> <span>{post.date?.split('T')[0]}</span></div>
                                            <div className="flex items-center gap-1.5"><User size={14} /> <span>{post.author}</span></div>
                                        </div>
                                        <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-3 font-heading group-hover:text-red-600 transition-colors leading-snug">
                                            {post.title}
                                        </h2>
                                        <p className="text-gray-500 dark:text-slate-400 text-sm md:text-base mb-4 line-clamp-2 leading-relaxed">
                                            {post.excerpt}
                                        </p>
                                        <div className="inline-flex items-center gap-2 text-green-600 dark:text-green-500 font-black text-[10px] uppercase tracking-[0.2em]">
                                            <span>عرض التفاصيل</span>
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
