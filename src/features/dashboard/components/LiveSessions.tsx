import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Radio,
  Users,
  Loader2,
  Plus,
  AlertCircle,
  RefreshCcw,
  ExternalLink,
  Copy,
  StopCircle,
  LinkIcon,
  Video,
  CheckCircle2,
  Pencil,
} from 'lucide-react'
import { api } from '../../../lib/api'
import { socketService } from '../../../lib/socket'
import { SOCKET_EVENTS } from '../../../lib/socket-events'
import { useCurrentUser } from '../../../context/AppContext'
import { updateLiveSession } from '../../../services/liveSessionService'
import { cn } from '@/lib/utils'
import { confirm } from '../../../lib/confirmDialog'
import { Button } from '@/components/ui/button'
import { StartLiveSessionDialog } from './StartLiveSessionDialog'
import type { LiveSession } from '../../../types'

const PROVIDERS = [
  { value: 'google_meet', label: 'Google Meet' },
  { value: 'zoom', label: 'Zoom' },
  { value: 'custom', label: 'رابط آخر' },
]

const PROVIDER_LABELS: Record<string, string> = {
  google_meet: 'Google Meet',
  zoom: 'Zoom',
  custom: 'رابط مخصص',
}

export const LiveSessions = () => {
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const currentUser = useCurrentUser()

  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingSession, setEditingSession] = useState<LiveSession | null>(null)
  const [editProvider, setEditProvider] = useState('google_meet')
  const [editUrl, setEditUrl] = useState('')
  const [editError, setEditError] = useState<string | null>(null)

  const {
    data: sessions = [],
    isLoading: loading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ['live-sessions'],
    queryFn: () => api.get<LiveSession[]>('/live/active'),
    select: (data) => (Array.isArray(data) ? data : []),
  })

  useEffect(() => {
    const socket = socketService.getSocket()
    if (!socket) return
    const invalidate = () => queryClient.invalidateQueries({ queryKey: ['live-sessions'] })
    socket.on(SOCKET_EVENTS.SESSION_INVITE, invalidate)
    socket.on(SOCKET_EVENTS.SESSION_ENDED, invalidate)
    socket.on(SOCKET_EVENTS.SESSION_LINK_UPDATED, invalidate)
    return () => {
      socket.off(SOCKET_EVENTS.SESSION_INVITE, invalidate)
      socket.off(SOCKET_EVENTS.SESSION_ENDED, invalidate)
      socket.off(SOCKET_EVENTS.SESSION_LINK_UPDATED, invalidate)
    }
  }, [queryClient])

  const endMutation = useMutation({
    mutationFn: (id: string) => api.post(`/live/end/${id}`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['live-sessions'] }),
    onError: () => setError('فشل إنهاء الحصة'),
  })

  const editMutation = useMutation({
    mutationFn: updateLiveSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['live-sessions'] })
      setShowEditDialog(false)
      setEditingSession(null)
      setEditUrl('')
    },
    onError: (err: unknown) => {
      setEditError(err instanceof Error ? err.message : 'فشل تحديث الرابط')
    },
  })

  const endSession = async (sessionId: string) => {
    if (
      !(await confirm({
        title: 'إنهاء الحصة المباشرة',
        description: 'هل أنت متأكد من إنهاء هذه الحصة المباشرة؟',
        confirmText: 'إنهاء',
        cancelText: 'إلغاء',
      }))
    )
      return
    endMutation.mutate(sessionId)
  }

  const copyLink = async (url: string, sessionId: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedId(sessionId)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      setError('فشل نسخ الرابط')
    }
  }

  const openEditDialog = (session: LiveSession) => {
    setEditingSession(session)
    setEditProvider(session.meetingProvider)
    setEditUrl(session.meetingUrl || '')
    setEditError(null)
    setShowEditDialog(true)
  }

  const saveEditedLink = () => {
    if (!editingSession || !editUrl.trim()) {
      setEditError('يرجى إدخال رابط الاجتماع')
      return
    }
    setEditError(null)
    editMutation.mutate({
      sessionId: editingSession.id,
      meetingProvider: editProvider as 'google_meet' | 'zoom' | 'custom',
      meetingUrl: editUrl.trim(),
    })
  }

  const isTeacher = currentUser?.role === 'teacher' || currentUser?.role === 'admin'
  const displayError = error || (queryError instanceof Error ? queryError.message : null)

  return (
    <div className="font-dash" dir="rtl">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="dark:bg-success/10 flex h-9 w-9 items-center justify-center rounded-xl bg-success-soft">
            <Radio size={16} className="text-success dark:text-success" />
          </div>
          <div>
            <h3 className="text-[13px] font-bold text-main dark:text-main">الحصص المباشرة</h3>
            <p className="text-[11px] text-muted dark:text-muted">روابط البث المباشر</p>
          </div>
        </div>
        {isTeacher && (
          <Button
            onClick={() => setShowCreateDialog(true)}
            size="sm"
            className="h-9 gap-1.5 rounded-xl bg-primary px-3.5 text-[11px] font-bold text-on-primary dark:bg-primary dark:text-on-primary"
          >
            <Plus size={13} />
            بدء حصة
          </Button>
        )}
      </div>

      {/* Error */}
      {displayError && (
        <div className="dark:bg-error/10 dark:border-error/20 mb-3 flex items-center justify-between rounded-xl border border-error bg-error-soft p-3">
          <div className="flex items-center gap-2">
            <AlertCircle size={14} className="shrink-0 text-error dark:text-error" />
            <span className="text-xs font-medium text-error dark:text-error">{displayError}</span>
          </div>
          <button
            onClick={() => refetch()}
            className="dark:hover:bg-error/15 flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold text-error transition-colors hover:bg-error-soft dark:text-error"
          >
            <RefreshCcw size={11} /> إعادة
          </button>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="animate-spin text-primary" size={20} />
        </div>
      ) : sessions.length === 0 ? (
        <div className="py-8 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-soft dark:bg-primary/10">
            <Video size={28} className="text-primary/30 dark:text-primary/30" />
          </div>
          <p className="text-[13px] font-bold text-muted dark:text-muted">
            لا توجد حصص مباشرة حالياً
          </p>
          <p className="text-muted/60 mt-1 text-[11px] dark:text-dim">ابدأ حصتك بضغطة واحدة</p>
          {isTeacher && (
            <Button
              onClick={() => setShowCreateDialog(true)}
              size="sm"
              className="mt-3 h-9 gap-1.5 rounded-xl bg-primary px-5 text-[11px] font-bold text-on-primary dark:bg-primary dark:text-on-primary"
            >
              <Plus size={13} /> بدء حصة
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between rounded-xl border border-border bg-surface p-4 transition-colors hover:bg-hover dark:border-primary/20 dark:bg-hover dark:hover:bg-primary/5"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative shrink-0">
                  <div className="dark:bg-success/10 flex h-10 w-10 items-center justify-center rounded-xl bg-success-soft">
                    <Radio size={14} className="text-success dark:text-success" />
                  </div>
                  <span className="absolute -start-0.5 -top-0.5 h-2.5 w-2.5 animate-pulse rounded-full border-2 border-surface bg-success" />
                </div>
                <div className="min-w-0">
                  <h4 className="truncate text-xs font-bold text-main dark:text-main">
                    {session.title}
                  </h4>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <Users size={10} className="shrink-0 text-muted dark:text-muted" />
                    <span className="truncate text-[10px] font-medium text-muted dark:text-muted">
                      {session.teacherName}
                    </span>
                    {session.subject && (
                      <>
                        <span className="text-muted/40 text-[10px] dark:text-dim">·</span>
                        <span className="truncate text-[10px] text-muted dark:text-muted">
                          {session.subject}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                <span className="rounded-lg bg-surface px-2 py-0.5 text-[10px] font-bold text-muted dark:bg-hover dark:text-muted">
                  {PROVIDER_LABELS[session.meetingProvider] || session.meetingProvider}
                </span>
                <a
                  href={session.meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="dark:hover:bg-accent/90 flex min-h-[44px] min-w-[44px] items-center gap-1.5 rounded-xl bg-primary px-3 text-[11px] font-bold text-on-primary transition-colors hover:bg-primary-hover dark:bg-primary dark:text-on-primary"
                >
                  <ExternalLink size={11} />
                  انضم
                </a>
                <button
                  onClick={() => copyLink(session.meetingUrl || '', session.id)}
                  className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-border text-muted transition-colors hover:bg-surface dark:border-primary/20 dark:text-muted dark:hover:bg-primary/5"
                  title="نسخ الرابط"
                  aria-label="نسخ رابط الحصة"
                >
                  {copiedId === session.id ? (
                    <CheckCircle2 size={13} className="text-success dark:text-success" />
                  ) : (
                    <Copy size={13} />
                  )}
                </button>
                {isTeacher && (
                  <button
                    onClick={() => openEditDialog(session)}
                    className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-border text-muted transition-colors hover:bg-surface dark:border-primary/20 dark:text-muted dark:hover:bg-primary/5"
                    title="تعديل الرابط"
                    aria-label="تعديل رابط الحصة"
                  >
                    <Pencil size={13} />
                  </button>
                )}
                {isTeacher && (
                  <button
                    onClick={() => endSession(session.id)}
                    className="dark:hover:bg-error/10 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-error transition-colors hover:bg-error-soft dark:text-error"
                    title="إنهاء الحصة"
                    aria-label="إنهاء الحصة"
                  >
                    <StopCircle size={13} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <StartLiveSessionDialog open={showCreateDialog} onClose={() => setShowCreateDialog(false)} />

      {showEditDialog && editingSession && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
          onClick={() => setShowEditDialog(false)}
          role="dialog"
          aria-modal="true"
          aria-label="تعديل رابط الحصة"
          onKeyDown={(e) => {
            if (e.key === 'Escape') setShowEditDialog(false)
          }}
        >
          <div
            className="w-full max-w-md space-y-5 rounded-2xl border border-border bg-card p-6 shadow-2xl dark:border-primary/20 dark:bg-card"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-center text-lg font-bold text-main dark:text-main">
              تعديل رابط الحصة
            </h3>

            <div>
              <label className="mb-2 block text-xs font-bold text-muted dark:text-muted">
                نوع الاجتماع
              </label>
              <div className="flex gap-2">
                {PROVIDERS.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setEditProvider(p.value)}
                    className={cn(
                      'flex-1 rounded-xl border-2 px-2 py-3 text-[11px] font-bold transition-all',
                      editProvider === p.value
                        ? 'border-primary bg-primary-soft text-primary dark:border-primary dark:bg-primary/10 dark:text-primary'
                        : 'dark:hover:border-accent/30 border-border text-muted hover:border-border dark:border-primary/20 dark:text-muted',
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="edit-meeting-url"
                className="mb-2 block text-xs font-bold text-muted dark:text-muted"
              >
                رابط الاجتماع
              </label>
              <div className="flex gap-2">
                <input
                  id="edit-meeting-url"
                  type="url"
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  placeholder={
                    editProvider === 'google_meet'
                      ? 'https://meet.google.com/abc-defg-hij'
                      : editProvider === 'zoom'
                        ? 'https://zoom.us/j/1234567890'
                        : 'https://...'
                  }
                  className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus dark:border-primary/20 dark:bg-surface"
                />
                {editProvider === 'google_meet' && (
                  <a
                    href="https://meet.google.com/new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="dark:bg-success/10 dark:border-success/20 dark:hover:bg-success/15 flex items-center gap-1 whitespace-nowrap rounded-xl border border-success bg-success-soft px-3 py-3 text-[11px] font-bold text-success transition-colors hover:bg-success-soft dark:text-success"
                    title="إنشاء رابط Google Meet جديد"
                  >
                    <LinkIcon size={14} /> إنشاء
                  </a>
                )}
              </div>
            </div>

            {editError && (
              <p className="text-xs font-bold text-error dark:text-error">{editError}</p>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditDialog(false)
                  setEditingSession(null)
                  setEditError(null)
                }}
                className="h-11 flex-1 rounded-xl text-xs font-bold"
              >
                إلغاء
              </Button>
              <Button
                onClick={saveEditedLink}
                disabled={editMutation.isPending}
                className="h-11 flex-1 gap-2 rounded-xl bg-primary text-xs font-bold text-on-primary dark:bg-primary dark:text-on-primary"
              >
                {editMutation.isPending ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> جاري...
                  </>
                ) : (
                  'حفظ التعديل'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
