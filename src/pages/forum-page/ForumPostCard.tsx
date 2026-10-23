import { useState } from 'react'
import {
  ThumbsUp,
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
import { buildThreadedComments, POST_TYPE_META, resolvePostType } from '../../features/forum/types'
import type { Comment, Post } from '../../features/forum/types'

interface ForumPostCardProps {
  post: Post
  isLiked: boolean
  isHighlighted: boolean
  isAdmin: boolean
  currentUserId: string
  currentUserName?: string
  isReported: boolean
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
  comments: Comment[]
}

const roleLabel = (role?: string) =>
  role === 'parent'
    ? 'شريك النجاح'
    : role === 'teacher'
      ? 'معلمة'
      : role === 'admin'
        ? 'إدارة الأكاديمية'
        : role === 'student'
          ? 'طالب'
          : null

const formatDisplayName = (rawName?: string, role?: string) => {
  // الأدمن يظهر بلقب الإدارة دائمًا — إخفاء أي اسم مستخدم مثل "superadmin"
  if (role === 'admin') return 'إدارة الأكاديمية'

  const trimmed = (rawName ?? '').trim()

  if (trimmed.toLowerCase() === 'a.abdullah' || trimmed.toLowerCase() === 'abdullah')
    return 'أ. عبد الله'

  // الأسماء العربية الحقيقية تظهر كما هي
  if (/[\u0600-\u06FF]/.test(trimmed)) return trimmed

  // أي اسم لاتيني (username) أو غائب يُستبدل بلقب الدور
  return roleLabel(role) ?? (trimmed || 'عضو المنتدى')
}

export const ForumPostCard = ({
  post,
  isLiked,
  isHighlighted,
  isAdmin,
  currentUserId,
  currentUserName,
  isReported,
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
  comments,
}: ForumPostCardProps) => {
  const [isEditingPost, setIsEditingPost] = useState(false)
  const [editPostContent, setEditPostContent] = useState(post.content)
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editCommentText, setEditCommentText] = useState('')

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
  const typeMeta = POST_TYPE_META[resolvePostType(post.type)]
  const TypeIcon = typeMeta.icon
  const typeAccent: Record<string, string> = {
    question: 'via-info',
    discussion: 'via-primary',
    tip: 'via-success',
    announcement: 'via-warning',
  }

  return (
    <div
      id={`post-${post.id}`}
      className={cn(
        'group/card relative overflow-hidden rounded-3xl border border-border bg-surface shadow-soft transition-all duration-normal hover:-translate-y-0.5 hover:shadow-elevation-1',
        isHighlighted && 'ring-2 ring-primary',
      )}
    >
      {/* شريط لون علوي حسب نوع المنشور */}
      <div
        aria-hidden="true"
        className={cn(
          'absolute inset-x-0 top-0 h-0.5 bg-gradient-to-l from-transparent to-transparent opacity-50 transition-opacity duration-300 group-hover/card:opacity-100',
          typeAccent[resolvePostType(post.type)] ?? 'via-primary',
        )}
      />
      {/* Post Header */}
      <div className="flex items-start justify-between rounded-t-3xl p-4 md:p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-soft text-sm font-bold text-primary ring-2 ring-primary/10 transition-transform duration-300 group-hover/card:scale-105">
            {(displayAuthorName[0] || '').toUpperCase()}
          </div>
          <div>
            <div className="mb-0.5 flex items-center gap-2">
              <h4 className="text-sm font-bold text-main">{displayAuthorName}</h4>
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2 py-0.5 text-micro font-bold text-muted">
                <TypeIcon size={9} strokeWidth={2.2} />
                {typeMeta.label}
              </span>
              {post.authorRole === 'admin' && (
                <span className="rounded-full border border-error bg-error px-2 py-0.5 text-micro font-bold text-on-error">
                  إدارة
                </span>
              )}
              {post.authorRole === 'teacher' && (
                <span className="rounded-full border border-success bg-success px-2 py-0.5 text-micro font-bold text-on-success">
                  معلمة
                </span>
              )}
              {post.authorRole === 'student' && (
                <span className="rounded-full border border-info bg-info px-2 py-0.5 text-micro font-bold text-on-info">
                  طالب
                </span>
              )}
              {(post.authorRole === 'parent' || (post.authorRole as string) === 'ولي أمر') && (
                <span className="rounded-full border border-primary bg-primary px-2 py-0.5 text-micro font-bold text-on-primary">
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

        {isAdmin && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setIsEditingPost(!isEditingPost)
                setEditPostContent(post.content)
              }}
              className="rounded-xl p-2 text-muted outline-none transition-colors duration-fast hover:bg-primary-soft hover:text-primary focus-visible:ring-2 focus-visible:ring-focus"
              aria-label="تعديل المنشور"
              title="تعديل المنشور (خاص بالمدير)"
            >
              <Edit3 size={15} />
            </button>

            <button
              onClick={() => onDelete(post.id)}
              className="rounded-xl p-2 text-muted outline-none transition-colors duration-fast hover:bg-error-soft hover:text-error focus-visible:ring-2 focus-visible:ring-focus"
              aria-label="حذف المنشور"
            >
              <Trash2 size={15} />
            </button>
          </div>
        )}
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
              aria-label="تعديل نص المنشور"
              value={editPostContent}
              onChange={(e) => setEditPostContent(e.target.value)}
              className="w-full resize-none rounded-xl border border-border bg-surface p-3 text-sm font-medium text-main outline-none focus-visible:ring-2 focus-visible:ring-focus"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditingPost(false)}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-muted outline-none transition-colors duration-fast hover:bg-surface focus-visible:ring-2 focus-visible:ring-focus"
              >
                إلغاء
              </button>
              <button
                onClick={handleSavePostEdit}
                className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-on-primary outline-none transition-colors duration-fast hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-focus"
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
            isLiked ? 'bg-primary text-on-primary' : 'text-muted hover:bg-surface hover:text-muted',
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
          disabled={isReported}
          aria-label={isReported ? 'تم الإبلاغ عن هذا المنشور' : 'الإبلاغ عن هذا المنشور'}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold outline-none transition-colors duration-fast focus-visible:ring-2 focus-visible:ring-focus',
            isReported
              ? 'cursor-default bg-warning-soft text-warning-strong'
              : 'text-warning-strong hover:bg-warning hover:text-on-warning active:scale-95',
          )}
        >
          {isReported ? <Check size={15} /> : <AlertTriangle size={15} />}
          <span>{isReported ? 'تم الإبلاغ' : 'بلاغ'}</span>
        </button>
      </div>

      {/* Comments Section */}
      {viewingComments[post.id] && (
        <div className="border-t border-border bg-background p-4 md:p-5">
          <div className="space-y-1">
            {buildThreadedComments(Array.isArray(comments) ? comments : []).map((node) => {
              const commentAuthorName = formatDisplayName(
                node.comment.authorName,
                node.comment.authorRole,
              )
              return (
                <div key={node.comment.id} className="group/comment">
                  <div className="flex gap-3 rounded-2xl p-3 transition-colors duration-fast hover:bg-surface">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary ring-2 ring-primary/10">
                      {(commentAuthorName[0] || '').toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <h5 className="text-xs font-bold text-main">{commentAuthorName}</h5>
                        {node.comment.authorRole === 'admin' && (
                          <span className="rounded-card bg-error px-1.5 py-0.5 text-micro font-bold text-on-error">
                            إدارة
                          </span>
                        )}
                        {node.comment.authorRole === 'teacher' && (
                          <span className="rounded-card bg-success px-1.5 py-0.5 text-micro font-bold text-on-success">
                            معلمة
                          </span>
                        )}
                        {node.comment.authorRole === 'student' && (
                          <span className="rounded-card bg-info px-1.5 py-0.5 text-micro font-bold text-on-info">
                            طالب
                          </span>
                        )}
                        {(node.comment.authorRole === 'parent' ||
                          (node.comment.authorRole as string) === 'ولي أمر') && (
                          <span className="rounded-card bg-primary px-1.5 py-0.5 text-micro font-bold text-on-primary">
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
                        <div className="my-1.5 space-y-2 rounded-lg border border-border bg-surface p-2">
                          <input
                            type="text"
                            aria-label="تعديل التعليق"
                            value={editCommentText}
                            onChange={(e) => setEditCommentText(e.target.value)}
                            className="w-full rounded-md border border-border bg-surface p-2 text-xs text-main outline-none focus:border-primary"
                          />
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => setEditingCommentId(null)}
                              className="rounded px-2 py-1 text-micro text-muted outline-none transition-colors duration-fast hover:bg-surface focus-visible:ring-2 focus-visible:ring-focus"
                            >
                              إلغاء
                            </button>
                            <button
                              onClick={() => handleSaveCommentEdit(node.comment.id)}
                              className="rounded bg-primary px-2.5 py-1 text-micro font-bold text-on-primary outline-none transition-colors duration-fast hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-focus"
                            >
                              حفظ
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs leading-relaxed text-main">{node.comment.content}</p>
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
                          className="flex items-center gap-1 rounded-lg px-2 py-1 text-micro font-bold text-muted outline-none transition-colors duration-fast hover:bg-primary/5 hover:text-primary focus-visible:ring-2 focus-visible:ring-focus"
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
                            className="flex items-center gap-1 rounded-lg px-2 py-1 text-micro font-bold text-muted outline-none transition-colors duration-fast hover:bg-primary/5 hover:text-primary focus-visible:ring-2 focus-visible:ring-focus"
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
                            className="flex items-center gap-1 rounded-lg px-2 py-1 text-micro font-bold text-muted outline-none transition-colors duration-fast hover:bg-error-soft hover:text-error focus-visible:ring-2 focus-visible:ring-focus"
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
                            className="flex gap-2.5 rounded-xl p-2.5 transition-colors duration-fast hover:bg-surface"
                          >
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-card bg-primary-soft text-micro font-bold text-primary">
                              {(replyAuthorName[0] || '').toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="mb-0.5 flex items-center gap-2">
                                <h5 className="text-xs font-bold text-main">{replyAuthorName}</h5>
                                {replyNode.comment.authorRole === 'admin' && (
                                  <span className="rounded-card bg-error px-1.5 py-0.5 text-micro font-bold text-on-error">
                                    إدارة
                                  </span>
                                )}
                                {replyNode.comment.authorRole === 'teacher' && (
                                  <span className="rounded-card bg-success px-1.5 py-0.5 text-micro font-bold text-on-success">
                                    معلمة
                                  </span>
                                )}
                                {replyNode.comment.authorRole === 'student' && (
                                  <span className="rounded-card bg-info px-1.5 py-0.5 text-micro font-bold text-on-info">
                                    طالب
                                  </span>
                                )}
                                {(replyNode.comment.authorRole === 'parent' ||
                                  (replyNode.comment.authorRole as string) === 'ولي أمر') && (
                                  <span className="rounded-card bg-primary px-1.5 py-0.5 text-micro font-bold text-on-primary">
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
                                <div className="my-1.5 space-y-2 rounded-lg border border-border bg-surface p-2">
                                  <input
                                    type="text"
                                    aria-label="تعديل التعليق"
                                    value={editCommentText}
                                    onChange={(e) => setEditCommentText(e.target.value)}
                                    className="w-full rounded-md border border-border bg-surface p-2 text-xs text-main outline-none focus:border-primary"
                                  />
                                  <div className="flex justify-end gap-1.5">
                                    <button
                                      onClick={() => setEditingCommentId(null)}
                                      className="rounded px-2 py-1 text-micro text-muted outline-none transition-colors duration-fast hover:bg-surface focus-visible:ring-2 focus-visible:ring-focus"
                                    >
                                      إلغاء
                                    </button>
                                    <button
                                      onClick={() => handleSaveCommentEdit(replyNode.comment.id)}
                                      className="rounded bg-primary px-2.5 py-1 text-micro font-bold text-on-primary outline-none transition-colors duration-fast hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-focus"
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
                                  className="flex items-center gap-1 rounded-lg px-2 py-0.5 text-micro font-bold text-muted outline-none transition-colors duration-fast hover:bg-primary/5 hover:text-primary focus-visible:ring-2 focus-visible:ring-focus"
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
                                    className="flex items-center gap-1 rounded-lg px-2 py-0.5 text-micro font-bold text-muted outline-none transition-colors duration-fast hover:bg-primary/5 hover:text-primary focus-visible:ring-2 focus-visible:ring-focus"
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
                                    className="flex items-center gap-1 rounded-lg px-2 py-0.5 text-micro font-bold text-muted outline-none transition-colors duration-fast hover:bg-error-soft hover:text-error focus-visible:ring-2 focus-visible:ring-focus"
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
            })}
          </div>

          <div className="mt-3 flex items-center gap-3 border-t border-border pt-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary ring-2 ring-primary/10">
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
                className="w-full rounded-2xl border border-border bg-surface py-2.5 pe-11 ps-4 text-xs font-medium text-dim text-main outline-none transition-colors duration-fast focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onAddComment(post.id)
                }}
              />
              <button
                onClick={() => onAddComment(post.id)}
                disabled={!(commentTexts[post.id] || '').trim()}
                aria-label="إرسال التعليق"
                className="absolute end-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-xl bg-primary text-on-primary outline-none transition-colors duration-fast hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-focus active:scale-90 disabled:opacity-25"
              >
                <Send size={12} />
              </button>
            </div>
          </div>
        </div>
      )}

      {isAdmin && post.status === 'pending' && (
        <div className="flex items-center justify-between rounded-b-3xl border-t border-warning-soft bg-warning-soft p-3.5">
          <div className="flex items-center gap-2 text-warning-strong">
            <AlertTriangle size={13} />
            <span className="text-micro font-bold">هذا المنشور ينتظر الموافقة</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onUpdateStatus(post.id, 'approved')}
              className="rounded-full bg-success px-3.5 py-1.5 text-micro font-bold text-on-success outline-none transition-all duration-fast hover:-translate-y-0.5 hover:shadow-soft focus-visible:ring-2 focus-visible:ring-focus active:scale-95"
            >
              موافقة
            </button>
            <button
              onClick={() => onDelete(post.id)}
              className="rounded-full bg-error px-3.5 py-1.5 text-micro font-bold text-on-error outline-none transition-all duration-fast hover:-translate-y-0.5 hover:shadow-soft focus-visible:ring-2 focus-visible:ring-focus active:scale-95"
            >
              حذف
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
