import { useState, useEffect, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { MessageSquare, Plus, Users, ThumbsUp, MessageCircle, Filter } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { EmptyState } from '../shared/components/ui/EmptyState'
import { useSearchParams } from 'react-router-dom'
import { api, safeArray } from '../lib/api'
import {
  useCurrentUser,
  useShowNotification,
  useAcademyName,
} from '../context/AppContext'
import { confirm } from '../lib/confirmDialog'
import type { Comment, Post } from '../features/forum/types'
import { ForumHeader, ForumCreatePost, ForumPostCard, ForumHelpBanner } from './forum-page'
import { cn } from '../lib/utils'

const particles = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 5 + 2,
  duration: Math.random() * 6 + 4,
  delay: Math.random() * 3,
}))

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
    refetchInterval: 3000,
    refetchOnWindowFocus: true,
  })

  const [newPostContent, setNewPostContent] = useState('')
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({})
  const [viewingComments, setViewingComments] = useState<Record<string, boolean>>({})
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
      const data = await api.post<Record<string, unknown>>('/forum', { content: newPostContent })
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
    if (!viewingComments[postId]) {
      try {
        const data = await api.get<Comment[]>(`/forum/${postId}/comments`)
        queryClient.setQueryData(['forum'], (old: Post[] = []) =>
          old.map((p: Post) => (p.id === postId ? { ...p, comments: data } : p)),
        )
      } catch (e) {
        console.error(e)
        showNotification('فشل تحميل المنشورات', 'error')
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

  const handleDeleteComment = async (postId: string, commentId: string) => {
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

  const [sortMode, setSortMode] = useState<'latest' | 'most_liked' | 'most_commented'>('latest')

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

  const sortedPosts = useMemo(() => {
    const list = [...posts]
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
  }, [posts, sortMode])

  const totalUpvotes = useMemo(
    () => posts.reduce((s, p) => s + (Array.isArray(p.upvotes) ? p.upvotes.length : 0), 0),
    [posts],
  )
  const totalComments = useMemo(() => posts.reduce((s, p) => s + (p.commentCount || 0), 0), [posts])

  const kpiCards = useMemo(
    () => [
      {
        label: 'إجمالي المنشورات',
        value: posts.length,
        icon: MessageSquare,
        gradient: 'from-primary/20 to-primary/5',
        iconBg: 'bg-primary/10 text-primary',
        accent: 'bg-primary',
      },
      {
        label: 'إجمالي الإعجابات',
        value: totalUpvotes,
        icon: ThumbsUp,
        gradient: 'from-success/20 to-success/5',
        iconBg: 'bg-success/10 text-success',
        accent: 'bg-success',
      },
      {
        label: 'التعليقات',
        value: totalComments,
        icon: MessageCircle,
        gradient: 'from-warning/20 to-warning/5',
        iconBg: 'bg-warning/10 text-warning',
        accent: 'bg-warning',
      },
      {
        label: 'المشاركون',
        value: new Set(posts.map((p) => p.userId)).size,
        icon: Users,
        gradient: 'from-info/20 to-info/5',
        iconBg: 'bg-info/10 text-info',
        accent: 'bg-info',
      },
    ],
    [posts, totalUpvotes, totalComments],
  )

  const fabActions = useMemo(
    () => [
      {
        icon: Plus,
        label: 'منشور جديد',
        onClick: () => {
          document.querySelector('[data-create-post] textarea')?.focus()
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
    <div className="relative min-h-full overflow-x-hidden bg-background pb-8 md:pb-12 font-sans" dir="rtl">
      <div className="relative z-10 pt-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="mx-auto mb-4 grid max-w-[700px] grid-cols-2 gap-3 px-4 md:grid-cols-4">
            {kpiCards.map((kpi, i) => {
              const Icon = kpi.icon
              return (
                <motion.div
                  key={kpi.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 + i * 0.06 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className={cn(
                    'border-border/50 relative overflow-hidden rounded-xl border bg-gradient-to-br p-4',
                    kpi.gradient,
                  )}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className={cn('rounded-lg p-2', kpi.iconBg)}>
                      <Icon size={16} />
                    </div>
                    <div className={cn('h-1 w-12 rounded-full', kpi.accent)} />
                  </div>
                  <p className="mb-1 text-xs text-muted">{kpi.label}</p>
                  <p className="text-2xl font-bold text-main">{kpi.value}</p>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Sort indicator banner */}
        {sortMode !== 'latest' && (
          <div className="mx-auto max-w-[700px] px-4 mb-3 flex items-center justify-between bg-primary/10 border border-primary/30 p-2.5 rounded-xl text-xs font-bold text-primary">
            <span>
              يتم الآن عرض المنشورات بحسب:{' '}
              {sortMode === 'most_liked' ? 'الأكثر إعجاباً 👍' : 'الأكثر تعليقاً 💬'}
            </span>
            <button
              onClick={() => setSortMode('latest')}
              className="text-micro bg-primary text-on-primary px-2.5 py-1 rounded-lg hover:bg-primary-hover transition-all"
            >
              إعادة تعيين الفرز
            </button>
          </div>
        )}

        <div className="mx-auto max-w-[700px] space-y-6 px-4" data-create-post>
          <ForumCreatePost
            newPostContent={newPostContent}
            setNewPostContent={setNewPostContent}
            handleCreatePost={handleCreatePost}
          />
          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={`skel-${i}`} className="h-48 animate-pulse rounded-card bg-card" />
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
                const isLiked = post.upvotes.includes(currentUser?.id || '')
                const isHighlighted = post.id === highlightedPostId
                return (
                  <ForumPostCard
                    key={post.id}
                    post={post}
                    isLiked={isLiked}
                    isHighlighted={isHighlighted}
                    isAdmin={isAdmin}
                    currentUserId={currentUser?.id || ''}
                    currentUserName={currentUser?.teacherName || currentUser?.name || currentUser?.username || 'ولي الأمر'}
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

      {/* Floating Action (+) Button */}
      <div className="fixed bottom-20 md:bottom-8 end-4 md:end-8 z-50 flex flex-col items-end gap-3">
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
                  className="flex h-12 w-12 items-center justify-center rounded-card border border-border/30 bg-primary text-on-primary shadow-elevation-2 transition-all hover:bg-primary-hover hover:shadow-elevation-3 active:scale-95"
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
            'flex h-14 w-14 items-center justify-center rounded-card text-on-primary shadow-elevation-3 transition-all border border-border/20',
            fabOpen ? 'rotate-45 bg-error hover:bg-error/90' : 'bg-primary hover:bg-primary-hover',
          )}
        >
          <Plus size={26} />
        </motion.button>
      </div>
    </div>
  )
}
