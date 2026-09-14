import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { sendNativeNotification } from '../lib/notificationUtils'
import type { ToastProps } from '../components/ui/Toast'

interface UIState {
  toasts: ToastProps[]
  sidebarCollapsed: boolean
  showNotification: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void
  removeToast: (id: string) => void
  setSidebarCollapsed: (collapsed: boolean) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      toasts: [],
      sidebarCollapsed: true,

      showNotification: (message, type = 'success') => {
        const id = Math.random().toString(36).substring(2, 11) + Date.now().toString(36)

        const newToast: ToastProps = {
          id,
          message,
          type,
          onClose: (toastId) => get().removeToast(toastId),
        }

        set((state) => ({ toasts: [...state.toasts, newToast] }))

        // Send a native desktop notification
        sendNativeNotification(type === 'error' ? 'تنبيه خطأ' : 'إشعار جديد', {
          body: message,
          tag: id,
        })

        // Auto remove toast after 5 seconds
        setTimeout(() => {
          if (get().toasts.some((t) => t.id === id)) {
            get().removeToast(id)
          }
        }, 5000)
      },

      removeToast: (id) => {
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
      },

      setSidebarCollapsed: (collapsed) => {
        set({ sidebarCollapsed: collapsed })
      },
    }),
    {
      name: 'darin-ui',
      partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed }),
    },
  ),
)
