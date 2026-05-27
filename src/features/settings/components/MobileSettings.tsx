import { Zap, Smartphone } from 'lucide-react';
import { triggerHaptic } from '../../../lib/haptics';
import { SectionCard, SectionTitle, ToggleRow } from './SettingsUI';

interface MobileSettingsProps {
    hapticEnabled: boolean;
    setHapticEnabled: (v: boolean) => void;
    showNotify: (msg: string) => void;
}

export const MobileSettings = ({ hapticEnabled, setHapticEnabled, showNotify }: MobileSettingsProps) => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard>
            <SectionTitle icon={Smartphone} label="تخصيص تجربة الموبايل" sub="Mobile App Experience" />
            <div className="space-y-4">
                <ToggleRow
                    icon={Zap}
                    label="الاهتزاز التفاعلي (Haptics)"
                    sub="ردود فعل لمسية عند الضغط على الأزرار"
                    checked={hapticEnabled}
                    onChange={() => {
                        const newVal = !hapticEnabled;
                        setHapticEnabled(newVal);
                        localStorage.setItem('haptic_enabled', String(newVal));
                        if (newVal) triggerHaptic('light');
                        showNotify(newVal ? 'تم تفعيل الاهتزاز' : 'تم إيقاف الاهتزاز');
                    }}
                />
                <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border-r-4 border-blue-500 rounded-xl">
                    <h4 className="text-xs font-medium text-blue-800 dark:text-blue-300 mb-1">لماذا تستخدم هذه المميزات؟</h4>
                    <p className="text-[10px] text-blue-600 dark:text-blue-400 leading-relaxed">
                        تفعيل الاهتزاز يجعل التطبيق يشعر وكأنه جزء أصيل من هاتفك، مما يزيد من سهولة الاستخدام اليومي.
                    </p>
                </div>
            </div>
        </SectionCard>
        <SectionCard className="border-dashed border-2 border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <Smartphone size={32} className="text-slate-400" />
            </div>
            <h4 className="text-sm font-normal text-slate-800 dark:text-white mb-2">إصدار التطبيق</h4>
            <p className="text-xs text-slate-500 mb-4">V 2.1.0 (Darin Seven Edition)</p>
            <button className="text-[10px] font-medium text-blue-600 uppercase tracking-widest hover:underline">
                التحقق من وجود تحديثات
            </button>
        </SectionCard>
    </div>
);
