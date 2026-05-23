import { useState } from 'react';
import { Users, Search, BookOpen, Activity } from 'lucide-react';
import { cn } from '../lib/utils';

import { useCurrentUser, useShowNotification, useWhatsappAutoNotify, useWhatsappTemplate } from '../context/AppContext';
import { ConfirmModal } from '../shared/components/ConfirmModal';
import { SecureAttendanceModal } from '../shared/components/SecureAttendanceModal';
import { AttendanceStats } from '../features/attendance/components/AttendanceStats';
import { AttendanceHeader } from '../features/attendance/components/AttendanceHeader';
import { AttendanceFilters } from '../features/attendance/components/AttendanceFilters';
import { AdminSessionCard } from '../features/attendance/components/AdminSessionCard';
import { TeacherStudentCard } from '../features/attendance/components/TeacherStudentCard';
import { AttendanceHistoryModal } from '../features/attendance/components/AttendanceHistoryModal';
import { RescheduleModal } from '../features/attendance/components/RescheduleModal';
import { useAttendance } from '../features/attendance/hooks/useAttendance';
import type { Student, Enrollment, Session } from '../features/attendance/types';
import { generateWhatsAppLink } from '../lib/whatsapp';

// ── Reusable Styled Components ──────────────────────────────────────────────

const SectionCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={cn(
        'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-none shadow-sm p-4 md:p-5',
        className
    )}>
        {children}
    </div>
);

const SectionTitle = ({ icon: Icon, label, sub }: { icon: React.ComponentType<{ size?: number }>; label: string; sub?: string }) => (
    <div className="flex items-center gap-3">
        <div className="w-8 h-8 flex items-center justify-center bg-[#eef2ff] dark:bg-indigo-900/30 rounded-none">
            <Icon size={16} className="text-[#5c59f2]" />
        </div>
        <div>
            <p className="text-sm font-normal text-slate-800 dark:text-white leading-none">{label}</p>
            {sub && <p className="text-[10px] text-slate-400 mt-1">{sub}</p>}
        </div>
    </div>
);

const PrimaryBtn = ({ onClick, children, className = '', disabled }: {
    onClick?: () => void; children: React.ReactNode; className?: string; disabled?: boolean;
}) => (
    <button
        disabled={disabled}
        onClick={onClick}
        className={cn(
            'flex items-center justify-center gap-2 bg-[#5c59f2] hover:bg-indigo-700',
            'text-white text-xs font-normal px-4 py-2.5 rounded-none transition-all shadow-sm',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            className
        )}
    >
        {children}
    </button>
);

// ── Main Component ────────────────────────────────────────────────────────────

export const Attendance = () => {
    const currentUser = useCurrentUser();
    const showNotification = useShowNotification();
    const whatsappAutoNotify = useWhatsappAutoNotify();
    const whatsappTemplate = useWhatsappTemplate();
    const [date, setDate] = useState(new Date().toLocaleDateString('en-CA'));
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterTeacher, setFilterTeacher] = useState<string>('all');

    const {
        students,
        allSessions,
        updateStatus,
        logAttendance,
        updateSchedule,
        updateEnrollmentNotes,
        requestReschedule,
        stats,
        matchedEnrollments,
        uniqueTeachers,
        refresh,
        teacherStats
    } = useAttendance(currentUser, date);

    const [rescheduleData, setRescheduleData] = useState<{ student: Student, enrollment: Enrollment } | null>(null);

    // Modals state
    const [secureModalData, setSecureModalData] = useState<{ student: Student, enrollment: Enrollment } | null>(null);
    const [historyStudent, setHistoryStudent] = useState<{ id: string, name: string, grade?: string, subject?: string, curriculum?: string } | null>(null);
    const [deletingSlot, setDeletingSlot] = useState<{ student: Student, enrollment: Enrollment, slotIndex: number } | null>(null);
    const [logDate, setLogDate] = useState(new Date().toLocaleDateString('en-CA'));

    const getGradeDisplay = (studentName: string, grade?: string) => {
        if (!grade) return studentName.charAt(0);
        const mapping: Record<string, string> = {
            'الأول': '1', 'الثاني': '2', 'الثالث': '3', 'الرابع': '4', 'الخامس': '5', 'السادس': '6',
            'سابع': '7', 'ثامن': '8', 'تاسع': '9', 'عاشر': '10'
        };
        const numMatch = grade.match(/\d+/);
        if (numMatch) return numMatch[0];
        for (const [key, val] of Object.entries(mapping)) {
            if (grade.includes(key)) return val;
        }
        return studentName.charAt(0);
    };

    const handleConfirmLog = async (status: 'completed' | 'cancelled', topics?: string, homework?: string, needsCompensation?: boolean) => {
        if (!secureModalData || !logDate) return;
        const { student, enrollment } = secureModalData;

        const now = new Date();
        const currentTime = now.toLocaleTimeString('ar-EG', {
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
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
            topics,
            homework,
            needsCompensation,
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
            showNotification('فشل تسجيل الحضور', 'error');
        }
    };

    const handleUpdateStatus = async (id: string, status: Session['status']) => {
        const success = await updateStatus(id, status);
        if (success) {
            showNotification('تم تحديث حالة الحصة بنجاح', 'success');
        } else {
            showNotification('فشل في تحديث الحالة', 'error');
        }
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
        <div className="min-h-full pb-24 overflow-x-hidden relative bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-[#020617] dark:via-slate-950 dark:to-indigo-950/20 font-sans" dir="rtl">
            <div className="absolute inset-0 opacity-\[0\.03\] dark:opacity-\[0\.05\] opacity-50 pointer-events-none" />
            <div className="relative z-10 max-w-[1600px] mx-auto px-2 space-y-4">
            
            <AttendanceHeader
                date={date}
                onDateChange={setDate}
                stats={{
                    todayTotal: stats.todayTotal,
                    totalCompleted: stats.totalCompleted
                }}
                isTeacher={isTeacher}
            />

            <AttendanceStats
                stats={stats}
                teacherStats={teacherStats}
                isTeacher={isTeacher}
            />

            {isTeacher && (
                <div className="px-0 mb-2">
                    <PrimaryBtn
                        onClick={async () => {
                            const selectedDayName = new Date(logDate).toLocaleDateString('ar-EG', { weekday: 'long' });
                            
                            // Filter only those who have a session today AND haven't been marked yet
                            const todayStudents = (matchedEnrollments || []).filter(({ student, enrollment }) => {
                                // 1. Must have this day in their schedule
                                const isScheduledToday = enrollment.schedule?.some(slot => slot.day === selectedDayName);
                                
                                // 2. Must not have a session already logged for this date and subject
                                const alreadyLogged = allSessions.some(s => 
                                    s.studentId === student.id && 
                                    s.subject === enrollment.subject && 
                                    s.date === logDate
                                );

                                return isScheduledToday && !alreadyLogged;
                            });

                            if (todayStudents.length === 0) {
                                showNotification('لا يوجد طلاب غير محضرين لهذا اليوم', 'info');
                                return;
                            }

                            if (!window.confirm(`هل أنت متأكد من تحضير (${todayStudents.length}) طلاب كحضور لليوم؟`)) return;
                            
                            const now = new Date();
                            const currentTime = now.toLocaleTimeString('ar-EG', {
                                hour: 'numeric',
                                minute: '2-digit',
                                second: '2-digit',
                                hour12: true
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
                            showNotification(`تم تسجيل حضور ${successCount} طلاب بنجاح`, 'success');
                        }}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 py-3.5"
                    >
                        تحضير جماعي وسريع لطلاب اليوم <Users size={16} />
                    </PrimaryBtn>
                </div>
            )}

            {!isTeacher && (
                <AttendanceFilters
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    filterStatus={filterStatus}
                    onStatusChange={setFilterStatus}
                    filterTeacher={filterTeacher}
                    onTeacherChange={setFilterTeacher}
                    uniqueTeachers={uniqueTeachers}
                />
            )}

            <div className="px-0 md:animate-in md:fade-in md:slide-in-from-bottom-2 md:duration-400">
                {isTeacher ? (
                    <div className="space-y-4">
                        <SectionCard className="p-0 overflow-hidden rounded-none">
                            <div className="px-4 py-2 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800">
                                <SectionTitle icon={Activity} label="إدارة النشاطات المباشرة" />
                                <div className="relative w-full md:w-[400px]">
                                    <Search size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="ابحث عن طالب أو مادة..."
                                        className="w-full pr-10 pl-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-none text-xs font-medium focus:outline-none focus:border-[#5c59f2] transition-all"
                                    />
                                </div>
                            </div>
                            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {(matchedEnrollments || []).filter(me =>
                                    (me.student.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
                                    (me.enrollment.subject || '').toLowerCase().includes((searchTerm || '').toLowerCase())
                                ).length > 0 ?
                                    (matchedEnrollments || []).filter(me =>
                                        (me.student.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
                                        (me.enrollment.subject || '').toLowerCase().includes((searchTerm || '').toLowerCase())
                                    ).map(({ student, enrollment }) => (
                                        <TeacherStudentCard
                                            key={`${student.id}-${enrollment.subject}`}
                                            student={student}
                                            enrollment={enrollment}
                                            actualSessionsUsed={enrollment.sessionsUsed}
                                            onUpdateSchedule={updateSchedule}
                                            onLogAttendance={(s, e) => setSecureModalData({ student: s, enrollment: e })}
                                            onViewHistory={(id, name, grade, subject, curriculum) => setHistoryStudent({ id, name, grade, subject, curriculum })}
                                            onDeleteSlot={(s, e, i) => setDeletingSlot({ student: s, enrollment: e, slotIndex: i })}
                                            onUpdateNotes={updateEnrollmentNotes}
                                            onReschedule={(s, e) => setRescheduleData({ student: s, enrollment: e })}
                                            logDate={logDate}
                                            onDateChange={setLogDate}
                                        />
                                    )) : (
                                        <div className="col-span-full py-16 text-center">
                                            <Users className="mx-auto mb-2 text-slate-200" size={32} />
                                            <p className="text-xs font-normal text-slate-400">لا توجد بيانات مطابقة</p>
                                        </div>
                                    )}
                            </div>
                        </SectionCard>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {uniqueTeachers.filter(t => filterTeacher === 'all' || t === filterTeacher).map(teacher => {
                            const teacherStudentsList = students.filter(s => s.enrollments?.some(e => e.teacher === teacher));
                            const filteredTStudents = teacherStudentsList.filter(s =>
                                (s.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
                                s.enrollments.some(e => e.teacher === teacher && (e.subject || '').toLowerCase().includes((searchTerm || '').toLowerCase()))
                            );

                            if (filteredTStudents.length === 0) return null;

                            return (
                                <SectionCard key={teacher} className="p-0 overflow-hidden">
                                    <div className="bg-slate-900 px-5 py-3 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-[#5c59f2] flex items-center justify-center text-white font-normal rounded-lg text-xs">
                                                {teacher.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="font-normal text-xs text-white">إشراف المعلمة: {teacher}</h3>
                                                <p className="text-[9px] text-slate-500 font-normal uppercase tracking-wider">كادر تعليمي معتمد</p>
                                            </div>
                                        </div>
                                        <div className="text-[9px] font-normal bg-slate-800 text-slate-400 px-3 py-1 rounded-lg border border-slate-700 uppercase">
                                            {filteredTStudents.length} طلاب
                                        </div>
                                    </div>

                                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {filteredTStudents.map(student => {
                                            const enrollment = student.enrollments.find(e => e.teacher === teacher)!;
                                            const session = filteredSessions.find(s =>
                                                s.studentId === student.id &&
                                                s.teacherName === teacher &&
                                                s.subject === enrollment.subject
                                            );

                                            if (session) {
                                                return (
                                                    <AdminSessionCard
                                                        key={session.id}
                                                        session={session}
                                                        stats={{ used: enrollment.sessionsUsed, total: enrollment.sessionsTotal }}
                                                        onUpdateStatus={handleUpdateStatus}
                                                        studentGrade={student.grade}
                                                    />
                                                );
                                            } else {
                                                return (
                                                    <div key={`${student.id}-${enrollment.subject}`} className="bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 rounded-none p-5 space-y-4 flex flex-col justify-between">
                                                        <div className="flex justify-between items-start">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-800 dark:text-white font-normal rounded-none text-sm">
                                                                    {getGradeDisplay(student.name, student.grade)}
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-normal text-slate-800 dark:text-white text-xs mb-1">{student.name}</h4>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-[9px] font-normal text-slate-400 bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded-md border border-slate-100 dark:border-slate-700">
                                                                            {student.grade}
                                                                        </span>
                                                                        <p className="text-[9px] font-normal text-slate-400 flex items-center gap-1">
                                                                            <BookOpen size={10} className="text-[#5c59f2]" />
                                                                            {enrollment.subject}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="text-[8px] font-medium bg-amber-500 text-slate-900 px-2 py-0.5 rounded-md uppercase animate-pulse">
                                                                انتظار
                                                            </div>
                                                        </div>

                                                        <div className="space-y-1.5">
                                                            <div className="flex justify-between items-center text-[9px] font-normal uppercase text-slate-400">
                                                                <span>الرصيد المتاح</span>
                                                                <span className="text-slate-800 dark:text-white tabular-nums">{enrollment.sessionsUsed} / {enrollment.sessionsTotal}</span>
                                                            </div>
                                                            <div className="h-1 bg-white dark:bg-slate-900 rounded-full overflow-hidden">
                                                                <div
                                                                    className={cn(
                                                                        "h-full transition-all duration-1000",
                                                                        (enrollment.sessionsUsed / enrollment.sessionsTotal * 100) > 85 ? 'bg-rose-500' : (enrollment.sessionsUsed / enrollment.sessionsTotal * 100) > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                                                                    )}
                                                                    style={{ width: `${Math.min(100, enrollment.sessionsTotal > 0 ? (enrollment.sessionsUsed / enrollment.sessionsTotal) * 100 : 0)}%` }}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-2">
                                                            <button
                                                                onClick={() => { setLogDate(date); setSecureModalData({ student, enrollment }); }}
                                                                className="py-2 bg-emerald-600 text-white hover:bg-emerald-700 font-normal text-[10px] rounded-none flex items-center justify-center transition-all"
                                                            >
                                                                حضور
                                                            </button>
                                                            <button
                                                                onClick={() => { setLogDate(date); setSecureModalData({ student, enrollment }); }}
                                                                className="py-2 bg-rose-600 text-white hover:bg-rose-700 font-normal text-[10px] rounded-none flex items-center justify-center transition-all"
                                                            >
                                                                غياب
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                        })}
                                    </div>
                                </SectionCard>
                            );
                        })}
                    </div>
                )}
            </div>

            <SecureAttendanceModal
                isOpen={!!secureModalData}
                onClose={() => setSecureModalData(null)}
                onConfirm={handleConfirmLog}
                studentName={secureModalData?.student.name || ''}
                date={logDate}
            />

            <ConfirmModal
                isOpen={!!deletingSlot}
                title="تأكيد حذف الموعد"
                message="سيتم إزالة هذا الموعد نهائياً من سجلات الطالب المحددة، هل أنت متأكد؟"
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
        </div>
    );
};
