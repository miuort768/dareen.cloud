import { useState } from 'react';
import { useStudents } from '../features/students/hooks/useStudents';
import { useTeachers } from '../features/teachers/hooks/useTeachers';
import { useApp } from '../context/AppContext';
import { useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '../config/api';

// Shared Components
import { Skeleton } from '../shared/components/Skeleton';
import { ConfirmModal } from '../shared/components/ConfirmModal';

// Feature Components
import { StudentHeader } from '../features/students/components/StudentHeader';
import { StudentToolbar } from '../features/students/components/StudentToolbar';
import { StudentForm } from '../features/students/components/StudentForm';
import { StudentTable } from '../features/students/components/StudentTable';
import { StudentDetails } from '../features/students/components/StudentDetails';

// Utils
import { generateSessionDates } from '../features/students/utils/sessionUtils';
import { sendWhatsAppReminder } from '../shared/utils/reminders';

// Types
import type { Student, Enrollment } from '../features/students/types';

export const Students = () => {
    const queryClient = useQueryClient();
    const { showNotification, currentUser } = useApp();
    const isTeacher = currentUser?.role === 'teacher';

    const [searchTerm, setSearchTerm] = useState('');
    const { students, isLoading: loadingStudents, createStudent, updateStudent, deleteStudent, deleteAllStudents } = useStudents(searchTerm);
    const { teachers, isLoading: loadingTeachers } = useTeachers();


    const [showAddForm, setShowAddForm] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [showDetails, setShowDetails] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [isDeletingAll, setIsDeletingAll] = useState(false);

    const loading = loadingStudents || loadingTeachers;

    // Handlers
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

    const handleAddEnrollment = async (enrollData: any) => {
        if (!selectedStudent) return;

        try {
            // 1. Generate sessions
            const sessionDates = generateSessionDates(enrollData.schedule, enrollData.totalSessions);

            // 2. Create the sessions in DB
            const teacher = teachers.find(t => t.name === enrollData.teacher);
            const sessionPromises = sessionDates.map(date =>
                fetch(`${API_BASE_URL}/sessions`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        studentId: selectedStudent.id,
                        studentName: selectedStudent.name,
                        teacherName: enrollData.teacher,
                        subject: enrollData.subject,
                        date: date.toISOString().split('T')[0],
                        time: '12:00 م', // Default
                        status: 'pending',
                        price: teacher?.price || 0
                    })
                })
            );
            await Promise.all(sessionPromises);

            // 3. Update student with new enrollment
            const newEnrollment: Enrollment = {
                teacher: enrollData.teacher,
                subject: enrollData.subject,
                curr: enrollData.curr,
                sessionsTotal: enrollData.totalSessions,
                sessionsUsed: 0,
                schedule: enrollData.schedule
            };

            const updatedStudent = {
                ...selectedStudent,
                enrollments: [...(selectedStudent.enrollments || []), newEnrollment]
            };

            updateStudent(updatedStudent);
            setSelectedStudent(updatedStudent);
            queryClient.invalidateQueries({ queryKey: ['students'] });
            showNotification('تم إضافة الاشتراك والجلسات بنجاح', 'success');
        } catch (error) {
            showNotification('فشل إضافة الاشتراك', 'error');
        }
    };

    const handleAddSessionsToEnrollment = async (index: number, amount: number) => {
        if (!selectedStudent) return;
        const enrollment = selectedStudent.enrollments[index];

        try {
            const sessionDates = generateSessionDates(enrollment.schedule, amount);
            const teacher = teachers.find(t => t.name === enrollment.teacher);

            const sessionPromises = sessionDates.map(date =>
                fetch(`${API_BASE_URL}/sessions`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        studentId: selectedStudent.id,
                        studentName: selectedStudent.name,
                        teacherName: enrollment.teacher,
                        subject: enrollment.subject,
                        date: date.toISOString().split('T')[0],
                        time: '12:00 م',
                        status: 'pending',
                        price: teacher?.price || 0
                    })
                })
            );
            await Promise.all(sessionPromises);

            const updatedEnrollments = [...selectedStudent.enrollments];
            updatedEnrollments[index] = {
                ...enrollment,
                sessionsTotal: enrollment.sessionsTotal + amount
            };

            const updatedStudent = { ...selectedStudent, enrollments: updatedEnrollments };
            updateStudent(updatedStudent);
            setSelectedStudent(updatedStudent);
            queryClient.invalidateQueries({ queryKey: ['students'] });
            showNotification(`تم إضافة ${amount} حصص بنجاح`, 'success');
        } catch {
            showNotification('فشل إضافة الحصص', 'error');
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-48 rounded-none" />
                <Skeleton className="h-16 rounded-none" />
                <div className="grid grid-cols-1 gap-4">
                    {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 rounded-none" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20">
            <StudentHeader
                count={students.length}
                showAddForm={showAddForm}
                onToggleAddForm={() => { setShowAddForm(!showAddForm); setEditId(null); }}
            />

            <StudentToolbar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onPrint={() => window.print()}
                onExport={() => showNotification('جاري التصدير...', 'info')}
                onImport={() => showNotification('جاري الاستيراد...', 'info')}
                onDeleteAll={() => setIsDeletingAll(true)}
            />

            {showAddForm && (
                <StudentForm
                    onSubmit={handleAddOrUpdateStudent}
                    initialData={editId ? students.find(s => s.id === editId) : null}
                />
            )}

            <div className={`grid gap-6 ${showDetails ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}>
                <div className={showDetails ? 'lg:col-span-2' : ''}>
                    <StudentTable
                        students={students}
                        selectedId={selectedStudent?.id}
                        onSelect={(s) => { setSelectedStudent(s); setShowDetails(true); }}
                        onEdit={handleEditStudent}
                        onDelete={setDeletingId}
                        showDetails={showDetails}
                        isTeacherView={isTeacher}
                    />
                </div>

                {showDetails && selectedStudent && (
                    <StudentDetails
                        student={selectedStudent}
                        onClose={() => setShowDetails(false)}
                        teachers={teachers}
                        onAddEnrollment={handleAddEnrollment}
                        onDeleteEnrollment={(i) => {
                            const updated = { ...selectedStudent, enrollments: selectedStudent.enrollments.filter((_, idx) => idx !== i) };
                            updateStudent(updated);
                            setSelectedStudent(updated);
                        }}
                        onRenewEnrollment={(i) => handleAddSessionsToEnrollment(i, selectedStudent.enrollments[i].sessionsTotal)}
                        onAddSessions={handleAddSessionsToEnrollment}
                        onSendReminder={(en) => sendWhatsAppReminder(selectedStudent, en)}
                    />
                )}
            </div>

            <ConfirmModal
                isOpen={!!deletingId}
                title="حذف طالب"
                message="هل أنت متأكد من حذف هذا الطالب؟ لا يمكن التراجع عن هذا الإجراء."
                onConfirm={() => { if (deletingId) deleteStudent(deletingId); setDeletingId(null); }}
                onClose={() => setDeletingId(null)}
            />

            <ConfirmModal
                isOpen={isDeletingAll}
                title="حذف جميع الطلاب"
                message="هل أنت متأكد من حذف جميع بيانات الطلاب؟ هذا الإجراء خطير جداً."
                onConfirm={() => { deleteAllStudents(); setIsDeletingAll(false); }}
                onClose={() => setIsDeletingAll(false)}
            />
        </div>
    );
};
