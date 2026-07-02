import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../../../lib/api';
import { PageLoader } from '../../../components/ui/PageLoader';
import { ParentsStudentHeader } from '../components/ParentsStudentHeader';
import { ParentStudentCard } from '../components/ParentStudentCard';
import { SessionsModal } from '../components/SessionsModal';
import { AttendanceModal } from '../components/AttendanceModal';

export const ParentStudents = () => {
    const [students, setStudents] = useState<Record<string, unknown>[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewingStudent, setViewingStudent] = useState<Record<string, unknown> | null>(null);
    const [viewingAttendanceStudent, setViewingAttendanceStudent] = useState<Record<string, unknown> | null>(null);
    const [viewingAchievements, setViewingAchievements] = useState<Record<string, unknown> | null>(null);
    const [viewingSubject, setViewingSubject] = useState<Record<string, unknown> | null>(null);
    const [sessionsPage, setSessionsPage] = useState(1);
    const [childSessions, setChildSessions] = useState<Record<string, unknown>[]>([]);
    const [pointLogs, setPointLogs] = useState<Record<string, unknown>[]>([]);
    const [isSessionsLoading, setIsSessionsLoading] = useState(false);
    const [sessionsStartDate, setSessionsStartDate] = useState(() => {
        const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().split('T')[0];
    });
    const [sessionsEndDate, setSessionsEndDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        const fetchStudents = async () => {
            try { setIsLoading(true); const data = await api.get<Record<string, unknown>[]>('/parents/my-children'); setStudents(data); }
            catch (error) { console.error('Error fetching students:', error); }
            finally { setIsLoading(false); }
        };
        fetchStudents();
    }, []);

    const fetchChildSessions = async (studentId: string) => {
        try { setIsSessionsLoading(true); const data = await api.get<Record<string, unknown>[]>(`/parents/child-sessions/${studentId}`); setChildSessions(data); }
        catch (error) { console.error('Error fetching sessions:', error); }
        finally { setIsSessionsLoading(false); }
    };

    const handleViewDates = (student: Record<string, unknown>) => {
        setViewingStudent(student); setViewingSubject(null); setSessionsPage(1); fetchChildSessions(student.id as string);
    };

    const handleViewAttendance = (student: Record<string, unknown>) => {
        setViewingAttendanceStudent(student); fetchChildSessions(student.id as string);
    };

    const handleViewAchievements = async (student: Record<string, unknown>) => {
        if (viewingAchievements?.id === student.id) { setViewingAchievements(null); return; }
        setViewingAchievements(student);
        try { const logs = await api.get<Record<string, unknown>[]>(`/student-portal/me/points-log?studentId=${student.id}`); setPointLogs(logs); }
        catch (error) { console.error('Error fetching student points log', error); }
    };

    const filteredStudents = students.filter((s: Record<string, unknown>) =>
        ((s.name as string) || '').toLowerCase().includes((searchQuery || '').toLowerCase())
    );

    if (isLoading) return <PageLoader />;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-primary-light dark:bg-background min-h-screen pb-24"
            dir="rtl"
        >
            <div className="pt-6 md:pt-10 px-4 md:px-6 space-y-6 max-w-7xl mx-auto">
                <ParentsStudentHeader searchQuery={searchQuery} onSearchChange={setSearchQuery} />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredStudents.map((student) => (
                        <ParentStudentCard
                            key={student.id as string}
                            student={student}
                            viewingAchievements={viewingAchievements}
                            onViewDates={handleViewDates}
                            onViewAttendance={handleViewAttendance}
                            onViewAchievements={handleViewAchievements}
                            onCloseAchievements={() => setViewingAchievements(null)}
                            pointLogs={pointLogs}
                        />
                    ))}
                    {filteredStudents.length === 0 && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="col-span-full py-20 bg-white dark:bg-primary-active/50 text-center border border-dashed border-border dark:border-border rounded-2xl">
                            <Users size={48} className="mx-auto text-dim dark:text-main mb-4" />
                            <h3 className="text-lg font-medium text-muted dark:text-muted uppercase tracking-widest">لا يوجد أبناء مسجلين</h3>
                            <p className="text-xs text-muted dark:text-muted font-normal mt-2 italic">يرجى التواصل مع إدارة المعهد في حال وجود أي استفسار.</p>
                        </motion.div>
                    )}
                </div>
            </div>
            <SessionsModal
                viewingStudent={viewingStudent}
                onClose={() => setViewingStudent(null)}
                viewingSubject={viewingSubject}
                onSelectSubject={setViewingSubject}
                sessionsPage={sessionsPage}
                onPageChange={setSessionsPage}
                childSessions={childSessions}
                isSessionsLoading={isSessionsLoading}
                sessionsStartDate={sessionsStartDate}
                onStartDateChange={setSessionsStartDate}
                sessionsEndDate={sessionsEndDate}
                onEndDateChange={setSessionsEndDate}
            />
            <AttendanceModal
                viewingAttendanceStudent={viewingAttendanceStudent}
                onClose={() => setViewingAttendanceStudent(null)}
                childSessions={childSessions}
                isSessionsLoading={isSessionsLoading}
            />
        </motion.div>
    );
};

export default ParentStudents;
