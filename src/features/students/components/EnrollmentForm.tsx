import { useState } from 'react';
import { Plus, X, Loader2 } from 'lucide-react';
import type { Teacher } from '../../teachers/types';
import type { ScheduleSlot } from '../types';

export const CURRENCIES = ['KWD', 'SAR', 'EGP', 'AED', 'QAR', 'OMR', 'BHD', 'USD'];

interface EnrollmentFormProps {
    teachers: Teacher[];
    onSubmit: (data: {
        teacherId?: string;
        teacher: string;
        subject: string;
        curr: string;
        curriculum?: string;
        totalSessions: number;
        schedule: ScheduleSlot[];
    }) => void;
    isLoading?: boolean;
    defaultCurrency?: string;
}

export const EnrollmentForm = ({ teachers, onSubmit, isLoading, defaultCurrency }: EnrollmentFormProps) => {
    const [form, setForm] = useState({
        teacherId: '',
        subject: '',
        curr: defaultCurrency || 'KWD',
        curriculum: '',
        totalSessions: ''
    });
    const [schedule, setSchedule] = useState<ScheduleSlot[]>([]);
    const [slotInput, setSlotInput] = useState({ day: '', hour: '', period: 'pm' });

    const selectedTeacher = teachers.find(t => t.id === form.teacherId);

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
            teacherId: form.teacherId || undefined,
            teacher: selectedTeacher?.name || '',
            subject: form.subject,
            curr: form.curr,
            curriculum: form.curriculum,
            totalSessions: Number(form.totalSessions) || 0,
            schedule
        });
        setForm({ teacherId: '', subject: '', curr: defaultCurrency || 'KWD', curriculum: '', totalSessions: '' });
        setSchedule([]);
    };

    return (
        <div className="pt-8 border-t border-border">
            <h4 className="text-micro font-medium text-main uppercase tracking-widest mb-4">إضافة اشتراك جديد</h4>
            <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                    <select
                        required
                        value={form.teacherId}
                        onChange={e => setForm({ ...form, teacherId: e.target.value })}
                        aria-label="اختر المعلمة"
                        className="w-full px-3 py-2 bg-surface border border-border text-xs font-normal text-main rounded-xl"
                    >
                        <option value="">المعلمة</option>
                        {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                    <input
                        required
                        placeholder="المادة"
                        aria-label="المادة"
                        value={form.subject}
                        onChange={e => setForm({ ...form, subject: e.target.value })}
                        className="w-full px-3 py-2 bg-surface border border-border text-xs font-normal text-main rounded-xl"
                    />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <select
                        required
                        value={form.curr}
                        onChange={e => setForm({ ...form, curr: e.target.value })}
                        aria-label="العملة"
                        className="w-full px-3 py-2 bg-surface border border-border text-xs font-normal text-main rounded-xl"
                    >
                        {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input
                        placeholder="المنهج"
                        aria-label="المنهج"
                        value={form.curriculum}
                        onChange={e => setForm({ ...form, curriculum: e.target.value })}
                        className="w-full px-3 py-2 bg-surface border border-border text-xs font-normal text-main rounded-xl"
                    />
                </div>
                <input
                    required
                    type="number"
                    placeholder="عدد الحصص"
                    aria-label="عدد الحصص"
                    value={form.totalSessions}
                    onChange={e => setForm({ ...form, totalSessions: e.target.value })}
                    className="w-full px-3 py-2 bg-surface border border-border text-xs font-normal text-main rounded-xl"
                />

                <div className="bg-primary-soft p-3 space-y-3 rounded-xl">
                    <p className="text-micro font-medium text-primary uppercase">المواعيد</p>
                    <div className="flex gap-2">
                        <select
                            value={slotInput.day}
                            onChange={e => setSlotInput({ ...slotInput, day: e.target.value })}
                            aria-label="اختر اليوم"
                            className="flex-1 px-2 py-1 text-micro font-normal border border-border bg-surface text-main rounded-xl"
                        >
                            <option value="">اليوم</option>
                            {['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'].map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <input
                            placeholder="الساعة"
                            aria-label="الساعة"
                            value={slotInput.hour}
                            onChange={e => setSlotInput({ ...slotInput, hour: e.target.value.replace(/^0+/, '') })}
                            className="w-20 px-2 py-1 text-micro font-normal border border-border bg-surface text-main rounded-xl"
                        />
                        <select
                            value={slotInput.period}
                            onChange={e => setSlotInput({ ...slotInput, period: e.target.value })}
                            aria-label="الفترة صباحاً أو مساءً"
                            className="w-16 px-1 py-1 text-micro font-normal border border-border bg-surface text-main rounded-xl"
                        >
                            <option value="am">صباحاً</option>
                            <option value="pm">مساءً</option>
                        </select>
                        <button type="button" onClick={handleAddSlot} className="bg-primary text-on-primary px-2 rounded-xl active:scale-95 transition-transform" aria-label="إضافة"><Plus size={14} /></button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {schedule.map((s, idx) => (
                            <div key={idx} className="bg-card px-2 py-1 text-micro font-medium border border-primary-soft flex items-center gap-1 shadow-sm rounded-xl">
                                {s.day} {s.hour}
                                <button type="button" onClick={() => handleRemoveSlot(idx)} className="text-error" aria-label="إزالة"><X size={10} /></button>
                            </div>
                        ))}
                    </div>
                </div>

                <button type="submit" disabled={isLoading} className="w-full bg-primary text-on-primary py-3 text-xs font-medium hover:bg-primary-hover transition-all mt-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 rounded-xl active:scale-[0.98]">
                    {isLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                    {isLoading ? 'جاري الحفظ...' : 'تأكيد وحفظ الاشتراك'}
                </button>
            </form>
        </div>
    );
};

