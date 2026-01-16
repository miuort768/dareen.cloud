import { useState } from 'react';
import { Users, AlertCircle } from 'lucide-react';

import { useApp } from '../context/AppContext';
import { ConfirmModal } from '../shared/components/ConfirmModal';
import { SecureAttendanceModal } from '../shared/components/SecureAttendanceModal';
import { AttendanceHeader } from '../features/attendance/components/AttendanceHeader';
import { AttendanceStats } from '../features/attendance/components/AttendanceStats';
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
        loading: _loading,
        updateStatus,
        logAttendance,
        updateSchedule,
        stats,
        teacherStudents,
        teacherStats,
        uniqueTeachers
    } = useAttendance(currentUser, date);

    // Modals state
    const [secureModalData, setSecureModalData] = useState<{ student: Student, enrollment: Enrollment } | null>(null);
    const [historyStudent, setHistoryStudent] = useState<{ id: string, name: string } | null>(null);
    const [deletingSlot, setDeletingSlot] = useState<{ student: Student, enrollment: Enrollment, slotIndex: number } | null>(null);
    const [logDate, setLogDate] = useState(new Date().toLocaleDateString('en-CA'));

    const handleConfirmLog = async (status: 'completed' | 'cancelled') => {
        if (!secureModalData || !logDate) return;
        const { student, enrollment } = secureModalData;

        const success = await logAttendance({
            studentId: student.id,
            studentName: student.name,
            teacherName: enrollment.teacher,
            subject: enrollment.subject,
            date: logDate,
            time: '12:00 م',
            status: status,
            price: enrollment.price || 0,
            day: new Date(logDate).toLocaleDateString('ar-EG', { weekday: 'long' })
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
            s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.subject.toLowerCase().includes(searchTerm.toLowerCase());

        // Status match
        const statusMatch = filterStatus === 'all' || s.status === filterStatus;

        // Teacher match
        const teacherMatch = filterTeacher === 'all' || s.teacherName === filterTeacher;

        return searchMatch && statusMatch && teacherMatch;
    });

    const isTeacher = currentUser?.role === 'teacher';
    const nameToMatch = currentUser?.teacherName || currentUser?.name;

    return (
        <div className="space-y-6">
            <AttendanceHeader
                date={date}
                onDateChange={setDate}
                stats={stats}
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
                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xl no-print">
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50 dark:bg-gray-800/50 flex justify-between items-center">
                            <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                                <Users size={20} className="text-primary-600" />
                                إدارة طلابك ومواعيدهم
                            </h3>
                            <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                                <AlertCircle size={14} />
                                تظهر هنا فقط الطلاب المسجلين معك
                            </div>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {teacherStudents.length > 0 ? teacherStudents.map(student => {
                                const en = student.enrollments.find(e => e.teacher === nameToMatch)!;
                                return (
                                    <TeacherStudentCard
                                        key={student.id}
                                        student={student}
                                        enrollment={en}
                                        actualSessionsUsed={en.sessionsUsed}
                                        onUpdateSchedule={updateSchedule}
                                        onLogAttendance={(s, e) => setSecureModalData({ student: s, enrollment: e })}
                                        onViewHistory={(id, name) => setHistoryStudent({ id, name })}
                                        logDate={logDate}
                                        onDateChange={setLogDate}
                                    />
                                );
                            }) : (
                                <div className="col-span-full py-12 text-center text-gray-400 flex flex-col items-center gap-3">
                                    <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                                        <Users size={32} className="opacity-20" />
                                    </div>
                                    <p className="text-sm font-bold italic">لا يوجد طلاب مسجلين معك حالياً</p>
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
                            s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            s.enrollments.some(e => e.teacher === teacher && e.subject.toLowerCase().includes(searchTerm.toLowerCase()))
                        );

                        if (filteredTStudents.length === 0) return null;

                        return (
                            <div key={teacher} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm rounded-xl overflow-hidden">
                                <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                                    <h3 className="font-black text-lg text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                        <Users size={20} className="text-primary-600" />
                                        طلاب المعلمة: {teacher}
                                    </h3>
                                    <span className="text-xs font-bold bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-sm text-gray-500">
                                        {filteredTStudents.length} طلاب
                                    </span>
                                </div>

                                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                                                />
                                            );
                                        } else {
                                            return (
                                                <div key={`${student.id}-${enrollment.subject}`} className="group relative bg-white dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-primary-400 transition-all rounded-xl overflow-hidden p-5 space-y-4">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h4 className="font-black text-gray-900 dark:text-white text-lg leading-tight mb-1">{student.name}</h4>
                                                            <p className="text-xs font-bold text-gray-500 flex items-center gap-1">
                                                                <Users size={12} className="text-primary-500" />
                                                                {enrollment.subject}
                                                            </p>
                                                        </div>
                                                        <div className="text-[10px] font-black bg-amber-50 text-amber-600 px-2 py-0.5 rounded">
                                                            لم يتم التحضير
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
            />
        </div>
    );
};
