import {
  ThumbsUp,
  MoreHorizontal,
  AlertTriangle,
  Clock,
  Trash2,
  User,
  Send,
  MessageSquare,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import { cn } from '../../lib/utils'
import { buildThreadedComments } from '../../features/forum/types'
import type { Post } from '../../features/forum/types'

interface ForumPostCardProps {
  post: Post
  isLiked: boolean
  isHighlighted: boolean
  isAdmin: boolean
  currentUserId: string
  showMenuPostId: string | null
  setShowMenuPostId: (v: string | null) => void
  onVote: (postId: string, type: 'upvote') => void
  onDelete: (postId: string) => void
  onReport: (postId: string) => void
  onToggleComments: (postId: string) => void
  onAddComment: (postId: string) => void
  onDeleteComment: (postId: string, commentId: string) => void
  onUpdateStatus: (postId: string, status: 'approved' | 'rejected') => void
  commentTexts: Record<string, string>
  setCommentTexts: (fn: (prev: Record<string, string>) => Record<string, string>) => void
  viewingComments: Record<string, boolean>
}

export const ForumPostCard = ({
  post,
  isLiked,
  isHighlighted,
  isAdmin,
  currentUserId,
  showMenuPostId,
  setShowMenuPostId,
  onVote,
  onDelete,
  onReport,
  onToggleComments,
  onAddComment,
  onDeleteComment,
  onUpdateStatus,
  commentTexts,
  setCommentTexts,
  viewingComments,
}: ForumPostCardProps) => (
  <div
    key={post.id}
    id={`post-${post.id}`}
    className={cn(
      'rounded-card bg-card transition-all duration-500',
      isHighlighted && 'ring-2 ring-primary',
    )}
  >
    <div className="flex items-start justify-between p-4 md:p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-card bg-primary-soft text-sm font-bold text-primary">
          {(post.authorName?.[0] || '').toUpperCase()}
        </div>
        <div>
          <div className="mb-0.5 flex items-center gap-2">
            <h4 className="text-sm font-bold text-main">{post.authorName}</h4>
            {post.authorRole === 'admin' && (
              <span className="rounded-card border border-error bg-error-light px-2 py-0.5 text-micro font-bold text-error">
                إدارة
              </span>
            )}
            {post.authorRole === 'teacher' && (
              <span className="rounded-card border border-success bg-success-light px-2 py-0.5 text-micro font-bold text-success">
                معلم
              </span>
            )}
            {post.authorRole === 'student' && (
              <span className="rounded-card border border-info bg-info-light px-2 py-0.5 text-micro font-bold text-info">
                طالب
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-micro font-medium text-muted">
            <Clock size={9} />
            <span>
              {post.created_at
                ? formatDistanceToNow(
                    new Date(post.created_at) > new Date() ? new Date() : new Date(post.created_at),
                    { addSuffix: true, locale: ar },
                  )
                : ''}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {isAdmin && (
          <button
            onClick={() => onDelete(post.id)}
            className="rounded-xl p-2 text-muted transition-colors hover:bg-error-light hover:text-error"
            aria-label="حذف المنشور"
          >
            <Trash2 size={15} />
          </button>
        )}
        <div className="relative">
          <button
            onClick={() => setShowMenuPostId(showMenuPostId === post.id ? null : post.id)}
            className="rounded-xl p-2 text-muted transition-colors hover:bg-surface hover:text-muted"
            aria-label="القائمة"
          >
            <MoreHorizontal size={17} />
          </button>
          {showMenuPostId === post.id && (
            <div className="absolute end-0 top-full z-50 mt-1 w-36 rounded-card border border-border bg-card py-1">
              <button
                onClick={() => {
                  onReport(post.id)
                  setShowMenuPostId(null)
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-start text-micro font-bold text-muted hover:bg-surface"
              >
                <AlertTriangle size={12} className="text-error" /> الإبلاغ عن المنشور
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
    <div className="px-4 pb-5">
      <p className="whitespace-pre-wrap text-sm font-medium leading-loose text-main md:text-base">
        {post.content}
      </p>
    </div>
    <div className="flex border-t border-border px-3 py-1.5 md:px-4">
      <button
        onClick={() => onVote(post.id, 'upvote')}
        className={cn(
          'flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all active:scale-95',
          isLiked ? 'bg-primary-soft text-primary' : 'text-muted hover:bg-surface hover:text-muted',
        )}
      >
        <ThumbsUp size={15} className={cn(isLiked && 'fill-current')} />
        <span>إعجاب</span>
      </button>
      <button
        onClick={() => onToggleComments(post.id)}
        className="mx-1 flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold text-muted transition-all hover:bg-surface hover:text-muted active:scale-95"
      >
        <MessageSquare size={15} />
        <span>{post.commentCount || 0} تعليق</span>
      </button>
      <button
        onClick={() => onReport(post.id)}
        className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold text-error transition-all hover:bg-error-light hover:text-error active:scale-95"
      >
        <AlertTriangle size={15} />
        <span>بلاغ</span>
      </button>
    </div>
    {viewingComments[post.id] && (
      <div className="space-y-4 rounded-card border-t border-border bg-background p-4 md:p-5">
        <div className="space-y-3">
          {buildThreadedComments(post.comments || []).map((node) => (
            <div key={node.comment.id} className="space-y-3">
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-card bg-primary-soft text-micro font-bold text-primary">
                  {(node.comment.authorName?.[0] || '').toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="rounded-card border border-border bg-card p-3.5">
                    <div className="mb-1 flex items-center justify-between">
                      <h5 className="text-xs font-bold text-main">{node.comment.authorName}</h5>
                      <span className="text-micro font-medium text-muted">
                        {node.comment.created_at
                          ? formatDistanceToNow(
                              new Date(node.comment.created_at) > new Date()
                                ? new Date()
                                : new Date(node.comment.created_at),
                              { addSuffix: true, locale: ar },
                            )
                          : ''}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed text-muted">{node.comment.content}</p>
                    <div className="mt-2 flex gap-3 border-t border-border pt-2">
                      <button
                        onClick={() => {
                          const currentText = commentTexts[post.id] || ''
                          setCommentTexts((prev) => ({
                            ...prev,
                            [post.id]: `@${node.comment.authorName} ${currentText}`,
                          }))
                          document.getElementById(`comment-input-${post.id}`)?.focus()
                        }}
                        className="text-micro font-bold text-primary transition-colors hover:text-primary"
                      >
                        رد
                      </button>
                      {(isAdmin || currentUserId === node.comment.authorId) && (
                        <button
                          onClick={() => onDeleteComment(post.id, node.comment.id)}
                          className="text-micro font-bold text-error transition-colors hover:text-error"
                        >
                          حذف
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {node.replies.length > 0 && (
                <div className="ms-3 space-y-2 border-s-2 border-primary ps-7">
                  {node.replies.map((replyNode) => (
                    <div key={replyNode.comment.id} className="flex gap-2">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-card bg-primary-soft text-micro font-bold text-primary">
                        {(replyNode.comment.authorName?.[0] || '').toUpperCase()}
                      </div>
                      <div className="flex-1 rounded-card border border-border bg-card p-2.5">
                        <div className="mb-0.5 flex items-center justify-between">
                          <h5 className="text-micro font-bold text-main">
                            {replyNode.comment.authorName}
                          </h5>
                          <span className="text-micro text-muted">
                            {replyNode.comment.created_at
                              ? formatDistanceToNow(
                                  new Date(replyNode.comment.created_at) > new Date()
                                    ? new Date()
                                    : new Date(replyNode.comment.created_at),
                                  { addSuffix: true, locale: ar },
                                )
                              : ''}
                          </span>
                        </div>
                        <p className="text-micro leading-relaxed text-muted">
                          {replyNode.comment.content}
                        </p>
                        {(isAdmin || currentUserId === replyNode.comment.authorId) && (
                          <button
                            onClick={() => onDeleteComment(post.id, replyNode.comment.id)}
                            className="mt-1 text-micro font-bold text-error transition-colors hover:text-error"
                          >
                            حذف
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 border-t border-border pt-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-card bg-primary-soft">
            <User size={14} className="text-primary" />
          </div>
          <div className="relative flex-1">
            <input
              id={`comment-input-${post.id}`}
              type="text"
              aria-label="رد على المنشور"
              value={commentTexts[post.id] || ''}
              onChange={(e) => setCommentTexts((prev) => ({ ...prev, [post.id]: e.target.value }))}
              placeholder="اكتب رداً على هذا المنشور..."
              className="w-full rounded-card border border-border bg-card py-2.5 pe-10 ps-4 text-xs font-medium text-main transition-all placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-focus"
              onKeyDown={(e) => {
                if (e.key === 'Enter') onAddComment(post.id)
              }}
            />
            <button
              onClick={() => onAddComment(post.id)}
              disabled={!(commentTexts[post.id] || '').trim()}
              aria-label="إرسال التعليق"
              className="absolute end-1 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-card bg-primary text-on-primary transition-all hover:bg-primary-hover active:scale-90 disabled:opacity-30"
            >
              <Send size={11} />
            </button>
          </div>
        </div>
      </div>
    )}
    {isAdmin && post.status === 'pending' && (
      <div className="flex items-center justify-between rounded-card border-t border-warning bg-warning-light p-3.5">
        <div className="flex items-center gap-2 text-warning">
          <AlertTriangle size={13} />
          <span className="text-micro font-bold">هذا المنشور ينتظر الموافقة</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onUpdateStatus(post.id, 'approved')}
            className="rounded-card bg-success px-3.5 py-1.5 text-micro font-bold text-on-success transition-all hover:bg-success hover:text-on-success active:scale-95"
          >
            موافقة
          </button>
          <button
            onClick={() => onDelete(post.id)}
            className="rounded-card bg-error px-3.5 py-1.5 text-micro font-bold text-on-error transition-all hover:bg-error hover:text-on-error active:scale-95"
          >
            حذف
          </button>
        </div>
      </div>
    )}
  </div>
)
