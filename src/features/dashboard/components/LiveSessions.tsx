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
  Clock,
  Globe,
} from 'lucide-react'
import { api } from '../../../lib/api'
import { socketService } from '../../../lib/socket'
import { SOCKET_EVENTS } from '../../../lib/socket-events'
import { useCurrentUser } from '../../../context/AppContext'
import { updateLiveSession } from '../../../services/liveSessionService'
import { cn } from '@/lib/utils'
import { confirm } from '../../../lib/confirmDialog'
import { Button } from '../../../shared/components/ui'
import { StartLiveSessionDialog } from './StartLiveSessionDialog'
import type { LiveSession } from '../../../types'

const PROVIDERS = [
  { value: 'google_meet', label: 'Google Meet', color: 'bg-success text-on-primary' },
  { value: 'zoom', label: 'Zoom', color: 'bg-info text-on-primary' },
  { value: 'custom', label: 'رابط آخر', color: 'bg-muted text-on-primary' },
]

const PROVIDER_LABELS: Record<string, string> = {
  google_meet: 'Google Meet',
  zoom: 'Zoom',
  custom: 'رابط مخصص',
}

const PROVIDER_DOT_COLORS: Record<string, string> = {
  google_meet: 'bg-success',
  zoom: 'bg-info',
  custom: 'bg-muted',
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'الآن'
  if (mins < 60) return `منذ ${mins} دقيقة`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `منذ ${hrs} ساعة`
  return `منذ ${Math.floor(hrs / 24)} يوم`
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
          <div className="relative">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-success-soft dark:bg-success-soft">
              <Radio size={16} className="text-success" />
            </div>
            {sessions.length > 0 && (
              <span className="absolute -start-1 -top-1 flex h-3.5 w-3.5 items-center justify-center">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[13px] font-bold text-main">الحصص المباشرة</h3>
              {sessions.length > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 text-[10px] font-bold text-success dark:bg-success-soft">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" />
                  مباشر
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted">
              {sessions.length > 0
                ? `${sessions.length} ${sessions.length === 1 ? 'حصة' : 'حصص'} جارية الآن`
                : 'روابط البث المباشر'}
            </p>
          </div>
        </div>
        {isTeacher && (
          <Button
            onClick={() => setShowCreateDialog(true)}
            size="sm"
            className="h-9 gap-1.5 rounded-xl bg-primary px-3.5 text-[11px] font-bold text-on-primary"
          >
            <Plus size={13} />
            بدء حصة
          </Button>
        )}
      </div>

      {/* Error */}
      {displayError && (
        <div className="mb-3 flex items-center justify-between rounded-xl border border-error-soft bg-error-soft p-3 dark:border-error-soft dark:bg-error-soft">
          <div className="flex items-center gap-2">
            <AlertCircle size={14} className="shrink-0 text-error" />
            <span className="text-xs font-medium text-error">{displayError}</span>
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold text-error transition-colors hover:bg-error-soft dark:hover:bg-error-soft"
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
        <div className="rounded-2xl border border-dashed border-border bg-surface py-10 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft dark:bg-primary/10">
            <Video size={24} className="text-primary/40 dark:text-primary/30" />
          </div>
          <p className="text-xs font-bold text-muted">لا توجد حصص مباشرة حالياً</p>
          <p className="mt-1 text-[11px] text-muted dark:text-dim">ابدأ حصتك بضغطة واحدة</p>
          {isTeacher && (
            <Button
              onClick={() => setShowCreateDialog(true)}
              size="sm"
              className="mt-3 h-9 gap-1.5 rounded-xl bg-primary px-5 text-[11px] font-bold text-on-primary"
            >
              <Plus size={13} /> بدء حصة
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="group overflow-hidden rounded-2xl border border-border bg-card transition-all hover:shadow-md hover:shadow-primary/5 dark:border-primary/15 dark:hover:border-primary/25"
            >
              {/* Live indicator bar */}
              <div className="h-0.5 bg-gradient-to-l from-success via-success to-transparent" />

              <div className="flex items-center gap-3 p-4">
                {/* Live pulse icon */}
                <div className="relative shrink-0">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-success-soft dark:bg-success-soft">
                    <Radio size={15} className="text-success" />
                  </div>
                  <span className="absolute -start-0.5 -top-0.5 h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-50" />
                    <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-card bg-success" />
                  </span>
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <h4 className="text-[13px] font-bold text-main">{session.title}</h4>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-muted">
                    <span className="flex items-center gap-1">
                      <Users size={10} />
                      {session.teacherName}
                    </span>
                    {session.subject && (
                      <>
                        <span className="text-border">·</span>
                        <span>{session.subject}</span>
                      </>
                    )}
                    <span className="text-border">·</span>
                    <span className="flex items-center gap-1">
                      <Clock size={10} />
                      {session.startedAt ? timeAgo(session.startedAt) : 'مباشر'}
                    </span>
                  </div>
                </div>

                {/* Provider badge */}
                <div className="hidden items-center gap-1.5 rounded-lg bg-surface px-2.5 py-1 dark:bg-hover sm:flex">
                  <span
                    className={cn(
                      'h-1.5 w-1.5 rounded-full',
                      PROVIDER_DOT_COLORS[session.meetingProvider] || 'bg-muted',
                    )}
                  />
                  <span className="text-[10px] font-bold text-muted">
                    {PROVIDER_LABELS[session.meetingProvider] || session.meetingProvider}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 items-center gap-1">
                  <a
                    href={session.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-[36px] items-center gap-1.5 rounded-xl bg-primary px-3.5 text-[11px] font-bold text-on-primary outline-none transition-all hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97]"
                  >
                    <ExternalLink size={12} />
                    انضم
                  </a>

                  <button
                    onClick={() => copyLink(session.meetingUrl || '', session.id)}
                    className="flex min-h-[36px] min-w-[36px] items-center justify-center rounded-xl border border-border text-muted transition-all hover:border-primary/30 hover:bg-primary-soft hover:text-primary dark:border-primary/15 dark:hover:bg-primary/10"
                    title="نسخ الرابط"
                    aria-label="نسخ رابط الحصة"
                  >
                    {copiedId === session.id ? (
                      <CheckCircle2 size={14} className="text-success" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>

                  {isTeacher && (
                    <button
                      onClick={() => openEditDialog(session)}
                      className="flex min-h-[36px] min-w-[36px] items-center justify-center rounded-xl border border-border text-muted transition-all hover:border-primary/30 hover:bg-primary-soft hover:text-primary dark:border-primary/15 dark:hover:bg-primary/10"
                      title="تعديل الرابط"
                      aria-label="تعديل رابط الحصة"
                    >
                      <Pencil size={14} />
                    </button>
                  )}

                  {isTeacher && (
                    <button
                      onClick={() => endSession(session.id)}
                      className="flex min-h-[36px] min-w-[36px] items-center justify-center rounded-xl border border-border text-error transition-all hover:border-error-soft hover:bg-error-soft hover:text-error dark:border-error-soft dark:hover:bg-error-soft"
                      title="إنهاء الحصة"
                      aria-label="إنهاء الحصة"
                    >
                      <StopCircle size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <StartLiveSessionDialog open={showCreateDialog} onClose={() => setShowCreateDialog(false)} />

      {showEditDialog && editingSession && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm md:items-center md:p-4"
          onClick={() => setShowEditDialog(false)}
          role="dialog"
          aria-modal="true"
          aria-label="تعديل رابط الحصة"
          onKeyDown={(e) => {
            if (e.key === 'Escape') setShowEditDialog(false)
          }}
        >
          <div
            className="w-full max-w-md space-y-5 rounded-2xl border border-border bg-card p-6 shadow-2xl dark:border-primary/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft dark:bg-primary/10">
                <Globe size={20} className="text-primary" />
              </div>
              <h3 className="text-base font-bold text-main">تعديل رابط الحصة</h3>
              <p className="mt-1 text-[11px] text-muted">غيّر رابط الاجتماع للحصة المباشرة</p>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold text-muted">نوع الاجتماع</label>
              <div className="flex gap-2">
                {PROVIDERS.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setEditProvider(p.value)}
                    className={cn(
                      'flex-1 rounded-xl border-2 px-2 py-3 text-[11px] font-bold transition-all',
                      editProvider === p.value
                        ? 'border-primary bg-primary-soft text-primary dark:border-primary dark:bg-primary/10'
                        : 'border-border text-muted hover:border-primary/30 dark:border-primary/15',
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="edit-meeting-url" className="mb-2 block text-xs font-bold text-muted">
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
                    className="flex items-center gap-1 whitespace-nowrap rounded-xl border border-success-soft bg-success-soft px-3 py-3 text-[11px] font-bold text-success transition-colors hover:bg-success-soft dark:bg-success-soft dark:hover:bg-success-soft"
                    title="إنشاء رابط Google Meet جديد"
                  >
                    <LinkIcon size={14} /> إنشاء
                  </a>
                )}
              </div>
            </div>

            {editError && <p className="text-xs font-bold text-error">{editError}</p>}

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
                className="h-11 flex-1 gap-2 rounded-xl bg-primary text-xs font-bold text-on-primary"
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
