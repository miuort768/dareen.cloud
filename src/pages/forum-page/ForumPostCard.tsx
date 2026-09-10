import { useState } from 'react'
import {
  ThumbsUp,
  MessageSquare,
  Bookmark,
  MoreVertical,
  AlertTriangle,
  Trash2,
  Edit3,
  Send,
  CornerDownLeft,
  Check,
  User,
  Clock,
} from 'lucide-react'
import {
  Card,
  Text,
  Flex,
  Avatar,
  Badge,
  IconButton,
  Button,
  TextField,
  DropdownMenu,
  Separator,
} from '@radix-ui/themes'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import { cn } from '../../lib/utils'
import {
  buildThreadedComments,
  POST_TYPE_META,
  resolvePostType,
  roleLabel,
} from '../../features/forum/types'
import type { Comment, Post } from '../../features/forum/types'

interface ForumPostCardProps {
  post: Post
  isLiked: boolean
  isHighlighted: boolean
  isAdmin: boolean
  currentUserId: string
  currentUserName?: string
  onVote: (postId: string, type: 'upvote') => void
  onDelete: (postId: string) => void
  onReport: (postId: string) => void
  onToggleSave: (postId: string) => void
  onToggleComments: (postId: string) => void
  onAddComment: (postId: string, text: string) => void
  onDeleteComment: (postId: string, commentId: string) => void
  onUpdateStatus: (postId: string, status: 'approved' | 'rejected') => void
  onEditPost: (postId: string, newContent: string) => void
  onEditComment: (commentId: string, newContent: string) => void
  commentTexts: Record<string, string>
  setCommentTexts: (fn: (prev: Record<string, string>) => Record<string, string>) => void
  viewingComments: Record<string, boolean>
  commentingPostId: string | null
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

/** لون شارة الدور — هادئ وموحّد */
const roleBadgeColor = (role?: string): 'indigo' | 'green' | 'blue' | 'orange' | 'gray' => {
  switch (role) {
    case 'admin':
      return 'orange'
    case 'teacher':
      return 'green'
    case 'student':
      return 'blue'
    case 'parent':
      return 'indigo'
    default:
      return 'gray'
  }
}

const formatRelative = (dateLike: string) => {
  if (!dateLike) return ''
  const d = new Date(dateLike)
  if (Number.isNaN(d.getTime())) return ''
  return formatDistanceToNow(d > new Date() ? new Date() : d, { addSuffix: true, locale: ar })
}

const RoleBadge = ({ role }: { role?: string }) => (
  <Badge size="1" color={roleBadgeColor(role)} variant="soft" radius="medium">
    {roleLabel(role)}
  </Badge>
)

const TypeBadge = ({ type }: { type?: string }) => {
  const meta = POST_TYPE_META[resolvePostType(type)]
  return (
    <Badge size="1" variant="surface" radius="medium" className="!font-bold">
      <span aria-hidden="true">{meta.emoji}</span> {meta.label}
    </Badge>
  )
}

export const ForumPostCard = ({
  post,
  isLiked,
  isHighlighted,
  isAdmin,
  currentUserId,
  currentUserName,
  onVote,
  onDelete,
  onReport,
  onToggleSave,
  onToggleComments,
  onAddComment,
  onDeleteComment,
  onUpdateStatus,
  onEditPost,
  onEditComment,
  commentTexts,
  setCommentTexts,
  viewingComments,
  commentingPostId,
}: ForumPostCardProps) => {
  const [isEditingPost, setIsEditingPost] = useState(false)
  const [editPostContent, setEditPostContent] = useState(post.content)
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editCommentText, setEditCommentText] = useState('')

  const displayAuthorName = formatDisplayName(post.authorName, post.authorRole)
  const isSaved = Array.isArray(post.savedBy) && post.savedBy.includes(currentUserId)
  const isUnanswered = (post.commentCount || 0) === 0 && resolvePostType(post.type) === 'question'
  const commentsOpen = !!viewingComments[post.id]
  const isCommenting = commentingPostId === post.id

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

  const renderCommentRow = (comment: Comment, isReply: boolean) => {
    const authorName = formatDisplayName(comment.authorName, comment.authorRole)
    const isEditing = editingCommentId === comment.id
    const canDelete = isAdmin // الخادم يسمح للإدارة فقط — نطابق ذلك في الواجهة
    const canEdit = isAdmin

    return (
      <div
        key={comment.id}
        className={cn(
          'rounded-xl transition-colors duration-150 hover:bg-[var(--gray-a2)]',
          isReply && 'ms-6 border-e-2 border-primary/20 pe-3',
        )}
      >
        <div className="flex gap-2.5 p-2.5">
          <Avatar
            size="2"
            radius="full"
            fallback={(authorName[0] || '؟').toUpperCase()}
            color={roleBadgeColor(comment.authorRole)}
            variant="soft"
          />
          <div className="min-w-0 flex-1">
            <Flex align="center" gap="2" wrap="wrap">
              <Text size="1" weight="bold" className="!text-main">
                {authorName}
              </Text>
              <RoleBadge role={comment.authorRole} />
              <Flex align="center" gap="1" className="text-[var(--gray-9)]">
                <Clock size={9} />
                <Text size="1" color="gray">
                  {formatRelative(comment.created_at)}
                </Text>
              </Flex>
            </Flex>

            {isEditing ? (
              <div className="my-1.5 space-y-2 rounded-lg border border-[var(--gray-a5)] p-2">
                <TextField.Root
                  size="1"
                  value={editCommentText}
                  onChange={(e) => setEditCommentText(e.target.value)}
                  aria-label="تعديل التعليق"
                />
                <Flex justify="end" gap="1">
                  <Button
                    size="1"
                    variant="soft"
                    color="gray"
                    onClick={() => setEditingCommentId(null)}
                  >
                    إلغاء
                  </Button>
                  <Button size="1" onClick={() => handleSaveCommentEdit(comment.id)}>
                    <Check size={12} /> حفظ
                  </Button>
                </Flex>
              </div>
            ) : (
              <Text as="div" size="1" className="forum-comment-body mt-1 !text-main">
                {comment.content}
              </Text>
            )}

            <Flex gap="1" mt="1">
              <button
                onClick={() => {
                  const currentText = commentTexts[post.id] || ''
                  setCommentTexts((prev) => ({
                    ...prev,
                    [post.id]: `@${comment.authorName} ${currentText}`,
                  }))
                  document.getElementById(`comment-input-${post.id}`)?.focus()
                }}
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold text-[var(--gray-10)] outline-none transition-colors hover:text-[var(--accent-11)] focus-visible:ring-2 focus-visible:ring-[var(--accent-8)]"
              >
                <CornerDownLeft size={10} /> رد
              </button>
              {canEdit && (
                <button
                  onClick={() => {
                    setEditingCommentId(comment.id)
                    setEditCommentText(comment.content)
                  }}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold text-[var(--gray-10)] outline-none transition-colors hover:text-[var(--accent-11)] focus-visible:ring-2 focus-visible:ring-[var(--accent-8)]"
                  aria-label="تعديل التعليق"
                  title="تعديل التعليق (خاص بالمدير)"
                >
                  <Edit3 size={10} /> تعديل
                </button>
              )}
              {canDelete && (
                <button
                  onClick={() => onDeleteComment(post.id, comment.id)}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold text-[var(--gray-10)] outline-none transition-colors hover:text-[var(--red-11)] focus-visible:ring-2 focus-visible:ring-[var(--red-8)]"
                >
                  <Trash2 size={10} /> حذف
                </button>
              )}
            </Flex>
          </div>
        </div>
      </div>
    )
  }

  const threaded = buildThreadedComments(Array.isArray(post.comments) ? post.comments : [])

  return (
    <div id={`post-${post.id}`}>
      <Card
        size="2"
        className={cn(
          'transition-shadow duration-200 hover:shadow-[var(--shadow-5)]',
          isHighlighted && '!border-2 !border-[var(--accent-9)]',
        )}
      >
        {/* ===== رأس المنشور ===== */}
        <Flex justify="between" align="start" gap="3">
          <Flex align="center" gap="3" minWidth="0">
            <Avatar
              size="3"
              radius="full"
              fallback={(displayAuthorName[0] || '؟').toUpperCase()}
              color={roleBadgeColor(post.authorRole)}
              variant="soft"
            />
            <Flex direction="column" gap="1" minWidth="0">
              <Flex align="center" gap="2" wrap="wrap">
                <Text size="2" weight="bold" className="!text-main">
                  {displayAuthorName}
                </Text>
                <RoleBadge role={post.authorRole} />
                <TypeBadge type={post.type} />
              </Flex>
              <Flex align="center" gap="1" className="text-[var(--gray-9)]">
                <Clock size={9} />
                <Text size="1" color="gray">
                  {formatRelative(post.created_at)}
                </Text>
                {isUnanswered && (
                  <Badge size="1" color="amber" variant="soft" radius="medium" ml="2">
                    بدون إجابة
                  </Badge>
                )}
              </Flex>
            </Flex>
          </Flex>

          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <IconButton
                size="1"
                variant="ghost"
                color="gray"
                aria-label="خيارات المنشور"
                aria-haspopup="menu"
              >
                <MoreVertical size={16} />
              </IconButton>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="end" size="1">
              <DropdownMenu.Item onSelect={() => onToggleSave(post.id)}>
                <Bookmark size={13} className={cn(isSaved && 'fill-current')} />
                {isSaved ? 'إزالة من المحفوظات' : 'حفظ المنشور'}
              </DropdownMenu.Item>
              <DropdownMenu.Item color="red" onSelect={() => onReport(post.id)}>
                <AlertTriangle size={13} /> الإبلاغ عن المنشور
              </DropdownMenu.Item>
              {isAdmin && (
                <>
                  <DropdownMenu.Separator />
                  <DropdownMenu.Item
                    onSelect={() => {
                      setIsEditingPost(true)
                      setEditPostContent(post.content)
                    }}
                  >
                    <Edit3 size={13} /> تعديل المنشور
                  </DropdownMenu.Item>
                  <DropdownMenu.Item color="red" onSelect={() => onDelete(post.id)}>
                    <Trash2 size={13} /> حذف المنشور
                  </DropdownMenu.Item>
                </>
              )}
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </Flex>

        {/* ===== محتوى المنشور أو نموذج التعديل ===== */}
        <Flex direction="column" gap="3" mt="3">
          {isEditingPost ? (
            <div className="space-y-2 rounded-xl border border-[var(--gray-a5)] p-3">
              <Text size="1" weight="bold" className="!text-[var(--accent-11)]">
                تعديل نص المنشور (مدير النظام)
              </Text>
              <textarea
                rows={3}
                aria-label="تعديل نص المنشور"
                value={editPostContent}
                onChange={(e) => setEditPostContent(e.target.value)}
                className="w-full resize-none rounded-xl border border-[var(--gray-a5)] bg-[var(--color-background)] p-3 text-sm font-medium text-main outline-none focus:border-[var(--accent-9)] focus-visible:ring-2 focus-visible:ring-[var(--accent-8)]"
              />
              <Flex justify="end" gap="2">
                <Button
                  size="1"
                  variant="soft"
                  color="gray"
                  onClick={() => setIsEditingPost(false)}
                >
                  إلغاء
                </Button>
                <Button size="1" onClick={handleSavePostEdit}>
                  <Check size={13} /> حفظ التعديل
                </Button>
              </Flex>
            </div>
          ) : (
            <Text as="div" size="2" weight="medium" className="leading-loose !text-main">
              {post.content}
            </Text>
          )}
        </Flex>

        {/* ===== شريط التفاعل ===== */}
        <Separator size="4" my="3" />
        <Flex align="center" gap="1" wrap="wrap">
          <button
            onClick={() => onVote(post.id, 'upvote')}
            className={cn(
              'flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-bold outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-[var(--accent-8)] active:scale-95',
              isLiked
                ? 'bg-[var(--accent-a3)] text-[var(--accent-11)]'
                : 'text-[var(--gray-10)] hover:bg-[var(--gray-a2)]',
            )}
            aria-pressed={isLiked}
          >
            <ThumbsUp size={14} className={cn(isLiked && 'fill-current')} />
            <span>{Array.isArray(post.upvotes) ? post.upvotes.length : 0} إعجاب</span>
          </button>

          <button
            onClick={() => onToggleComments(post.id)}
            aria-expanded={commentsOpen}
            className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-[var(--gray-10)] outline-none transition-colors duration-150 hover:bg-[var(--gray-a2)] focus-visible:ring-2 focus-visible:ring-[var(--accent-8)] active:scale-95"
          >
            <MessageSquare size={14} />
            <span>{post.commentCount || 0} تعليق</span>
          </button>

          <button
            onClick={() => onToggleSave(post.id)}
            aria-pressed={isSaved}
            className={cn(
              'flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-bold outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-[var(--accent-8)] active:scale-95',
              isSaved
                ? 'bg-[var(--accent-a3)] text-[var(--accent-11)]'
                : 'text-[var(--gray-10)] hover:bg-[var(--gray-a2)]',
            )}
          >
            <Bookmark size={14} className={cn(isSaved && 'fill-current')} />
            <span>{isSaved ? 'محفوظ' : 'حفظ'}</span>
          </button>
        </Flex>

        {/* ===== التعليقات ===== */}
        {commentsOpen && (
          <div className="mt-3 rounded-xl bg-[var(--gray-a1)] p-3">
            <Text size="1" weight="bold" className="!text-[var(--gray-11)]" mb="2">
              التعليقات
            </Text>

            {threaded.length === 0 ? (
              <Text as="div" size="1" color="gray" className="py-3 text-center">
                لا توجد تعليقات بعد — كن أول من يجيب
              </Text>
            ) : (
              <div className="space-y-1">
                {threaded.map((node) => (
                  <div key={node.comment.id}>
                    {renderCommentRow(node.comment, false)}
                    {node.replies.length > 0 && (
                      <div>{node.replies.map((r) => renderCommentRow(r.comment, true))}</div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* مدخل التعليق */}
            <Flex align="center" gap="2" mt="3" pt="3" className="border-t border-[var(--gray-a4)]">
              <Avatar
                size="2"
                radius="full"
                fallback={currentUserName?.[0]?.toUpperCase() || <User size={12} />}
              />
              <TextField.Root
                id={`comment-input-${post.id}`}
                size="2"
                variant="surface"
                placeholder="اكتب تعليقك..."
                aria-label="اكتب تعليقك"
                value={commentTexts[post.id] || ''}
                onChange={(e) =>
                  setCommentTexts((prev) => ({ ...prev, [post.id]: e.target.value }))
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onAddComment(post.id, commentTexts[post.id] || '')
                }}
                className="flex-1"
                disabled={isCommenting}
              />
              <IconButton
                size="2"
                onClick={() => onAddComment(post.id, commentTexts[post.id] || '')}
                disabled={!(commentTexts[post.id] || '').trim() || isCommenting}
                aria-label="إرسال التعليق"
                loading={isCommenting}
              >
                <Send size={14} />
              </IconButton>
            </Flex>
          </div>
        )}

        {/* ===== شريط الاعتدال — للإدارة فقط ===== */}
        {isAdmin && post.status === 'pending' && (
          <Flex
            align="center"
            justify="between"
            gap="2"
            mt="3"
            className="rounded-xl border border-[var(--amber-a6)] bg-[var(--amber-a2)] p-3"
          >
            <Flex align="center" gap="2" className="text-[var(--amber-11)]">
              <AlertTriangle size={13} />
              <Text size="1" weight="bold">
                هذا المنشور ينتظر الموافقة
              </Text>
            </Flex>
            <Flex gap="2">
              <Button size="1" color="green" onClick={() => onUpdateStatus(post.id, 'approved')}>
                موافقة
              </Button>
              <Button size="1" color="red" variant="soft" onClick={() => onDelete(post.id)}>
                حذف
              </Button>
            </Flex>
          </Flex>
        )}
      </Card>
    </div>
  )
}
