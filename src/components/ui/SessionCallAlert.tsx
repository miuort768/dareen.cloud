import { useState, useEffect, useRef } from 'react'
import { ExternalLink, Radio, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCurrentUser } from '../../context/AppContext'
import { socketService } from '../../lib/socket'
import {
  SOCKET_EVENTS,
  type SessionInvitePayload,
  type SessionLinkUpdatedPayload,
} from '../../lib/socket-events'

const PROVIDER_NAMES: Record<string, string> = {
  google_meet: 'Google Meet',
  zoom: 'Zoom',
  custom: 'رابط مخصص',
}

export const SessionCallAlert = () => {
  const currentUser = useCurrentUser()
  const [callData, setCallData] = useState<SessionInvitePayload | null>(null)
  const [show, setShow] = useState(false)
  const [linkUpdated, setLinkUpdated] = useState(false)
  const notificationAudioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (!notificationAudioRef.current) {
      notificationAudioRef.current = new Audio('/notification.wav')
      notificationAudioRef.current.volume = 0.9
    }
    const audio = notificationAudioRef.current

    const socket = socketService.getSocket()
    if (!socket || (currentUser?.role !== 'student' && currentUser?.role !== 'parent')) return

    const handleInvite = (data: SessionInvitePayload) => {
      setCallData(data)
      setShow(true)
      setLinkUpdated(false)
      audio.currentTime = 0
      audio.play().catch((e) => console.warn(e))
    }

    const handleEnded = () => {
      setShow(false)
      setCallData(null)
      setLinkUpdated(false)
    }

    const handleLinkUpdated = (data: SessionLinkUpdatedPayload) => {
      setCallData((prev) => {
        if (prev && prev.sessionId === data.sessionId) {
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
  }, [currentUser])

  if (!show || !callData) return null

  return (
    <AnimatePresence>
      {show && callData && (
        <motion.div
          key="session-call-alert"
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-[calc(96px+env(safe-area-inset-bottom))] end-4 start-4 z-[1000] md:bottom-8 md:end-auto md:start-8 md:w-[420px]"
        >
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-elevation-3">
            <div className="relative flex items-center justify-between gap-3 bg-gradient-to-r from-primary via-primary-deep to-primary-hover px-4 py-3">
              <div className="flex min-w-0 items-center gap-2.5 text-on-primary">
                <Radio size={20} className="shrink-0 animate-pulse" />
                <span className="truncate text-sm font-black">تنبيه حصة مباشرة</span>
              </div>
              <button
                onClick={() => setShow(false)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-on-primary outline-none transition-colors hover:bg-white/25 focus-visible:ring-2 focus-visible:ring-white/50"
                aria-label="إغلاق"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-4 sm:p-5">
              <h4 className="text-base font-black leading-snug text-main">
                المعلمة {callData.teacherName} بانتظارك!
              </h4>

              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-black text-primary">
                  الحصة: {callData.subject}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] font-bold text-muted">
                  عبر {PROVIDER_NAMES[callData.meetingProvider] || callData.meetingProvider}
                </span>
              </div>

              {linkUpdated && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-micro font-black text-success"
                >
                  تم تحديث الرابط!
                </motion.p>
              )}

              <div className="mt-4 grid grid-cols-2 gap-3">
                <a
                  href={callData.meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary text-xs font-black text-on-primary shadow-elevation-1 outline-none transition-all hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97]"
                >
                  انضم للحصة <ExternalLink size={14} />
                </a>
                <button
                  onClick={() => setShow(false)}
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-border bg-card px-4 text-xs font-bold text-main outline-none transition-colors hover:bg-hover focus-visible:ring-2 focus-visible:ring-focus"
                >
                  لاحقاً
                </button>
              </div>
            </div>

            <div className="h-1 w-full overflow-hidden rounded-full bg-border">
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 60, ease: 'linear' }}
                className="h-full rounded-full bg-primary"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
