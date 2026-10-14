import { useState, useEffect, useMemo, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { MessageSquare, Plus, Users, ThumbsUp, MessageCircle, ArrowUpDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { EmptyState } from '../shared/components/ui/EmptyState'

import { FAB_SURFACE } from '../shared/components/ui'
import { Skeleton, SkeletonText } from '../shared/components/ui/Skeleton'
import { useSearchParams } from 'react-router-dom'
import { api, safeArray } from '../lib/api'
import { useCurrentUser, useShowNotification, useAcademyName } from '../context/AppContext'
import { confirm } from '../lib/confirmDialog'
import type { Comment, ForumPostType, Post } from '../features/forum/types'
import { ForumHeader, ForumCreatePost, ForumPostCard, ForumHelpBanner } from './forum-page'
import { cn } from '../lib/utils'

type SortMode = 'latest' | 'most_liked' | 'most_commented'

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: 'latest', label: 'الأحدث' },
  { value: 'most_liked', label: 'الأكثر إعجاباً' },
  { value: 'most_commented', label: 'الأكثر تعليقاً' },
]

/** لون مميز لكل وضع فرز — ألوان الحالة ثابتة فلا تتأثر بهوية الدور */
const SORT_TONE: Record<SortMode, string> = {
  latest: 'border-primary bg-primary text-on-primary',
  most_liked: 'border-success bg-success text-on-success',
  most_commented: 'border-info bg-info text-on-info',
}

/** حالة عدم التحديد المتناسقة مع لون كل وضع فرز */
const SORT_TONE_IDLE: Record<SortMode, string> = {
  latest: 'hover:border-primary/30 hover:bg-primary-soft hover:text-primary',
  most_liked: 'hover:border-success-soft hover:bg-success-soft hover:text-success',
  most_commented: 'hover:border-info-soft hover:bg-info-soft hover:text-info',
}

/** ألوان شريط تنبيه الفرز لكل وضع (لا يشمل "الأحدث" لأن الشريط يظهر عنده فقط) */
const SORT_BANNER: Record<Exclude<SortMode, 'latest'>, { box: string; reset: string }> = {
  most_liked: {
    box: 'border-success-soft bg-success-soft text-success',
    reset: 'bg-success text-on-success hover:bg-success-hover',
  },
  most_commented: {
    box: 'border-info-soft bg-info-soft text-info',
    reset: 'bg-info text-on-info hover:bg-info-hover',
  },
}

/** سطح زر عائم ملوّن (يقلّد FAB_SURFACE بلون الحالة) */
const FAB_TONE: Record<'primary' | 'success' | 'info', string> = {
  primary: FAB_SURFACE,
  success:
    'inline-flex items-center justify-center border border-success bg-success text-on-success ring-1 ring-inset ring-white/10 shadow-button transition-all duration-normal ease-out hover:bg-success-hover hover:shadow-button-hover active:scale-[0.985] active:shadow-button-pressed active:duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
  info: 'inline-flex items-center justify-center border border-info bg-info text-on-info ring-1 ring-inset ring-white/10 shadow-button transition-all duration-normal ease-out hover:bg-info-hover hover:shadow-button-hover active:scale-[0.985] active:shadow-button-pressed active:duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
}

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
  // مخزن منفصل للتعليقات — لا يتأثر بإعادة جلب المنشورات كل 15 ثانية
  const [commentsByPost, setCommentsByPost] = useState<Record<string, Comment[]>>({})
  const toggleCooldownRef = useRef<Record<string, number>>({})
  const [showMenuPostId, setShowMenuPostId] = useState<string | null>(null)

  useEffect(() => {
    if (highlightedPostId && !loading) {
      const element = document.getElementById(`post-${highlightedPostId}`)
      if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [highlightedPostId, loading])

  const handleCreatePost = async (type: ForumPostType) => {
    if (!newPostContent.trim()) return
    try {
      const data = await api.post<{ message?: string }>('/forum', {
        content: newPostContent,
        type,
      })
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
        setCommentsByPost((prev) => ({ ...prev, [postId]: data }))
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
      // اجلب التعليقات المحدثة إلى المخزن المنفصل (لا يتأثر بجلب المنشورات)
      const updatedComments = await api.get<Comment[]>(`/forum/${postId}/comments`)
      setCommentsByPost((prev) => ({ ...prev, [postId]: updatedComments }))
      queryClient.setQueryData(['forum'], (old: Post[] = []) =>
        old.map((p: Post) =>
          p.id === postId ? { ...p, commentCount: updatedComments.length } : p,
        ),
      )
    } catch (e) {
      console.error(e)
      showNotification('فشل إضافة التعليق', 'error')
    }
  }

  const handleDeleteComment = async (postId: string, commentId: string) => {
    if (!(await confirm('هل أنت متأكد من حذف هذا التعليق؟'))) return
    try {
      await api.delete(`/forum/comments/${commentId}`)
      showNotification('تم حذف التعليق', 'success')
      const updated = await api.get<Comment[]>(`/forum/${postId}/comments`)
      setCommentsByPost((prev) => ({ ...prev, [postId]: updated }))
      queryClient.setQueryData(['forum'], (old: Post[] = []) =>
        old.map((p: Post) => (p.id === postId ? { ...p, commentCount: updated.length } : p)),
      )
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
      const found = Object.entries(commentsByPost).find(([, list]) =>
        list.some((c) => c.id === commentId),
      )
      if (found) {
        const [postId] = found
        const updated = await api.get<Comment[]>(`/forum/${postId}/comments`)
        setCommentsByPost((prev) => ({ ...prev, [postId]: updated }))
      }
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
        short: 'منشورات',
        value: posts.length,
        icon: MessageSquare,
        iconBg: 'bg-primary text-on-primary',
      },
      {
        label: 'إجمالي الإعجابات',
        short: 'إعجابات',
        value: totalUpvotes,
        icon: ThumbsUp,
        iconBg: 'bg-success text-on-success',
      },
      {
        label: 'التعليقات',
        short: 'تعليقات',
        value: totalComments,
        icon: MessageCircle,
        iconBg: 'bg-warning text-on-warning',
      },
      {
        label: 'المشاركون',
        short: 'مشاركون',
        value: totalParticipants,
        icon: Users,
        iconBg: 'bg-info text-on-info',
      },
    ],
    [posts, totalUpvotes, totalComments, totalParticipants],
  )

  const fabActions = useMemo(
    () => [
      {
        icon: Plus,
        label: 'منشور جديد',
        tone: 'primary' as const,
        onClick: () => {
          document.querySelector<HTMLTextAreaElement>('[data-create-post] textarea')?.focus()
        },
      },
      {
        icon: ThumbsUp,
        label: 'الأكثر إعجاباً',
        tone: 'success' as const,
        onClick: () => {
          setSortMode('most_liked')
          showNotification('تم فرز المنشورات حسب الأكثر إعجاباً', 'info')
        },
      },
      {
        icon: MessageCircle,
        label: 'الأكثر تعليقاً',
        tone: 'info' as const,
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
      className="relative min-h-full overflow-x-hidden bg-background pb-24 font-sans md:pb-28"
      dir="rtl"
    >
      {/* هيرو عريض — خارج العمود */}
      <div className="pt-3 md:px-4 md:pt-4">
        <ForumHeader searchTerm={searchTerm} onSearchChange={setSearchTerm} />
      </div>

      <div className="relative z-10 mx-auto max-w-[700px] space-y-4 pt-4 sm:px-4 md:space-y-5 md:pt-6">
        {/* بطاقات KPI */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="grid grid-cols-4 divide-x divide-x-reverse divide-border overflow-hidden rounded-3xl border border-border bg-card shadow-soft dark:bg-surface">
            {kpiCards.map((kpi) => {
              const Icon = kpi.icon
              return (
                <div
                  key={kpi.label}
                  className="flex flex-col items-center justify-center gap-2 px-1.5 py-4 text-center transition-colors hover:bg-surface md:flex-row md:gap-3 md:px-4"
                >
                  <div
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl md:h-9 md:w-9',
                      kpi.iconBg,
                    )}
                  >
                    <Icon size={15} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-dash text-lg font-black tabular-nums leading-none text-main md:text-2xl">
                      {kpi.value}
                    </p>
                    <p className="mt-1 hidden text-xs text-muted sm:block">{kpi.label}</p>
                    <p className="mt-1 text-[10px] font-medium text-muted sm:hidden">{kpi.short}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Mobile sort control — the FAB is desktop-only */}
        <div
          className="mb-3 flex items-center gap-2 md:hidden"
          role="group"
          aria-label="ترتيب المنشورات"
        >
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSortMode(opt.value)}
              aria-pressed={sortMode === opt.value}
              className={cn(
                'flex-1 rounded-full border px-2 py-1.5 text-micro font-bold outline-none transition-all duration-fast focus-visible:ring-2 focus-visible:ring-focus',
                sortMode === opt.value
                  ? cn(SORT_TONE[opt.value], 'shadow-soft')
                  : cn('border-border bg-card text-muted', SORT_TONE_IDLE[opt.value]),
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
              'mb-3 flex items-center justify-between gap-2 rounded-2xl border p-3 text-xs font-bold',
              SORT_BANNER[sortMode].box,
            )}
          >
            <span className="flex min-w-0 items-center gap-2">
              <ArrowUpDown size={15} className="shrink-0" />
              <span className="truncate">
                يتم الآن عرض المنشورات بحسب: {SORT_OPTIONS.find((o) => o.value === sortMode)?.label}
              </span>
            </span>
            <button
              onClick={() => setSortMode('latest')}
              className={cn(
                'shrink-0 rounded-full px-3 py-1 text-micro outline-none transition-all duration-fast focus-visible:ring-2 focus-visible:ring-focus',
                SORT_BANNER[sortMode].reset,
              )}
            >
              إعادة تعيين الفرز
            </button>
          </div>
        )}

        <div className="space-y-3 md:space-y-4" data-create-post>
          <ForumCreatePost
            newPostContent={newPostContent}
            setNewPostContent={setNewPostContent}
            handleCreatePost={handleCreatePost}
          />
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={`skel-${i}`}
                  className="space-y-4 rounded-3xl border border-border bg-card p-5 shadow-soft md:p-6"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-11 w-11 rounded-full" />
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
              className="rounded-3xl border-2 border-dashed border-border bg-card p-6 md:p-16"
            />
          ) : (
            <div className="space-y-3 md:space-y-4">
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
                            ? 'إدارة الأكاديمية'
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
                    comments={
                      commentsByPost[post.id] ?? (Array.isArray(post.comments) ? post.comments : [])
                    }
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
                <span className="whitespace-nowrap rounded-full border border-border bg-card px-3 py-1.5 text-xs font-bold text-main shadow-soft">
                  {action.label}
                </span>
                <button
                  onClick={() => {
                    action.onClick()
                    setFabOpen(false)
                  }}
                  className={cn(FAB_TONE[action.tone], 'h-12 w-12 rounded-full')}
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
            FAB_SURFACE,
            'h-14 w-14 rounded-card',
            fabOpen
              ? 'rotate-45 border-error bg-error text-on-error hover:border-error-hover hover:bg-error-hover'
              : '',
          )}
        >
          <Plus size={26} />
        </motion.button>
      </div>
    </div>
  )
}
