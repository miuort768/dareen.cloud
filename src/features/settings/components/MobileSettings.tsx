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
            <SectionTitle icon={Smartphone} label="تخصيص تجربة الموبايل" sub="تجربة التطبيق" />
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
                <div className="p-4 bg-primary-50 dark:bg-primary-900/10 border-r-4 border-primary-500">
                    <h4 className="text-xs font-medium text-primary-800 dark:text-primary-300 mb-1">لماذا تستخدم هذه المميزات؟</h4>
                    <p className="text-[10px] text-primary-600 dark:text-primary-400 leading-relaxed">
                        تفعيل الاهتزاز يجعل التطبيق يشعر وكأنه جزء أصيل من هاتفك، مما يزيد من سهولة الاستخدام اليومي.
                    </p>
                </div>
            </div>
        </SectionCard>
        <SectionCard className="border-dashed border-2 border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 flex items-center justify-center mb-4" style={{ backgroundColor: '#2563EB12' }}>
                <Smartphone size={32} style={{ color: '#2563EB' }} />
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-2">إصدار التطبيق</h4>
            <p className="text-xs font-bold text-slate-500 mb-4">الإصدار 2.1.0</p>
            <button className="text-[10px] font-bold text-[#2563EB] uppercase tracking-widest hover:underline">
                التحقق من وجود تحديثات
            </button>
        </SectionCard>
    </div>
);
