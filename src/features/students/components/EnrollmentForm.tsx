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
        <div className="pt-8 border-t border-gray-100 dark:border-gray-800">
            <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-4 dark:text-white">إضافة اشتراك جديد</h4>
            <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                    <select
                        required
                        value={form.teacher}
                        onChange={e => setForm({ ...form, teacher: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 text-xs font-bold rounded-none dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    >
                        <option value="">المعلمة</option>
                        {teachers.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                    </select>
                    <input
                        required
                        placeholder="المادة"
                        value={form.subject}
                        onChange={e => setForm({ ...form, subject: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 text-xs font-bold rounded-none dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <input
                        required
                        placeholder="المنهج"
                        value={form.curr}
                        onChange={e => setForm({ ...form, curr: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 text-xs font-bold rounded-none dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    />
                    <input
                        required
                        type="number"
                        placeholder="عدد الحصص"
                        value={form.totalSessions}
                        onChange={e => setForm({ ...form, totalSessions: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 text-xs font-bold rounded-none dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    />
                </div>

                <div className="bg-primary-50/50 p-3 space-y-3 dark:bg-primary-900/10">
                    <p className="text-[9px] font-black text-primary-700 uppercase dark:text-primary-400">المواعيد</p>
                    <div className="flex gap-2">
                        <select
                            value={slotInput.day}
                            onChange={e => setSlotInput({ ...slotInput, day: e.target.value })}
                            className="flex-1 px-2 py-1 text-[10px] font-bold border border-gray-200 rounded-none bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        >
                            <option value="">اليوم</option>
                            {['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'].map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <input
                            placeholder="الساعة"
                            value={slotInput.hour}
                            onChange={e => setSlotInput({ ...slotInput, hour: e.target.value })}
                            className="w-20 px-2 py-1 text-[10px] font-bold border border-gray-200 rounded-none bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        />
                        <button type="button" onClick={handleAddSlot} className="bg-primary-600 text-white px-2 rounded-none"><Plus size={14} /></button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {schedule.map((s, idx) => (
                            <div key={idx} className="bg-white px-2 py-1 text-[9px] font-black border border-primary-200 flex items-center gap-1 dark:bg-gray-800 dark:border-primary-900 shadow-sm">
                                {s.day} {s.hour}
                                <button type="button" onClick={() => handleRemoveSlot(idx)} className="text-red-500"><X size={10} /></button>
                            </div>
                        ))}
                    </div>
                </div>

                <button type="submit" className="w-full bg-primary-600 text-white py-3 text-xs font-black uppercase tracking-widest hover:bg-primary-700 transition-all rounded-none mt-2 shadow-lg shadow-primary-600/20">
                    تأكيد وحفظ الاشتراك
                </button>
            </form>
        </div>
    );
};
