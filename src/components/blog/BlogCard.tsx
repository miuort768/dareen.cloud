import { Link } from 'react-router-dom'
import { Image } from '../../shared/components/ui'
import { FileText, ExternalLink, Download, Eye, ArrowLeft, Calendar, Flame } from 'lucide-react'
import { subjectNameMap } from './LibraryConfig'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content?: string
  coverImage?: string
  downloadLink?: string
  watchLink?: string
  fileSize?: string
  file_size?: string
  downloadButtonText?: string
  download_button_text?: string
  watchButtonText?: string
  watch_button_text?: string
  source?: string
  date?: string
  views?: number
  subject?: string
  category?: string
}

interface FoundationBtnState {
  type: 'download' | 'watch'
  phase: 'counting' | 'ready'
  seconds?: number
  postId: string
}

interface FoundationCardProps {
  post: BlogPost
  cardStyle: {
    gradient: string
    badge: string
    icon: React.ElementType
    sourceText: string
    fileSizeBadge: string
  }
  foundationBtnState: FoundationBtnState | null
  handleButtonClick: (
    type: 'download' | 'watch',
    url: string,
    postId: string,
    e: React.MouseEvent,
  ) => void
  i: number
}

export const FoundationCard = ({
  post,
  cardStyle,
  foundationBtnState,
  handleButtonClick,
  i,
}: FoundationCardProps) => {
  const downloadLink = post.downloadLink
  const watchLink = post.watchLink
  const borderAccent = cardStyle.gradient.includes('warning')
    ? 'border-s-warning'
    : cardStyle.gradient.includes('primary')
      ? 'border-s-primary'
      : 'border-s-primary'

  return (
    <div className="duration-500 animate-in zoom-in-95" style={{ animationDelay: `${i * 60}ms` }}>
      <div
        className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-elevation-1 ${borderAccent}`}
      >
        <div className="flex flex-1 flex-col p-5">
          <div className="mb-3 flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r px-2.5 py-1 text-[10px] font-extrabold text-on-primary ${cardStyle.gradient}`}
            >
              <cardStyle.icon size={10} />
              {cardStyle.badge}
            </span>
            {(post.fileSize || post.file_size) && (
              <span
                className={`inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 ${cardStyle.fileSizeBadge} border text-[10px] font-bold`}
              >
                <FileText size={10} />
                {post.fileSize || post.file_size}
              </span>
            )}
          </div>

          <h3 className="mb-2 font-heading text-sm font-black leading-snug text-main sm:text-base">
            {post.title}
          </h3>

          {post.source && (
            <a
              href={post.source}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1.5 text-[11px] font-bold ${cardStyle.sourceText} mb-3 w-fit transition-colors`}
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink size={10} />
              <span className="max-w-[200px] truncate" dir="ltr">
                {post.source}
              </span>
            </a>
          )}

          <p className="mb-4 line-clamp-2 flex-1 text-[11px] leading-relaxed text-muted sm:text-xs">
            {post.excerpt}
          </p>

          <div className="border-t border-border pt-3" />

          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              {downloadLink && (
                <button
                  type="button"
                  onClick={(e) => handleButtonClick('download', downloadLink, post.id, e)}
                  disabled={
                    foundationBtnState !== null &&
                    (foundationBtnState.postId !== post.id ||
                      foundationBtnState.type !== 'download')
                  }
                  className="inline-flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-warning py-2.5 text-[11px] font-extrabold text-on-warning transition-all duration-200 hover:bg-warning-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Download size={13} />
                  <span>
                    {foundationBtnState?.type === 'download' &&
                    foundationBtnState.phase === 'counting' &&
                    foundationBtnState.postId === post.id
                      ? `${post.downloadButtonText || post.download_button_text || 'تحميل'} (${foundationBtnState.seconds})`
                      : foundationBtnState?.type === 'download' &&
                          foundationBtnState.phase === 'ready' &&
                          foundationBtnState.postId === post.id
                        ? 'جاهز'
                        : post.downloadButtonText || post.download_button_text || 'تحميل'}
                  </span>
                </button>
              )}
              {watchLink && (
                <button
                  type="button"
                  onClick={(e) => handleButtonClick('watch', watchLink, post.id, e)}
                  disabled={
                    foundationBtnState !== null &&
                    (foundationBtnState.postId !== post.id || foundationBtnState.type !== 'watch')
                  }
                  className="inline-flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-primary py-2.5 text-[11px] font-extrabold text-on-primary transition-all duration-200 hover:bg-primary-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Eye size={13} />
                  <span>
                    {foundationBtnState?.type === 'watch' &&
                    foundationBtnState.phase === 'counting' &&
                    foundationBtnState.postId === post.id
                      ? `${post.watchButtonText || post.watch_button_text || 'مشاهدة'} (${foundationBtnState.seconds})`
                      : foundationBtnState?.type === 'watch' &&
                          foundationBtnState.phase === 'ready' &&
                          foundationBtnState.postId === post.id
                        ? 'جاهز'
                        : post.watchButtonText || post.watch_button_text || 'مشاهدة'}
                  </span>
                </button>
              )}
            </div>
            <Link
              to={`/books/${post.slug}`}
              onClick={() => window.scrollTo(0, 0)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-success py-2.5 text-[11px] font-extrabold text-on-success transition-all duration-200 hover:bg-success-hover active:scale-[0.98]"
            >
              <span>اقرأ المقال</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

interface RegularCardProps {
  post: BlogPost
  isCoursesStyle: boolean
  i: number
}

export const RegularCard = ({ post, isCoursesStyle, i }: RegularCardProps) => {
  return (
    <div className="duration-500 animate-in zoom-in-95" style={{ animationDelay: `${i * 60}ms` }}>
      <Link
        to={`/books/${post.slug}`}
        onClick={() => window.scrollTo(0, 0)}
        className="group block flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-elevation-1"
      >
        <div
          className={`relative ${isCoursesStyle ? 'h-44' : 'aspect-video'} overflow-hidden bg-surface`}
        >
          <Image
            src={post.coverImage || 'https://via.placeholder.com/400x200'}
            alt={post.title}
            className="h-full w-full"
            imgClassName={`transition-transform duration-500 ${isCoursesStyle ? 'object-contain scale-[1.15]' : 'group-hover:scale-105'}`}
          />
          <div
            className={`absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t ${isCoursesStyle ? 'from-card' : 'from-black/30'} to-transparent`}
          />
          <div className="absolute start-3 top-3 z-10">
            <span
              className={`rounded-xl px-2.5 py-1 text-[10px] font-extrabold ${isCoursesStyle ? 'bg-gradient-to-br from-error to-primary text-on-primary' : 'border border-border bg-card text-primary backdrop-blur-sm'}`}
            >
              {subjectNameMap[post.subject ?? ''] || post.category}
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-4">
          <div className="mb-2 flex items-center gap-3 text-[11px] font-bold text-muted">
            <span className="flex items-center gap-1">
              <Calendar size={11} />
              <span>{post.date?.split('T')[0]}</span>
            </span>
            {isCoursesStyle && (
              <span className="flex items-center gap-0.5">
                <Flame size={11} className="text-warning" />
                <span>{post.views ?? 0}</span>
              </span>
            )}
          </div>
          <h2 className="mb-2 font-heading text-sm font-black leading-snug text-main transition-colors group-hover:text-primary sm:text-base">
            {post.title}
          </h2>
          <p className="line-clamp-2 flex-1 text-[11px] leading-relaxed text-muted sm:text-xs">
            {post.excerpt}
          </p>

          {isCoursesStyle ? (
            <div className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-success py-2.5 text-[11px] font-extrabold text-on-success transition-all duration-200 hover:bg-success-hover active:scale-[0.98]">
              <ArrowLeft size={13} />
              <span>اقرأ المقال</span>
            </div>
          ) : (
            <div className="group/link mt-4 inline-flex items-center gap-1.5 text-[11px] font-extrabold text-primary">
              <span>اقرأ المقال</span>
              <ArrowLeft
                size={13}
                className="transition-transform group-hover/link:-translate-x-1"
              />
            </div>
          )}
        </div>
      </Link>
    </div>
  )
}
