import { Megaphone, X, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

type AnnouncementType = 'general' | 'urgent' | 'holiday' | 'event';

interface AnnouncementFormModalProps {
    isOpen: boolean;
    editingAnnouncement: { id: string } | null;
    formData: { title: string; content: string; type: AnnouncementType; isActive: boolean };
    onChange: (data: Partial<{ title: string; content: string; type: AnnouncementType; isActive: boolean }>) => void;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
}

export const AnnouncementFormModal = ({ isOpen, editingAnnouncement, formData, onChange, onClose, onSubmit }: AnnouncementFormModalProps) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="relative w-full max-w-lg bg-card border border-border rounded-2xl">
                <div className="p-5 bg-primary text-on-primary flex items-center justify-between rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <Megaphone size={18} className="text-on-primary/70" />
                        <h3 className="font-bold text-xs">{editingAnnouncement ? 'تعديل الإعلان الحالي' : 'إضافة إعلان جديد'}</h3>
                    </div>
                    <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-xl bg-white/10 hover:bg-error transition-all" aria-label="إغلاق"><X size={16} /></button>
                </div>
                <form onSubmit={onSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="block text-micro font-bold text-muted mb-1.5">عنوان الإعلان / النبأ</label>
                        <input required type="text" value={formData.title} onChange={(e) => onChange({ title: e.target.value })}
                            className="w-full px-4 py-3 bg-surface border border-border font-bold text-xs rounded-xl outline-none focus:outline-none focus:ring-2 focus:ring-focus text-main transition-all placeholder:text-muted"
                            placeholder="أدخل عنوان الإعلان..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-micro font-bold text-muted mb-1.5">نوع الإعلان</label>
                            <select value={formData.type} onChange={(e) => onChange({ type: e.target.value as AnnouncementType })}
                                aria-label="نوع الإعلان"
                                className="w-full px-4 py-3 bg-surface border border-border font-bold text-xs rounded-xl outline-none focus:outline-none focus:ring-2 focus:ring-focus text-main transition-all cursor-pointer">
                                <option value="general">عام</option>
                                <option value="urgent">عاجل</option>
                                <option value="holiday">إجازة</option>
                                <option value="event">فعالية</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-micro font-bold text-muted mb-1.5">حالة النشر</label>
                            <div className="flex gap-1 h-11">
                                <button type="button" onClick={() => onChange({ isActive: true })}
                                    className={cn("flex-1 font-bold text-micro rounded-xl transition-all active:scale-95", formData.isActive ? "bg-success text-on-success" : "bg-surface text-muted")}>
                                    نشط
                                </button>
                                <button type="button" onClick={() => onChange({ isActive: false })}
                                    className={cn("flex-1 font-bold text-micro rounded-xl transition-all active:scale-95", !formData.isActive ? "bg-warning text-on-warning" : "bg-surface text-muted")}>
                                    مخفي
                                </button>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-micro font-bold text-muted mb-1.5">محتوى الإعلان</label>
                        <textarea required rows={4} value={formData.content} onChange={(e) => onChange({ content: e.target.value })}
                            className="w-full px-4 py-3 bg-surface border border-border font-bold text-xs rounded-xl outline-none focus:outline-none focus:ring-2 focus:ring-focus text-main transition-all leading-relaxed resize-none placeholder:text-muted"
                            placeholder="أكتب محتوى الإعلان هنا..." />
                    </div>
                    <button type="submit"
                        className="w-full py-3.5 bg-primary text-on-primary font-bold text-xs hover:bg-primary-hover transition-all flex items-center justify-center gap-2 active:scale-95 rounded-xl">
                        <CheckCircle2 size={16} />
                        {editingAnnouncement ? 'حفظ التعديلات' : 'نشر الإعلان'}
                    </button>
                </form>
            </div>
        </div>
    );
};
