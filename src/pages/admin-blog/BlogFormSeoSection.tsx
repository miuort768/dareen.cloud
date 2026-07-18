import { Star } from 'lucide-react';
import type { BlogPost } from './types';

interface BlogFormSeoSectionProps {
    currentPost: Partial<BlogPost>;
    onSet: (field: string, value: string | number | boolean) => void;
}

export const BlogFormSeoSection = ({ currentPost, onSet }: BlogFormSeoSectionProps) => (
    <div className="p-4 rounded-2xl bg-primary-soft/50 border border-primary/10">
        <p className="text-micro font-bold mb-4 text-primary">إعدادات SEO — ظهور المقال في محركات البحث</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="text-micro font-bold text-dim block mb-1">عنوان SEO</label>
                <input type="text" value={currentPost.seoTitle || ''}
                    onChange={(e) => onSet('seoTitle', e.target.value)}
                    className="w-full bg-surface dark:bg-card border border-border px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-focus font-bold text-sm rounded-xl outline-none" placeholder="عنوان SEO مخصص..." />
            </div>
            <div>
                <label className="text-micro font-bold text-dim block mb-1">الوصف في SEO</label>
                <input type="text" value={currentPost.seoDescription || ''}
                    onChange={(e) => onSet('seoDescription', e.target.value)}
                    className="w-full bg-surface dark:bg-card border border-border px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-focus font-bold text-sm rounded-xl outline-none" placeholder="وصف مخصص لظهور في Google..." />
            </div>
            <div>
                <label className="text-micro font-bold text-dim block mb-1">صورة OG</label>
                <input type="url" value={currentPost.ogImage || ''}
                    onChange={(e) => onSet('ogImage', e.target.value)}
                    className="w-full bg-surface dark:bg-card border border-border px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-focus font-bold text-sm rounded-xl outline-none" placeholder="https://..." dir="ltr" />
            </div>
            <div>
                <label className="text-micro font-bold text-dim block mb-1">الكلمة المفتاحية الأساسية</label>
                <input type="text" value={currentPost.focusKeyword || ''}
                    onChange={(e) => onSet('focusKeyword', e.target.value)}
                    className="w-full bg-surface dark:bg-card border border-border px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-focus font-bold text-sm rounded-xl outline-none" placeholder="مثال: مدرس خصوصي الكويت" />
            </div>
            <div>
                <label className="text-micro font-bold text-dim block mb-1">الوسوم (Tags)</label>
                <input type="text" value={currentPost.tags || ''}
                    onChange={(e) => onSet('tags', e.target.value)}
                    className="w-full bg-surface dark:bg-card border border-border px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-focus font-bold text-sm rounded-xl outline-none" placeholder="رياضيات, قدرات, تأسيس" />
            </div>
            <div>
                <label className="text-micro font-bold text-dim block mb-1">Canonical URL</label>
                <input type="url" value={currentPost.canonicalUrl || ''}
                    onChange={(e) => onSet('canonicalUrl', e.target.value)}
                    className="w-full bg-surface dark:bg-card border border-border px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-focus font-bold text-sm rounded-xl outline-none" placeholder="https://..." dir="ltr" />
            </div>
        </div>
        <div className="flex items-center gap-6 mt-4">
            <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={currentPost.robotsIndex !== false}
                    onChange={(e) => onSet('robotsIndex', e.target.checked)}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-focus" />
                <span className="text-micro font-bold text-muted">السماح بفهرسة المقال</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={currentPost.isFeatured || false}
                    onChange={(e) => onSet('isFeatured', e.target.checked)}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-focus" />
                <span className="text-micro font-bold text-muted flex items-center gap-1"><Star size={12} className="text-warning" /> مقال مميز</span>
            </label>
        </div>
    </div>
);
