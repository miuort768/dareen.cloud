import { useState, useEffect, useRef } from 'react'
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
  Trash2,
  Smartphone,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import { api } from '../../lib/api'
import { cn } from '../../lib/utils'
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

const pushCapable = typeof Notification !== 'undefined'

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const unreadCount = Array.isArray(notifications) ? notifications.filter((n) => !n.read).length : 0

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => api.put(`/notifications/${id}`, { read: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const markAllReadMutation = useMutation({
    mutationFn: () =>
      Promise.allSettled(
        notifications
          .filter((n) => !n.read)
          .map((n) => api.put(`/notifications/${n.id}`, { read: true })),
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/notifications/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const clearAllMutation = useMutation({
    mutationFn: () => api.delete(`/notifications?receiverId=${currentUser?.id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const markAsRead = (id: string) => {
    markAsReadMutation.mutate(id)
  }

  const markAllAsRead = () => {
    if (unreadCount === 0 || markAllReadMutation.isPending) return
    markAllReadMutation.mutate()
  }

  const deleteNotification = (id: string) => {
    deleteMutation.mutate(id)
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

      {isOpen && (
        <div
          id="notification-panel"
          className={cn(
            'z-[200] duration-slow animate-in fade-in slide-in-from-top-2',
            tray
              ? // Fixed tray — viewport anchored, immune to ancestor clipping (chat sidebar)
                'fixed inset-x-2 bottom-4 top-[calc(66px+var(--safe-area-top))] flex w-auto flex-col rounded-2xl border border-border bg-card shadow-elevation-3 md:inset-x-auto md:bottom-auto md:end-4 md:h-fit md:w-[400px]'
              : 'fixed inset-x-2 top-[70px] w-auto rounded-2xl border border-border bg-card shadow-elevation-3 md:absolute md:inset-auto md:end-0 md:top-full md:mt-3 md:w-[400px]',
          )}
        >
          {!tray && (
            <div className="absolute -top-[9px] end-4 hidden h-3.5 w-3.5 rotate-45 border-e border-t border-border bg-card md:end-8 md:block" />
          )}

          {/* Header */}
          <div className="flex items-center justify-between gap-2 border-b border-border bg-surface p-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-on-primary">
                <Bell size={16} />
              </div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-main">الإشعارات</h3>
                {unreadCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-error px-1.5 text-micro font-black leading-none text-on-error">
                    {unreadCount}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  disabled={markAllReadMutation.isPending}
                  className="flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1.5 text-micro font-bold text-primary outline-none transition-colors hover:bg-primary-soft focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-60 sm:text-xs"
                >
                  <CheckCheck size={12} />
                  تحديد الكل
                </button>
              )}
              {Array.isArray(notifications) && notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  disabled={clearAllMutation.isPending}
                  className="flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1.5 text-micro font-bold text-error outline-none transition-colors hover:bg-error-soft hover:text-error focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-60 sm:text-xs"
                >
                  <Trash2 size={12} />
                  حذف الكل
                </button>
              )}
            </div>
          </div>

          {/* Push Notification Activation Prompt */}
          {pushCapable && Notification.permission === 'default' && notificationsEnabled && (
            <div className="flex items-center justify-between gap-3 border-b border-border bg-primary-soft p-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-on-primary">
                  <Smartphone size={14} />
                </div>
                <p className="text-micro font-bold text-primary sm:text-xs">
                  هل تريد تفعيل الإشعارات الفورية؟
                </p>
              </div>
              <button
                onClick={async () => {
                  const { pushService } = await import('../../services/pushService')
                  const permission = await Notification.requestPermission()
                  if (permission === 'granted' && currentUser) {
                    await pushService.subscribeUser()
                    showNotification('تم تفعيل التنبيهات الفورية بنجاح', 'success')
                  }
                }}
                className="rounded-full bg-primary px-3 py-1.5 text-micro font-bold text-on-primary outline-none transition-colors hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-focus"
              >
                تفعيل الآن
              </button>
            </div>
          )}

          {/* Notifications List */}
          <div
            className={cn(
              'custom-scrollbar overflow-y-auto',
              tray ? 'min-h-0 flex-1 md:max-h-96' : 'max-h-[70vh] md:max-h-96',
            )}
          >
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
            ) : Array.isArray(notifications) && notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    'cursor-pointer border-b border-border transition-colors last:border-b-0 hover:bg-surface',
                    !notification.read ? 'bg-info-light dark:bg-info-soft' : '',
                  )}
                  onClick={() => {
                    markAsRead(notification.id)
                    if (notification.link) {
                      navigate(notification.link)
                      setIsOpen(false)
                    } else if (notification.conversationId) {
                      navigate(`/chat?conversationId=${notification.conversationId}`)
                      setIsOpen(false)
                    }
                  }}
                >
                  <div className="flex items-start gap-3 p-3.5 sm:p-4">
                    {getIcon(notification.type)}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4
                          className={cn(
                            'text-sm leading-snug',
                            !notification.read ? 'font-bold text-main' : 'font-medium text-main',
                          )}
                        >
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-info" />
                        )}
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-micro text-muted sm:text-xs">
                        {notification.message}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[10px] text-muted sm:text-micro">
                          {formatDistanceToNow(new Date(notification.time), {
                            addSuffix: true,
                            locale: ar,
                          })}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteNotification(notification.id)
                          }}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-muted outline-none transition-colors hover:bg-error-soft hover:text-error focus-visible:ring-2 focus-visible:ring-focus"
                          aria-label="حذف الإشعار"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
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
      )}
    </div>
  )
}
