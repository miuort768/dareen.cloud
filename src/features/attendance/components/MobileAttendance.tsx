import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Users, BookOpen, History, Activity, CheckCircle2, XCircle,
    Clock, Loader2, Sparkles, SlidersHorizontal, Calendar
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useCurrentUser, useShowNotification, useWhatsappAutoNotify, useWhatsappTemplate } from '../../../context/AppContext';
import { triggerHaptic } from '../../../lib/haptics';
import { useAttendance } from '../hooks/useAttendance';
import type { PeriodFilter } from './AttendanceFilters';
import type { Student, Enrollment, Session } from '../types';
import { SecureAttendanceModal } from '../../../shared/components/SecureAttendanceModal';
import { ConfirmModal } from '../../../shared/components/ConfirmModal';
import { AttendanceHistoryModal } from './AttendanceHistoryModal';
import { RescheduleModal } from './RescheduleModal';
import { generateWhatsAppLink } from '../../../lib/whatsapp';

const fadeUp = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.35, ease: 'easeOut' }
};

export const MobileAttendance = () => {
    const currentUser = useCurrentUser();
    const showNotification = useShowNotification();
    const whatsappAutoNotify = useWhatsappAutoNotify();
    const whatsappTemplate = useWhatsappTemplate();
    const mountedRef = useRef(true);

    const [activeSection, setActiveSection] = useState<'record' | 'history'>('record');
    const [date, setDate] = useState(new Date().toLocaleDateString('en-CA'));
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterTeacher, setFilterTeacher] = useState<string>('all');
    const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('today');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');

    const [isRefreshing, setIsRefreshing] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);
    const [startY, setStartY] = useState(0);

    const [logDate, setLogDate] = useState(new Date().toLocaleDateString('en-CA'));
    const [isLogging, setIsLogging] = useState(false);
    const [secureModalData, setSecureModalData] = useState<{ student: Student, enrollment: Enrollment } | null>(null);
    const [historyStudent, setHistoryStudent] = useState<{ id: string, name: string, grade?: string, subject?: string, curriculum?: string } | null>(null);
    const [deletingSlot, setDeletingSlot] = useState<{ student: Student, enrollment: Enrollment, slotIndex: number } | null>(null);
    const [rescheduleData, setRescheduleData] = useState<{ student: Student, enrollment: Enrollment } | null>(null);

    const dateRange = useMemo(() => {
        const d = new Date(date);
        switch (periodFilter) {
            case 'today':
                return { start: date, end: date };
            case 'week': {
                const day = d.getDay();
                const diff = day === 0 ? 6 : day - 1;
                const mon = new Date(d);
                mon.setDate(d.getDate() - diff);
                const sun = new Date(d);
                sun.setDate(mon.getDate() + 6);
                return { start: mon.toLocaleDateString('en-CA'), end: sun.toLocaleDateString('en-CA') };
            }
            case 'month':
                return {
                    start: new Date(d.getFullYear(), d.getMonth(), 1).toLocaleDateString('en-CA'),
                    end: new Date(d.getFullYear(), d.getMonth() + 1, 0).toLocaleDateString('en-CA')
                };
            case 'custom':
                return { start: customStartDate || date, end: customEndDate || date };
            default:
                return { start: date, end: date };
        }
    }, [date, periodFilter, customStartDate, customEndDate]);

    const periodLabel = useMemo(() => {
        switch (periodFilter) {
            case 'today': return 'اليوم';
            case 'week': return 'الأسبوع';
            case 'month': return 'الشهر';
            case 'custom': return 'الفترة';
            default: return 'اليوم';
        }
    }, [periodFilter]);

    const {
        students,
        allSessions,
        updateStatus,
        logAttendance,
        updateSchedule,
        updateEnrollmentNotes,
        requestReschedule,
        stats,
        periodStats,
        matchedEnrollments,
        uniqueTeachers,
        refresh,
        teacherStats
    } = useAttendance(currentUser, date, dateRange);

    const isTeacher = currentUser?.role === 'teacher';

    const filteredSessions = allSessions.filter(s => {
        const dateMatch = s.date === date || (s.status === 'scheduled' && (new Date(date).getTime() - new Date(s.date).getTime()) / (1000 * 3600 * 24) <= 1);
        if (!dateMatch) return false;
        const searchMatch = !searchTerm ||
            (s.studentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.teacherName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.subject || '').toLowerCase().includes(searchTerm.toLowerCase());
        const statusMatch = filterStatus === 'all' || s.status === filterStatus;
        const teacherMatch = filterTeacher === 'all' || s.teacherName === filterTeacher;
        return searchMatch && statusMatch && teacherMatch;
    });

    const getGradeDisplay = (studentName: string, grade?: string) => {
        if (!grade) return studentName.charAt(0);
        const numMatch = grade.match(/\d+/);
        if (numMatch) return numMatch[0];
        const mapping: Record<string, string> = {
            'الأول': '1', 'الثاني': '2', 'الثالث': '3', 'الرابع': '4', 'الخامس': '5', 'السادس': '6',
            'السابع': '7', 'الثامن': '8', 'التاسع': '9', 'العاشر': '10'
        };
        for (const [key, val] of Object.entries(mapping)) {
            if (grade.includes(key)) return val;
        }
        return studentName.charAt(0);
    };

    const handleConfirmLog = async (status: 'completed' | 'cancelled', topics?: string, homework?: string, needsCompensation?: boolean) => {
        if (!secureModalData || !logDate || isLogging) return;
        setIsLogging(true);
        const { student, enrollment } = secureModalData;
        const now = new Date();
        const currentTime = now.toLocaleTimeString('ar-EG', {
            hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true
        });
        const calculatedPrice = enrollment.price ? (enrollment.price - (enrollment.discount || 0)) : undefined;

        const success = await logAttendance({
            studentId: student.id,
            studentName: student.name,
            teacherName: enrollment.teacher,
            teacherId: enrollment.teacherId,
            subject: enrollment.subject,
            date: logDate,
            time: currentTime,
            status: status,
            day: new Date(logDate).toLocaleDateString('ar-EG', { weekday: 'long' }),
            topics, homework, needsCompensation,
            price: calculatedPrice
        });

        if (success) {
            showNotification(`تم تسجيل ${student.name} (${status === 'completed' ? 'حضور' : 'غياب'})`, 'success');
            if (whatsappAutoNotify && status === 'completed' && student.parentPhone) {
                const waLink = generateWhatsAppLink(student.parentPhone, whatsappTemplate, {
                    Student: student.name,
                    Subject: enrollment.subject,
                    Teacher: enrollment.teacher,
                    Date: logDate,
                    Price: calculatedPrice?.toString() || '0'
                });
                window.open(waLink, '_blank');
            }
            setSecureModalData(null);
        } else {
            showNotification('فشل تسجيل الحصة', 'error');
        }
        setIsLogging(false);
    };

    const handleViewHistory = (studentId: string, studentName: string, grade?: string, subject?: string) => {
        const foundStudent = students.find(s => s.id === studentId);
        const enrollment = foundStudent?.enrollments?.find(e => e.subject === subject);
        setHistoryStudent({
            id: studentId, name: studentName, grade, subject,
            curriculum: enrollment?.curriculum
        });
    };

    const handleBulkAttendance = async () => {
        const selectedDayName = new Date(logDate).toLocaleDateString('ar-EG', { weekday: 'long' });
        const todayStudents = (matchedEnrollments || []).filter(({ student, enrollment }) => {
            const isScheduledToday = enrollment.schedule?.some(slot => slot.day === selectedDayName);
            const alreadyLogged = allSessions.some(s =>
                s.studentId === student.id && s.subject === enrollment.subject && s.date === logDate
            );
            return isScheduledToday && !alreadyLogged;
        });

        if (todayStudents.length === 0) {
            showNotification('لا يوجد طلاب متاحون للتسجيل', 'info');
            return;
        }

        triggerHaptic('medium');

        const now = new Date();
        const currentTime = now.toLocaleTimeString('ar-EG', {
            hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true
        });

        let successCount = 0;
        for (const { student, enrollment } of todayStudents) {
            const success = await logAttendance({
                studentId: student.id,
                studentName: student.name,
                teacherName: enrollment.teacher,
                teacherId: enrollment.teacherId,
                subject: enrollment.subject,
                date: logDate,
                time: currentTime,
                status: 'completed',
                day: selectedDayName,
                price: enrollment.price ? (enrollment.price - (enrollment.discount || 0)) : undefined
            });
            if (success) successCount++;
        }
        showNotification(`تم تسجيل ${successCount} طالب بنجاح`, 'success');
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        if (window.scrollY === 0 && !isRefreshing) {
            setStartY(e.touches[0].clientY);
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (startY === 0 || isRefreshing || window.scrollY > 0) return;
        const currentY = e.touches[0].clientY;
        const diff = currentY - startY;
        if (diff > 0) {
            setPullDistance(Math.min(diff * 0.4, 90));
        }
    };

    const handleTouchEnd = async () => {
        if (pullDistance > 60) {
            setIsRefreshing(true);
            setPullDistance(50);
            triggerHaptic('medium');
            try { await refresh(); } catch (e) { console.error('Refresh failed', e); }
            setTimeout(() => {
                setIsRefreshing(false);
                setPullDistance(0);
                setStartY(0);
                triggerHaptic('light');
            }, 800);
        } else {
            setPullDistance(0);
            setStartY(0);
        }
    };

    const completedToday = stats.todayCompleted || 0;
    const cancelledToday = stats.todayCancelled || 0;
    const scheduledToday = stats.todayScheduled || 0;
    const totalToday = stats.todayTotal || 0;

    return (
        <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            dir="rtl"
            className="min-h-full pb-4 overflow-x-hidden relative bg-[#F8F8FC] dark:bg-slate-950"
        >
            {/* Pull to Refresh */}
            <motion.div
                style={{ height: pullDistance }}
                animate={{ height: isRefreshing ? 50 : pullDistance }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="overflow-hidden flex items-center justify-center w-full"
            >
                <div className="flex items-center gap-2.5 text-[#8B5CF6] font-medium text-xs">
                    {isRefreshing ? (
                        <><Loader2 size={16} className="animate-spin" strokeWidth={1.5} /><span>جاري التحديث...</span></>
                    ) : pullDistance > 55 ? (
                        <><Sparkles size={16} className="animate-pulse" strokeWidth={1.5} /><span>أفلت للتحديث</span></>
                    ) : (
                        <span className="text-[#94A3B8]">اسحب للتحديث</span>
                    )}
                </div>
            </motion.div>

            {/* Stats Pills */}
            <motion.div {...fadeUp} className="px-4 pt-3 pb-2">
                <div className="grid grid-cols-3 gap-2">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 text-center shadow-sm border border-emerald-100/50 dark:border-emerald-900/30">
                        <p className="text-[18px] font-black text-emerald-600 dark:text-emerald-400 tabular-nums leading-none">{completedToday}</p>
                        <p className="text-[8px] font-bold text-emerald-500/70 dark:text-emerald-500/50 mt-1">حضور</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 text-center shadow-sm border border-rose-100/50 dark:border-rose-900/30">
                        <p className="text-[18px] font-black text-rose-500 dark:text-rose-400 tabular-nums leading-none">{cancelledToday}</p>
                        <p className="text-[8px] font-bold text-rose-500/70 dark:text-rose-500/50 mt-1">غياب</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 text-center shadow-sm border border-slate-100/50 dark:border-slate-800/50">
                        <p className="text-[18px] font-black text-slate-700 dark:text-slate-300 tabular-nums leading-none">{scheduledToday}</p>
                        <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 mt-1">متبقي</p>
                    </div>
                </div>
            </motion.div>

            {/* Segmented Control */}
            <div className="px-4 pb-2">
                <div className="flex bg-gradient-to-b from-[#F1F5F9] to-[#F1F5F9] dark:from-slate-800/60 dark:to-slate-800/60 rounded-2xl p-1 gap-1 shadow-sm">
                    {[
                        { id: 'record' as const, label: 'تسجيل الحضور', icon: Activity },
                        { id: 'history' as const, label: 'السجل', icon: History },
                    ].map(tab => (
                        <motion.button
                            key={tab.id}
                            onClick={() => { triggerHaptic('light'); setActiveSection(tab.id); }}
                            whileTap={{ scale: 0.96 }}
                            className={cn(
                                "flex-1 py-2 px-2 flex items-center justify-center gap-1.5 transition-all duration-300 relative rounded-xl",
                                activeSection === tab.id
                                    ? "bg-white dark:bg-slate-900 shadow-sm text-[#8B5CF6] dark:text-[#A78BFA] font-bold"
                                    : "text-[#94A3B8] dark:text-slate-500 font-medium"
                            )}
                        >
                            {tab.id === 'record' ? <Activity size={14} strokeWidth={1.5} /> : <History size={14} strokeWidth={1.5} />}
                            <span className="text-[9px]">{tab.label}</span>
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="px-4 space-y-3">
                <AnimatePresence mode="wait">
                    {activeSection === 'record' && (
                        <motion.div
                            key="record"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            className="space-y-3"
                        >
                            {/* Search */}
                            <div className="relative">
                                <Search size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="ابحث باسم الطالب أو المادة..."
                                    className="w-full pr-8 pl-8 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none focus:border-[#8B5CF6] rounded-2xl transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-700 dark:text-white shadow-sm"
                                />
                            </div>

                            {/* Bulk attendance button (teacher only) */}
                            {isTeacher && (
                                <motion.button
                                    onClick={() => { triggerHaptic('medium'); handleBulkAttendance(); }}
                                    whileTap={{ scale: 0.97 }}
                                    className="w-full py-3 rounded-2xl bg-gradient-to-l from-emerald-600 to-emerald-500 text-white text-[10px] font-bold flex items-center justify-center gap-2 shadow-sm shadow-emerald-200/40"
                                >
                                    <CheckCircle2 size={14} strokeWidth={1.5} />
                                    تسجيل حضور اليوم بالكامل
                                </motion.button>
                            )}

                            {/* Date selector */}
                            {!isTeacher && (
                                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 rounded-2xl p-2 shadow-sm border border-slate-100/50 dark:border-slate-800/50">
                                    <Calendar size={14} className="text-[#8B5CF6] mr-1 shrink-0" />
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="flex-1 bg-transparent text-[10px] font-bold text-slate-700 dark:text-white outline-none"
                                    />
                                    <select
                                        value={filterTeacher}
                                        onChange={(e) => setFilterTeacher(e.target.value)}
                                        className="text-[9px] font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1 outline-none text-slate-600 dark:text-slate-300"
                                    >
                                        <option value="all">كل المعلمات</option>
                                        {uniqueTeachers.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                            )}

                            {/* Student Cards */}
                            {isTeacher ? (
                                <div className="space-y-2">
                                    {(matchedEnrollments || []).filter(me =>
                                        (me.student.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
                                        (me.enrollment.subject || '').toLowerCase().includes((searchTerm || '').toLowerCase())
                                    ).map(({ student, enrollment }) => (
                                        <StudentAttendanceCard
                                            key={`${student.id}-${enrollment.subject}`}
                                            student={student}
                                            enrollment={enrollment}
                                            onAttend={() => { triggerHaptic('light'); setLogDate(date); setSecureModalData({ student, enrollment }); }}
                                            onHistory={() => handleViewHistory(student.id, student.name, student.grade, enrollment.subject)}
                                            onDeleteSlot={(i) => setDeletingSlot({ student, enrollment, slotIndex: i })}
                                            onReschedule={() => setRescheduleData({ student, enrollment })}
                                        />
                                    ))}
                                    {(matchedEnrollments || []).filter(me =>
                                        (me.student.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
                                        (me.enrollment.subject || '').toLowerCase().includes((searchTerm || '').toLowerCase())
                                    ).length === 0 && (
                                        <div className="py-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                                            <Users className="mx-auto mb-2 text-slate-300 dark:text-slate-600" size={28} strokeWidth={1.5} />
                                            <p className="text-xs font-bold text-slate-400 dark:text-slate-500">لا يوجد طلاب متاحون</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {uniqueTeachers.filter(t => filterTeacher === 'all' || t === filterTeacher).map(teacher => {
                                        const teacherStudents = students.filter(s => s.enrollments?.some(e => e.teacher === teacher));
                                        const filtered = teacherStudents.filter(s =>
                                            (s.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
                                            s.enrollments.some(e => e.teacher === teacher && (e.subject || '').toLowerCase().includes((searchTerm || '').toLowerCase()))
                                        );
                                        if (filtered.length === 0) return null;
                                        return (
                                            <div key={teacher} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100/50 dark:border-slate-800/50 overflow-hidden">
                                                <div className="px-4 py-2.5 border-b border-slate-100/50 dark:border-slate-800/50 flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 rounded-xl flex items-center justify-center text-[10px] font-black" style={{ backgroundColor: '#8B5CF612', color: '#8B5CF6' }}>
                                                            {teacher.charAt(0)}
                                                        </div>
                                                        <span className="text-[11px] font-bold text-slate-700 dark:text-white">{teacher}</span>
                                                    </div>
                                                    <span className="text-[8px] font-bold px-2 py-0.5 rounded-lg" style={{ backgroundColor: '#8B5CF612', color: '#7C3AED' }}>
                                                        {filtered.length} طالب
                                                    </span>
                                                </div>
                                                <div className="p-2 space-y-1">
                                                    {filtered.map(student => {
                                                        const enrollment = student.enrollments.find(e => e.teacher === teacher)!;
                                                        const session = filteredSessions.find(s =>
                                                            s.studentId === student.id && s.teacherName === teacher && s.subject === enrollment.subject
                                                        );
                                                        const used = enrollment.sessionsUsed || 0;
                                                        const total = enrollment.sessionsTotal || 1;
                                                        const progressPct = Math.min(100, Math.round((used / total) * 100));
                                                        return (
                                                            <motion.div
                                                                key={`${student.id}-${enrollment.subject}`}
                                                                whileTap={{ scale: 0.98 }}
                                                                className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2"
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black" style={{ backgroundColor: '#8B5CF612', color: '#8B5CF6' }}>
                                                                            {getGradeDisplay(student.name, student.grade)}
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-[11px] font-bold text-slate-800 dark:text-white">{student.name}</p>
                                                                            <div className="flex items-center gap-1.5">
                                                                                <span className="text-[8px] font-bold text-slate-400 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-700">{student.grade}</span>
                                                                                <span className="text-[8px] font-bold text-[#8B5CF6] flex items-center gap-0.5">
                                                                                    <BookOpen size={8} /> {enrollment.subject}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    {session ? (
                                                                        <span className={cn(
                                                                            "text-[8px] font-bold px-2 py-0.5 rounded-lg",
                                                                            session.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' :
                                                                            session.status === 'cancelled' ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400' :
                                                                            'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                                                                        )}>
                                                                            {session.status === 'completed' ? 'تم' : session.status === 'cancelled' ? 'غائب' : 'مجدول'}
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-[8px] font-bold px-2 py-0.5 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                                                                            انتظار
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                                    <div className={cn(
                                                                        "h-full rounded-full transition-all duration-700",
                                                                        progressPct > 85 ? 'bg-rose-500' : progressPct > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                                                                    )} style={{ width: `${progressPct}%` }} />
                                                                </div>
                                                                <div className="flex gap-1.5">
                                                                    <motion.button
                                                                        whileTap={{ scale: 0.93 }}
                                                                        onClick={() => { setLogDate(date); setSecureModalData({ student, enrollment }); }}
                                                                        className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-[9px] font-bold rounded-xl flex items-center justify-center gap-1"
                                                                    >
                                                                        <CheckCircle2 size={11} /> حضور
                                                                    </motion.button>
                                                                    <motion.button
                                                                        whileTap={{ scale: 0.93 }}
                                                                        onClick={() => handleViewHistory(student.id, student.name, student.grade, enrollment.subject)}
                                                                        className="flex-1 py-2 bg-[#8B5CF6] hover:bg-violet-700 text-white text-[9px] font-bold rounded-xl flex items-center justify-center gap-1"
                                                                    >
                                                                        <History size={11} /> السجل
                                                                    </motion.button>
                                                                </div>
                                                            </motion.div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {uniqueTeachers.filter(t => filterTeacher === 'all' || t === filterTeacher).length === 0 && (
                                        <div className="py-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                                            <Users className="mx-auto mb-2 text-slate-300" size={28} strokeWidth={1.5} />
                                            <p className="text-xs font-bold text-slate-400">لا يوجد طلاب متاحون</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeSection === 'history' && (
                        <motion.div
                            key="history"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            className="space-y-3"
                        >
                            {/* Period Filter */}
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 shadow-sm border border-slate-100/50 dark:border-slate-800/50">
                                <div className="flex items-center gap-1.5">
                                    {(['today', 'week', 'month'] as PeriodFilter[]).map(p => (
                                        <motion.button
                                            key={p}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => { triggerHaptic('light'); setPeriodFilter(p); }}
                                            className={cn(
                                                "flex-1 py-2 rounded-xl text-[9px] font-bold transition-all",
                                                periodFilter === p
                                                    ? "bg-[#8B5CF6] text-white shadow-sm"
                                                    : "text-slate-400 dark:text-slate-500"
                                            )}
                                        >
                                            {p === 'today' ? 'اليوم' : p === 'week' ? 'الأسبوع' : 'الشهر'}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            {/* Sessions List */}
                            <div className="space-y-1.5">
                                {filteredSessions.length > 0 ? (
                                    filteredSessions.map(session => (
                                        <motion.div
                                            key={session.id}
                                            whileTap={{ scale: 0.98 }}
                                            className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 shadow-sm border border-slate-100/50 dark:border-slate-800/50 flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <div className={cn(
                                                    "w-8 h-8 rounded-xl flex items-center justify-center",
                                                    session.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-900/30' :
                                                    session.status === 'cancelled' ? 'bg-rose-100 dark:bg-rose-900/30' :
                                                    'bg-amber-100 dark:bg-amber-900/30'
                                                )}>
                                                    {session.status === 'completed' ? (
                                                        <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400" />
                                                    ) : session.status === 'cancelled' ? (
                                                        <XCircle size={14} className="text-rose-600 dark:text-rose-400" />
                                                    ) : (
                                                        <Clock size={14} className="text-amber-600 dark:text-amber-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-800 dark:text-white">{session.studentName}</p>
                                                    <p className="text-[8px] font-bold text-slate-400">{session.subject} · {session.teacherName}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[8px] font-bold text-slate-400 tabular-nums">{session.time}</span>
                                                <motion.button
                                                    whileTap={{ scale: 0.93 }}
                                                    onClick={() => handleViewHistory(session.studentId, session.studentName, undefined, session.subject)}
                                                    className="px-2 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[8px] font-bold"
                                                >
                                                    <History size={10} />
                                                </motion.button>
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="py-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                                        <History className="mx-auto mb-2 text-slate-300 dark:text-slate-600" size={28} strokeWidth={1.5} />
                                        <p className="text-xs font-bold text-slate-400 dark:text-slate-500">لا توجد جلسات مسجلة</p>
                                        <p className="text-[9px] font-medium text-slate-300 dark:text-slate-600 mt-1">لـ {periodLabel}</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Modals */}
            <SecureAttendanceModal
                isOpen={!!secureModalData}
                onClose={() => setSecureModalData(null)}
                onConfirm={handleConfirmLog}
                studentName={secureModalData?.student.name || ''}
                date={logDate}
            />

            <AttendanceHistoryModal
                isOpen={!!historyStudent}
                onClose={() => setHistoryStudent(null)}
                studentId={historyStudent?.id || ''}
                studentName={historyStudent?.name || ''}
                teacherName={currentUser?.teacherName || currentUser?.name || ''}
                studentGrade={historyStudent?.grade}
                studentSubject={historyStudent?.subject}
                studentCurriculum={historyStudent?.curriculum}
                onSessionChange={refresh}
            />

            <ConfirmModal
                isOpen={!!deletingSlot}
                title="حذف موعد الحصة"
                message="هل أنت متأكد من حذف هذا الموعد؟ لا يمكن الرجوع عن هذا الإجراء"
                onConfirm={() => {
                    if (deletingSlot) {
                        const { student, enrollment, slotIndex } = deletingSlot;
                        const newSch = enrollment.schedule.filter((_, idx) => idx !== slotIndex);
                        updateSchedule(student, student.enrollments.indexOf(enrollment), newSch);
                        setDeletingSlot(null);
                    }
                }}
                onClose={() => setDeletingSlot(null)}
            />

            {rescheduleData && (
                <RescheduleModal
                    isOpen={!!rescheduleData}
                    onClose={() => setRescheduleData(null)}
                    studentName={rescheduleData.student.name}
                    subject={rescheduleData.enrollment.subject}
                    onConfirm={(data) => {
                        requestReschedule(rescheduleData.student.id, rescheduleData.student.name, rescheduleData.enrollment.subject, data);
                        setRescheduleData(null);
                    }}
                />
            )}
        </div>
    );
};

/* ─── Sub-components ─── */

interface StudentCardProps {
    student: Student;
    enrollment: Enrollment;
    onAttend: () => void;
    onHistory: () => void;
    onDeleteSlot: (slotIndex: number) => void;
    onReschedule: () => void;
}

const StudentAttendanceCard = ({ student, enrollment, onAttend, onHistory }: StudentCardProps) => {
    const todayName = new Date().toLocaleDateString('ar-EG', { weekday: 'long' });
    const todaySlot = enrollment.schedule?.find(s => s.day === todayName);
    const used = enrollment.sessionsUsed || 0;
    const total = enrollment.sessionsTotal || 1;
    const progressPct = Math.min(100, Math.round((used / total) * 100));

    return (
        <motion.div
            whileTap={{ scale: 0.98 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 shadow-sm border border-slate-100/50 dark:border-slate-800/50 space-y-2.5"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black shrink-0" style={{ backgroundColor: '#8B5CF612', color: '#8B5CF6' }}>
                        {student.name.charAt(0)}
                    </div>
                    <div>
                        <p className="text-[12px] font-bold text-slate-800 dark:text-white leading-tight">{student.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            {student.grade && (
                                <span className="text-[7px] font-bold text-slate-400 dark:text-slate-500 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">{student.grade}</span>
                            )}
                            <span className="text-[8px] font-bold text-[#8B5CF6] flex items-center gap-1">
                                <BookOpen size={9} strokeWidth={1.5} />
                                {enrollment.subject}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="text-left">
                    {todaySlot ? (
                        <span className="text-[8px] font-bold px-2 py-1 rounded-lg" style={{ backgroundColor: '#8B5CF612', color: '#7C3AED' }}>
                            {todaySlot.hour}:00 {todaySlot.period === 'am' ? 'ص' : 'م'}
                        </span>
                    ) : (
                        <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                            بدون موعد
                        </span>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={cn(
                        "h-full rounded-full transition-all duration-700",
                        progressPct > 85 ? 'bg-rose-500' : progressPct > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                    )} style={{ width: `${progressPct}%` }} />
                </div>
                <span className="text-[7px] font-bold text-slate-400 dark:text-slate-500 tabular-nums">{used}/{total}</span>
            </div>

            <div className="flex gap-1.5">
                <motion.button
                    whileTap={{ scale: 0.93 }}
                    onClick={onAttend}
                    className="flex-1 py-2.5 bg-gradient-to-l from-emerald-600 to-emerald-500 text-white text-[9px] font-bold rounded-xl flex items-center justify-center gap-1 shadow-sm shadow-emerald-200/30"
                >
                    <CheckCircle2 size={12} strokeWidth={1.5} /> حضور
                </motion.button>
                <motion.button
                    whileTap={{ scale: 0.93 }}
                    onClick={onHistory}
                    className="flex-1 py-2.5 bg-gradient-to-l from-[#8B5CF6] to-[#7C3AED] text-white text-[9px] font-bold rounded-xl flex items-center justify-center gap-1 shadow-sm shadow-purple-200/30"
                >
                    <History size={12} strokeWidth={1.5} /> السجل
                </motion.button>
            </div>
        </motion.div>
    );
};
