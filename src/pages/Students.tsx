import { useState, useRef } from 'react';
import { useStudents } from '../features/students/hooks/useStudents';
import { useTeachers } from '../features/teachers/hooks/useTeachers';
import { useApp } from '../context/AppContext';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

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
import type { Student, Enrollment, ScheduleSlot } from '../features/students/types';

interface EnrollmentFormData {
    teacher: string;
    subject: string;
    curr: string;
    totalSessions: number;
    schedule: ScheduleSlot[];
}

export const Students = () => {
    const queryClient = useQueryClient();
    const { showNotification, currentUser, adminPhone } = useApp();
    const isTeacher = currentUser?.role === 'teacher';

    const [searchTerm, setSearchTerm] = useState('');
    const { students: allStudents, isLoading: loadingStudents, createStudent, createStudentAsync, updateStudent, deleteStudent, deleteAllStudents } = useStudents();

    // Instant Local Filtering
    const students = allStudents.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.parentPhone?.includes(searchTerm) ||
        student.studentPhone?.includes(searchTerm) ||
        student.grade.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const { teachers, isLoading: loadingTeachers } = useTeachers();


    const [showAddForm, setShowAddForm] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [showDetails, setShowDetails] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [isDeletingAll, setIsDeletingAll] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const handleAddEnrollment = async (enrollData: EnrollmentFormData) => {
        if (!selectedStudent) return;

        try {
            // 1. Generate sessions
            const sessionInfos = generateSessionDates(enrollData.schedule, enrollData.totalSessions);

            // 2. Create the sessions in DB
            const teacherObj = teachers.find(t => t.name === enrollData.teacher);

            // Create sessions sequentially to avoid SQLITE_BUSY errors
            for (const info of sessionInfos) {
                await api.post('/sessions', {
                    studentId: selectedStudent.id,
                    studentName: selectedStudent.name,
                    teacherId: teacherObj?.id,
                    teacherName: enrollData.teacher,
                    subject: enrollData.subject,
                    date: info.date.toISOString().split('T')[0],
                    day: info.slot.day,
                    time: `${info.slot.hour} ${info.slot.period === 'am' ? 'صباحاً' : 'مساءً'}`,
                    status: 'pending',
                    price: teacherObj?.price || 0
                });
            }

            // 3. Update student with new enrollment
            const newEnrollment: Enrollment = {
                teacher: enrollData.teacher,
                teacherId: teacherObj?.id,
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
            console.error('Error adding enrollment:', error);
            showNotification('فشل إضافة الاشتراك', 'error');
        }
    };

    const handleFreezeEnrollment = async (enrollmentId: string, isFrozen: boolean, reason?: string) => {
        if (!selectedStudent) return;
        try {
            await api.patch(`/students/${selectedStudent.id}/enrollments/${enrollmentId}/freeze`, {
                isFrozen,
                frozenReason: reason || null
            });
            queryClient.invalidateQueries({ queryKey: ['students'] });
            showNotification(isFrozen ? '✅ تم تجميد الاشتراك بنجاح' : '✅ تم تفعيل الاشتراك مجدداً', 'success');
        } catch (error) {
            showNotification('فشل تحديث حالة الاشتراك', 'error');
        }
    };

    const handleAddSessionsToEnrollment = async (index: number, amount: number) => {
        if (!selectedStudent) return;
        const enrollment = selectedStudent.enrollments[index];

        try {
            const sessionInfos = generateSessionDates(enrollment.schedule, amount);
            const teacherObj = teachers.find(t => t.name === enrollment.teacher);

            // Create sessions sequentially
            for (const info of sessionInfos) {
                await api.post('/sessions', {
                    studentId: selectedStudent.id,
                    studentName: selectedStudent.name,
                    teacherId: teacherObj?.id || enrollment.teacherId,
                    teacherName: enrollment.teacher,
                    subject: enrollment.subject,
                    date: info.date.toISOString().split('T')[0],
                    day: info.slot.day,
                    time: `${info.slot.hour} ${info.slot.period === 'am' ? 'صباحاً' : 'مساءً'}`,
                    status: 'pending',
                    price: teacherObj?.price || enrollment.price || 0
                });
            }

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
        } catch (error) {
            console.error('Error adding sessions:', error);
            showNotification('فشل إضافة الحصص', 'error');
        }
    };

    const handleExport = () => {
        try {
            const dataStr = JSON.stringify(students, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `students_export_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            showNotification('تم تصدير البيانات بنجاح', 'success');
        } catch (error) {
            showNotification('فشل تصدير البيانات', 'error');
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
                    parsedData = Array.isArray(json) ? json : (json.data || json.students || []);
                } else if (file.name.endsWith('.csv')) {
                    // Simple CSV parsing
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

                showNotification(`جاري استيراد ${parsedData.length} طالب...`, 'info');

                let success = 0;
                for (const item of parsedData) {
                    try {
                        // Map CSV/Generic fields to Student fields if necessary
                        const studentData = {
                            name: item.name || item.Name || item['الاسم'] || '',
                            grade: item.grade || item.Grade || item['الصف'] || '',
                            parentPhone: item.parentPhone || item.ParentPhone || item['رقم ولي الأمر'] || '',
                            studentPhone: item.studentPhone || item.StudentPhone || item['رقم الطالب'] || '',
                            curriculum: item.curriculum || item['المنهج'] || '',
                            notes: item.notes || item['ملاحظات'] || '',
                            sessionPrice: Number(item.sessionPrice || item['سعر الحصة'] || 0),
                            username: item.username || item['اسم المستخدم'] || '',
                            password: item.password || item['كلمة المرور'] || '',
                            enrollments: item.enrollments || []
                        };

                        if (studentData.name) {
                            await createStudentAsync(studentData as Omit<Student, 'id'>);
                            // Add small delay to prevent SQLite contention
                            await new Promise(resolve => setTimeout(resolve, 50));
                            success++;
                        }
                    } catch (err) {
                        console.error('Import error for item:', item, err);
                    }
                }

                showNotification(`تم استيراد ${success} طالب بنجاح`, 'success');
                queryClient.invalidateQueries({ queryKey: ['students'] });
            } catch (error) {
                console.error('Import process error:', error);
                showNotification('حدث خطأ أثناء قراءة الملف', 'error');
            }
        };

        if (file.name.endsWith('.json')) {
            reader.readAsText(file);
        } else if (file.name.endsWith('.csv')) {
            reader.readAsText(file, 'UTF-8');
        } else {
            showNotification('صيغة الملف غير مدعومة. يرجى استخدام JSON أو CSV', 'error');
        }

        // Reset input
        e.target.value = '';
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
        <div className="space-y-6 pb-32">
            <StudentHeader
                count={students.length}
                showAddForm={showAddForm}
                onToggleAddForm={() => { setShowAddForm(!showAddForm); setEditId(null); }}
            />

            <StudentToolbar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onExport={handleExport}
                onImport={() => fileInputRef.current?.click()}
                onDeleteAll={() => setIsDeletingAll(true)}
                filteredCount={students.length}
                totalCount={allStudents.length}
            />

            <input
                ref={fileInputRef}
                type="file"
                accept=".json,.csv"
                onChange={handleImportFile}
                className="hidden"
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
                        onFreezeEnrollment={handleFreezeEnrollment}
                        onSendReminder={(en) => sendWhatsAppReminder(selectedStudent, en, adminPhone)}
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
