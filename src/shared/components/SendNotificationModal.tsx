import React, { useState } from 'react'
import { X, Send, Bell } from 'lucide-react'
import { Button } from '../components/ui/Button'

interface SendNotificationModalProps {
  isOpen: boolean
  onClose: () => void
  onSend: (message: string) => void
  recipientName: string
}

export const SendNotificationModal: React.FC<SendNotificationModalProps> = ({
  isOpen,
  onClose,
  onSend,
  recipientName,
}) => {
  const [message, setMessage] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim()) {
      onSend(message)
      setMessage('')
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      dir="rtl"
      role="dialog"
      aria-modal="true"
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose()
      }}
    >
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm duration-200 animate-in fade-in"
        onClick={onClose}
      ></div>

      <div className="relative w-full max-w-md overflow-hidden rounded-none border-2 border-primary/50 bg-card shadow-elevation-3 duration-200 animate-in zoom-in-95 dark:bg-card">
        {/* Accent bar */}
        <div className="h-1 w-full bg-primary"></div>

        <div className="p-6">
          {/* Header */}
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 dark:bg-primary/15">
                <Bell size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-main">بث إشعار فوري</h3>
                <p className="text-[11px] text-muted">
                  إلى: <span className="font-bold text-primary">{recipientName}</span>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-all hover:bg-hover hover:text-main"
              aria-label="إغلاق"
            >
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Message */}
            <div className="space-y-1.5">
              <label htmlFor="notification-message" className="text-[11px] font-bold text-muted">
                محتوى التنبيه
              </label>
              <textarea
                id="notification-message"
                required
                autoFocus
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="اكتب رسالتك هنا..."
                className="h-28 w-full resize-none rounded-xl border border-border bg-surface p-3 text-xs font-medium leading-relaxed outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary/20 dark:bg-hover dark:text-main"
              />
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-2.5">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={!message.trim()}
                rightIcon={<Send size={16} />}
              >
                إرسال التنبيه الآن
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="lg"
                className="w-full"
                onClick={onClose}
              >
                إلغاء
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
