import { useState } from 'react';
import { Users, Search, BookOpen, TrendingUp } from 'lucide-react';
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

    // ...

    return (
        // ...
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
        </div >
    );
};
