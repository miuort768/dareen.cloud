import { useState, useEffect, useCallback } from 'react'
import { Radio, ExternalLink, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCurrentUser } from '../../context/AppContext'
import { api } from '../../lib/api'
import { socketService } from '../../lib/socket'
import { SOCKET_EVENTS, type SessionLinkUpdatedPayload } from '../../lib/socket-events'
import type { LiveSession } from '../../types'

const PROVIDER_NAMES: Record<string, string> = {
  google_meet: 'Google Meet',
  zoom: 'Zoom',
  custom: 'رابط مخصص',
}

export const ActiveSessionBanner = () => {
  const currentUser = useCurrentUser()
  const [session, setSession] = useState<LiveSession | null>(null)
  const [dismissed, setDismissed] = useState(false)

  const fetchActiveSession = useCallback(async () => {
    if (currentUser?.role !== 'student' && currentUser?.role !== 'parent') return
    try {
      const data = await api.get<LiveSession[]>('/live/active')
      const active = Array.isArray(data) ? data[0] : undefined
      if (active) {
        setSession(active)
        setDismissed(false)
      } else {
        setSession(null)
      }
    } catch {
      // silently fail
    }
  }, [currentUser?.role])

  useEffect(() => {
    fetchActiveSession()

    const socket = socketService.getSocket()
    if (!socket) return

    const handleInvite = () => {
      fetchActiveSession()
    }

    const handleEnded = (data: { sessionId: string }) => {
      setSession((prev) => {
        if (prev && prev.id === data.sessionId) return null
        return prev
      })
    }

    const handleLinkUpdated = (data: SessionLinkUpdatedPayload) => {
      setSession((prev) => {
        if (prev && prev.id === data.sessionId) {
          return {
            ...prev,
            meetingUrl: data.meetingUrl,
            meetingProvider: data.meetingProvider as LiveSession['meetingProvider'],
          }
        }
        return prev
      })
    }

    socket.on(SOCKET_EVENTS.SESSION_INVITE, handleInvite)
    socket.on(SOCKET_EVENTS.SESSION_ENDED, handleEnded)
    socket.on(SOCKET_EVENTS.SESSION_LINK_UPDATED, handleLinkUpdated)

    return () => {
      socket.off(SOCKET_EVENTS.SESSION_INVITE, handleInvite)
      socket.off(SOCKET_EVENTS.SESSION_ENDED, handleEnded)
      socket.off(SOCKET_EVENTS.SESSION_LINK_UPDATED, handleLinkUpdated)
    }
  }, [fetchActiveSession])

  if (!session || dismissed) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -60, opacity: 0 }}
        className="z-[90] flex w-full items-center justify-between gap-3 bg-success px-4 py-2.5 text-on-success"
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex shrink-0 items-center gap-2">
            <Radio size={14} className="animate-pulse" />
            <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-bold">
              حصة مباشرة جارية — {session.teacherName}
              {session.subject && (
                <span className="font-normal opacity-80"> — {session.subject}</span>
              )}
            </p>
            <p className="text-[10px] font-medium opacity-70">
              عبر {PROVIDER_NAMES[session.meetingProvider] || session.meetingProvider}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <a
            href={session.meetingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg bg-white/20 px-3 py-1.5 text-xs font-bold transition-colors hover:bg-white/30"
          >
            <ExternalLink size={12} />
            انضمام
          </a>
          <button
            onClick={() => setDismissed(true)}
            className="rounded-lg p-1.5 transition-colors hover:bg-white/20"
            aria-label="إخفاء الشريط"
          >
            <X size={14} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
