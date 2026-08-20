import { useState } from 'react'
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
  X,
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

  return (
    <div
      key={post.id}
      id={`post-${post.id}`}
      className={cn(
        'rounded-card bg-card transition-all duration-500 border border-border shadow-sm',
        isHighlighted && 'ring-2 ring-primary',
      )}
    >
      {/* Post Header */}
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
                      new Date(post.created_at) > new Date() ? new Date() : new Date(post.created_at),
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
              className="rounded-xl p-2 text-muted transition-colors hover:bg-primary-soft hover:text-primary"
              title="تعديل المنشور (خاص بالمدير)"
            >
              <Edit3 size={15} />
            </button>
          )}

          {/* Admin only: Delete Post Button */}
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
              <div className="absolute end-0 top-full z-50 mt-1 w-36 rounded-card border border-border bg-card py-1 shadow-md">
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

      {/* Post Content or Edit Form */}
      <div className="px-4 pb-5">
        {isEditingPost ? (
          <div className="space-y-2 bg-surface p-3 rounded-xl border border-border">
            <label className="block text-micro font-bold text-primary">تعديل نص المنشور (مدير النظام)</label>
            <textarea
              rows={3}
              value={editPostContent}
              onChange={(e) => setEditPostContent(e.target.value)}
              className="w-full p-3 bg-card border border-border rounded-xl text-sm font-medium text-main outline-none focus:ring-2 focus:ring-focus resize-none"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setIsEditingPost(false)}
                className="px-3 py-1.5 rounded-lg border border-border text-xs font-bold text-muted hover:bg-card"
              >
                إلغاء
              </button>
              <button
                onClick={handleSavePostEdit}
                className="px-3 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-bold hover:bg-primary-hover flex items-center gap-1"
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
            'flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all active:scale-95',
            isLiked ? 'bg-primary-soft text-primary' : 'text-muted hover:bg-surface hover:text-muted',
          )}
        >
          <ThumbsUp size={15} className={cn(isLiked && 'fill-current')} />
          <span>إعجاب ({Array.isArray(post.upvotes) ? post.upvotes.length : 0})</span>
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

      {/* Comments Section */}
      {viewingComments[post.id] && (
        <div className="bg-surface/50 border-t border-border p-4 md:p-5">
          <div className="space-y-1">
            {buildThreadedComments(post.comments || []).map((node) => (
              <div key={node.comment.id} className="group/comment">
                <div className="flex gap-3 rounded-xl p-3 transition-colors hover:bg-card">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/15 to-primary/5 text-xs font-bold text-primary ring-1 ring-primary/10">
                    {(node.comment.authorName?.[0] || '').toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <h5 className="text-[13px] font-bold text-main">{node.comment.authorName}</h5>
                      {node.comment.authorRole === 'admin' && (
                        <span className="bg-error/10 rounded-full px-1.5 py-0.5 text-[9px] font-bold text-error">
                          إدارة
                        </span>
                      )}
                      {node.comment.authorRole === 'teacher' && (
                        <span className="bg-success/10 rounded-full px-1.5 py-0.5 text-[9px] font-bold text-success">
                          معلمة
                        </span>
                      )}
                      {node.comment.authorRole === 'student' && (
                        <span className="bg-info/10 rounded-full px-1.5 py-0.5 text-[9px] font-bold text-info">
                          طالب
                        </span>
                      )}
                      {(node.comment.authorRole === 'parent' || (node.comment.authorRole as string) === 'ولي أمر') && (
                        <span className="bg-primary/10 rounded-full px-1.5 py-0.5 text-[9px] font-bold text-primary">
                          شريك النجاح
                        </span>
                      )}
                      <span className="text-muted/70 text-micro">
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
                      <div className="my-1.5 space-y-2 p-2 bg-card rounded-lg border border-border">
                        <input
                          type="text"
                          value={editCommentText}
                          onChange={(e) => setEditCommentText(e.target.value)}
                          className="w-full p-2 text-xs border border-border rounded-md bg-surface text-main outline-none focus:border-primary"
                        />
                        <div className="flex gap-1.5 justify-end">
                          <button
                            onClick={() => setEditingCommentId(null)}
                            className="px-2 py-1 text-[10px] text-muted hover:bg-surface rounded"
                          >
                            إلغاء
                          </button>
                          <button
                            onClick={() => handleSaveCommentEdit(node.comment.id)}
                            className="px-2.5 py-1 text-[10px] bg-primary text-on-primary rounded font-bold"
                          >
                            حفظ
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-main/80 text-[13px] leading-relaxed">{node.comment.content}</p>
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
                        className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold text-muted transition-all hover:bg-primary/5 hover:text-primary"
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
                          className="hover:bg-primary/5 flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold text-muted transition-all hover:text-primary"
                          title="تعديل التعليق (خاص بالمدير)"
                        >
                          <Edit3 size={10} />
                          تعديل
                        </button>
                      )}

                      {(isAdmin || currentUserId === node.comment.authorId) && (
                        <button
                          onClick={() => onDeleteComment(post.id, node.comment.id)}
                          className="hover:bg-error/5 flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold text-muted transition-all hover:text-error"
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
                    {node.replies.map((replyNode) => (
                      <div
                        key={replyNode.comment.id}
                        className="flex gap-2.5 rounded-xl p-2.5 transition-colors hover:bg-card"
                      >
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-primary/5 text-[10px] font-bold text-primary ring-1 ring-primary/10">
                          {(replyNode.comment.authorName?.[0] || '').toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="mb-0.5 flex items-center gap-2">
                            <h5 className="text-[12px] font-bold text-main">
                              {replyNode.comment.authorName}
                            </h5>
                            {replyNode.comment.authorRole === 'admin' && (
                              <span className="bg-error/10 rounded-full px-1.5 py-0.5 text-[8px] font-bold text-error">
                                إدارة
                              </span>
                            )}
                            {replyNode.comment.authorRole === 'teacher' && (
                              <span className="bg-success/10 rounded-full px-1.5 py-0.5 text-[8px] font-bold text-success">
                                معلمة
                              </span>
                            )}
                            {replyNode.comment.authorRole === 'student' && (
                              <span className="bg-info/10 rounded-full px-1.5 py-0.5 text-[8px] font-bold text-info">
                                طالب
                              </span>
                            )}
                            {(replyNode.comment.authorRole === 'parent' || (replyNode.comment.authorRole as string) === 'ولي أمر') && (
                              <span className="bg-primary/10 rounded-full px-1.5 py-0.5 text-[8px] font-bold text-primary">
                                شريك النجاح
                              </span>
                            )}
                            <span className="text-muted/60 text-[10px]">
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
                            <div className="my-1.5 space-y-2 p-2 bg-card rounded-lg border border-border">
                              <input
                                type="text"
                                value={editCommentText}
                                onChange={(e) => setEditCommentText(e.target.value)}
                                className="w-full p-2 text-xs border border-border rounded-md bg-surface text-main outline-none focus:border-primary"
                              />
                              <div className="flex gap-1.5 justify-end">
                                <button
                                  onClick={() => setEditingCommentId(null)}
                                  className="px-2 py-1 text-[10px] text-muted hover:bg-surface rounded"
                                >
                                  إلغاء
                                </button>
                                <button
                                  onClick={() => handleSaveCommentEdit(replyNode.comment.id)}
                                  className="px-2.5 py-1 text-[10px] bg-primary text-on-primary rounded font-bold"
                                >
                                  حفظ
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-main/75 text-[12px] leading-relaxed">
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
                              className="flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-bold text-muted transition-all hover:bg-primary/5 hover:text-primary"
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
                                className="hover:bg-primary/5 flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-bold text-muted transition-all hover:text-primary"
                                title="تعديل التعليق (خاص بالمدير)"
                              >
                                <Edit3 size={9} />
                                تعديل
                              </button>
                            )}

                            {(isAdmin || currentUserId === replyNode.comment.authorId) && (
                              <button
                                onClick={() => onDeleteComment(post.id, replyNode.comment.id)}
                                className="hover:bg-error/5 flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-bold text-muted transition-all hover:text-error"
                              >
                                <Trash2 size={9} />
                                حذف
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="border-border/50 mt-3 flex items-center gap-3 border-t pt-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/15 to-primary/5 text-xs font-bold text-primary ring-1 ring-primary/10">
              {currentUserName?.[0]?.toUpperCase() || <User size={14} />}
            </div>
            <div className="relative flex-1">
              <input
                id={`comment-input-${post.id}`}
                type="text"
                aria-label="رد على المنشور"
                value={commentTexts[post.id] || ''}
                onChange={(e) => setCommentTexts((prev) => ({ ...prev, [post.id]: e.target.value }))}
                placeholder="اكتب تعليقاً..."
                className="border-border/60 placeholder:text-muted/50 w-full rounded-xl border bg-card py-2.5 pe-11 ps-4 text-[13px] font-medium text-main transition-all focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/10"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onAddComment(post.id)
                }}
              />
              <button
                onClick={() => onAddComment(post.id)}
                disabled={!(commentTexts[post.id] || '').trim()}
                aria-label="إرسال التعليق"
                className="absolute end-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg bg-primary text-on-primary transition-all hover:bg-primary-hover active:scale-90 disabled:opacity-25"
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
}
