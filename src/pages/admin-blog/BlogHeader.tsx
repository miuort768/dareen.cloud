import { Plus, BookOpen, Settings } from 'lucide-react';

interface BlogHeaderProps {
    handleOpenModal: () => void;
    showSettings: boolean;
    setShowSettings: (v: boolean) => void;
    libraryWhatsapp: string;
    setLibraryWhatsapp: (v: string) => void;
    libraryTelegram: string;
    setLibraryTelegram: (v: string) => void;
    savingSettings: boolean;
    handleSaveSettings: () => Promise<void>;
    handleCancelSettings: () => void;
}

export const BlogHeader = ({
    handleOpenModal, showSettings, setShowSettings,
    libraryWhatsapp, setLibraryWhatsapp, libraryTelegram, setLibraryTelegram,
    savingSettings, handleSaveSettings, handleCancelSettings
}: BlogHeaderProps) => (
    <>
        <div className="bg-surface border border-border rounded-2xl p-3 md:p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-error-soft flex items-center justify-center">
                        <BookOpen size={17} className="text-error" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-main leading-tight">المقالات</h1>
                        <p className="text-[10px] text-muted">إدارة المقالات والدروس</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5">
                    <button onClick={() => setShowSettings(s => !s)}
                        className="w-8 h-8 flex items-center justify-center bg-surface border border-border rounded-lg text-muted hover:text-main transition-all">
                        <Settings size={13} />
                    </button>
                    <button onClick={handleOpenModal}
                        className="flex items-center gap-1 h-8 px-2.5 bg-error text-on-error text-[10px] font-bold rounded-lg active:scale-95 transition-transform">
                        <Plus size={11} /> مقال
                    </button>
                </div>
            </div>
        </div>

        {showSettings && (
            <div className="bg-surface border border-border p-4 rounded-2xl space-y-3 mx-2">
                <h3 className="font-bold text-xs text-main">إعدادات المكتبة</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                        <label className="block text-[10px] font-bold text-muted mb-1">رقم واتساب المكتبة</label>
                        <input type="text" value={libraryWhatsapp}
                            onChange={(e) => setLibraryWhatsapp(e.target.value)}
                            className="w-full bg-background border border-border px-3 py-2 focus:outline-none focus:border-primary font-bold text-xs rounded-lg"
                            placeholder="مثال: 201234567890" dir="ltr" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-muted mb-1">معرف تليجرام المكتبة</label>
                        <input type="text" value={libraryTelegram}
                            onChange={(e) => setLibraryTelegram(e.target.value)}
                            className="w-full bg-background border border-border px-3 py-2 focus:outline-none focus:border-primary font-bold text-xs rounded-lg"
                            placeholder="مثال: dareen_app" dir="ltr" />
                    </div>
                </div>
                <div className="flex justify-end gap-2">
                    <button onClick={handleCancelSettings}
                        className="px-3 py-1.5 font-bold text-muted hover:text-main transition-all rounded-lg text-[10px]">إلغاء</button>
                    <button onClick={handleSaveSettings} disabled={savingSettings}
                        className="px-4 py-1.5 bg-error text-on-error font-bold hover:bg-error-hover transition-all disabled:opacity-50 rounded-lg text-[10px]">
                        {savingSettings ? 'جاري الحفظ...' : 'حفظ'}
                    </button>
                </div>
            </div>
        )}
    </>
);
