import { Lock, AlertCircle, Wallet, CheckCircle2, Snowflake, Archive } from 'lucide-react';
import { SectionCard, SectionTitle, Toggle, InputField, PrimaryBtn, DangerBtn } from './SettingsUI';
import { cn } from '../../../lib/utils';
import { settingsService } from '../services/settingsService';

interface PoliciesSettingsProps {
    backdateLockEnabled: boolean;
    setBackdateLockEnabled: (v: boolean) => Promise<void> | void;
    showNotify: (msg: string) => void;
    teacherCommissionType: string;
    setTeacherCommissionType: (v: string) => Promise<void> | void;
    autoFreezeThreshold: number;
    setAutoFreezeThreshold: (v: number) => Promise<void> | void;
    setSecureAction: (action: { type: 'reset' | 'archive'; title: string; description: string; confirmWord: string; actionFn: () => void } | null) => void;
}

export const PoliciesSettings = ({
    backdateLockEnabled, setBackdateLockEnabled, showNotify,
    teacherCommissionType, setTeacherCommissionType,
    autoFreezeThreshold, setAutoFreezeThreshold,
    setSecureAction
}: PoliciesSettingsProps) => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard>
            <SectionTitle icon={Lock} label="حماية السجلات والقيود" sub="ضمانات النظام" />
            <div className="space-y-3">
                <div className="p-4 bg-card border border-border">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <p className="text-xs font-bold text-error flex items-center gap-1.5">
                                <AlertCircle size={13} /> قفل التعديل بأثر رجعي
                            </p>
                            <p className="text-micro text-error mt-1.5 leading-relaxed">
                                يمنع الموظفين من إضافة أو تعديل حصص في تواريخ قديمة لضمان دقة السجلات المالية.
                            </p>
                        </div>
                        <Toggle
                            checked={backdateLockEnabled}
                            onChange={() => setBackdateLockEnabled(!backdateLockEnabled).then(() => showNotify('تم تحديث خيار الحماية'))}
                        />
                    </div>
                </div>

                <div className="pt-2 border-t border-border">
                    <p className="text-xs font-bold text-primary flex items-center gap-1.5 mb-3">
                        <Wallet size={13} /> سياسة حساب العمولات
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { id: 'fixed', label: 'مبلغ ثابت', sub: 'Fixed Amount' },
                            { id: 'percentage', label: 'نسبة مئوية', sub: 'Percentage %' }
                        ].map(opt => (
                            <button
                                key={opt.id}
                                onClick={() => { setTeacherCommissionType(opt.id); showNotify(`الحساب: ${opt.label}`); }}
                                className={cn(
                                    'p-3 border text-right transition-all',
                                    teacherCommissionType === opt.id
                                        ? 'bg-primary text-on-primary border-primary shadow-sm'
                                        : 'bg-card text-muted border-border hover:border-primary'
                                )}
                            >
                                <p className="text-xs font-bold">{opt.label}</p>
                                <p className={cn('text-micro mt-0.5', teacherCommissionType === opt.id ? 'text-on-primary opacity-60' : 'text-muted')}>{opt.sub}</p>
                                {teacherCommissionType === opt.id && <CheckCircle2 size={12} className="mt-1 text-on-primary opacity-80" />}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </SectionCard>

        <SectionCard>
            <SectionTitle icon={Snowflake} label="سياسة الحضور والغياب" sub="آلية التجميد التلقائي" />
            <div className="space-y-3">
                <div className="p-4 bg-card border border-border">
                    <p className="text-xs font-bold text-info mb-1">حد الغياب المسموح</p>
                    <p className="text-micro text-info leading-relaxed mb-3">
                        إذا تجاوز الطالب هذا العدد من مرات الغياب المتعاقبة، يتم تجميد اشتراكه تلقائياً.
                    </p>
                    <div className="flex items-center gap-3">
                        <InputField
                            type="number"
                            value={autoFreezeThreshold}
                            onChange={e => setAutoFreezeThreshold(Number(e.target.value))}
                            min={1} max={15}
                            className="w-20 text-center font-bold text-lg"
                        />
                        <PrimaryBtn
                            onClick={() => setAutoFreezeThreshold(autoFreezeThreshold).then(() => showNotify('تم حفظ السياسة'))}
                            className="flex-1"
                        >
                            <CheckCircle2 size={13} /> تفعيل
                        </PrimaryBtn>
                    </div>
                </div>

                <div className="p-4 bg-card border border-border">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 flex items-center justify-center bg-error-soft">
                            <Archive size={14} className="text-error" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-error">إقفال الشهر المالي</p>
                            <p className="text-micro text-error">منطقة الخطر</p>
                        </div>
                    </div>
                    <p className="text-micro text-muted leading-relaxed mb-3">
                        أرشفة كافة الحصص الحالية وتصفير الإحصائيات الشهرية. لا تستخدم هذا إلا بنهاية الشهر الفعلي.
                    </p>
                    <DangerBtn
                        className="w-full"
                        onClick={() => setSecureAction({
                            type: 'archive',
                            title: 'إقفال الشهر المالي',
                            description: 'سيتم أرشفة الإحصائيات الحالية لبدء فترة مالية جديدة. لا يمكن التراجع بسهولة.',
                            confirmWord: 'إقفال الشهر',
                            actionFn: () => settingsService.archiveMonth().then(() => {
                                showNotify('تم تجميد وأرشفة بيانات الشهر المالي!');
                                setTimeout(() => window.location.reload(), 2000);
                            }).catch(() => alert('حدث خطأ أثناء إقفال الشهر!'))
                        })}
                    >
                        <Lock size={13} /> إقفال الفترة الحالية
                    </DangerBtn>
                </div>
            </div>
        </SectionCard>
    </div>
);
