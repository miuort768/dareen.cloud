import { useState, useEffect, useRef } from 'react'
import { ExternalLink, Radio, X } from 'lucide-react'
import { useCurrentUser } from '../../context/AppContext'
import { api } from '../../lib/api'
import { socketService } from '../../lib/socket'
import {
  SOCKET_EVENTS,
  type SessionInvitePayload,
  type SessionLinkUpdatedPayload,
} from '../../lib/socket-events'
import type { LiveSession } from '../../types'

const PROVIDER_NAMES: Record<string, string> = {
  google_meet: 'Google Meet',
  zoom: 'Zoom',
  custom: 'رابط مخصص',
}

interface ActiveSession {
  id: string
  teacherName: string
  subject: string
  meetingUrl: string
  meetingProvider: string
}

export const SessionCallAlert = () => {
  const currentUser = useCurrentUser()
  const isEligible = currentUser?.role === 'student' || currentUser?.role === 'parent'
  const [session, setSession] = useState<ActiveSession | null>(null)
  const [show, setShow] = useState(false)
  const [linkUpdated, setLinkUpdated] = useState(false)
  const sessionIdRef = useRef<string | null>(null)
  const dismissedIdRef = useRef<string | null>(null)
  const notificationAudioRef = useRef<HTMLAudioElement | null>(null)

  const setActiveSession = (next: ActiveSession | null) => {
    sessionIdRef.current = next ? next.id : null
    setSession(next)
  }

  const presentSession = (next: ActiveSession) => {
    if (dismissedIdRef.current === next.id) return
    setActiveSession(next)
    setShow(true)
    setLinkUpdated(false)
  }

  useEffect(() => {
    if (!isEligible) return
    let cancelled = false
    api
      .get<LiveSession[]>('/live/active')
      .then((data) => {
        if (cancelled) return
        const active = Array.isArray(data) ? data[0] : null
        if (active) {
          presentSession({
            id: active.id,
            teacherName: active.teacherName || '',
            subject: active.subject || '',
            meetingUrl: active.meetingUrl || '',
            meetingProvider: active.meetingProvider,
          })
        }
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEligible])

  useEffect(() => {
    if (!isEligible) return
    if (!notificationAudioRef.current) {
      notificationAudioRef.current = new Audio('/notification.wav')
      notificationAudioRef.current.volume = 0.9
    }
    const audio = notificationAudioRef.current

    const socket = socketService.getSocket()
    if (!socket) return

    const handleInvite = (data: SessionInvitePayload) => {
      presentSession({
        id: data.sessionId,
        teacherName: data.teacherName,
        subject: data.subject,
        meetingUrl: data.meetingUrl,
        meetingProvider: data.meetingProvider,
      })
      if (dismissedIdRef.current !== data.sessionId) {
        audio.currentTime = 0
        audio.play().catch((e) => console.warn(e))
      }
    }

    const handleEnded = (data: { sessionId?: string }) => {
      if (!data.sessionId || sessionIdRef.current === data.sessionId) {
        setActiveSession(null)
        setShow(false)
        setLinkUpdated(false)
        dismissedIdRef.current = null
      }
    }

    const handleLinkUpdated = (data: SessionLinkUpdatedPayload) => {
      setSession((prev) => {
        if (prev && prev.id === data.sessionId) {
          return { ...prev, meetingUrl: data.meetingUrl, meetingProvider: data.meetingProvider }
        }
        return prev
      })
      setLinkUpdated(true)
      setTimeout(() => setLinkUpdated(false), 3000)
    }

    socket.on(SOCKET_EVENTS.SESSION_INVITE, handleInvite)
    socket.on(SOCKET_EVENTS.SESSION_ENDED, handleEnded)
    socket.on(SOCKET_EVENTS.SESSION_LINK_UPDATED, handleLinkUpdated)

    return () => {
      socket.off(SOCKET_EVENTS.SESSION_INVITE, handleInvite)
      socket.off(SOCKET_EVENTS.SESSION_ENDED, handleEnded)
      socket.off(SOCKET_EVENTS.SESSION_LINK_UPDATED, handleLinkUpdated)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEligible])

  const handleDismiss = () => {
    if (sessionIdRef.current) dismissedIdRef.current = sessionIdRef.current
    setShow(false)
  }

  if (!isEligible || !show || !session) return null

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-elevation-1">
      <div className="relative flex items-center justify-between gap-3 bg-gradient-to-r from-primary via-primary-deep to-primary-hover px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5 text-on-primary">
          <Radio size={20} className="shrink-0 animate-pulse" />
          <span className="truncate text-sm font-black">حصة مباشرة الآن</span>
        </div>
        <button
          onClick={handleDismiss}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-on-primary outline-none transition-colors hover:bg-white/25 focus-visible:ring-2 focus-visible:ring-white/50"
          aria-label="إغلاق"
        >
          <X size={16} />
        </button>
      </div>

      <div className="p-4 sm:p-5">
        <h4 className="text-base font-black leading-snug text-main">
          المعلمة {session.teacherName} بانتظارك!
        </h4>

        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-black text-primary">
            الحصة: {session.subject}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] font-bold text-muted">
            عبر {PROVIDER_NAMES[session.meetingProvider] || session.meetingProvider}
          </span>
        </div>

        {linkUpdated && <p className="mt-2 text-micro font-black text-success">تم تحديث الرابط!</p>}

        <div className="mt-4 grid grid-cols-2 gap-3">
          <a
            href={session.meetingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary text-xs font-black text-on-primary shadow-elevation-1 outline-none transition-all hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97]"
          >
            الدخول للحصة <ExternalLink size={14} />
          </a>
          <button
            onClick={handleDismiss}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-border bg-card px-4 text-xs font-bold text-main outline-none transition-colors hover:bg-hover focus-visible:ring-2 focus-visible:ring-focus"
          >
            لاحقاً
          </button>
        </div>
      </div>
    </div>
  )
}
