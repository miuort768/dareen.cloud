import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUIStore } from '../../../store/uiStore';
import { useAuthStore } from '../../../store/authStore';
import { useTeachers } from '../hooks/useTeachers';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { cn } from '../../../lib/utils';
import { confirm } from '../../../lib/confirmDialog';

// Shared Components
import { ConfirmModal } from '../../../shared/components/ConfirmModal';
import { SecureAttendanceModal } from '../../../shared/components/SecureAttendanceModal';
import { SendNotificationModal } from '../../../shared/components/SendNotificationModal';
import { PageLoader } from '../../../components/ui/PageLoader';
import { SuccessModal } from '../../../shared/components/SuccessModal';

// Feature Components
import { Plus, X, Presentation } from 'lucide-react';
import { TeacherStats } from '../components/TeacherStats';
import { TeacherToolbar } from '../components/TeacherToolbar';
import { TeacherForm } from '../components/TeacherForm';
import { TeacherTable } from '../components/TeacherTable';
import { TeacherDetails } from '../components/TeacherDetails';

// Types
import type { Teacher, Session, Student, Enrollment } from '../../../types';

export const Teachers = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const showNotification = useUIStore(s => s.showNotification);
    const currentUser = useAuthStore(s => s.currentUser);
    const isTeacher = currentUser?.role === 'teacher';

    const {
        teachers,
        isLoading: loadingTeachers,
        createTeacherAsync,
        updateTeacherAsync,
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
    const [successModalData, setSuccessModalData] = useState<{ isOpen: boolean; title: string; message: string }>({ isOpen: false, title: '', message: '' });
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
    const handleAddTeacher = async (data: Omit<Teacher, 'id'>) => {
        try {
            if (editId) {
                await updateTeacherAsync({ ...data, id: editId } as Teacher);
                setSuccessModalData({
                    isOpen: true,
                    title: 'تحديث ناجح',
                    message: 'تم تحديث بيانات المعلمة بنجاح'
                });
            } else {
                await createTeacherAsync(data);
                setSuccessModalData({
                    isOpen: true,
                    title: 'عملية ناجحة',
                    message: 'تم إضافة المعلمة بنجاح'
                });
            }
            setShowAddForm(false);
            setEditId(null);
        } catch {
            // error is handled by the mutation hook via Toast
        }
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

    const handleConfirmLog = async (status: 'completed' | 'cancelled', topics?: string, homework?: string, needsCompensation?: boolean) => {
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
                teacherPrice: selectedTeacher.price,
                topics: topics || '',
                homework: homework || '',
                needsCompensation: needsCompensation || false
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
        } catch {
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
        } catch {
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
                let parsedData: Teacher[] = [];

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
            } catch {
                showNotification('فشل قراءة الملف', 'error');
            }
        };

        reader.readAsText(file);
        e.target.value = '';
    };

    const handleDeleteAll = async () => {
        if (!await confirm({ message: 'حذف جميع المعلمات؟ لا يمكن التراجع!', isDestructive: true })) return;
        try {
            await api.delete('/teachers');
            queryClient.invalidateQueries({ queryKey: ['teachers'] });
            showNotification(`تم الحذف بنجاح`, 'success');
        } catch {
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
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-[#F8F7FF] dark:bg-slate-950 min-h-screen pb-24"
            dir="rtl"
        >
            <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 pt-6 md:pt-10">
                {/* Header Section */}
                <div className="bg-gradient-to-br from-[#6C4BFF] to-[#8B5CF6] rounded-2xl px-5 md:px-8 py-4 md:py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 shadow-lg shadow-purple-500/20">
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shadow-sm bg-white/15 backdrop-blur-sm border border-white/10">
                            <Presentation size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-sm md:text-lg font-bold text-white leading-tight">إدارة المعلمات</h1>
                            <p className="text-[10px] font-bold text-white/70 mt-0.5">إدارة بيانات المعلمات ومتابعة الحصص</p>
                            <div className="hidden md:flex items-center gap-3 mt-2">
                                <span className="text-[9px] font-bold text-white/60">{teachers.length} معلمة</span>
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                                <span className="text-[8px] font-bold px-2 py-0.5 rounded-xl bg-white/15 backdrop-blur-sm text-white border border-white/10">نشطة</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 no-print">
                        <button
                            onClick={() => { setShowAddForm(!showAddForm); setEditId(null); }}
                            className={cn(
                                "h-9 md:h-11 px-2 md:px-6 flex items-center justify-center gap-1 md:gap-3 text-[10px] md:text-[11px] font-bold rounded-xl transition-all shadow-sm active:scale-95",
                                showAddForm
                                ? "bg-rose-500 text-white hover:bg-rose-600"
                                : "bg-white/15 backdrop-blur-sm text-white border border-white/20 hover:bg-white/25"
                            )}
                        >
                            {showAddForm ? <X size={16} /> : <Plus size={16} />}
                            <span className="hidden md:inline">{showAddForm ? 'إلغاء العملية' : 'إضافة معلمة جديدة'}</span>
                        </button>
                    </div>
                </div>

                <div className="py-6 space-y-6">
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
                        <div className="px-0">
                            <TeacherForm
                                onSubmit={handleAddTeacher}
                                initialData={editId ? teachers.find(t => t.id === editId) : null}
                                onCancel={() => { setShowAddForm(false); setEditId(null); }}
                                editId={editId}
                            />
                        </div>
                    )}

                    {!showDetails ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-0">
                            <TeacherTable
                                teachers={filteredTeachers}
                                onEdit={handleEditTeacher}
                                onDelete={setDeletingTeacherId}
                                onSelect={(teacher) => { setSelectedTeacher(teacher); setShowDetails(true); }}
                                onChat={(id) => navigate('/chat', { state: { startChatWith: id } })}
                                onNotify={(teacher) => setNotifyingTeacher(teacher)}
                                selectedId={selectedTeacher?.id}
                                studentCounts={studentCounts}
                            />
                        </motion.div>
                    ) : (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="px-0">
                            {selectedTeacher && (
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
                        </motion.div>
                    )}
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

                <SuccessModal
                    isOpen={successModalData.isOpen}
                    title={successModalData.title}
                    message={successModalData.message}
                    onClose={() => setSuccessModalData({ ...successModalData, isOpen: false })}
                />
            </div>
        </motion.div>
    );
};
export default Teachers;
