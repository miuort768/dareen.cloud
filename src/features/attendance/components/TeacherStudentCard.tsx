import React, { useState, useRef } from 'react';
import { BookOpen, Calendar, Clock, Edit, Trash2, TrendingUp, Activity, MessageSquare, Radio, Play } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { Student, Enrollment, ScheduleSlot } from '../types';
import { useNavigate } from 'react-router-dom';
import { startLiveSession } from '../../../services/liveSessionService';

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
    const timerIntervalRef = useRef<ReturnType<typeof setInterval>>(null);

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
            } catch (e) { console.warn('فشل إنهاء الجلسة النشطة في الخادم'); }
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
            } catch (e) { console.warn('فشل بدء الجلسة النشطة في الخادم'); }
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
            const result = await startLiveSession({
                title: `حصة مباشرة: ${student.name}`,
                subject: en.subject,
                meetingProvider: 'google_meet',
                meetingUrl: 'https://meet.google.com/new',
                targetStudentId: student.id,
            });
            if (result?.meetingUrl) window.open(result.meetingUrl, '_blank');
        } catch (err) {
            alert(`فشل بدء البث: ${err.message}`);
        }
    };

    return (
        <div className="bg-card border border-border/50 shadow-soft rounded-card overflow-hidden flex flex-col group transition-all hover:shadow-soft">
            {/* Header Accent */}
            <div className={cn(
                "h-1.5 w-full bg-surface transition-all",
                timerRunning && "bg-error animate-pulse"
            )}></div>

            <div className="p-5 flex-1 flex flex-col space-y-4">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-micro font-black bg-primary-soft text-primary">
                            {student.grade?.charAt(0) || student.name.charAt(0)}
                        </div>
                        <div>
                            <h4 className="font-normal text-main text-sm leading-tight">{student.name}</h4>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-micro font-normal text-muted uppercase">{student.grade}</span>
                                <span className="w-1 h-1 bg-surface rounded-full"></span>
                                <div className="flex items-center gap-1">
                                    <BookOpen size={10} className="text-primary" />
                                    <span className="text-micro font-normal text-muted">{en.subject}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="text-start">
                        <span className="text-micro font-normal text-muted block mb-0.5">التقدم</span>
                        <div className="flex items-center justify-end gap-1">
                             <TrendingUp size={12} className={cn(attendancePercent > 85 ? "text-error" : "text-primary")} />
                             <span className="text-sm font-medium text-main leading-none">{Math.round(attendancePercent)}%</span>
                        </div>
                    </div>
                </div>

                {/* Control Hub */}
                <div className="grid grid-cols-2 gap-2">
                    <button 
                        onClick={toggleTimer}
                        className={cn(
                            "flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all shadow-soft active:scale-95",
                            timerRunning 
                                ? "bg-error border-error text-on-primary" 
                                : "bg-primary border-primary text-on-primary hover:bg-primary-hover"
                        )}
                    >
                        <div className="flex items-center gap-2">
                            <Clock size={14} className={cn(timerRunning && "animate-spin-slow")} />
                            <span className="text-xs font-bold font-mono">{formatTime(timerSeconds)}</span>
                        </div>
                        <span className="text-micro font-bold uppercase">{timerRunning ? 'إنهاء' : 'بدء'}</span>
                    </button>
                    
                    <button 
                        onClick={() => onReschedule?.(student, en)}
                        className="flex items-center justify-center gap-2 px-3 py-2.5 bg-card border border-border text-muted hover:bg-surface rounded-xl font-bold text-micro uppercase transition-all shadow-soft active:scale-95"
                    >
                        <Calendar size={14} /> إعادة جدولة
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-micro font-normal uppercase text-muted">
                        <div className="flex items-center gap-1.5">
                            <Activity size={12} className="text-primary" />
                            <span>تغطية الحصص</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-xs text-primary font-medium">{actualSessionsUsed}</span>
                            <span className="opacity-50">/ {en.sessionsTotal}</span>
                        </div>
                    </div>
                    <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                        <div
                            className={cn(
                                "h-full transition-all duration-1000 ease-out",
                                attendancePercent > 85 ? "bg-error" : attendancePercent > 60 ? "bg-warning" : "bg-success"
                            )}
                            style={{ width: `${Math.min(100, attendancePercent)}%` }}
                        />
                    </div>
                </div>

                {/* Schedule */}
                <div className="space-y-2 pt-2 border-t border-border/50">
                    <div className="flex items-center justify-between">
                        <h5 className="text-micro font-normal text-muted uppercase flex items-center gap-1.5">
                            <Clock size={10} className="text-primary" /> الجدول الإسبوعي
                        </h5>
                            <button
                                onClick={() => { setIsEditing(!isEditing); setEditSlotIndex(null); }}
                                className={`text-micro font-bold px-2 py-0.5 rounded-lg transition-all ${isEditing ? 'bg-error-soft text-error' : 'bg-primary-soft text-primary'}`}
                        >
                            {isEditing ? 'إلغاء' : 'تعديل'}
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                        {en.schedule?.length > 0 ? en.schedule.map((slot, i) => (
                            <div key={`att-${i}`} className="flex items-center gap-1.5 px-2 py-1 bg-card border border-border/50 text-micro font-bold text-muted rounded-xl">
                                <span>{slot.day} {slot.hour}{slot.period === 'am' ? 'ص' : 'م'}</span>
                                {isEditing && (
                                    <div className="flex gap-1.5 ms-1.5 ps-1.5 border-s border-border/50">
                                        <button onClick={() => { setEditSlotIndex(i); setTempSlot(slot); }} aria-label="تعديل الموعد" className="text-primary"><Edit size={10} /></button>
                                        <button onClick={() => onDeleteSlot(student, en, i)} aria-label="حذف الموعد" className="text-error"><Trash2 size={10} /></button>
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
                                    <select value={tempSlot.day} onChange={(e) => setTempSlot({ ...tempSlot, day: e.target.value })} className="w-full text-micro font-bold p-1.5 bg-white/10 border-none rounded-xl outline-none">
                                        {['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'].map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <p className="text-micro font-bold text-on-primary/60 mb-1 uppercase">الساعة</p>
                                    <input type="text" value={tempSlot.hour} onChange={(e) => setTempSlot({ ...tempSlot, hour: e.target.value.replace(/^0+/, '') })} placeholder="مثال: 4" className="w-full text-micro font-bold p-1.5 bg-white/10 border-none rounded-xl outline-none" />
                                </div>
                            </div>
                            <button onClick={handleSaveSlot} className="w-full bg-white text-primary font-bold text-micro py-2 rounded-xl hover:bg-white/90 transition-colors shadow-sm active:scale-95">
                                {editSlotIndex !== null ? 'تحديث' : 'إضافة'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Notes */}
                <div className="p-3 rounded-xl border border-warning/10 bg-warning-soft/40">
                    <div className="flex items-center justify-between mb-2">
                        <h5 className="text-micro font-bold uppercase flex items-center gap-1.5 text-warning">
                            <MessageSquare size={12} /> ملاحظات
                        </h5>
                        {isSavingNotes && <span className="text-micro font-bold animate-pulse text-warning">جاري الحفظ...</span>}
                    </div>
                    <textarea 
                        value={notes}
                        onChange={(e) => { setNotes(e.target.value); triggerSave(e.target.value); }}
                        placeholder="وثقي ملاحظات الحصة القادمة..."
                        className="w-full bg-transparent border-none focus:ring-0 text-micro font-bold text-main placeholder:text-warning resize-none min-h-[60px] p-0"
                    />
                </div>

                {/* Live Stream Quick Start */}
                <button 
                    onClick={startLiveStream}
                    className="w-full bg-error hover:bg-error text-on-primary py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-micro uppercase tracking-widest shadow-sm active:scale-95 group transition-all"
                >
                    <Radio size={14} className="animate-pulse" />
                    <span>بدء بث مباشر مع {student.name.split(' ')[0]}</span>
                    <Play size={10} className="fill-current opacity-50 group-hover:translate-x-[-2px] transition-transform" />
                </button>

                {/* Attendance Footer */}
                <div className="pt-4 border-t border-border/50 space-y-3 mt-auto">
                    <div className="flex items-center justify-between">
                        <h5 className="text-micro font-normal text-muted uppercase flex items-center gap-1.5">
                            <Activity size={12} className="text-success" /> التحضير والمتابعة
                        </h5>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5">
                        <input 
                            type="date" 
                            value={logDate} 
                            onChange={(e) => onDateChange(e.target.value)} 
                            className="w-full px-2 py-2 bg-card border border-border text-micro font-bold rounded-xl outline-none focus:border-primary transition-all" 
                        />
                        <button 
                            onClick={() => onViewHistory(student.id, student.name, student.grade, en.subject, student.curriculum)}
                            className="w-full bg-error text-on-primary px-1 py-2 font-bold text-micro rounded-xl hover:bg-error transition-all shadow-sm active:scale-95"
                        >
                            السجل
                        </button>
                        <button 
                            onClick={() => onLogAttendance(student, en)} 
                            className="w-full bg-success text-on-primary px-2 py-2 font-bold text-micro rounded-xl hover:bg-success transition-all shadow-sm active:scale-95"
                        >
                            تسجيل
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
