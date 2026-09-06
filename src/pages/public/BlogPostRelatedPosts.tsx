import { Link } from 'react-router-dom'
import { Image } from '../../shared/components/ui'

interface RelatedPost {
  slug: string
  title: string
  excerpt: string
  coverImage: string
  date: string
}

interface BlogPostRelatedPostsProps {
  posts: RelatedPost[]
}

export const BlogPostRelatedPosts = ({ posts }: BlogPostRelatedPostsProps) => {
  if (!posts || !Array.isArray(posts) || posts.length === 0) return null
  return (
    <div className="container mx-auto mb-8 mt-16 max-w-5xl px-4">
      <h2 className="mb-6 text-2xl font-black text-main">مقالات ذات صلة</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
        {posts.map((rp) => (
          <Link
            key={rp.slug}
            to={`/books/${rp.slug}`}
            className="group block overflow-hidden rounded-card border border-border bg-card shadow-elevation-2 transition-all hover:shadow-elevation-4"
          >
            <div className="aspect-[16/9] overflow-hidden bg-surface">
              <Image
                src={rp.coverImage || ''}
                alt={rp.title}
                className="h-full w-full group-hover:scale-105"
              />
            </div>
            <div className="p-4">
              <p className="mb-1 text-micro font-bold text-muted">{rp.date}</p>
              <h3 className="line-clamp-2 text-sm font-black text-main transition-colors group-hover:text-error">
                {rp.title}
              </h3>
              {rp.excerpt && <p className="mt-1 line-clamp-2 text-xs text-muted">{rp.excerpt}</p>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
