import { useState, useEffect } from 'react';
import { UserCheck, AlarmClock, Snowflake } from 'lucide-react';
import { SectionCard, SectionTitle, FieldLabel, InputField, ToggleRow, PrimaryBtn } from './SettingsUI';
import { settingsService } from '../services/settingsService';

export const AttendanceSettingsSection = ({
    localBackdateLock, setLocalBackdateLock,
    localAutoFreeze, setLocalAutoFreeze,
    showNotify,
}: {
    localBackdateLock: boolean; setLocalBackdateLock: (v: boolean) => void;
    localAutoFreeze: number; setLocalAutoFreeze: (v: number) => void;
    showNotify: (msg: string) => void;
}) => {
    const [lateThreshold, setLateThreshold] = useState('15');
    const [absenceAlertThreshold, setAbsenceAlertThreshold] = useState('3');
    const [autoRemind, setAutoRemind] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        settingsService.getSettingsBatch().then(data => {
            setLateThreshold(data.system.late_threshold_minutes || '15');
            setAbsenceAlertThreshold(data.system.absence_alert_threshold || '3');
            setAutoRemind(data.system.auto_remind !== 'false');
        }).catch((e) => console.warn(e));
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await settingsService.saveSettingsBatch([
                { key: 'late_threshold_minutes', value: lateThreshold },
                { key: 'absence_alert_threshold', value: absenceAlertThreshold },
                { key: 'auto_remind', value: String(autoRemind) },
                { key: 'auto_freeze_threshold', value: String(localAutoFreeze) },
                { key: 'backdate_lock_enabled', value: String(localBackdateLock) },
            ]);
            showNotify('تم حفظ إعدادات الحضور');
        } catch (e) { console.error(e); alert('خطأ في الحفظ'); }
        finally { setIsSaving(false); }
    };

    return (
        <SectionCard>
            <SectionTitle icon={UserCheck} label="إعدادات الحضور" sub="التحكم بسياسات الحضور والغياب والتذكيرات" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                    <FieldLabel>حد التأخير (دقائق)</FieldLabel>
                    <InputField type="number" value={lateThreshold} onChange={e => setLateThreshold(e.target.value)} />
                </div>
                <div>
                    <FieldLabel>حد الغياب للتنبيه</FieldLabel>
                    <InputField type="number" value={absenceAlertThreshold} onChange={e => setAbsenceAlertThreshold(e.target.value)} />
                </div>
                <div>
                    <FieldLabel>التجميد التلقائي (غيابات)</FieldLabel>
                    <InputField type="number" value={localAutoFreeze} onChange={e => setLocalAutoFreeze(Number(e.target.value))} />
                </div>
            </div>

            <div className="space-y-3">
                <ToggleRow icon={AlarmClock} label="التذكير التلقائي بالحضور" sub="إرسال تذكير قبل الحصة" checked={autoRemind} onChange={() => setAutoRemind(!autoRemind)} />
                <ToggleRow icon={Snowflake} label="قفل إدخال الحضور السابق" sub="منع تعديل الحضور لأيام سابقة" checked={localBackdateLock} onChange={() => setLocalBackdateLock(!localBackdateLock)} />
            </div>

            <div className="mt-6 pt-4 border-t border-border flex justify-end">
                <PrimaryBtn onClick={handleSave} loading={isSaving}>حفظ إعدادات الحضور</PrimaryBtn>
            </div>
        </SectionCard>
    );
};
