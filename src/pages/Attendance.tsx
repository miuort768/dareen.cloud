import { useState } from 'react';
import { Users, Search, BookOpen } from 'lucide-react';
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
import { RescheduleModal } from '../features/attendance/components/RescheduleModal';
import { useAttendance } from '../features/attendance/hooks/useAttendance';
import type { Student, Enrollment, Session } from '../features/attendance/types';
import { generateWhatsAppLink } from '../lib/whatsapp';

export const Attendance = () => {
    const { currentUser, showNotification, whatsappAutoNotify, whatsappTemplate } = useApp();
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
        teacherStats,
        uniqueTeachers,
        refresh
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
        <div className="space-y-6 pb-32 w-full max-w-full overflow-x-hidden p-0 min-h-full md:animate-in md:fade-in md:duration-700 bg-white dark:bg-slate-950/20" dir="rtl">
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
                <div className="mb-8 px-4 lg:px-0">
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
                        className="w-full bg-slate-900 dark:bg-slate-800 hover:bg-black text-white py-4 border-r-4 border-emerald-500 rounded-none font-black text-xs uppercase tracking-[3px] transition-all flex justify-center items-center gap-3 shadow-xl italic"
                    >
                        تحضير جماعي وسريع لكافة القوائم <Users size={18} />
                    </button>
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

            <div className="px-4 lg:px-0">
                {isTeacher ? (
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-none overflow-hidden relative group">
                            <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-1.5 h-6 bg-indigo-600"></div>
                                    <h3 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2 uppercase italic">
                                        إدارة السبعينات والنشاطات المباشرة
                                    </h3>
                                </div>
                                <div className="relative w-full md:w-80">
                                    <Search size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="ابحث عن طالب، مادة، أو رقم قيد..."
                                        className="w-full pr-12 pl-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-none text-xs font-black outline-none focus:ring-0 focus:border-indigo-600 transition-all dark:text-white uppercase italic"
                                    />
                                </div>
                            </div>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                                        <div className="col-span-full py-24 text-center text-slate-300 flex flex-col items-center gap-4">
                                            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 flex items-center justify-center rounded-none shadow-inner">
                                                <Users size={40} className="opacity-20" />
                                            </div>
                                            <p className="text-xs font-black uppercase tracking-[4px] italic">لا توجد بيانات مطابقة لعمليات البحث</p>
                                        </div>
                                    )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {uniqueTeachers.filter(t => filterTeacher === 'all' || t === filterTeacher).map(teacher => {
                            const teacherStudentsList = students.filter(s => s.enrollments?.some(e => e.teacher === teacher));
                            const filteredTStudents = teacherStudentsList.filter(s =>
                                (s.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
                                s.enrollments.some(e => e.teacher === teacher && (e.subject || '').toLowerCase().includes((searchTerm || '').toLowerCase()))
                            );

                            if (filteredTStudents.length === 0) return null;

                            return (
                                <div key={teacher} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-none overflow-hidden relative shadow-sm">
                                    <div className="bg-slate-900 px-6 py-4 flex items-center justify-between border-b border-slate-800">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-indigo-600 flex items-center justify-center text-white font-black italic shadow-lg">
                                                {teacher.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="font-black text-sm text-white uppercase italic tracking-tighter leading-none">إشراف المعلمة: {teacher}</h3>
                                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">كادر تعليمي معتمد • نشط</p>
                                            </div>
                                        </div>
                                        <div className="text-[9px] font-black bg-slate-800 text-slate-400 px-4 py-1.5 uppercase tracking-widest italic border border-slate-700">
                                            {filteredTStudents.length} طلاب مسجلين
                                        </div>
                                    </div>

                                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                                                    <div key={`${student.id}-${enrollment.subject}`} className="group relative bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 hover:border-indigo-500/50 transition-all rounded-none overflow-hidden p-6 space-y-6">
                                                        <div className="flex justify-between items-start">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-12 h-12 bg-slate-900 border border-slate-800 flex items-center justify-center text-white font-black text-lg italic shadow-xl">
                                                                    {getGradeDisplay(student.name, student.grade)}
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-black text-slate-900 dark:text-white text-sm leading-none mb-1.5 uppercase italic">{student.name}</h4>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-[9px] font-black bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400 px-2 py-0.5 uppercase italic">
                                                                            {student.grade}
                                                                        </span>
                                                                        <p className="text-[9px] font-black text-slate-400 flex items-center gap-1 uppercase italic">
                                                                            <BookOpen size={10} className="text-indigo-500" />
                                                                            {enrollment.subject}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="text-[8px] font-black bg-amber-500 text-slate-900 px-2 py-1 uppercase tracking-widest italic animate-pulse">
                                                                قيد المراجعة
                                                            </div>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <div className="flex justify-between items-center text-[9px] font-black uppercase italic tracking-widest">
                                                                <span className="text-slate-400">تحليل رصيد الطالب</span>
                                                                <span className="text-slate-900 dark:text-white tabular-nums">{enrollment.sessionsUsed} / {enrollment.sessionsTotal}</span>
                                                            </div>
                                                            <div className="h-1 bg-slate-100 dark:bg-slate-900 rounded-none overflow-hidden relative">
                                                                <div
                                                                    className={cn(
                                                                        "h-full transition-all duration-1000 ease-out",
                                                                        (enrollment.sessionsUsed / enrollment.sessionsTotal * 100) > 85 ? 'bg-rose-500' : (enrollment.sessionsUsed / enrollment.sessionsTotal * 100) > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                                                                    )}
                                                                    style={{ width: `${Math.min(100, enrollment.sessionsTotal > 0 ? (enrollment.sessionsUsed / enrollment.sessionsTotal) * 100 : 0)}%` }}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-3">
                                                            <button
                                                                onClick={() => { setLogDate(date); setSecureModalData({ student, enrollment }); }}
                                                                className="py-2.5 bg-emerald-600 text-white hover:bg-emerald-700 font-black text-[10px] flex items-center justify-center gap-2 transition-all uppercase italic shadow-lg shadow-emerald-500/10"
                                                            >
                                                                إثبات حضور
                                                            </button>
                                                            <button
                                                                onClick={() => { setLogDate(date); setSecureModalData({ student, enrollment }); }}
                                                                className="py-2.5 bg-rose-600 text-white hover:bg-rose-700 font-black text-[10px] flex items-center justify-center gap-2 transition-all uppercase italic shadow-lg shadow-rose-500/10"
                                                            >
                                                                إثبات غياب
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
    );
};
