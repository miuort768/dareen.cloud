import { useState, useEffect, useRef } from 'react'
import { ExternalLink, X, BellRing } from 'lucide-react'
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
      notificationAudioRef.current = new Audio('/notification.ogg')
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
          className="fixed bottom-16 end-4 start-4 z-[1000] md:bottom-8 md:end-auto md:start-8 md:w-[400px]"
        >
          <div className="overflow-hidden border-4 border-border bg-card p-1 shadow-soft">
            <div className="flex items-center justify-between border-b-2 border-border bg-primary p-3">
              <div className="flex items-center gap-2 text-on-primary">
                <BellRing size={20} className="animate-bounce" />
                <span className="text-sm font-medium italic">تنبيه حصة مباشرة!</span>
              </div>
              <button
                onClick={() => setShow(false)}
                className="text-on-primary transition-transform hover:rotate-90"
                aria-label="إغلاق"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5">
              <div className="mb-4 text-start">
                <h4 className="mb-1 text-base font-medium text-main">
                  المعلمة {callData.teacherName} بانتظارك!
                </h4>
                <p className="mb-1 text-micro font-normal uppercase tracking-tighter text-muted">
                  الحصة: {callData.subject}
                </p>
                <p className="text-micro font-bold text-primary">
                  عبر {PROVIDER_NAMES[callData.meetingProvider] || callData.meetingProvider}
                </p>
                {linkUpdated && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 text-micro font-bold text-success"
                  >
                    تم تحديث الرابط!
                  </motion.p>
                )}
              </div>

              <div className="flex gap-2">
                <a
                  href={callData.meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-1 items-center justify-center gap-2 border-2 border-border bg-primary px-4 py-2 text-xs font-medium text-on-primary shadow-[4px_4px_0px_0px_black] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                >
                  انضم للحصة <ExternalLink size={14} />
                </a>
                <button
                  onClick={() => setShow(false)}
                  className="border-2 border-border px-4 py-2 text-xs font-normal transition-colors hover:bg-surface"
                >
                  لاحقاً
                </button>
              </div>
            </div>

            <div className="h-1 w-full overflow-hidden bg-background">
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 60, ease: 'linear' }}
                className="h-full bg-primary"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
