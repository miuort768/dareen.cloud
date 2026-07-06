import { useState, useRef, useMemo } from 'react';
import { useStudents } from '../hooks/useStudents';
import { useTeachers } from '../../teachers/hooks/useTeachers';
import { useShowNotification } from '../../../context/AppContext';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { Search, AlertCircle, Plus, TrendingUp, Upload, Trash2, BookOpen, GraduationCap, FileSpreadsheet, FileText } from 'lucide-react';

// Shared Components
import { PageLoader } from '../../../components/ui/PageLoader';
import { SendNotificationModal } from '../../../shared/components/SendNotificationModal';
// Feature Components
import { StudentStats } from '../components/StudentStats';
import { StudentForm } from '../components/StudentForm';
import { StudentTable } from '../components/StudentTable';
import { StudentDetails } from '../components/StudentDetails';
import { ConfirmModal } from '../../../shared/components/ConfirmModal';

// Utils
import { generateSessionDates } from '../utils/sessionUtils';
import { downloadExport } from '../../../lib/download';

// Types
import type { Student, Enrollment, ScheduleSlot } from '../types';

interface EnrollmentFormData {
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
    const { students: allStudents, isLoading: loadingStudents, createStudent, updateStudent, deleteStudent, deleteAllStudents } = useStudents();

    // Unique values for filters
    const uniqueGrades = useMemo(() =>
        [...new Set(allStudents.map(s => s.grade).filter(Boolean))].sort() as string[],
    [allStudents]);

    const uniqueCurriculums = useMemo(() =>
        [...new Set(allStudents.map(s => s.curriculum).filter(Boolean))].sort() as string[],
    [allStudents]);

    // Instant Local Filtering
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
    const fileInputRef = useRef<HTMLInputElement>(null);

    const loading = loadingStudents || loadingTeachers;

    // Calculate Stats
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
            const sessionInfos = generateSessionDates(enrollData.schedule, enrollData.totalSessions);
            const teacherObj = teachers.find(t => t.name === enrollData.teacher);

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
        } catch {
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
            <div className="relative z-10 mx-auto px-2 space-y-4">

                <div className="bg-primary shadow-sm px-4 md:px-7 py-4 md:py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl">
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center shadow-sm rounded-2xl bg-white/20 text-on-primary">
                            <TrendingUp size={20} />
                        </div>
                        <div>
                            <h1 className="text-sm md:text-lg font-bold text-on-primary leading-tight">إدارة الطلاب</h1>
                            <p className="text-micro md:text-micro font-bold text-white/70 mt-0.5">سجل الطلاب والمنتسبين — {allStudents.length} طالب نشط</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search size={13} className="absolute end-2.5 top-1/2 -translate-y-1/2 text-white/50" />
                            <input
                                type="text"
                                placeholder="بحث..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full md:w-52 border text-on-primary placeholder:text-white/50 text-micro md:text-micro font-bold px-7 py-1 outline-none transition-all rounded-2xl bg-white/15 border-white/20"
                            />
                        </div>
                        <button onClick={() => { setEditId(null); setShowAddForm(true); }} className="flex items-center gap-1 bg-card hover:bg-surface text-primary text-micro md:text-micro font-bold px-2 md:px-3 py-1 md:py-1.5 transition-all active:scale-[0.97] shadow-sm rounded-2xl"><Plus size={11} /> إضافة</button>
                    </div>
                </div>

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

                {/* Filter Bar */}
                <div className="flex flex-wrap items-center gap-3 p-3 md:p-4 bg-card border border-border shadow-sm rounded-2xl">
                    <div className="flex items-center gap-1.5">
                        <GraduationCap size={14} className="text-dim" />
                        <select
                            value={filterGrade}
                            onChange={e => setFilterGrade(e.target.value)}
                            className="border border-border bg-card dark:bg-hover text-main text-xs font-bold px-2 py-1.5 outline-none focus:border-primary rounded-2xl"
                        >
                            <option value="">المرحلة الدراسية (الكل)</option>
                            {uniqueGrades.map(g => (
                                <option key={g} value={g}>{g}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <BookOpen size={14} className="text-dim" />
                        <select
                            value={filterCurriculum}
                            onChange={e => setFilterCurriculum(e.target.value)}
                            className="border border-border bg-card dark:bg-hover text-main text-xs font-bold px-2 py-1.5 outline-none focus:border-primary rounded-2xl"
                        >
                            <option value="">المنهج (الكل)</option>
                            {uniqueCurriculums.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                </div>

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

                <div className="bg-card border border-border shadow-sm rounded-2xl">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-3">
                        <div className="flex items-center gap-2 text-micro font-bold text-dim">
                            <span>{students.length} / {allStudents.length} طالب</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="file"
                                ref={fileInputRef}
                                accept=".csv,.xlsx"
                                className="hidden"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    try {
                                        const text = await file.text();
                                        const lines = text.split('\n').filter(Boolean);
                                        for (let i = 1; i < lines.length; i++) {
                                            const cols = lines[i].split(',');
                                            if (cols.length >= 2) {
                                                await api.post('/students', {
                                                    name: cols[0].trim(),
                                                    grade: cols[1].trim(),
                                                    parentPhone: cols[2]?.trim() || '',
                                                });
                                            }
                                        }
                                        queryClient.invalidateQueries({ queryKey: ['students'] });
                                        showNotification('تم استيراد الطلاب بنجاح', 'success');
                                    } catch {
                                        showNotification('فشل استيراد الملف', 'error');
                                    }
                                    e.target.value = '';
                                }}
                            />
                            <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 bg-card dark:bg-hover hover:bg-surface text-muted text-micro font-bold px-2.5 py-1.5 border border-border transition-all shadow-sm active:scale-[0.97] rounded-2xl"><Upload size={12} /> استيراد</button>
                            <button onClick={() => downloadExport('students', 'xlsx').then(() => showNotification('تم تصدير Excel', 'success')).catch(e => showNotification(e.message, 'error'))} className="flex items-center gap-1.5 bg-success-soft text-success text-micro font-bold px-2.5 py-1.5 border border-success-soft transition-all shadow-sm active:scale-[0.97] rounded-2xl"><FileSpreadsheet size={12} /> Excel</button>
                            <button onClick={() => downloadExport('students', 'pdf').then(() => showNotification('تم تصدير PDF', 'success')).catch(e => showNotification(e.message, 'error'))} className="flex items-center gap-1.5 bg-error-soft text-error text-micro font-bold px-2.5 py-1.5 border border-error-soft transition-all shadow-sm active:scale-[0.97] rounded-2xl"><FileText size={12} /> PDF</button>
                            <button onClick={() => setIsDeletingAll(true)} className="flex items-center gap-1.5 bg-card dark:bg-hover border border-border hover:bg-error hover:border-error hover:text-on-error text-error text-micro font-bold px-2.5 py-1.5 transition-all shadow-sm active:scale-[0.97] rounded-2xl"><Trash2 size={12} /></button>
                        </div>
                    </div>
                </div>

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
                    <div className="animate-in slide-in-from-end-8 duration-500">
                        {selectedStudent && (
                            <StudentDetails
                                student={selectedStudent}
                                teachers={teachers}
                                onClose={() => setShowDetails(false)}
                                onAddEnrollment={handleAddEnrollment}
                                onAddSessions={handleAddSessions}
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
                        deleteStudent(deletingId);
                        setDeletingId(null);
                    }
                }}
                onClose={() => setDeletingId(null)}
            />
        </div>
    );
};

export default Students;


