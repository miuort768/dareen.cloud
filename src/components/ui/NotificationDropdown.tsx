import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  useNotificationsEnabled,
  useCurrentUser,
  useShowNotification,
} from '../../context/AppContext'
import { Bell, CheckCircle2, AlertCircle, Calendar, Trash2, Smartphone } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import { api } from '../../lib/api'
import { cn } from '../../lib/utils'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface Notification {
  id: string
  type: 'success' | 'warning' | 'info'
  title: string
  message: string
  time: string
  read: boolean
  conversationId?: string
  link?: string
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
    if (!Array.isArray(notifications)) return
    for (const n of notifications.filter((n) => !n.read)) {
      markAsReadMutation.mutate(n.id)
    }
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
          <div className="flex h-8 w-8 animate-pulse items-center justify-center rounded-lg border border-success bg-success-light dark:border-success dark:bg-success-soft">
            <Smartphone className="text-success" size={16} />
          </div>
        )
      case 'success':
        return <CheckCircle2 className="text-success" size={18} />
      case 'warning':
        return <AlertCircle className="text-warning" size={18} />
      case 'info':
        return <Calendar className="text-info" size={18} />
      default:
        return <Bell className="text-muted" size={18} />
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'relative flex h-11 w-11 items-center justify-center gap-1.5 rounded-lg px-2.5 transition-all duration-normal md:h-8 md:w-auto',
          'text-muted hover:bg-accent-soft hover:text-main',
        )}
        aria-label="إظهار الإشعارات"
        aria-expanded={isOpen}
        aria-controls="notification-panel"
      >
        <Bell
          size={16}
          className={cn(unreadCount > 0 ? 'animate-pulse' : '')}
          style={unreadCount > 0 ? { filter: 'var(--drop-shadow-bell)' } : undefined}
        />
        {showLabel && <span className="hidden text-xs font-medium sm:inline">الإشعارات</span>}
        {notificationsEnabled && unreadCount > 0 && (
          <span className="absolute -start-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full border-2 border-surface bg-error px-1 text-micro font-bold text-on-error shadow-lg">
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
              : 'fixed inset-x-2 top-[70px] w-auto rounded-none border-2 border-border bg-card shadow-[var(--shadow-panel)] md:absolute md:inset-auto md:end-0 md:top-full md:mt-3 md:w-[400px]',
          )}
        >
          {!tray && (
            <div className="absolute -top-[10px] end-4 hidden h-4 w-4 rotate-45 border-e-2 border-t-2 border-border bg-card md:end-8 md:block" />
          )}

          {/* Header */}

          <div className="flex items-center justify-between border-b-2 border-border bg-surface p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-none bg-primary text-on-primary shadow-[2px_2px_0_black]">
                <Bell size={16} />
              </div>
              <h3 className="text-xs font-medium uppercase tracking-widest text-main">الإشعارات</h3>
              {unreadCount > 0 && (
                <span className="bg-error px-2 py-0.5 text-micro font-medium text-on-error shadow-[1px_1px_0_black]">
                  {unreadCount} مـهـم
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="whitespace-nowrap text-micro font-medium text-primary hover:text-primary sm:text-xs"
                >
                  تحديد الكل
                </button>
              )}
              {Array.isArray(notifications) && notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="whitespace-nowrap text-micro font-medium text-error hover:text-error sm:text-xs"
                >
                  حذف الكل
                </button>
              )}
            </div>
          </div>

          {/* Push Notification Activation Prompt */}
          {Notification.permission !== 'granted' && (
            <div className="flex items-center justify-between gap-3 border-b border-primary bg-primary-soft p-3 dark:border-primary/30">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-primary p-1.5 text-on-primary">
                  <Smartphone size={14} />
                </div>
                <p className="text-micro font-normal text-primary sm:text-xs">
                  هل تريد ميزة الإشعارات الفورية؟
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
                className="rounded-lg bg-primary px-3 py-1.5 text-micro font-medium text-on-primary shadow-soft transition-colors hover:bg-primary-hover"
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
              <div className="p-12 text-center">
                <AlertCircle size={48} className="mx-auto mb-3 text-warning opacity-50" />
                <p className="mb-1 text-sm font-normal text-main">الإشعارات معطلة</p>
                <p className="text-xs text-muted">يمكنك تفعيلها من صفحة الإعدادات</p>
              </div>
            ) : Array.isArray(notifications) && notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`cursor-pointer border-b border-border p-4 transition-none hover:bg-surface dark:hover:bg-card ${
                    !notification.read ? 'bg-info-light dark:bg-info-soft' : ''
                  }`}
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
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex-shrink-0">{getIcon(notification.type)}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-normal text-main sm:text-sm">
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <div className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-info"></div>
                        )}
                      </div>
                      <p className="mt-1 line-clamp-2 text-micro text-muted sm:text-xs">
                        {notification.message}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-micro text-muted sm:text-xs">
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
                          className="rounded-full p-1 text-muted transition-colors hover:bg-error-soft hover:text-error"
                          aria-label="حذف"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <Bell size={48} className="mx-auto mb-3 text-dim dark:text-main" />
                <p className="text-sm text-muted">لا توجد إشعارات</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
