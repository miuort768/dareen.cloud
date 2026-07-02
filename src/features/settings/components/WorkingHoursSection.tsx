import { useState } from 'react';
import { Clock, Plus, Trash2, Sun, Moon } from 'lucide-react';
import { SectionCard, SectionTitle, FieldLabel, InputField, PrimaryBtn, SecondaryBtn, DangerBtn, ToggleRow } from './SettingsUI';
import { settingsService } from '../services/settingsService';

const DAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

export const WorkingHoursSection = ({ showNotify }: { showNotify: (msg: string) => void }) => {
    const [schedule, setSchedule] = useState<{ day: number; enabled: boolean; start: string; end: string }[]>(
        DAYS.map((_, i) => ({ day: i, enabled: i < 5, start: '09:00', end: '17:00' }))
    );
    const [sessionDuration, setSessionDuration] = useState('60');
    const [breakStart, setBreakStart] = useState('12:00');
    const [breakEnd, setBreakEnd] = useState('13:00');
    const [isSaving, setIsSaving] = useState(false);

    const toggleDay = (day: number) => {
        setSchedule(prev => prev.map(d => d.day === day ? { ...d, enabled: !d.enabled } : d));
    };

    const updateTime = (day: number, field: 'start' | 'end', value: string) => {
        setSchedule(prev => prev.map(d => d.day === day ? { ...d, [field]: value } : d));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await settingsService.saveSettingsBatch([
                { key: 'working_hours', value: JSON.stringify(schedule) },
                { key: 'session_duration', value: sessionDuration },
                { key: 'break_time', value: JSON.stringify({ start: breakStart, end: breakEnd }) },
            ]);
            showNotify('تم حفظ أوقات العمل');
        } catch { alert('خطأ في الحفظ'); }
        finally { setIsSaving(false); }
    };

    return (
        <SectionCard>
            <SectionTitle icon={Clock} label="أوقات العمل" sub="تحديد ساعات العمل وفترات الراحة" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                    <FieldLabel>مدة الجلسة (دقيقة)</FieldLabel>
                    <InputField type="number" value={sessionDuration} onChange={e => setSessionDuration(e.target.value)} />
                </div>
                <div>
                    <FieldLabel>بداية الاستراحة</FieldLabel>
                    <InputField type="time" value={breakStart} onChange={e => setBreakStart(e.target.value)} />
                </div>
                <div>
                    <FieldLabel>نهاية الاستراحة</FieldLabel>
                    <InputField type="time" value={breakEnd} onChange={e => setBreakEnd(e.target.value)} />
                </div>
            </div>

            <div className="space-y-2">
                {schedule.map(d => (
                    <div key={d.day} className="flex items-center gap-3 p-3 bg-surface rounded-xl">
                        <button onClick={() => toggleDay(d.day)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${d.enabled ? 'bg-primary-soft text-primary' : 'bg-hover text-dim'}`}>
                            {d.day < 5 ? <Sun size={16} /> : <Moon size={16} />}
                        </button>
                        <span className={`text-sm font-bold w-16 md:w-20 ${d.enabled ? 'text-main' : 'text-dim'}`}>{DAYS[d.day]}</span>
                        {d.enabled ? (
                            <>
                                <InputField type="time" value={d.start} onChange={e => updateTime(d.day, 'start', e.target.value)} className="w-24 md:w-28" />
                                <span className="text-dim shrink-0">—</span>
                                <InputField type="time" value={d.end} onChange={e => updateTime(d.day, 'end', e.target.value)} className="w-24 md:w-28" />
                            </>
                        ) : (
                            <span className="text-xs text-dim mr-4">إجازة</span>
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-6 pt-4 border-t border-border flex justify-end">
                <PrimaryBtn onClick={handleSave} loading={isSaving}>حفظ أوقات العمل</PrimaryBtn>
            </div>
        </SectionCard>
    );
};
