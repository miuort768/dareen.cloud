import { useState, useEffect, useCallback } from 'react';

import { Image } from '../shared/components/ui';
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
    showButtons: boolean;
    downloadButtonText: string;
    watchButtonText: string;
    isNew: boolean;
    views: number;
    // حقول SEO
    seoTitle: string;
    seoDescription: string;
    ogImage: string;
    focusKeyword: string;
    readingTime: number;
    canonicalUrl: string;
    robotsIndex: boolean;
    isFeatured: boolean;
    tags: string;
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
            const data = await api.get<BlogPost[]>('/blog?all=true');
            setPosts(data.map(post => ({
                ...post,
                fileSize: post.fileSize || post.file_size,
                showButtons: post.showButtons ?? (post.show_buttons === 1 || post.show_buttons === true),
                downloadButtonText: post.downloadButtonText || post.download_button_text,
                watchButtonText: post.watchButtonText || post.watch_button_text,
            })));
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
                showButtons: true,
                downloadButtonText: '',
                watchButtonText: '',
                isNew: false,
                views: 0,
                // SEO defaults
                seoTitle: '',
                seoDescription: '',
                ogImage: '',
                focusKeyword: '',
                readingTime: 0,
                canonicalUrl: '',
                robotsIndex: true,
                isFeatured: false,
                tags: '',
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
            <div className="max-w-page mx-auto px-2 space-y-6">
            <div className="bg-card rounded-2xl shadow-sm border border-border px-4 md:px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-error-soft text-error flex items-center justify-center shrink-0">
                        <BookOpen size={22} />
                    </div>
                    <div>
                        <h1 className="text-lg md:text-xl font-black text-main leading-tight">المقالات التعليمية</h1>
                        <p className="text-xs font-bold text-muted mt-0.5">إدارة وإضافة المقالات والدروس على المنصة</p>
                    </div>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-error text-on-error font-bold rounded-xl hover:bg-error-hover transition-all shadow-sm active:scale-95"
                >
                    <Plus size={18} />
                    <span className="text-xs">إضافة مقال</span>
                </button>
            </div>

            <button onClick={() => setShowSettings(s => !s)}
                className="flex items-center gap-2 px-4 py-2.5 bg-surface dark:bg-card text-muted font-bold rounded-xl hover:bg-hover transition-all text-xs"
            >
                <Settings size={14} />
                <span>إعدادات المكتبة</span>
            </button>

            {showSettings && (
                <div className="bg-card p-5 border border-border shadow-sm rounded-2xl space-y-4">
                    <h3 className="font-black text-sm text-main">إعدادات صفحة المكتبة</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-micro font-bold text-muted mb-1.5">رقم واتساب المكتبة</label>
                            <input type="text" value={libraryWhatsapp}
                                onChange={(e) => setLibraryWhatsapp(e.target.value)}
                                className="w-full bg-surface dark:bg-card border border-border px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-focus font-bold text-sm rounded-xl outline-none"
                                placeholder="مثال: 201234567890"
                                dir="ltr"
                            />
                        </div>
                        <div>
                            <label className="block text-micro font-bold text-muted mb-1.5">معرف تليجرام المكتبة</label>
                            <input type="text" value={libraryTelegram}
                                onChange={(e) => setLibraryTelegram(e.target.value)}
                                className="w-full bg-surface dark:bg-card border border-border px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-focus font-bold text-sm rounded-xl outline-none"
                                placeholder="مثال: dareen_app"
                                dir="ltr"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3">
                        <button onClick={() => { setShowSettings(false); setLibraryWhatsapp(savedWhatsapp); setLibraryTelegram(savedTelegram); }}
                            className="px-4 py-2 font-bold text-muted hover:text-main transition-all rounded-xl text-xs"
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
                            className="px-5 py-2 bg-error text-on-error font-bold hover:bg-error-hover transition-all disabled:opacity-50 rounded-xl text-xs"
                        >
                            {savingSettings ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-card p-4 border border-border shadow-sm space-y-4 rounded-2xl">
                <div className="relative flex-grow">
                    <Search className="absolute start-4 top-1/2 -translate-y-1/2 text-dim" size={20} />
                    <input
                        type="text"
                        placeholder="بحث عن مقالات أو تصنيفات..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-surface dark:bg-card border border-border ps-12 py-3 focus:outline-none focus:ring-2 focus:ring-focus transition-all font-bold text-sm rounded-xl outline-none"
                    />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {[
                        { key: '', label: 'الكل' },
                        { key: 'foundation', label: 'التأسيس' },
                        { key: 'solutions', label: 'حل الكتب' },
                        { key: 'notes', label: 'المذكرات' },
                        { key: 'more', label: 'المزيد' },
                    ].map(btn => (
                        <button key={btn.key} onClick={() => setFilterType(btn.key)}
                            className={cn(
                                "px-4 py-2 text-xs font-bold rounded-xl transition-all active:scale-95",
                                filterType === btn.key
                                    ? "bg-error text-on-error shadow-sm"
                                    : "text-muted bg-surface dark:bg-card hover:bg-hover"
                            )}>
                            {btn.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Inline Form */}
            {isModalOpen && currentPost && (
                <div className="bg-card w-full overflow-hidden border border-border shadow-sm rounded-2xl">
                    <div className="p-4 bg-primary text-on-primary flex items-center justify-between rounded-t-2xl">
                        <h2 className="font-bold text-sm">{currentPost.id ? 'تعديل مقال' : 'إضافة مقال جديد'}</h2>
                        <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-xl bg-white/10 hover:bg-error transition-all" aria-label="إغلاق"><X size={18} /></button>
                    </div>

                    <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-micro font-bold text-muted mb-1.5">عنوان المقال</label>
                                <input
                                    required
                                    type="text"
                                    value={currentPost.title}
                                    onChange={(e) => setCurrentPost({ ...currentPost, title: e.target.value })}
                                    className="w-full bg-surface dark:bg-card border border-border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-focus font-bold text-sm rounded-xl outline-none"
                                    placeholder="مثال: أفضل نصائح الدراسة..."
                                />
                            </div>
                            <div>
                                <label className="block text-micro font-bold text-muted mb-1.5">الرابط المختصر (Slug)</label>
                                <div className="relative">
                                    <LinkIcon className="absolute end-4 top-1/2 -translate-y-1/2 text-dim" size={16} />
                                    <input
                                        required
                                        type="text"
                                        value={currentPost.slug}
                                        onChange={(e) => setCurrentPost({ ...currentPost, slug: e.target.value.replace(/\s+/g, '-').toLowerCase() })}
                                        className="w-full bg-surface dark:bg-card border border-border px-4 py-3 pe-10 focus:outline-none focus:ring-2 focus:ring-focus font-bold text-sm text-end rounded-xl outline-none"
                                        dir="ltr"
                                        placeholder="أفضل-نصائح-الدراسة"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div>
                                <label className="block text-micro font-bold text-muted mb-1.5">التصنيف</label>
                                <div className="relative">
                                    <Tag className="absolute start-4 top-1/2 -translate-y-1/2 text-dim" size={16} />
                                    <input
                                        type="text"
                                        value={currentPost.category}
                                        onChange={(e) => setCurrentPost({ ...currentPost, category: e.target.value })}
                                        className="w-full bg-surface dark:bg-card border border-border ps-10 py-3 focus:outline-none focus:ring-2 focus:ring-focus font-bold text-sm rounded-xl outline-none"
                                        placeholder="مثل: نصائح دراسية"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-micro font-bold text-muted mb-1.5">الكاتب</label>
                                <input
                                    type="text"
                                    value={currentPost.author}
                                    onChange={(e) => setCurrentPost({ ...currentPost, author: e.target.value })}
                                    className="w-full bg-surface dark:bg-card border border-border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-focus font-bold text-sm rounded-xl outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-micro font-bold text-muted mb-1.5">التاريخ</label>
                                <input
                                    type="date"
                                    value={currentPost.date?.split('T')[0]}
                                    onChange={(e) => setCurrentPost({ ...currentPost, date: e.target.value })}
                                    className="w-full bg-surface dark:bg-card border border-border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-focus font-bold text-sm rounded-xl outline-none"
                                />
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-error-soft/50 border border-error/10">
                            <p className="text-micro font-bold mb-4 text-error">تصنيف تعليمي — سيظهر في صفحة المواد</p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-micro font-bold text-dim block mb-1">نوع المحتوى</label>
                                    <select value={currentPost.contentType} onChange={e => { const v = e.target.value; setCurrentPost(prev => ({ ...prev, contentType: v, ...((v === 'foundation' || v === 'more') ? { curriculum: '', level: '', grade: '', term: '', subject: '' } : {}) })); }} className="w-full bg-card border border-border px-3 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-focus rounded-xl outline-none">
                                        <option value="notes">مذكرات</option>
                                        <option value="solutions">حل كتب</option>
                                        <option value="more">المزيد</option>
                                        <option value="foundation">تأسيس</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-micro font-bold text-dim block mb-1">المنهج</label>
                                    <select value={currentPost.curriculum} onChange={e => setCurrentPost({ ...currentPost, curriculum: e.target.value })} disabled={currentPost.contentType === 'foundation' || currentPost.contentType === 'more'} className="w-full bg-card border border-border px-3 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-focus rounded-xl outline-none disabled:opacity-50">
                                        <option value="">بدون تحديد</option>
                                        <option value="kuwait">الكويت</option>
                                        <option value="qatar">قطر</option>
                                        <option value="uae">الإمارات</option>
                                        <option value="saudi">السعودية</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-micro font-bold text-dim block mb-1">المرحلة</label>
                                    <select value={currentPost.level} onChange={e => setCurrentPost({ ...currentPost, level: e.target.value })} disabled={currentPost.contentType === 'foundation' || currentPost.contentType === 'more'} className="w-full bg-card border border-border px-3 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-focus rounded-xl outline-none disabled:opacity-50">
                                        <option value="">بدون تحديد</option>
                                        <option value="primary">ابتدائي</option>
                                        <option value="middle">متوسط</option>
                                        <option value="secondary">ثانوي</option>
                                        <option value="basic">أساسي (عمان)</option>
                                        <option value="preparatory">إعدادي (مصر)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-micro font-bold text-dim block mb-1">الصف</label>
                                    <select value={currentPost.grade} onChange={e => setCurrentPost({ ...currentPost, grade: e.target.value })} disabled={currentPost.contentType === 'foundation' || currentPost.contentType === 'more'} className="w-full bg-card border border-border px-3 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-focus rounded-xl outline-none disabled:opacity-50">
                                        <option value="">بدون تحديد</option>
                                        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map(g => <option key={g} value={g}>صف {g}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-micro font-bold text-dim block mb-1">الفصل</label>
                                    <select value={currentPost.term} onChange={e => setCurrentPost({ ...currentPost, term: e.target.value })} disabled={currentPost.contentType === 'foundation' || currentPost.contentType === 'more'} className="w-full bg-card border border-border px-3 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-focus rounded-xl outline-none disabled:opacity-50">
                                        <option value="">بدون</option>
                                        <option value="1">الفصل الأول</option>
                                        <option value="2">الفصل الثاني</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-micro font-bold text-dim block mb-1">المادة</label>
                                    <select value={currentPost.subject} onChange={e => setCurrentPost({ ...currentPost, subject: e.target.value })} disabled={currentPost.contentType === 'foundation' || currentPost.contentType === 'more'} className="w-full bg-card border border-border px-3 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-focus rounded-xl outline-none disabled:opacity-50">
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

                        {(currentPost.contentType === 'foundation' || currentPost.contentType === 'notes') && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-micro font-bold text-dim block mb-1">رابط المصدر</label>
                                <div className="relative">
                                    <LinkIcon className="absolute end-4 top-1/2 -translate-y-1/2 text-dim" size={16} />
                                    <input type="url" value={currentPost.source || ''} onChange={e => setCurrentPost({ ...currentPost, source: e.target.value })}
                                        className="w-full bg-surface dark:bg-card border border-border px-4 py-3 pe-10 focus:outline-none focus:ring-2 focus:ring-focus font-bold text-sm text-end rounded-xl outline-none"
                                        dir="ltr" placeholder="https://..." />
                                </div>
                            </div>
                            <div>
                                <label className="text-micro font-bold text-dim block mb-1">حجم الملف</label>
                                <input type="text" value={currentPost.fileSize || ''} onChange={e => setCurrentPost({ ...currentPost, fileSize: e.target.value })}
                                    className="w-full bg-surface dark:bg-card border border-border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-focus font-bold text-sm rounded-xl outline-none"
                                    placeholder="2.5 MB" />
                            </div>
                        </div>
                        )}

                        <div>
                            <label className="block text-micro font-bold text-muted mb-1.5">رابط الصورة الرئيسية</label>
                            <div className="relative">
                                <ImageIcon className="absolute end-4 top-1/2 -translate-y-1/2 text-dim" size={16} />
                                <input
                                    type="url"
                                    value={currentPost.coverImage}
                                    onChange={(e) => setCurrentPost({ ...currentPost, coverImage: e.target.value })}
                                    className="w-full bg-surface dark:bg-card border border-border px-4 py-3 pe-10 focus:outline-none focus:ring-2 focus:ring-focus font-bold text-sm text-end rounded-xl outline-none"
                                    dir="ltr"
                                    placeholder="https://..."
                                />
                            </div>
                            {currentPost.coverImage && (
                                <div className="mt-2 h-32 w-full border border-border overflow-hidden rounded-xl">
                                    <img
                                        src={currentPost.coverImage}
                                        alt="معاينة"
                                        loading="lazy"
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
                                    className="w-4 h-4 rounded border-border text-error focus:ring-focus"
                                />
                                <span className="text-micro font-bold text-muted flex items-center gap-1">
                                    <Star size={12} className="text-warning" /> جديد
                                </span>
                            </label>
                        </div>

                        <div>
                            <label className="block text-micro font-bold text-muted mb-1.5">الكلمات المفتاحية (Keywords) — مفصولة بفواصل</label>
                            <input
                                type="text"
                                value={currentPost.keywords}
                                onChange={(e) => setCurrentPost({ ...currentPost, keywords: e.target.value })}
                                className="w-full bg-surface dark:bg-card border border-border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-focus font-bold text-sm rounded-xl outline-none"
                                placeholder="دراسة, نصائح, تفوق"
                            />
                        </div>

                        <div>
                            <label className="block text-micro font-bold text-muted mb-1.5">وصف مختصر (يظهر في محركات البحث)</label>
                            <textarea
                                rows={2}
                                value={currentPost.excerpt}
                                onChange={(e) => setCurrentPost({ ...currentPost, excerpt: e.target.value })}
                                className="w-full bg-surface dark:bg-card border border-border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-focus font-bold text-sm resize-none rounded-xl outline-none"
                                placeholder="وصف قصير يظهر في نتائج البحث..."
                            />
                        </div>

                        <div>
                            <label className="block text-micro font-bold text-muted mb-1.5">محتوى المقال (كود HTML)</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <span className="text-micro font-bold text-dim block mb-1.5">الجزء الأول</span>
                                    <textarea
                                        rows={10}
                                        required
                                        value={contentPart1}
                                        onChange={(e) => setContentPart1(e.target.value)}
                                        className="w-full bg-surface dark:bg-card border border-border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-focus font-bold text-sm resize-none font-mono rounded-xl outline-none"
                                        placeholder="الجزء الأول من المحتوى..."
                                    />
                                </div>
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center justify-between p-3 bg-surface dark:bg-card/50 rounded-xl border border-border">
                                        <span className="text-micro font-bold text-muted">إظهار أزرار التحميل والمشاهدة</span>
                                        <button type="button" onClick={() => setCurrentPost({ ...currentPost, showButtons: !currentPost.showButtons })}
                                            className={`w-12 h-6 rounded-full transition-colors relative ${currentPost.showButtons ? 'bg-success' : 'bg-dim dark:bg-hover'}`}>
                                            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${currentPost.showButtons ? 'end-0.5 translate-x-6' : 'end-0.5'}`} />
                                        </button>
                                    </div>
                                    <div>
                                        <label className="block text-micro font-bold text-dim mb-1.5 flex items-center gap-1.5"><Download size={12} /> رابط التحميل</label>
                                        <div className="relative">
                                            <LinkIcon className="absolute end-4 top-1/2 -translate-y-1/2 text-dim" size={16} />
                                            <input
                                                type="url"
                                                value={currentPost.downloadLink || ''}
                                                onChange={(e) => setCurrentPost({ ...currentPost, downloadLink: e.target.value })}
                                                className="w-full bg-surface dark:bg-card border border-border px-4 py-3 pe-10 focus:outline-none focus:ring-2 focus:ring-focus font-bold text-sm text-end rounded-xl outline-none"
                                                dir="ltr"
                                                placeholder="https://..."
                                            />
                                        </div>
                                        <label className="block text-micro font-bold text-dim mt-2 mb-1.5">نص زر التحميل</label>
                                        <input type="text" value={currentPost.downloadButtonText || ''} onChange={(e) => setCurrentPost({ ...currentPost, downloadButtonText: e.target.value })}
                                            className="w-full bg-surface dark:bg-card border border-border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-focus font-bold text-sm text-start rounded-xl outline-none"
                                            placeholder="تحميل الملف" />
                                    </div>
                                    <div>
                                        <label className="block text-micro font-bold text-dim mb-1.5 flex items-center gap-1.5"><Eye size={12} /> رابط المشاهدة</label>
                                        <div className="relative">
                                            <LinkIcon className="absolute end-4 top-1/2 -translate-y-1/2 text-dim" size={16} />
                                            <input
                                                type="url"
                                                value={currentPost.watchLink || ''}
                                                onChange={(e) => setCurrentPost({ ...currentPost, watchLink: e.target.value })}
                                                className="w-full bg-surface dark:bg-card border border-border px-4 py-3 pe-10 focus:outline-none focus:ring-2 focus:ring-focus font-bold text-sm text-end rounded-xl outline-none"
                                                dir="ltr"
                                                placeholder="https://..."
                                            />
                                        </div>
                                        <label className="block text-micro font-bold text-dim mt-2 mb-1.5">نص زر المشاهدة</label>
                                        <input type="text" value={currentPost.watchButtonText || ''} onChange={(e) => setCurrentPost({ ...currentPost, watchButtonText: e.target.value })}
                                            className="w-full bg-surface dark:bg-card border border-border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-focus font-bold text-sm text-start rounded-xl outline-none"
                                            placeholder="مشاهدة الملف" />
                                    </div>
                                    <div className="flex-1">
                                        <span className="text-micro font-bold text-dim block mb-1.5">الجزء الثاني</span>
                                        <textarea
                                            rows={6}
                                            value={contentPart2}
                                            onChange={(e) => setContentPart2(e.target.value)}
                                            className="w-full bg-surface dark:bg-card border border-border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-focus font-bold text-sm resize-none font-mono rounded-xl outline-none"
                                            placeholder="الجزء الثاني من المحتوى..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SEO Settings */}
                        <div className="p-4 rounded-2xl bg-primary-soft/50 border border-primary/10">
                            <p className="text-micro font-bold mb-4 text-primary">⚙️ إعدادات SEO — ظهور المقال في محركات البحث</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-micro font-bold text-dim block mb-1">عنوان SEO (إذا اختلف عن عنوان المقال)</label>
                                    <input type="text" value={currentPost.seoTitle || ''} onChange={(e) => setCurrentPost({ ...currentPost, seoTitle: e.target.value })}
                                        className="w-full bg-surface dark:bg-card border border-border px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-focus font-bold text-sm rounded-xl outline-none" placeholder="عنوان SEO مخصص..." />
                                </div>
                                <div>
                                    <label className="text-micro font-bold text-dim block mb-1">الوصف في SEO</label>
                                    <input type="text" value={currentPost.seoDescription || ''} onChange={(e) => setCurrentPost({ ...currentPost, seoDescription: e.target.value })}
                                        className="w-full bg-surface dark:bg-card border border-border px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-focus font-bold text-sm rounded-xl outline-none" placeholder="وصف مخصص لظهور في Google..." />
                                </div>
                                <div>
                                    <label className="text-micro font-bold text-dim block mb-1">صورة OG (لمشاركة فيسبوك/واتساب)</label>
                                    <input type="url" value={currentPost.ogImage || ''} onChange={(e) => setCurrentPost({ ...currentPost, ogImage: e.target.value })}
                                        className="w-full bg-surface dark:bg-card border border-border px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-focus font-bold text-sm rounded-xl outline-none" placeholder="https://..." dir="ltr" />
                                </div>
                                <div>
                                    <label className="text-micro font-bold text-dim block mb-1">الكلمة المفتاحية الأساسية (Focus Keyword)</label>
                                    <input type="text" value={currentPost.focusKeyword || ''} onChange={(e) => setCurrentPost({ ...currentPost, focusKeyword: e.target.value })}
                                        className="w-full bg-surface dark:bg-card border border-border px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-focus font-bold text-sm rounded-xl outline-none" placeholder="مثال: مدرس خصوصي الكويت" />
                                </div>
                                <div>
                                    <label className="text-micro font-bold text-dim block mb-1">الوسوم (Tags) — مفصولة بفواصل</label>
                                    <input type="text" value={currentPost.tags || ''} onChange={(e) => setCurrentPost({ ...currentPost, tags: e.target.value })}
                                        className="w-full bg-surface dark:bg-card border border-border px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-focus font-bold text-sm rounded-xl outline-none" placeholder="رياضيات, قدرات, تأسيس" />
                                </div>
                                <div>
                                    <label className="text-micro font-bold text-dim block mb-1">Canonical URL (إذا اختلف)</label>
                                    <input type="url" value={currentPost.canonicalUrl || ''} onChange={(e) => setCurrentPost({ ...currentPost, canonicalUrl: e.target.value })}
                                        className="w-full bg-surface dark:bg-card border border-border px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-focus font-bold text-sm rounded-xl outline-none" placeholder="https://..." dir="ltr" />
                                </div>
                            </div>
                            <div className="flex items-center gap-6 mt-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={currentPost.robotsIndex !== false} onChange={(e) => setCurrentPost({ ...currentPost, robotsIndex: e.target.checked })}
                                        className="w-4 h-4 rounded border-border text-primary focus:ring-focus" />
                                    <span className="text-micro font-bold text-muted">السماح بفهرسة المقال (Index)</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={currentPost.isFeatured || false} onChange={(e) => setCurrentPost({ ...currentPost, isFeatured: e.target.checked })}
                                        className="w-4 h-4 rounded border-border text-primary focus:ring-focus" />
                                    <span className="text-micro font-bold text-muted flex items-center gap-1"><Star size={12} className="text-warning" /> مقال مميز</span>
                                </label>
                            </div>
                        </div>

                        <div className="p-5 border-t border-border bg-surface dark:bg-card/50 flex justify-end gap-3 rounded-xl">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="px-5 py-2.5 font-bold text-muted hover:text-main transition-all rounded-xl"
                            >
                                إلغاء
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex items-center gap-2 px-6 py-2.5 bg-error text-on-error font-bold hover:bg-error-hover transition-all disabled:opacity-50 shadow-sm active:scale-95 rounded-xl"
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
                    <div className="w-10 h-10 rounded-full border-2 border-border border-t-error animate-spin" />
                </div>
            ) : filteredPosts.length === 0 ? (
                <div className="text-center py-20 bg-card border border-dashed border-border rounded-2xl">
                    <div className="w-12 h-12 rounded-xl bg-error-soft text-error flex items-center justify-center mx-auto mb-3">
                        <BookOpen size={22} />
                    </div>
                    <p className="text-sm font-bold text-muted">لا توجد مقالات بعد! أضف أول مقال الآن</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredPosts.map(post => (
                        <div key={post.id} className="bg-card border border-border shadow-sm overflow-hidden rounded-2xl">
                            <div className="relative h-36 overflow-hidden">
                                <Image src={post.coverImage || 'https://via.placeholder.com/400x200'} alt={post.title} className="w-full h-full" />
                                <div className="absolute top-2 start-2">
                                    <span className="text-micro font-bold px-2 py-1 rounded-lg bg-error text-on-error">{post.category}</span>
                                </div>
                            </div>
                            <div className="p-3">
                                <h3 className="font-bold text-main mb-1 line-clamp-2 text-sm">{post.title}</h3>
                                <div className="flex items-center gap-2 text-micro font-bold text-muted mb-2">
                                    <div className="flex items-center gap-1"><Calendar size={12} /> {post.date}</div>
                                    <div className="flex items-center gap-1"><User size={12} /> {post.author}</div>
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t border-border">
                                    <div className="flex gap-2">
                                        <button onClick={() => handleOpenModal(post)} className="p-1.5 rounded-xl text-info" aria-label="تعديل"><Edit2 size={14} /></button>
                                        <button onClick={() => handleDelete(post.id)} className="p-1.5 rounded-xl text-error" aria-label="حذف"><Trash2 size={14} /></button>
                                    </div>
                                    <a href={`/books/${post.slug}`} target="_blank" rel="noopener noreferrer" className="p-1.5 text-dim"><ExternalLink size={14} /></a>
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
