import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import type { Teacher } from '../../teachers/types';
import type { ScheduleSlot } from '../types';

interface EnrollmentFormProps {
    teachers: Teacher[];
    onSubmit: (data: {
        teacher: string;
        subject: string;
        curr: string;
        totalSessions: number;
        schedule: ScheduleSlot[];
    }) => void;
}

export const EnrollmentForm = ({ teachers, onSubmit }: EnrollmentFormProps) => {
    const [form, setForm] = useState({
        teacher: '',
        subject: '',
        curr: '',
        totalSessions: ''
    });
    const [schedule, setSchedule] = useState<ScheduleSlot[]>([]);
    const [slotInput, setSlotInput] = useState({ day: '', hour: '', period: 'pm' });

    const handleAddSlot = () => {
        if (!slotInput.day || !slotInput.hour) return;
        setSchedule([...schedule, { ...slotInput } as ScheduleSlot]);
        setSlotInput({ ...slotInput, day: '', hour: '' });
    };

    const handleRemoveSlot = (index: number) => {
        setSchedule(schedule.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            ...form,
            totalSessions: Number(form.totalSessions) || 0,
            schedule
        });
        setForm({ teacher: '', subject: '', curr: '', totalSessions: '' });
        setSchedule([]);
    };

    return (
        <div className="pt-8 border-t border-border">
            <h4 className="text-micro font-medium text-main uppercase tracking-widest mb-4">إضافة اشتراك جديد</h4>
            <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                    <select
                        required
                        value={form.teacher}
                        onChange={e => setForm({ ...form, teacher: e.target.value })}
                        className="w-full px-3 py-2 bg-surface border border-border text-xs font-normal text-main dark:bg-hover dark:text-main"
                    >
                        <option value="">المعلمة</option>
                        {teachers.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                    </select>
                    <input
                        required
                        placeholder="المادة"
                        value={form.subject}
                        onChange={e => setForm({ ...form, subject: e.target.value })}
                        className="w-full px-3 py-2 bg-surface border border-border text-xs font-normal text-main dark:bg-hover dark:text-main"
                    />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <input
                        required
                        placeholder="المنهج"
                        value={form.curr}
                        onChange={e => setForm({ ...form, curr: e.target.value })}
                        className="w-full px-3 py-2 bg-surface border border-border text-xs font-normal text-main dark:bg-hover dark:text-main"
                    />
                    <input
                        required
                        type="number"
                        placeholder="عدد الحصص"
                        value={form.totalSessions}
                        onChange={e => setForm({ ...form, totalSessions: e.target.value })}
                        className="w-full px-3 py-2 bg-surface border border-border text-xs font-normal text-main dark:bg-hover dark:text-main"
                    />
                </div>

                <div className="bg-primary-soft p-3 space-y-3">
                    <p className="text-micro font-medium text-primary uppercase">المواعيد</p>
                    <div className="flex gap-2">
                        <select
                            value={slotInput.day}
                            onChange={e => setSlotInput({ ...slotInput, day: e.target.value })}
                            className="flex-1 px-2 py-1 text-micro font-normal border border-border bg-card dark:bg-hover text-main dark:text-main"
                        >
                            <option value="">اليوم</option>
                            {['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'].map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <input
                            placeholder="الساعة"
                            value={slotInput.hour}
                            onChange={e => setSlotInput({ ...slotInput, hour: e.target.value.replace(/^0+/, '') })}
                            className="w-20 px-2 py-1 text-micro font-normal border border-border bg-card dark:bg-hover text-main dark:text-main"
                        />
                        <button type="button" onClick={handleAddSlot} className="bg-primary text-on-primary px-2"><Plus size={14} /></button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {schedule.map((s, idx) => (
                            <div key={idx} className="bg-card px-2 py-1 text-micro font-medium border border-primary-soft flex items-center gap-1 dark:bg-hover shadow-sm">
                                {s.day} {s.hour}
                                <button type="button" onClick={() => handleRemoveSlot(idx)} className="text-error"><X size={10} /></button>
                            </div>
                        ))}
                    </div>
                </div>

                <button type="submit" className="w-full bg-primary text-on-primary py-3 text-xs font-medium uppercase tracking-widest hover:bg-primary-hover transition-all mt-2 shadow-sm">
                    تأكيد وحفظ الاشتراك
                </button>
            </form>
        </div>
    );
};

