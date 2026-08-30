import { useState, useEffect, useMemo, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { MessageSquare, Plus, Users, ThumbsUp, MessageCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { EmptyState } from '../shared/components/ui/EmptyState'
import { Skeleton, SkeletonText } from '../shared/components/ui/Skeleton'
import { useSearchParams } from 'react-router-dom'
import { api, safeArray } from '../lib/api'
import { useCurrentUser, useShowNotification, useAcademyName } from '../context/AppContext'
import { confirm } from '../lib/confirmDialog'
import type { Comment, Post } from '../features/forum/types'
import { ForumHeader, ForumCreatePost, ForumPostCard, ForumHelpBanner } from './forum-page'
import { cn } from '../lib/utils'

type SortMode = 'latest' | 'most_liked' | 'most_commented'

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: 'latest', label: 'الأحدث' },
  { value: 'most_liked', label: 'الأكثر إعجاباً' },
  { value: 'most_commented', label: 'الأكثر تعليقاً' },
]

const COLUMN = 'mx-auto max-w-[700px] px-2.5 sm:px-4'

export const Forum = () => {
  const academyName = useAcademyName()
  useEffect(() => {
    document.title = `المنتدى | ${academyName} للتعليم والتدريب`
  }, [academyName])
  const currentUser = useCurrentUser()
  const showNotification = useShowNotification()
  const isAdmin = currentUser?.role === 'admin'
  const [searchParams] = useSearchParams()
  const highlightedPostId = searchParams.get('postId')
  const [fabOpen, setFabOpen] = useState(false)

  const queryClient = useQueryClient()
  const { data: posts = [], isLoading: loading } = useQuery<Post[]>({
    queryKey: ['forum'],
    queryFn: () => api.get<Post[]>('/forum'),
    select: (data) => safeArray<Post>(data),
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
  })

  const [newPostContent, setNewPostContent] = useState('')
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({})
  const [viewingComments, setViewingComments] = useState<Record<string, boolean>>({})
  const toggleCooldownRef = useRef<Record<string, number>>({})
  const [showMenuPostId, setShowMenuPostId] = useState<string | null>(null)

  useEffect(() => {
    if (highlightedPostId && !loading) {
      const element = document.getElementById(`post-${highlightedPostId}`)
      if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [highlightedPostId, loading])

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return
    try {
      const data = await api.post<{ message?: string }>('/forum', { content: newPostContent })
      showNotification(data.message || 'تم إنشاء المنشور', 'success')
      setNewPostContent('')
      queryClient.invalidateQueries({ queryKey: ['forum'] })
    } catch (e) {
      console.error(e)
      showNotification('فشل النشر', 'error')
    }
  }

  const handleVote = async (postId: string, type: 'upvote' | 'downvote') => {
    try {
      const data = await api.post<{ upvotes: number; downvotes: number }>(`/forum/${postId}/vote`, {
        type,
      })
      queryClient.setQueryData(['forum'], (old: Post[] = []) =>
        old.map((p: Post) =>
          p.id === postId ? { ...p, upvotes: data.upvotes, downvotes: data.downvotes } : p,
        ),
      )
    } catch (e) {
      console.error(e)
      showNotification('فشل التصويت على هذا المنشور', 'error')
    }
  }

  const handleUpdateStatus = async (postId: string, status: 'approved' | 'rejected') => {
    try {
      await api.patch(`/forum/${postId}/status`, { status })
      showNotification('تم تحديث حالة المنشور', 'success')
      queryClient.invalidateQueries({ queryKey: ['forum'] })
    } catch (e) {
      console.error(e)
      showNotification('فشل تحديث الحالة', 'error')
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!(await confirm('هل أنت متأكد من حذف هذا المنشور؟'))) return
    try {
      await api.delete(`/forum/${postId}`)
      showNotification('تم حذف المنشور', 'success')
      queryClient.invalidateQueries({ queryKey: ['forum'] })
    } catch (e) {
      console.error(e)
      showNotification('فشل الحذف', 'error')
    }
  }

  const toggleComments = async (postId: string) => {
    // Guard against double-fire (double tap / duplicated events) which would
    // open the section and immediately close it again.
    const now = Date.now()
    if (now - (toggleCooldownRef.current[postId] || 0) < 400) return
    toggleCooldownRef.current[postId] = now
    if (!viewingComments[postId]) {
      try {
        const data = await api.get<Comment[]>(`/forum/${postId}/comments`)
        queryClient.setQueryData(['forum'], (old: Post[] = []) =>
          old.map((p: Post) => (p.id === postId ? { ...p, comments: data } : p)),
        )
      } catch (e) {
        console.error(e)
        showNotification('فشل تحميل التعليقات', 'error')
      }
    }
    setViewingComments((prev: Record<string, boolean>) => ({ ...prev, [postId]: !prev[postId] }))
  }

  const handleAddComment = async (postId: string) => {
    const text = commentTexts[postId]
    if (!text || !text.trim()) return
    try {
      const res = await api.post<{ awardedPoints?: number }>(`/forum/${postId}/comments`, {
        content: text,
      })
      setCommentTexts((prev: Record<string, string>) => ({ ...prev, [postId]: '' }))
      if (res?.awardedPoints && res.awardedPoints > 0) {
        showNotification(`تم إضافة التعليق +${res.awardedPoints} نقطة!`, 'success')
      } else {
        showNotification('تم إضافة التعليق', 'success')
      }
      queryClient.invalidateQueries({ queryKey: ['forum'] })
      // Instantly fetch updated comments for this post without blocking loops
      const updatedComments = await api.get<Comment[]>(`/forum/${postId}/comments`)
      queryClient.setQueryData(['forum'], (old: Post[] = []) =>
        old.map((p: Post) => (p.id === postId ? { ...p, comments: updatedComments } : p)),
      )
    } catch (e) {
      console.error(e)
      showNotification('فشل إضافة التعليق', 'error')
    }
  }

  const handleDeleteComment = async (_postId: string, commentId: string) => {
    if (!(await confirm('هل أنت متأكد من حذف هذا التعليق؟'))) return
    try {
      await api.delete(`/forum/comments/${commentId}`)
      showNotification('تم حذف التعليق', 'success')
      queryClient.invalidateQueries({ queryKey: ['forum'] })
    } catch (e) {
      console.error(e)
      showNotification('فشل الحذف', 'error')
    }
  }

  const handleReport = async (postId: string) => {
    try {
      await api.post(`/forum/${postId}/report`)
      showNotification('تم إرسال البلاغ للمراجعة', 'info')
    } catch (e) {
      console.error(e)
      showNotification('فشل الإبلاغ', 'error')
    }
  }

  const [sortMode, setSortMode] = useState<SortMode>('latest')

  const handleEditPost = async (postId: string, newContent: string) => {
    if (!isAdmin) return
    try {
      await api.patch(`/forum/${postId}`, { content: newContent })
      showNotification('تم تعديل المنشور بنجاح', 'success')
      queryClient.invalidateQueries({ queryKey: ['forum'] })
    } catch (e) {
      console.error(e)
      showNotification('فشل تعديل المنشور', 'error')
    }
  }

  const handleEditComment = async (commentId: string, newContent: string) => {
    if (!isAdmin) return
    try {
      await api.patch(`/forum/comments/${commentId}`, { content: newContent })
      showNotification('تم تعديل التعليق بنجاح', 'success')
      queryClient.invalidateQueries({ queryKey: ['forum'] })
    } catch (e) {
      console.error(e)
      showNotification('فشل تعديل التعليق', 'error')
    }
  }

  const [searchTerm, setSearchTerm] = useState('')

  const sortedPosts = useMemo(() => {
    let list = [...posts]
    const q = searchTerm.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (p) =>
          ('title' in p && typeof p.title === 'string' ? p.title : '').toLowerCase().includes(q) ||
          (p.content || '').toLowerCase().includes(q) ||
          (p.authorName || '').toLowerCase().includes(q),
      )
    }
    if (sortMode === 'most_liked') {
      return list.sort((a, b) => {
        const likesA = Array.isArray(a.upvotes) ? a.upvotes.length : 0
        const likesB = Array.isArray(b.upvotes) ? b.upvotes.length : 0
        return likesB - likesA
      })
    }
    if (sortMode === 'most_commented') {
      return list.sort((a, b) => (b.commentCount || 0) - (a.commentCount || 0))
    }
    return list
  }, [posts, sortMode, searchTerm])

  const totalUpvotes = useMemo(
    () => posts.reduce((s, p) => s + (Array.isArray(p.upvotes) ? p.upvotes.length : 0), 0),
    [posts],
  )
  const totalComments = useMemo(() => posts.reduce((s, p) => s + (p.commentCount || 0), 0), [posts])

  const totalParticipants = useMemo(() => {
    const ids = new Set<string>()
    posts.forEach((p) => {
      if (p.authorId) ids.add(p.authorId)
      else if (p.authorName) ids.add(p.authorName)
      ;(p.comments || []).forEach((c) => {
        if (c.authorId) ids.add(c.authorId)
        else if (c.authorName) ids.add(c.authorName)
      })
    })
    return ids.size
  }, [posts])

  const kpiCards = useMemo(
    () => [
      {
        label: 'إجمالي المنشورات',
        value: posts.length,
        icon: MessageSquare,
        iconBg: 'bg-primary/10 text-primary',
      },
      {
        label: 'إجمالي الإعجابات',
        value: totalUpvotes,
        icon: ThumbsUp,
        iconBg: 'bg-success-soft text-success',
      },
      {
        label: 'التعليقات',
        value: totalComments,
        icon: MessageCircle,
        iconBg: 'bg-warning-soft text-warning',
      },
      {
        label: 'المشاركون',
        value: totalParticipants,
        icon: Users,
        iconBg: 'bg-info-soft text-info',
      },
    ],
    [posts, totalUpvotes, totalComments, totalParticipants],
  )

  const fabActions = useMemo(
    () => [
      {
        icon: Plus,
        label: 'منشور جديد',
        onClick: () => {
          document.querySelector<HTMLTextAreaElement>('[data-create-post] textarea')?.focus()
        },
      },
      {
        icon: ThumbsUp,
        label: 'الأكثر إعجاباً',
        onClick: () => {
          setSortMode('most_liked')
          showNotification('تم فرز المنشورات حسب الأكثر إعجاباً', 'info')
        },
      },
      {
        icon: MessageCircle,
        label: 'الأكثر تعليقاً',
        onClick: () => {
          setSortMode('most_commented')
          showNotification('تم فرز المنشورات حسب الأكثر تعليقاً', 'info')
        },
      },
    ],
    [showNotification],
  )

  return (
    <div
      className="from-info-soft/40 relative min-h-full overflow-x-hidden bg-gradient-to-b via-background to-background pb-8 font-sans md:pb-12"
      dir="rtl"
    >
      <div className="relative z-10 pt-2">
        <ForumHeader searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className={cn(COLUMN, 'mb-4 grid grid-cols-2 gap-3 md:grid-cols-4')}>
            {kpiCards.map((kpi, i) => {
              const Icon = kpi.icon
              return (
                <motion.div
                  key={kpi.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 + i * 0.06 }}
                  whileHover={{ y: -2 }}
                  className="relative overflow-hidden rounded-card border border-border bg-card p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className={cn('rounded-lg p-2', kpi.iconBg)}>
                      <Icon size={16} />
                    </div>
                  </div>
                  <p className="mb-1 text-xs text-muted">{kpi.label}</p>
                  <p className="text-2xl font-bold text-main">{kpi.value}</p>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Mobile sort control — the FAB is desktop-only */}
        <div
          className={cn(COLUMN, 'mb-3 flex items-center gap-2 md:hidden')}
          role="group"
          aria-label="ترتيب المنشورات"
        >
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSortMode(opt.value)}
              aria-pressed={sortMode === opt.value}
              className={cn(
                'flex-1 rounded-card border px-2 py-1.5 text-micro font-bold transition-colors duration-fast',
                sortMode === opt.value
                  ? 'border-primary bg-primary text-on-primary'
                  : 'border-border bg-card text-muted hover:border-hover hover:text-main',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Sort indicator banner */}
        {sortMode !== 'latest' && (
          <div
            className={cn(
              COLUMN,
              'mb-3 flex items-center justify-between rounded-xl border border-primary/30 bg-primary/10 p-2.5 text-xs font-bold text-primary',
            )}
          >
            <span>
              يتم الآن عرض المنشورات بحسب: {SORT_OPTIONS.find((o) => o.value === sortMode)?.label}
            </span>
            <button
              onClick={() => setSortMode('latest')}
              className="rounded-lg bg-primary px-2.5 py-1 text-micro text-on-primary transition-colors duration-fast hover:bg-primary-hover"
            >
              إعادة تعيين الفرز
            </button>
          </div>
        )}

        <div className={cn(COLUMN, 'space-y-6')} data-create-post>
          <ForumCreatePost
            newPostContent={newPostContent}
            setNewPostContent={setNewPostContent}
            handleCreatePost={handleCreatePost}
          />
          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={`skel-${i}`}
                  className="space-y-4 rounded-card border border-border bg-card p-4 md:p-5"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-11 w-11 rounded-card" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3 w-28" />
                      <Skeleton className="h-2 w-20" />
                    </div>
                  </div>
                  <SkeletonText lines={3} />
                </div>
              ))}
            </div>
          ) : sortedPosts.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title="لا توجد منشورات هنا"
              className="rounded-card border-2 border-dashed border-border bg-card p-6 md:p-16"
            />
          ) : (
            <div className="space-y-6">
              {sortedPosts.map((post: Post) => {
                const isLiked =
                  Array.isArray(post.upvotes) && post.upvotes.includes(currentUser?.id || '')
                const isHighlighted = post.id === highlightedPostId
                return (
                  <ForumPostCard
                    key={post.id}
                    post={post}
                    isLiked={isLiked}
                    isHighlighted={isHighlighted}
                    isAdmin={isAdmin}
                    currentUserId={currentUser?.id || ''}
                    currentUserName={
                      currentUser?.name ||
                      currentUser?.teacherName ||
                      (currentUser?.role === 'parent'
                        ? 'ولي أمر'
                        : currentUser?.role === 'teacher'
                          ? 'معلمة'
                          : currentUser?.role === 'admin'
                            ? 'إدارة المنصة'
                            : currentUser?.username || 'عضو المنتدى')
                    }
                    showMenuPostId={showMenuPostId}
                    setShowMenuPostId={setShowMenuPostId}
                    onVote={handleVote}
                    onDelete={handleDeletePost}
                    onReport={handleReport}
                    onToggleComments={toggleComments}
                    onAddComment={handleAddComment}
                    onDeleteComment={handleDeleteComment}
                    onUpdateStatus={handleUpdateStatus}
                    onEditPost={handleEditPost}
                    onEditComment={handleEditComment}
                    commentTexts={commentTexts}
                    setCommentTexts={setCommentTexts}
                    viewingComments={viewingComments}
                  />
                )
              })}
            </div>
          )}
        </div>
        <ForumHelpBanner />
      </div>

      {/* Floating Action (+) Button - Hidden on mobile screens */}
      <div className="fixed bottom-8 end-8 z-50 hidden flex-col items-end gap-3 md:flex">
        <AnimatePresence>
          {fabOpen &&
            fabActions.map((action, i) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, scale: 0.3, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.3, y: 20 }}
                transition={{ delay: 0.05 * (fabActions.length - 1 - i) }}
                className="flex items-center gap-2"
              >
                <span className="whitespace-nowrap rounded-card border border-border bg-card px-3 py-1.5 text-xs font-bold text-main shadow-elevation-1">
                  {action.label}
                </span>
                <button
                  onClick={() => {
                    action.onClick()
                    setFabOpen(false)
                  }}
                  className="flex h-12 w-12 items-center justify-center rounded-card border border-divider bg-primary text-on-primary shadow-elevation-2 transition-[background-color,box-shadow,transform] duration-fast hover:bg-primary-hover hover:shadow-elevation-3 active:scale-95"
                >
                  <action.icon size={20} />
                </button>
              </motion.div>
            ))}
        </AnimatePresence>
        <motion.button
          onClick={() => setFabOpen(!fabOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="إضافة منشور جديد أو فرز المنشورات"
          className={cn(
            'flex h-14 w-14 items-center justify-center rounded-card border border-divider text-on-primary shadow-elevation-3 transition-[background-color,box-shadow,transform] duration-fast',
            fabOpen ? 'rotate-45 bg-error hover:bg-error' : 'bg-primary hover:bg-primary-hover',
          )}
        >
          <Plus size={26} />
        </motion.button>
      </div>
    </div>
  )
}
