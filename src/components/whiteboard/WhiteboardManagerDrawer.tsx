import React, { useState, useEffect } from 'react'
import {
  FolderOpen,
  Plus,
  Trash2,
  Copy,
  Clock,
  Sparkles,
  Search,
  X,
  Check,
  Laptop,
} from 'lucide-react'
import type { WhiteboardItem } from '../../types/whiteboard'

interface WhiteboardManagerDrawerProps {
  isOpen: boolean
  onClose: () => void
  whiteboards: Array<Omit<WhiteboardItem, 'pagesData'>>
  activeBoardId: string | null
  onSelectBoard: (id: string) => void
  onCreateNew: () => void
  onDeleteBoard: (id: string) => void
  onDuplicateBoard: (id: string) => void
  loading: boolean
}

export const WhiteboardManagerDrawer: React.FC<WhiteboardManagerDrawerProps> = ({
  isOpen,
  onClose,
  whiteboards,
  activeBoardId,
  onSelectBoard,
  onCreateNew,
  onDeleteBoard,
  onDuplicateBoard,
  loading,
}) => {
  const [search, setSearch] = useState('')

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const filtered = whiteboards.filter((b) => b.title.toLowerCase().includes(search.toLowerCase()))

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="السبورات المحفوظة"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm duration-200 animate-in fade-in sm:p-6"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-border bg-surface shadow-elevation-4 duration-200 animate-in zoom-in-95"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border bg-surface p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <FolderOpen size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-main">السبورات المحفوظة</h2>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                  {whiteboards.length} سبورة
                </span>
              </div>
              <p className="text-[11px] text-muted">
                محفوظة محلياً في متصفحك لسرعة الوصول والعمل دون انقطاع
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق النافذة"
            className="flex h-8 w-8 items-center justify-center rounded-xl text-muted outline-none transition-colors hover:bg-hover hover:text-main focus-visible:ring-2 focus-visible:ring-focus"
          >
            <X size={18} />
          </button>
        </div>

        {/* Action bar: Search + Create New */}
        <div className="bg-surface-active/10 flex flex-col items-stretch gap-2.5 border-b border-border p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search size={15} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="البحث في السبورات بالاسم..."
              className="w-full rounded-xl border border-border bg-surface py-2 pe-3 ps-9 text-xs font-bold text-main placeholder-muted outline-none focus-visible:ring-2 focus-visible:ring-focus"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute end-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-main"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              onCreateNew()
              onClose()
            }}
            className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-black text-on-primary shadow-elevation-1 outline-none transition-colors hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-focus"
          >
            <Plus size={16} />
            <span>إنشاء سبورة جديدة</span>
          </button>
        </div>

        {/* Boards Grid Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted">
              <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="mt-3 text-xs font-bold">جارٍ تحميل السبورات من المتصفح...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="bg-surface-active/50 mb-3 flex h-14 w-14 items-center justify-center rounded-2xl text-muted">
                <Sparkles size={26} className="text-primary" />
              </div>
              <h3 className="text-sm font-black text-main">
                {search ? 'لم يتم العثور على سبورات تطابق البحث' : 'لا توجد سبورات محفوظة بعد'}
              </h3>
              <p className="mt-1 max-w-sm text-xs text-muted">
                {search
                  ? 'جرب البحث بكلمات أخرى أو قم بإنشاء سبورة جديدة'
                  : 'ابدأ بكتابة وشرح درسك واضغط "حفظ" للاحتفاظ بكل صفحات السبورة في متصفحك والعودة إليها بأي وقت.'}
              </p>
              {!search && (
                <button
                  type="button"
                  onClick={() => {
                    onCreateNew()
                    onClose()
                  }}
                  className="mt-4 flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-black text-on-primary shadow-elevation-1 hover:bg-primary-hover"
                >
                  <Plus size={15} />
                  <span>بدء سبورة جديدة الآن</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {filtered.map((board) => {
                const isActive = board.id === activeBoardId
                const dateStr = board.updatedAt
                  ? new Date(board.updatedAt).toLocaleDateString('ar-EG', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : ''

                return (
                  <div
                    key={board.id}
                    onClick={() => {
                      onSelectBoard(board.id)
                      onClose()
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        onSelectBoard(board.id)
                        onClose()
                      }
                    }}
                    className={`group relative flex cursor-pointer flex-col justify-between rounded-2xl border p-3.5 text-start outline-none transition-all focus-visible:ring-2 focus-visible:ring-focus ${
                      isActive
                        ? 'border-primary bg-primary/5 shadow-elevation-2 ring-1 ring-primary/30'
                        : 'border-border bg-surface hover:border-primary/50 hover:shadow-elevation-2'
                    }`}
                  >
                    <div>
                      {/* Top row in card: active badge & title */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex min-w-0 flex-1 items-center gap-2">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Laptop size={18} />
                          </div>
                          <h4 className="truncate text-xs font-black text-main">{board.title}</h4>
                        </div>
                        {isActive && (
                          <span className="flex shrink-0 items-center gap-1 rounded-lg bg-primary/10 px-2 py-0.5 text-[10px] font-black text-primary">
                            <Check size={11} />
                            النشطة
                          </span>
                        )}
                      </div>

                      {/* Date */}
                      {dateStr && (
                        <p className="mt-2.5 flex items-center gap-1.5 text-[10px] text-muted">
                          <Clock size={12} className="text-muted" />
                          <span>آخر تعديل: {dateStr}</span>
                        </p>
                      )}
                    </div>

                    {/* Bottom Action row */}
                    <div className="border-border/60 mt-3.5 flex items-center justify-between border-t pt-2.5">
                      <span className="text-[11px] font-bold text-primary group-hover:underline">
                        فتح واستكمال الشرح ←
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          title="إنشاء نسخة مكررة من هذه السبورة"
                          onClick={(e) => {
                            e.stopPropagation()
                            onDuplicateBoard(board.id)
                          }}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-muted transition-colors hover:bg-hover hover:text-main focus-visible:ring-2 focus-visible:ring-focus"
                        >
                          <Copy size={13} />
                        </button>
                        <button
                          type="button"
                          title="حذف هذه السبورة نهائياً"
                          onClick={(e) => {
                            e.stopPropagation()
                            onDeleteBoard(board.id)
                          }}
                          className="hover:bg-error/10 flex h-7 w-7 items-center justify-center rounded-lg text-muted transition-colors hover:text-error focus-visible:ring-2 focus-visible:ring-focus"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-surface-active/20 flex items-center justify-between border-t border-border px-4 py-3 text-[11px] text-muted">
          <span>💡 تحفظ السبورات في متصفحك الحالي وتعمل بالكامل بدون إنترنت</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border bg-surface px-3 py-1 text-xs font-bold text-main hover:bg-hover"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  )
}
