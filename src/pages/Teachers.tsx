import { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useTeachers } from '../features/teachers/hooks/useTeachers';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

// Shared Components
import { ConfirmModal } from '../shared/components/ConfirmModal';
import { SecureAttendanceModal } from '../shared/components/SecureAttendanceModal';
import { SendNotificationModal } from '../shared/components/SendNotificationModal';

// Feature Components
import { PageHeader } from '../shared/components/ui/PageHeader';
import { GraduationCap } from 'lucide-react';
import { TeacherStats } from '../features/teachers/components/TeacherStats';
import { TeacherToolbar } from '../features/teachers/components/TeacherToolbar';
import { TeacherForm } from '../features/teachers/components/TeacherForm';
import { TeacherTable } from '../features/teachers/components/TeacherTable';
import { TeacherDetails } from '../features/teachers/components/TeacherDetails';

// Types
import type { Teacher, Session, Student, Enrollment } from '../types';

export const Teachers = () => {
    const queryClient = useQueryClient();
    const { showNotification, currentUser } = useApp();
    const isTeacher = currentUser?.role === 'teacher';

    const {
        teachers,
        isLoading: loadingTeachers,
        createTeacher,
        createTeacherAsync,
        updateTeacher,
        deleteTeacher
    } = useTeachers();

    // Fetch Other Data (Students, Sessions) 
    const { data: studentsData = [], isLoading: loadingStudents } = useQuery<Student[]>({
        queryKey: ['students'],
        queryFn: async () => {
            const data = await api.get<{ data: Student[] } | Student[]>('/students');
            return Array.isArray(data) ? data : (data.data || []);
        }
    });

    const students = Array.isArray(studentsData) ? studentsData : [];

    const { data: sessionsData = [], isLoading: loadingSessions } = useQuery<Session[]>({
        queryKey: ['sessions'],
        queryFn: async () => {
            const data = await api.get<Session[]>('/sessions');
            return Array.isArray(data) ? data : [];
        }
    });

    const sessions = Array.isArray(sessionsData) ? sessionsData : [];
    const loading = loadingTeachers || loadingStudents || loadingSessions;

    // UI state
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
    const [showDetails, setShowDetails] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [logDate] = useState(new Date().toISOString().split('T')[0]);
    const [secureModalData, setSecureModalData] = useState<{ student: Student, enrollment: Enrollment } | null>(null);
    const [deletingTeacherId, setDeletingTeacherId] = useState<string | null>(null);
    const [notifyingTeacher, setNotifyingTeacher] = useState<Teacher | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Stats calculations
    const uniqueSubjects = new Set(teachers.map(t => t.subject)).size;
    const averagePrice = teachers.length > 0 ? Math.round(teachers.reduce((sum, t) => sum + Number(t.price), 0) / teachers.length) : 0;
    const totalStudentsCount = new Set(students.flatMap(s =>
        (s.enrollments || []).map((e: Enrollment) => ({ student: s.id, teacher: e.teacher }))
    ).filter(e => teachers.some(t => t.name === e.teacher)).map(e => e.student)).size;

    const studentCounts = teachers.reduce((acc, t) => {
        acc[t.name] = students.filter(s => s.enrollments?.some((e: Enrollment) => e.teacher === t.name)).length;
        return acc;
    }, {} as Record<string, number>);

    const filteredTeachers = teachers.filter(t =>
        (t.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.subject || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.phone1 || '').includes(searchTerm)
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

        const now = new Date();
        const currentTime = now.toLocaleTimeString('ar-EG', {
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });

        try {
            await api.post('/sessions', {
                studentId: student.id,
                studentName: student.name,
                teacherName: selectedTeacher.name,
                subject: enrollment.subject,
                date: logDate,
                time: currentTime,
                status,
                // price: '', // Leave empty to let backend fetch student's default price
                teacherPrice: selectedTeacher.price // Explicitly set what the teacher should get
            });
            showNotification(`تم تسجيل ${status === 'completed' ? 'حضور' : 'غياب'} بنجاح`, 'success');
            queryClient.invalidateQueries({ queryKey: ['students'] });
            queryClient.invalidateQueries({ queryKey: ['sessions'] });
        } catch (error) {
            showNotification('فشل تسجيل الحضور', 'error');
        } finally {
            setSecureModalData(null);
        }
    };

    const handleSendTeacherNotification = async (message: string) => {
        if (!notifyingTeacher) return;
        try {
            await api.post('/notifications', {
                receiverId: notifyingTeacher.id,
                senderName: currentUser?.name || 'الإدارة',
                title: 'تنبيه من الإدارة',
                message,
                type: 'info',
                time: new Date().toISOString(),
                read: false
            });
            showNotification('تم إرسال التنبيه للمعلمة بنجاح', 'success');
        } catch (error) {
            showNotification('فشل إرسال التنبيه', 'error');
        } finally {
            setNotifyingTeacher(null);
        }
    };

    const handleExport = () => {
        try {
            const dataStr = JSON.stringify(teachers, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `teachers_export_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            showNotification('تم تصدير بيانات المعلمات بنجاح', 'success');
        } catch (error) {
            showNotification('حدث خطأ أثناء تصدير البيانات', 'error');
        }
    };

    const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const content = event.target?.result as string;
                let parsedData: any[] = [];

                if (file.name.endsWith('.json')) {
                    const json = JSON.parse(content);
                    parsedData = Array.isArray(json) ? json : (json.data || json.teachers || []);
                } else if (file.name.endsWith('.csv')) {
                    const lines = content.split('\n');
                    const headers = lines[0].split(',').map(h => h.trim());
                    parsedData = lines.slice(1).filter(l => l.trim()).map(line => {
                        const values = line.split(',').map(v => v.trim());
                        const obj: Record<string, string> = {};
                        headers.forEach((header, i) => {
                            obj[header] = values[i];
                        });
                        return obj;
                    });
                }

                if (parsedData.length === 0) {
                    showNotification('لم يتم العثور على بيانات صالحة للاستيراد', 'error');
                    return;
                }

                showNotification(`جاري استيراد ${parsedData.length} معلمة...`, 'info');

                let successCount = 0;
                let failCount = 0;

                for (const item of parsedData) {
                    try {
                        const teacherData = {
                            name: item.name || item.Name || item['الاسم'] || '',
                            subject: item.subject || item.Subject || item['المادة'] || item['التخصص'] || '',
                            phone1: item.phone1 || item.Phone1 || item['رقم الهاتف 1'] || item['رقم الهاتف'] || '',
                            phone2: item.phone2 || item.Phone2 || item['رقم الهاتف 2'] || '',
                            price: Number(item.price || item.Price || item['سعر الحصة'] || 0),
                            email: item.email || item['البريد الالكتروني'] || item['البريد'] || ''
                        };

                        if (teacherData.name) {
                            await createTeacherAsync(teacherData as Omit<Teacher, 'id'>);
                            // Add small delay to prevent SQLite contention
                            await new Promise(resolve => setTimeout(resolve, 50));
                            successCount++;
                        }
                    } catch (err) {
                        console.error('Import error for item:', item, err);
                        failCount++;
                    }
                }

                if (failCount === 0) {
                    showNotification(`تم استيراد ${successCount} معلمة بنجاح`, 'success');
                } else {
                    showNotification(`تم استيراد ${successCount} معلمة، وفشل ${failCount}`, 'warning');
                }

                queryClient.invalidateQueries({ queryKey: ['teachers'] });
            } catch (error) {
                console.error('Import process error:', error);
                showNotification('حدث خطأ أثناء قراءة الملف أو استيراد البيانات', 'error');
            }
        };

        if (file.name.endsWith('.json')) {
            reader.readAsText(file);
        } else if (file.name.endsWith('.csv')) {
            reader.readAsText(file, 'UTF-8');
        } else {
            showNotification('صيغة الملف غير مدعومة. يرجى استخدام JSON أو CSV', 'error');
        }

        e.target.value = '';
    };

    const handleDeleteAll = async () => {
        if (!window.confirm('⚠️ تحذير: هل أنت متأكد من حذف جميع المعلمات؟ هذا الإجراء لا يمكن التراجع عنه!')) {
            return;
        }

        if (!window.confirm('⚠️ تأكيد نهائي: سيتم حذف جميع بيانات المعلمات نهائياً. هل تريد المتابعة؟')) {
            return;
        }

        try {
            showNotification('جاري حذف جميع المعلمات...', 'info');

            // Delete all teachers one by one
            let successCount = 0;
            let failCount = 0;

            for (const teacher of teachers) {
                try {
                    await api.delete(`/teachers/${teacher.id}`);
                    successCount++;
                    // Small delay to prevent overwhelming the server
                    await new Promise(resolve => setTimeout(resolve, 50));
                } catch (err) {
                    console.error('Error deleting teacher:', teacher.id, err);
                    failCount++;
                }
            }

            queryClient.invalidateQueries({ queryKey: ['teachers'] });

            if (failCount === 0) {
                showNotification(`تم حذف ${successCount} معلمة بنجاح`, 'success');
            } else {
                showNotification(`تم حذف ${successCount} معلمة، وفشل حذف ${failCount}`, 'warning');
            }
        } catch (error) {
            console.error('Delete all error:', error);
            showNotification('حدث خطأ أثناء حذف المعلمات', 'error');
        }
    };

    const unenrollMutation = useMutation({
        mutationFn: async ({ student, teacherName }: { student: Student, teacherName: string }) => {
            const updatedEnrollments = student.enrollments.filter((en: Enrollment) => en.teacher !== teacherName);
            await api.put(`/students/${student.id}`, { ...student, enrollments: updatedEnrollments });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
            showNotification('تم إزالة الطالب بنجاح', 'success');
        }
    });

    if (loading) {
        return (
            <div className="space-y-6 pb-32">
                <PageHeader
                    title="إدارة المعلمات"
                    subtitle="تنظيم وإدارة بيانات الكادر التعليمي"
                    icon={GraduationCap}
                    stats={[
                        { label: 'إجمالي المعلمات', value: 0 }
                    ]}
                    color="indigo"
                />
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-500 dark:text-gray-400 font-bold">جاري تحميل بيانات المعلمات...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-32">
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
                onImport={() => fileInputRef.current?.click()}
                onExport={handleExport}
                onDeleteAll={handleDeleteAll}
            />

            <input
                ref={fileInputRef}
                type="file"
                accept=".json,.csv"
                className="hidden"
                onChange={handleImportFile}
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
                            await api.delete(`/sessions/${id}`);
                            queryClient.invalidateQueries({ queryKey: ['sessions'] });
                        }}
                        onSendNotification={(t) => setNotifyingTeacher(t)}
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

            <SendNotificationModal
                isOpen={!!notifyingTeacher}
                onClose={() => setNotifyingTeacher(null)}
                onSend={handleSendTeacherNotification}
                recipientName={notifyingTeacher?.name || ''}
            />
        </div>
    );
};
