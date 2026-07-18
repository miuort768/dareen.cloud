import { useState } from 'react';
import { Clock, Edit, Trash2 } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { ScheduleSlot } from '../types';

interface StudentScheduleEditorProps {
    schedule: ScheduleSlot[];
    isEditing: boolean;
    onToggleEdit: () => void;
    onDeleteSlot: (index: number) => void;
    onSaveSlot: (slot: ScheduleSlot, editIndex: number | null) => void;
}

export const StudentScheduleEditor = ({ schedule, isEditing, onToggleEdit, onDeleteSlot, onSaveSlot }: StudentScheduleEditorProps) => {
    const [tempSlot, setTempSlot] = useState({ day: 'الأحد', hour: '', period: 'مساءً' });
    const [editSlotIndex, setEditSlotIndex] = useState<number | null>(null);

    return (
        <div className="space-y-2 pt-2 border-t border-border/50">
            <div className="flex items-center justify-between">
                <h5 className="text-micro font-normal text-muted uppercase flex items-center gap-1.5">
                    <Clock size={10} className="text-primary" /> الجدول الإسبوعي
                </h5>
                <button onClick={() => { onToggleEdit(); setEditSlotIndex(null); }}
                    className={`text-micro font-bold px-2 py-0.5 rounded-lg transition-all ${isEditing ? 'bg-error-soft text-error' : 'bg-primary-soft text-primary'}`}>
                    {isEditing ? 'إلغاء' : 'تعديل'}
                </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
                {schedule?.length > 0 ? schedule.map((slot, i) => (
                    <div key={`slot-${i}`} className="flex items-center gap-1.5 px-2 py-1 bg-card border border-border/50 text-micro font-bold text-muted rounded-xl">
                        <span>{slot.day} {slot.hour}{slot.period === 'am' ? 'ص' : 'م'}</span>
                        {isEditing && (
                            <div className="flex gap-1.5 ms-1.5 ps-1.5 border-s border-border/50">
                                <button onClick={() => { setEditSlotIndex(i); setTempSlot(slot); }} aria-label="تعديل الموعد" className="text-primary"><Edit size={10} /></button>
                                <button onClick={() => onDeleteSlot(i)} aria-label="حذف الموعد" className="text-error"><Trash2 size={10} /></button>
                            </div>
                        )}
                    </div>
                )) : (
                    <p className="text-micro text-muted italic">لا يوجد جدول محدد</p>
                )}
            </div>

            {isEditing && (
                <div className="p-3 bg-primary rounded-xl text-on-primary space-y-3 mt-2">
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <p className="text-micro font-bold text-on-primary/60 mb-1 uppercase">اليوم</p>
                            <select value={tempSlot.day} onChange={(e) => setTempSlot({ ...tempSlot, day: e.target.value })} aria-label="اختر اليوم" className="w-full text-micro font-bold p-1.5 bg-white/10 border-none rounded-xl outline-none">
                                {['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'].map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div>
                            <p className="text-micro font-bold text-on-primary/60 mb-1 uppercase">الساعة</p>
                            <input type="text" aria-label="الساعة" value={tempSlot.hour} onChange={(e) => setTempSlot({ ...tempSlot, hour: e.target.value.replace(/^0+/, '') })} placeholder="مثال: 4" className="w-full text-micro font-bold p-1.5 bg-white/10 border-none rounded-xl outline-none" />
                        </div>
                    </div>
                    <button onClick={() => { onSaveSlot(tempSlot, editSlotIndex); setTempSlot({ day: 'الأحد', hour: '', period: 'مساءً' }); setEditSlotIndex(null); }} className="w-full bg-white text-primary font-bold text-micro py-2 rounded-xl hover:bg-white/90 transition-colors shadow-sm active:scale-95">
                        {editSlotIndex !== null ? 'تحديث' : 'إضافة'}
                    </button>
                </div>
            )}
        </div>
    );
};
