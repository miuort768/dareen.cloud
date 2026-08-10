import { X, Link as LinkIcon, Image as ImageIcon, Star, Download, Eye, Loader2, Save, Tag } from 'lucide-react';
import { Image } from '../../shared/components/ui';
import type { BlogPost } from './types';
import { BlogFormEducationalSection } from './BlogFormEducationalSection';
import { BlogFormSeoSection } from './BlogFormSeoSection';

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

export const BlogForm = ({
    isModalOpen, setIsModalOpen, currentPost, setCurrentPost,
    contentPart1, setContentPart1, contentPart2, setContentPart2,
    submitting, handleSubmit
}: BlogFormProps) => {
    if (!isModalOpen || !currentPost) return null;

    const set = (field: string, value: string | number | boolean) => setCurrentPost((prev) => ({ ...prev, [field]: value }));

    return (
        <div className="bg-card w-full overflow-hidden border border-border rounded-2xl">
            <div className="p-4 bg-primary text-on-primary flex items-center justify-between rounded-t-2xl">
                <h2 className="font-bold text-sm">{currentPost.id ? 'تعديل مقال' : 'إضافة مقال جديد'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-lg bg-white/10 hover:bg-error transition-all duration-200 active:scale-95" aria-label="إغلاق"><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-micro font-bold text-muted mb-1.5">عنوان المقال</label>
                        <input required type="text" value={currentPost.title}
                            onChange={(e) => set('title', e.target.value)}
                            className="w-full bg-surface border border-border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-focus font-bold text-sm rounded-xl outline-none"
                            placeholder="مثال: أفضل نصائح الدراسة..." />
                    </div>
                    <div>
                        <label className="block text-micro font-bold text-muted mb-1.5">الرابط المختصر (Slug)</label>
                        <div className="relative">
                            <LinkIcon className="absolute end-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
                            <input required type="text" value={currentPost.slug}
                                onChange={(e) => set('slug', e.target.value.replace(/\s+/g, '-').toLowerCase())}
                                className="w-full bg-surface border border-border px-4 py-3 pe-10 focus:outline-none focus:ring-2 focus:ring-focus font-bold text-sm text-end rounded-xl outline-none"
                                dir="ltr" placeholder="أفضل-نصائح-الدراسة" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                        <label className="block text-micro font-bold text-muted mb-1.5">التصنيف</label>
                        <div className="relative">
                            <Tag className="absolute start-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
                            <input type="text" value={currentPost.category}
                                onChange={(e) => set('category', e.target.value)}
                                className="w-full bg-surface border border-border ps-10 py-3 focus:outline-none focus:ring-2 focus:ring-focus font-bold text-sm rounded-xl outline-none"
                                placeholder="مثل: نصائح دراسية" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-micro font-bold text-muted mb-1.5">الكاتب</label>
                        <input type="text" value={currentPost.author}
                            onChange={(e) => set('author', e.target.value)}
                            className="w-full bg-surface border border-border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-focus font-bold text-sm rounded-xl outline-none" />
                    </div>
                    <div>
                        <label className="block text-micro font-bold text-muted mb-1.5">التاريخ</label>
                        <input type="date" value={currentPost.date?.split('T')[0]}
                            onChange={(e) => set('date', e.target.value)}
                            className="w-full bg-surface border border-border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-focus font-bold text-sm rounded-xl outline-none" />
                    </div>
                </div>

                <BlogFormEducationalSection currentPost={currentPost} onSet={set} onSetCurrentPost={setCurrentPost} />

                {(currentPost.contentType === 'foundation' || currentPost.contentType === 'notes') && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-micro font-bold text-muted block mb-1">رابط المصدر</label>
                            <div className="relative">
                                <LinkIcon className="absolute end-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
                                <input type="url" value={currentPost.source || ''}
                                    onChange={(e) => set('source', e.target.value)}
                                    className="w-full bg-surface border border-border px-4 py-3 pe-10 focus:outline-none focus:ring-2 focus:ring-focus font-bold text-sm text-end rounded-xl outline-none"
                                    dir="ltr" placeholder="https://..." />
                            </div>
                        </div>
                        <div>
                            <label className="text-micro font-bold text-muted block mb-1">حجم الملف</label>
                            <input type="text" value={currentPost.fileSize || ''}
                                onChange={(e) => set('fileSize', e.target.value)}
                                className="w-full bg-surface border border-border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-focus font-bold text-sm rounded-xl outline-none"
                                placeholder="2.5 MB" />
                        </div>
                    </div>
                )}

                <div>
                    <label className="block text-micro font-bold text-muted mb-1.5">رابط الصورة الرئيسية</label>
                    <div className="relative">
                        <ImageIcon className="absolute end-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
                        <input type="url" value={currentPost.coverImage}
                            onChange={(e) => set('coverImage', e.target.value)}
                            className="w-full bg-surface border border-border px-4 py-3 pe-10 focus:outline-none focus:ring-2 focus:ring-focus font-bold text-sm text-end rounded-xl outline-none"
                            dir="ltr" placeholder="https://..." />
                    </div>
                    {currentPost.coverImage && (
                        <div className="mt-2 h-32 w-full border border-border overflow-hidden rounded-xl">
                            <Image src={currentPost.coverImage} alt="معاينة" className="h-32 w-full" />
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
                        className="w-full bg-surface border border-border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-focus font-bold text-sm rounded-xl outline-none"
                        placeholder="دراسة, نصائح, تفوق" />
                </div>

                <div>
                    <label className="block text-micro font-bold text-muted mb-1.5">وصف مختصر (يظهر في محركات البحث)</label>
                    <textarea rows={2} value={currentPost.excerpt}
                        onChange={(e) => set('excerpt', e.target.value)}
                        className="w-full bg-surface border border-border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-focus font-bold text-sm resize-none rounded-xl outline-none"
                        placeholder="وصف قصير يظهر في نتائج البحث..." />
                </div>

                <div>
                    <label className="block text-micro font-bold text-muted mb-1.5">محتوى المقال (كود HTML)</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <span className="text-micro font-bold text-muted block mb-1.5">الجزء الأول</span>
                            <textarea rows={10} required value={contentPart1}
                                onChange={(e) => setContentPart1(e.target.value)}
                                className="w-full bg-surface border border-border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-focus font-bold text-sm resize-none font-mono rounded-xl outline-none"
                                placeholder="الجزء الأول من المحتوى..." />
                        </div>
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between p-3 bg-surface/50 rounded-xl border border-border">
                                <span className="text-micro font-bold text-muted">إظهار أزرار التحميل والمشاهدة</span>
                                <button type="button" onClick={() => set('showButtons', !currentPost.showButtons)}
                                    className={`w-12 h-6 rounded-full transition-all duration-200 relative ${currentPost.showButtons ? 'bg-success' : 'bg-dim'}`}>
                                    <span className={`absolute top-0.5 w-5 h-5 bg-background rounded-full transition-transform ${currentPost.showButtons ? 'end-0.5 translate-x-6' : 'end-0.5'}`} />
                                </button>
                            </div>
                            <div>
                                <label className="block text-micro font-bold text-muted mb-1.5 flex items-center gap-1.5"><Download size={12} /> رابط التحميل</label>
                                <div className="relative">
                                    <LinkIcon className="absolute end-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
                                    <input type="url" value={currentPost.downloadLink || ''}
                                        onChange={(e) => set('downloadLink', e.target.value)}
                                        className="w-full bg-surface border border-border px-4 py-3 pe-10 focus:outline-none focus:ring-2 focus:ring-focus font-bold text-sm text-end rounded-xl outline-none"
                                        dir="ltr" placeholder="https://..." />
                                </div>
                                <label className="block text-micro font-bold text-muted mt-2 mb-1.5">نص زر التحميل</label>
                                <input type="text" value={currentPost.downloadButtonText || ''}
                                    onChange={(e) => set('downloadButtonText', e.target.value)}
                                    className="w-full bg-surface border border-border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-focus font-bold text-sm text-start rounded-xl outline-none"
                                    placeholder="تحميل الملف" />
                            </div>
                            <div>
                                <label className="block text-micro font-bold text-muted mb-1.5 flex items-center gap-1.5"><Eye size={12} /> رابط المشاهدة</label>
                                <div className="relative">
                                    <LinkIcon className="absolute end-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
                                    <input type="url" value={currentPost.watchLink || ''}
                                        onChange={(e) => set('watchLink', e.target.value)}
                                        className="w-full bg-surface border border-border px-4 py-3 pe-10 focus:outline-none focus:ring-2 focus:ring-focus font-bold text-sm text-end rounded-xl outline-none"
                                        dir="ltr" placeholder="https://..." />
                                </div>
                                <label className="block text-micro font-bold text-muted mt-2 mb-1.5">نص زر المشاهدة</label>
                                <input type="text" value={currentPost.watchButtonText || ''}
                                    onChange={(e) => set('watchButtonText', e.target.value)}
                                    className="w-full bg-surface border border-border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-focus font-bold text-sm text-start rounded-xl outline-none"
                                    placeholder="مشاهدة الملف" />
                            </div>
                            <div className="flex-1">
                                <span className="text-micro font-bold text-muted block mb-1.5">الجزء الثاني</span>
                                <textarea rows={6} value={contentPart2}
                                    onChange={(e) => setContentPart2(e.target.value)}
                                    className="w-full bg-surface border border-border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-focus font-bold text-sm resize-none font-mono rounded-xl outline-none"
                                    placeholder="الجزء الثاني من المحتوى..." />
                            </div>
                        </div>
                    </div>
                </div>

                <BlogFormSeoSection currentPost={currentPost} onSet={set} />

                <div className="p-5 border-t border-border bg-surface/50 flex justify-end gap-3 rounded-xl">
                    <button type="button" onClick={() => setIsModalOpen(false)}
                        className="px-5 py-2.5 font-semibold text-muted hover:text-main transition-all duration-200 rounded-lg active:scale-95">إلغاء</button>
                    <button type="submit" disabled={submitting}
                        className="flex items-center gap-2 px-6 py-2.5 bg-error text-on-error font-semibold hover:bg-error-hover transition-all duration-200 disabled:opacity-50 active:scale-95 rounded-lg hover:shadow-sm">
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} />}
                        <span className="text-xs">نشر المقال</span>
                    </button>
                </div>
            </form>
        </div>
    );
};
