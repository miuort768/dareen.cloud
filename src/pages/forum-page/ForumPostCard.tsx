import { useState, useEffect, useRef } from 'react'
import {
  ThumbsUp,
  MoreHorizontal,
  AlertTriangle,
  Clock,
  Trash2,
  Edit3,
  User,
  Send,
  MessageSquare,
  CornerDownLeft,
  Check,
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
  currentUserName?: string
  showMenuPostId: string | null
  setShowMenuPostId: (v: string | null) => void
  onVote: (postId: string, type: 'upvote') => void
  onDelete: (postId: string) => void
  onReport: (postId: string) => void
  onToggleComments: (postId: string) => void
  onAddComment: (postId: string) => void
  onDeleteComment: (postId: string, commentId: string) => void
  onUpdateStatus: (postId: string, status: 'approved' | 'rejected') => void
  onEditPost?: (postId: string, newContent: string) => void
  onEditComment?: (commentId: string, newContent: string) => void
  commentTexts: Record<string, string>
  setCommentTexts: (fn: (prev: Record<string, string>) => Record<string, string>) => void
  viewingComments: Record<string, boolean>
}

const formatDisplayName = (rawName?: string, role?: string) => {
  if (!rawName)
    return role === 'parent'
      ? 'ولي الأمر'
      : role === 'teacher'
        ? 'معلمة'
        : role === 'admin'
          ? 'إدارة المنصة'
          : 'طالب'

  const trimmed = rawName.trim()
  if (trimmed.toLowerCase() === 'a.abdullah' || trimmed.toLowerCase() === 'abdullah')
    return 'أ. عبد الله'

  if (/[\u0600-\u06FF]/.test(trimmed)) return trimmed

  if (/^[a-z0-9_\-.]+$/i.test(trimmed)) {
    if (role === 'parent') return 'ولي الأمر'
    if (role === 'teacher') return 'معلمة'
    if (role === 'admin') return 'إدارة المنصة'
    if (role === 'student') return 'طالب'
  }

  return trimmed
}

export const ForumPostCard = ({
  post,
  isLiked,
  isHighlighted,
  isAdmin,
  currentUserId,
  currentUserName,
  showMenuPostId,
  setShowMenuPostId,
  onVote,
  onDelete,
  onReport,
  onToggleComments,
  onAddComment,
  onDeleteComment,
  onUpdateStatus,
  onEditPost,
  onEditComment,
  commentTexts,
  setCommentTexts,
  viewingComments,
}: ForumPostCardProps) => {
  const [isEditingPost, setIsEditingPost] = useState(false)
  const [editPostContent, setEditPostContent] = useState(post.content)
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editCommentText, setEditCommentText] = useState('')
  const menuRef = useRef<HTMLDivElement>(null)

  const isMenuOpen = showMenuPostId === post.id

  useEffect(() => {
    if (!isMenuOpen) return
    const onPointerDown = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setShowMenuPostId(null)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowMenuPostId(null)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [isMenuOpen, setShowMenuPostId])

  const handleSavePostEdit = () => {
    if (!editPostContent.trim()) return
    onEditPost?.(post.id, editPostContent)
    setIsEditingPost(false)
  }

  const handleSaveCommentEdit = (commentId: string) => {
    if (!editCommentText.trim()) return
    onEditComment?.(commentId, editCommentText)
    setEditingCommentId(null)
  }

  const displayAuthorName = formatDisplayName(post.authorName, post.authorRole)

  return (
    <div
      id={`post-${post.id}`}
      className={cn(
        'rounded-card border border-border bg-card shadow-sm transition-shadow duration-normal dark:bg-surface',
        isHighlighted && 'ring-2 ring-primary',
      )}
    >
      {/* Post Header */}
      <div className="flex items-start justify-between rounded-t-card p-4 md:p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-card bg-primary text-sm font-bold text-on-primary shadow-sm">
            {(displayAuthorName[0] || '').toUpperCase()}
          </div>
          <div>
            <div className="mb-0.5 flex items-center gap-2">
              <h4 className="text-sm font-bold text-main">{displayAuthorName}</h4>
              {post.authorRole === 'admin' && (
                <span className="rounded-card border border-error bg-error-light px-2 py-0.5 text-micro font-bold text-error">
                  إدارة
                </span>
              )}
              {post.authorRole === 'teacher' && (
                <span className="rounded-card border border-success bg-success-light px-2 py-0.5 text-micro font-bold text-success">
                  معلمة
                </span>
              )}
              {post.authorRole === 'student' && (
                <span className="rounded-card border border-info bg-info-light px-2 py-0.5 text-micro font-bold text-info">
                  طالب
                </span>
              )}
              {(post.authorRole === 'parent' || (post.authorRole as string) === 'ولي أمر') && (
                <span className="rounded-card border border-primary bg-primary-soft px-2 py-0.5 text-micro font-bold text-primary">
                  شريك النجاح
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-micro font-medium text-muted">
              <Clock size={9} />
              <span>
                {post.created_at
                  ? formatDistanceToNow(
                      new Date(post.created_at) > new Date()
                        ? new Date()
                        : new Date(post.created_at),
                      { addSuffix: true, locale: ar },
                    )
                  : ''}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Admin only: Edit Post Button */}
          {isAdmin && (
            <button
              onClick={() => {
                setIsEditingPost(!isEditingPost)
                setEditPostContent(post.content)
              }}
              className="rounded-xl p-2 text-muted transition-colors duration-fast hover:bg-primary-soft hover:text-primary"
              aria-label="تعديل المنشور"
              title="تعديل المنشور (خاص بالمدير)"
            >
              <Edit3 size={15} />
            </button>
          )}

          {/* Admin only: Delete Post Button */}
          {isAdmin && (
            <button
              onClick={() => onDelete(post.id)}
              className="rounded-xl p-2 text-muted transition-colors duration-fast hover:bg-error-light hover:text-error"
              aria-label="حذف المنشور"
            >
              <Trash2 size={15} />
            </button>
          )}

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenuPostId(isMenuOpen ? null : post.id)}
              className="rounded-xl p-2 text-muted transition-colors duration-fast hover:bg-surface hover:text-muted"
              aria-label="خيارات المنشور"
              aria-haspopup="menu"
              aria-expanded={isMenuOpen}
            >
              <MoreHorizontal size={17} />
            </button>
            {isMenuOpen && (
              <div
                role="menu"
                className="absolute end-0 top-full z-50 mt-1 w-36 rounded-card border border-border bg-card py-1 shadow-elevation-1"
              >
                <button
                  role="menuitem"
                  onClick={() => {
                    onReport(post.id)
                    setShowMenuPostId(null)
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-start text-micro font-bold text-muted transition-colors duration-fast hover:bg-surface"
                >
                  <AlertTriangle size={12} className="text-error" /> الإبلاغ عن المنشور
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Post Content or Edit Form */}
      <div className="px-4 pb-5">
        {isEditingPost ? (
          <div className="space-y-2 rounded-xl border border-border bg-surface p-3">
            <label className="block text-micro font-bold text-primary">
              تعديل نص المنشور (مدير النظام)
            </label>
            <textarea
              rows={3}
              value={editPostContent}
              onChange={(e) => setEditPostContent(e.target.value)}
              className="w-full resize-none rounded-xl border border-border bg-card p-3 text-sm font-medium text-main outline-none focus-visible:ring-2 focus-visible:ring-focus"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditingPost(false)}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-muted transition-colors duration-fast hover:bg-card"
              >
                إلغاء
              </button>
              <button
                onClick={handleSavePostEdit}
                className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-on-primary transition-colors duration-fast hover:bg-primary-hover"
              >
                <Check size={13} /> حفظ التعديل
              </button>
            </div>
          </div>
        ) : (
          <p className="whitespace-pre-wrap text-sm font-medium leading-loose text-main md:text-base">
            {post.content}
          </p>
        )}
      </div>

      {/* Post Actions Bar */}
      <div className="flex border-t border-border px-3 py-1.5 md:px-4">
        <button
          onClick={() => onVote(post.id, 'upvote')}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold outline-none transition-colors duration-fast focus-visible:ring-2 focus-visible:ring-focus active:scale-95',
            isLiked
              ? 'bg-primary-soft text-primary'
              : 'text-muted hover:bg-surface hover:text-muted',
          )}
        >
          <ThumbsUp size={15} className={cn(isLiked && 'fill-current')} />
          <span>إعجاب ({Array.isArray(post.upvotes) ? post.upvotes.length : 0})</span>
        </button>
        <button
          onClick={() => onToggleComments(post.id)}
          className="mx-1 flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold text-muted outline-none transition-colors duration-fast hover:bg-surface hover:text-muted focus-visible:ring-2 focus-visible:ring-focus active:scale-95"
        >
          <MessageSquare size={15} />
          <span>{post.commentCount || 0} تعليق</span>
        </button>
        <button
          onClick={() => onReport(post.id)}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold text-error outline-none transition-colors duration-fast hover:bg-error-light hover:text-error focus-visible:ring-2 focus-visible:ring-focus active:scale-95"
        >
          <AlertTriangle size={15} />
          <span>بلاغ</span>
        </button>
      </div>

      {/* Comments Section */}
      {viewingComments[post.id] && (
        <div className="border-t border-border bg-surface p-4 md:p-5">
          <div className="space-y-1">
            {buildThreadedComments(Array.isArray(post.comments) ? post.comments : []).map(
              (node) => {
                const commentAuthorName = formatDisplayName(
                  node.comment.authorName,
                  node.comment.authorRole,
                )
                return (
                  <div key={node.comment.id} className="group/comment">
                    <div className="flex gap-3 rounded-xl p-3 transition-colors duration-fast hover:bg-card">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-card bg-primary-soft text-xs font-bold text-primary">
                        {(commentAuthorName[0] || '').toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <h5 className="text-xs font-bold text-main">{commentAuthorName}</h5>
                          {node.comment.authorRole === 'admin' && (
                            <span className="rounded-card bg-error-light px-1.5 py-0.5 text-micro font-bold text-error">
                              إدارة
                            </span>
                          )}
                          {node.comment.authorRole === 'teacher' && (
                            <span className="rounded-card bg-success-light px-1.5 py-0.5 text-micro font-bold text-success">
                              معلمة
                            </span>
                          )}
                          {node.comment.authorRole === 'student' && (
                            <span className="rounded-card bg-info-light px-1.5 py-0.5 text-micro font-bold text-info">
                              طالب
                            </span>
                          )}
                          {(node.comment.authorRole === 'parent' ||
                            (node.comment.authorRole as string) === 'ولي أمر') && (
                            <span className="rounded-card bg-primary-soft px-1.5 py-0.5 text-micro font-bold text-primary">
                              شريك النجاح
                            </span>
                          )}
                          <span className="text-micro text-muted">
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

                        {/* Comment Content or Admin Edit Comment Form */}
                        {editingCommentId === node.comment.id ? (
                          <div className="my-1.5 space-y-2 rounded-lg border border-border bg-card p-2">
                            <input
                              type="text"
                              value={editCommentText}
                              onChange={(e) => setEditCommentText(e.target.value)}
                              className="w-full rounded-md border border-border bg-surface p-2 text-xs text-main outline-none focus:border-primary"
                            />
                            <div className="flex justify-end gap-1.5">
                              <button
                                onClick={() => setEditingCommentId(null)}
                                className="rounded px-2 py-1 text-micro text-muted transition-colors duration-fast hover:bg-surface"
                              >
                                إلغاء
                              </button>
                              <button
                                onClick={() => handleSaveCommentEdit(node.comment.id)}
                                className="rounded bg-primary px-2.5 py-1 text-micro font-bold text-on-primary transition-colors duration-fast hover:bg-primary-hover"
                              >
                                حفظ
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs leading-relaxed text-main">
                            {node.comment.content}
                          </p>
                        )}

                        <div className="mt-2 flex items-center gap-1">
                          <button
                            onClick={() => {
                              const currentText = commentTexts[post.id] || ''
                              setCommentTexts((prev) => ({
                                ...prev,
                                [post.id]: `@${node.comment.authorName} ${currentText}`,
                              }))
                              document.getElementById(`comment-input-${post.id}`)?.focus()
                            }}
                            className="flex items-center gap-1 rounded-lg px-2 py-1 text-micro font-bold text-muted transition-colors duration-fast hover:bg-primary/5 hover:text-primary"
                          >
                            <CornerDownLeft size={11} />
                            رد
                          </button>

                          {/* Admin only: Edit Comment */}
                          {isAdmin && (
                            <button
                              onClick={() => {
                                setEditingCommentId(node.comment.id)
                                setEditCommentText(node.comment.content)
                              }}
                              className="flex items-center gap-1 rounded-lg px-2 py-1 text-micro font-bold text-muted transition-colors duration-fast hover:bg-primary/5 hover:text-primary"
                              aria-label="تعديل التعليق"
                              title="تعديل التعليق (خاص بالمدير)"
                            >
                              <Edit3 size={10} />
                              تعديل
                            </button>
                          )}

                          {(isAdmin || currentUserId === node.comment.authorId) && (
                            <button
                              onClick={() => onDeleteComment(post.id, node.comment.id)}
                              className="flex items-center gap-1 rounded-lg px-2 py-1 text-micro font-bold text-muted transition-colors duration-fast hover:bg-error-soft hover:text-error"
                            >
                              <Trash2 size={10} />
                              حذف
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Replies Thread */}
                    {node.replies.length > 0 && (
                      <div className="me-0 ms-6 border-e-2 border-primary/20 ps-4">
                        {node.replies.map((replyNode) => {
                          const replyAuthorName = formatDisplayName(
                            replyNode.comment.authorName,
                            replyNode.comment.authorRole,
                          )
                          return (
                            <div
                              key={replyNode.comment.id}
                              className="flex gap-2.5 rounded-xl p-2.5 transition-colors duration-fast hover:bg-card"
                            >
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-card bg-primary-soft text-micro font-bold text-primary">
                                {(replyAuthorName[0] || '').toUpperCase()}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="mb-0.5 flex items-center gap-2">
                                  <h5 className="text-xs font-bold text-main">{replyAuthorName}</h5>
                                  {replyNode.comment.authorRole === 'admin' && (
                                    <span className="rounded-card bg-error-light px-1.5 py-0.5 text-micro font-bold text-error">
                                      إدارة
                                    </span>
                                  )}
                                  {replyNode.comment.authorRole === 'teacher' && (
                                    <span className="rounded-card bg-success-light px-1.5 py-0.5 text-micro font-bold text-success">
                                      معلمة
                                    </span>
                                  )}
                                  {replyNode.comment.authorRole === 'student' && (
                                    <span className="rounded-card bg-info-light px-1.5 py-0.5 text-micro font-bold text-info">
                                      طالب
                                    </span>
                                  )}
                                  {(replyNode.comment.authorRole === 'parent' ||
                                    (replyNode.comment.authorRole as string) === 'ولي أمر') && (
                                    <span className="rounded-card bg-primary-soft px-1.5 py-0.5 text-micro font-bold text-primary">
                                      شريك النجاح
                                    </span>
                                  )}
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

                                {editingCommentId === replyNode.comment.id ? (
                                  <div className="my-1.5 space-y-2 rounded-lg border border-border bg-card p-2">
                                    <input
                                      type="text"
                                      value={editCommentText}
                                      onChange={(e) => setEditCommentText(e.target.value)}
                                      className="w-full rounded-md border border-border bg-surface p-2 text-xs text-main outline-none focus:border-primary"
                                    />
                                    <div className="flex justify-end gap-1.5">
                                      <button
                                        onClick={() => setEditingCommentId(null)}
                                        className="rounded px-2 py-1 text-micro text-muted transition-colors duration-fast hover:bg-surface"
                                      >
                                        إلغاء
                                      </button>
                                      <button
                                        onClick={() => handleSaveCommentEdit(replyNode.comment.id)}
                                        className="rounded bg-primary px-2.5 py-1 text-micro font-bold text-on-primary transition-colors duration-fast hover:bg-primary-hover"
                                      >
                                        حفظ
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-xs leading-relaxed text-main">
                                    {replyNode.comment.content}
                                  </p>
                                )}

                                <div className="mt-1.5 flex items-center gap-1">
                                  <button
                                    onClick={() => {
                                      const currentText = commentTexts[post.id] || ''
                                      setCommentTexts((prev) => ({
                                        ...prev,
                                        [post.id]: `@${replyNode.comment.authorName} ${currentText}`,
                                      }))
                                      document.getElementById(`comment-input-${post.id}`)?.focus()
                                    }}
                                    className="flex items-center gap-1 rounded-lg px-2 py-0.5 text-micro font-bold text-muted transition-colors duration-fast hover:bg-primary/5 hover:text-primary"
                                  >
                                    <CornerDownLeft size={9} />
                                    رد
                                  </button>

                                  {/* Admin only: Edit Reply Comment */}
                                  {isAdmin && (
                                    <button
                                      onClick={() => {
                                        setEditingCommentId(replyNode.comment.id)
                                        setEditCommentText(replyNode.comment.content)
                                      }}
                                      className="flex items-center gap-1 rounded-lg px-2 py-0.5 text-micro font-bold text-muted transition-colors duration-fast hover:bg-primary/5 hover:text-primary"
                                      aria-label="تعديل الرد"
                                      title="تعديل التعليق (خاص بالمدير)"
                                    >
                                      <Edit3 size={9} />
                                      تعديل
                                    </button>
                                  )}

                                  {(isAdmin || currentUserId === replyNode.comment.authorId) && (
                                    <button
                                      onClick={() => onDeleteComment(post.id, replyNode.comment.id)}
                                      className="flex items-center gap-1 rounded-lg px-2 py-0.5 text-micro font-bold text-muted transition-colors duration-fast hover:bg-error-soft hover:text-error"
                                    >
                                      <Trash2 size={9} />
                                      حذف
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              },
            )}
          </div>

          <div className="mt-3 flex items-center gap-3 border-t border-border pt-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-card bg-primary-soft text-xs font-bold text-primary">
              {currentUserName?.[0]?.toUpperCase() || <User size={14} />}
            </div>
            <div className="relative flex-1">
              <input
                id={`comment-input-${post.id}`}
                type="text"
                aria-label="رد على المنشور"
                value={commentTexts[post.id] || ''}
                onChange={(e) =>
                  setCommentTexts((prev) => ({ ...prev, [post.id]: e.target.value }))
                }
                placeholder="اكتب تعليقاً..."
                className="w-full rounded-xl border border-border bg-card py-2.5 pe-11 ps-4 text-xs font-medium text-dim text-main outline-none transition-colors duration-fast focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onAddComment(post.id)
                }}
              />
              <button
                onClick={() => onAddComment(post.id)}
                disabled={!(commentTexts[post.id] || '').trim()}
                aria-label="إرسال التعليق"
                className="absolute end-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg bg-primary text-on-primary outline-none transition-colors duration-fast hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-focus active:scale-90 disabled:opacity-25"
              >
                <Send size={12} />
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
              className="rounded-card bg-success px-3.5 py-1.5 text-micro font-bold text-on-success outline-none transition-colors duration-fast focus-visible:ring-2 focus-visible:ring-focus active:scale-95"
            >
              موافقة
            </button>
            <button
              onClick={() => onDelete(post.id)}
              className="rounded-card bg-error px-3.5 py-1.5 text-micro font-bold text-on-error outline-none transition-colors duration-fast focus-visible:ring-2 focus-visible:ring-focus active:scale-95"
            >
              حذف
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
