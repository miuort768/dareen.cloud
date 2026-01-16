import React, { useState } from 'react';
import { BookOpen, Calendar, CheckCircle2, Clock, Edit, Trash2, TrendingUp } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { Student, Enrollment, ScheduleSlot } from '../types';

interface TeacherStudentCardProps {
    student: Student;
    enrollment: Enrollment;
    actualSessionsUsed: number;
    onUpdateSchedule: (student: Student, enrollmentIndex: number, newSchedule: ScheduleSlot[]) => void;
    onLogAttendance: (student: Student, enrollment: Enrollment) => void;
    onViewHistory: (studentId: string, studentName: string) => void;
    logDate: string;
    onDateChange: (date: string) => void;
}

export const TeacherStudentCard: React.FC<TeacherStudentCardProps> = ({
    student,
    enrollment: en,
    actualSessionsUsed,
    onUpdateSchedule,
    onLogAttendance,
    onViewHistory,
    logDate,
    onDateChange
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempSlot, setTempSlot] = useState({ day: 'الأحد', hour: '', period: 'مساءً' });
    const [editSlotIndex, setEditSlotIndex] = useState<number | null>(null);

    const attendancePercent = en.sessionsTotal > 0 ? (actualSessionsUsed / en.sessionsTotal) * 100 : 0;

    const handleSaveSlot = () => {
        if (!tempSlot.hour) return;
        const newSch = [...(en.schedule || [])];
        if (editSlotIndex !== null) newSch[editSlotIndex] = tempSlot;
        else newSch.push(tempSlot);

        const enIndex = student.enrollments.indexOf(en);
        onUpdateSchedule(student, enIndex, newSch);

        setTempSlot({ day: 'الأحد', hour: '', period: 'مساءً' });
        setEditSlotIndex(null);
    };

    const handleDeleteSlot = (index: number) => {
        if (confirm('هل أنت متأكد من حذف هذا الموعد؟')) {
            const newSch = en.schedule.filter((_, i) => i !== index);
            const enIndex = student.enrollments.indexOf(en);
            onUpdateSchedule(student, enIndex, newSch);
        }
    };

    return (
        <div className="relative bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:border-primary-200 dark:hover:border-primary-900/50 transition-all duration-300 flex flex-col group overflow-hidden rounded-xl">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-indigo-500 opacity-60 group-hover:opacity-100 transition-opacity"></div>

            <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-5 pb-4 border-b border-gray-50 dark:border-gray-700/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-black text-lg rounded-full">
                            {student.name.charAt(0)}
                        </div>
                        <div>
                            <h4 className="font-black text-gray-900 dark:text-white leading-tight">{student.name}</h4>
                            <span className="text-[10px] font-black text-primary-600 dark:text-primary-400 bg-primary-50/50 dark:bg-primary-900/20 px-2 py-0.5 rounded-sm">
                                {en.subject}
                            </span>
                        </div>
                    </div>
                    <div className="text-left">
                        <div className="flex items-center gap-1.5 text-gray-400 mb-0.5">
                            <span className="text-[9px] font-black uppercase tracking-widest hidden sm:inline">نسبة الحضور</span>
                            <TrendingUp size={12} />
                        </div>
                        <p className="text-lg font-black text-gray-900 dark:text-white leading-none">{Math.round(attendancePercent)}%</p>
                    </div>
                </div>

                <div className="mb-6 space-y-2">
                    <div className="flex justify-between items-end text-[10px] font-black">
                        <span className="text-gray-400 uppercase tracking-widest">تغطية المنهج</span>
                        <span className="text-primary-600 dark:text-primary-400">{actualSessionsUsed} من {en.sessionsTotal}</span>
                    </div>
                    <div className="h-2 bg-gray-50 dark:bg-gray-700 overflow-hidden shadow-inner flex rounded-full">
                        <div
                            className={cn(
                                "h-full transition-all duration-1000 ease-out shadow-lg rounded-full",
                                attendancePercent > 80 ? "bg-emerald-500" : attendancePercent > 40 ? "bg-primary-500" : "bg-amber-500"
                            )}
                            style={{ width: `${Math.min(100, attendancePercent)}%` }}
                        ></div>
                    </div>
                </div>

                <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between">
                        <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Clock size={12} className="text-primary-600" />
                            المواعيد الأسبوعية
                        </h5>
                        <button
                            onClick={() => {
                                setIsEditing(!isEditing);
                                setEditSlotIndex(null);
                                setTempSlot({ day: 'الأحد', hour: '', period: 'مساءً' });
                            }}
                            className="text-[9px] font-black underline decoration-primary-300 hover:text-primary-600 transition-colors"
                        >
                            {isEditing ? 'إلغاء' : 'تعديل الجدول'}
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-1">
                        {en.schedule?.length > 0 ? en.schedule.map((slot, i) => (
                            <div key={i} className="group/slot relative border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 px-2 py-1 flex items-center gap-1 rounded">
                                <span className="text-[9px] font-bold text-gray-700 dark:text-gray-300">{slot.day} {slot.hour}{slot.period === 'am' ? 'ص' : 'م'}</span>
                                {isEditing && (
                                    <div className="flex gap-1 ms-1 ps-1 border-s border-gray-200 dark:border-gray-700">
                                        <button onClick={() => { setEditSlotIndex(i); setTempSlot(slot); }} className="text-blue-500 hover:text-blue-700"><Edit size={8} /></button>
                                        <button onClick={() => handleDeleteSlot(i)} className="text-red-500 hover:text-red-700"><Trash2 size={8} /></button>
                                    </div>
                                )}
                            </div>
                        )) : (
                            <p className="text-[9px] text-gray-400 italic">لم يتم تحديد مواعيد أسبوعية بعد</p>
                        )}
                    </div>

                    {isEditing && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 space-y-3 mt-4 animate-in fade-in slide-in-from-top-1 rounded-lg">
                            <div className="grid grid-cols-2 gap-2">
                                <div className="col-span-1">
                                    <p className="text-[8px] font-black text-gray-400 mb-1">اليوم</p>
                                    <select value={tempSlot.day} onChange={(e) => setTempSlot({ ...tempSlot, day: e.target.value })} className="w-full text-[10px] p-2 bg-white dark:bg-gray-800 border-none ring-1 ring-gray-200 dark:ring-gray-700 rounded">
                                        {['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'].map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div className="col-span-1">
                                    <p className="text-[8px] font-black text-gray-400 mb-1">الساعة</p>
                                    <input type="text" value={tempSlot.hour} onChange={(e) => setTempSlot({ ...tempSlot, hour: e.target.value })} placeholder="مثال: 4" className="w-full text-[10px] p-2 bg-white dark:bg-gray-800 border-none ring-1 ring-gray-200 dark:ring-gray-700 rounded" />
                                </div>
                                <div className="col-span-2">
                                    <p className="text-[8px] font-black text-gray-400 mb-1">الفترة</p>
                                    <select value={tempSlot.period} onChange={(e) => setTempSlot({ ...tempSlot, period: e.target.value })} className="w-full text-[10px] p-2 bg-white dark:bg-gray-800 border-none ring-1 ring-gray-200 dark:ring-gray-700 rounded">
                                        <option value="مساءً">مساءً</option>
                                        <option value="صباحاً">صباحاً</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={handleSaveSlot} className="flex-1 bg-primary-600 text-white text-[10px] font-black py-2.5 hover:bg-primary-700 shadow-md rounded">
                                    {editSlotIndex !== null ? 'حفظ التعديل' : 'إضافة للجداول'}
                                </button>
                                <button onClick={() => { setEditSlotIndex(null); setTempSlot({ day: 'الأحد', hour: '', period: 'مساءً' }); }} className="px-3 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[10px] font-black rounded">إلغاء</button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-auto pt-6 border-t border-gray-50 dark:border-gray-700/50 space-y-4">
                    <div className="flex items-center justify-between">
                        <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Calendar size={12} className="text-emerald-500" />
                            تسجيل الحضور السريع
                        </h5>
                        <button onClick={() => onViewHistory(student.id, student.name)} className="text-[9px] font-black text-primary-600 flex items-center gap-1 hover:underline">
                            <BookOpen size={10} /> عرض السجل بالكامل
                        </button>
                    </div>

                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <input type="date" value={logDate} onChange={(e) => onDateChange(e.target.value)} className="w-full text-[10px] p-2.5 bg-gray-50 dark:bg-gray-900 border-none ring-1 ring-gray-100 dark:ring-gray-700 focus:ring-primary-500 transition-all dark:text-white rounded" />
                        </div>
                        <button onClick={() => onLogAttendance(student, en)} className="bg-emerald-600 text-white px-5 text-[10px] font-black hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/10 active:scale-95 rounded-lg">
                            <CheckCircle2 size={14} /> تسجيل الحضور
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
