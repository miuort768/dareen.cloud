import {
  X,
  Link as LinkIcon,
  Image as ImageIcon,
  Star,
  Download,
  Eye,
  Loader2,
  Save,
  Tag,
} from 'lucide-react'
import { Image } from '../../shared/components/ui'
import type { BlogPost } from './types'
import { BlogFormEducationalSection } from './BlogFormEducationalSection'
import { BlogFormSeoSection } from './BlogFormSeoSection'

interface BlogFormProps {
  isModalOpen: boolean
  setIsModalOpen: (v: boolean) => void
  currentPost: Partial<BlogPost> | null
  setCurrentPost: React.Dispatch<React.SetStateAction<Partial<BlogPost> | null>>
  contentPart1: string
  setContentPart1: (v: string) => void
  contentPart2: string
  setContentPart2: (v: string) => void
  submitting: boolean
  handleSubmit: (e: React.FormEvent) => Promise<void>
}

export const BlogForm = ({
  isModalOpen,
  setIsModalOpen,
  currentPost,
  setCurrentPost,
  contentPart1,
  setContentPart1,
  contentPart2,
  setContentPart2,
  submitting,
  handleSubmit,
}: BlogFormProps) => {
  if (!isModalOpen || !currentPost) return null

  const set = (field: string, value: string | number | boolean) =>
    setCurrentPost((prev) => ({ ...prev, [field]: value }))

  return (
    <div className="w-full rounded-2xl border border-border bg-card shadow-elevation-1">
      <div className="flex items-center justify-between rounded-t-2xl bg-gradient-to-l from-error to-error-hover px-4 py-3.5 md:px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25">
            <Save size={16} className="text-on-error" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-on-error">
              {currentPost.id ? 'تعديل المقال' : 'إضافة مقال جديد'}
            </h2>
            <p className="text-[10px] text-white/70">
              {currentPost.id ? 'حدّث بيانات المقال ثم احفظ' : 'املأ الحقول الأساسية ثم انشر'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(false)}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-on-error transition-colors hover:bg-white/25 focus-visible:ring-2 focus-visible:ring-white/60 active:scale-95"
          aria-label="إغلاق النموذج"
        >
          <X size={16} />
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="custom-scrollbar flex-grow space-y-4 overflow-y-auto p-4"
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="bf-title" className="mb-1.5 block text-micro font-bold text-muted">
              عنوان المقال
            </label>
            <input
              required
              id="bf-title"
              type="text"
              value={currentPost.title}
              onChange={(e) => set('title', e.target.value)}
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm font-bold outline-none focus:outline-none focus:ring-2 focus:ring-focus"
              placeholder="مثال: أفضل نصائح الدراسة..."
            />
          </div>
          <div>
            <label htmlFor="bf-slug" className="mb-1.5 block text-micro font-bold text-muted">
              الرابط المختصر (Slug)
            </label>
            <div className="relative">
              <LinkIcon className="absolute end-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
              <input
                required
                id="bf-slug"
                type="text"
                value={currentPost.slug}
                onChange={(e) => set('slug', e.target.value.replace(/\s+/g, '-').toLowerCase())}
                className="w-full rounded-xl border border-border bg-surface px-4 py-3 pe-10 text-end text-sm font-bold outline-none focus:outline-none focus:ring-2 focus:ring-focus"
                dir="ltr"
                placeholder="أفضل-نصائح-الدراسة"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-micro font-bold text-muted">التصنيف</label>
            <div className="relative">
              <Tag className="absolute start-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
              <input
                type="text"
                value={currentPost.category}
                onChange={(e) => set('category', e.target.value)}
                className="w-full rounded-xl border border-border bg-surface py-3 ps-10 text-sm font-bold outline-none focus:outline-none focus:ring-2 focus:ring-focus"
                placeholder="مثل: نصائح دراسية"
              />
            </div>
          </div>
          <div>
            <label htmlFor="bf-author" className="mb-1.5 block text-micro font-bold text-muted">
              الكاتب
            </label>
            <input
              id="bf-author"
              type="text"
              value={currentPost.author}
              onChange={(e) => set('author', e.target.value)}
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm font-bold outline-none focus:outline-none focus:ring-2 focus:ring-focus"
            />
          </div>
          <div>
            <label htmlFor="bf-date" className="mb-1.5 block text-micro font-bold text-muted">
              التاريخ
            </label>
            <input
              id="bf-date"
              type="date"
              value={currentPost.date?.split('T')[0]}
              onChange={(e) => set('date', e.target.value)}
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm font-bold outline-none focus:outline-none focus:ring-2 focus:ring-focus"
            />
          </div>
        </div>

        <BlogFormEducationalSection
          currentPost={currentPost}
          onSet={set}
          onSetCurrentPost={setCurrentPost}
        />

        {(currentPost.contentType === 'foundation' || currentPost.contentType === 'notes') && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-micro font-bold text-muted">رابط المصدر</label>
              <div className="relative">
                <LinkIcon
                  className="absolute end-4 top-1/2 -translate-y-1/2 text-muted"
                  size={16}
                />
                <input
                  type="url"
                  value={currentPost.source || ''}
                  onChange={(e) => set('source', e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface px-4 py-3 pe-10 text-end text-sm font-bold outline-none focus:outline-none focus:ring-2 focus:ring-focus"
                  dir="ltr"
                  placeholder="https://..."
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-micro font-bold text-muted">حجم الملف</label>
              <input
                type="text"
                value={currentPost.fileSize || ''}
                onChange={(e) => set('fileSize', e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm font-bold outline-none focus:outline-none focus:ring-2 focus:ring-focus"
                placeholder="2.5 MB"
              />
            </div>
          </div>
        )}

        <div>
          <label htmlFor="bf-cover" className="mb-1.5 block text-micro font-bold text-muted">
            رابط الصورة الرئيسية
          </label>
          <div className="relative">
            <ImageIcon className="absolute end-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <input
              id="bf-cover"
              type="url"
              value={currentPost.coverImage}
              onChange={(e) => set('coverImage', e.target.value)}
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 pe-10 text-end text-sm font-bold outline-none focus:outline-none focus:ring-2 focus:ring-focus"
              dir="ltr"
              placeholder="https://..."
            />
          </div>
          {currentPost.coverImage && (
            <div className="mt-2 h-32 w-full overflow-hidden rounded-xl border border-border">
              <Image src={currentPost.coverImage} alt="معاينة" className="h-32 w-full" />
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={currentPost.isNew || false}
              onChange={(e) => set('isNew', e.target.checked)}
              className="h-4 w-4 rounded border-border text-primary focus:ring-focus"
            />
            <span className="flex items-center gap-1 text-micro font-bold text-muted">
              <Star size={12} className="text-warning" /> جديد
            </span>
          </label>
        </div>

        <div>
          <label htmlFor="bf-keywords" className="mb-1.5 block text-micro font-bold text-muted">
            الكلمات المفتاحية (Keywords) — مفصولة بفواصل
          </label>
          <input
            id="bf-keywords"
            type="text"
            value={currentPost.keywords}
            onChange={(e) => set('keywords', e.target.value)}
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm font-bold outline-none focus:outline-none focus:ring-2 focus:ring-focus"
            placeholder="دراسة, نصائح, تفوق"
          />
        </div>

        <div>
          <label htmlFor="bf-excerpt" className="mb-1.5 block text-micro font-bold text-muted">
            وصف مختصر (يظهر في محركات البحث)
          </label>
          <textarea
            id="bf-excerpt"
            rows={2}
            value={currentPost.excerpt}
            onChange={(e) => set('excerpt', e.target.value)}
            className="w-full resize-none rounded-xl border border-border bg-surface px-4 py-3 text-sm font-bold outline-none focus:outline-none focus:ring-2 focus:ring-focus"
            placeholder="وصف قصير يظهر في نتائج البحث..."
          />
        </div>

        <div>
          <label className="mb-1.5 block text-micro font-bold text-muted">
            محتوى المقال (كود HTML)
          </label>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="bf-c1" className="mb-1.5 block text-micro font-bold text-muted">
                الجزء الأول
              </label>
              <textarea
                id="bf-c1"
                rows={10}
                required
                value={contentPart1}
                onChange={(e) => setContentPart1(e.target.value)}
                className="w-full resize-none rounded-xl border border-border bg-surface px-4 py-3 font-mono text-sm font-bold outline-none focus:outline-none focus:ring-2 focus:ring-focus"
                placeholder="الجزء الأول من المحتوى..."
              />
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between rounded-xl border border-border bg-surface p-3">
                <span className="text-micro font-bold text-muted">
                  إظهار أزرار التحميل والمشاهدة
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={!!currentPost.showButtons}
                  aria-label="إظهار أزرار التحميل والمشاهدة"
                  onClick={() => set('showButtons', !currentPost.showButtons)}
                  className={`relative h-6 w-12 shrink-0 rounded-full transition-colors duration-normal focus-visible:ring-2 focus-visible:ring-focus ${currentPost.showButtons ? 'bg-success' : 'bg-dim'}`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-background shadow-sm transition-all duration-normal ${currentPost.showButtons ? 'start-0.5' : 'end-0.5'}`}
                  />
                </button>
              </div>
              <div>
                <label
                  htmlFor="bf-dl"
                  className="mb-1.5 block flex items-center gap-1.5 text-micro font-bold text-muted"
                >
                  <Download size={12} /> رابط التحميل
                </label>
                <div className="relative">
                  <LinkIcon
                    className="absolute end-4 top-1/2 -translate-y-1/2 text-muted"
                    size={16}
                  />
                  <input
                    id="bf-dl"
                    type="url"
                    value={currentPost.downloadLink || ''}
                    onChange={(e) => set('downloadLink', e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface px-4 py-3 pe-10 text-end text-sm font-bold outline-none focus:outline-none focus:ring-2 focus:ring-focus"
                    dir="ltr"
                    placeholder="https://..."
                  />
                </div>
                <label
                  htmlFor="bf-dlt"
                  className="mb-1.5 mt-2 block text-micro font-bold text-muted"
                >
                  نص زر التحميل
                </label>
                <input
                  id="bf-dlt"
                  type="text"
                  value={currentPost.downloadButtonText || ''}
                  onChange={(e) => set('downloadButtonText', e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-start text-sm font-bold outline-none focus:outline-none focus:ring-2 focus:ring-focus"
                  placeholder="تحميل الملف"
                />
              </div>
              <div>
                <label
                  htmlFor="bf-wl"
                  className="mb-1.5 block flex items-center gap-1.5 text-micro font-bold text-muted"
                >
                  <Eye size={12} /> رابط المشاهدة
                </label>
                <div className="relative">
                  <LinkIcon
                    className="absolute end-4 top-1/2 -translate-y-1/2 text-muted"
                    size={16}
                  />
                  <input
                    id="bf-wl"
                    type="url"
                    value={currentPost.watchLink || ''}
                    onChange={(e) => set('watchLink', e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface px-4 py-3 pe-10 text-end text-sm font-bold outline-none focus:outline-none focus:ring-2 focus:ring-focus"
                    dir="ltr"
                    placeholder="https://..."
                  />
                </div>
                <label
                  htmlFor="bf-wlt"
                  className="mb-1.5 mt-2 block text-micro font-bold text-muted"
                >
                  نص زر المشاهدة
                </label>
                <input
                  id="bf-wlt"
                  type="text"
                  value={currentPost.watchButtonText || ''}
                  onChange={(e) => set('watchButtonText', e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-start text-sm font-bold outline-none focus:outline-none focus:ring-2 focus:ring-focus"
                  placeholder="مشاهدة الملف"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="bf-c2" className="mb-1.5 block text-micro font-bold text-muted">
                  الجزء الثاني
                </label>
                <textarea
                  id="bf-c2"
                  rows={6}
                  value={contentPart2}
                  onChange={(e) => setContentPart2(e.target.value)}
                  className="w-full resize-none rounded-xl border border-border bg-surface px-4 py-3 font-mono text-sm font-bold outline-none focus:outline-none focus:ring-2 focus:ring-focus"
                  placeholder="الجزء الثاني من المحتوى..."
                />
              </div>
            </div>
          </div>
        </div>

        <BlogFormSeoSection currentPost={currentPost} onSet={set} />

        <div
          className="sticky bottom-0 z-10 -mx-4 -mb-4 mt-1 flex items-center justify-end gap-2 border-t border-border bg-card px-4 py-3 backdrop-blur-md"
          style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
        >
          <button
            type="button"
            onClick={() => setIsModalOpen(false)}
            className="h-11 rounded-xl border border-border bg-surface px-5 text-xs font-bold text-main transition-colors hover:bg-hover focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98]"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex h-11 items-center gap-2 rounded-xl bg-primary px-6 text-xs font-bold text-on-primary transition-colors hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={16} />}
            {currentPost.id ? 'حفظ التعديلات' : 'نشر المقال'}
          </button>
        </div>
      </form>
    </div>
  )
}
