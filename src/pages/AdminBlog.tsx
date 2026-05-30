import { useState, useEffect, useCallback } from 'react';
import { useShowNotification } from '../context/AppContext';
import { Plus, Search, Edit2, Trash2, ExternalLink, Calendar, User, Tag, Image as ImageIcon, Link as LinkIcon, Loader2, Save, X, BookOpen, Download, Eye, Star } from 'lucide-react';
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
    // حقول التصنيف التعليمي
    contentType: string;   // notes | solutions | summaries | foundation
    curriculum: string;    // kuwait | qatar | uae | saudi
    level: string;         // primary | middle | secondary | basic | preparatory
    grade: string;         // 1-12
    term: string;          // 1 | 2 | ''
    subject: string;       // arabic | math | physics ...
    downloadLink: string;
    watchLink: string;
    isNew: boolean;
}

export const AdminBlog = () => {
    const showNotification = useShowNotification();
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPost, setCurrentPost] = useState<Partial<BlogPost> | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const fetchPosts = useCallback(async () => {
        try {
            setLoading(true);
            const data = await api.get<BlogPost[]>('/blog');
            setPosts(data);
            setLoading(false);
        } catch {
            showNotification('حدث خطأ في تحميل المقالات', 'error');
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

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
                author: 'فريق دارين',
                date: new Date().toISOString().split('T')[0],
                contentType: 'notes',
                curriculum: 'kuwait',
                level: 'middle',
                grade: '7',
                term: '1',
                subject: 'arabic',
                downloadLink: '',
                watchLink: '',
                isNew: false,
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
        } catch {
            showNotification('حدث خطأ في الحذف', 'error');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentPost?.title || !currentPost?.slug) {
            showNotification('يرجى إكمال الحقول المطلوبة', 'warning');
            return;
        }

        try {
            setSubmitting(true);
            if (currentPost.id) {
                await api.put(`/blog/${currentPost.id}`, currentPost);
                showNotification('تم تحديث المقال بنجاح', 'success');
            } else {
                await api.post('/blog', currentPost);
                showNotification('تم نشر المقال بنجاح', 'success');
            }
            setIsModalOpen(false);
            fetchPosts();
        } catch (err) {
            showNotification(err.message || 'حدث خطأ في الحفظ', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredPosts = posts.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
        <div className="min-h-full pb-24 overflow-x-hidden relative" dir="rtl">
            <div className="max-w-[1600px] mx-auto px-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100/50 dark:border-slate-800/50 px-4 md:px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#E11D4812' }}>
                        <BookOpen size={22} style={{ color: '#E11D48' }} />
                    </div>
                    <div>
                        <h1 className="text-lg md:text-xl font-black text-slate-900 dark:text-white leading-tight">المقالات التعليمية</h1>
                        <p className="text-[11px] font-bold text-slate-400 mt-0.5">إدارة وإضافة المقالات والدروس على المنصة</p>
                    </div>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#E11D48] text-white font-bold rounded-xl hover:bg-[#BE123C] transition-all shadow-sm active:scale-95"
                >
                    <Plus size={18} />
                    <span className="text-xs">إضافة مقال</span>
                </button>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 border border-slate-100/50 dark:border-slate-800/50 shadow-sm flex items-center gap-4 rounded-2xl">
                <div className="relative flex-grow">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2" size={20} style={{ color: '#94A3B8' }} />
                    <input
                        type="text"
                        placeholder="بحث عن مقالات أو تصنيفات..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pr-12 py-3 focus:border-[#E11D48] transition-all font-bold text-sm rounded-xl outline-none"
                    />
                </div>
            </div>

            {/* Posts Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-10 h-10 rounded-full border-2 border-slate-200 border-t-[#E11D48] animate-spin" />
                </div>
            ) : filteredPosts.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: '#E11D4812' }}>
                        <BookOpen size={22} style={{ color: '#E11D48' }} />
                    </div>
                    <p className="text-sm font-bold text-slate-400">لا توجد مقالات بعد! أضف أول مقال الآن</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPosts.map(post => (
                        <div key={post.id} className="bg-white dark:bg-slate-900 border border-slate-100/50 dark:border-slate-800/50 shadow-sm group overflow-hidden rounded-2xl">
                            <div className="relative h-40 overflow-hidden">
                                <img src={post.coverImage || 'https://via.placeholder.com/400x200'} alt={post.title} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute top-2 right-2">
                                    <span className="text-[10px] font-bold px-2 py-1 rounded-lg" style={{ backgroundColor: '#E11D48', color: '#FFFFFF' }}>{post.category}</span>
                                </div>
                            </div>
                            <div className="p-5">
                                <h3 className="font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 min-h-[3rem] text-sm">{post.title}</h3>
                                <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 mb-4">
                                    <div className="flex items-center gap-1"><Calendar size={12} /> {post.date}</div>
                                    <div className="flex items-center gap-1"><User size={12} /> {post.author}</div>
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-slate-100/50 dark:border-slate-800/50">
                                    <div className="flex gap-2">
                                        <button onClick={() => handleOpenModal(post)} className="p-2 rounded-xl transition-all active:scale-90" style={{ color: '#2563EB' }}><Edit2 size={16} /></button>
                                        <button onClick={() => handleDelete(post.id)} className="p-2 rounded-xl transition-all active:scale-90" style={{ color: '#E11D48' }}><Trash2 size={16} /></button>
                                    </div>
                                    <a href={`/books/${post.slug}`} target="_blank" rel="noopener noreferrer" className="p-2 transition-all active:scale-90" style={{ color: '#94A3B8' }}><ExternalLink size={16} /></a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            </div>
        </div>

        {/* Modal Form */}
        {isModalOpen && currentPost && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-sm border border-slate-100/50 dark:border-slate-800/50 rounded-2xl">
                        <div className="p-4 bg-[#172554] text-white flex items-center justify-between rounded-t-2xl">
                            <h2 className="font-bold text-sm">{currentPost.id ? 'تعديل مقال' : 'إضافة مقال جديد'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-xl bg-white/10 hover:bg-rose-500 transition-all"><X size={18} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">عنوان المقال</label>
                                    <input
                                        required
                                        type="text"
                                        value={currentPost.title}
                                        onChange={(e) => setCurrentPost({ ...currentPost, title: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 focus:border-[#E11D48] font-bold text-sm rounded-xl outline-none"
                                        placeholder="مثال: أفضل نصائح الدراسة..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">الرابط المختصر (Slug)</label>
                                    <div className="relative">
                                        <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2" size={16} style={{ color: '#94A3B8' }} />
                                        <input
                                            required
                                            type="text"
                                            value={currentPost.slug}
                                            onChange={(e) => setCurrentPost({ ...currentPost, slug: e.target.value.replace(/\s+/g, '-').toLowerCase() })}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 pl-10 focus:border-[#E11D48] font-bold text-sm text-left rounded-xl outline-none"
                                            dir="ltr"
                                            placeholder="أفضل-نصائح-الدراسة"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">التصنيف</label>
                                    <div className="relative">
                                        <Tag className="absolute right-4 top-1/2 -translate-y-1/2" size={16} style={{ color: '#94A3B8' }} />
                                        <input
                                            type="text"
                                            value={currentPost.category}
                                            onChange={(e) => setCurrentPost({ ...currentPost, category: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pr-10 py-3 focus:border-[#E11D48] font-bold text-sm rounded-xl outline-none"
                                            placeholder="مثل: نصائح دراسية"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">الكاتب</label>
                                    <input
                                        type="text"
                                        value={currentPost.author}
                                        onChange={(e) => setCurrentPost({ ...currentPost, author: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 focus:border-[#E11D48] font-bold text-sm rounded-xl outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">التاريخ</label>
                                    <input
                                        type="date"
                                        value={currentPost.date?.split('T')[0]}
                                        onChange={(e) => setCurrentPost({ ...currentPost, date: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 focus:border-[#E11D48] font-bold text-sm rounded-xl outline-none"
                                    />
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl" style={{ backgroundColor: '#E11D4808', border: '1px solid #E11D4815' }}>
                                <p className="text-[10px] font-bold mb-4" style={{ color: '#E11D48' }}>تصنيف تعليمي — سيظهر في صفحة المواد</p>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 block mb-1">نوع المحتوى</label>
                                        <select value={currentPost.contentType} onChange={e => setCurrentPost({ ...currentPost, contentType: e.target.value })} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-sm font-bold focus:border-[#E11D48] rounded-xl outline-none">
                                            <option value="notes">ملخصات</option>
                                            <option value="solutions">حلول</option>
                                            <option value="summaries">مراجعات</option>
                                            <option value="foundation">تأسيس</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 block mb-1">المنهج</label>
                                        <select value={currentPost.curriculum} onChange={e => setCurrentPost({ ...currentPost, curriculum: e.target.value })} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-sm font-bold focus:border-[#E11D48] rounded-xl outline-none">
                                            <option value="kuwait">الكويت</option>
                                            <option value="qatar">قطر</option>
                                            <option value="uae">الإمارات</option>
                                            <option value="saudi">السعودية</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 block mb-1">المرحلة</label>
                                        <select value={currentPost.level} onChange={e => setCurrentPost({ ...currentPost, level: e.target.value })} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-sm font-bold focus:border-[#E11D48] rounded-xl outline-none">
                                            <option value="primary">ابتدائي</option>
                                            <option value="middle">متوسط</option>
                                            <option value="secondary">ثانوي</option>
                                            <option value="basic">أساسي (عمان)</option>
                                            <option value="preparatory">إعدادي (مصر)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 block mb-1">الصف</label>
                                        <select value={currentPost.grade} onChange={e => setCurrentPost({ ...currentPost, grade: e.target.value })} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-sm font-bold focus:border-[#E11D48] rounded-xl outline-none">
                                            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map(g => <option key={g} value={g}>صف {g}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 block mb-1">الفصل</label>
                                        <select value={currentPost.term} onChange={e => setCurrentPost({ ...currentPost, term: e.target.value })} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-sm font-bold focus:border-[#E11D48] rounded-xl outline-none">
                                            <option value="1">الفصل الأول</option>
                                            <option value="2">الفصل الثاني</option>
                                            <option value="">بدون</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 block mb-1">المادة</label>
                                        <select value={currentPost.subject} onChange={e => setCurrentPost({ ...currentPost, subject: e.target.value })} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-sm font-bold focus:border-[#E11D48] rounded-xl outline-none">
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

                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">رابط الصورة الرئيسية</label>
                                <div className="relative">
                                    <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2" size={16} style={{ color: '#94A3B8' }} />
                                    <input
                                        type="url"
                                        value={currentPost.coverImage}
                                        onChange={(e) => setCurrentPost({ ...currentPost, coverImage: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 pl-10 focus:border-[#E11D48] font-bold text-sm text-left rounded-xl outline-none"
                                        dir="ltr"
                                        placeholder="https://..."
                                    />
                                </div>
                                {currentPost.coverImage && (
                                    <div className="mt-2 h-32 w-full border border-slate-100/50 dark:border-slate-800/50 overflow-hidden rounded-xl">
                                        <img
                                            src={currentPost.coverImage}
                                            alt="معاينة"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=Invalid+Image+Link';
                                            }}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5"><Download size={12} /> رابط التحميل</label>
                                    <div className="relative">
                                        <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2" size={16} style={{ color: '#94A3B8' }} />
                                        <input
                                            type="url"
                                            value={currentPost.downloadLink || ''}
                                            onChange={(e) => setCurrentPost({ ...currentPost, downloadLink: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 pl-10 focus:border-[#E11D48] font-bold text-sm text-left rounded-xl outline-none"
                                            dir="ltr"
                                            placeholder="https://..."
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5"><Eye size={12} /> رابط المشاهدة</label>
                                    <div className="relative">
                                        <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2" size={16} style={{ color: '#94A3B8' }} />
                                        <input
                                            type="url"
                                            value={currentPost.watchLink || ''}
                                            onChange={(e) => setCurrentPost({ ...currentPost, watchLink: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 pl-10 focus:border-[#E11D48] font-bold text-sm text-left rounded-xl outline-none"
                                            dir="ltr"
                                            placeholder="https://..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={currentPost.isNew || false}
                                        onChange={(e) => setCurrentPost({ ...currentPost, isNew: e.target.checked })}
                                        className="w-4 h-4 rounded border-slate-300 text-[#E11D48] focus:ring-[#E11D48]"
                                    />
                                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                        <Star size={12} className="text-amber-500" /> جديد
                                    </span>
                                </label>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">الكلمات المفتاحية (Keywords) — مفصولة بفواصل</label>
                                <input
                                    type="text"
                                    value={currentPost.keywords}
                                    onChange={(e) => setCurrentPost({ ...currentPost, keywords: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 focus:border-[#E11D48] font-bold text-sm rounded-xl outline-none"
                                    placeholder="دراسة, نصائح, تفوق"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">وصف مختصر (يظهر في محركات البحث)</label>
                                <textarea
                                    rows={2}
                                    value={currentPost.excerpt}
                                    onChange={(e) => setCurrentPost({ ...currentPost, excerpt: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 focus:border-[#E11D48] font-bold text-sm resize-none rounded-xl outline-none"
                                    placeholder="وصف قصير يظهر في نتائج البحث..."
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">محتوى المقال (كود HTML)</label>
                                <textarea
                                    rows={10}
                                    required
                                    value={currentPost.content}
                                    onChange={(e) => setCurrentPost({ ...currentPost, content: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 focus:border-[#E11D48] font-bold text-sm resize-none font-mono rounded-xl outline-none"
                                    placeholder="اكتب محتوى المقال هنا..."
                                />
                            </div>
                        </form>

                        <div className="p-5 border-t border-slate-100/50 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="px-5 py-2.5 font-bold text-slate-500 hover:text-slate-800 transition-all rounded-xl"
                            >
                                إلغاء
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                onClick={handleSubmit}
                                className="flex items-center gap-2 px-6 py-2.5 bg-[#E11D48] text-white font-bold hover:bg-[#BE123C] transition-all disabled:bg-slate-400 shadow-sm active:scale-95 rounded-xl"
                            >
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} />}
                                <span className="text-xs">نشر المقال</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
