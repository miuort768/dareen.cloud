import { useState } from 'react';
import { Users, Search, BookOpen, TrendingUp, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

import { useApp } from '../context/AppContext';
import { ConfirmModal } from '../shared/components/ConfirmModal';
import { SecureAttendanceModal } from '../shared/components/SecureAttendanceModal';
import { AttendanceStats } from '../features/attendance/components/AttendanceStats';
import { AttendanceHeader } from '../features/attendance/components/AttendanceHeader';
import { AttendanceFilters } from '../features/attendance/components/AttendanceFilters';
import { AdminSessionCard } from '../features/attendance/components/AdminSessionCard';
import { TeacherStudentCard } from '../features/attendance/components/TeacherStudentCard';
import { AttendanceHistoryModal } from '../features/attendance/components/AttendanceHistoryModal';
import { useAttendance } from '../features/attendance/hooks/useAttendance';
import type { Student, Enrollment, Session } from '../features/attendance/types';

export const Attendance = () => {
    const { currentUser, showNotification } = useApp();
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
        stats,
        matchedEnrollments,
        teacherStats,
        uniqueTeachers,
        refresh
    } = useAttendance(currentUser, date);

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
            price: enrollment.price ? (enrollment.price - (enrollment.discount || 0)) : undefined
        });

        if (success) {
            showNotification(`تم تسجيل ${student.name} (${status === 'completed' ? 'حضور' : 'غياب'})`, 'success');
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

    // Filtered sessions for Admin view
    const filteredSessions = allSessions.filter(s => {
        // Date matches (already handled by useAttendance for stats, but we need it here for display)
        const dateMatch = s.date === date || (s.status === 'scheduled' && (new Date(date).getTime() - new Date(s.date).getTime()) / (1000 * 3600 * 24) <= 1);
        if (!dateMatch) return false;

        // Search match
        const searchMatch = !searchTerm ||
            (s.studentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.teacherName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.subject || '').toLowerCase().includes(searchTerm.toLowerCase());

        // Status match
        const statusMatch = filterStatus === 'all' || s.status === filterStatus;

        // Teacher match
        const teacherMatch = filterTeacher === 'all' || s.teacherName === filterTeacher;

        return searchMatch && statusMatch && teacherMatch;
    });

    const isTeacher = currentUser?.role === 'teacher';

    return (
        <div className="space-y-4 pb-32">
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

            {isTeacher ? (
                <div className="space-y-4">
                    <div className="bg-transparent no-print">
                        <div className="px-1 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4">
                            <div className="flex items-center gap-4">
                                <h3 className="text-base lg:text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                                    <Users size={20} className="text-primary-600" />
                                    إدارة طلابك وموادهم
                                </h3>
                                <button
                                    onClick={async () => {
                                        if (!window.confirm(`هل أنت متأكد من تحضير جميع الطلاب (${matchedEnrollments.length}) كحضور؟`)) return;
                                        
                                        const now = new Date();
                                        const currentTime = now.toLocaleTimeString('ar-EG', {
                                            hour: 'numeric',
                                            minute: '2-digit',
                                            second: '2-digit',
                                            hour12: true
                                        });

                                        let successCount = 0;
                                        for (const { student, enrollment } of (matchedEnrollments || [])) {
                                            const success = await logAttendance({
                                                studentId: student.id,
                                                studentName: student.name,
                                                teacherName: enrollment.teacher,
                                                teacherId: enrollment.teacherId,
                                                subject: enrollment.subject,
                                                date: logDate,
                                                time: currentTime,
                                                status: 'completed',
                                                day: new Date(logDate).toLocaleDateString('ar-EG', { weekday: 'long' }),
                                                price: enrollment.price ? (enrollment.price - (enrollment.discount || 0)) : undefined
                                            });
                                            if (success) successCount++;
                                        }
                                        showNotification(`تم تسجيل حضور ${successCount} طلاب بنجاح`, 'success');
                                    }}
                                    className="bg-emerald-600 text-white px-4 py-1.5 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/20"
                                >
                                    <CheckCircle2 size={14} /> تحضير جماعي (حضور الكل)
                                </button>
                            </div>
                            <div className="relative w-full md:w-64">
                                <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="ابحث عن طالب أو مادة..."
                                    className="w-full pr-10 pl-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                                />
                            </div>
                        </div>
                        <div className="pt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-6">
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
                                        logDate={logDate}
                                        onDateChange={setLogDate}
                                    />
                                )) : (
                                    <div className="col-span-full py-12 text-center text-gray-400 flex flex-col items-center gap-3">
                                        <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                                            <Users size={32} className="opacity-20" />
                                        </div>
                                        <p className="text-sm font-bold italic">لا يوجد طلاب يطابقون بحثك</p>
                                    </div>
                                )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-8">
                    {uniqueTeachers.filter(t => filterTeacher === 'all' || t === filterTeacher).map(teacher => {
                        const teacherStudentsList = students.filter(s => s.enrollments?.some(e => e.teacher === teacher));
                        const filteredTStudents = teacherStudentsList.filter(s =>
                            (s.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
                            s.enrollments.some(e => e.teacher === teacher && (e.subject || '').toLowerCase().includes((searchTerm || '').toLowerCase()))
                        );

                        if (filteredTStudents.length === 0) return null;

                        return (
                            <div key={teacher} className="bg-transparent overflow-hidden">
                                <div className="bg-transparent px-1 py-4 border-b border-gray-100 flex items-center justify-between mb-4">
                                    <h3 className="font-black text-lg text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                        <Users size={20} className="text-primary-600" />
                                        طلاب المعلمة: {teacher}
                                    </h3>
                                    <span className="text-xs font-bold bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-sm text-gray-500">
                                        {filteredTStudents.length} طلاب
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-6">
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
                                                <div key={`${student.id}-${enrollment.subject}`} className="group relative bg-white dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-primary-400 transition-all rounded-none overflow-hidden pt-2 px-1 pb-4 space-y-4">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 font-black text-lg rounded-none">
                                                                {getGradeDisplay(student.name, student.grade)}
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-0.5">
                                                                    <h4 className="font-black text-gray-900 dark:text-white text-base leading-tight">{student.name}</h4>
                                                                    <span className="text-[8px] font-black bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 px-1.5 py-0.5 rounded-none uppercase">
                                                                        {student.grade}
                                                                    </span>
                                                                </div>
                                                                <p className="text-[10px] font-bold text-gray-500 flex items-center gap-1">
                                                                    <BookOpen size={10} className="text-primary-500" />
                                                                    {enrollment.subject}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="text-[9px] font-black bg-amber-50 text-amber-600 px-2 py-0.5 rounded-none uppercase tracking-tighter">
                                                            لم يتم التحضير
                                                        </div>
                                                    </div>

                                                    <div className="p-0 space-y-2 rounded-none">
                                                        <div className="flex justify-between items-center">
                                                            <div className="flex items-center gap-2">
                                                                <TrendingUp size={14} className="text-primary-500" />
                                                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">تغطية المنهج</span>
                                                            </div>
                                                            <div className="flex items-baseline gap-1">
                                                                <span className="text-sm font-black text-gray-900 dark:text-white">{enrollment.sessionsUsed}</span>
                                                                <span className="text-[10px] font-bold text-gray-400">/ {enrollment.sessionsTotal}</span>
                                                            </div>
                                                        </div>
                                                        <div className="h-1.5 bg-gray-100 dark:bg-gray-700 overflow-hidden shadow-inner relative rounded-none">
                                                            <div
                                                                className={cn(
                                                                    "h-full transition-all duration-1000 ease-out shadow-lg rounded-none relative",
                                                                    (enrollment.sessionsUsed / enrollment.sessionsTotal * 100) > 85 ? 'bg-rose-500' : (enrollment.sessionsUsed / enrollment.sessionsTotal * 100) > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                                                                )}
                                                                style={{ width: `${Math.min(100, enrollment.sessionsTotal > 0 ? (enrollment.sessionsUsed / enrollment.sessionsTotal) * 100 : 0)}%` }}
                                                            >
                                                                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-2 pt-2">
                                                        <button
                                                            onClick={() => { setLogDate(date); setSecureModalData({ student, enrollment }); }}
                                                            className="flex-1 py-2 bg-gray-50 dark:bg-gray-700/50 hover:bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg font-black text-xs flex items-center justify-center gap-1 transition-all"
                                                        >
                                                            حضور
                                                        </button>
                                                        <button
                                                            onClick={() => { setLogDate(date); setSecureModalData({ student, enrollment }); }}
                                                            className="flex-1 py-2 bg-gray-50 dark:bg-gray-700/50 hover:bg-rose-50 text-rose-600 border border-rose-100 rounded-lg font-black text-xs flex items-center justify-center gap-1 transition-all"
                                                        >
                                                            غياب
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        }
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <SecureAttendanceModal
                isOpen={!!secureModalData}
                onClose={() => setSecureModalData(null)}
                onConfirm={handleConfirmLog}
                studentName={secureModalData?.student.name || ''}
                date={logDate}
            />

            <ConfirmModal
                isOpen={!!deletingSlot}
                title="حذف الموعد"
                message="هل أنت متأكد من حذف هذا الموعد؟"
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
        </div>
    );
};
