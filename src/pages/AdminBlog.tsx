import { useState, useEffect, useCallback } from 'react';

import { useShowNotification } from '../context/AppContext';
import { Plus, Search, Edit2, Trash2, ExternalLink, Calendar, User, Tag, Image as ImageIcon, Link as LinkIcon, Loader2, Save, X, BookOpen, Download, Eye, Star, Settings, MessageCircle, Send } from 'lucide-react';
import { api } from '../lib/api';
import { confirm } from '../lib/confirmDialog';
import { useSettingsStore } from '../store/settingsStore';

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
    contentType: string;   // notes | solutions | more | foundation
    curriculum: string;    // kuwait | qatar | uae | saudi
    level: string;         // primary | middle | secondary | basic | preparatory
    grade: string;         // 1-12
    term: string;          // 1 | 2 | ''
    subject: string;       // arabic | math | physics ...
    downloadLink: string;
    watchLink: string;
    isNew: boolean;
    views: number;
}

export const AdminBlog = () => {
    const showNotification = useShowNotification();
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('');
    const [contentPart1, setContentPart1] = useState('');
    const [contentPart2, setContentPart2] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPost, setCurrentPost] = useState<Partial<BlogPost> | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [libraryWhatsapp, setLibraryWhatsapp] = useState('');
    const [libraryTelegram, setLibraryTelegram] = useState('');
    const [savingSettings, setSavingSettings] = useState(false);
    const { libraryWhatsapp: savedWhatsapp, libraryTelegram: savedTelegram, setLibraryWhatsapp: saveWhatsapp, setLibraryTelegram: saveTelegram } = useSettingsStore();

    useEffect(() => {
        if (savedWhatsapp) setLibraryWhatsapp(savedWhatsapp);
        if (savedTelegram) setLibraryTelegram(savedTelegram);
    }, [savedWhatsapp, savedTelegram]);

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
            const parts = post.content.split('\n\n').filter(Boolean);
            setContentPart1(parts[0] || '');
            setContentPart2(parts.slice(1).join('\n\n'));
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
                views: 0,
            });
            setContentPart1('');
            setContentPart2('');
        }
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!await confirm('هل أنت متأكد من حذف هذا المقال؟')) return;
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

        const postData = { ...currentPost, content: contentPart1 + (contentPart2 ? '\n\n' + contentPart2 : '') };

        try {
            setSubmitting(true);
            if (currentPost.id) {
                await api.put(`/blog/${currentPost.id}`, postData);
                showNotification('تم تحديث المقال بنجاح', 'success');
            } else {
                await api.post('/blog', postData);
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
        (post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.category.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (!filterType || post.contentType === filterType)
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

            <button onClick={() => setShowSettings(s => !s)}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-xs"
            >
                <Settings size={14} />
                <span>إعدادات المكتبة</span>
            </button>

            {showSettings && (
                <div className="bg-white dark:bg-slate-900 p-5 border border-slate-100/50 dark:border-slate-800/50 shadow-sm rounded-2xl space-y-4">
                    <h3 className="font-black text-sm text-slate-900 dark:text-white">إعدادات صفحة المكتبة</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">رقم واتساب المكتبة</label>
                            <input type="text" value={libraryWhatsapp}
                                onChange={(e) => setLibraryWhatsapp(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 focus:border-[#E11D48] font-bold text-sm rounded-xl outline-none"
                                placeholder="مثال: 201234567890"
                                dir="ltr"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">معرف تليجرام المكتبة</label>
                            <input type="text" value={libraryTelegram}
                                onChange={(e) => setLibraryTelegram(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 focus:border-[#E11D48] font-bold text-sm rounded-xl outline-none"
                                placeholder="مثال: dareen_app"
                                dir="ltr"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3">
                        <button onClick={() => { setShowSettings(false); setLibraryWhatsapp(savedWhatsapp); setLibraryTelegram(savedTelegram); }}
                            className="px-4 py-2 font-bold text-slate-500 hover:text-slate-800 transition-all rounded-xl text-xs"
                        >إلغاء</button>
                        <button onClick={async () => {
                            setSavingSettings(true);
                            try {
                                await saveWhatsapp(libraryWhatsapp);
                                await saveTelegram(libraryTelegram);
                                showNotification('تم حفظ إعدادات المكتبة', 'success');
                                setShowSettings(false);
                            } catch { showNotification('حدث خطأ في الحفظ', 'error'); }
                            finally { setSavingSettings(false); }
                        }}
                            disabled={savingSettings}
                            className="px-5 py-2 bg-[#E11D48] text-white font-bold hover:bg-[#BE123C] transition-all disabled:bg-slate-400 rounded-xl text-xs"
                        >
                            {savingSettings ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-slate-900 p-4 border border-slate-100/50 dark:border-slate-800/50 shadow-sm space-y-4 rounded-2xl">
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
                <div className="flex flex-wrap items-center gap-2">
                    {[
                        { key: '', label: 'الكل', color: '#64748B' },
                        { key: 'foundation', label: 'التأسيس', color: '#7C3AED' },
                        { key: 'solutions', label: 'حل الكتب', color: '#2563EB' },
                        { key: 'notes', label: 'المذكرات', color: '#059669' },
                        { key: 'more', label: 'المزيد', color: '#D97706' },
                    ].map(btn => (
                        <button key={btn.key} onClick={() => setFilterType(btn.key)}
                            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all active:scale-95 ${filterType === btn.key ? 'text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                            style={filterType === btn.key ? { backgroundColor: btn.color } : undefined}>
                            {btn.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Inline Form */}
            {isModalOpen && currentPost && (
                <div className="bg-white dark:bg-slate-900 w-full overflow-hidden border border-slate-100/50 dark:border-slate-800/50 shadow-sm rounded-2xl">
                    <div className="p-4 bg-[#172554] text-white flex items-center justify-between rounded-t-2xl">
                        <h2 className="font-bold text-sm">{currentPost.id ? 'تعديل مقال' : 'إضافة مقال جديد'}</h2>
                        <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-xl bg-white/10 hover:bg-rose-500 transition-all" aria-label="إغلاق"><X size={18} /></button>
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
                                    <select value={currentPost.contentType} onChange={e => { const v = e.target.value; setCurrentPost(prev => ({ ...prev, contentType: v, ...((v === 'foundation' || v === 'more') ? { curriculum: '', level: '', grade: '', term: '', subject: '' } : {}) })); }} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-sm font-bold focus:border-[#E11D48] rounded-xl outline-none">
                                        <option value="notes">مذكرات</option>
                                        <option value="solutions">حل كتب</option>
                                        <option value="more">المزيد</option>
                                        <option value="foundation">تأسيس</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 block mb-1">المنهج</label>
                                    <select value={currentPost.curriculum} onChange={e => setCurrentPost({ ...currentPost, curriculum: e.target.value })} disabled={currentPost.contentType === 'foundation' || currentPost.contentType === 'more'} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-sm font-bold focus:border-[#E11D48] rounded-xl outline-none disabled:opacity-50">
                                        <option value="">بدون تحديد</option>
                                        <option value="kuwait">الكويت</option>
                                        <option value="qatar">قطر</option>
                                        <option value="uae">الإمارات</option>
                                        <option value="saudi">السعودية</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 block mb-1">المرحلة</label>
                                    <select value={currentPost.level} onChange={e => setCurrentPost({ ...currentPost, level: e.target.value })} disabled={currentPost.contentType === 'foundation' || currentPost.contentType === 'more'} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-sm font-bold focus:border-[#E11D48] rounded-xl outline-none disabled:opacity-50">
                                        <option value="">بدون تحديد</option>
                                        <option value="primary">ابتدائي</option>
                                        <option value="middle">متوسط</option>
                                        <option value="secondary">ثانوي</option>
                                        <option value="basic">أساسي (عمان)</option>
                                        <option value="preparatory">إعدادي (مصر)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 block mb-1">الصف</label>
                                    <select value={currentPost.grade} onChange={e => setCurrentPost({ ...currentPost, grade: e.target.value })} disabled={currentPost.contentType === 'foundation' || currentPost.contentType === 'more'} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-sm font-bold focus:border-[#E11D48] rounded-xl outline-none disabled:opacity-50">
                                        <option value="">بدون تحديد</option>
                                        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map(g => <option key={g} value={g}>صف {g}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 block mb-1">الفصل</label>
                                    <select value={currentPost.term} onChange={e => setCurrentPost({ ...currentPost, term: e.target.value })} disabled={currentPost.contentType === 'foundation' || currentPost.contentType === 'more'} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-sm font-bold focus:border-[#E11D48] rounded-xl outline-none disabled:opacity-50">
                                        <option value="">بدون</option>
                                        <option value="1">الفصل الأول</option>
                                        <option value="2">الفصل الثاني</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 block mb-1">المادة</label>
                                    <select value={currentPost.subject} onChange={e => setCurrentPost({ ...currentPost, subject: e.target.value })} disabled={currentPost.contentType === 'foundation' || currentPost.contentType === 'more'} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-sm font-bold focus:border-[#E11D48] rounded-xl outline-none disabled:opacity-50">
                                        <option value="">بدون تحديد</option>
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

                        <div className="flex items-center gap-4 flex-wrap">
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 block mb-1.5">الجزء الأول</span>
                                    <textarea
                                        rows={10}
                                        required
                                        value={contentPart1}
                                        onChange={(e) => setContentPart1(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 focus:border-[#E11D48] font-bold text-sm resize-none font-mono rounded-xl outline-none"
                                        placeholder="الجزء الأول من المحتوى..."
                                    />
                                </div>
                                <div className="flex flex-col gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 mb-1.5 flex items-center gap-1.5"><Download size={12} /> رابط التحميل</label>
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
                                        <label className="block text-[10px] font-bold text-slate-400 mb-1.5 flex items-center gap-1.5"><Eye size={12} /> رابط المشاهدة</label>
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
                                    <div className="flex-1">
                                        <span className="text-[10px] font-bold text-slate-400 block mb-1.5">الجزء الثاني</span>
                                        <textarea
                                            rows={6}
                                            value={contentPart2}
                                            onChange={(e) => setContentPart2(e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 focus:border-[#E11D48] font-bold text-sm resize-none font-mono rounded-xl outline-none"
                                            placeholder="الجزء الثاني من المحتوى..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 border-t border-slate-100/50 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3 rounded-xl">
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
                    </form>
                </div>
            )}

            {/* Posts Grid */}
            {isModalOpen ? null : loading ? (
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredPosts.map(post => (
                        <div key={post.id} className="bg-white dark:bg-slate-900 border border-slate-100/50 dark:border-slate-800/50 shadow-sm overflow-hidden rounded-2xl">
                            <div className="relative h-36 overflow-hidden">
                                <img src={post.coverImage || 'https://via.placeholder.com/400x200'} alt={post.title} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                                <div className="absolute top-2 right-2">
                                    <span className="text-[10px] font-bold px-2 py-1 rounded-lg" style={{ backgroundColor: '#E11D48', color: '#FFFFFF' }}>{post.category}</span>
                                </div>
                            </div>
                            <div className="p-3">
                                <h3 className="font-bold text-slate-900 dark:text-white mb-1 line-clamp-2 text-sm">{post.title}</h3>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 mb-2">
                                    <div className="flex items-center gap-1"><Calendar size={12} /> {post.date}</div>
                                    <div className="flex items-center gap-1"><User size={12} /> {post.author}</div>
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t border-slate-100/50 dark:border-slate-800/50">
                                    <div className="flex gap-2">
                                        <button onClick={() => handleOpenModal(post)} className="p-1.5 rounded-xl" style={{ color: '#2563EB' }} aria-label="تعديل"><Edit2 size={14} /></button>
                                        <button onClick={() => handleDelete(post.id)} className="p-1.5 rounded-xl" style={{ color: '#E11D48' }} aria-label="حذف"><Trash2 size={14} /></button>
                                    </div>
                                    <a href={`/books/${post.slug}`} target="_blank" rel="noopener noreferrer" className="p-1.5" style={{ color: '#94A3B8' }}><ExternalLink size={14} /></a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            </div>
        </div>


        </>
    );
};
