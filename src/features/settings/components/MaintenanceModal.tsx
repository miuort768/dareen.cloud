import { Snowflake, Lock, Activity } from 'lucide-react';

interface MaintenanceModalProps {
    showMaintenanceModal: boolean;
    setShowMaintenanceModal: (v: boolean) => void;
    setMaintenanceMode: (v: boolean) => Promise<void> | void;
    showNotify: (msg: string) => void;
}

export const MaintenanceModal = ({ showMaintenanceModal, setShowMaintenanceModal, setMaintenanceMode, showNotify }: MaintenanceModalProps) => {
    if (!showMaintenanceModal) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/30 animate-in fade-in">
            <div className="bg-card border-2 border-warning max-w-md w-full shadow-lg p-0 overflow-hidden">
                <div className="bg-warning p-6 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-white/15 flex items-center justify-center text-on-warning mb-3">
                        <Snowflake size={32} className="animate-spin-slow" />
                    </div>
                    <h3 className="text-xl font-bold text-on-warning uppercase tracking-tighter">وضع الصيانة الشامل</h3>
                    <p className="text-micro text-on-warning/80 font-bold uppercase tracking-widest mt-1">بروتوكول تجميد النظام</p>
                </div>

                <div className="p-6 space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="w-9 h-9 flex items-center justify-center shrink-0 border border-border bg-warning-soft text-warning">
                                <Lock size={16} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-main uppercase">تعطيل الدخول</p>
                                <p className="text-micro text-muted">سيتم منع كافة الطلاب والمعلمين من تسجيل الدخول فوراً.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-9 h-9 flex items-center justify-center shrink-0 border border-border bg-error-soft text-error">
                                <Activity size={16} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-main uppercase">إنهاء الجلسات</p>
                                <p className="text-micro text-muted">سيتم تسجيل خروج كافة المستخدمين المتصلين حالياً.</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={() => setShowMaintenanceModal(false)}
                            className="flex-1 py-3 border border-border text-muted text-xs font-bold uppercase tracking-widest hover:bg-hover transition-all shadow-soft active:scale-95"
                        >
                            إلغاء الأمر
                        </button>
                        <button
                            onClick={() => {
                                setMaintenanceMode(true).then(() => {
                                    setShowMaintenanceModal(false);
                                    showNotify('تم تفعيل وضع الصيانة بنجاح');
                                });
                            }}
                            className="flex-1 py-3 bg-warning text-on-warning text-xs font-bold uppercase tracking-widest hover:brightness-90 transition-all shadow-soft active:scale-95"
                        >
                            تأكيد التجميد
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};