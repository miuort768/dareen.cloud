import { Plus, BookMarked, Settings } from 'lucide-react'

interface BlogHeaderProps {
  handleOpenModal: () => void
  showSettings: boolean
  setShowSettings: (v: boolean) => void
  libraryWhatsapp: string
  setLibraryWhatsapp: (v: string) => void
  libraryTelegram: string
  setLibraryTelegram: (v: string) => void
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
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted transition-all duration-200 hover:bg-hover hover:text-main active:scale-95"
          >
            <Settings size={13} />
          </button>
          <button
            onClick={handleOpenModal}
            className="flex h-9 items-center gap-1 rounded-lg bg-error px-3 text-[11px] font-semibold text-on-error transition-all duration-200 hover:bg-error-hover hover:shadow-sm active:scale-95"
          >
            <Plus size={13} /> مقال
          </button>
        </div>
      </div>
    </div>

    {showSettings && (
      <div className="mx-2 space-y-3 rounded-2xl border border-border bg-surface p-4">
        <h3 className="text-xs font-bold text-main">إعدادات المكتبة</h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-[10px] font-bold text-muted">
              رقم واتساب المكتبة
            </label>
            <input
              type="text"
              value={libraryWhatsapp}
              onChange={(e) => setLibraryWhatsapp(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-bold focus:border-primary focus:outline-none"
              placeholder="مثال: 201234567890"
              dir="ltr"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-bold text-muted">
              معرف تليجرام المكتبة
            </label>
            <input
              type="text"
              value={libraryTelegram}
              onChange={(e) => setLibraryTelegram(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-bold focus:border-primary focus:outline-none"
              placeholder="مثال: dareen_app"
              dir="ltr"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={handleCancelSettings}
            className="rounded-lg px-3 py-1.5 text-[10px] font-semibold text-muted transition-all duration-200 hover:text-main active:scale-95"
          >
            إلغاء
          </button>
          <button
            onClick={handleSaveSettings}
            disabled={savingSettings}
            className="rounded-lg bg-error px-4 py-1.5 text-[10px] font-semibold text-on-error transition-all duration-200 hover:bg-error-hover active:scale-95 disabled:opacity-50"
          >
            {savingSettings ? 'جاري الحفظ...' : 'حفظ'}
          </button>
        </div>
      </div>
    )}
  </>
)
