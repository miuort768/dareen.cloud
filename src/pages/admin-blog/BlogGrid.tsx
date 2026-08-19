import { Edit2, Trash2, ExternalLink, Calendar, User, BookMarked } from 'lucide-react'
import { Image } from '../../shared/components/ui'
import type { BlogPost } from './types'

interface BlogGridProps {
  loading: boolean
  filteredPosts: BlogPost[]
  handleOpenModal: (post?: BlogPost) => void
  handleDelete: (id: string) => void
}

export const BlogGrid = ({
  loading,
  filteredPosts,
  handleOpenModal,
  handleDelete,
}: BlogGridProps) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-error" />
      </div>
    )
  }

  if (filteredPosts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card py-20 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-error-soft text-error">
          <BookMarked size={22} />
        </div>
        <p className="text-sm font-bold text-muted">لا توجد مقالات بعد! أضف أول مقال الآن</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {filteredPosts.map((post) => (
        <div key={post.id} className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="relative h-36 overflow-hidden">
            <Image
              src={post.coverImage || 'https://via.placeholder.com/400x200'}
              alt={post.title}
              className="h-full w-full"
            />
            <div className="absolute start-2 top-2">
              <span className="rounded-lg bg-error px-2 py-1 text-micro font-bold text-on-error">
                {post.category}
              </span>
            </div>
          </div>
          <div className="p-3">
            <h3 className="mb-1 line-clamp-2 text-sm font-bold text-main">{post.title}</h3>
            <div className="mb-2 flex items-center gap-2 text-micro font-bold text-muted">
              <div className="flex items-center gap-1">
                <Calendar size={12} /> {post.date}
              </div>
              <div className="flex items-center gap-1">
                <User size={12} /> {post.author}
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-2">
              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenModal(post)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-info transition-all duration-200 hover:bg-info-soft active:scale-95"
                  aria-label="تعديل"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => handleDelete(post.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-error transition-all duration-200 hover:bg-error-soft active:scale-95"
                  aria-label="حذف"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <a
                href={`/books/${post.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="عرض المقال"
                className="flex h-8 w-8 items-center justify-center rounded-xl text-muted transition-colors hover:bg-surface"
              >
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
