import { Edit2, Trash2, ExternalLink, Calendar, User, BookMarked } from 'lucide-react'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { Image, Skeleton } from '../../shared/components/ui'
import type { BlogPost } from './types'

interface BlogGridProps {
  loading: boolean
  filteredPosts: BlogPost[]
  handleOpenModal: (post?: BlogPost) => void
  handleDelete: (id: string) => void
}

const formatDate = (d: string) => {
  try {
    return format(new Date(d), 'dd MMM yyyy', { locale: ar })
  } catch {
    return d
  }
}

export const BlogGrid = ({
  loading,
  filteredPosts,
  handleOpenModal,
  handleDelete,
}: BlogGridProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-border bg-card">
            <Skeleton className="h-36 w-full rounded-2xl" />
            <div className="space-y-2 p-3">
              <Skeleton className="h-4 w-3/4 rounded-lg" />
              <Skeleton className="h-3 w-1/2 rounded-lg" />
              <div className="flex justify-between pt-2">
                <Skeleton className="h-8 w-20 rounded-lg" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (filteredPosts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card py-16 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <BookMarked size={22} />
        </div>
        <p className="text-sm font-bold text-muted">لا توجد مقالات بعد — أضف أول مقال الآن</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {filteredPosts.map((post) => (
        <div
          key={post.id}
          className="group overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-elevation-2"
        >
          <div className="relative h-36 overflow-hidden bg-gradient-to-br from-primary-soft to-background dark:from-primary/20 dark:to-card">
            {post.coverImage ? (
              <Image
                src={post.coverImage}
                alt={post.title}
                className="h-full w-full transition-transform duration-normal group-hover:scale-[1.03]"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-primary/40">
                <BookMarked size={40} strokeWidth={1.5} />
              </div>
            )}
            <div className="absolute start-2 top-2">
              <span className="rounded-lg bg-primary px-2 py-1 text-micro font-bold text-on-primary shadow-sm">
                {post.category || 'عام'}
              </span>
            </div>
          </div>
          <div className="p-3.5">
            <h3 className="mb-1.5 line-clamp-2 min-h-[2.5rem] text-sm font-bold leading-snug text-main">
              {post.title || 'بدون عنوان'}
            </h3>
            <div className="mb-3 flex items-center gap-3 text-micro font-bold text-muted">
              <span className="flex items-center gap-1">
                <Calendar size={12} /> {formatDate(post.date)}
              </span>
              <span className="flex min-w-0 items-center gap-1">
                <User size={12} className="shrink-0" />
                <span className="truncate">{post.author || '—'}</span>
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-2.5">
              <div className="flex gap-1.5">
                <button
                  onClick={() => handleOpenModal(post)}
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-info transition-colors hover:bg-info-soft focus-visible:ring-2 focus-visible:ring-focus active:scale-95 md:h-9 md:w-9"
                  aria-label="تعديل"
                >
                  <Edit2 size={15} />
                </button>
                <button
                  onClick={() => handleDelete(post.id)}
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-error transition-colors hover:bg-error-soft focus-visible:ring-2 focus-visible:ring-focus active:scale-95 md:h-9 md:w-9"
                  aria-label="حذف"
                >
                  <Trash2 size={15} />
                </button>
              </div>
              <a
                href={`/books/${post.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="عرض المقال"
                className="flex h-10 w-10 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface hover:text-main focus-visible:ring-2 focus-visible:ring-focus active:scale-95 md:h-9 md:w-9"
              >
                <ExternalLink size={15} />
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
