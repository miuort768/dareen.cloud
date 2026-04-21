import React, { useState, useRef } from 'react';
import { BookOpen, Calendar, Clock, Edit, Trash2, TrendingUp, Activity, AlertCircle, MessageSquare } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { Student, Enrollment, ScheduleSlot } from '../types';

interface TeacherStudentCardProps {
    student: Student;
    enrollment: Enrollment;
    actualSessionsUsed: number;
    onUpdateSchedule: (student: Student, enrollmentIndex: number, newSchedule: ScheduleSlot[]) => void;
    onLogAttendance: (student: Student, enrollment: Enrollment) => void;
    onViewHistory: (studentId: string, studentName: string, grade: string, subject: string, curriculum?: string) => void;
    onDeleteSlot: (student: Student, enrollment: Enrollment, index: number) => void;
    onUpdateNotes?: (studentId: string, subject: string, notes: string) => void;
    onReschedule?: (student: Student, enrollment: Enrollment) => void;
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
    onDeleteSlot,
    onUpdateNotes,
    onReschedule,
    logDate,
    onDateChange
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [notes, setNotes] = useState(en.nextSessionNotes || '');
    const [isSavingNotes, setIsSavingNotes] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    React.useEffect(() => {
        setNotes(en.nextSessionNotes || '');
    }, [en.nextSessionNotes]);

    const triggerSave = (value: string) => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            if (value.trim() !== (en.nextSessionNotes || '').trim()) {
                setIsSavingNotes(true);
                try {
                    await onUpdateNotes?.(student.id, en.subject, value);
                } finally {
                    setTimeout(() => setIsSavingNotes(false), 500);
                }
            }
        }, 1500);
    };

    const [timerRunning, setTimerRunning] = useState(false);
    const [timerSeconds, setTimerSeconds] = useState(0);
    const [timerInterval, setTimerInterval] = useState<any>(null);

    const toggleTimer = async () => {
        if (timerRunning) {
            clearInterval(timerInterval);
            setTimerRunning(false);
            try {
                const token = localStorage.getItem('token');
                await fetch('/api/active-sessions', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ studentId: student.id, subject: en.subject })
                });
            } catch (e) { /* silent */ }
        } else {
            const start = Date.now() - timerSeconds * 1000;
            const interval = setInterval(() => {
                setTimerSeconds(Math.floor((Date.now() - start) / 1000));
            }, 1000);
            setTimerInterval(interval);
            setTimerRunning(true);
            try {
                const token = localStorage.getItem('token');
                await fetch('/api/active-sessions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ studentId: student.id, subject: en.subject })
                });
                await fetch('/api/push/notify-student-parent', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({
                        studentId: student.id,
                        title: '🎓 بدأت الحصة الآن!',
                        body: `حصة ${en.subject} للطالب ${student.name} مع الأستاذة ${en.teacher} قد بدأت الآن.`
                    })
                });
            } catch (e) { /* silent */ }
        }
    };

    const formatTime = (totalSecs: number) => {
        const mins = Math.floor(totalSecs / 60);
        const secs = totalSecs % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const [tempSlot, setTempSlot] = useState({ day: 'الأحد', hour: '', period: 'مساءً' });
    const [editSlotIndex, setEditSlotIndex] = useState<number | null>(null);

    const getGradeDisplay = (grade: string) => {
        const mapping: Record<string, string> = {
            'الأول': '1', 'الثاني': '2', 'الثالث': '3', 'الرابع': '4', 'الخامس': '5', 'السادس': '6',
            'سابع': '7', 'ثامن': '8', 'تاسع': '9', 'عاشر': '10'
        };
        const numMatch = grade.match(/\d+/);
        if (numMatch) return numMatch[0];
        for (const [key, val] of Object.entries(mapping)) {
            if (grade.includes(key)) return val;
        }
        return grade.charAt(0);
    };

    const attendancePercent = en.sessionsTotal > 0 ? (actualSessionsUsed / en.sessionsTotal) * 100 : 0;

    const handleSaveSlot = () => {
        if (!tempSlot.hour) return;
        const newSch = [...(en.schedule || [])];
        if (editSlotIndex !== null) newSch[editSlotIndex] = tempSlot;
        else newSch.push(tempSlot);
        onUpdateSchedule(student, student.enrollments.indexOf(en), newSch);
        setTempSlot({ day: 'الأحد', hour: '', period: 'مساءً' });
        setEditSlotIndex(null);
    };

    return (
        <div className="relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:shadow-2xl rounded-none overflow-hidden h-full flex flex-col group" dir="rtl">
            {/* Header Accent */}
            <div className={cn(
                "absolute top-0 right-0 w-1.5 h-full bg-indigo-600 transition-colors duration-500",
                timerRunning && "bg-rose-500 animate-pulse"
            )}></div>

            <div className="p-6 flex-1 flex flex-col space-y-6">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center font-black text-xl italic shadow-2xl skew-x-1 rotate-2 group-hover:rotate-0 group-hover:skew-x-0 transition-transform">
                            {getGradeDisplay(student.grade)}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-black text-slate-800 dark:text-white text-base leading-none uppercase italic tracking-tighter truncate max-w-[150px]">{student.name}</h4>
                                <span className="text-[9px] font-black bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 uppercase italic">
                                    {student.grade}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <BookOpen size={12} className="text-indigo-600" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{en.subject}</p>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block italic mb-1">الجاهزية</span>
                        <div className="flex items-center justify-end gap-1.5">
                             <TrendingUp size={14} className={cn(attendancePercent > 85 ? "text-rose-500" : "text-emerald-500")} />
                             <span className="text-xl font-black text-slate-900 dark:text-white leading-none italic">{Math.round(attendancePercent)}%</span>
                        </div>
                    </div>
                </div>

                {/* Control Hub */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button 
                        onClick={toggleTimer}
                        className={cn(
                            "flex items-center justify-between px-4 py-3.5 border transition-all rounded-none",
                            timerRunning 
                                ? "bg-rose-600 border-rose-500 text-white shadow-xl shadow-rose-500/20" 
                                : "bg-slate-900 dark:bg-slate-800 border-slate-800 text-white hover:bg-black"
                        )}
                    >
                        <div className="flex items-center gap-2">
                            <Clock size={16} className={cn(timerRunning && "animate-spin-slow")} />
                            <span className="text-sm font-black tracking-tighter font-mono">{formatTime(timerSeconds)}</span>
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest italic">{timerRunning ? 'إنهاء' : 'بدء الحصة'}</span>
                    </button>
                    
                    <button 
                        onClick={() => onReschedule?.(student, en)}
                        className="flex items-center justify-center gap-2 px-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white hover:bg-slate-50 font-black text-[9px] uppercase tracking-widest italic rounded-none transition-all"
                    >
                        <Calendar size={16} /> إعادة جدولة
                    </button>
                </div>

                {/* Progress Analytics */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase italic tracking-widest text-slate-400">
                        <div className="flex items-center gap-2">
                            <Activity size={14} className="text-indigo-600" />
                            <span>معدل تغطية الحصص</span>
                        </div>
                        <div className="flex items-baseline gap-1 text-slate-900 dark:text-white font-mono">
                            <span className="text-base text-indigo-600 font-black">{actualSessionsUsed}</span>
                            <span>/ {en.sessionsTotal}</span>
                        </div>
                    </div>
                    <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-none overflow-hidden relative">
                        <div
                            className={cn(
                                "h-full transition-all duration-1000 ease-out",
                                attendancePercent > 85 ? "bg-rose-500" : attendancePercent > 60 ? "bg-amber-500" : "bg-emerald-500"
                            )}
                            style={{ width: `${Math.min(100, attendancePercent)}%` }}
                        />
                    </div>
                </div>

                {/* Schedule Management */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800 pb-2">
                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 italic">
                            <Clock size={12} className="text-indigo-600" /> الجدول الأسبوعي
                        </h5>
                        <button
                            onClick={() => { setIsEditing(!isEditing); setEditSlotIndex(null); setTempSlot({ day: 'الأحد', hour: '', period: 'مساءً' }); }}
                            className={cn(
                                "text-[9px] font-black px-3 py-1 transition-all uppercase italic border rounded-none",
                                isEditing ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-indigo-50 text-indigo-600 border-indigo-100"
                            )}
                        >
                            {isEditing ? 'إغلاق المحرر' : 'تعديل الجدول'}
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {en.schedule?.length > 0 ? en.schedule.map((slot, i) => (
                            <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-[10px] font-black text-slate-700 dark:text-slate-300 italic uppercase">
                                <span>{slot.day} {slot.hour}{slot.period === 'am' ? 'ص' : 'م'}</span>
                                {isEditing && (
                                    <div className="flex gap-2 ms-2 ps-2 border-r border-slate-200 dark:border-slate-700">
                                        <button onClick={() => { setEditSlotIndex(i); setTempSlot(slot); }} className="text-indigo-600 hover:text-indigo-700"><Edit size={12} /></button>
                                        <button onClick={() => onDeleteSlot(student, en, i)} className="text-rose-600 hover:text-rose-700"><Trash2 size={12} /></button>
                                    </div>
                                )}
                            </div>
                        )) : (
                            <p className="text-[10px] text-slate-400 italic">بانتظار تحديد الجدول...</p>
                        )}
                    </div>

                    {isEditing && (
                        <div className="p-4 bg-slate-900 border border-slate-800 text-white space-y-4 md:animate-in md:slide-in-from-top-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1.5">اليوم</p>
                                    <select value={tempSlot.day} onChange={(e) => setTempSlot({ ...tempSlot, day: e.target.value })} className="w-full text-xs font-black p-2 bg-slate-800 border-none outline-none italic uppercase">
                                        {['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'].map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1.5">الساعة</p>
                                    <input type="text" value={tempSlot.hour} onChange={(e) => setTempSlot({ ...tempSlot, hour: e.target.value })} placeholder="مثال: 4" className="w-full text-xs font-black p-2 bg-slate-800 border-none outline-none italic" />
                                </div>
                            </div>
                            <button onClick={handleSaveSlot} className="w-full bg-indigo-600 text-white font-black text-[10px] py-3 uppercase tracking-widest italic hover:bg-indigo-700 transition-colors">
                                {editSlotIndex !== null ? 'تأكيد التعديلات' : 'إضافة للجداول'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Notes Engine */}
                <div className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/20 p-5 relative">
                     <div className="flex items-center justify-between mb-4">
                        <h5 className="text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest flex items-center gap-2 italic">
                            <MessageSquare size={14} /> سجل الملاحظات
                        </h5>
                        {isSavingNotes ? (
                           <span className="text-[8px] font-black text-amber-600 animate-pulse italic">جاري الحفظ...</span>
                        ) : notes.trim() !== '' && (
                           <AlertCircle size={14} className="text-amber-400" />
                        )}
                    </div>
                    <textarea 
                        value={notes}
                        onChange={(e) => { setNotes(e.target.value); triggerSave(e.target.value); }}
                        placeholder="وثقي ملاحظات التقوية أو التنبيهات هنا..."
                        className="w-full bg-transparent border-none focus:ring-0 text-xs font-bold text-slate-700 dark:text-slate-300 placeholder:text-amber-200 dark:placeholder:text-amber-800/50 resize-none min-h-[80px] p-0"
                    />
                </div>

                {/* Attendance Interface */}
                <div className="mt-auto pt-6 border-t border-slate-50 dark:border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 italic">
                            <Activity size={12} className="text-emerald-500" /> التوثيق السريع
                        </h5>
                        <button onClick={() => onViewHistory(student.id, student.name, student.grade, en.subject, student.curriculum)} className="text-[9px] font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest italic">
                            السجل التاريخي
                        </button>
                    </div>

                    <div className="flex gap-3">
                         <div className="relative flex-1">
                            <Calendar size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input type="date" value={logDate} onChange={(e) => onDateChange(e.target.value)} className="w-full pr-10 pl-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-[10px] font-black rounded-none outline-none focus:border-indigo-600 transition-all italic" />
                        </div>
                        <button onClick={() => onLogAttendance(student, en)} className="bg-emerald-600 text-white px-6 font-black text-[10px] uppercase tracking-widest italic hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/10">
                            تسجيل
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
