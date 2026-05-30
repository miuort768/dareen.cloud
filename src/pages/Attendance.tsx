import { useState } from 'react';
import { Users, Search, BookOpen, Activity } from 'lucide-react';
import { cn } from '../lib/utils';

import { useCurrentUser, useShowNotification, useWhatsappAutoNotify, useWhatsappTemplate } from '../context/AppContext';
import { confirm } from '../lib/confirmDialog';
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

// ── Reusable Styled Components ────────────────────────────────────────────

const SectionCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={cn(
        'bg-white dark:bg-slate-900 border border-slate-100/50 dark:border-slate-800/50 rounded-none shadow-sm p-4 md:p-5',
        className
    )}>
        {children}
    </div>
);

const SectionTitle = ({ icon: Icon, label, sub, color = '#2563EB' }: { icon: React.ComponentType<{ size?: number }>; label: string; sub?: string; color?: string }) => (
    <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-none flex items-center justify-center" style={{ backgroundColor: `${color}12`, color }}>
            <Icon size={16} />
        </div>
        <div>
            <p className="text-sm font-bold text-slate-800 dark:text-white leading-none">{label}</p>
            {sub && <p className="text-[10px] font-bold text-[#64748B] mt-1">{sub}</p>}
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
            'flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-blue-700',
            'text-white text-xs font-bold px-4 py-2.5 rounded-none transition-all shadow-sm active:scale-95',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            className
        )}
    >
        {children}
    </button>
);

// ── Main Component ──────────────────────────────────────────────────────

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
            'السابع': '7', 'الثامن': '8', 'التاسع': '9', 'العاشر': '10'
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
            showNotification('فشل تسجيل الحصة', 'error');
        }
    };

    const handleUpdateStatus = async (id: string, status: Session['status']) => {
        const success = await updateStatus(id, status);
        if (success) {
            showNotification('تم تحديث حالة الجلسة', 'success');
        } else {
            showNotification('لم يتم التحديث', 'error');
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
        <div className="min-h-full pb-24 overflow-x-hidden relative font-sans" dir="rtl">
            <div className="max-w-[1600px] mx-auto px-2 space-y-4">
            
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
                                showNotification('لا يوجد طلاب متاحون للتسجيل', 'info');
                                return;
                            }

                            if (!await confirm(`سيتم تسجيل (${todayStudents.length}) طالب كحضور تلقائي`)) return;
                            
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
                            showNotification(`تم تسجيل ${successCount} طالب بنجاح`, 'success');
                        }}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 py-3.5"
                    >
                        تسجيل حضور اليوم بالكامل <Users size={16} />
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
                            <div className="px-4 py-2 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100/50 dark:border-slate-800/50">
                                <SectionTitle icon={Activity} label="حصص الطلاب المقررة" color="#2563EB" />
                                <div className="relative w-full md:w-[400px]">
                                    <Search size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="ابحث باسم الطالب أو المادة..."
                                        className="w-full pr-10 pl-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-none text-xs font-bold focus:outline-none focus:border-blue-600 transition-all"
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
                                            <Users className="mx-auto mb-2" size={32} style={{ color: '#64748B30' }} />
                                            <p className="text-xs font-bold text-[#64748B]">لا يوجد طلاب متاحون</p>
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
                                <SectionCard key={teacher} className="p-0 overflow-hidden rounded-none">
                                    <div className="bg-white dark:bg-slate-900 px-5 py-3 flex items-center justify-between border-b border-slate-100/50 dark:border-slate-800/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-none flex items-center justify-center text-xs font-black" style={{ backgroundColor: '#8B5CF612', color: '#8B5CF6' }}>
                                                {teacher.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="text-xs font-bold text-slate-800 dark:text-white">قائمة الطلاب: {teacher}</h3>
                                                <p className="text-[9px] font-bold text-[#64748B] tracking-wider">إدارة الحصص والتحضير</p>
                                            </div>
                                        </div>
                                        <div className="text-[9px] font-bold px-3 py-1 rounded-none" style={{ backgroundColor: '#64748B12', color: '#64748B' }}>
                                            {filteredTStudents.length} طالب
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
                                                    <div key={`${student.id}-${enrollment.subject}`} className="bg-white dark:bg-slate-900 border border-slate-100/50 dark:border-slate-800/50 shadow-sm rounded-none p-5 space-y-4 flex flex-col justify-between">
                                                        <div className="flex justify-between items-start">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-none flex items-center justify-center text-sm font-black" style={{ backgroundColor: '#2563EB12', color: '#2563EB' }}>
                                                                    {getGradeDisplay(student.name, student.grade)}
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-bold text-slate-800 dark:text-white text-xs mb-1">{student.name}</h4>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-[9px] font-bold text-[#64748B] bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded-none border border-slate-100/50 dark:border-slate-700">
                                                                            {student.grade}
                                                                        </span>
                                                                        <p className="text-[9px] font-bold text-[#64748B] flex items-center gap-1">
                                                                            <BookOpen size={10} style={{ color: '#2563EB' }} />
                                                                            {enrollment.subject}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="text-[8px] font-bold px-2 py-0.5 rounded-none uppercase animate-pulse" style={{ backgroundColor: '#F59E0B12', color: '#D97706' }}>
                                                                انتظار
                                                            </div>
                                                        </div>

                                                        <div className="space-y-1.5">
                                                            <div className="flex justify-between items-center text-[9px] font-bold uppercase text-[#64748B]">
                                                                <span>تغطية الحصص</span>
                                                                <span className="text-slate-800 dark:text-white tabular-nums">{enrollment.sessionsUsed} / {enrollment.sessionsTotal}</span>
                                                            </div>
                                                            <div className="h-1 bg-slate-50 dark:bg-slate-800 rounded-none overflow-hidden">
                                                                <div
                                                                    className={cn(
                                                                        "h-full transition-all duration-1000 rounded-none",
                                                                        (enrollment.sessionsUsed / enrollment.sessionsTotal * 100) > 85 ? 'bg-rose-500' : (enrollment.sessionsUsed / enrollment.sessionsTotal * 100) > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                                                                    )}
                                                                    style={{ width: `${Math.min(100, enrollment.sessionsTotal > 0 ? (enrollment.sessionsUsed / enrollment.sessionsTotal) * 100 : 0)}%` }}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-2">
                                                            <button
                                                                onClick={() => { setLogDate(date); setSecureModalData({ student, enrollment }); }}
                                                                className="py-2.5 bg-[#10B981] hover:bg-emerald-700 text-white font-bold text-[10px] rounded-none flex items-center justify-center transition-all shadow-sm active:scale-95"
                                                            >
                                                                حضور
                                                            </button>
                                                            <button
                                                                onClick={() => { setLogDate(date); setSecureModalData({ student, enrollment }); }}
                                                                className="py-2.5 bg-[#F43F5E] hover:bg-rose-700 text-white font-bold text-[10px] rounded-none flex items-center justify-center transition-all shadow-sm active:scale-95"
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
