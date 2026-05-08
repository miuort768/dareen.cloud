import { useState, useEffect } from 'react';
import { useApp } from '../context/useApp';
import { Plus, Search, Edit2, Trash2, ExternalLink, Calendar, User, Tag, Image as ImageIcon, Link as LinkIcon, Loader2, Save, X, BookOpen } from 'lucide-react';
import { api } from '../lib/api';

interface BlogPost {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    coverImage: string;
    category: string;
    keywords: string;
    author: string;
    date: string;
    // نظام التصنيف الجديد
    contentType: string;   // notes | solutions | summaries | foundation
    curriculum: string;    // kuwait | qatar | uae | saudi
    level: string;         // primary | middle | secondary | basic | preparatory
    grade: string;         // 1-12
    term: string;          // 1 | 2 | ''
    subject: string;       // arabic | math | physics ...
}

export const AdminBlog = () => {
    const { showNotification } = useApp();
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPost, setCurrentPost] = useState<Partial<BlogPost> | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const data = await api.get<BlogPost[]>('/blog');
            setPosts(data);
        } catch (err) {
            showNotification('فشل في جلب المقالات', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (post: BlogPost | null = null) => {
        if (post) {
            setCurrentPost(post);
        } else {
            setCurrentPost({
                title: '',
                slug: '',
                excerpt: '',
                content: '',
                coverImage: '',
                category: 'عام',
                keywords: '',
                author: 'إدارة دارين',
                date: new Date().toISOString().split('T')[0],
                contentType: 'notes',
                curriculum: 'kuwait',
                level: 'middle',
                grade: '7',
                term: '1',
                subject: 'arabic',
            });
        }
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا المقال؟')) return;
        try {
            await api.delete(`/blog/${id}`);
            showNotification('تم حذف المقال بنجاح', 'success');
            setPosts(posts.filter(p => p.id !== id));
        } catch (err) {
            showNotification('فشل حذف المقال', 'error');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentPost?.title || !currentPost?.slug) {
            showNotification('يرجى ملء الحقول الأساسية', 'warning');
            return;
        }

        try {
            setSubmitting(true);
            if (currentPost.id) {
                await api.put(`/blog/${currentPost.id}`, currentPost);
                showNotification('تم تحديث المقال بنجاح', 'success');
            } else {
                await api.post('/blog', currentPost);
                showNotification('تم إضافة المقال بنجاح', 'success');
            }
            setIsModalOpen(false);
            fetchPosts();
        } catch (err: any) {
            showNotification(err.message || 'فشل حفظ المقال', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredPosts = posts.filter(post => 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white">إدارة المدونة التعليمية</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">أضف وحرر المقالات لزيادة ظهور المنصة في محركات البحث.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white font-black rounded-none hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
                >
                    <Plus size={20} />
                    <span>مقال جديد</span>
                </button>
            </div>

            {/* Search & Filters */}
            <div className="bg-white dark:bg-slate-900 p-4 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
                <div className="relative flex-grow">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="بحث في العناوين أو التصنيفات..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border-none pr-12 py-3 focus:ring-2 focus:ring-red-500 transition-all font-bold text-sm"
                    />
                </div>
            </div>

            {/* Posts Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
                </div>
            ) : filteredPosts.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800">
                    <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500 dark:text-slate-400 font-bold">لا يوجد مقالات حالياً، ابدأ بإضافة أول مقال!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPosts.map(post => (
                        <div key={post.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-md group overflow-hidden">
                            <div className="relative h-40 overflow-hidden">
                                <img src={post.coverImage || 'https://via.placeholder.com/400x200'} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute top-2 right-2">
                                    <span className="bg-red-600 text-white text-[10px] font-black px-2 py-1 uppercase">{post.category}</span>
                                </div>
                            </div>
                            <div className="p-5">
                                <h3 className="font-black text-slate-900 dark:text-white mb-2 line-clamp-2 min-h-[3rem]">{post.title}</h3>
                                <div className="flex items-center gap-3 text-[10px] text-slate-500 mb-4">
                                    <div className="flex items-center gap-1"><Calendar size={12} /> {post.date}</div>
                                    <div className="flex items-center gap-1"><User size={12} /> {post.author}</div>
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800">
                                    <div className="flex gap-2">
                                        <button onClick={() => handleOpenModal(post)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"><Edit2 size={18} /></button>
                                        <button onClick={() => handleDelete(post.id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"><Trash2 size={18} /></button>
                                    </div>
                                    <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"><ExternalLink size={18} /></a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Form */}
            {isModalOpen && currentPost && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <h2 className="text-xl font-black">{currentPost.id ? 'تعديل مقال' : 'إضافة مقال جديد'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><X size={20} /></button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">عنوان المقال</label>
                                    <input
                                        required
                                        type="text"
                                        value={currentPost.title}
                                        onChange={(e) => setCurrentPost({ ...currentPost, title: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none px-4 py-3 focus:ring-2 focus:ring-red-500 font-bold text-sm"
                                        placeholder="مثال: أفضل طرق المذاكرة..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">الرابط المختصر (Slug)</label>
                                    <div className="relative">
                                        <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input
                                            required
                                            type="text"
                                            value={currentPost.slug}
                                            onChange={(e) => setCurrentPost({ ...currentPost, slug: e.target.value.replace(/\s+/g, '-').toLowerCase() })}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none px-4 py-3 pl-10 focus:ring-2 focus:ring-red-500 font-bold text-sm text-left"
                                            dir="ltr"
                                            placeholder="best-study-tips"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">التصنيف</label>
                                    <div className="relative">
                                        <Tag className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input
                                            type="text"
                                            value={currentPost.category}
                                            onChange={(e) => setCurrentPost({ ...currentPost, category: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none pr-10 py-3 focus:ring-2 focus:ring-red-500 font-bold text-sm"
                                            placeholder="مثال: نصائح تعليمية"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">الكاتب</label>
                                    <input
                                        type="text"
                                        value={currentPost.author}
                                        onChange={(e) => setCurrentPost({ ...currentPost, author: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none px-4 py-3 focus:ring-2 focus:ring-red-500 font-bold text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">التاريخ</label>
                                    <input
                                        type="date"
                                        value={currentPost.date?.split('T')[0]}
                                        onChange={(e) => setCurrentPost({ ...currentPost, date: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none px-4 py-3 focus:ring-2 focus:ring-red-500 font-bold text-sm"
                                    />
                                </div>
                            </div>

                            {/* ── Classification Fields ── */}
                            <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-800 p-4">
                                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4">تصنيف المحتوى — يظهر في نظام التصفح</p>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase">نوع المحتوى</label>
                                        <select value={currentPost.contentType} onChange={e => setCurrentPost({...currentPost, contentType: e.target.value})} className="w-full bg-white dark:bg-slate-800 border-none px-3 py-2.5 text-sm font-bold focus:ring-2 focus:ring-indigo-500">
                                            <option value="notes">مذكرات</option>
                                            <option value="solutions">حل كتب</option>
                                            <option value="summaries">ملخصات</option>
                                            <option value="foundation">تأسيس</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase">المنهج</label>
                                        <select value={currentPost.curriculum} onChange={e => setCurrentPost({...currentPost, curriculum: e.target.value})} className="w-full bg-white dark:bg-slate-800 border-none px-3 py-2.5 text-sm font-bold focus:ring-2 focus:ring-indigo-500">
                                            <option value="kuwait">كويتي</option>
                                            <option value="qatar">قطري</option>
                                            <option value="uae">إماراتي</option>
                                            <option value="saudi">سعودي</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase">المرحلة</label>
                                        <select value={currentPost.level} onChange={e => setCurrentPost({...currentPost, level: e.target.value})} className="w-full bg-white dark:bg-slate-800 border-none px-3 py-2.5 text-sm font-bold focus:ring-2 focus:ring-indigo-500">
                                            <option value="primary">ابتدائي</option>
                                            <option value="middle">متوسط</option>
                                            <option value="secondary">ثانوي</option>
                                            <option value="basic">أساسي (قطر)</option>
                                            <option value="preparatory">إعدادي (إمارات)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase">الصف</label>
                                        <select value={currentPost.grade} onChange={e => setCurrentPost({...currentPost, grade: e.target.value})} className="w-full bg-white dark:bg-slate-800 border-none px-3 py-2.5 text-sm font-bold focus:ring-2 focus:ring-indigo-500">
                                            {['1','2','3','4','5','6','7','8','9','10','11','12'].map(g => <option key={g} value={g}>الصف {g}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase">الترم</label>
                                        <select value={currentPost.term} onChange={e => setCurrentPost({...currentPost, term: e.target.value})} className="w-full bg-white dark:bg-slate-800 border-none px-3 py-2.5 text-sm font-bold focus:ring-2 focus:ring-indigo-500">
                                            <option value="1">ترم أول</option>
                                            <option value="2">ترم ثاني</option>
                                            <option value="">الكل</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase">المادة</label>
                                        <select value={currentPost.subject} onChange={e => setCurrentPost({...currentPost, subject: e.target.value})} className="w-full bg-white dark:bg-slate-800 border-none px-3 py-2.5 text-sm font-bold focus:ring-2 focus:ring-indigo-500">
                                            <option value="arabic">عربي</option>
                                            <option value="math">رياضيات</option>
                                            <option value="islamic">إسلامية</option>
                                            <option value="english">إنجليزي</option>
                                            <option value="science">علوم</option>
                                            <option value="physics">فيزياء</option>
                                            <option value="chemistry">كيمياء</option>
                                            <option value="biology">أحياء</option>
                                            <option value="history">تاريخ</option>
                                            <option value="geography">جغرافيا</option>
                                            <option value="social">اجتماعيات</option>
                                            <option value="computer">حاسب آلي</option>
                                            <option value="stats">إحصاء</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">رابط صورة الغلاف</label>
                                <div className="relative">
                                    <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="url"
                                        value={currentPost.coverImage}
                                        onChange={(e) => setCurrentPost({ ...currentPost, coverImage: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none px-4 py-3 pl-10 focus:ring-2 focus:ring-red-500 font-bold text-sm text-left"
                                        dir="ltr"
                                        placeholder="https://..."
                                    />
                                </div>
                                {currentPost.coverImage && (
                                    <div className="mt-2 h-32 w-full border border-slate-100 dark:border-slate-800 overflow-hidden">
                                        <img 
                                            src={currentPost.coverImage} 
                                            alt="Preview" 
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=Invalid+Image+Link';
                                            }}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">الكلمات الدلالية (Keywords) - مفصولة بفاصلة</label>
                                <input
                                    type="text"
                                    value={currentPost.keywords}
                                    onChange={(e) => setCurrentPost({ ...currentPost, keywords: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-none px-4 py-3 focus:ring-2 focus:ring-red-500 font-bold text-sm"
                                    placeholder="سيو، تعليم، الكويت، السعودية"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">مقتطف المقال (الظاهر في الخارج)</label>
                                <textarea
                                    rows={2}
                                    value={currentPost.excerpt}
                                    onChange={(e) => setCurrentPost({ ...currentPost, excerpt: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-none px-4 py-3 focus:ring-2 focus:ring-red-500 font-bold text-sm resize-none"
                                    placeholder="وصف مختصر للمقال لجذب القراء..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">محتوى المقال (يدعم HTML)</label>
                                <textarea
                                    rows={10}
                                    required
                                    value={currentPost.content}
                                    onChange={(e) => setCurrentPost({ ...currentPost, content: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-none px-4 py-3 focus:ring-2 focus:ring-red-500 font-bold text-sm resize-none font-mono"
                                    placeholder="اكتب محتوى المقال هنا..."
                                />
                            </div>
                        </form>

                        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="px-6 py-3 font-bold text-slate-500 hover:text-slate-800 transition-colors"
                            >
                                إلغاء
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                onClick={handleSubmit}
                                className="flex items-center gap-2 px-10 py-3 bg-red-600 text-white font-black hover:bg-red-700 transition-all disabled:bg-slate-400 shadow-lg shadow-red-600/20"
                            >
                                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save size={20} />}
                                <span>حفظ المقال الآن</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
