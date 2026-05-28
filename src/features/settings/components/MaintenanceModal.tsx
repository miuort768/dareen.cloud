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
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4  bg-slate-950/40 animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 border-2 border-amber-500 max-w-md w-full shadow-lg p-0 overflow-hidden">
                <div className="bg-amber-500 p-6 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-white/15 flex items-center justify-center text-white mb-3">
                        <Snowflake size={32} className="animate-spin-slow" />
                    </div>
                    <h3 className="text-xl font-bold text-white uppercase tracking-tighter">وضع الصيانة الشامل</h3>
                    <p className="text-[10px] text-white/80 font-bold uppercase tracking-widest mt-1">System Freeze Protocol</p>
                </div>

                <div className="p-6 space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="w-9 h-9 flex items-center justify-center shrink-0 border border-amber-200/50 dark:border-amber-800/50" style={{ backgroundColor: '#D9770612', color: '#D97706' }}>
                                <Lock size={16} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-800 dark:text-white uppercase">تعطيل الدخول</p>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400">سيتم منع كافة الطلاب والمعلمين من تسجيل الدخول فوراً.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-9 h-9 flex items-center justify-center shrink-0 border border-rose-200/50 dark:border-rose-800/50" style={{ backgroundColor: '#F43F5E12', color: '#F43F5E' }}>
                                <Activity size={16} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-800 dark:text-white uppercase">إنهاء الجلسات</p>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400">سيتم تسجيل خروج كافة المستخدمين المتصلين حالياً.</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={() => setShowMaintenanceModal(false)}
                            className="flex-1 py-3 border border-slate-100/50 dark:border-slate-800/50 text-slate-600 dark:text-slate-400 text-[11px] font-bold uppercase tracking-widest hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-all shadow-sm active:scale-95"
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
                            className="flex-1 py-3 bg-amber-500 text-white text-[11px] font-bold uppercase tracking-widest hover:bg-amber-600 transition-all shadow-sm active:scale-95"
                        >
                            تأكيد التجميد
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};