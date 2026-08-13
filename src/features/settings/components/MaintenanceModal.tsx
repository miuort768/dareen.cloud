import { useState } from 'react';
import { Wrench, Lock, Users, ShieldCheck, Snowflake } from 'lucide-react';
import { Image } from '../../../shared/components/ui';
import { cn } from '../../../lib/utils';

interface MaintenanceModalProps {
    showMaintenanceModal: boolean;
    setShowMaintenanceModal: (v: boolean) => void;
    maintenanceTarget: boolean;
    setMaintenanceTarget: (v: boolean) => void;
    setMaintenanceMode: (v: boolean) => Promise<void> | void;
    showNotify: (msg: string) => void;
}

const CONFIRM_WORD = 'dareen';

export const MaintenanceModal = ({ showMaintenanceModal, setShowMaintenanceModal, maintenanceTarget, setMaintenanceTarget, setMaintenanceMode, showNotify }: MaintenanceModalProps) => {
    const [input, setInput] = useState('');

    if (!showMaintenanceModal) return null;

    const isEnabled = maintenanceTarget;
    const handleConfirm = () => {
        setMaintenanceMode(isEnabled).then(() => {
            setShowMaintenanceModal(false);
            setInput('');
            setMaintenanceTarget(isEnabled);
            showNotify(isEnabled ? 'تم تفعيل وضع الصيانة' : 'تم إيقاف وضع الصيانة');
        });
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 animate-in fade-in" dir="rtl">
            <div className="bg-card border border-border max-w-md w-full shadow-lg overflow-hidden rounded-2xl">
                <div className="p-6 text-center space-y-4 border-b border-border/20">
                    <div className="w-16 h-16 mx-auto bg-primary-soft flex items-center justify-center rounded-2xl">
                        <Image src="/dareen_logo_new.webp" alt="دارين" className="w-11 h-11" imgClassName="object-contain" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-main">
                            {isEnabled ? 'تفعيل وضع الصيانة' : 'إيقاف وضع الصيانة'}
                        </h3>
                        <p className="text-xs text-muted mt-1 leading-relaxed">
                            {isEnabled
                                ? 'سيتم منع جميع الطلاب والمعلمين وأولياء الأمور من تسجيل الدخول حتى يتم إيقاف الوضع.'
                                : 'سيتم السماح للمستخدمين بتسجيل الدخول والاستخدام الطبيعي للمنصة من جديد.'}
                        </p>
                    </div>
                </div>

                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col items-center gap-2 p-4 bg-background border border-border/20 rounded-xl">
                            <div className="w-9 h-9 rounded-lg bg-error-soft text-error flex items-center justify-center">
                                <Lock size={16} />
                            </div>
                            <p className="text-[11px] font-bold text-main">{isEnabled ? 'تعطيل الدخول' : 'السماح بالدخول'}</p>
                        </div>
                        <div className="flex flex-col items-center gap-2 p-4 bg-background border border-border/20 rounded-xl">
                            <div className="w-9 h-9 rounded-lg bg-warning-soft text-warning flex items-center justify-center">
                                <Users size={16} />
                            </div>
                            <p className="text-[11px] font-bold text-main">{isEnabled ? 'جلسات نشطة ستُنهى' : 'جلسات المستخدمين تعود للعمل'}</p>
                        </div>
                    </div>

                    <div className="p-4 bg-surface border border-border/20 rounded-xl space-y-3">
                        <p className="text-xs font-bold text-muted flex items-center gap-1.5">
                            <ShieldCheck size={13} className="text-primary" />
                            اكتب <span dir="ltr" className="font-mono text-primary select-all">{CONFIRM_WORD}</span> للتأكيد
                        </p>
                        <input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder="اكتب dareen..."
                            dir="ltr"
                            className="w-full bg-background border border-border/30 px-4 py-3 text-sm font-bold text-main text-center focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-200 rounded-xl placeholder:text-muted/50 font-mono"
                        />
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => { setShowMaintenanceModal(false); setInput(''); }}
                            className="flex-1 py-3 border border-border/30 text-muted text-xs font-bold hover:bg-surface hover:text-main rounded-xl transition-all active:scale-[0.97]"
                        >
                            تراجع
                        </button>
                        <button
                            disabled={input.trim().toLowerCase() !== CONFIRM_WORD}
                            onClick={handleConfirm}
                            className={cn(
                                'flex-1 py-3 text-xs font-bold rounded-xl transition-all active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5',
                                isEnabled
                                    ? 'bg-error hover:bg-error-hover text-on-error'
                                    : 'bg-primary hover:bg-primary-hover text-on-primary'
                            )}
                        >
                            <Snowflake size={13} className={cn(isEnabled && 'animate-spin-slow')} />
                            {isEnabled ? 'تأكيد التفعيل' : 'تأكيد الإيقاف'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
