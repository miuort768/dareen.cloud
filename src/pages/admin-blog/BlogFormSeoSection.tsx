import { Star } from 'lucide-react'
import type { BlogPost } from './types'

interface BlogFormSeoSectionProps {
  currentPost: Partial<BlogPost>
  onSet: (field: string, value: string | number | boolean) => void
}

export const BlogFormSeoSection = ({ currentPost, onSet }: BlogFormSeoSectionProps) => (
  <div className="bg-primary-soft/50 rounded-2xl border border-primary/10 p-4">
    <p className="mb-4 text-micro font-bold text-primary">
      إعدادات SEO — ظهور المقال في محركات البحث
    </p>
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div>
        <label htmlFor="bf-seo-title" className="mb-1 block text-micro font-bold text-muted">
          عنوان SEO
        </label>
        <input
          id="bf-seo-title"
          type="text"
          value={currentPost.seoTitle || ''}
          onChange={(e) => onSet('seoTitle', e.target.value)}
          className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-bold outline-none focus:outline-none focus:ring-2 focus:ring-focus"
          placeholder="عنوان SEO مخصص..."
        />
      </div>
      <div>
        <label htmlFor="bf-seo-desc" className="mb-1 block text-micro font-bold text-muted">
          الوصف في SEO
        </label>
        <input
          id="bf-seo-desc"
          type="text"
          value={currentPost.seoDescription || ''}
          onChange={(e) => onSet('seoDescription', e.target.value)}
          className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-bold outline-none focus:outline-none focus:ring-2 focus:ring-focus"
          placeholder="وصف مخصص لظهور في Google..."
        />
      </div>
      <div>
        <label htmlFor="bf-og" className="mb-1 block text-micro font-bold text-muted">
          صورة OG
        </label>
        <input
          id="bf-og"
          type="url"
          value={currentPost.ogImage || ''}
          onChange={(e) => onSet('ogImage', e.target.value)}
          className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-bold outline-none focus:outline-none focus:ring-2 focus:ring-focus"
          placeholder="https://..."
          dir="ltr"
        />
      </div>
      <div>
        <label htmlFor="bf-focus-kw" className="mb-1 block text-micro font-bold text-muted">
          الكلمة المفتاحية الأساسية
        </label>
        <input
          id="bf-focus-kw"
          type="text"
          value={currentPost.focusKeyword || ''}
          onChange={(e) => onSet('focusKeyword', e.target.value)}
          className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-bold outline-none focus:outline-none focus:ring-2 focus:ring-focus"
          placeholder="مثال: مدرس خصوصي الكويت"
        />
      </div>
      <div>
        <label htmlFor="bf-tags" className="mb-1 block text-micro font-bold text-muted">
          الوسوم (Tags)
        </label>
        <input
          id="bf-tags"
          type="text"
          value={currentPost.tags || ''}
          onChange={(e) => onSet('tags', e.target.value)}
          className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-bold outline-none focus:outline-none focus:ring-2 focus:ring-focus"
          placeholder="رياضيات, قدرات, تأسيس"
        />
      </div>
      <div>
        <label htmlFor="bf-canonical" className="mb-1 block text-micro font-bold text-muted">
          Canonical URL
        </label>
        <input
          id="bf-canonical"
          type="url"
          value={currentPost.canonicalUrl || ''}
          onChange={(e) => onSet('canonicalUrl', e.target.value)}
          className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-bold outline-none focus:outline-none focus:ring-2 focus:ring-focus"
          placeholder="https://..."
          dir="ltr"
        />
      </div>
    </div>
    <div className="mt-4 flex items-center gap-6">
      <label className="flex cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          checked={currentPost.robotsIndex !== false}
          onChange={(e) => onSet('robotsIndex', e.target.checked)}
          className="h-4 w-4 rounded border-border text-primary focus:ring-focus"
        />
        <span className="text-micro font-bold text-muted">السماح بفهرسة المقال</span>
      </label>
      <label className="flex cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          checked={currentPost.isFeatured || false}
          onChange={(e) => onSet('isFeatured', e.target.checked)}
          className="h-4 w-4 rounded border-border text-primary focus:ring-focus"
        />
        <span className="flex items-center gap-1 text-micro font-bold text-muted">
          <Star size={12} className="text-warning" /> مقال مميز
        </span>
      </label>
    </div>
  </div>
)
