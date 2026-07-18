import { useState, useMemo } from 'react';
import { Search, Users, Activity } from 'lucide-react';
import { useCurrentUser, useShowNotification, useWhatsappAutoNotify, useWhatsappTemplate } from '../context/AppContext';
import { ConfirmModal } from '../shared/components/ConfirmModal';
import { SecureAttendanceModal } from '../shared/components/SecureAttendanceModal';
import { AttendanceStats } from '../features/attendance/components/AttendanceStats';
import { AttendanceHeader } from '../features/attendance/components/AttendanceHeader';
import { AttendanceFilters } from '../features/attendance/components/AttendanceFilters';
import { TeacherStudentCard } from '../features/attendance/components/TeacherStudentCard';
import { AttendanceHistoryModal } from '../features/attendance/components/AttendanceHistoryModal';
import type { PeriodFilter } from '../features/attendance/components/AttendanceFilters';
import { RescheduleModal } from '../features/attendance/components/RescheduleModal';
import { useAttendance } from '../features/attendance/hooks/useAttendance';
import { MobileAttendance } from '../features/attendance/components/MobileAttendance';
import type { Student, Enrollment, Session } from '../features/attendance/types';
import { generateWhatsAppLink } from '../lib/whatsapp';
import { SectionCard, SectionTitle, BulkAttendanceButton, AdminTeacherGroupList } from './attendance-page';

export const Attendance = () => {
    const currentUser = useCurrentUser();
    const showNotification = useShowNotification();
    const whatsappAutoNotify = useWhatsappAutoNotify();
    const whatsappTemplate = useWhatsappTemplate();
    const [date, setDate] = useState(new Date().toLocaleDateString('en-CA'));
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterTeacher, setFilterTeacher] = useState<string>('all');
    const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('today');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');

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

    const { students, allSessions, updateStatus, logAttendance, updateSchedule, updateEnrollmentNotes,
        requestReschedule, stats, periodStats, matchedEnrollments, uniqueTeachers, refresh, teacherStats
    } = useAttendance(currentUser, date, dateRange);

    const [rescheduleData, setRescheduleData] = useState<{ student: Student, enrollment: Enrollment } | null>(null);
    const [secureModalData, setSecureModalData] = useState<{ student: Student, enrollment: Enrollment } | null>(null);
    const [isLogging, setIsLogging] = useState(false);
    const [historyStudent, setHistoryStudent] = useState<{ id: string, name: string, grade?: string, subject?: string, curriculum?: string } | null>(null);
    const [deletingSlot, setDeletingSlot] = useState<{ student: Student, enrollment: Enrollment, slotIndex: number } | null>(null);
    const [logDate, setLogDate] = useState(new Date().toLocaleDateString('en-CA'));

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
        setHistoryStudent({ id: studentId, name: studentName, grade, subject, curriculum: enrollment?.curriculum });
    };

    const handleUpdateStatus = async (id: string, status: Session['status']) => {
        const success = await updateStatus(id, status);
        showNotification(success ? 'تم تحديث حالة الجلسة' : 'لم يتم التحديث', success ? 'success' : 'error');
    };

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

    const isTeacher = currentUser?.role === 'teacher';

    return (
        <div className="min-h-full pb-24 relative font-sans" dir="rtl">
            <div className="hidden md:block max-w-page mx-auto px-2 space-y-4">
                <AttendanceHeader date={date} onDateChange={setDate}
                    stats={{ todayTotal: stats.todayTotal, totalCompleted: stats.totalCompleted }}
                    isTeacher={isTeacher} />

                <AttendanceStats
                    stats={periodStats ? { ...stats, todayCompleted: periodStats.completed, todayCancelled: periodStats.cancelled, todayScheduled: periodStats.scheduled } : stats}
                    teacherStats={teacherStats} isTeacher={isTeacher} periodLabel={periodLabel} />

                {isTeacher && <BulkAttendanceButton matchedEnrollments={matchedEnrollments} allSessions={allSessions}
                    logDate={logDate} logAttendance={logAttendance} />}

                {!isTeacher && <AttendanceFilters searchTerm={searchTerm} onSearchChange={setSearchTerm}
                    filterStatus={filterStatus} onStatusChange={setFilterStatus}
                    filterTeacher={filterTeacher} onTeacherChange={setFilterTeacher}
                    uniqueTeachers={uniqueTeachers} periodFilter={periodFilter}
                    onPeriodChange={setPeriodFilter} customStartDate={customStartDate}
                    customEndDate={customEndDate} onCustomStartChange={setCustomStartDate}
                    onCustomEndChange={setCustomEndDate} />}

                <div className="px-0 md:animate-in md:fade-in md:slide-in-from-bottom-2 md:duration-400">
                    {isTeacher ? (
                        <div className="space-y-4">
                            <SectionCard className="p-0 overflow-hidden">
                                <div className="px-4 py-2 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border">
                                    <SectionTitle icon={Activity} label="حصص الطلاب المقررة" />
                                    <div className="relative w-full md:w-[400px]">
                                        <Search size={14} className="absolute start-4 top-1/2 -translate-y-1/2 text-dim" />
                                        <input type="text" aria-label="بحث" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="ابحث باسم الطالب أو المادة..."
                                            className="w-full ps-10 pe-4 py-2 bg-surface dark:bg-card border border-border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-focus transition-all" />
                                    </div>
                                </div>
                                <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {(matchedEnrollments || []).filter(me =>
                                        (me.student.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
                                        (me.enrollment.subject || '').toLowerCase().includes((searchTerm || '').toLowerCase())
                                    ).length > 0 ? (
                                        (matchedEnrollments || []).filter(me =>
                                            (me.student.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
                                            (me.enrollment.subject || '').toLowerCase().includes((searchTerm || '').toLowerCase())
                                        ).map(({ student, enrollment }) => (
                                            <TeacherStudentCard key={`${student.id}-${enrollment.subject}`}
                                                student={student} enrollment={enrollment}
                                                actualSessionsUsed={enrollment.sessionsUsed}
                                                onUpdateSchedule={updateSchedule}
                                                onLogAttendance={(s, e) => setSecureModalData({ student: s, enrollment: e })}
                                                onViewHistory={(id, name, grade, subject, curriculum) => setHistoryStudent({ id, name, grade, subject, curriculum })}
                                                onDeleteSlot={(s, e, i) => setDeletingSlot({ student: s, enrollment: e, slotIndex: i })}
                                                onUpdateNotes={updateEnrollmentNotes}
                                                onReschedule={(s, e) => setRescheduleData({ student: s, enrollment: e })}
                                                logDate={logDate} onDateChange={setLogDate} />
                                        ))
                                    ) : (
                                        <div className="col-span-full py-16 text-center">
                                            <Users className="mx-auto mb-2 text-primary/20" size={32} />
                                            <p className="text-xs font-bold text-muted">لا يوجد طلاب متاحون</p>
                                        </div>
                                    )}
                                </div>
                            </SectionCard>
                        </div>
                    ) : (
                        <AdminTeacherGroupList uniqueTeachers={uniqueTeachers} filterTeacher={filterTeacher}
                            students={students} searchTerm={searchTerm} filteredSessions={filteredSessions}
                            date={date} isLogging={isLogging}
                            onLogAttendance={(s, e) => { setLogDate(date); setSecureModalData({ student: s, enrollment: e }); }}
                            onViewHistory={handleViewHistory}
                            onUpdateStatus={handleUpdateStatus} />
                    )}
                </div>

                <SecureAttendanceModal isOpen={!!secureModalData} onClose={() => setSecureModalData(null)}
                    onConfirm={handleConfirmLog} studentName={secureModalData?.student.name || ''} date={logDate} />
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
                <AttendanceHistoryModal isOpen={!!historyStudent} onClose={() => setHistoryStudent(null)}
                    studentId={historyStudent?.id || ''} studentName={historyStudent?.name || ''}
                    teacherName={currentUser?.teacherName || currentUser?.name || ''}
                    studentGrade={historyStudent?.grade} studentSubject={historyStudent?.subject}
                    studentCurriculum={historyStudent?.curriculum} onSessionChange={refresh} />
                {rescheduleData && (
                    <RescheduleModal isOpen={!!rescheduleData} onClose={() => setRescheduleData(null)}
                        studentName={rescheduleData.student.name} subject={rescheduleData.enrollment.subject}
                        onConfirm={(data) => {
                            requestReschedule(rescheduleData.student.id, rescheduleData.student.name, rescheduleData.enrollment.subject, data);
                            setRescheduleData(null);
                        }} />
                )}
            </div>
            <div className="block md:hidden">
                <MobileAttendance />
            </div>
        </div>
    );
};
