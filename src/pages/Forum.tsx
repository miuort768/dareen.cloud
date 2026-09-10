import '@radix-ui/themes/styles.css'
import './forum-page/forum-radix.css'

import { useState, useEffect, useMemo, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { DirectionProvider } from '@radix-ui/react-direction'
import { Theme, Tabs, Text, Button, Flex } from '@radix-ui/themes'
import { MessageSquare, Plus, RotateCcw } from 'lucide-react'
import { ErrorState } from '../shared/components/ui'
import { Skeleton, SkeletonText } from '../shared/components/ui/Skeleton'
import { useSearchParams } from 'react-router-dom'
import { api, safeArray } from '../lib/api'
import { useCurrentUser, useShowNotification, useAcademyName } from '../context/AppContext'
import { confirm } from '../lib/confirmDialog'
import type { Comment, ForumPostType, Post } from '../features/forum/types'
import {
  ForumHeader,
  ForumPostCard,
  ForumHelpBanner,
  ForumStats,
  ForumCreateModal,
  ForumUnanswered,
  ForumTopEngaged,
} from './forum-page'
import { cn } from '../lib/utils'

type SortMode = 'latest' | 'most_liked' | 'most_commented'
type FeedTab = 'all' | 'question' | 'discussion' | 'tip' | 'announcement' | 'unanswered' | 'saved'

const TABS: { value: FeedTab; label: string }[] = [
  { value: 'all', label: 'الكل' },
  { value: 'question', label: 'الأسئلة' },
  { value: 'discussion', label: 'المناقشات' },
  { value: 'tip', label: 'النصائح' },
  { value: 'announcement', label: 'الإعلانات' },
  { value: 'unanswered', label: 'بدون إجابة' },
  { value: 'saved', label: 'المحفوظة' },
]

const COLUMN = 'mx-auto w-full max-w-[760px]'

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

  const queryClient = useQueryClient()
  const {
    data: posts = [],
    isLoading: loading,
    isError,
    refetch,
  } = useQuery<Post[]>({
    queryKey: ['forum'],
    queryFn: () => api.get<Post[]>('/forum'),
    select: (data) => safeArray<Post>(data),
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
  })

  const [createOpen, setCreateOpen] = useState(false)
  const [isPosting, setIsPosting] = useState(false)
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({})
  const [commentingPostId, setCommentingPostId] = useState<string | null>(null)
  const [viewingComments, setViewingComments] = useState<Record<string, boolean>>({})
  const toggleCooldownRef = useRef<Record<string, number>>({})
  const [activeTab, setActiveTab] = useState<FeedTab>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortMode, setSortMode] = useState<SortMode>('latest')

  useEffect(() => {
    if (highlightedPostId && !loading) {
      const element = document.getElementById(`post-${highlightedPostId}`)
      if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [highlightedPostId, loading])

  /* ===== المنشورات ===== */

  const handleCreatePost = async (content: string, type: ForumPostType) => {
    if (!content.trim()) return
    setIsPosting(true)
    try {
      const data = await api.post<{ message?: string }>('/forum', { content, type })
      showNotification(data.message || 'تم إنشاء المنشور', 'success')
      setCreateOpen(false)
      queryClient.invalidateQueries({ queryKey: ['forum'] })
    } catch (e) {
      console.error(e)
      showNotification('فشل النشر', 'error')
    } finally {
      setIsPosting(false)
    }
  }

  const handleVote = async (postId: string, type: 'upvote') => {
    try {
      const data = await api.post<{ upvotes: string[]; downvotes: string[] }>(
        `/forum/${postId}/vote`,
        { type },
      )
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

  const handleToggleSave = async (postId: string) => {
    try {
      const data = await api.post<{ savedBy: string[] }>(`/forum/${postId}/save`)
      queryClient.setQueryData(['forum'], (old: Post[] = []) =>
        old.map((p: Post) => (p.id === postId ? { ...p, savedBy: data.savedBy } : p)),
      )
    } catch (e) {
      console.error(e)
      showNotification('فشل تحديث المحفوظات', 'error')
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
    // Guard against double-fire (double tap / duplicated events)
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
    setViewingComments((prev) => ({ ...prev, [postId]: !prev[postId] }))
  }

  const handleAddComment = async (postId: string, text: string) => {
    if (!text || !text.trim()) return
    setCommentingPostId(postId)
    try {
      const res = await api.post<{ awardedPoints?: number }>(`/forum/${postId}/comments`, {
        content: text,
      })
      setCommentTexts((prev) => ({ ...prev, [postId]: '' }))
      if (res?.awardedPoints && res.awardedPoints > 0) {
        showNotification(`تم إضافة التعليق +${res.awardedPoints} نقطة!`, 'success')
      } else {
        showNotification('تم إضافة التعليق', 'success')
      }
      queryClient.invalidateQueries({ queryKey: ['forum'] })
      const updatedComments = await api.get<Comment[]>(`/forum/${postId}/comments`)
      queryClient.setQueryData(['forum'], (old: Post[] = []) =>
        old.map((p: Post) => (p.id === postId ? { ...p, comments: updatedComments } : p)),
      )
    } catch (e) {
      console.error(e)
      showNotification('فشل إضافة التعليق', 'error')
    } finally {
      setCommentingPostId(null)
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

  /* ===== الفلترة والترتيب ===== */

  const currentUserId = currentUser?.id || ''

  const filteredPosts = useMemo(() => {
    let list = [...posts]
    if (activeTab === 'saved') {
      list = list.filter((p) => Array.isArray(p.savedBy) && p.savedBy.includes(currentUserId))
    } else if (activeTab === 'unanswered') {
      list = list.filter((p) => (p.commentCount || 0) === 0)
    } else if (activeTab !== 'all') {
      list = list.filter((p) => (p.type || 'discussion') === activeTab)
    }
    const q = searchTerm.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (p) =>
          (p.content || '').toLowerCase().includes(q) ||
          (p.authorName || '').toLowerCase().includes(q),
      )
    }
    if (sortMode === 'most_liked') {
      list.sort(
        (a, b) =>
          (Array.isArray(b.upvotes) ? b.upvotes.length : 0) -
          (Array.isArray(a.upvotes) ? a.upvotes.length : 0),
      )
    } else if (sortMode === 'most_commented') {
      list.sort((a, b) => (b.commentCount || 0) - (a.commentCount || 0))
    }
    return list
  }, [posts, activeTab, searchTerm, sortMode, currentUserId])

  /* ===== الإحصائيات ===== */

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

  const savedCount = useMemo(
    () => posts.filter((p) => Array.isArray(p.savedBy) && p.savedBy.includes(currentUserId)).length,
    [posts, currentUserId],
  )

  const currentUserName =
    currentUser?.name ||
    (currentUser as unknown as { teacherName?: string } | null)?.teacherName ||
    (currentUser?.role === 'parent'
      ? 'ولي أمر'
      : currentUser?.role === 'teacher'
        ? 'معلمة'
        : currentUser?.role === 'admin'
          ? 'إدارة المنصة'
          : currentUser?.username || 'عضو المنتدى')

  const renderPostList = (list: Post[]) => (
    <div className="space-y-4">
      {list.map((post: Post) => (
        <ForumPostCard
          key={post.id}
          post={post}
          isLiked={Array.isArray(post.upvotes) && post.upvotes.includes(currentUserId)}
          isHighlighted={post.id === highlightedPostId}
          isAdmin={isAdmin}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          onVote={handleVote}
          onDelete={handleDeletePost}
          onReport={handleReport}
          onToggleSave={handleToggleSave}
          onToggleComments={toggleComments}
          onAddComment={handleAddComment}
          onDeleteComment={handleDeleteComment}
          onUpdateStatus={handleUpdateStatus}
          onEditPost={handleEditPost}
          onEditComment={handleEditComment}
          commentTexts={commentTexts}
          setCommentTexts={setCommentTexts}
          viewingComments={viewingComments}
          commentingPostId={commentingPostId}
        />
      ))}
    </div>
  )

  const renderFeed = () => {
    if (loading) {
      return (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={`skel-${i}`}
              className="space-y-4 rounded-2xl border border-[var(--gray-a4)] bg-card p-4"
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
      )
    }

    if (isError) {
      return (
        <ErrorState
          title="تعذر تحميل المنتدى"
          message="حدث خطأ أثناء جلب المنشورات. تحقق من اتصالك وحاول مجددًا."
          onRetry={() => refetch()}
          retryLabel="إعادة المحاولة"
        />
      )
    }

    if (posts.length === 0) {
      return (
        <div className="rounded-2xl border-2 border-dashed border-[var(--gray-a5)] bg-card p-8 text-center md:p-14">
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
            <MessageSquare size={24} />
          </span>
          <Text as="div" size="3" weight="bold" className="mb-1.5 !text-main">
            لا توجد منشورات بعد
          </Text>
          <Text as="div" size="1" color="gray" className="mb-4">
            كن أول من يبدأ النقاش في مجتمع دارين.
          </Text>
          <Button size="2" onClick={() => setCreateOpen(true)} className="!font-bold">
            <Plus size={14} /> إنشاء أول منشور
          </Button>
        </div>
      )
    }

    if (filteredPosts.length === 0) {
      const isSearch = !!searchTerm.trim()
      return (
        <div className="rounded-2xl border-2 border-dashed border-[var(--gray-a5)] bg-card p-8 text-center md:p-12">
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
            <MessageSquare size={24} />
          </span>
          <Text as="div" size="3" weight="bold" className="mb-1.5 !text-main">
            {isSearch ? 'لا توجد نتائج مطابقة' : 'لا توجد منشورات في هذا التصنيف'}
          </Text>
          <Text as="div" size="1" color="gray" className="mb-4">
            {isSearch
              ? `جرّب كلمات بحث مختلفة عن «${searchTerm.trim()}»`
              : 'تابع أو انشئ منشورًا في هذا التصنيف'}
          </Text>
          {isSearch && (
            <Button size="2" variant="soft" onClick={() => setSearchTerm('')}>
              <RotateCcw size={13} /> مسح البحث
            </Button>
          )}
        </div>
      )
    }

    return renderPostList(filteredPosts)
  }

  const sidebarContent = (
    <div className="space-y-4">
      <ForumUnanswered
        posts={posts}
        onView={(id) => {
          setActiveTab('all')
          setSearchTerm('')
          setTimeout(() => {
            document
              .getElementById(`post-${id}`)
              ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }, 80)
        }}
      />
      <ForumTopEngaged
        posts={posts}
        onView={(id) => {
          setActiveTab('all')
          setSearchTerm('')
          setTimeout(() => {
            document
              .getElementById(`post-${id}`)
              ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }, 80)
        }}
      />
      <ForumHelpBanner />
    </div>
  )

  return (
    <DirectionProvider dir="rtl">
      <Theme
        appearance="inherit"
        accentColor="indigo"
        grayColor="slate"
        radius="large"
        hasBackground={false}
        dir="rtl"
      >
        <div
          className="relative min-h-full overflow-x-hidden bg-background pb-10 font-sans"
          dir="rtl"
        >
          <div className="mx-auto w-full max-w-page px-2.5 pt-4 sm:px-4">
            <ForumHeader
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onCreateClick={() => setCreateOpen(true)}
            />

            <ForumStats
              postsCount={posts.length}
              likesCount={totalUpvotes}
              commentsCount={totalComments}
              participantsCount={totalParticipants}
            />

            {/* التبويبات */}
            <Tabs.Root value={activeTab} onValueChange={(v) => setActiveTab(v as FeedTab)}>
              <Tabs.List className="mb-4" wrap="nowrap">
                {TABS.map((tab) => (
                  <Tabs.Trigger key={tab.value} value={tab.value} className="!whitespace-nowrap">
                    {tab.label}
                    {tab.value === 'saved' && savedCount > 0 ? ` (${savedCount})` : ''}
                  </Tabs.Trigger>
                ))}
              </Tabs.List>
            </Tabs.Root>

            {/* شريط الفرز */}
            {sortMode !== 'latest' && (
              <Flex
                align="center"
                justify="between"
                gap="2"
                mb="3"
                className="rounded-xl border border-[var(--accent-a5)] bg-[var(--accent-a2)] p-2.5"
              >
                <Text size="1" weight="bold" className="!text-[var(--accent-11)]">
                  الترتيب الحالي: {sortMode === 'most_liked' ? 'الأكثر إعجابًا' : 'الأكثر تعليقًا'}
                </Text>
                <Button
                  size="1"
                  variant="soft"
                  onClick={() => setSortMode('latest')}
                  className="!font-bold"
                >
                  إعادة التعيين
                </Button>
              </Flex>
            )}

            {/* المحتوى: ديسكتوب مع جانبية / موبايل عمود واحد */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
              <div className={cn(COLUMN, 'min-w-0 lg:mx-0 lg:max-w-none')}>
                {/* الفرز السريع */}
                <Flex gap="2" mb="3" wrap="wrap">
                  {(
                    [
                      { value: 'latest', label: 'الأحدث' },
                      { value: 'most_liked', label: 'الأكثر إعجابًا' },
                      { value: 'most_commented', label: 'الأكثر تعليقًا' },
                    ] as { value: SortMode; label: string }[]
                  ).map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSortMode(opt.value)}
                      aria-pressed={sortMode === opt.value}
                      className={cn(
                        'min-h-9 rounded-full border px-3.5 text-[11px] font-bold outline-none transition-all duration-150 focus-visible:ring-2 focus-visible:ring-[var(--accent-8)]',
                        sortMode === opt.value
                          ? 'border-transparent bg-[var(--accent-9)] text-[var(--accent-contrast)]'
                          : 'border-[var(--gray-a5)] bg-card text-[var(--gray-10)] hover:bg-[var(--gray-a2)]',
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </Flex>

                {renderFeed()}

                {/* أقسام الجانبية على الهاتف — بعد المنشورات */}
                <div className="mt-6 space-y-4 lg:hidden">
                  <ForumUnanswered
                    posts={posts}
                    onView={(id) => {
                      setActiveTab('all')
                      setSearchTerm('')
                      setTimeout(() => {
                        document
                          .getElementById(`post-${id}`)
                          ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                      }, 80)
                    }}
                  />
                  <ForumTopEngaged
                    posts={posts}
                    onView={(id) => {
                      setActiveTab('all')
                      setSearchTerm('')
                      setTimeout(() => {
                        document
                          .getElementById(`post-${id}`)
                          ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                      }, 80)
                    }}
                  />
                  <ForumHelpBanner />
                </div>
              </div>

              {/* الجانبية — ديسكتوب فقط */}
              <aside className="hidden lg:block">
                <div className="sticky top-20 space-y-4">{sidebarContent}</div>
              </aside>
            </div>
          </div>

          {/* نافذة الإنشاء */}
          <ForumCreateModal
            open={createOpen}
            onOpenChange={setCreateOpen}
            onCreate={handleCreatePost}
            isPosting={isPosting}
            isModerated={!isAdmin}
          />
        </div>
      </Theme>
    </DirectionProvider>
  )
}
