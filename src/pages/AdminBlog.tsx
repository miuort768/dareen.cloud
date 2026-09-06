import { useState, useEffect, useMemo, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useShowNotification, useAcademyName } from '../context/AppContext'
import { api, safeArray } from '../lib/api'
import { confirm } from '../lib/confirmDialog'
import { useSettingsStore } from '../store/settingsStore'
import { BlogHeader } from './admin-blog/BlogHeader'
import { BlogSearchBar } from './admin-blog/BlogSearchBar'
import { BlogForm } from './admin-blog/BlogForm'
import { BlogGrid } from './admin-blog/BlogGrid'
import type { BlogPost } from './admin-blog/types'
import { BookMarked, Plus, FileText, Eye, Star, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn, formatLocalDate } from '../lib/utils'
import { PageHeader } from '../shared/components/ui'

const formatViews = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`
  return String(n)
}

export const AdminBlog = () => {
  const academyName = useAcademyName()
  useEffect(() => {
    document.title = `المدونة | ${academyName}`
  }, [academyName])
  const showNotification = useShowNotification()
  const queryClient = useQueryClient()
  const { data: posts = [], isLoading: loading } = useQuery<BlogPost[]>({
    queryKey: ['blog'],
    queryFn: () => api.get('/blog?all=true'),
    select: (data) =>
      safeArray<BlogPost>(data).map((post) => {
        const raw = post as unknown as Record<string, unknown>
        return {
          ...post,
          fileSize: post.fileSize || (raw.file_size as string),
          showButtons: post.showButtons ?? (raw.show_buttons === 1 || raw.show_buttons === true),
          downloadButtonText: post.downloadButtonText || (raw.download_button_text as string),
          watchButtonText: post.watchButtonText || (raw.watch_button_text as string),
        }
      }),
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('')
  const [contentPart1, setContentPart1] = useState('')
  const [contentPart2, setContentPart2] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentPost, setCurrentPost] = useState<Partial<BlogPost> | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [libraryWhatsapp, setLibraryWhatsapp] = useState('')
  const [libraryTelegram, setLibraryTelegram] = useState('')
  const [savingSettings, setSavingSettings] = useState(false)
  const [fabOpen, setFabOpen] = useState(false)
  const savedWhatsapp = useSettingsStore((s) => s.libraryWhatsapp)
  const savedTelegram = useSettingsStore((s) => s.libraryTelegram)
  const setSetting = useSettingsStore((s) => s.setSetting)

  useEffect(() => {
    if (savedWhatsapp) setLibraryWhatsapp(savedWhatsapp)
    if (savedTelegram) setLibraryTelegram(savedTelegram)
  }, [savedWhatsapp, savedTelegram])

  const handleOpenModal = (post: BlogPost | null = null) => {
    if (post) {
      setCurrentPost(post)
      const parts = post.content.split('\n\n').filter(Boolean)
      setContentPart1(parts[0] || '')
      setContentPart2(parts.slice(1).join('\n\n'))
    } else {
      setCurrentPost({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        coverImage: '',
        category: 'عام',
        keywords: '',
        author: 'فريق دارين السابعة',
        date: formatLocalDate(new Date()),
        contentType: 'notes',
        curriculum: 'kuwait',
        level: 'middle',
        grade: '7',
        term: '1',
        subject: 'arabic',
        downloadLink: '',
        watchLink: '',
        showButtons: true,
        downloadButtonText: '',
        watchButtonText: '',
        isNew: false,
        views: 0,
        seoTitle: '',
        seoDescription: '',
        ogImage: '',
        focusKeyword: '',
        readingTime: 0,
        canonicalUrl: '',
        robotsIndex: true,
        isFeatured: false,
        tags: '',
      } as BlogPost)
      setContentPart1('')
      setContentPart2('')
    }
    setIsModalOpen(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: string) => {
    if (!(await confirm('هل أنت متأكد من حذف هذا المقال؟'))) return
    try {
      await api.delete(`/blog/${id}`)
      showNotification('تم حذف المقال بنجاح', 'success')
      queryClient.invalidateQueries({ queryKey: ['blog'] })
    } catch (e) {
      console.error(e)
      showNotification('حدث خطأ في الحذف', 'error')
    }
  }

  const handleDeleteAll = useCallback(async () => {
    if (
      !(await confirm({
        message: 'هل أنت متأكد من حذف جميع المقالات؟ هذا الإجراء لا يمكن التراجع عنه.',
        title: 'حذف جميع المقالات',
        confirmText: 'نعم، حذف الكل',
      }))
    )
      return
    try {
      const result = await api.delete<{ count: number }>('/blog/all')
      showNotification(`تم حذف ${result.count ?? ''} مقال بنجاح`, 'success')
      queryClient.invalidateQueries({ queryKey: ['blog'] })
    } catch (e) {
      console.error(e)
      showNotification('حدث خطأ في الحذف', 'error')
    }
  }, [showNotification, queryClient])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentPost?.title || !currentPost?.slug) {
      showNotification('يرجى إكمال الحقول المطلوبة', 'warning')
      return
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(currentPost.slug)) {
      showNotification('الرابط المختصر يجب أن يحتوي أحرف إنجليزية وأرقام وشرطات فقط', 'warning')
      return
    }
    const postData = {
      title: currentPost.title,
      slug: currentPost.slug,
      excerpt: currentPost.excerpt || '',
      content: contentPart1 + (contentPart2 ? '\n\n' + contentPart2 : ''),
      coverImage: currentPost.coverImage || '',
      category: currentPost.category || '',
      keywords: currentPost.keywords || '',
      author: currentPost.author || '',
      date: currentPost.date || new Date().toISOString(),
      contentType: currentPost.contentType || '',
      curriculum: currentPost.curriculum || '',
      level: currentPost.level || '',
      grade: currentPost.grade || '',
      term: currentPost.term || '',
      subject: currentPost.subject || '',
      downloadLink: currentPost.downloadLink || '',
      watchLink: currentPost.watchLink || '',
      showButtons: currentPost.showButtons ?? true,
      downloadButtonText: currentPost.downloadButtonText || '',
      watchButtonText: currentPost.watchButtonText || '',
      source: currentPost.source || '',
      fileSize: currentPost.fileSize || '',
      seoTitle: currentPost.seoTitle || '',
      seoDescription: currentPost.seoDescription || '',
      ogImage: currentPost.ogImage || '',
      focusKeyword: currentPost.focusKeyword || '',
      readingTime: typeof currentPost.readingTime === 'number' ? currentPost.readingTime : 0,
      canonicalUrl: currentPost.canonicalUrl || '',
      robotsIndex: currentPost.robotsIndex ?? true,
      isFeatured: currentPost.isFeatured ?? false,
      tags: currentPost.tags || '',
    }
    try {
      setSubmitting(true)
      if (currentPost.id) {
        await api.put(`/blog/${currentPost.id}`, postData)
        showNotification('تم تحديث المقال بنجاح', 'success')
      } else {
        await api.post('/blog', postData)
        showNotification('تم نشر المقال بنجاح', 'success')
      }
      setIsModalOpen(false)
      queryClient.invalidateQueries({ queryKey: ['blog'] })
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : 'حدث خطأ في الحفظ'
      showNotification(raw.length > 120 ? raw.slice(0, 120) + '...' : raw, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSaveSettings = async () => {
    setSavingSettings(true)
    try {
      await Promise.all([
        setSetting('libraryWhatsapp', libraryWhatsapp),
        setSetting('libraryTelegram', libraryTelegram),
      ])
      showNotification('تم حفظ إعدادات المكتبة', 'success')
      setShowSettings(false)
    } catch (e) {
      console.error(e)
      showNotification('حدث خطأ في الحفظ', 'error')
    } finally {
      setSavingSettings(false)
    }
  }

  const handleCancelSettings = () => {
    setShowSettings(false)
    setLibraryWhatsapp(savedWhatsapp)
    setLibraryTelegram(savedTelegram)
  }

  const filteredPosts = useMemo(
    () =>
      posts.filter(
        (post) =>
          ((post.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (post.category || '').toLowerCase().includes(searchTerm.toLowerCase())) &&
          (!filterType || post.contentType === filterType),
      ),
    [posts, searchTerm, filterType],
  )

  const kpiCards = useMemo(
    () => [
      {
        label: 'إجمالي المقالات',
        value: posts.length,
        icon: BookMarked,
        iconBg: 'bg-primary-soft text-primary',
      },
      {
        label: 'المميزة',
        value: posts.filter((p) => p.isFeatured).length,
        icon: Star,
        iconBg: 'bg-warning-soft text-warning-strong',
      },
      {
        label: 'إجمالي المشاهدات',
        value: formatViews(posts.reduce((s, p) => s + (p.views || 0), 0)),
        icon: Eye,
        iconBg: 'bg-success-soft text-success-strong',
      },
      {
        label: 'فوق مليون مشاهدة',
        value: posts.filter((p) => (p.views || 0) >= 1_000_000).length,
        icon: FileText,
        iconBg: 'bg-info-soft text-info-strong',
      },
    ],
    [posts],
  )

  const fabActions = useMemo(
    () => [
      { icon: Plus, label: 'مقال جديد', onClick: () => handleOpenModal() },
      {
        icon: Trash2,
        label: 'حذف الكل',
        onClick: () => handleDeleteAll(),
      },
    ],
    [handleDeleteAll],
  )

  return (
    <div
      className="from-warning-soft/40 relative min-h-full overflow-x-hidden bg-gradient-to-b via-background to-background pb-2"
      dir="rtl"
    >
      <div className="mx-auto max-w-page space-y-4 pt-3 md:space-y-5 md:pt-8">
        {/* Header — unified PageHeader pattern */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <PageHeader
            title="المقالات"
            subtitle="إدارة المقالات والدروس التعليمية"
            icon={<BookMarked size={22} />}
            meta={
              <>
                <span className="inline-flex items-center rounded-lg border border-border bg-surface px-2.5 py-1 text-[11px] font-bold tabular-nums text-muted">
                  {posts.length} مقال
                </span>
                <span className="inline-flex items-center rounded-lg border border-border bg-surface px-2.5 py-1 text-[11px] font-bold tabular-nums text-muted">
                  {formatViews(posts.reduce((s, p) => s + (p.views || 0), 0))} مشاهدة
                </span>
              </>
            }
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {kpiCards.map((kpi, i) => {
              const Icon = kpi.icon
              return (
                <motion.div
                  key={kpi.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 + i * 0.06 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="rounded-2xl border border-border bg-card p-4 shadow-elevation-1 transition-shadow hover:shadow-elevation-2"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className={cn('rounded-lg p-2', kpi.iconBg)}>
                      <Icon size={16} />
                    </div>
                  </div>
                  <p className="text-2xl font-bold tabular-nums text-main">{kpi.value}</p>
                  <p className="mt-0.5 text-xs text-muted">{kpi.label}</p>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        <BlogHeader
          handleOpenModal={() => handleOpenModal()}
          showSettings={showSettings}
          setShowSettings={setShowSettings}
          libraryWhatsapp={libraryWhatsapp}
          setLibraryWhatsapp={setLibraryWhatsapp}
          libraryTelegram={libraryTelegram}
          setLibraryTelegram={setLibraryTelegram}
          savedWhatsapp={savedWhatsapp}
          savedTelegram={savedTelegram}
          savingSettings={savingSettings}
          handleSaveSettings={handleSaveSettings}
          handleCancelSettings={handleCancelSettings}
        />

        {!isModalOpen && (
          <div data-search>
            <BlogSearchBar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterType={filterType}
              setFilterType={setFilterType}
            />
          </div>
        )}

        <BlogForm
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          currentPost={currentPost}
          setCurrentPost={setCurrentPost}
          contentPart1={contentPart1}
          setContentPart1={setContentPart1}
          contentPart2={contentPart2}
          setContentPart2={setContentPart2}
          submitting={submitting}
          handleSubmit={handleSubmit}
        />

        {!isModalOpen && (
          <BlogGrid
            loading={loading}
            filteredPosts={filteredPosts}
            handleOpenModal={handleOpenModal}
            handleDelete={handleDelete}
          />
        )}
      </div>

      <div
        className="fixed end-4 z-50 flex flex-col items-end gap-3 md:end-8"
        style={{ bottom: 'calc(96px + env(safe-area-inset-bottom, 0px))' }}
      >
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
                <span className="whitespace-nowrap rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-bold shadow-elevation-1">
                  {action.label}
                </span>
                <button
                  onClick={() => {
                    action.onClick()
                    setFabOpen(false)
                  }}
                  aria-label={action.label}
                  className={cn(
                    'flex h-11 w-11 items-center justify-center rounded-xl border text-main shadow-elevation-2 transition-colors focus-visible:ring-2 focus-visible:ring-focus active:scale-95',
                    action.label === 'حذف الكل'
                      ? 'border-error-soft bg-error-soft text-error hover:bg-error hover:text-on-error'
                      : 'border-border bg-card hover:bg-hover',
                  )}
                >
                  <action.icon size={18} />
                </button>
              </motion.div>
            ))}
        </AnimatePresence>
        <motion.button
          onClick={() => setFabOpen(!fabOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            'flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-on-primary shadow-elevation-3 transition-colors focus-visible:ring-2 focus-visible:ring-focus',
          )}
          aria-label={fabOpen ? 'إغلاق القائمة' : 'خيارات المقالات'}
          aria-expanded={fabOpen}
        >
          <Plus
            size={24}
            className={cn('transition-transform duration-normal', fabOpen && 'rotate-45')}
          />
        </motion.button>
      </div>
    </div>
  )
}
