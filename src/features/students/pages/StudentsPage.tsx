import { useState, useMemo } from 'react';
import { useStudents } from '../hooks/useStudents';
import { useTeachers } from '../../teachers/hooks/useTeachers';
import { useShowNotification } from '../../../context/AppContext';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { AlertCircle, TrendingUp } from 'lucide-react';

// Shared Components
import { PageLoader } from '../../../components/ui/PageLoader';
import { SendNotificationModal } from '../../../shared/components/SendNotificationModal';
import { ConfirmModal } from '../../../shared/components/ConfirmModal';
// Feature Components
import { StudentStats } from '../components/StudentStats';
import { StudentForm } from '../components/StudentForm';
import { StudentTable } from '../components/StudentTable';
import { StudentDetails } from '../components/StudentDetails';
import { StudentsPageHeader } from '../components/StudentsPageHeader';
import { StudentsFilters } from '../components/StudentsFilters';
import { StudentsToolbar } from '../components/StudentsToolbar';

// Utils
import { generateSessionDates } from '../utils/sessionUtils';

// Types
import type { Student, ScheduleSlot } from '../types';

interface EnrollmentFormData {
    teacherId?: string;
    teacher: string;
    subject: string;
    curr: string;
    totalSessions: number;
    schedule: ScheduleSlot[];
}

export const Students = () => {
    const queryClient = useQueryClient();
    const showNotification = useShowNotification();

    const [searchTerm, setSearchTerm] = useState('');
    const [filterGrade, setFilterGrade] = useState('');
    const [filterCurriculum, setFilterCurriculum] = useState('');
    const [notifyingStudent, setNotifyingStudent] = useState<Student | null>(null);
    const { students: allStudents, isLoading: loadingStudents, createStudent, updateStudent, deleteAllStudents } = useStudents();

    const uniqueGrades = useMemo(() =>
        [...new Set(allStudents.map(s => s.grade).filter(Boolean))].sort() as string[],
    [allStudents]);

    const uniqueCurriculums = useMemo(() =>
        [...new Set(allStudents.map(s => s.curriculum).filter(Boolean))].sort() as string[],
    [allStudents]);

    const students = useMemo(() =>
        allStudents.filter(student => {
            const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.parentPhone?.includes(searchTerm) ||
                student.studentPhone?.includes(searchTerm) ||
                student.grade.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesGrade = !filterGrade || student.grade === filterGrade;
            const matchesCurriculum = !filterCurriculum || student.curriculum === filterCurriculum;
            return matchesSearch && matchesGrade && matchesCurriculum;
        }),
    [allStudents, searchTerm, filterGrade, filterCurriculum]);

    const { teachers, isLoading: loadingTeachers } = useTeachers();

    const [showAddForm, setShowAddForm] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [showDetails, setShowDetails] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [isDeletingAll, setIsDeletingAll] = useState(false);
    const [isAddingEnrollment, setIsAddingEnrollment] = useState(false);

    const loading = loadingStudents || loadingTeachers;

    const activeEnrollments = useMemo(() =>
        allStudents.reduce((acc, s) => acc + (s.enrollments?.length || 0), 0),
    [allStudents]);
    const totalExpectedSessions = useMemo(() =>
        allStudents.reduce((acc, s) =>
            acc + (s.enrollments?.reduce((enAcc, en) => enAcc + (en.sessionsTotal || 0), 0) || 0), 0
        ),
    [allStudents]);
    const averageSessions = useMemo(() =>
        allStudents.length > 0 ? Math.round(totalExpectedSessions / allStudents.length) : 0,
    [allStudents.length, totalExpectedSessions]);

    const handleAddOrUpdateStudent = (data: Omit<Student, 'id' | 'enrollments'>) => {
        if (editId) {
            const existing = students.find(s => s.id === editId);
            if (existing) {
                updateStudent({ ...existing, ...data } as Student);
            }
        } else {
            createStudent({ ...data, enrollments: [] } as Omit<Student, 'id'>);
        }
        setShowAddForm(false);
        setEditId(null);
    };

    const handleEditStudent = (student: Student) => {
        setEditId(student.id);
        setShowAddForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleAddEnrollment = async (enrollData: EnrollmentFormData) => {
        if (!selectedStudent) return;
        setIsAddingEnrollment(true);

        try {
            const created = await api.post('/enrollments', {
                studentId: selectedStudent.id,
                teacherId: enrollData.teacherId || null,
                teacher: enrollData.teacher,
                subject: enrollData.subject,
                curr: enrollData.curr,
                sessionsTotal: enrollData.totalSessions,
                schedule: enrollData.schedule,
                sessions: generateSessionDates(enrollData.schedule, enrollData.totalSessions).map(info => ({
                    date: info.date.toISOString().split('T')[0],
                    day: info.slot.day,
                    time: `${info.slot.hour} ${info.slot.period === 'am' ? 'صباحاً' : 'مساءً'}`,
                }))
            });

            queryClient.invalidateQueries({ queryKey: ['students'] });
            const updatedStudent = {
                ...selectedStudent,
                enrollments: [...(selectedStudent.enrollments || []), created]
            };
            setSelectedStudent(updatedStudent);
            showNotification('تم إضافة الاشتراك والجلسات بنجاح', 'success');
        } catch (error) {
            console.error('Error adding enrollment:', error);
            showNotification(error?.message || 'فشل إضافة الاشتراك', 'error');
        } finally {
            setIsAddingEnrollment(false);
        }
    };

    const handleAddSessions = async (index: number, amount: number) => {
        if (!selectedStudent) return;
        const enrollment = selectedStudent.enrollments?.[index];
        if (!enrollment) return;

        const updatedEnrollments = [...(selectedStudent.enrollments || [])];
        updatedEnrollments[index] = { ...enrollment, sessionsTotal: enrollment.sessionsTotal + amount };

        const updatedStudent = { ...selectedStudent, enrollments: updatedEnrollments };
        updateStudent(updatedStudent);
        setSelectedStudent(updatedStudent);
        queryClient.invalidateQueries({ queryKey: ['students'] });
        showNotification(`تمت إضافة ${amount} حصة بنجاح`, 'success');
    };

    const handleSendStudentNotification = async (message: string) => {
        if (!notifyingStudent) return;
        try {
            await api.post('/notifications', {
                receiverId: notifyingStudent.id,
                senderName: 'الإدارة',
                title: 'تنبيه من الإدارة',
                message,
                type: 'info',
                time: new Date().toISOString(),
                read: false
            });
            showNotification('تم إرسال التنبيه للطالب بنجاح', 'success');
        } catch (e) {
            console.error(e);
            showNotification('فشل إرسال التنبيه', 'error');
        } finally {
            setNotifyingStudent(null);
        }
    };

    if (loading) {
        return <PageLoader />;
    }

    return (
        <div className="min-h-full pb-24 overflow-x-hidden relative bg-surface dark:bg-background" dir="rtl">
            <div className="relative z-10 max-w-page mx-auto px-2 space-y-4">

                <StudentsPageHeader searchTerm={searchTerm} onSearchChange={setSearchTerm} totalStudents={allStudents.length} onAdd={() => { setEditId(null); setShowAddForm(true); }} />

                {showAddForm && (
                    <div className="bg-card border border-border shadow-sm p-4 md:p-6 rounded-2xl">
                        <StudentForm
                            initialData={editId ? allStudents.find(s => s.id === editId) : null}
                            teachers={teachers}
                            onSubmit={handleAddOrUpdateStudent}
                            onCancel={() => { setShowAddForm(false); setEditId(null); }}
                        />
                    </div>
                )}

                {isDeletingAll && (
                    <div className="border border-error-soft bg-error-soft p-4 flex items-center justify-between rounded-2xl">
                        <div className="flex items-center gap-3">
                            <AlertCircle size={18} className="text-error" />
                            <span className="text-xs font-bold text-error">هل أنت متأكد من حذف جميع الطلاب؟</span>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={async () => { await deleteAllStudents(); setIsDeletingAll(false); }} className="h-8 px-4 bg-error text-on-error text-micro font-bold hover:bg-error-hover transition-all rounded-2xl">تأكيد الحذف</button>
                            <button onClick={() => setIsDeletingAll(false)} className="h-8 px-4 bg-card dark:bg-hover text-main text-micro font-bold border border-border transition-all rounded-2xl">إلغاء</button>
                        </div>
                    </div>
                )}

                <StudentsFilters filterGrade={filterGrade} uniqueGrades={uniqueGrades} onGradeChange={setFilterGrade} filterCurriculum={filterCurriculum} uniqueCurriculums={uniqueCurriculums} onCurriculumChange={setFilterCurriculum} />

                <div className="p-5 md:p-6 bg-card border border-border shadow-sm rounded-2xl">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-8 h-8 flex items-center justify-center shadow-sm bg-success-soft text-success">
                            <TrendingUp size={16} />
                        </div>
                        <h2 className="text-sm font-bold text-main">إحصائيات الطلاب</h2>
                    </div>
                    <StudentStats
                        totalStudents={allStudents.length}
                        activeEnrollments={activeEnrollments}
                        uniqueGrades={uniqueGrades.length}
                        averageSessionsPerStudent={averageSessions}
                    />
                </div>

                <StudentsToolbar filteredCount={students.length} totalCount={allStudents.length} onDeleteAll={() => setIsDeletingAll(true)} />

                {!showDetails ? (
                    <div className="animate-in fade-in duration-300">
                        <StudentTable
                            students={students}
                            onEdit={handleEditStudent}
                            onDelete={(id) => setDeletingId(id)}
                            onSelect={(student) => { setSelectedStudent(student); setShowDetails(true); }}
                            onNotify={(student) => setNotifyingStudent(student)}
                            selectedId={selectedStudent?.id}
                            teachers={teachers}
                        />
                    </div>
                ) : (
                    <div className="animate-in slide-in-from-start-8 duration-500">
                        {selectedStudent && (
                            <StudentDetails
                                student={selectedStudent}
                                teachers={teachers}
                                onClose={() => setShowDetails(false)}
                                onAddEnrollment={handleAddEnrollment}
                                onAddSessions={handleAddSessions}
                                isAddingEnrollment={isAddingEnrollment}
                            />
                        )}
                    </div>
                )}
            </div>

            <SendNotificationModal
                isOpen={!!notifyingStudent}
                title="إرسال إشعار للطالب"
                recipientName={notifyingStudent?.name || ''}
                onSend={handleSendStudentNotification}
                onClose={() => setNotifyingStudent(null)}
            />

            <ConfirmModal
                isOpen={!!deletingId}
                title="حذف طالب"
                message="سيتم حذف كافة بيانات الطالب. هل أنت متأكد؟"
                onConfirm={async () => {
                    if (deletingId) {
                        try {
                            await api.delete(`/students/${deletingId}`);
                            queryClient.invalidateQueries({ queryKey: ['students'] });
                            showNotification('تم حذف الطالب بنجاح', 'success');
                        } catch (e) {
                            console.error(e);
                            showNotification('فشل حذف الطالب', 'error');
                        }
                        setDeletingId(null);
                    }
                }}
                onClose={() => setDeletingId(null)}
            />
        </div>
    );
};

export default Students;
