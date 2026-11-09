import React, { useState } from 'react'
import { FolderOpen, Plus, Trash2, Copy, Clock, Sparkles, Layers, Search } from 'lucide-react'
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

  if (!isOpen) return null

  const filtered = whiteboards.filter((b) => b.title.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="animate-fade-in fixed inset-0 z-50 flex bg-black/40 backdrop-blur-sm">
      <div className="animate-slide-in-right flex h-full w-full max-w-md flex-col border-e border-border bg-surface shadow-elevation-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-2">
            <FolderOpen className="text-primary" size={20} />
            <h2 className="text-base font-black text-main">السبورات المحفوظة</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted hover:bg-hover hover:text-main"
          >
            ✕
          </button>
        </div>

        {/* Action bar: Search + Create */}
        <div className="space-y-3 border-b border-border p-4">
          <button
            type="button"
            onClick={() => {
              onCreateNew()
              onClose()
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-black text-on-primary shadow-elevation-2 transition-colors hover:bg-primary-hover"
          >
            <Plus size={16} />
            <span>إنشاء سبورة جديدة</span>
          </button>

          <div className="relative">
            <Search size={15} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="البحث في السبورات..."
              className="bg-surface-active/30 w-full rounded-xl border border-border py-2 pe-3 ps-9 text-xs text-main placeholder-muted outline-none focus-visible:ring-2 focus-visible:ring-focus"
            />
          </div>
        </div>

        {/* List of boards */}
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted">
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="mt-2 text-xs font-bold">جارٍ تحميل السبورات...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted">
              <Sparkles size={32} className="text-muted/60 mb-2" />
              <p className="text-xs font-bold text-main">لا توجد سبورات محفوظة</p>
              <p className="mt-1 text-[11px] text-muted">
                ابدأ بالشرح واضغط "حفظ" للاحتفاظ بكل أعمالك ومشاركتها لاحقاً.
              </p>
            </div>
          ) : (
            filtered.map((board) => {
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
                  className={`group flex cursor-pointer items-start gap-3 rounded-2xl border p-3 transition-all ${
                    isActive
                      ? 'border-primary bg-primary/5 shadow-elevation-2'
                      : 'border-border bg-surface hover:border-primary/40'
                  }`}
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Layers size={22} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="truncate text-xs font-black text-main">{board.title}</h4>
                      {isActive && (
                        <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-primary">
                          النشطة
                        </span>
                      )}
                    </div>
                    {dateStr && (
                      <p className="mt-1 flex items-center gap-1 text-[10px] text-muted">
                        <Clock size={11} /> {dateStr}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      title="نسخ السبورة"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDuplicateBoard(board.id)
                      }}
                      className="rounded-lg p-1.5 text-muted hover:bg-hover hover:text-main"
                    >
                      <Copy size={14} />
                    </button>
                    <button
                      type="button"
                      title="حذف السبورة"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteBoard(board.id)
                      }}
                      className="hover:bg-error/10 rounded-lg p-1.5 text-error hover:text-error-hover"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
