import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Users, History, Activity, CheckCircle2, Loader2, Sparkles, Calendar } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useCurrentUser, useShowNotification, useWhatsappAutoNotify, useWhatsappTemplate } from '../../../context/AppContext';
import { useAttendance } from '../hooks/useAttendance';
import { MobilePage, usePullToRefresh } from '../../../shared/components/mobile';
import { triggerHaptic } from '../../../lib/haptics';
import type { PeriodFilter } from './AttendanceFilters';
import type { Student, Enrollment } from '../types';
import { SecureAttendanceModal } from '../../../shared/components/SecureAttendanceModal';
import { ConfirmModal } from '../../../shared/components/ConfirmModal';
import { AttendanceHistoryModal } from './AttendanceHistoryModal';
import { RescheduleModal } from './RescheduleModal';
import { generateWhatsAppLink } from '../../../lib/whatsapp';
import { AttendanceStatsBar, StudentAttendanceCard, AttendanceHistoryView, AdminAttendanceView } from './mobile-attendance';

export const MobileAttendance = () => {
    const currentUser = useCurrentUser();
    const showNotification = useShowNotification();
    const whatsappAutoNotify = useWhatsappAutoNotify();
    const whatsappTemplate = useWhatsappTemplate();

    const [activeSection, setActiveSection] = useState<'record' | 'history'>('record');
    const [date, setDate] = useState(new Date().toLocaleDateString('en-CA'));
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTeacher, setFilterTeacher] = useState<string>('all');
    const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('today');
    const [customStartDate] = useState('');
    const [customEndDate] = useState('');

    const [logDate, setLogDate] = useState(new Date().toLocaleDateString('en-CA'));
    const [isLogging, setIsLogging] = useState(false);
    const [secureModalData, setSecureModalData] = useState<{ student: Student, enrollment: Enrollment } | null>(null);
    const [historyStudent, setHistoryStudent] = useState<{ id: string, name: string, grade?: string, subject?: string, curriculum?: string } | null>(null);
    const [deletingSlot, setDeletingSlot] = useState<{ student: Student, enrollment: Enrollment, slotIndex: number } | null>(null);
    const [rescheduleData, setRescheduleData] = useState<{ student: Student, enrollment: Enrollment } | null>(null);

    const dateRange = useMemo(() => {
        const d = new Date(date);
        switch (periodFilter) {
            case 'today': return { start: date, end: date };
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
            default: return { start: date, end: date };
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

    const { students, allSessions, logAttendance, updateSchedule, requestReschedule,
        stats, matchedEnrollments, uniqueTeachers, refresh
    } = useAttendance(currentUser, date, dateRange);

    const { isRefreshing, pullDistance, handlers } = usePullToRefresh({ onRefresh: refresh });

    const isTeacher = currentUser?.role === 'teacher';

    const filteredSessions = allSessions.filter(s => {
        const dateMatch = s.date === date || (s.status === 'scheduled' && (new Date(date).getTime() - new Date(s.date).getTime()) / (1000 * 3600 * 24) <= 1);
        if (!dateMatch) return false;
        const searchMatch = !searchTerm ||
            (s.studentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.teacherName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.subject || '').toLowerCase().includes(searchTerm.toLowerCase());
        const teacherMatch = filterTeacher === 'all' || s.teacherName === filterTeacher;
        return searchMatch && teacherMatch;
    });

    const handleConfirmLog = async (status: 'completed' | 'cancelled', topics?: string, homework?: string, needsCompensation?: boolean) => {
        if (!secureModalData || !logDate || isLogging) return;
        setIsLogging(true);
        const { student, enrollment } = secureModalData;
        const now = new Date();
        const currentTime = now.toLocaleTimeString('ar-EG', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
        const calculatedPrice = enrollment.price ? (enrollment.price - (enrollment.discount || 0)) : undefined;
        const success = await logAttendance({
            studentId: student.id, studentName: student.name, teacherName: enrollment.teacher,
            teacherId: enrollment.teacherId, subject: enrollment.subject, date: logDate, time: currentTime,
            status, day: new Date(logDate).toLocaleDateString('ar-EG', { weekday: 'long' }),
            topics, homework, needsCompensation, price: calculatedPrice
        });
        if (success) {
            showNotification(`تم تسجيل ${student.name} (${status === 'completed' ? 'حضور' : 'غياب'})`, 'success');
            if (whatsappAutoNotify && status === 'completed' && student.parentPhone) {
                const waLink = generateWhatsAppLink(student.parentPhone, whatsappTemplate, {
                    Student: student.name, Subject: enrollment.subject, Teacher: enrollment.teacher,
                    Date: logDate, Price: calculatedPrice?.toString() || '0'
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
        setHistoryStudent({ id: studentId, name: studentName, grade, subject, curriculum: (enrollment as { curriculum?: string } | undefined)?.curriculum });
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
        const currentTime = now.toLocaleTimeString('ar-EG', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
        let successCount = 0;
        for (const { student, enrollment } of todayStudents) {
            const success = await logAttendance({
                studentId: student.id, studentName: student.name, teacherName: enrollment.teacher,
                teacherId: enrollment.teacherId, subject: enrollment.subject, date: logDate, time: currentTime,
                status: 'completed', day: selectedDayName,
                price: enrollment.price ? (enrollment.price - (enrollment.discount || 0)) : undefined
            });
            if (success) successCount++;
        }
        showNotification(`تم تسجيل ${successCount} طالب بنجاح`, 'success');
    };

    return (
        <MobilePage>
            <div {...handlers}>

            <motion.div style={{ height: pullDistance }} animate={{ height: isRefreshing ? 50 : pullDistance }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="overflow-hidden flex items-center justify-center w-full">
                <div className="flex items-center gap-2.5 text-primary font-medium text-xs">
                    {isRefreshing ? (
                        <><Loader2 size={16} className="animate-spin" strokeWidth={1.5} /><span>جاري التحديث...</span></>
                    ) : pullDistance > 55 ? (
                        <><Sparkles size={16} className="animate-pulse" strokeWidth={1.5} /><span>أفلت للتحديث</span></>
                    ) : (<span className="text-muted">اسحب للتحديث</span>)}
                </div>
            </motion.div>

            <AttendanceStatsBar completedToday={stats.todayCompleted || 0} cancelledToday={stats.todayCancelled || 0} scheduledToday={stats.todayScheduled || 0} />

            <div className="px-4 pb-2">
                <div className="flex bg-surface rounded-2xl p-1 gap-1">
                    {[
                        { id: 'record' as const, label: 'تسجيل الحضور', icon: Activity },
                        { id: 'history' as const, label: 'السجل', icon: History },
                    ].map(tab => (
                        <motion.button key={tab.id} onClick={() => { triggerHaptic('light'); setActiveSection(tab.id); }}
                            whileTap={{ scale: 0.96 }}
                            className={cn("flex-1 py-2 px-2 flex items-center justify-center gap-1.5 transition-all duration-300 relative rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
                                activeSection === tab.id ? "bg-card shadow-elevation-1 text-primary font-bold" : "text-muted font-medium")}>
                            <tab.icon size={14} strokeWidth={1.5} />
                            <span className="text-micro">{tab.label}</span>
                        </motion.button>
                    ))}
                </div>
            </div>

            <div className="px-4 space-y-3">
                <AnimatePresence mode="wait">
                    {activeSection === 'record' && (
                        <motion.div key="record" initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }} className="space-y-3">

                            <div className="relative">
                                <Search size={13} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" />
                                <input type="text" aria-label="بحث" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="ابحث باسم الطالب أو المادة..."
                                    className="w-full ps-8 pe-8 py-2.5 bg-card border border-border text-xs font-bold outline-none focus-visible:border-primary rounded-2xl transition-all placeholder:text-muted text-main" />
                            </div>

                            {isTeacher && (
                                <motion.button onClick={() => { triggerHaptic('medium'); handleBulkAttendance(); }}
                                    whileTap={{ scale: 0.97 }}
                                    className="w-full py-3 rounded-2xl bg-success text-on-success text-micro font-bold flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                                    <CheckCircle2 size={14} strokeWidth={1.5} /> تسجيل حضور اليوم بالكامل
                                </motion.button>
                            )}

                            {!isTeacher && (
                                <div className="flex items-center gap-2 bg-card rounded-2xl p-2 border border-border">
                                    <Calendar size={14} className="text-primary ms-1 shrink-0" />
                                    <input type="date" aria-label="التاريخ" value={date} onChange={(e) => setDate(e.target.value)}
                                        className="flex-1 bg-transparent text-micro font-bold text-main outline-none" />
                                    <select value={filterTeacher} onChange={(e) => setFilterTeacher(e.target.value)} aria-label="تصفية حسب المعلمة"
                                        className="text-micro font-bold bg-card border border-border rounded-xl px-2 py-1 outline-none focus-visible:border-primary text-muted">
                                        <option value="all">كل المعلمات</option>
                                        {uniqueTeachers.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                            )}

                            {isTeacher ? (
                                <div className="space-y-2">
                                    {(matchedEnrollments || []).filter(me =>
                                        (me.student.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
                                        (me.enrollment.subject || '').toLowerCase().includes((searchTerm || '').toLowerCase())
                                    ).map(({ student, enrollment }) => (
                                        <StudentAttendanceCard key={`${student.id}-${enrollment.id || enrollment.subject}`}
                                            student={student} enrollment={enrollment}
                                            onAttend={() => { triggerHaptic('light'); setLogDate(date); setSecureModalData({ student, enrollment }); }}
                                            onHistory={() => handleViewHistory(student.id, student.name, student.grade, enrollment.subject)}
                                            onDeleteSlot={(i) => setDeletingSlot({ student, enrollment, slotIndex: i })}
                                            onReschedule={() => setRescheduleData({ student, enrollment })} />
                                    ))}
                                    {(matchedEnrollments || []).filter(me =>
                                        (me.student.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
                                        (me.enrollment.subject || '').toLowerCase().includes((searchTerm || '').toLowerCase())
                                    ).length === 0 && (
                                        <div className="py-12 text-center bg-card rounded-2xl border border-border">
                                            <Users className="mx-auto mb-2 text-muted" size={28} strokeWidth={1.5} />
                                            <p className="text-xs font-bold text-muted">لا يوجد طلاب متاحون</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <AdminAttendanceView uniqueTeachers={uniqueTeachers} filterTeacher={filterTeacher}
                                    students={students} searchTerm={searchTerm} filteredSessions={filteredSessions} date={date}
                                    onLog={(s, e) => { setLogDate(date); setSecureModalData({ student: s, enrollment: e }); }}
                                    onViewHistory={(id, name, grade, subject) => handleViewHistory(id, name, grade, subject)} />
                            )}
                        </motion.div>
                    )}

                    {activeSection === 'history' && (
                        <AttendanceHistoryView periodFilter={periodFilter} setPeriodFilter={setPeriodFilter}
                            filteredSessions={filteredSessions} periodLabel={periodLabel}
                            onViewHistory={(id, name, subject) => handleViewHistory(id, name, undefined, subject)} />
                    )}
                </AnimatePresence>
            </div>

            <SecureAttendanceModal isOpen={!!secureModalData} onClose={() => setSecureModalData(null)}
                onConfirm={handleConfirmLog} studentName={secureModalData?.student.name || ''} date={logDate} />
            <AttendanceHistoryModal isOpen={!!historyStudent} onClose={() => setHistoryStudent(null)}
                studentId={historyStudent?.id || ''} studentName={historyStudent?.name || ''}
                teacherName={currentUser?.teacherName || currentUser?.name || ''}
                studentGrade={historyStudent?.grade} studentSubject={historyStudent?.subject}
                studentCurriculum={historyStudent?.curriculum} onSessionChange={refresh} />
            <ConfirmModal isOpen={!!deletingSlot} title="حذف موعد الحصة"
                message="هل أنت متأكد من حذف هذا الموعد؟ لا يمكن الرجوع عن هذا الإجراء"
                onConfirm={() => {
                    if (deletingSlot) {
                        const { student, enrollment, slotIndex } = deletingSlot;
                        const newSch = enrollment.schedule.filter((_, idx) => idx !== slotIndex);
                        updateSchedule(student, student.enrollments.indexOf(enrollment), newSch);
                        setDeletingSlot(null);
                    }
                }}
                onClose={() => setDeletingSlot(null)} />
            {rescheduleData && (
                <RescheduleModal isOpen={!!rescheduleData} onClose={() => setRescheduleData(null)}
                    studentName={rescheduleData.student.name} subject={rescheduleData.enrollment.subject}
                    onConfirm={(data) => {
                        requestReschedule(rescheduleData.student.id, rescheduleData.student.name, rescheduleData.enrollment.subject, data);
                        setRescheduleData(null);
                    }} />
            )}
            </div>
        </MobilePage>
    );
};
