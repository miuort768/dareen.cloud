import type { Dispatch, SetStateAction } from 'react'
import { Plus, BookMarked, Settings } from 'lucide-react'

interface BlogHeaderProps {
  handleOpenModal: () => void
  showSettings: boolean
  setShowSettings: Dispatch<SetStateAction<boolean>>
  libraryWhatsapp: string
  setLibraryWhatsapp: (v: string) => void
  libraryTelegram: string
  setLibraryTelegram: (v: string) => void
  savedWhatsapp?: string
  savedTelegram?: string
  savingSettings: boolean
  handleSaveSettings: () => Promise<void>
  handleCancelSettings: () => void
}

export const BlogHeader = ({
  handleOpenModal,
  showSettings,
  setShowSettings,
  libraryWhatsapp,
  setLibraryWhatsapp,
  libraryTelegram,
  setLibraryTelegram,
  savingSettings,
  handleSaveSettings,
  handleCancelSettings,
}: BlogHeaderProps) => (
  <>
    <div className="rounded-2xl border border-border bg-surface p-3 md:p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-error-soft">
            <BookMarked size={17} className="text-error" />
          </div>
          <div>
            <h1 className="text-sm font-bold leading-tight text-main">المقالات</h1>
            <p className="text-[10px] text-muted">إدارة المقالات والدروس</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowSettings((s) => !s)}
            aria-label="إعدادات المكتبة"
            aria-expanded={showSettings}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-muted transition-colors hover:bg-hover hover:text-main focus-visible:ring-2 focus-visible:ring-focus active:scale-95"
          >
            <Settings size={15} />
          </button>
          <button
            onClick={handleOpenModal}
            className="flex h-10 items-center gap-1.5 rounded-xl bg-error px-4 text-xs font-bold text-on-error transition-colors hover:bg-error-hover focus-visible:ring-2 focus-visible:ring-focus active:scale-95"
          >
            <Plus size={14} /> مقال
          </button>
        </div>
      </div>
    </div>

    {showSettings && (
      <div className="space-y-3 rounded-2xl border border-border bg-surface p-4">
        <h3 className="text-xs font-bold text-main">إعدادات المكتبة</h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label htmlFor="lib-wa" className="mb-1 block text-micro font-bold text-muted">
              رقم واتساب المكتبة
            </label>
            <input
              id="lib-wa"
              type="text"
              value={libraryWhatsapp}
              onChange={(e) => setLibraryWhatsapp(e.target.value)}
              className="h-11 w-full rounded-xl border border-border bg-background px-3.5 text-xs font-bold text-main outline-none transition-colors placeholder:text-muted focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/10"
              placeholder="مثال: 201234567890"
              dir="ltr"
            />
          </div>
          <div>
            <label htmlFor="lib-tg" className="mb-1 block text-micro font-bold text-muted">
              معرف تليجرام المكتبة
            </label>
            <input
              id="lib-tg"
              type="text"
              value={libraryTelegram}
              onChange={(e) => setLibraryTelegram(e.target.value)}
              className="h-11 w-full rounded-xl border border-border bg-background px-3.5 text-xs font-bold text-main outline-none transition-colors placeholder:text-muted focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/10"
              placeholder="مثال: dareen_app"
              dir="ltr"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={handleCancelSettings}
            className="flex h-9 items-center rounded-lg px-4 text-xs font-semibold text-muted transition-colors hover:bg-hover hover:text-main focus-visible:ring-2 focus-visible:ring-focus active:scale-95"
          >
            إلغاء
          </button>
          <button
            onClick={handleSaveSettings}
            disabled={savingSettings}
            className="flex h-9 items-center gap-1.5 rounded-lg bg-error px-4 text-xs font-semibold text-on-error transition-colors hover:bg-error-hover focus-visible:ring-2 focus-visible:ring-focus active:scale-95 disabled:opacity-50"
          >
            {savingSettings ? 'جاري الحفظ...' : 'حفظ'}
          </button>
        </div>
      </div>
    )}
  </>
)
