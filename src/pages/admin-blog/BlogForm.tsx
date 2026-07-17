import { X, Link as LinkIcon, Image as ImageIcon, Star, Download, Eye, Loader2, Save, Tag } from 'lucide-react';
import type { BlogPost } from './types';

interface BlogFormProps {
    isModalOpen: boolean;
    setIsModalOpen: (v: boolean) => void;
    currentPost: Partial<BlogPost> | null;
    setCurrentPost: React.Dispatch<React.SetStateAction<Partial<BlogPost> | null>>;
    contentPart1: string;
    setContentPart1: (v: string) => void;
    contentPart2: string;
    setContentPart2: (v: string) => void;
    submitting: boolean;
    handleSubmit: (e: React.FormEvent) => Promise<void>;
}

const grades = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const subjects = [
    { value: 'arabic', label: 'عربي' }, { value: 'math', label: 'رياضيات' },
    { value: 'islamic', label: 'إسلامية' }, { value: 'english', label: 'إنجليزي' },
    { value: 'science', label: 'علوم' }, { value: 'physics', label: 'فيزياء' },
    { value: 'chemistry', label: 'كيمياء' }, { value: 'biology', label: 'أحياء' },
    { value: 'history', label: 'تاريخ' }, { value: 'geography', label: 'جغرافيا' },
    { value: 'social', label: 'اجتماعيات' }, { value: 'computer', label: 'حاسب آلي' },
    { value: 'stats', label: 'إحصاء' },
];

export const BlogForm = ({
    isModalOpen, setIsModalOpen, currentPost, setCurrentPost,
    contentPart1, setContentPart1, contentPart2, setContentPart2,
    submitting, handleSubmit
}: BlogFormProps) => {
    if (!isModalOpen || !currentPost) return null;

    const set = (field: string, value: string | number | boolean) => setCurrentPost((prev) => ({ ...prev, [field]: value }));
    const isDisabled = currentPost.contentType === 'foundation' || currentPost.contentType === 'more';

    return (
        <div className="bg-card w-full overflow-hidden border border-border shadow-sm rounded-2xl">
            <div className="p-4 bg-primary text-on-primary flex items-center justify-between rounded-t-2xl">
                <h2 className="font-bold text-sm">{currentPost.id ? 'تعديل مقال' : 'إضافة مقال جديد'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-xl bg-white/10 hover:bg-error transition-all" aria-label="إغلاق"><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-micro font-bold text-muted mb-1.5">عنوان المقال</label>
                        <input required type="text" value={currentPost.title}
                            onChange={(e) => set('title', e.target.value)}
                            className="w-full bg-surface dark:bg-card border border-border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-focus font-bold text-sm rounded-xl outline-none"
                            placeholder="مثال: أفضل نصائح الدراسة..." />
                    </div>
                    <div>
                        <label className="block text-micro font-bold text-muted mb-1.5">الرابط المختصر (Slug)</label>
                        <div className="relative">
                            <LinkIcon className="absolute end-4 top-1/2 -translate-y-1/2 text-dim" size={16} />
                            <input required type="text" value={currentPost.slug}
                                onChange={(e) => set('slug', e.target.value.replace(/\s+/g, '-').toLowerCase())}
                                className="w-full bg-surface dark:bg-card border border-border px-4 py-3 pe-10 focus:outline-none focus:ring-2 focus:ring-focus font-bold text-sm text-end rounded-xl outline-none"
                                dir="ltr" placeholder="أفضل-نصائح-الدراسة" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                        <label className="block text-micro font-bold text-muted mb-1.5">التصنيف</label>
                        <div className="relative">
                            <Tag className="absolute start-4 top-1/2 -translate-y-1/2 text-dim" size={16} />
                            <input type="text" value={currentPost.category}
                                onChange={(e) => set('category', e.target.value)}
                                className="w-full bg-surface dark:bg-card border border-border ps-10 py-3 focus:outline-none focus:ring-2 focus:ring-focus font-bold text-sm rounded-xl outline-none"
                                placeholder="مثل: نصائح دراسية" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-micro font-bold text-muted mb-1.5">الكاتب</label>
                        <input type="text" value={currentPost.author}
                            onChange={(e) => set('author', e.target.value)}
                            className="w-full bg-surface dark:bg-card border border-border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-focus font-bold text-sm rounded-xl outline-none" />
                    </div>
                    <div>
                        <label className="block text-micro font-bold text-muted mb-1.5">التاريخ</label>
                        <input type="date" value={currentPost.date?.split('T')[0]}
                            onChange={(e) => set('date', e.target.value)}
                            className="w-full bg-surface dark:bg-card border border-border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-focus font-bold text-sm rounded-xl outline-none" />
                    </div>
                </div>

                <div className="p-4 rounded-2xl bg-error-soft/50 border border-error/10">
                    <p className="text-micro font-bold mb-4 text-error">تصنيف تعليمي — سيظهر في صفحة المواد</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-micro font-bold text-dim block mb-1">نوع المحتوى</label>
                            <select value={currentPost.contentType}
                                onChange={(e) => { const v = e.target.value; setCurrentPost((prev) => ({ ...prev, contentType: v, ...((v === 'foundation' || v === 'more') ? { curriculum: '', level: '', grade: '', term: '', subject: '' } : {}) })); }}
                                aria-label="نوع المحتوى"
                                className="w-full bg-card border border-border px-3 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-focus rounded-xl outline-none">
                                <option value="notes">مذكرات</option><option value="solutions">حل كتب</option>
                                <option value="more">المزيد</option><option value="foundation">تأسيس</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-micro font-bold text-dim block mb-1">المنهج</label>
                            <select value={currentPost.curriculum} onChange={(e) => set('curriculum', e.target.value)}
                                disabled={isDisabled}
                                aria-label="المنهج الدراسي"
                                className="w-full bg-card border border-border px-3 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-focus rounded-xl outline-none disabled:opacity-50">
                                <option value="">بدون تحديد</option>
                                <option value="kuwait">الكويت</option><option value="qatar">قطر</option>
                                <option value="uae">الإمارات</option><option value="saudi">السعودية</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-micro font-bold text-dim block mb-1">المرحلة</label>
                            <select value={currentPost.level} onChange={(e) => set('level', e.target.value)}
                                disabled={isDisabled}
                                aria-label="المرحلة الدراسية"
                                className="w-full bg-card border border-border px-3 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-focus rounded-xl outline-none disabled:opacity-50">
                                <option value="">بدون تحديد</option>
                                <option value="primary">ابتدائي</option><option value="middle">متوسط</option>
                                <option value="secondary">ثانوي</option><option value="basic">أساسي (عمان)</option>
                                <option value="preparatory">إعدادي (مصر)</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-micro font-bold text-dim block mb-1">الصف</label>
                            <select value={currentPost.grade} onChange={(e) => set('grade', e.target.value)}
                                disabled={isDisabled}
                                aria-label="الصف الدراسي"
                                className="w-full bg-card border border-border px-3 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-focus rounded-xl outline-none disabled:opacity-50">
                                <option value="">بدون تحديد</option>
                                {grades.map(g => <option key={g} value={g}>صف {g}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-micro font-bold text-dim block mb-1">الفصل</label>
                            <select value={currentPost.term} onChange={(e) => set('term', e.target.value)}
                                disabled={isDisabled}
                                aria-label="الفصل الدراسي"
                                className="w-full bg-card border border-border px-3 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-focus rounded-xl outline-none disabled:opacity-50">
                                <option value="">بدون</option><option value="1">الفصل الأول</option>
                                <option value="2">الفصل الثاني</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-micro font-bold text-dim block mb-1">المادة</label>
                            <select value={currentPost.subject} onChange={(e) => set('subject', e.target.value)}
                                disabled={isDisabled}
                                aria-label="المادة الدراسية"
                                className="w-full bg-card border border-border px-3 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-focus rounded-xl outline-none disabled:opacity-50">
                                <option value="">بدون تحديد</option>
                                {subjects.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
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
                                <input type="url" value={currentPost.source || ''}
                                    onChange={(e) => set('source', e.target.value)}
                                    className="w-full bg-surface dark:bg-card border border-border px-4 py-3 pe-10 focus:outline-none focus:ring-2 focus:ring-focus font-bold text-sm text-end rounded-xl outline-none"
                                    dir="ltr" placeholder="https://..." />
                            </div>
                        </div>
                        <div>
                            <label className="text-micro font-bold text-dim block mb-1">حجم الملف</label>
                            <input type="text" value={currentPost.fileSize || ''}
                                onChange={(e) => set('fileSize', e.target.value)}
                                className="w-full bg-surface dark:bg-card border border-border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-focus font-bold text-sm rounded-xl outline-none"
                                placeholder="2.5 MB" />
                        </div>
                    </div>
                )}

                <div>
                    <label className="block text-micro font-bold text-muted mb-1.5">رابط الصورة الرئيسية</label>
                    <div className="relative">
                        <ImageIcon className="absolute end-4 top-1/2 -translate-y-1/2 text-dim" size={16} />
                        <input type="url" value={currentPost.coverImage}
                            onChange={(e) => set('coverImage', e.target.value)}
                            className="w-full bg-surface dark:bg-card border border-border px-4 py-3 pe-10 focus:outline-none focus:ring-2 focus:ring-focus font-bold text-sm text-end rounded-xl outline-none"
                            dir="ltr" placeholder="https://..." />
                    </div>
                    {currentPost.coverImage && (
                        <div className="mt-2 h-32 w-full border border-border overflow-hidden rounded-xl">
                            <img src={currentPost.coverImage} alt="معاينة" loading="lazy"
                                className="w-full h-full object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=Invalid+Image+Link'; }} />
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-4 flex-wrap">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={currentPost.isNew || false}
                            onChange={(e) => set('isNew', e.target.checked)}
                            className="w-4 h-4 rounded border-border text-error focus:ring-focus" />
                        <span className="text-micro font-bold text-muted flex items-center gap-1">
                            <Star size={12} className="text-warning" /> جديد
                        </span>
                    </label>
                </div>

                <div>
                    <label className="block text-micro font-bold text-muted mb-1.5">الكلمات المفتاحية (Keywords) — مفصولة بفواصل</label>
                    <input type="text" value={currentPost.keywords}
                        onChange={(e) => set('keywords', e.target.value)}
                        className="w-full bg-surface dark:bg-card border border-border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-focus font-bold text-sm rounded-xl outline-none"
                        placeholder="دراسة, نصائح, تفوق" />
                </div>

                <div>
                    <label className="block text-micro font-bold text-muted mb-1.5">وصف مختصر (يظهر في محركات البحث)</label>
                    <textarea rows={2} value={currentPost.excerpt}
                        onChange={(e) => set('excerpt', e.target.value)}
                        className="w-full bg-surface dark:bg-card border border-border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-focus font-bold text-sm resize-none rounded-xl outline-none"
                        placeholder="وصف قصير يظهر في نتائج البحث..." />
                </div>

                <div>
                    <label className="block text-micro font-bold text-muted mb-1.5">محتوى المقال (كود HTML)</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <span className="text-micro font-bold text-dim block mb-1.5">الجزء الأول</span>
                            <textarea rows={10} required value={contentPart1}
                                onChange={(e) => setContentPart1(e.target.value)}
                                className="w-full bg-surface dark:bg-card border border-border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-focus font-bold text-sm resize-none font-mono rounded-xl outline-none"
                                placeholder="الجزء الأول من المحتوى..." />
                        </div>
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between p-3 bg-surface dark:bg-card/50 rounded-xl border border-border">
                                <span className="text-micro font-bold text-muted">إظهار أزرار التحميل والمشاهدة</span>
                                <button type="button" onClick={() => set('showButtons', !currentPost.showButtons)}
                                    className={`w-12 h-6 rounded-full transition-colors relative ${currentPost.showButtons ? 'bg-success' : 'bg-dim dark:bg-hover'}`}>
                                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${currentPost.showButtons ? 'end-0.5 translate-x-6' : 'end-0.5'}`} />
                                </button>
                            </div>
                            <div>
                                <label className="block text-micro font-bold text-dim mb-1.5 flex items-center gap-1.5"><Download size={12} /> رابط التحميل</label>
                                <div className="relative">
                                    <LinkIcon className="absolute end-4 top-1/2 -translate-y-1/2 text-dim" size={16} />
                                    <input type="url" value={currentPost.downloadLink || ''}
                                        onChange={(e) => set('downloadLink', e.target.value)}
                                        className="w-full bg-surface dark:bg-card border border-border px-4 py-3 pe-10 focus:outline-none focus:ring-2 focus:ring-focus font-bold text-sm text-end rounded-xl outline-none"
                                        dir="ltr" placeholder="https://..." />
                                </div>
                                <label className="block text-micro font-bold text-dim mt-2 mb-1.5">نص زر التحميل</label>
                                <input type="text" value={currentPost.downloadButtonText || ''}
                                    onChange={(e) => set('downloadButtonText', e.target.value)}
                                    className="w-full bg-surface dark:bg-card border border-border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-focus font-bold text-sm text-start rounded-xl outline-none"
                                    placeholder="تحميل الملف" />
                            </div>
                            <div>
                                <label className="block text-micro font-bold text-dim mb-1.5 flex items-center gap-1.5"><Eye size={12} /> رابط المشاهدة</label>
                                <div className="relative">
                                    <LinkIcon className="absolute end-4 top-1/2 -translate-y-1/2 text-dim" size={16} />
                                    <input type="url" value={currentPost.watchLink || ''}
                                        onChange={(e) => set('watchLink', e.target.value)}
                                        className="w-full bg-surface dark:bg-card border border-border px-4 py-3 pe-10 focus:outline-none focus:ring-2 focus:ring-focus font-bold text-sm text-end rounded-xl outline-none"
                                        dir="ltr" placeholder="https://..." />
                                </div>
                                <label className="block text-micro font-bold text-dim mt-2 mb-1.5">نص زر المشاهدة</label>
                                <input type="text" value={currentPost.watchButtonText || ''}
                                    onChange={(e) => set('watchButtonText', e.target.value)}
                                    className="w-full bg-surface dark:bg-card border border-border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-focus font-bold text-sm text-start rounded-xl outline-none"
                                    placeholder="مشاهدة الملف" />
                            </div>
                            <div className="flex-1">
                                <span className="text-micro font-bold text-dim block mb-1.5">الجزء الثاني</span>
                                <textarea rows={6} value={contentPart2}
                                    onChange={(e) => setContentPart2(e.target.value)}
                                    className="w-full bg-surface dark:bg-card border border-border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-focus font-bold text-sm resize-none font-mono rounded-xl outline-none"
                                    placeholder="الجزء الثاني من المحتوى..." />
                            </div>
                        </div>
                    </div>
                </div>

                {/* SEO Settings */}
                <div className="p-4 rounded-2xl bg-primary-soft/50 border border-primary/10">
                    <p className="text-micro font-bold mb-4 text-primary">إعدادات SEO — ظهور المقال في محركات البحث</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-micro font-bold text-dim block mb-1">عنوان SEO</label>
                            <input type="text" value={currentPost.seoTitle || ''}
                                onChange={(e) => set('seoTitle', e.target.value)}
                                className="w-full bg-surface dark:bg-card border border-border px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-focus font-bold text-sm rounded-xl outline-none" placeholder="عنوان SEO مخصص..." />
                        </div>
                        <div>
                            <label className="text-micro font-bold text-dim block mb-1">الوصف في SEO</label>
                            <input type="text" value={currentPost.seoDescription || ''}
                                onChange={(e) => set('seoDescription', e.target.value)}
                                className="w-full bg-surface dark:bg-card border border-border px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-focus font-bold text-sm rounded-xl outline-none" placeholder="وصف مخصص لظهور في Google..." />
                        </div>
                        <div>
                            <label className="text-micro font-bold text-dim block mb-1">صورة OG</label>
                            <input type="url" value={currentPost.ogImage || ''}
                                onChange={(e) => set('ogImage', e.target.value)}
                                className="w-full bg-surface dark:bg-card border border-border px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-focus font-bold text-sm rounded-xl outline-none" placeholder="https://..." dir="ltr" />
                        </div>
                        <div>
                            <label className="text-micro font-bold text-dim block mb-1">الكلمة المفتاحية الأساسية</label>
                            <input type="text" value={currentPost.focusKeyword || ''}
                                onChange={(e) => set('focusKeyword', e.target.value)}
                                className="w-full bg-surface dark:bg-card border border-border px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-focus font-bold text-sm rounded-xl outline-none" placeholder="مثال: مدرس خصوصي الكويت" />
                        </div>
                        <div>
                            <label className="text-micro font-bold text-dim block mb-1">الوسوم (Tags)</label>
                            <input type="text" value={currentPost.tags || ''}
                                onChange={(e) => set('tags', e.target.value)}
                                className="w-full bg-surface dark:bg-card border border-border px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-focus font-bold text-sm rounded-xl outline-none" placeholder="رياضيات, قدرات, تأسيس" />
                        </div>
                        <div>
                            <label className="text-micro font-bold text-dim block mb-1">Canonical URL</label>
                            <input type="url" value={currentPost.canonicalUrl || ''}
                                onChange={(e) => set('canonicalUrl', e.target.value)}
                                className="w-full bg-surface dark:bg-card border border-border px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-focus font-bold text-sm rounded-xl outline-none" placeholder="https://..." dir="ltr" />
                        </div>
                    </div>
                    <div className="flex items-center gap-6 mt-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={currentPost.robotsIndex !== false}
                                onChange={(e) => set('robotsIndex', e.target.checked)}
                                className="w-4 h-4 rounded border-border text-primary focus:ring-focus" />
                            <span className="text-micro font-bold text-muted">السماح بفهرسة المقال</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={currentPost.isFeatured || false}
                                onChange={(e) => set('isFeatured', e.target.checked)}
                                className="w-4 h-4 rounded border-border text-primary focus:ring-focus" />
                            <span className="text-micro font-bold text-muted flex items-center gap-1"><Star size={12} className="text-warning" /> مقال مميز</span>
                        </label>
                    </div>
                </div>

                <div className="p-5 border-t border-border bg-surface dark:bg-card/50 flex justify-end gap-3 rounded-xl">
                    <button type="button" onClick={() => setIsModalOpen(false)}
                        className="px-5 py-2.5 font-bold text-muted hover:text-main transition-all rounded-xl">إلغاء</button>
                    <button type="submit" disabled={submitting}
                        className="flex items-center gap-2 px-6 py-2.5 bg-error text-on-error font-bold hover:bg-error-hover transition-all disabled:opacity-50 shadow-sm active:scale-95 rounded-xl">
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} />}
                        <span className="text-xs">نشر المقال</span>
                    </button>
                </div>
            </form>
        </div>
    );
};
