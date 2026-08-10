import { Users } from 'lucide-react';
import { useShowNotification } from '../../context/AppContext';
import { confirm } from '../../lib/confirmDialog';
import type { Student, Enrollment, Session } from '../../features/attendance/types';

interface BulkAttendanceButtonProps {
    matchedEnrollments: { student: Student; enrollment: Enrollment }[];
    allSessions: Session[];
    logDate: string;
    logAttendance: (data: Record<string, unknown>) => Promise<boolean>;
}

export const BulkAttendanceButton = ({ matchedEnrollments, allSessions, logDate, logAttendance }: BulkAttendanceButtonProps) => {
    const showNotification = useShowNotification();

    const handleBulk = async () => {
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

        if (!await confirm(`سيتم تسجيل (${todayStudents.length}) طالب كحضور تلقائي`)) return;

        const now = new Date();
        const currentTime = now.toLocaleTimeString('ar-EG', {
            hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true
        });

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
        <div className="px-0 mb-2">
            <button onClick={handleBulk}
                className="w-full flex items-center justify-center gap-2 bg-success hover:bg-success-hover text-on-success text-xs font-semibold px-4 py-3.5 rounded-xl transition-all duration-200 shadow-sm active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                تسجيل حضور اليوم بالكامل <Users size={16} />
            </button>
        </div>
    );
};
