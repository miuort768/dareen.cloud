import { Plus, BookOpen, Settings, X } from 'lucide-react';

interface BlogHeaderProps {
    handleOpenModal: () => void;
    showSettings: boolean;
    setShowSettings: (v: boolean) => void;
    libraryWhatsapp: string;
    setLibraryWhatsapp: (v: string) => void;
    libraryTelegram: string;
    setLibraryTelegram: (v: string) => void;
    savedWhatsapp: string;
    savedTelegram: string;
    savingSettings: boolean;
    handleSaveSettings: () => Promise<void>;
    handleCancelSettings: () => void;
}

export const BlogHeader = ({
    handleOpenModal, showSettings, setShowSettings,
    libraryWhatsapp, setLibraryWhatsapp, libraryTelegram, setLibraryTelegram,
    savedWhatsapp, savedTelegram, savingSettings, handleSaveSettings, handleCancelSettings
}: BlogHeaderProps) => (
    <>
        <div className="bg-card rounded-2xl shadow-sm border border-border px-4 md:px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-error-soft text-error flex items-center justify-center shrink-0">
                    <BookOpen size={22} />
                </div>
                <div>
                    <h1 className="text-lg md:text-xl font-black text-main leading-tight">المقالات التعليمية</h1>
                    <p className="text-xs font-bold text-muted mt-0.5">إدارة وإضافة المقالات والدروس على المنصة</p>
                </div>
            </div>
            <button onClick={handleOpenModal}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-error text-on-error font-bold rounded-xl hover:bg-error-hover transition-all shadow-sm active:scale-95">
                <Plus size={18} />
                <span className="text-xs">إضافة مقال</span>
            </button>
        </div>

        <button onClick={() => setShowSettings(s => !s)}
            className="flex items-center gap-2 px-4 py-2.5 bg-surface dark:bg-card text-muted font-bold rounded-xl hover:bg-hover transition-all text-xs">
            <Settings size={14} />
            <span>إعدادات المكتبة</span>
        </button>

        {showSettings && (
            <div className="bg-card p-5 border border-border shadow-sm rounded-2xl space-y-4">
                <h3 className="font-black text-sm text-main">إعدادات صفحة المكتبة</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-micro font-bold text-muted mb-1.5">رقم واتساب المكتبة</label>
                        <input type="text" value={libraryWhatsapp}
                            onChange={(e) => setLibraryWhatsapp(e.target.value)}
                            className="w-full bg-surface dark:bg-card border border-border px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-focus font-bold text-sm rounded-xl outline-none"
                            placeholder="مثال: 201234567890" dir="ltr" />
                    </div>
                    <div>
                        <label className="block text-micro font-bold text-muted mb-1.5">معرف تليجرام المكتبة</label>
                        <input type="text" value={libraryTelegram}
                            onChange={(e) => setLibraryTelegram(e.target.value)}
                            className="w-full bg-surface dark:bg-card border border-border px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-focus font-bold text-sm rounded-xl outline-none"
                            placeholder="مثال: dareen_app" dir="ltr" />
                    </div>
                </div>
                <div className="flex justify-end gap-3">
                    <button onClick={handleCancelSettings}
                        className="px-4 py-2 font-bold text-muted hover:text-main transition-all rounded-xl text-xs">إلغاء</button>
                    <button onClick={handleSaveSettings} disabled={savingSettings}
                        className="px-5 py-2 bg-error text-on-error font-bold hover:bg-error-hover transition-all disabled:opacity-50 rounded-xl text-xs">
                        {savingSettings ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
                    </button>
                </div>
            </div>
        )}
    </>
);
