import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useTeachers } from '../features/teachers/hooks/useTeachers';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

// Shared Components
import { ConfirmModal } from '../shared/components/ConfirmModal';
import { SecureAttendanceModal } from '../shared/components/SecureAttendanceModal';
import { SendNotificationModal } from '../shared/components/SendNotificationModal';

// Feature Components
import { GraduationCap } from 'lucide-react';
import { TeacherStats } from '../features/teachers/components/TeacherStats';
import { TeacherToolbar } from '../features/teachers/components/TeacherToolbar';
import { TeacherForm } from '../features/teachers/components/TeacherForm';
import { TeacherTable } from '../features/teachers/components/TeacherTable';
import { TeacherDetails } from '../features/teachers/components/TeacherDetails';
import { PageLoader } from '../components/ui/PageLoader';
// Types
import type { Teacher, Session, Student, Enrollment } from '../types';

export const Teachers = () => {
    const navigate = useNavigate();
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
                teacherPrice: selectedTeacher.price
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
            showNotification('تم تصدير البيانات بنجاح', 'success');
        } catch (error) {
            showNotification('حدث خطأ أثناء التصدير', 'error');
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
                }

                if (parsedData.length === 0) {
                    showNotification('لم يتم العثور على بيانات صالحة', 'error');
                    return;
                }

                showNotification(`جاري استيراد المعلمات...`, 'info');

                for (const item of parsedData) {
                    try {
                        const teacherData = {
                            name: item.name || '',
                            subject: item.subject || '',
                            phone1: item.phone1 || '',
                            phone2: item.phone2 || '',
                            price: Number(item.price || 0)
                        };

                        if (teacherData.name) {
                            await createTeacherAsync(teacherData as Omit<Teacher, 'id'>);
                            await new Promise(resolve => setTimeout(resolve, 50));
                        }
                    } catch (err) {
                        console.error('Import error:', err);
                    }
                }

                showNotification(`اكتملت عملية الاستيراد`, 'success');
                queryClient.invalidateQueries({ queryKey: ['teachers'] });
            } catch (error) {
                showNotification('فشل قراءة الملف', 'error');
            }
        };

        reader.readAsText(file);
        e.target.value = '';
    };

    const handleDeleteAll = async () => {
        if (!window.confirm('⚠️ حذف جميع المعلمات؟ لا يمكن التراجع!')) return;
        try {
            await api.delete('/teachers');
            queryClient.invalidateQueries({ queryKey: ['teachers'] });
            showNotification(`تم الحذف بنجاح`, 'success');
        } catch (error) {
            showNotification('فشل الحذف', 'error');
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

    if (loading) return <PageLoader />;

    return (
        <div className="space-y-6 pb-32 min-h-full" dir="rtl">
            {/* Minimal High-Density Header */}
            <div className="bg-slate-900 text-white p-4 md:p-6 border-b border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[100px]"></div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/10 flex items-center justify-center border border-white/10 group-hover:rotate-6 transition-transform">
                            <GraduationCap size={28} className="text-indigo-400" />
                        </div>
                        <div>
                            <h1 className="text-xl md:text-2xl font-black tracking-tight leading-none mb-1 uppercase italic">إدارة الكوادر التعليمية</h1>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-70">تنظيم وهيكلة قاعدة بيانات المعلمات والطلاب</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 md:p-0 space-y-6">
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
                    accept=".json"
                    className="hidden"
                    onChange={handleImportFile}
                />

                {showAddForm && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                        <TeacherForm
                            onSubmit={handleAddTeacher}
                            initialData={editId ? teachers.find(t => t.id === editId) : null}
                            onCancel={() => { setShowAddForm(false); setEditId(null); }}
                        />
                    </div>
                )}

                <div className={`grid gap-6 ${showDetails ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'}`}>
                    <div className={showDetails ? 'lg:col-span-8' : ''}>
                        <TeacherTable
                            teachers={filteredTeachers}
                            onEdit={handleEditTeacher}
                            onDelete={setDeletingTeacherId}
                            onSelect={(teacher) => { setSelectedTeacher(teacher); setShowDetails(true); }}
                            onChat={(id) => navigate('/chat', { state: { startChatWith: id } })}
                            selectedId={selectedTeacher?.id}
                            studentCounts={studentCounts}
                        />
                    </div>

                    {showDetails && selectedTeacher && (
                        <div className="lg:col-span-4 animate-in slide-in-from-left-4 duration-500">
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
                        </div>
                    )}
                </div>
            </div>

            <ConfirmModal
                isOpen={!!deletingTeacherId}
                title="حذف معلمة"
                message="سيتم حذف كافة البيانات المتعلقة بهذه المعلمة. هل أنت متأكد؟"
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
