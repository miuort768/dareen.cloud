import { useEffect, useRef } from 'react'
import { Plus, X, Sparkles, ShieldCheck, ChevronDown } from 'lucide-react'
import type { NewTaskDraft } from './Tasks'

interface TaskFormModalProps {
  data: NewTaskDraft
  onChange: (data: NewTaskDraft) => void
  onSubmit: (e: React.FormEvent) => void
  onClose: () => void
}

export const TaskFormModal = ({ data, onChange, onSubmit, onClose }: TaskFormModalProps) => {
  const titleRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    titleRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="إنشاء مهمة جديدة"
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 p-4 duration-300 animate-in fade-in"
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <div className="flex items-center justify-between border-b border-primary-hover bg-primary p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/15">
              <Plus size={16} className="text-on-primary" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-on-primary">إنشاء مهمة جديدة</h3>
              <p className="text-micro font-bold uppercase tracking-wider text-white/70">
                إضافة مهمة إلى القائمة
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="إغلاق النافذة"
            className="rounded-2xl bg-white/15 p-3 text-on-primary transition-colors hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            <X size={22} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 p-5">
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label
                htmlFor="task-title"
                className="flex items-center gap-1.5 text-micro font-bold uppercase tracking-wider text-dim dark:text-muted"
              >
                <Sparkles size={10} className="text-primary" /> عنوان المهمة
              </label>
              <input
                ref={titleRef}
                id="task-title"
                required
                type="text"
                className="w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-xs font-bold text-main transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                value={data.title}
                onChange={(e) => onChange({ ...data, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label
                  htmlFor="task-priority"
                  className="text-micro font-bold uppercase tracking-wider text-dim dark:text-muted"
                >
                  درجة الأولوية
                </label>
                <div className="relative">
                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-muted"
                  />
                  <select
                    id="task-priority"
                    className="w-full cursor-pointer appearance-none rounded-2xl border border-border bg-background py-2.5 pe-4 ps-8 text-xs font-bold text-main focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                    aria-label="درجة الأولوية"
                    value={data.priority}
                    onChange={(e) =>
                      onChange({ ...data, priority: e.target.value as NewTaskDraft['priority'] })
                    }
                  >
                    <option value="low">منخفضة</option>
                    <option value="medium">متوسطة</option>
                    <option value="high">عالية</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="task-due"
                  className="text-micro font-bold uppercase tracking-wider text-dim dark:text-muted"
                >
                  تاريخ التسليم
                </label>
                <input
                  id="task-due"
                  type="date"
                  className="w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-xs font-bold text-main focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                  value={data.dueDate}
                  onChange={(e) => onChange({ ...data, dueDate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="task-desc"
                className="flex items-center gap-1.5 text-micro font-bold uppercase tracking-wider text-dim dark:text-muted"
              >
                <ShieldCheck size={10} className="text-primary" /> وصف المهمة
              </label>
              <textarea
                id="task-desc"
                className="h-24 w-full resize-none rounded-2xl border border-border bg-background px-4 py-2.5 text-xs font-bold text-main focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                value={data.description}
                onChange={(e) => onChange({ ...data, description: e.target.value })}
              ></textarea>
            </div>
          </div>

          <button
            type="submit"
            disabled={!data.title.trim()}
            className="w-full rounded-2xl bg-primary py-3 text-xs font-bold uppercase tracking-wider text-on-primary shadow-sm transition-all hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98] disabled:opacity-50"
          >
            إنشاء مهمة جديدة
          </button>
        </form>
      </div>
    </div>
  )
}
