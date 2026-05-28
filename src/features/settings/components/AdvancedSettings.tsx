import { Phone, Bell, CheckCircle2, RefreshCw, Calendar, Trash2 } from 'lucide-react';
import { SectionCard, SectionTitle, ToggleRow, FieldLabel, InputField, TextAreaField, PrimaryBtn, DangerBtn } from './SettingsUI';
import { settingsService } from '../services/settingsService';

interface AdvancedSettingsProps {
    whatsappAutoNotify: boolean;
    setWhatsappAutoNotify: (v: boolean) => Promise<void> | void;
    localWhatsappTemplate: string;
    setLocalWhatsappTemplate: (v: string) => void;
    setWhatsappTemplate: (v: string) => Promise<void> | void;
    showNotify: (msg: string) => void;
    reminderMinutesBefore: number;
    setReminderMinutesBefore: (v: number) => void;
    localSemesterName: string;
    setLocalSemesterName: (v: string) => void;
    localSemesters: string;
    setLocalSemesters: (v: string) => void;
    setSemesterName: (v: string) => Promise<void> | void;
    setSemesters: (v: string) => Promise<void> | void;
    setSecureAction: (action: { type: 'reset' | 'archive'; title: string; description: string; confirmWord: string; actionFn: () => void } | null) => void;
}

export const AdvancedSettings = ({
    whatsappAutoNotify, setWhatsappAutoNotify,
    localWhatsappTemplate, setLocalWhatsappTemplate, setWhatsappTemplate, showNotify,
    reminderMinutesBefore, setReminderMinutesBefore,
    localSemesterName, setLocalSemesterName,
    localSemesters, setLocalSemesters,
    setSemesterName, setSemesters,
    setSecureAction
}: AdvancedSettingsProps) => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard>
            <SectionTitle icon={Phone} label="أتمتة الواتساب والرسائل" sub="WhatsApp Automation" />
            <div className="space-y-3">
                <ToggleRow
                    icon={Bell}
                    label="إرسال الفواتير تلقائياً"
                    sub="Automatic Notifications"
                    checked={whatsappAutoNotify}
                    onChange={() => setWhatsappAutoNotify(!whatsappAutoNotify)}
                />
                <div>
                    <FieldLabel>قالب رسالة الحضور</FieldLabel>
                    <TextAreaField
                        value={localWhatsappTemplate}
                        onChange={e => setLocalWhatsappTemplate(e.target.value)}
                        rows={5}
                        placeholder="اكتب رسالتك هنا..."
                    />
                </div>
                <div className="flex flex-wrap gap-1.5">
                    {['{Student}', '{Subject}', '{Date}', '{Teacher}', '{Price}'].map(tag => (
                        <button
                            key={tag}
                            onClick={() => setLocalWhatsappTemplate(prev => prev + ' ' + tag)}
                            className="px-2.5 py-1 bg-white dark:bg-slate-900 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 hover:text-[#2563EB] text-slate-500 text-[10px] font-bold border border-slate-100/50 dark:border-slate-800/50 transition-all font-mono"
                        >
                            {tag}
                        </button>
                    ))}
                </div>
                <PrimaryBtn
                    className="w-full"
                    onClick={() => setWhatsappTemplate(localWhatsappTemplate).then(() => showNotify('تم حفظ القالب'))}
                >
                    <CheckCircle2 size={13} /> حفظ وتفعيل القالب
                </PrimaryBtn>
            </div>
        </SectionCard>

        <SectionCard>
            <SectionTitle icon={Bell} label="تذكير أولياء الأمور بالحصص" sub="Parent Session Reminders" />
            <div className="space-y-3">
                <div>
                    <FieldLabel>إرسال تذكير قبل الحصة بـ (دقائق)</FieldLabel>
                    <InputField
                        type="number"
                        value={reminderMinutesBefore}
                        onChange={e => setReminderMinutesBefore(Math.max(1, Number(e.target.value)))}
                        placeholder="30"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">سيتم إرسال إشعار لولي الأمر قبل الحصة بهذا العدد من الدقائق</p>
                </div>
            </div>
        </SectionCard>

        <SectionCard>
            <SectionTitle icon={Calendar} label="إدارة الفصول والأرشيف" sub="Academic Ledger" />
            <div className="space-y-3">
                <div>
                    <FieldLabel>الفصل الحالي</FieldLabel>
                    <InputField value={localSemesterName} onChange={e => setLocalSemesterName(e.target.value)} placeholder="الفصل الأول 2024" />
                </div>
                <div>
                    <FieldLabel>الأرشيف التاريخي</FieldLabel>
                    <TextAreaField
                        value={localSemesters}
                        onChange={e => setLocalSemesters(e.target.value)}
                        rows={4}
                        placeholder="الأرشيف التاريخي..."
                    />
                </div>
                <PrimaryBtn
                    className="w-full"
                    onClick={() => Promise.all([setSemesterName(localSemesterName), setSemesters(localSemesters)]).then(() => showNotify('تم تحديث الأرشيف'))}
                >
                    <RefreshCw size={13} /> مزامنة الفصول
                </PrimaryBtn>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100/50 dark:border-slate-800/50">
                <DangerBtn
                    className="w-full"
                    onClick={() => setSecureAction({
                        type: 'reset',
                        title: 'تصفير النظام بالكامل',
                        description: 'سيتم مسح جميع البيانات المتعلقة بالطلاب والمعلمين والإيرادات للبدء من جديد. هذا الإجراء نهائي.',
                        confirmWord: 'إعادة ضبط المنصة',
                        actionFn: () => settingsService.systemReset().then(() => { localStorage.clear(); window.location.reload(); })
                    })}
                >
                    <Trash2 size={13} /> إعادة ضبط المصنع (Factory Reset)
                </DangerBtn>
            </div>
        </SectionCard>
    </div>
);
