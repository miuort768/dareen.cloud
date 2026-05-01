import React, { useState, useRef } from 'react';
import { BookOpen, Calendar, Clock, Edit, Trash2, TrendingUp, Activity, MessageSquare, Radio, Play } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { Student, Enrollment, ScheduleSlot } from '../types';
import { useNavigate } from 'react-router-dom';

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
    const timerIntervalRef = useRef<any>(null);

    React.useEffect(() => {
        const saved = localStorage.getItem(`active_timer_${student.id}`);
        if (saved) {
            try {
                const { startedAt, subject } = JSON.parse(saved);
                if (subject === en.subject) {
                    const elapsed = Math.floor((Date.now() - startedAt) / 1000);
                    setTimerSeconds(elapsed);
                    setTimerRunning(true);
                    timerIntervalRef.current = setInterval(() => {
                        setTimerSeconds(Math.floor((Date.now() - startedAt) / 1000));
                    }, 1000);
                }
            } catch (e) { console.error('Failed to restore timer', e); }
        }
        return () => {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        };
    }, [student.id, en.subject]);

    const toggleTimer = async () => {
        if (timerRunning) {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            setTimerRunning(false);
            setTimerSeconds(0);
            localStorage.removeItem(`active_timer_${student.id}`);
            try {
                const token = localStorage.getItem('auth_token');
                await fetch('/api/active-sessions', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ studentId: student.id, subject: en.subject })
                });
            } catch (e) { /* silent */ }
        } else {
            const start = Date.now();
            setTimerSeconds(0);
            timerIntervalRef.current = setInterval(() => {
                setTimerSeconds(Math.floor((Date.now() - start) / 1000));
            }, 1000);
            setTimerRunning(true);
            localStorage.setItem(`active_timer_${student.id}`, JSON.stringify({
                startedAt: start,
                subject: en.subject
            }));
            try {
                const token = localStorage.getItem('auth_token');
                await fetch('/api/active-sessions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ studentId: student.id, subject: en.subject })
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

    const navigate = useNavigate();

    const startLiveStream = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch('/api/live/start', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: `حصة مباشرة: ${student.name}`,
                    subject: en.subject,
                    targetStudentId: student.id
                })
            });
            const data = await response.json();
            if (!response.ok) {
                alert(`خطأ من الخادم (${response.status}): ${data.error || JSON.stringify(data)}`);
                return;
            }
            navigate(`/classroom/${data.id}`);
        } catch (err: any) {
            alert(`خطأ في الشبكة: ${err.message}`);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-none shadow-sm overflow-hidden flex flex-col group transition-all hover:shadow-md">
            {/* Header Accent */}
            <div className={cn(
                "h-1.5 w-full bg-slate-100 dark:bg-slate-800 transition-all",
                timerRunning && "bg-rose-500 animate-pulse"
            )}></div>

            <div className="p-5 flex-1 flex flex-col space-y-4">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#eef2ff] dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-[10px] font-bold text-[#5c59f2]">
                            {student.grade?.charAt(0) || student.name.charAt(0)}
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800 dark:text-white text-sm leading-tight">{student.name}</h4>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[9px] font-bold text-slate-400 uppercase">{student.grade}</span>
                                <span className="w-1 h-1 bg-slate-200 dark:bg-slate-700 rounded-full"></span>
                                <div className="flex items-center gap-1">
                                    <BookOpen size={10} className="text-[#5c59f2]" />
                                    <span className="text-[9px] font-bold text-slate-400">{en.subject}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 block mb-0.5">التقدم</span>
                        <div className="flex items-center justify-end gap-1">
                             <TrendingUp size={12} className={cn(attendancePercent > 85 ? "text-rose-500" : "text-emerald-500")} />
                             <span className="text-sm font-black text-slate-800 dark:text-white leading-none">{Math.round(attendancePercent)}%</span>
                        </div>
                    </div>
                </div>

                {/* Control Hub */}
                <div className="grid grid-cols-2 gap-2">
                    <button 
                        onClick={toggleTimer}
                        className={cn(
                            "flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all",
                            timerRunning 
                                ? "bg-rose-600 border-rose-500 text-white shadow-sm" 
                                : "bg-slate-900 dark:bg-slate-800 border-slate-800 text-white hover:bg-black"
                        )}
                    >
                        <div className="flex items-center gap-2">
                            <Clock size={14} className={cn(timerRunning && "animate-spin-slow")} />
                            <span className="text-xs font-bold font-mono">{formatTime(timerSeconds)}</span>
                        </div>
                        <span className="text-[9px] font-bold uppercase">{timerRunning ? 'إنهاء' : 'بدء'}</span>
                    </button>
                    
                    <button 
                        onClick={() => onReschedule?.(student, en)}
                        className="flex items-center justify-center gap-2 px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 rounded-xl font-bold text-[9px] uppercase transition-all"
                    >
                        <Calendar size={14} /> إعادة جدولة
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[9px] font-bold uppercase text-slate-400">
                        <div className="flex items-center gap-1.5">
                            <Activity size={12} className="text-[#5c59f2]" />
                            <span>تغطية الحصص</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-xs text-[#5c59f2] font-black">{actualSessionsUsed}</span>
                            <span className="opacity-50">/ {en.sessionsTotal}</span>
                        </div>
                    </div>
                    <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className={cn(
                                "h-full transition-all duration-1000 ease-out",
                                attendancePercent > 85 ? "bg-rose-500" : attendancePercent > 60 ? "bg-amber-500" : "bg-emerald-500"
                            )}
                            style={{ width: `${Math.min(100, attendancePercent)}%` }}
                        />
                    </div>
                </div>

                {/* Schedule */}
                <div className="space-y-2 pt-2 border-t border-slate-50 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                        <h5 className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
                            <Clock size={10} className="text-[#5c59f2]" /> الجدول الإسبوعي
                        </h5>
                        <button
                            onClick={() => { setIsEditing(!isEditing); setEditSlotIndex(null); }}
                            className={cn(
                                "text-[9px] font-bold px-2 py-0.5 rounded-lg transition-all border",
                                isEditing ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-indigo-50 text-indigo-600 border-indigo-100"
                            )}
                        >
                            {isEditing ? 'إلغاء' : 'تعديل'}
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                        {en.schedule?.length > 0 ? en.schedule.map((slot, i) => (
                            <div key={i} className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-[9px] font-bold text-slate-600 dark:text-slate-400 rounded-lg">
                                <span>{slot.day} {slot.hour}{slot.period === 'am' ? 'ص' : 'م'}</span>
                                {isEditing && (
                                    <div className="flex gap-1.5 ms-1.5 ps-1.5 border-r border-slate-200 dark:border-slate-700">
                                        <button onClick={() => { setEditSlotIndex(i); setTempSlot(slot); }} className="text-[#5c59f2]"><Edit size={10} /></button>
                                        <button onClick={() => onDeleteSlot(student, en, i)} className="text-rose-600"><Trash2 size={10} /></button>
                                    </div>
                                )}
                            </div>
                        )) : (
                            <p className="text-[9px] text-slate-400 italic">لا يوجد جدول محدد</p>
                        )}
                    </div>

                    {isEditing && (
                        <div className="p-3 bg-slate-900 rounded-xl text-white space-y-3 mt-2">
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <p className="text-[8px] font-bold text-slate-400 mb-1 uppercase">اليوم</p>
                                    <select value={tempSlot.day} onChange={(e) => setTempSlot({ ...tempSlot, day: e.target.value })} className="w-full text-[10px] font-bold p-1.5 bg-slate-800 border-none rounded-lg outline-none">
                                        {['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'].map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <p className="text-[8px] font-bold text-slate-400 mb-1 uppercase">الساعة</p>
                                    <input type="text" value={tempSlot.hour} onChange={(e) => setTempSlot({ ...tempSlot, hour: e.target.value })} placeholder="مثال: 4" className="w-full text-[10px] font-bold p-1.5 bg-slate-800 border-none rounded-lg outline-none" />
                                </div>
                            </div>
                            <button onClick={handleSaveSlot} className="w-full bg-[#5c59f2] text-white font-bold text-[10px] py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                                {editSlotIndex !== null ? 'تحديث' : 'إضافة'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Notes */}
                <div className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/20 p-3 rounded-xl relative">
                    <div className="flex items-center justify-between mb-2">
                        <h5 className="text-[9px] font-bold text-amber-700 dark:text-amber-400 uppercase flex items-center gap-1.5">
                            <MessageSquare size={12} /> ملاحظات
                        </h5>
                        {isSavingNotes && <span className="text-[8px] font-bold text-amber-600 animate-pulse">جاري الحفظ...</span>}
                    </div>
                    <textarea 
                        value={notes}
                        onChange={(e) => { setNotes(e.target.value); triggerSave(e.target.value); }}
                        placeholder="وثقي ملاحظات الحصة القادمة..."
                        className="w-full bg-transparent border-none focus:ring-0 text-[10px] font-medium text-slate-700 dark:text-slate-300 placeholder:text-amber-300 resize-none min-h-[60px] p-0"
                    />
                </div>

                {/* Live Stream Quick Start */}
                <button 
                    onClick={startLiveStream}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-red-600/20 transition-all active:scale-95 group"
                >
                    <Radio size={14} className="animate-pulse" />
                    <span>بدء بث مباشر مع {student.name.split(' ')[0]}</span>
                    <Play size={10} className="fill-current opacity-50 group-hover:translate-x-[-2px] transition-transform" />
                </button>

                {/* Attendance Footer */}
                <div className="pt-4 border-t border-slate-50 dark:border-slate-800 space-y-3 mt-auto">
                    <div className="flex items-center justify-between">
                        <h5 className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
                            <Activity size={12} className="text-emerald-500" /> التحضير والمتابعة
                        </h5>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5">
                        <input 
                            type="date" 
                            value={logDate} 
                            onChange={(e) => onDateChange(e.target.value)} 
                            className="w-full px-2 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[9px] font-bold rounded-xl outline-none focus:border-[#5c59f2] transition-all" 
                        />
                        <button 
                            onClick={() => onViewHistory(student.id, student.name, student.grade, en.subject, student.curriculum)}
                            className="w-full bg-rose-600 text-white px-1 py-2 font-bold text-[9px] rounded-xl hover:bg-rose-700 transition-all shadow-sm"
                        >
                            السجل
                        </button>
                        <button 
                            onClick={() => onLogAttendance(student, en)} 
                            className="w-full bg-emerald-600 text-white px-2 py-2 font-bold text-[10px] rounded-xl hover:bg-emerald-700 transition-all shadow-sm"
                        >
                            تسجيل
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
