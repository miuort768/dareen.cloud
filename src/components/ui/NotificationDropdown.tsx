import { useState, useEffect, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import {
  useNotificationsEnabled,
  useCurrentUser,
  useShowNotification,
} from '../../context/AppContext'
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Calendar,
  Clock,
  Trash2,
  Smartphone,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import { api } from '../../lib/api'
import { cn } from '../../lib/utils'
import { useDeviceWidth } from '../../shared/hooks/useDeviceWidth'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface Notification {
  id: string
  type: 'success' | 'warning' | 'info' | 'live'
  title: string
  message: string
  time: string
  read: boolean
  conversationId?: string
  link?: string
}

interface NotificationGroup {
  id: string
  key: string
  items: Notification[]
}

export const NotificationDropdown = ({
  showLabel = false,
  tray = false,
}: {
  showLabel?: boolean
  /** Fixed viewport tray (top corner) — use when anchored positioning is clipped/unreliable */
  tray?: boolean
}) => {
  const notificationsEnabled = useNotificationsEnabled()
  const currentUser = useCurrentUser()
  const showNotification = useShowNotification()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isOpen, setIsOpen] = useState(false)
  const lastNotifIdRef = useRef<string | null>(null)

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ['notifications', currentUser?.id],
    queryFn: async () => {
      const data = await api.get<Notification[]>(`/notifications?receiverId=${currentUser?.id}`)
      return Array.isArray(data) ? data : []
    },
    enabled: !!currentUser,
    refetchInterval: 3000,
    refetchIntervalInBackground: true,
  })

  // Detect NEW unread notifications to show toast
  useEffect(() => {
    if (!notificationsEnabled || notifications.length === 0) return

    const latestNotif = notifications[0]
    if (!latestNotif) return
    if (!latestNotif.read && latestNotif.id !== lastNotifIdRef.current) {
      if (lastNotifIdRef.current !== null) {
        showNotification(`إشعار جديد: ${latestNotif.title}`, 'info')
      }
      lastNotifIdRef.current = latestNotif.id
    }
  }, [notifications, notificationsEnabled, showNotification])

  const dropdownRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const device = useDeviceWidth()
  const isMobileView = device === 'mobile'

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        !(panelRef.current && panelRef.current.contains(target))
      ) {
        setIsOpen(false)
      }
    }
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const unreadCount = Array.isArray(notifications) ? notifications.filter((n) => !n.read).length : 0

  // Merge consecutive identical notifications (same type+title+message) into one row
  const groups = useMemo<NotificationGroup[]>(() => {
    const result: NotificationGroup[] = []
    for (const n of notifications) {
      const key = `${n.type}||${n.title}||${n.message}`
      const last = result[result.length - 1]
      if (last && last.key === key) {
        last.items.push(n)
      } else {
        result.push({ id: n.id, key, items: [n] })
      }
    }
    return result
  }, [notifications])

  const markReadMutation = useMutation({
    mutationFn: (ids: string[]) =>
      Promise.allSettled(ids.map((id) => api.put(`/notifications/${id}`, { read: true }))),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (ids: string[]) =>
      Promise.allSettled(ids.map((id) => api.delete(`/notifications/${id}`))),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const clearAllMutation = useMutation({
    mutationFn: () => api.delete(`/notifications?receiverId=${currentUser?.id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const markAsRead = (ids: string[]) => {
    if (ids.length === 0 || markReadMutation.isPending) return
    markReadMutation.mutate(ids)
  }

  const markAllAsRead = () => {
    const ids = notifications.filter((n) => !n.read).map((n) => n.id)
    if (ids.length === 0 || markReadMutation.isPending) return
    markReadMutation.mutate(ids)
  }

  const deleteNotification = (ids: string | string[]) => {
    deleteMutation.mutate(Array.isArray(ids) ? ids : [ids])
  }

  const clearAll = () => {
    clearAllMutation.mutate()
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'live':
        return (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-on-primary">
            <Smartphone size={14} />
          </div>
        )
      case 'success':
        return (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-success-soft text-success">
            <CheckCircle2 size={16} />
          </div>
        )
      case 'warning':
        return (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-warning-soft text-warning">
            <AlertTriangle size={16} />
          </div>
        )
      case 'info':
        return (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-info-soft text-info">
            <Calendar size={16} />
          </div>
        )
      default:
        return (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface text-muted">
            <Bell size={16} />
          </div>
        )
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'relative flex h-8 w-8 items-center justify-center gap-1.5 rounded-full px-2.5 outline-none transition-all duration-normal focus-visible:ring-2 focus-visible:ring-focus md:w-auto',
          unreadCount > 0
            ? 'text-primary hover:bg-accent-soft hover:text-primary'
            : 'text-muted hover:bg-accent-soft hover:text-main',
        )}
        aria-label="إظهار الإشعارات"
        aria-expanded={isOpen}
        aria-controls="notification-panel"
      >
        <Bell
          size={16}
          style={unreadCount > 0 ? { filter: 'var(--drop-shadow-bell)' } : undefined}
        />
        {showLabel && <span className="hidden text-xs font-medium sm:inline">الإشعارات</span>}
        {notificationsEnabled && unreadCount > 0 && (
          <span className="absolute -start-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-surface bg-error px-1 text-micro font-bold text-on-error shadow-elevation-3">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen &&
        (() => {
          const node = (
            <>
              {!tray && (
                <div
                  className="fixed inset-0 z-[190] bg-black/40 backdrop-blur-sm duration-normal animate-in fade-in md:hidden"
                  onClick={() => setIsOpen(false)}
                  aria-hidden="true"
                />
              )}
              <div
                id="notification-panel"
                ref={panelRef}
                className={cn(
                  'flex flex-col border border-border bg-card shadow-elevation-3 duration-slow animate-in fade-in',
                  tray
                    ? // Fixed tray — viewport anchored, immune to ancestor clipping (chat sidebar)
                      'fixed inset-x-2 bottom-4 top-[calc(66px+var(--safe-area-top))] z-[200] w-auto overflow-hidden rounded-2xl slide-in-from-bottom-4 md:inset-x-auto md:bottom-auto md:end-4 md:h-fit md:w-[400px]'
                    : cn(
                        // Phone: bottom sheet (full width, tall, swipe-safe area)
                        'fixed inset-x-0 bottom-0 z-[200] max-h-[85dvh] overflow-hidden rounded-t-3xl pb-[env(safe-area-inset-bottom)] shadow-elevation-4 slide-in-from-bottom-4',
                        // Desktop: anchored popover under the bell
                        'md:absolute md:inset-auto md:bottom-auto md:end-0 md:top-full md:mt-3 md:max-h-none md:w-[420px] md:overflow-visible md:rounded-2xl md:pb-0 md:shadow-elevation-3 md:slide-in-from-top-2',
                      ),
                )}
              >
                {!tray && (
                  <>
                    <div
                      className="mx-auto mt-2.5 h-1.5 w-12 shrink-0 rounded-full bg-border md:hidden"
                      aria-hidden="true"
                    />
                    <div className="absolute -top-[9px] end-4 hidden h-3.5 w-3.5 rotate-45 border-e border-t border-border bg-card md:end-8 md:block" />
                  </>
                )}

                {/* Header */}
                <div className="flex flex-col gap-3 border-b border-border bg-surface p-4 md:flex-row md:items-center md:justify-between md:gap-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-on-primary shadow-elevation-1">
                      <Bell size={17} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="flex items-center gap-2 text-sm font-black text-main">
                        الإشعارات
                        {unreadCount > 0 && (
                          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-error px-1.5 text-micro font-black leading-none text-on-error">
                            {unreadCount}
                          </span>
                        )}
                      </h3>
                      <p className="mt-0.5 truncate text-[11px] font-bold text-muted">
                        {unreadCount > 0 ? `${unreadCount} غير مقروء` : 'لا توجد إشعارات جديدة'}
                      </p>
                    </div>
                  </div>

                  {(unreadCount > 0 ||
                    (Array.isArray(notifications) && notifications.length > 0)) && (
                    <div className="flex items-center gap-2 md:gap-1">
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          disabled={markReadMutation.isPending}
                          className="flex min-h-11 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-primary bg-primary-soft px-3.5 text-xs font-bold leading-none text-primary outline-none transition-colors hover:bg-primary hover:text-on-primary focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-60 md:min-h-0 md:flex-none md:px-3 md:py-1.5 md:text-micro"
                        >
                          <CheckCheck size={13} />
                          تحديد الكل
                        </button>
                      )}
                      {Array.isArray(notifications) && notifications.length > 0 && (
                        <button
                          onClick={clearAll}
                          disabled={clearAllMutation.isPending}
                          className="flex min-h-11 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-error bg-error-soft px-3.5 text-xs font-bold leading-none text-error outline-none transition-colors hover:bg-error hover:text-on-error focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-60 md:min-h-0 md:flex-none md:px-3 md:py-1.5 md:text-micro"
                        >
                          <Trash2 size={13} />
                          حذف الكل
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Notifications List */}
                <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto md:max-h-[min(70vh,520px)]">
                  {!notificationsEnabled ? (
                    <div className="flex flex-col items-center gap-3 py-10 text-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-warning-soft text-warning">
                        <AlertCircle size={26} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-main">الإشعارات معطلة</p>
                        <p className="mt-1 text-xs text-muted">يمكنك تفعيلها من صفحة الإعدادات</p>
                      </div>
                    </div>
                  ) : groups.length > 0 ? (
                    groups.map((group) => {
                      const n = group.items[0]!
                      const count = group.items.length
                      const isUnread = group.items.some((item) => !item.read)
                      const groupIds = group.items.map((item) => item.id)
                      return (
                        <div
                          key={group.id}
                          className={cn(
                            'group/notif cursor-pointer border-b border-s-2 border-border transition-colors last:border-b-0 hover:bg-hover',
                            isUnread
                              ? 'border-s-info bg-info-soft'
                              : 'border-s-transparent bg-card',
                          )}
                          onClick={() => {
                            markAsRead(groupIds)
                            const target =
                              n.link ||
                              (n.conversationId ? `/chat?conversationId=${n.conversationId}` : '')
                            if (target) {
                              if (/^https?:\/\//i.test(target)) {
                                window.open(target, '_blank', 'noopener,noreferrer')
                              } else {
                                navigate(target)
                              }
                              setIsOpen(false)
                            }
                          }}
                        >
                          <div className="flex items-start gap-3 p-3.5 md:p-4">
                            {getIcon(n.type)}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <h4
                                  className={cn(
                                    'min-w-0 text-sm leading-snug text-main',
                                    isUnread ? 'font-black' : 'font-bold',
                                  )}
                                >
                                  {n.title}
                                </h4>
                                {count > 1 && (
                                  <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary-soft px-1.5 text-[10px] font-black leading-none text-primary">
                                    ×{count}
                                  </span>
                                )}
                              </div>
                              <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted">
                                {n.message}
                              </p>
                              <div className="mt-2.5 flex items-center justify-between gap-2">
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-dim">
                                  <Clock size={11} />
                                  {formatDistanceToNow(new Date(n.time), {
                                    addSuffix: true,
                                    locale: ar,
                                  })}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    deleteNotification(groupIds)
                                  }}
                                  className="flex h-11 w-11 items-center justify-center rounded-xl text-muted outline-none transition-colors hover:bg-error-soft hover:text-error focus-visible:ring-2 focus-visible:ring-focus md:h-7 md:w-7 md:rounded-lg"
                                  aria-label={
                                    count > 1 ? `حذف ${count} إشعارات متطابقة` : 'حذف الإشعار'
                                  }
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="flex flex-col items-center gap-3 py-10 text-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface text-muted">
                        <Bell size={26} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-main">لا توجد إشعارات</p>
                        <p className="mt-1 text-xs text-muted">ستظهر هنا كل الإشعارات الجديدة</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )
          return !tray && isMobileView ? createPortal(node, document.body) : node
        })()}
    </div>
  )
}
