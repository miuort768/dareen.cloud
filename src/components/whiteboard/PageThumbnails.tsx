import React from 'react'
import { Plus, Trash2, Copy } from 'lucide-react'
import type { WhiteboardPage } from '../../types/whiteboard'

interface PageThumbnailsProps {
  pages: WhiteboardPage[]
  activePageIndex: number
  onSelectPage: (index: number) => void
  onAddPage: () => void
  onDeletePage: (index: number) => void
  onDuplicatePage: (index: number) => void
}

export const PageThumbnails: React.FC<PageThumbnailsProps> = ({
  pages,
  activePageIndex,
  onSelectPage,
  onAddPage,
  onDeletePage,
  onDuplicatePage,
}) => {
  return (
    <aside className="bg-surface/50 hidden w-44 flex-col border-s border-border backdrop-blur-sm lg:flex">
      <div className="flex items-center justify-between border-b border-border p-3">
        <span className="text-xs font-bold text-main">الصفحات ({pages.length})</span>
        <button
          type="button"
          onClick={onAddPage}
          title="إضافة صفحة جديدة"
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-on-primary shadow-elevation-1 transition-colors hover:bg-primary-hover"
        >
          <Plus size={14} />
        </button>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-2">
        {pages.map((p, idx) => {
          const isActive = idx === activePageIndex
          return (
            <div
              key={p.id}
              onClick={() => onSelectPage(idx)}
              className={`group relative flex cursor-pointer flex-col rounded-xl border p-2 transition-all ${
                isActive
                  ? 'border-primary bg-primary/5 shadow-elevation-2 ring-1 ring-primary'
                  : 'border-border bg-surface hover:border-primary/40'
              }`}
            >
              {/* Mini canvas preview representation */}
              <div
                className={`relative flex h-20 w-full items-center justify-center overflow-hidden rounded-lg border border-border text-[10px] text-muted ${
                  p.background === 'black' ? 'bg-slate-900 text-slate-400' : 'bg-surface'
                }`}
              >
                <span>صفحة {idx + 1}</span>
                <span className="absolute bottom-1 end-1 font-mono text-[9px] opacity-60">
                  {p.elements.length} عناصر
                </span>
              </div>

              {/* Actions row */}
              <div className="mt-1.5 flex items-center justify-between text-xs text-muted">
                <span className="text-[11px] font-bold text-main">#{idx + 1}</span>
                <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    title="تكرار الصفحة"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDuplicatePage(idx)
                    }}
                    className="rounded p-1 text-muted hover:bg-hover hover:text-main"
                  >
                    <Copy size={12} />
                  </button>
                  {pages.length > 1 && (
                    <button
                      type="button"
                      title="حذف الصفحة"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeletePage(idx)
                      }}
                      className="hover:bg-error/10 rounded p-1 text-error hover:text-error-hover"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </aside>
  )
}
