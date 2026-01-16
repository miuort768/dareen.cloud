import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useTeachers } from '../features/teachers/hooks/useTeachers';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '../config/api';

// Shared Components
import { Skeleton } from '../shared/components/Skeleton';
import { ConfirmModal } from '../shared/components/ConfirmModal';
import { SecureAttendanceModal } from '../shared/components/SecureAttendanceModal';

// Feature Components
import { PageHeader } from '../shared/components/ui/PageHeader';
import { GraduationCap } from 'lucide-react';
import { TeacherStats } from '../features/teachers/components/TeacherStats';
import { TeacherToolbar } from '../features/teachers/components/TeacherToolbar';
import { TeacherForm } from '../features/teachers/components/TeacherForm';
import { TeacherTable } from '../features/teachers/components/TeacherTable';
import { TeacherDetails } from '../features/teachers/components/TeacherDetails';

// Types
import type { Teacher, Session } from '../features/teachers/types';

export const Teachers = () => {
    const queryClient = useQueryClient();
    const { showNotification, currentUser } = useApp();
    const isTeacher = currentUser?.role === 'teacher';

    const { teachers, isLoading: loadingTeachers, createTeacher, updateTeacher, deleteTeacher } = useTeachers();

    // Fetch Other Data (Students, Sessions) 
    // TODO: Move these to their own features later
    const { data: students = [], isLoading: loadingStudents } = useQuery<any[]>({
        queryKey: ['students'],
        queryFn: async () => {
            const res = await fetch(`${API_BASE_URL}/students`);
            return res.json();
        }
    });

    const { data: sessions = [], isLoading: loadingSessions } = useQuery<Session[]>({
        queryKey: ['sessions'],
        queryFn: async () => {
            const res = await fetch(`${API_BASE_URL}/sessions`);
            return res.json();
        }
    });

    const loading = loadingTeachers || loadingStudents || loadingSessions;

    // UI state
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
    const [showDetails, setShowDetails] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [logDate] = useState(new Date().toISOString().split('T')[0]);
    const [secureModalData, setSecureModalData] = useState<{ student: any, enrollment: any } | null>(null);
    const [deletingTeacherId, setDeletingTeacherId] = useState<string | null>(null);

    // Stats calculations
    const uniqueSubjects = new Set(teachers.map(t => t.subject)).size;
    const averagePrice = teachers.length > 0 ? Math.round(teachers.reduce((sum, t) => sum + t.price, 0) / teachers.length) : 0;
    const totalStudentsCount = new Set(students.flatMap(s =>
        s.enrollments?.map((e: any) => ({ student: s.id, teacher: e.teacher })) || []
    ).filter(e => teachers.some(t => t.name === e.teacher)).map(e => e.student)).size;

    const studentCounts = teachers.reduce((acc, t) => {
        acc[t.name] = students.filter(s => s.enrollments?.some((e: any) => e.teacher === t.name)).length;
        return acc;
    }, {} as Record<string, number>);

    const filteredTeachers = teachers.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.phone1.includes(searchTerm)
    );

    // Handlers
    const handleAddTeacher = (data: Omit<Teacher, 'id'>) => {
        if (editId) {
            updateTeacher({ ...data, id: editId } as Teacher);
        } else {
            createTeacher(data);
        }
        setShowAddForm(false);
        setEditId(null);
    };

    const handleEditTeacher = (teacher: Teacher) => {
        setEditId(teacher.id);
        setShowAddForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteTeacher = () => {
        if (deletingTeacherId) {
            deleteTeacher(deletingTeacherId);
            setDeletingTeacherId(null);
        }
    };

    const handleConfirmLog = async (status: 'completed' | 'cancelled') => {
        if (!secureModalData || !selectedTeacher || !logDate) return;
        const { student, enrollment } = secureModalData;
        try {
            await fetch(`${API_BASE_URL}/sessions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentId: student.id,
                    studentName: student.name,
                    teacherName: selectedTeacher.name,
                    subject: enrollment.subject,
                    date: logDate,
                    time: '12:00 م',
                    status,
                    price: selectedTeacher.price
                })
            });
            showNotification(`تم تسجيل ${status === 'completed' ? 'حضور' : 'غياب'} بنجاح`, 'success');
            queryClient.invalidateQueries({ queryKey: ['students'] });
            queryClient.invalidateQueries({ queryKey: ['sessions'] });
        } catch {
            showNotification('فشل تسجيل الحضور', 'error');
        } finally {
            setSecureModalData(null);
        }
    };

    const unenrollMutation = useMutation({
        mutationFn: async ({ student, teacherName }: { student: any, teacherName: string }) => {
            const updatedEnrollments = student.enrollments.filter((en: any) => en.teacher !== teacherName);
            await fetch(`${API_BASE_URL}/students/${student.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...student, enrollments: updatedEnrollments })
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
            showNotification('تم إزالة الطالب بنجاح', 'success');
        }
    });

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-48 rounded-none" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="إدارة المعلمات"
                subtitle="تنظيم وإدارة بيانات الكادر التعليمي"
                icon={GraduationCap}
                stats={[
                    { label: 'إجمالي المعلمات', value: teachers.length }
                ]}
                color="indigo"
            />

            <TeacherStats
                totalTeachers={teachers.length}
                totalStudents={totalStudentsCount}
                uniqueSubjects={uniqueSubjects}
                averagePrice={averagePrice}
            />

            <TeacherToolbar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                showAddForm={showAddForm}
                onToggleAddForm={() => {
                    setShowAddForm(!showAddForm);
                    if (showAddForm) setEditId(null);
                }}
            />

            {showAddForm && (
                <TeacherForm
                    onSubmit={handleAddTeacher}
                    initialData={editId ? teachers.find(t => t.id === editId) : null}
                    onCancel={() => { setShowAddForm(false); setEditId(null); }}
                />
            )}

            <div className={`grid gap-6 ${showDetails ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}>
                <div className={showDetails ? 'lg:col-span-2' : ''}>
                    <TeacherTable
                        teachers={filteredTeachers}
                        onEdit={handleEditTeacher}
                        onDelete={setDeletingTeacherId}
                        onSelect={(teacher) => { setSelectedTeacher(teacher); setShowDetails(true); }}
                        selectedId={selectedTeacher?.id}
                        studentCounts={studentCounts}
                    />
                </div>

                {showDetails && selectedTeacher && (
                    <TeacherDetails
                        teacher={selectedTeacher}
                        onClose={() => setShowDetails(false)}
                        students={students}
                        sessions={sessions}
                        onLogAttendance={(s, e) => setSecureModalData({ student: s, enrollment: e })}
                        onUnenroll={(s, t) => unenrollMutation.mutate({ student: s, teacherName: t })}
                        onDeleteSession={async (id) => {
                            await fetch(`${API_BASE_URL}/sessions/${id}`, { method: 'DELETE' });
                            queryClient.invalidateQueries({ queryKey: ['sessions'] });
                        }}
                        onSendNotification={(t) => showNotification(`إرسال تنبيه لـ ${t.name}`, 'info')}
                        isTeacherView={isTeacher}
                    />
                )}
            </div>

            <ConfirmModal
                isOpen={!!deletingTeacherId}
                title="حذف معلمة"
                message="هل أنت متأكد من حذف هذه المعلمة؟ لا يمكن التراجع عن هذا الإجراء."
                onConfirm={handleDeleteTeacher}
                onClose={() => setDeletingTeacherId(null)}
            />

            <SecureAttendanceModal
                isOpen={!!secureModalData}
                onClose={() => setSecureModalData(null)}
                onConfirm={handleConfirmLog}
                studentName={secureModalData?.student?.name || ''}
                date={logDate}
            />
        </div>
    );
};
