import { useState, useRef } from 'react';
import { useStudents } from '../hooks/useStudents';
import { useTeachers } from '../../teachers/hooks/useTeachers';
import { useShowNotification } from '../../../context/AppContext';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { AlertCircle, Search, TrendingUp } from 'lucide-react';

// Shared Components
import { PageLoader } from '../../../components/ui/PageLoader';
// Feature Components
import { StudentHeader } from '../components/StudentHeader';
import { StudentStats } from '../components/StudentStats';
import { StudentToolbar } from '../components/StudentToolbar';
import { StudentForm } from '../components/StudentForm';
import { StudentTable } from '../components/StudentTable';
import { StudentDetails } from '../components/StudentDetails';
import { ConfirmModal } from '../../../shared/components/ConfirmModal';

// Utils
import { generateSessionDates } from '../utils/sessionUtils';

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
    const { students: allStudents, isLoading: loadingStudents, createStudent, updateStudent, deleteStudent, deleteAllStudents } = useStudents();

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

    // Calculate Stats
    const activeEnrollments = allStudents.reduce((acc, s) => acc + (s.enrollments?.length || 0), 0);
    const uniqueGrades = new Set(allStudents.map(s => s.grade)).size;
    const totalExpectedSessions = allStudents.reduce((acc, s) => 
        acc + (s.enrollments?.reduce((enAcc, en) => enAcc + (en.sessionsTotal || 0), 0) || 0), 0
    );
    const averageSessions = allStudents.length > 0 ? Math.round(totalExpectedSessions / allStudents.length) : 0;

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

    if (loading) {
        return <PageLoader />;
    }

    return (
        <div className="min-h-full pb-24 overflow-x-hidden relative bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-[#020617] dark:via-slate-950 dark:to-indigo-950/20" dir="rtl">
            <div className="absolute inset-0 opacity-\[0\.03\] dark:opacity-\[0\.05\] opacity-50 pointer-events-none" />
            <div className="relative z-10 max-w-[1600px] mx-auto px-2">

                {showAddForm && (
                    <div className="mb-6 bg-white/80 dark:bg-slate-900/80  border border-slate-200/50 dark:border-slate-800/50 rounded-none shadow-sm shadow-slate-200/50 dark:shadow-slate-950/50 p-5 md:p-6 animate-in slide-in-from-top-4 duration-300">
                        <StudentForm
                            initialData={editId ? allStudents.find(s => s.id === editId) : null}
                            teachers={teachers}
                            onSubmit={handleAddOrUpdateStudent}
                            onCancel={() => { setShowAddForm(false); setEditId(null); }}
                        />
                    </div>
                )}

                <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 dark:from-slate-950 dark:via-indigo-950 dark:to-slate-950 rounded-none shadow-sm shadow-indigo-500/15 border border-white/5 px-6 md:px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="absolute -top-20 -right-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none" />
                    <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
                    <div className="relative z-10 w-full">
                        <StudentHeader
                            onAdd={() => { setEditId(null); setShowAddForm(true); }}
                            onDeleteAll={() => setIsDeletingAll(true)}
                            onImport={() => fileInputRef.current?.click()}
                        />
                    </div>
                    <div className="relative z-10 flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:flex-none">
                            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="بحث..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full md:w-64 h-10 bg-white/10 border border-white/10 text-white placeholder:text-white/40 text-xs font-normal rounded-none px-9 focus:outline-none focus:border-indigo-500 transition-all"
                            />
                        </div>
                    </div>
                </div>

                {isDeletingAll && (
                    <div className="mb-6 bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200/50 dark:border-rose-800/50 rounded-none p-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <AlertCircle size={20} className="text-rose-500" />
                            <span className="text-sm font-normal text-rose-700 dark:text-rose-300">هل أنت متأكد من حذف جميع الطلاب؟</span>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={async () => { await deleteAllStudents(); setIsDeletingAll(false); }} className="h-9 px-4 bg-rose-600 text-white text-xs font-medium rounded-none hover:bg-rose-700 transition-all">تأكيد الحذف</button>
                            <button onClick={() => setIsDeletingAll(false)} className="h-9 px-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-white text-xs font-medium rounded-none border border-slate-200 dark:border-slate-700 transition-all">إلغاء</button>
                        </div>
                    </div>
                )}

                <div className="py-6 space-y-6">
                    <div className="bg-white/80 dark:bg-slate-900/80  border border-slate-200/50 dark:border-slate-800/50 rounded-none shadow-sm shadow-slate-200/50 dark:shadow-slate-950/50 p-5 md:p-6">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-none flex items-center justify-center shadow-sm shadow-emerald-500/20">
                                <TrendingUp size={16} />
                            </div>
                            <h2 className="text-sm font-medium text-slate-800 dark:text-white uppercase tracking-tight">إحصائيات الطلاب</h2>
                        </div>
                        <StudentStats
                            totalStudents={allStudents.length}
                            activeEnrollments={activeEnrollments}
                            uniqueGrades={uniqueGrades}
                            averageSessions={averageSessions}
                        />
                    </div>

                    <StudentToolbar
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        studentsCount={students.length}
                        totalCount={allStudents.length}
                    />


                </div>

                {!showDetails ? (
                    <div className="animate-in fade-in duration-300">
                        <StudentTable
                            students={students}
                            onEdit={handleEditStudent}
                            onDelete={(id) => setDeletingId(id)}
                            onSelect={(student) => { setSelectedStudent(student); setShowDetails(true); }}
                            selectedId={selectedStudent?.id}
                            teachers={teachers}
                        />
                    </div>
                ) : (
                    <div className="animate-in slide-in-from-right-8 duration-500">
                        {selectedStudent && (
                            <StudentDetails
                                student={selectedStudent}
                                teachers={teachers}
                                onClose={() => setShowDetails(false)}
                                onUpdateStudent={(updated) => {
                                    updateStudent(updated as Student);
                                }}
                                onAddEnrollment={handleAddEnrollment}
                            />
                        )}
                    </div>
                )}
            </div>

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

