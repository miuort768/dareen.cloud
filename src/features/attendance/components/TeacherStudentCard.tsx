import React, { useState, useRef } from 'react';
import { BookOpen, Calendar, CheckCircle2, Clock, Edit, Trash2, TrendingUp, XCircle } from 'lucide-react';
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

    // Keep internal notes in sync with prop changes
    React.useEffect(() => {
        setNotes(en.nextSessionNotes || '');
    }, [en.nextSessionNotes]);

    // Proper debounce save function
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
            // Stop timer
            clearInterval(timerInterval);
            setTimerRunning(false);
            // Remove active session from backend
            try {
                const token = localStorage.getItem('token');
                await fetch('/api/active-sessions', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ studentId: student.id, subject: en.subject })
                });
            } catch (e) { /* silent */ }
        } else {
            // Start timer
            const start = Date.now() - timerSeconds * 1000;
            const interval = setInterval(() => {
                setTimerSeconds(Math.floor((Date.now() - start) / 1000));
            }, 1000);
            setTimerInterval(interval);
            setTimerRunning(true);
            // Register active session in backend + notify parent
            try {
                const token = localStorage.getItem('token');
                await fetch('/api/active-sessions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ studentId: student.id, subject: en.subject })
                });
                // Send push notification to parent
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

        const enIndex = student.enrollments.indexOf(en);
        onUpdateSchedule(student, enIndex, newSch);

        setTempSlot({ day: 'الأحد', hour: '', period: 'مساءً' });
        setEditSlotIndex(null);
    };

    const handleDeleteSlot = (index: number) => {
        onDeleteSlot(student, en, index);
    };

    return (
        <div className="relative bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:border-primary-200 dark:hover:border-primary-900/50 transition-all duration-300 flex flex-col group overflow-hidden rounded-none">

            <div className="p-4 md:p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-5 pb-4 border-b border-gray-50 dark:border-gray-700/50">
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 shrink-0 bg-primary-600 dark:bg-primary-500 flex items-center justify-center text-white font-black text-base md:text-xl rounded-none shadow-lg shadow-primary-500/20">
                            {getGradeDisplay(student.grade)}
                        </div>
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5 md:gap-2 mb-1">
                                <h4 className="font-black text-gray-900 dark:text-white text-sm md:text-lg leading-tight truncate max-w-[120px] sm:max-w-xs">{student.name}</h4>
                                <span className="text-[8px] md:text-[9px] font-black bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 px-1.5 md:px-2 py-0.5 rounded-none uppercase tracking-tighter shrink-0">
                                    {student.grade}
                                </span>
                            </div>
                            <span className="text-[9px] md:text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-1 truncate">
                                <BookOpen size={10} className="text-primary-500 shrink-0" />
                                <span className="truncate">{en.subject}</span>
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

                {/* THE TIMER (Suggestion 3) */}
                <div className="flex items-center gap-3 mb-6">
                    <button 
                        onClick={toggleTimer}
                        className={cn(
                            "flex-1 flex items-center justify-between p-3 border-2 border-gray-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all",
                            timerRunning ? "bg-rose-500 text-white" : "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/10"
                        )}
                    >
                        <div className="flex items-center gap-2">
                            <Clock size={16} className={cn(timerRunning && "animate-spin-slow")} />
                            <span className="text-sm font-black tracking-tighter font-mono">{formatTime(timerSeconds)}</span>
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest">{timerRunning ? 'إيقاف المؤقت' : 'بدء الحصة'}</span>
                    </button>
                    
                    <button 
                        onClick={() => onReschedule?.(student, en)}
                        className="p-3 bg-white border-2 border-gray-950 text-gray-950 hover:bg-amber-100 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                    >
                        <Calendar size={18} />
                    </button>
                </div>

                <div className="mb-2 p-0 space-y-2 rounded-none">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <TrendingUp size={14} className="text-primary-500" />
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">تغطية المنهج</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className={cn(
                                "text-lg font-black",
                                attendancePercent > 80 ? "text-rose-600" : "text-primary-600"
                            )}>{actualSessionsUsed}</span>
                            <span className="text-[10px] font-bold text-gray-400">/ {en.sessionsTotal} حصص</span>
                        </div>
                    </div>
                    <div className="h-2.5 bg-gray-200 dark:bg-gray-700 overflow-hidden rounded-none shadow-inner relative">
                        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(45deg, white 25%, transparent 25%, transparent 50%, white 50%, white 75%, transparent 75%, transparent)', backgroundSize: '10px 10px' }}></div>
                        <div
                            className={cn(
                                "h-full transition-all duration-1000 ease-out shadow-lg rounded-none relative",
                                attendancePercent > 85 ? "bg-rose-500" : attendancePercent > 60 ? "bg-amber-500" : "bg-emerald-500"
                            )}
                            style={{ width: `${Math.min(100, attendancePercent)}%` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
                        </div>
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
                            type="button"
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-1 rounded-none text-[10px] font-black transition-all border",
                                isEditing
                                    ? "bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800"
                                    : "bg-primary-50 text-primary-600 border-primary-200 hover:bg-primary-100 dark:bg-primary-900/30 dark:text-primary-400 dark:border-primary-800"
                            )}
                        >
                            {isEditing ? (
                                <>
                                    <XCircle size={12} />
                                    <span>إلغاء</span>
                                </>
                            ) : (
                                <>
                                    <Edit size={12} />
                                    <span>تعديل الجدول</span>
                                </>
                            )}
                        </button>
                    </div>

                    <div className={cn(
                        "transition-all duration-300",
                        isEditing ? "grid grid-cols-2 gap-2" : "flex flex-wrap gap-1"
                    )}>
                        {en.schedule?.length > 0 ? en.schedule.map((slot, i) => (
                            <div key={i} className={cn(
                                "group/slot relative border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 px-2 py-1 flex items-center gap-1 rounded transition-all",
                                isEditing ? "w-full justify-center py-1.5" : ""
                            )}>
                                <span className="text-[9px] font-bold text-gray-700 dark:text-gray-300">{slot.day} {slot.hour}{slot.period === 'am' ? 'ص' : 'م'}</span>
                                {isEditing && (
                                    <div className="flex gap-2 ms-2 ps-2 border-s border-gray-200 dark:border-gray-700">
                                        <button type="button" onClick={() => { setEditSlotIndex(i); setTempSlot(slot); }} className="text-blue-600 hover:text-blue-700 transition-colors p-1 hover:bg-blue-50 dark:hover:bg-blue-900/20"><Edit size={16} /></button>
                                        <button type="button" onClick={() => handleDeleteSlot(i)} className="text-rose-600 hover:text-rose-700 transition-colors p-1 hover:bg-rose-50 dark:hover:bg-rose-900/20"><Trash2 size={16} /></button>
                                    </div>
                                )}
                            </div>
                        )) : (
                            <p className={cn("text-[9px] text-gray-400 italic", isEditing ? "col-span-2 text-center" : "")}>لم يتم تحديد مواعيد أسبوعية بعد</p>
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
                                <button onClick={handleSaveSlot} className="flex-1 bg-primary-600 text-white text-[10px] font-black py-2.5 hover:bg-primary-700 shadow-lg shadow-primary-500/20 rounded-none transition-all active:scale-[0.98]">
                                    {editSlotIndex !== null ? 'حفظ التعديل' : 'إضافة للجداول'}
                                </button>
                                <button onClick={() => { setEditSlotIndex(null); setTempSlot({ day: 'الأحد', hour: '', period: 'مساءً' }); }} className="px-4 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[10px] font-black rounded-none hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">إلغاء</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* THE SCRATCHPAD (Suggestions 3) - Rename & Auto-save Persistence improved */}
                <div className="mb-6 p-4 bg-amber-50/50 dark:bg-amber-900/10 border-2 border-dashed border-amber-200 dark:border-amber-800/50 relative group/notes transition-all hover:bg-amber-50 dark:hover:bg-amber-900/20">
                    <div className="flex items-center justify-between mb-3 border-b border-amber-200 dark:border-amber-800/50 pb-2">
                        <div className="flex items-center gap-2">
                            <h5 className="text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                                <Edit size={12} />
                                ملاحظات قبل الحصة
                            </h5>
                            {isSavingNotes ? (
                                <span className="flex items-center gap-1 text-[8px] font-black text-amber-600 animate-pulse bg-white dark:bg-amber-950 px-2 py-0.5 border border-amber-200">
                                    <div className="w-1 h-1 bg-amber-600 rounded-full animate-bounce"></div>
                                    جاري الحفظ تلقائياً...
                                </span>
                            ) : notes.trim() !== (en.nextSessionNotes || '').trim() ? (
                                <span className="text-[8px] font-black text-rose-500 bg-white dark:bg-amber-950 px-2 py-0.5 border border-rose-200 animate-in fade-in duration-300">جاري الكتابة...</span>
                            ) : notes.trim() !== '' && (
                                <span className="text-[8px] font-black text-emerald-600 bg-white dark:bg-emerald-950 px-2 py-0.5 border border-emerald-200 flex items-center gap-1">
                                    <CheckCircle2 size={8} /> تم الحفظ
                                </span>
                            )}
                        </div>
                    </div>
                    
                    <textarea 
                        value={notes}
                        onChange={(e) => {
                            setNotes(e.target.value);
                            triggerSave(e.target.value);
                        }}
                        onBlur={async () => {
                            if (debounceRef.current) clearTimeout(debounceRef.current);
                            if (notes.trim() !== (en.nextSessionNotes || '').trim()) {
                                setIsSavingNotes(true);
                                try {
                                    await onUpdateNotes?.(student.id, en.subject, notes);
                                } finally {
                                    setTimeout(() => setIsSavingNotes(false), 500);
                                }
                            }
                        }}
                        placeholder="اكتبي ملاحظات التقوية أو التنبيهات هنا..."
                        className="w-full bg-transparent border-none focus:ring-0 text-xs font-bold text-gray-700 dark:text-gray-300 placeholder:text-amber-300 dark:placeholder:text-amber-900/50 resize-none min-h-[80px] p-0 leading-relaxed"
                    />
                    
                    <div className="absolute bottom-1 right-2 opacity-30 pointer-events-none">
                        <TrendingUp size={32} className="text-amber-200 dark:text-amber-900/20" />
                    </div>
                </div>

                <div className="mt-auto pt-6 border-t border-gray-50 dark:border-gray-700/50 space-y-4">
                    <div className="flex items-center justify-between">
                        <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Calendar size={12} className="text-emerald-500" />
                            تسجيل الحضور السريع
                        </h5>
                        <button onClick={() => onViewHistory(student.id, student.name, student.grade, en.subject, student.curriculum)} className="text-[10px] font-black text-primary-600 bg-primary-50 dark:bg-primary-900/30 px-2.5 py-1 rounded-none border border-primary-200 dark:border-primary-800 flex items-center gap-1.5 hover:bg-primary-100 transition-colors">
                            <BookOpen size={12} /> عرض السجل بالكامل
                        </button>
                    </div>

                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <input type="date" value={logDate} onChange={(e) => onDateChange(e.target.value)} className="w-full text-[10px] p-2.5 bg-gray-50 dark:bg-gray-900 border-none ring-1 ring-gray-100 dark:ring-gray-700 focus:ring-primary-500 transition-all dark:text-white rounded" />
                        </div>
                        <button onClick={() => onLogAttendance(student, en)} className="bg-emerald-600 text-white px-5 text-[10px] font-black hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/10 active:scale-95 rounded-none">
                            <CheckCircle2 size={14} /> تسجيل الحضور
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
